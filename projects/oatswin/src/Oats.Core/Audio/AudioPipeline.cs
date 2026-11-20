using System.Buffers.Binary;
using NAudio.Dsp;

namespace Oats.Core.Audio;

/// <summary>Interleaved PCM layout of a capture stream, independent of NAudio's WASAPI types.</summary>
public readonly record struct CaptureFormat(int SampleRate, int Channels, int BitsPerSample, bool IsFloat)
{
    public int BlockAlign => Channels * BitsPerSample / 8;
}

/// <summary>Converts interleaved PCM bytes (16/24/32-bit int or 32-bit float, any channel count) to mono float.</summary>
public static class SampleConverter
{
    /// <returns>Number of mono frames written to <paramref name="output"/>.</returns>
    public static int ToMono(ReadOnlySpan<byte> input, CaptureFormat f, Span<float> output)
    {
        int frames = input.Length / f.BlockAlign;
        int bytes = f.BitsPerSample / 8;
        for (int i = 0; i < frames; i++)
        {
            float sum = 0;
            var frame = input.Slice(i * f.BlockAlign, f.BlockAlign);
            for (int c = 0; c < f.Channels; c++)
            {
                var s = frame.Slice(c * bytes, bytes);
                sum += (f.IsFloat, f.BitsPerSample) switch
                {
                    (true, 32) => BinaryPrimitives.ReadSingleLittleEndian(s),
                    (true, 64) => (float)BinaryPrimitives.ReadDoubleLittleEndian(s),
                    (false, 16) => BinaryPrimitives.ReadInt16LittleEndian(s) / 32768f,
                    (false, 24) => ((s[0] << 8 | s[1] << 16 | s[2] << 24) >> 8) / 8388608f,
                    (false, 32) => BinaryPrimitives.ReadInt32LittleEndian(s) / 2147483648f,
                    (false, 8) => (s[0] - 128) / 128f,
                    _ => throw new NotSupportedException($"{f.BitsPerSample}-bit {(f.IsFloat ? "float" : "PCM")} audio"),
                };
            }
            output[i] = sum / f.Channels;
        }
        return frames;
    }
}

/// <summary>Push-mode mono resampler (WDL sinc resampler from NAudio.Core). Pass-through when the rates match.</summary>
public sealed class StreamingResampler
{
    readonly WdlResampler? resampler;
    readonly double ratio;

    public StreamingResampler(int inputRate, int outputRate)
    {
        ratio = (double)outputRate / inputRate;
        if (inputRate == outputRate) return;
        resampler = new WdlResampler();
        resampler.SetMode(true, 2, false);
        resampler.SetFilterParms();
        resampler.SetFeedMode(true);
        resampler.SetRates(inputRate, outputRate);
    }

    /// <summary>Upper bound of output frames for <paramref name="inputFrames"/> input frames.</summary>
    public int MaxOutput(int inputFrames) => (int)Math.Ceiling(inputFrames * ratio) + 64;

    public int Process(ReadOnlySpan<float> input, float[] output)
    {
        if (resampler is null)
        {
            input.CopyTo(output);
            return input.Length;
        }
        // Feed mode: the first argument is the number of input frames we are about to supply.
        int needed = Math.Min(resampler.ResamplePrepare(input.Length, 1, out Span<float> inBuffer), input.Length);
        input[..needed].CopyTo(inBuffer);
        return resampler.ResampleOut(output, needed, output.Length, 1);
    }
}

/// <summary>
/// One crash-safe track on disk: headerless 16 kHz mono s16le PCM (<c>.pcm</c>), flushed to disk every couple of
/// seconds, so a crash or power loss costs at most that much audio and the file is always readable.
/// Silence is written over gaps (loopback devices deliver nothing while nothing plays) so all tracks share one clock.
/// </summary>
public sealed class TrackWriter : IDisposable
{
    public const int Rate = 16_000;

    readonly FileStream stream;
    readonly Func<TimeSpan> clock;
    readonly Lock gate = new();
    long samples;
    float peak;
    bool started;

    public TrackWriter(string path, Func<TimeSpan> clock)
    {
        Path = path;
        this.clock = clock;
        stream = new FileStream(path, FileMode.Append, FileAccess.Write, FileShare.Read, 1 << 16);
        samples = stream.Length / 2;
    }

    public string Path { get; }
    public TimeSpan Written => TimeSpan.FromSeconds((double)Interlocked.Read(ref samples) / Rate);

    public void Write(ReadOnlySpan<float> mono16k)
    {
        lock (gate)
        {
            if (!started)
            {
                started = true;
                // Align the first packet with the shared clock: everything before it was silence.
                PadUnlocked(clock() - TimeSpan.FromSeconds((double)mono16k.Length / Rate));
            }
            Span<byte> buffer = stackalloc byte[4096];
            int i = 0;
            while (i < mono16k.Length)
            {
                int n = Math.Min(buffer.Length / 2, mono16k.Length - i);
                for (int k = 0; k < n; k++)
                {
                    float v = Math.Clamp(mono16k[i + k], -1f, 1f);
                    float a = Math.Abs(v);
                    if (a > peak) peak = a;
                    BinaryPrimitives.WriteInt16LittleEndian(buffer[(k * 2)..], (short)(v * 32767));
                }
                stream.Write(buffer[..(n * 2)]);
                i += n;
            }
            Interlocked.Add(ref samples, mono16k.Length);
        }
    }

    /// <summary>Writes silence up to <c>clock() - allowance</c> if the device has gone quiet.</summary>
    public void PadToClock(TimeSpan allowance)
    {
        lock (gate) PadUnlocked(clock() - allowance);
    }

    void PadUnlocked(TimeSpan target)
    {
        long missing = (long)(target.TotalSeconds * Rate) - samples;
        if (missing <= 0) return;
        var zeros = new byte[Math.Min(missing, Rate) * 2];
        while (missing > 0)
        {
            int n = (int)Math.Min(missing, zeros.Length / 2);
            stream.Write(zeros, 0, n * 2);
            missing -= n;
            samples += n;
        }
    }

    public void Flush()
    {
        lock (gate) stream.Flush(flushToDisk: true);
    }

    /// <summary>Peak level since the last call, 0 to 1, for the level meter.</summary>
    public float TakePeak()
    {
        lock (gate)
        {
            var p = peak;
            peak = 0;
            return p;
        }
    }

    public void Dispose()
    {
        lock (gate)
        {
            stream.Flush(flushToDisk: true);
            stream.Dispose();
        }
    }
}
