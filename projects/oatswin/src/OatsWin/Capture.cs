using System.Diagnostics;
using NAudio.CoreAudioApi;
using NAudio.Wave;
using Oats.Core;
using Oats.Core.Audio;

namespace OatsWin;

/// <summary>
/// One WASAPI capture stream feeding one <see cref="TrackWriter"/>: converts whatever the device delivers (usually
/// 48 kHz float stereo) to 16 kHz mono on the capture thread, so nothing heavier than a resampler runs during the call.
/// Restarts itself when the device disappears (headset unplugged) or the default device changes.
/// </summary>
sealed class CaptureSource : IDisposable
{
    public enum Kind { Microphone, SystemLoopback, ProcessLoopback }

    readonly Kind kind;
    readonly TrackWriter writer;
    readonly SemaphoreSlim gate = new(1, 1);
    WasapiRecorder? recorder;
    CaptureFormat format;
    StreamingResampler? resampler;
    float[] mono = new float[4800];
    float[] resampled = new float[4800];
    volatile bool stopped;

    public CaptureSource(Kind kind, TrackWriter writer, uint processId = 0)
    {
        this.kind = kind;
        this.writer = writer;
        ProcessId = processId;
    }

    public uint ProcessId { get; private set; }
    public string Description { get; private set; } = "";
    public Kind SourceKind => kind;

    public async Task StartAsync()
    {
        await gate.WaitAsync();
        try { await StartUnlockedAsync(); }
        finally { gate.Release(); }
    }

    async Task StartUnlockedAsync()
    {
        StopUnlocked();
        // MMCSS keeps the capture thread on time while Processing of an earlier Meeting keeps the CPU busy.
        var builder = new WasapiRecorderBuilder().WithSharedMode().WithMmcssThreadPriority("Audio").WithBufferLength(200);
        using var devices = new MMDeviceEnumerator();
        switch (kind)
        {
            case Kind.Microphone:
            {
                // Teams talks through the default communications device unless told otherwise.
                var device = devices.GetDefaultAudioEndpoint(DataFlow.Capture, Role.Communications);
                Description = device.FriendlyName;
                builder = builder.WithDevice(device);
                break;
            }
            case Kind.SystemLoopback:
            {
                var device = devices.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                Description = device.FriendlyName + " (loopback)";
                builder = builder.WithDevice(device).WithLoopbackCapture();
                break;
            }
            case Kind.ProcessLoopback:
                if (!OperatingSystem.IsWindowsVersionAtLeast(10, 0, 19041))
                    throw new PlatformNotSupportedException("Per-app audio capture needs Windows 10 version 2004 or later.");
                // Process loopback has no mix format of its own; Windows converts to the format we ask for.
                Description = $"Teams process tree (pid {ProcessId})";
                builder = builder.WithProcessLoopback(ProcessId, ProcessLoopbackMode.IncludeTargetProcessTree)
                    .WithFormat(new WaveFormat(48_000, 16, 2));
                break;
        }
        var r = await builder.BuildAsync();
        format = Map(r.WaveFormat);
        resampler = new StreamingResampler(format.SampleRate, TrackWriter.Rate);
        r.DataAvailable += OnData;
        r.RecordingStopped += OnStopped;
        r.StartRecording();
        recorder = r;
        Log.Info($"Capturing {kind}: {Description}, {r.WaveFormat}");
    }

    static CaptureFormat Map(WaveFormat wf)
    {
        bool isFloat = wf.Encoding == WaveFormatEncoding.IeeeFloat
            || (wf is WaveFormatExtensible ext && ext.SubFormat == new Guid("00000003-0000-0010-8000-00aa00389b71"));
        return new CaptureFormat(wf.SampleRate, wf.Channels, wf.BitsPerSample, isFloat);
    }

    void OnData(ReadOnlySpan<byte> buffer, AudioClientBufferFlags flags, long devicePosition, long qpcPosition)
    {
        var r = resampler;
        if (r is null || stopped) return;
        int frames = buffer.Length / format.BlockAlign;
        if (frames == 0) return;
        if (mono.Length < frames) mono = new float[frames * 2];
        if ((flags & AudioClientBufferFlags.Silent) != 0) Array.Clear(mono, 0, frames);
        else SampleConverter.ToMono(buffer, format, mono);
        int max = r.MaxOutput(frames);
        if (resampled.Length < max) resampled = new float[max * 2];
        int n = r.Process(mono.AsSpan(0, frames), resampled);
        try { writer.Write(resampled.AsSpan(0, n)); }
        catch (ObjectDisposedException) { }
    }

    void OnStopped(object? sender, StoppedEventArgs e)
    {
        if (stopped) return;
        Log.Info($"{kind} capture stopped{(e.Exception is null ? "" : ": " + e.Exception.Message)}; restarting");
        _ = RestartWithRetryAsync();
    }

