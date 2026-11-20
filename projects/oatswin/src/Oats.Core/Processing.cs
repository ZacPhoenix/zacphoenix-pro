using Oats.Core.Audio;
using Oats.Core.Backends;

namespace Oats.Core;

/// <summary>What Processing needs besides the Meeting folder.</summary>
public sealed record ProcessingOptions(
    ITranscriptionBackend Transcription,
    string NotesFolder,
    INotesBackend? Notes = null,
    string? NotesPrompt = null,
    IReadOnlyList<string>? Vocabulary = null,
    bool KeepAudio = true,
    string? Recorder = null,
    /// <summary>Compresses a finished <c>.pcm</c> track to the given path (Windows: AAC via Media Foundation). Null keeps WAV.</summary>
    Func<string, string, bool>? Compress = null,
    IProgress<string>? Progress = null);

/// <summary>
/// The Processing pipeline: Meeting folder in, Meeting file out. Each step writes a checkpoint, so a crash, a quit or a
/// failed cloud call resumes from the last finished step on Retry instead of starting over.
/// </summary>
public static class Processing
{
    /// <summary>The Teams process track must be active in at least this share of 100 ms frames...</summary>
    public const double AppTrackMinActiveShare = 0.005;
    /// <summary>...and at least this fraction as often as the whole-system track. A Teams track that only caught the
    /// ringtone, while the call itself played through a process outside the Teams tree, fails this test.</summary>
    public const double AppTrackMinRelativeShare = 0.5;

    /// <summary>True when the Teams process track heard the call, judged against the whole-system track.</summary>
    public static bool AppTrackHeardCall(double appShare, double? systemShare) =>
        appShare >= AppTrackMinActiveShare && (systemShare is not { } sys || appShare >= sys * AppTrackMinRelativeShare);

    public static async Task<MeetingStatus> RunAsync(MeetingFolder folder, ProcessingOptions o, CancellationToken ct = default)
    {
        using var lockHandle = folder.Lock();
        var status = folder.UpdateStatus(s => { s.State = MeetingState.Processing; s.LastError = null; });
        Exception? notesError = null;
        try
        {
            if (!status.CompletedSteps.Contains(Step.Transcribe))
            {
                var jobs = TranscriptionJobs(folder, status, o);
                if (jobs.Count == 0) throw new InvalidDataException("This Meeting has no audio to transcribe.");
                double duration = jobs.Max(j => AudioFile.DurationSeconds(j.File));
                try
                {
                    foreach (var (name, file) in jobs)
                    {
                        if (folder.ReadCheckpoint<List<TimedSegment>>(name) is not null) continue;
                        o.Progress?.Report($"Transcribing {(name == "mic" ? "your microphone" : name == "mixed" ? "audio" : "the call")}");
                        var progress = new Progress<double>(p => o.Progress?.Report($"Transcribing {name} {p:P0}"));
                        var segments = await o.Transcription.TranscribeAsync(file, status.Language, progress, ct);
                        folder.WriteCheckpoint(name, segments);
                    }
                }
                finally { o.Transcription.Unload(); }
                status = folder.UpdateStatus(s =>
                {
                    s.Duration = duration;
                    s.TranscriptionBackend = o.Transcription.Name;
                    s.CompletedSteps.Add(Step.Transcribe);
                });
            }

            if (!status.CompletedSteps.Contains(Step.Merge))
            {
                List<TimedSegment> Segments(string name) => folder.ReadCheckpoint<List<TimedSegment>>(name) ?? [];
                var turns = folder.IsMixed
                    ? TranscriptMerge.Mixed(Segments("mixed"), o.Transcription.SeparatesSpeakers)
                    : TranscriptMerge.Merge(Segments("mic"), Segments("them"));
                folder.WriteCheckpoint("transcript", turns);
                status = folder.UpdateStatus(s => s.CompletedSteps.Add(Step.Merge));
            }

            var transcript = folder.ReadCheckpoint<List<Turn>>("transcript") ?? [];
            if (!status.CompletedSteps.Contains(Step.Notes))
            {
                string? name = null;
                if (o.Notes is { } backend && transcript.Count > 0)
                {
                    try
                    {
                        o.Progress?.Report("Writing notes");
                        folder.WriteCheckpoint("notes", await NotesWriter.WriteAsync(transcript, backend, o.NotesPrompt, o.Vocabulary, ct));
                        name = backend.Name;
                    }
                    catch (Exception e) when (e is not OperationCanceledException) { notesError = e; }
                }
                if (notesError is null)
                    status = folder.UpdateStatus(s => { if (name is not null) s.NotesBackend = name; s.CompletedSteps.Add(Step.Notes); });
            }

            WriteMeetingFile(folder, transcript, o);
            FinishAudio(folder, o);
        }
        catch (Exception e) when (e is not OperationCanceledException and not MeetingBusyException)
        {
            return folder.UpdateStatus(s => { s.State = MeetingState.NeedsAttention; s.LastError = e.Message; });
        }
        return folder.UpdateStatus(s =>
        {
            s.State = notesError is null ? MeetingState.Done : MeetingState.NeedsAttention;
            s.LastError = notesError is null ? null : $"The Notes weren't written. {notesError.Message}";
        });
    }

