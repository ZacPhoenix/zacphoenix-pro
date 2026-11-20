using System.Buffers.Binary;
using System.Text;

namespace Oats.Core.Audio;

/// <summary>Reads tracks as 16 kHz mono float, writes WAV, and measures whether a track carries any sound.</summary>
public static class AudioFile
{
    /// <summary>
    /// Decoder for formats this cross-platform library can't read (m4a, mp3, ...). The Windows app plugs in Media
    /// Foundation; it returns 16 kHz mono samples, or null if it can't read the file either.
    /// </summary>
    public static Func<string, float[]?>? ExternalDecoder { get; set; }

    public static float[] ReadMono16k(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        if (ext == ".pcm") return ReadPcm16(File.ReadAllBytes(path));
        if (ext == ".wav" && TryReadWav(path, out var samples)) return samples;
        return ExternalDecoder?.Invoke(path) ?? throw new InvalidDataException($"Couldn't read the audio file {Path.GetFileName(path)}.");
    }

    public static double DurationSeconds(string path)
    {
        var ext = Path.GetExtension(path).ToLowerInvariant();
        if (ext == ".pcm") return new FileInfo(path).Length / 2.0 / TrackWriter.Rate;
        return ReadMono16k(path).Length / (double)TrackWriter.Rate;
    }

    static float[] ReadPcm16(byte[] bytes)
    {
        var result = new float[bytes.Length / 2];
        for (int i = 0; i < result.Length; i++) result[i] = BinaryPrimitives.ReadInt16LittleEndian(bytes.AsSpan(i * 2)) / 32768f;
        return result;
    }

    static bool TryReadWav(string path, out float[] samples)
    {
        samples = [];
        var bytes = File.ReadAllBytes(path);
        if (bytes.Length < 12 || Encoding.ASCII.GetString(bytes, 0, 4) != "RIFF" || Encoding.ASCII.GetString(bytes, 8, 4) != "WAVE") return false;
        CaptureFormat? format = null;
        int pos = 12;
        while (pos + 8 <= bytes.Length)
        {
            var id = Encoding.ASCII.GetString(bytes, pos, 4);
            long size = BinaryPrimitives.ReadUInt32LittleEndian(bytes.AsSpan(pos + 4));
            int body = pos + 8;
            if (id == "fmt ")
            {
                int tag = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(body));
                int channels = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(body + 2));
                int rate = BinaryPrimitives.ReadInt32LittleEndian(bytes.AsSpan(body + 4));
                int bits = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(body + 14));
                if (tag == 0xFFFE && size >= 40) tag = BinaryPrimitives.ReadUInt16LittleEndian(bytes.AsSpan(body + 24)); // extensible subformat
                if (tag is not (1 or 3)) return false;
                format = new CaptureFormat(rate, channels, bits, tag == 3);
            }
            else if (id == "data" && format is { } f)
            {
                // A writer that crashed leaves size 0 or 0xFFFFFFFF: read to the end of the file then.
                long available = bytes.Length - body;
                long length = size == 0 || size > available ? available : size;
                length -= length % f.BlockAlign;
                var mono = new float[length / f.BlockAlign];
                SampleConverter.ToMono(bytes.AsSpan(body, (int)length), f, mono);
                samples = Resample(mono, f.SampleRate);
                return true;
            }
            pos = body + (int)size + (int)(size & 1);
        }
        return false;
    }

    public static float[] Resample(float[] mono, int rate)
    {
        if (rate == TrackWriter.Rate) return mono;
        var resampler = new StreamingResampler(rate, TrackWriter.Rate);
        var result = new List<float>(resampler.MaxOutput(mono.Length));
        var output = new float[resampler.MaxOutput(8192)];
        for (int i = 0; i < mono.Length; i += 8192)
        {
            int n = resampler.Process(mono.AsSpan(i, Math.Min(8192, mono.Length - i)), output);
            result.AddRange(output.AsSpan(0, n));
        }
        // Flush the filter tail with silence so the last few milliseconds come out.
        int tail = resampler.Process(new float[rate / 10], output);
        result.AddRange(output.AsSpan(0, tail));
        int expected = (int)((long)mono.Length * TrackWriter.Rate / rate);
        if (result.Count > expected) result.RemoveRange(expected, result.Count - expected);
        while (result.Count < expected) result.Add(0);
        return result.ToArray();
    }

    /// <summary>Writes 16 kHz mono 16-bit WAV.</summary>
    public static void WriteWav(string path, ReadOnlySpan<float> samples)
    {
        using var fs = new FileStream(path, FileMode.Create, FileAccess.Write);
        WriteWavHeader(fs, samples.Length);
        var buffer = new byte[samples.Length * 2];
        for (int i = 0; i < samples.Length; i++)
            BinaryPrimitives.WriteInt16LittleEndian(buffer.AsSpan(i * 2), (short)(Math.Clamp(samples[i], -1f, 1f) * 32767));
        fs.Write(buffer);
    }

    /// <summary>Wraps a <c>.pcm</c> track in a WAV header without decoding it.</summary>
    public static void PcmToWav(string pcmPath, string wavPath)
    {
        using var input = File.OpenRead(pcmPath);
        using var output = new FileStream(wavPath, FileMode.Create, FileAccess.Write);
        WriteWavHeader(output, (int)(input.Length / 2));
        input.CopyTo(output);
    }

    static void WriteWavHeader(Stream s, int sampleCount)
    {
        Span<byte> h = stackalloc byte[44];
        int dataBytes = sampleCount * 2;
        Encoding.ASCII.GetBytes("RIFF", h);
        BinaryPrimitives.WriteInt32LittleEndian(h[4..], 36 + dataBytes);
        Encoding.ASCII.GetBytes("WAVEfmt ", h[8..]);
        BinaryPrimitives.WriteInt32LittleEndian(h[16..], 16);
        BinaryPrimitives.WriteInt16LittleEndian(h[20..], 1);
        BinaryPrimitives.WriteInt16LittleEndian(h[22..], 1);
        BinaryPrimitives.WriteInt32LittleEndian(h[24..], TrackWriter.Rate);
        BinaryPrimitives.WriteInt32LittleEndian(h[28..], TrackWriter.Rate * 2);
        BinaryPrimitives.WriteInt16LittleEndian(h[32..], 2);
        BinaryPrimitives.WriteInt16LittleEndian(h[34..], 16);
        Encoding.ASCII.GetBytes("data", h[36..]);
        BinaryPrimitives.WriteInt32LittleEndian(h[40..], dataBytes);
        s.Write(h);
    }

    /// <summary>
    /// Share of 100 ms frames louder than -50 dBFS RMS. Used to decide whether the Teams process track actually
    /// captured the call (it is silent if Teams rendered audio from a process outside its tree).
    /// </summary>
    public static double ActiveShare(ReadOnlySpan<float> samples)
    {
        const int frame = TrackWriter.Rate / 10;
        const double threshold = 0.00316; // -50 dBFS
        int frames = samples.Length / frame, active = 0;
        for (int i = 0; i < frames; i++)
        {
            double sum = 0;
            foreach (var s in samples.Slice(i * frame, frame)) sum += s * s;
            if (Math.Sqrt(sum / frame) > threshold) active++;
        }
        return frames == 0 ? 0 : (double)active / frames;
    }
}