    /// <summary>Re-opens the stream on the current default device. The writer pads the gap with silence.</summary>
    public async Task RestartWithRetryAsync()
    {
        for (int attempt = 0; !stopped; attempt++)
        {
            await Task.Delay(attempt == 0 ? 500 : 2000);
            if (stopped) return;
            try
            {
                await StartAsync();
                return;
            }
            catch (Exception ex)
            {
                if (attempt % 15 == 0) Log.Error($"{kind} capture restart failed", ex);
            }
        }
    }

    public async Task RetargetAsync(uint processId)
    {
        ProcessId = processId;
        await StartAsync();
    }

    void StopUnlocked()
    {
        var r = recorder;
        recorder = null;
        if (r is null) return;
        r.DataAvailable -= OnData;
        r.RecordingStopped -= OnStopped;
        try { r.StopRecording(); } catch (Exception) { }
        try { r.Dispose(); } catch (Exception) { }
    }

    public void Dispose()
    {
        stopped = true;
        gate.Wait();
        try { StopUnlocked(); }
        finally { gate.Release(); }
    }
}

/// <summary>Finds Teams (new Teams is <c>ms-teams.exe</c>, classic Teams is <c>Teams.exe</c>) and whether it holds the mic.</summary>
static class Teams
{
    const string MicConsent = @"Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone";

    /// <summary>The oldest Teams process: the root of its process tree, so process loopback includes the WebView2 and media children.</summary>
    public static uint? FindRootProcessId()
    {
        foreach (var name in new[] { "ms-teams", "Teams" })
        {
            var candidates = Process.GetProcessesByName(name);
            try
            {
                var root = candidates
                    .Select(p => { try { return (p, Start: p.StartTime); } catch (Exception) { return (p, Start: DateTime.MaxValue); } })
                    .OrderBy(x => x.Start).Select(x => x.p).FirstOrDefault();
                if (root is not null) return (uint)root.Id;
            }
            finally { foreach (var p in candidates) p.Dispose(); }
        }
        return null;
    }

    public static bool IsAlive(uint processId)
    {
        try
        {
            using var p = Process.GetProcessById((int)processId);
            return !p.HasExited;
        }
        catch (ArgumentException) { return false; }
        catch (InvalidOperationException) { return false; }
    }

    /// <summary>
    /// True while Teams is using the microphone, read from the same registry state that drives the Windows
    /// "app is using your microphone" indicator: <c>LastUsedTimeStop == 0</c> means in use right now.
    /// </summary>
    public static bool OnMicrophone()
    {
        using var root = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(MicConsent);
        if (root is null) return false;
        foreach (var name in root.GetSubKeyNames())
            if (name.StartsWith("MSTeams_", StringComparison.OrdinalIgnoreCase) && InUse(root, name)) return true;
        using var nonPackaged = root.OpenSubKey("NonPackaged");
        if (nonPackaged is null) return false;
        foreach (var name in nonPackaged.GetSubKeyNames())
            if ((name.EndsWith("#Teams.exe", StringComparison.OrdinalIgnoreCase) || name.EndsWith("#ms-teams.exe", StringComparison.OrdinalIgnoreCase))
                && InUse(nonPackaged, name)) return true;
        return false;
    }

    static bool InUse(Microsoft.Win32.RegistryKey parent, string name)
    {
        using var key = parent.OpenSubKey(name);
        return key?.GetValue("LastUsedTimeStop") is long stop && stop == 0 && key.GetValue("LastUsedTimeStart") is long start && start != 0;
    }
}

/// <summary>
/// One recording: up to three tracks on one shared clock. Mic is You. Them is captured twice, from the Teams process
/// tree (immune to notification sounds and music, and to Teams using a different output device than the default) and
/// from the whole default output device (fallback for Windows 10, where process loopback does not exist, or a Teams
/// build that renders audio outside its tree). Processing keeps whichever actually captured the call.
/// </summary>
sealed class RecordingSession : IDisposable
{
    readonly Stopwatch clock = Stopwatch.StartNew();
    readonly List<(Track Track, TrackWriter Writer, CaptureSource Source)> tracks = [];
    readonly System.Threading.Timer timer;
    readonly MMDeviceEnumerator devices = new();
    readonly MMDeviceNotificationClient notifications;
    readonly bool wantsApp;
    int ticks;

    public MeetingFolder Folder { get; }
    public DateTimeOffset StartedAt { get; } = DateTimeOffset.Now;
    public TimeSpan Elapsed => clock.Elapsed;
    public List<string> Warnings { get; } = [];
    public event Action<string>? Problem;

    RecordingSession(MeetingFolder folder, bool wantsApp)
    {
        Folder = folder;
        this.wantsApp = wantsApp;
        timer = new System.Threading.Timer(_ => Tick(), null, 2000, 2000);
        notifications = devices.CreateNotificationClient(false);
        notifications.DefaultDeviceChanged += OnDefaultDeviceChanged;
    }