    /// <summary>
    /// (checkpoint name, file) pairs to transcribe. Them is the Teams process track when it carries sound, else the
    /// whole-system loopback track. Recording both costs about 2 MB a minute and protects against a silent Them side.
    /// </summary>
    static List<(string Name, string File)> TranscriptionJobs(MeetingFolder folder, MeetingStatus status, ProcessingOptions o)
    {
        if (folder.TrackFiles(Track.Mixed).FirstOrDefault() is { } mixed) return [("mixed", mixed)];
        var jobs = new List<(string, string)>();
        if (folder.TrackFiles(Track.Mic).FirstOrDefault() is { } mic) jobs.Add(("mic", mic));

        var app = folder.TrackFiles(Track.App).FirstOrDefault();
        var system = folder.TrackFiles(Track.System).FirstOrDefault();
        string? them = status.ThemSource switch
        {
            "app" when app is not null => app,
            "system" when system is not null => system,
            _ => null,
        };
        if (them is null)
        {
            if (app is not null && (system is null || AppTrackHeardCall(
                    AudioFile.ActiveShare(AudioFile.ReadMono16k(app)), AudioFile.ActiveShare(AudioFile.ReadMono16k(system)))))
                them = app;
            else
                them = system;
            var source = them == app ? "app" : "system";
            if (them is not null) folder.UpdateStatus(s => s.ThemSource = source);
        }
        if (them is not null) jobs.Add(("them", them));
        return jobs;
    }

    /// <summary>Clears all checkpoints so the next run starts over (e.g. with a different backend); the Meeting file is kept.</summary>
    public static void PrepareReprocess(MeetingFolder folder)
    {
        foreach (var name in new[] { "mic", "them", "mixed", "transcript", "notes" }) folder.DeleteCheckpoint(name);
        folder.UpdateStatus(s => { s.CompletedSteps.Clear(); s.State = MeetingState.Processing; });
    }

    /// <summary>
    /// Writes the Meeting file into the notes folder, replacing the previous one only if the user hasn't edited it since;
    /// an edited one gets a <c>-2</c> sibling next to it instead.
    /// </summary>
    static void WriteMeetingFile(MeetingFolder folder, List<Turn> transcript, ProcessingOptions o)
    {
        var status = folder.ReadStatus();
        var notes = folder.ReadCheckpoint<Notes>("notes");
        var title = status.Title ?? notes?.Title;
        var content = new MeetingFileWriter.Content(
            folder.Id, title, status.StartedAt, status.Length ?? 60, status.Language, status.TranscriptionBackend, status.App,
            status.Interrupted, notes?.Markdown, (IReadOnlyList<Turn>?)notes?.Turns ?? transcript,
            folder.IsMixed ? "Speaker" : "You", o.Recorder);
        var data = MeetingFileWriter.Encode(MeetingFileWriter.Markdown(content));

        string path;
        if (status.MeetingFile is { } previous && File.Exists(previous)
            && MeetingFileWriter.Hash(File.ReadAllBytes(previous)) != status.MeetingFileHash)
        {
            path = MeetingFileWriter.SiblingPath(previous);
        }
        else
        {
            if (status.MeetingFile is { } old && File.Exists(old)) File.Delete(old);
            Directory.CreateDirectory(o.NotesFolder);
            path = MeetingFileWriter.FreePath(MeetingFileWriter.BaseName(title, status.StartedAt), o.NotesFolder);
        }
        File.WriteAllBytes(path, data);
        folder.UpdateStatus(s => { s.MeetingFile = path; s.MeetingFileHash = MeetingFileWriter.Hash(data); });
    }

    /// <summary>
    /// Once the Meeting file exists: compresses the tracks that were transcribed (or wraps them as WAV), deletes the
    /// unused Them candidate, or deletes all audio if the user chose not to keep it.
    /// </summary>
    static void FinishAudio(MeetingFolder folder, ProcessingOptions o)
    {
        var status = folder.ReadStatus();
        var unused = status.ThemSource switch { "app" => Track.System, "system" => Track.App, _ => (Track?)null };
        foreach (Track track in Enum.GetValues<Track>())
        {
            foreach (var file in folder.TrackFiles(track))
            {
                if (!o.KeepAudio || track == unused) { File.Delete(file); continue; }
                if (!file.EndsWith(".pcm", StringComparison.OrdinalIgnoreCase)) continue;
                if (o.Compress?.Invoke(file, folder.TrackPath(track, ".m4a")) != true)
                    AudioFile.PcmToWav(file, folder.TrackPath(track, ".wav"));
                File.Delete(file);
            }
        }
    }
}
