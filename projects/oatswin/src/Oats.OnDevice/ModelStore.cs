using System.Formats.Tar;
using ICSharpCode.SharpZipLib.BZip2;
using Oats.Core.Backends;
using Whisper.net.Ggml;

namespace Oats.OnDevice;

/// <summary>
/// Downloads and locates the on-device models under <c>%LOCALAPPDATA%\OatsWin\Models</c>. Downloads go to a temporary
/// name and are moved into place only when complete, so an interrupted download is retried rather than half-used.
/// </summary>
public sealed class ModelStore(string root)
{
    public const string VadUrl = "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx";
    public const string ParakeetName = "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8";
    public const string ParakeetUrl = $"https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/{ParakeetName}.tar.bz2";
    public const string WhisperFile = "ggml-large-v3-turbo-q5_0.bin";

    public string Root { get; } = root;
    public string VadPath => Path.Combine(Root, "silero_vad.onnx");
    public string ParakeetDir => Path.Combine(Root, ParakeetName);
    public string WhisperPath => Path.Combine(Root, WhisperFile);

    public bool HasVad => File.Exists(VadPath);
    public bool HasParakeet => File.Exists(Path.Combine(ParakeetDir, "encoder.int8.onnx")) && File.Exists(Path.Combine(ParakeetDir, "tokens.txt"));
    public bool HasWhisper => File.Exists(WhisperPath);

    public async Task EnsureParakeetAsync(IProgress<string>? progress, CancellationToken ct)
    {
        await EnsureVadAsync(progress, ct);
        if (HasParakeet) return;
        Directory.CreateDirectory(Root);
        var archive = Path.Combine(Root, ParakeetName + ".tar.bz2.part");
        await DownloadAsync(new Uri(ParakeetUrl), archive, "speech model (Parakeet v3, 640 MB)", progress, ct);
        progress?.Report("Unpacking speech model");
        var staging = Path.Combine(Root, ParakeetName + ".staging");
        if (Directory.Exists(staging)) Directory.Delete(staging, true);
        Directory.CreateDirectory(staging);
        await using (var file = File.OpenRead(archive))
        await using (var bz = new BZip2InputStream(file))
            await TarFile.ExtractToDirectoryAsync(bz, staging, overwriteFiles: true, ct);
        var extracted = Path.Combine(staging, ParakeetName);
        if (Directory.Exists(ParakeetDir)) Directory.Delete(ParakeetDir, true);
        Directory.Move(Directory.Exists(extracted) ? extracted : staging, ParakeetDir);
        if (Directory.Exists(staging)) Directory.Delete(staging, true);
        File.Delete(archive);
    }

    public async Task EnsureWhisperAsync(IProgress<string>? progress, CancellationToken ct)
    {
        await EnsureVadAsync(progress, ct);
        if (HasWhisper) return;
        Directory.CreateDirectory(Root);
        progress?.Report("Downloading speech model (Whisper large-v3-turbo, 570 MB)");
        var part = WhisperPath + ".part";
        await using (var model = await new WhisperGgmlDownloader(CloudClient.Http).GetGgmlModelAsync(GgmlType.LargeV3Turbo, QuantizationType.Q5_0, ct))
        await using (var file = File.Create(part))
            await model.CopyToAsync(file, ct);
        File.Move(part, WhisperPath, overwrite: true);
    }

    async Task EnsureVadAsync(IProgress<string>? progress, CancellationToken ct)
    {
        if (HasVad) return;
        Directory.CreateDirectory(Root);
        var part = VadPath + ".part";
        await DownloadAsync(new Uri(VadUrl), part, "voice detector", progress, ct);
        File.Move(part, VadPath, overwrite: true);
    }

    static async Task DownloadAsync(Uri url, string path, string what, IProgress<string>? progress, CancellationToken ct)
    {
        using var response = await CloudClient.Http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        long? total = response.Content.Headers.ContentLength;
        await using var input = await response.Content.ReadAsStreamAsync(ct);
        await using var output = File.Create(path);
        var buffer = new byte[1 << 16];
        long done = 0;
        int lastPercent = -1;
        int n;
        while ((n = await input.ReadAsync(buffer, ct)) > 0)
        {
            await output.WriteAsync(buffer.AsMemory(0, n), ct);
            done += n;
            int percent = total is > 0 ? (int)(done * 100 / total.Value) : -1;
            if (percent != lastPercent)
            {
                lastPercent = percent;
                progress?.Report(percent >= 0 ? $"Downloading {what}: {percent}%" : $"Downloading {what}: {done / 1_000_000} MB");
            }
        }
    }
}