    public static async Task<RecordingSession> StartAsync(MeetingFolder folder, Oats.Core.Settings settings)
    {
        var session = new RecordingSession(folder, settings.ThemSource == Oats.Core.ThemSourceMode.TeamsThenSystem);
        if (settings.RecordMic)
            await session.AddAsync(Track.Mic, CaptureSource.Kind.Microphone, 0,
                "Couldn't open the microphone. Check Windows Settings > Privacy & security > Microphone > Let desktop apps access your microphone.");
        await session.AddAsync(Track.System, CaptureSource.Kind.SystemLoopback, 0, "Couldn't record system audio.");
        if (session.wantsApp && Teams.FindRootProcessId() is { } pid)
            await session.AddAsync(Track.App, CaptureSource.Kind.ProcessLoopback, pid, null);
        if (session.tracks.All(t => t.Track == Track.Mic))
            throw new InvalidOperationException(session.Warnings.LastOrDefault() ?? "Couldn't open any audio source.");
        return session;
    }

    async Task AddAsync(Track track, CaptureSource.Kind kind, uint pid, string? userMessage)
    {
        var writer = new TrackWriter(Folder.TrackPath(track), () => clock.Elapsed);
        var source = new CaptureSource(kind, writer, pid);
        try
        {
            await source.StartAsync();
            lock (tracks) tracks.Add((track, writer, source));
        }
        catch (Exception e)
        {
            Log.Error($"Starting {kind} failed", e);
            source.Dispose();
            writer.Dispose();
            File.Delete(Folder.TrackPath(track));
            if (userMessage is not null) Warnings.Add(userMessage);
        }
    }

    void OnDefaultDeviceChanged(object? sender, DefaultDeviceChangedEventArgs e)
    {
        var kind = e switch
        {
            { Flow: DataFlow.Capture, Role: Role.Communications } => CaptureSource.Kind.Microphone,
            { Flow: DataFlow.Render, Role: Role.Multimedia } => CaptureSource.Kind.SystemLoopback,
            _ => (CaptureSource.Kind?)null,
        };
        if (kind is null) return;
        Log.Info($"Default {e.Flow}/{e.Role} device changed; following it");
        foreach (var t in Snapshot().Where(t => t.Source.SourceKind == kind)) _ = t.Source.RestartWithRetryAsync();
    }

    List<(Track Track, TrackWriter Writer, CaptureSource Source)> Snapshot()
    {
        lock (tracks) return tracks.ToList();
    }

    /// <summary>Every 2 s: pad silent loopback gaps, flush to disk, watch disk space and Teams restarts.</summary>
    void Tick()
    {
        try
        {
            foreach (var t in Snapshot())
            {
                t.Writer.PadToClock(TimeSpan.FromSeconds(1));
                t.Writer.Flush();
            }
            if (++ticks % 5 == 0)
            {
                var free = new DriveInfo(Path.GetPathRoot(Folder.Path)!).AvailableFreeSpace;
                if (free < 200_000_000) Problem?.Invoke("stop:Disk almost full: recording stopped to keep what was captured.");
                foreach (var t in Snapshot().Where(t => t.Source.SourceKind == CaptureSource.Kind.ProcessLoopback))
                    if (!Teams.IsAlive(t.Source.ProcessId) && Teams.FindRootProcessId() is { } pid)
                    {
                        Log.Info($"Teams restarted (pid {pid}); following it");
                        _ = t.Source.RetargetAsync(pid);
                    }
            }
        }
        catch (Exception e) { Log.Error("Recording tick failed", e); }
    }

    /// <summary>Peak levels since the last call for the mic and the loudest Them source.</summary>
    public (float Mic, float Them) TakeLevels()
    {
        float mic = 0, them = 0;
        foreach (var t in Snapshot())
        {
            var p = t.Writer.TakePeak();
            if (t.Track == Track.Mic) mic = p;
            else them = Math.Max(them, p);
        }
        return (mic, them);
    }

    public IEnumerable<string> Sources => Snapshot().Select(t => $"{t.Track}: {t.Source.Description}");

    /// <summary>Stops capture, aligns all tracks to the same end and hands the Meeting to Processing.</summary>
    public void Stop()
    {
        timer.Dispose();
        notifications.DefaultDeviceChanged -= OnDefaultDeviceChanged;
        var end = clock.Elapsed;
        foreach (var t in Snapshot())
        {
            t.Source.Dispose();
            t.Writer.PadToClock(clock.Elapsed - end);
            t.Writer.Dispose();
        }
        Folder.UpdateStatus(s => { s.EndedAt = StartedAt + end; s.State = MeetingState.Processing; });
        Log.Info($"Recording {Folder.Id} stopped after {end:hh\\:mm\\:ss}");
    }

    public void Dispose()
    {
        timer.Dispose();
        notifications.Dispose();
        devices.Dispose();
    }
}
