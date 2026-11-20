using Oats.Core;
using Oats.Core.Audio;
using Oats.Core.Backends;
using SherpaOnnx;
using Whisper.net;

namespace Oats.OnDevice;

/// <summary>
/// Splits a track into speech regions with Silero VAD. Both engines transcribe region by region, which keeps silence
/// (long stretches of a loopback track) away from the recognizer: Whisper hallucinates on silence, and Parakeet's
/// encoder has a bounded input length.
/// </summary>
public static class VadSegmenter
{
    public sealed record Region(double Start, float[] Samples);

    public static List<Region> Split(float[] samples, string vadModel, float maxSpeechSeconds = 20)
    {
        var config = new VadModelConfig();
        config.SileroVad.Model = vadModel;
        config.SileroVad.Threshold = 0.5f;
        config.SileroVad.MinSilenceDuration = 0.4f;
        config.SileroVad.MinSpeechDuration = 0.25f;
        config.SileroVad.MaxSpeechDuration = maxSpeechSeconds;
        config.SileroVad.WindowSize = 512;
        config.SampleRate = TrackWriter.Rate;
        config.NumThreads = 1;
        config.Provider = "cpu";

        using var vad = new VoiceActivityDetector(config, 60);
        var regions = new List<Region>();
        void Drain()
        {
            while (!vad.IsEmpty())
            {
                var segment = vad.Front();
                regions.Add(new Region((double)segment.Start / TrackWriter.Rate, segment.Samples));
                vad.Pop();
            }
        }
        const int window = 512;
        var chunk = new float[window];
        for (int i = 0; i + window <= samples.Length; i += window)
        {
            Array.Copy(samples, i, chunk, 0, window);
            vad.AcceptWaveform(chunk);
            Drain();
        }
        vad.Flush();
        Drain();
        return regions;
    }
}

/// <summary>NVIDIA Parakeet TDT 0.6B v3 (int8) through sherpa-onnx: fast on a laptop CPU, 25 European languages, auto-detected.</summary>
public sealed class ParakeetTranscription(ModelStore models) : ITranscriptionBackend
{
    /// <summary>Languages Parakeet v3 was trained on.</summary>
    public static readonly HashSet<string> Languages =
        ["bg", "hr", "cs", "da", "nl", "en", "et", "fi", "fr", "de", "el", "hu", "it", "lv", "lt", "mt", "pl", "pt", "ro", "sk", "sl", "es", "sv", "ru", "uk"];

    OfflineRecognizer? recognizer;

    public string Name => "parakeet-tdt-0.6b-v3";

    public async Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct)
    {
        await models.EnsureParakeetAsync(null, ct);
        return await Task.Run(() =>
        {
            recognizer ??= CreateRecognizer();
            var regions = VadSegmenter.Split(AudioFile.ReadMono16k(audioPath), models.VadPath);
            var segments = new List<TimedSegment>();
            const int batch = 8;
            for (int i = 0; i < regions.Count; i += batch)
            {
                ct.ThrowIfCancellationRequested();
                var group = regions.Skip(i).Take(batch).ToList();
                var streams = group.Select(r =>
                {
                    var s = recognizer.CreateStream();
                    s.AcceptWaveform(TrackWriter.Rate, r.Samples);
                    return s;
                }).ToList();
                recognizer.Decode(streams);
                for (int k = 0; k < group.Count; k++)
                {
                    var text = streams[k].Result.Text.Trim();
                    if (text.Length > 0)
                        segments.Add(new TimedSegment(group[k].Start, group[k].Start + (double)group[k].Samples.Length / TrackWriter.Rate, text));
                    streams[k].Dispose();
                }
                progress?.Report(Math.Min(1, (double)(i + group.Count) / regions.Count));
            }
            return segments;
        }, ct);
    }

    OfflineRecognizer CreateRecognizer()
    {
        var dir = models.ParakeetDir;
        var config = new OfflineRecognizerConfig();
        config.FeatConfig.SampleRate = TrackWriter.Rate;
        config.FeatConfig.FeatureDim = 80;
        config.ModelConfig.Transducer.Encoder = Path.Combine(dir, "encoder.int8.onnx");
        config.ModelConfig.Transducer.Decoder = Path.Combine(dir, "decoder.int8.onnx");
        config.ModelConfig.Transducer.Joiner = Path.Combine(dir, "joiner.int8.onnx");
        config.ModelConfig.Tokens = Path.Combine(dir, "tokens.txt");
        config.ModelConfig.ModelType = "nemo_transducer";
        config.ModelConfig.NumThreads = Math.Clamp(Environment.ProcessorCount / 2, 1, 8);
        config.ModelConfig.Provider = "cpu";
        config.DecodingMethod = "greedy_search";
        return new OfflineRecognizer(config);
    }

    public void Unload()
    {
        recognizer?.Dispose();
        recognizer = null;
    }
}

