using Oats.Core;
using Oats.Core.Audio;
using Oats.Core.Backends;

namespace Oats.Core.Tests;

public sealed class ProcessingTests : IDisposable
{
    readonly string root = Directory.CreateTempSubdirectory("oats-test-").FullName;
    string Notes => Path.Combine(root, "notes");
    string Meetings => Path.Combine(root, "meetings");

    public void Dispose() => Directory.Delete(root, true);

    /// <summary>Returns text based on the file name, so tests can tell which track was transcribed as Them.</summary>
    sealed class FakeTranscription : ITranscriptionBackend
    {
        public List<string> Files { get; } = [];
        public string Name => "fake-asr";
        public Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct)
        {
            Files.Add(Path.GetFileName(audioPath));
            var stem = Path.GetFileNameWithoutExtension(audioPath);
            return Task.FromResult<List<TimedSegment>>(stem == "mic"
                ? [new(5, 6, "I will take the action item.")]
                : [new(1, 3, $"Hello from the {stem} track.")]);
        }
    }

    sealed class FlakyNotes : INotesBackend
    {
        public bool Fail { get; set; } = true;
        public string Name => "flaky";
        public int ContextTokens => 32_000;
        public Task<string> CompleteAsync(string system, string user, CancellationToken ct) =>
            Fail ? throw new CloudException("Ollama isn't running.") : Task.FromResult("Title: Budget Sync\n## Summary\nWe met.");
    }

    MeetingFolder Record(bool appHasSound, bool withApp = true)
    {
        var folder = MeetingFolder.Create(Meetings, new DateTimeOffset(2026, 11, 20, 9, 30, 0, TimeSpan.Zero), null, "teams", false);
        var tone = Enumerable.Range(0, 16_000 * 4).Select(i => (float)Math.Sin(i / 7.0) * 0.3f).ToArray();
        void Write(Track t, float[] s) { using var w = new TrackWriter(folder.TrackPath(t), () => TimeSpan.Zero); w.Write(s); }
        Write(Track.Mic, tone);
        Write(Track.System, tone);
        if (withApp) Write(Track.App, appHasSound ? tone : new float[tone.Length]);
        folder.UpdateStatus(s => { s.State = MeetingState.Processing; s.EndedAt = s.StartedAt.AddSeconds(4); });
        return folder;
    }

    [Fact]
    public async Task Writes_the_meeting_file_and_prefers_the_teams_track()
    {
        var folder = Record(appHasSound: true);
        var asr = new FakeTranscription();
        var status = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes));

        Assert.Equal(MeetingState.Done, status.State);
        Assert.Equal("app", status.ThemSource);
        Assert.Equal(["mic.pcm", "app.pcm"], asr.Files);
        var md = File.ReadAllText(status.MeetingFile!);
        Assert.Contains("[00:00:01] **Them:** Hello from the app track.", md);
        Assert.Contains("[00:00:05] **You:** I will take the action item.", md);
        Assert.Contains("app: teams", md);
        Assert.EndsWith("-meeting.md", status.MeetingFile);
        // Tracks became WAV (no compressor on this platform); the unused system loopback track is gone.
        Assert.True(File.Exists(folder.TrackPath(Track.Mic, ".wav")));
        Assert.True(File.Exists(folder.TrackPath(Track.App, ".wav")));
        Assert.Empty(folder.TrackFiles(Track.System));
    }

    [Fact]
    public async Task Falls_back_to_system_audio_when_the_teams_track_is_silent()
    {
        var folder = Record(appHasSound: false);
        var asr = new FakeTranscription();
        var status = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes));
        Assert.Equal("system", status.ThemSource);
        Assert.Contains("Hello from the system track.", File.ReadAllText(status.MeetingFile!));
    }

    [Theory]
    [InlineData(0.40, 0.45, true)]   // Teams track heard the call
    [InlineData(0.30, 0.80, false)]  // music raised the system track: falling back is safe, it contains the call too
    [InlineData(0.02, 0.45, false)]  // only the ringtone reached the Teams track
    [InlineData(0.000, null, false)]
    [InlineData(0.10, null, true)]
    public void Teams_track_choice(double app, double? system, bool expected) =>
        Assert.Equal(expected, Processing.AppTrackHeardCall(app, system));

    [Fact]
    public async Task Notes_failure_needs_attention_and_retry_resumes_without_retranscribing()
    {
        var folder = Record(appHasSound: true);
        var asr = new FakeTranscription();
        var notes = new FlakyNotes();
        var first = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes, notes));
        Assert.Equal(MeetingState.NeedsAttention, first.State);
        Assert.Contains("Ollama isn't running", first.LastError);
        Assert.True(File.Exists(first.MeetingFile)); // the Transcript is not held hostage by the Notes

        notes.Fail = false;
        var second = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes, notes));
        Assert.Equal(MeetingState.Done, second.State);
        Assert.Equal(2, asr.Files.Count); // transcribed once
        Assert.EndsWith("-budget-sync.md", second.MeetingFile);
        Assert.False(File.Exists(first.MeetingFile)); // the untouched first version was replaced
        Assert.Contains("## Summary\nWe met.", File.ReadAllText(second.MeetingFile!));
    }

    [Fact]
    public async Task Reprocessing_never_overwrites_a_file_the_user_edited()
    {
        var folder = Record(appHasSound: true);
        var asr = new FakeTranscription();
        var first = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes));
        File.AppendAllText(first.MeetingFile!, "\nMy own notes.\n");

        Processing.PrepareReprocess(folder);
        var second = await Processing.RunAsync(folder, new ProcessingOptions(asr, Notes));
        Assert.NotEqual(first.MeetingFile, second.MeetingFile);
        Assert.EndsWith("-meeting-2.md", second.MeetingFile);
        Assert.Contains("My own notes.", File.ReadAllText(first.MeetingFile!));
    }

    [Fact]
    public void Recovery_closes_interrupted_recordings_and_requeues_processing()
    {
        var crashed = MeetingFolder.Create(Meetings, DateTimeOffset.Now.AddMinutes(-30), null, null, false);
        using (var w = new TrackWriter(crashed.TrackPath(Track.Mic), () => TimeSpan.Zero)) w.Write(new float[16_000]);
        var midway = Record(appHasSound: true);
        var done = Record(appHasSound: true);
        done.UpdateStatus(s => s.State = MeetingState.Done);

        var queue = new MeetingStore(Meetings).Recover();
        Assert.Equal(new[] { crashed.Id, midway.Id }.Order(), queue.Select(f => f.Id).Order());
        var status = crashed.ReadStatus();
        Assert.True(status.Interrupted);
        Assert.Equal(MeetingState.Processing, status.State);
        Assert.NotNull(status.EndedAt);
    }

    [Fact]
    public async Task Imported_mixed_file_is_labelled_speaker()
    {
        var folder = MeetingFolder.Create(Meetings, DateTimeOffset.Now, null, null, false);
        AudioFile.WriteWav(folder.TrackPath(Track.Mixed, ".wav"), new float[16_000]);
        folder.UpdateStatus(s => s.State = MeetingState.Processing);
        var status = await Processing.RunAsync(folder, new ProcessingOptions(new FakeTranscription(), Notes, KeepAudio: false));
        Assert.Contains("**Speaker:** Hello from the mixed track.", File.ReadAllText(status.MeetingFile!));
        Assert.Empty(folder.TrackFiles(Track.Mixed));
    }
}
