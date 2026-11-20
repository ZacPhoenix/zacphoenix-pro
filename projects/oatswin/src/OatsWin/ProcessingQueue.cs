using System.Diagnostics;
using System.Threading.Channels;
using Oats.Core;
using Oats.Core.Backends;
using Oats.OnDevice;

namespace OatsWin;

/// <summary>
/// Runs Processing one Meeting at a time in the background, at below-normal priority, with settings read fresh for
/// each Meeting. Speech models load per Meeting and are unloaded right after the transcribe step.
/// </summary>
sealed class ProcessingQueue
{
    readonly Channel<string> queue = Channel.CreateUnbounded<string>();
    readonly HashSet<string> pending = [];
    readonly Func<Oats.Core.Settings> settings;
    readonly SecretStore secrets;
    readonly ModelStore models = new(AppPaths.Models);
    readonly MeetingStore store = new(AppPaths.Meetings);

    public ProcessingQueue(Func<Oats.Core.Settings> settings, SecretStore secrets)
    {
        this.settings = settings;
        this.secrets = secrets;
        Oats.Core.Audio.AudioFile.ExternalDecoder = WinAudio.Decode;
        _ = Task.Run(RunAsync);
    }

    /// <summary>Raised on a worker thread with (Meeting, final status).</summary>
    public event Action<MeetingFolder, MeetingStatus>? Finished;
    /// <summary>Raised on a worker thread with a short progress line, or null when idle.</summary>
    public event Action<string?>? Progress;

    public int Count { get { lock (pending) return pending.Count; } }
    public string? Current { get; private set; }

    public void Enqueue(MeetingFolder folder)
    {
        lock (pending) if (!pending.Add(folder.Id)) return;
        queue.Writer.TryWrite(folder.Id);
    }

    /// <summary>Downloads the speech model in the background on first launch, so the first Meeting needn't wait.</summary>
    public void PrefetchModels()
    {
        var s = settings();
        if (s.Transcription.Type != TranscriptionType.OnDevice) return;
        var onDevice = new OnDeviceTranscription(models, s.LocalEngine);
        _ = Task.Run(async () =>
        {
            try
            {
                await onDevice.EnsureModelsAsync(s.LanguageOrNull, new Progress<string>(m => { if (Current is null) Progress?.Invoke(m); }), default);
                if (Current is null) Progress?.Invoke(null);
            }
            catch (Exception e)
            {
                Log.Error("Model prefetch failed", e);
                Progress?.Invoke(null);
            }
        });
    }

    async Task RunAsync()
    {
        await foreach (var id in queue.Reader.ReadAllAsync())
        {
            var folder = store.Find(id);
            if (folder is null) { lock (pending) pending.Remove(id); continue; }
            Current = id;
            var process = Process.GetCurrentProcess();
            try
            {
                process.PriorityClass = ProcessPriorityClass.BelowNormal;
                var s = settings();
                var status = await RunOneAsync(folder, s);
                Log.Info($"Processed {id}: {status.State} {status.LastError}");
                Finished?.Invoke(folder, status);
            }
            catch (Exception e)
            {
                Log.Error($"Processing {id} failed", e);
                try
                {
                    var status = folder.UpdateStatus(st => { st.State = MeetingState.NeedsAttention; st.LastError = e.Message; });
                    Finished?.Invoke(folder, status);
                }
                catch (Exception) { }
            }
            finally
            {
                try { process.PriorityClass = ProcessPriorityClass.Normal; } catch (Exception) { }
                Current = null;
                lock (pending) pending.Remove(id);
                Progress?.Invoke(null);
            }
        }
    }

    async Task<MeetingStatus> RunOneAsync(MeetingFolder folder, Oats.Core.Settings s)
    {
        var progress = new Progress<string>(m => Progress?.Invoke(m));
        ITranscriptionBackend transcription = s.CreateCloudTranscription(secrets.Get)
            ?? new OnDeviceTranscription(models, s.LocalEngine, s.Vocabulary);
        if (transcription is OnDeviceTranscription onDevice)
            await onDevice.EnsureModelsAsync(folder.ReadStatus().Language, progress, default);

        INotesBackend? notes;
        try { notes = s.CreateNotesBackend(secrets.Get); }
        catch (CloudException e)
        {
            // e.g. no API key: still write the Transcript, and say what's missing.
            notes = null;
            Log.Info($"Notes skipped: {e.Message}");
        }
        return await Processing.RunAsync(folder, new ProcessingOptions(
            transcription, s.NotesFolder, notes, s.NotesPrompt, s.Vocabulary, s.KeepAudio,
            Recorder: Environment.UserName, Compress: WinAudio.CompressToAac, Progress: progress));
    }
}
