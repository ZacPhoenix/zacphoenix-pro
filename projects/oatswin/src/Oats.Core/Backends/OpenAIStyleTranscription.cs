using System.Globalization;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Nodes;
using Oats.Core.Audio;

namespace Oats.Core.Backends;

/// <summary>
/// The OpenAI-style <c>/audio/transcriptions</c> backend (OpenAI, Groq, self-hosted Whisper servers such as
/// faster-whisper-server or speaches). Uploads each track as 16 kHz mono WAV chunks under the 25 MB cap and shifts each
/// chunk's segments by its offset, so You and Them stay exact.
/// </summary>
public sealed class OpenAIStyleTranscription(string? address, string? model, string? apiKey) : ITranscriptionBackend
{
    public string Address { get; } = string.IsNullOrWhiteSpace(address) ? "https://api.openai.com/v1" : address.Trim().TrimEnd('/');
    public string Model { get; } = string.IsNullOrWhiteSpace(model) ? "whisper-1" : model.Trim();
    public string? ApiKey { get; } = string.IsNullOrWhiteSpace(apiKey) ? null : apiKey.Trim();
    public string Name => $"openai-style:{Model}";

    /// <summary><c>gpt-4o*</c> transcription models return text without timings, so they get short chunks.</summary>
    bool Timed => !Model.StartsWith("gpt-", StringComparison.Ordinal);
    /// <summary>10 minutes of 16 kHz 16-bit mono is 19.2 MB, safely under the 25 MB upload cap.</summary>
    int ChunkSeconds => Timed ? 600 : 30;

    public async Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct)
    {
        if (!Uri.TryCreate(Address, UriKind.Absolute, out var baseUri) || !baseUri.Scheme.StartsWith("http", StringComparison.Ordinal))
            throw new CloudException($"\"{Address}\" isn't a valid server address.");
        var samples = AudioFile.ReadMono16k(audioPath);
        int chunk = ChunkSeconds * TrackWriter.Rate;
        var segments = new List<TimedSegment>();
        var dir = Directory.CreateTempSubdirectory("oats-upload-");
        try
        {
            for (int offset = 0; offset < samples.Length; offset += chunk)
            {
                int length = Math.Min(chunk, samples.Length - offset);
                var slice = samples.AsSpan(offset, length);
                double start = (double)offset / TrackWriter.Rate, duration = (double)length / TrackWriter.Rate;
                if (AudioFile.ActiveShare(slice) == 0) { progress?.Report((double)(offset + length) / samples.Length); continue; }
                var wav = Path.Combine(dir.FullName, $"chunk-{offset}.wav");
                AudioFile.WriteWav(wav, slice);
                foreach (var s in await UploadAsync(wav, new Uri(Address + "/audio/transcriptions"), language, ct))
                    segments.Add(new TimedSegment(start + (s.Start ?? 0), start + (s.End ?? duration), s.Text));
                File.Delete(wav);
                progress?.Report((double)(offset + length) / samples.Length);
            }
        }
        finally { dir.Delete(true); }
        return segments;
    }

    sealed record Piece(double? Start, double? End, string Text);

    async Task<List<Piece>> UploadAsync(string wav, Uri url, string? language, CancellationToken ct)
    {
        var bytes = await File.ReadAllBytesAsync(wav, ct);
        var backend = url.Host;
        var reply = await CloudClient.SendAsync(() =>
        {
            var form = new MultipartFormDataContent
            {
                { new StringContent(Model), "model" },
                { new StringContent(Timed ? "verbose_json" : "json"), "response_format" },
            };
            if (Timed) form.Add(new StringContent("segment"), "timestamp_granularities[]");
            if (language?.Split('-')[0] is { Length: > 0 } lang) form.Add(new StringContent(lang), "language");
            var file = new ByteArrayContent(bytes);
            file.Headers.ContentType = new MediaTypeHeaderValue("audio/wav");
            form.Add(file, "file", "audio.wav");
            var request = new HttpRequestMessage(HttpMethod.Post, url) { Content = form };
            if (ApiKey is not null) request.Headers.Authorization = new("Bearer", ApiKey);
            return request;
        }, backend, ct);

        JsonNode? root;
        try { root = JsonNode.Parse(reply); }
        catch (JsonException e) { throw new CloudException($"{backend} sent a reply that isn't JSON.", e); }
        var pieces = new List<Piece>();
        if (root?["segments"] is JsonArray arr && arr.Count > 0)
        {
            foreach (var s in arr)
            {
                var text = s?["text"]?.GetValue<string>()?.Trim() ?? "";
                if (text.Length > 0) pieces.Add(new Piece(Num(s?["start"]), Num(s?["end"]), text));
            }
        }
        else if (root?["text"]?.GetValue<string>()?.Trim() is { Length: > 0 } text)
            pieces.Add(new Piece(null, null, text));
        return pieces;
    }

    static double? Num(JsonNode? n) => n is null ? null : double.Parse(n.ToJsonString(), CultureInfo.InvariantCulture);
}
