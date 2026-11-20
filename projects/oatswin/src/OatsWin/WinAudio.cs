using System.Drawing.Drawing2D;
using System.Runtime.InteropServices;
using NAudio.MediaFoundation;
using NAudio.Wave;
using Oats.Core.Audio;

namespace OatsWin;

/// <summary>Media Foundation, which ships with Windows: AAC compression of finished tracks and decoding of imports.</summary>
static class WinAudio
{
    /// <summary>
    /// Compresses a 16 kHz mono <c>.pcm</c> track to <c>.m4a</c>. The Windows AAC encoder takes only 44.1/48 kHz, so the
    /// track is upsampled first, at the lowest bitrate the encoder offers. Returns false (keep WAV) on any failure.
    /// </summary>
    public static bool CompressToAac(string pcmPath, string m4aPath)
    {
        try
        {
            using var raw = new RawSourceWaveStream(File.OpenRead(pcmPath), new WaveFormat(TrackWriter.Rate, 16, 1));
            using var up = new MediaFoundationResampler(raw, new WaveFormat(48_000, 16, 1)) { ResamplerQuality = 60 };
            var rates = MediaFoundationEncoder.GetEncodeBitrates(AudioSubtypes.MFAudioFormat_AAC, 48_000, 1);
            int bitrate = rates.Length > 0 ? rates.Min() : 96_000;
            MediaFoundationEncoder.EncodeToAac(up, m4aPath, bitrate);
            return new FileInfo(m4aPath).Length > 0;
        }
        catch (Exception e)
        {
            Log.Error($"AAC compression of {Path.GetFileName(pcmPath)} failed; keeping WAV", e);
            try { File.Delete(m4aPath); } catch (IOException) { }
            return false;
        }
    }

    /// <summary>Decodes any format Windows can play (m4a, mp3, wma, mp4 video's audio track...) to 16 kHz mono float.</summary>
    public static float[]? Decode(string path)
    {
        try
        {
            using var reader = new MediaFoundationReader(path);
            using var down = new MediaFoundationResampler(reader, WaveFormat.CreateIeeeFloatWaveFormat(TrackWriter.Rate, 1)) { ResamplerQuality = 60 };
            using var memory = new MemoryStream();
            var buffer = new byte[1 << 16];
            int n;
            while ((n = down.Read(buffer.AsSpan())) > 0) memory.Write(buffer, 0, n);
            var bytes = memory.GetBuffer().AsSpan(0, (int)memory.Length);
            return MemoryMarshal.Cast<byte, float>(bytes[..(bytes.Length / 4 * 4)]).ToArray();
        }
        catch (Exception e)
        {
            Log.Error($"Decoding {path} failed", e);
            return null;
        }
    }
}

/// <summary>Tray icons drawn at runtime, so there is no binary asset to ship: an oat grain, tinted by state.</summary>
static class TrayIcons
{
    public static readonly Icon Idle = Draw(Color.FromArgb(0xC8, 0xA2, 0x6B), null);
    public static readonly Icon Recording = Draw(Color.FromArgb(0xC8, 0xA2, 0x6B), Color.FromArgb(0xE5, 0x39, 0x35));
    public static readonly Icon Processing = Draw(Color.FromArgb(0xC8, 0xA2, 0x6B), Color.FromArgb(0xF5, 0xA6, 0x23));
    public static readonly Icon Attention = Draw(Color.FromArgb(0x9E, 0x9E, 0x9E), Color.FromArgb(0xF5, 0xA6, 0x23));

    static Icon Draw(Color grain, Color? badge)
    {
        using var bmp = new Bitmap(32, 32);
        using (var g = Graphics.FromImage(bmp))
        {
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.Clear(Color.Transparent);
            using var path = new GraphicsPath();
            path.AddEllipse(7, 2, 18, 28);
            g.TranslateTransform(16, 16);
            g.RotateTransform(30);
            g.TranslateTransform(-16, -16);
            using (var fill = new SolidBrush(grain)) g.FillPath(fill, path);
            using (var line = new Pen(Color.FromArgb(0x7A, 0x5A, 0x2E), 2)) { g.DrawPath(line, path); g.DrawLine(line, 16, 7, 16, 25); }
            g.ResetTransform();
            if (badge is { } b)
            {
                using var brush = new SolidBrush(b);
                using var ring = new Pen(Color.White, 2);
                g.FillEllipse(brush, 17, 17, 14, 14);
                g.DrawEllipse(ring, 17, 17, 14, 14);
            }
        }
        return Icon.FromHandle(bmp.GetHicon());
    }
}