/// <summary>Whisper large-v3-turbo (q5_0) through Whisper.net / whisper.cpp, for languages Parakeet doesn't cover.</summary>
public sealed class WhisperTranscription(ModelStore models, IReadOnlyList<string>? vocabulary = null) : ITranscriptionBackend
{
    WhisperFactory? factory;

    public string Name => "whisper-large-v3-turbo";

    public async Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct)
    {
        await models.EnsureWhisperAsync(null, ct);
        factory ??= WhisperFactory.FromPath(models.WhisperPath);
        var regions = await Task.Run(() => VadSegmenter.Split(AudioFile.ReadMono16k(audioPath), models.VadPath, 28), ct);
        var builder = factory.CreateBuilder().WithLanguage(language?.Split('-')[0] ?? "auto").WithThreads(Math.Clamp(Environment.ProcessorCount - 1, 1, 8));
        if (vocabulary is { Count: > 0 }) builder = builder.WithPrompt(string.Join(", ", vocabulary));
        await using var processor = builder.Build();
        var segments = new List<TimedSegment>();
        for (int i = 0; i < regions.Count; i++)
        {
            var region = regions[i];
            await foreach (var s in processor.ProcessAsync(region.Samples, ct))
            {
                var text = s.Text.Trim();
                if (text.Length == 0 || s.NoSpeechProbability > 0.8f) continue;
                segments.Add(new TimedSegment(region.Start + s.Start.TotalSeconds, region.Start + s.End.TotalSeconds, text));
            }
            progress?.Report((double)(i + 1) / regions.Count);
        }
        return segments;
    }

    public void Unload()
    {
        factory?.Dispose();
        factory = null;
    }
}

/// <summary>Picks the engine like OpenOats does: Parakeet for its languages and for automatic detection, Whisper otherwise.</summary>
public sealed class OnDeviceTranscription(ModelStore models, LocalEngine engine, IReadOnlyList<string>? vocabulary = null) : ITranscriptionBackend
{
    readonly ParakeetTranscription parakeet = new(models);
    readonly WhisperTranscription whisper = new(models, vocabulary);
    ITranscriptionBackend? last;

    public string Name => (last ?? Pick(null)).Name;

    public ITranscriptionBackend Pick(string? language) => engine switch
    {
        LocalEngine.Parakeet => parakeet,
        LocalEngine.Whisper => whisper,
        _ => language is null || ParakeetTranscription.Languages.Contains(language.Split('-')[0].ToLowerInvariant()) ? parakeet : whisper,
    };

    public Task EnsureModelsAsync(string? language, IProgress<string>? progress, CancellationToken ct) =>
        Pick(language) == parakeet ? models.EnsureParakeetAsync(progress, ct) : models.EnsureWhisperAsync(progress, ct);

    public Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct)
    {
        last = Pick(language);
        return last.TranscribeAsync(audioPath, language, progress, ct);
    }

    public void Unload()
    {
        parakeet.Unload();
        whisper.Unload();
    }
}
