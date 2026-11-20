using Oats.Core;
using Oats.Core.Audio;
using Oats.Core.Backends;

namespace Oats.Core.Tests;

public class TranscriptMergeTests
{
    [Fact]
    public void Drops_mic_echo_of_them_and_keeps_your_speech()
    {
        var them = new List<TimedSegment> { new(1.0, 4.0, "Can you send the quarterly report by Friday?") };
        var mic = new List<TimedSegment>
        {
            new(1.1, 4.1, "can you send the quarterly reports by friday"), // echo through speakers, slightly misheard
            new(5.0, 6.5, "Yes, I'll send it Thursday."),
        };
        var turns = TranscriptMerge.Merge(mic, them);
        Assert.Equal(2, turns.Count);
        Assert.Equal(("Them", 1.0), (turns[0].Speaker!, turns[0].Start));
        Assert.Equal("You", turns[1].Speaker);
        Assert.Equal("Yes, I'll send it Thursday.", turns[1].Text);
    }

    [Fact]
    public void Keeps_you_when_both_talk_at_once_about_different_things()
    {
        var them = new List<TimedSegment> { new(1, 3, "The budget is approved") };
        var mic = new List<TimedSegment> { new(1.5, 3, "Sorry, my camera froze") };
        Assert.Equal(2, TranscriptMerge.Merge(mic, them).Count);
    }

    [Fact]
    public void Joins_same_speaker_segments_within_gap_only()
    {
        var them = new List<TimedSegment> { new(0, 2, "First."), new(3, 4, "Second."), new(10, 11, "Third.") };
        var turns = TranscriptMerge.Merge([], them);
        Assert.Equal(["First. Second.", "Third."], turns.Select(t => t.Text));
    }

    [Fact]
    public void Mixed_without_speakers_keeps_each_segment_on_its_own_line()
    {
        var turns = TranscriptMerge.Mixed([new(0, 1, " a "), new(1, 2, "b"), new(2, 3, "  ")], separatesSpeakers: false);
        Assert.Equal(["a", "b"], turns.Select(t => t.Text));
        Assert.All(turns, t => Assert.Equal("Speaker", t.Speaker));
    }
}

public class MeetingFileWriterTests
{
    [Theory]
    [InlineData("Q1 Launch Planning", "q1-launch-planning")]
    [InlineData("Réunion: équipe / produit", "r-union-quipe-produit")]
    [InlineData("日本語", "meeting")]
    [InlineData("", "meeting")]
    public void Slug(string title, string expected) => Assert.Equal(expected, MeetingFileWriter.Slug(title));

    [Fact]
    public void Slug_is_at_most_60_characters()
    {
        var slug = MeetingFileWriter.Slug(string.Join(" ", Enumerable.Repeat("planning", 20)));
        Assert.True(slug.Length <= 60);
        Assert.DoesNotContain("--", slug);
    }

    [Fact]
    public void Timestamp_and_minutes()
    {
        Assert.Equal("01:02:03", MeetingFileWriter.Timestamp(3723.9));
        Assert.Equal(1, MeetingFileWriter.Minutes(10));
        Assert.Equal(47, MeetingFileWriter.Minutes(47 * 60 + 20));
    }

    [Fact]
    public void Markdown_follows_the_openoats_format()
    {
        var start = new DateTimeOffset(2026, 11, 20, 14, 0, 0, TimeSpan.Zero);
        var md = MeetingFileWriter.Markdown(new("id-1", "Say \"yes\"", start, 1900, "en", "parakeet-tdt-0.6b-v3", "teams", true,
            "## Summary\nWe agreed.", [new Turn(0, "You", "Hi."), new Turn(3.5, "Them", "Hello.")], "You", "Zac"));
        Assert.StartsWith("---\nschema: openoats/v1\ntitle: \"Say \\\"yes\\\"\"\n", md);
        Assert.Contains("duration: 32\n", md);
        Assert.Contains("participants:\n  - You\n  - Them\n", md);
        Assert.Contains("app: teams\n", md);
        Assert.Contains("interrupted: true\n", md);
        Assert.Contains("# Say \"yes\"\n\n## Summary\nWe agreed.\n\n## Transcript\n\n[00:00:00] **You:** Hi.\n\n[00:00:03] **Them:** Hello.", md);
        Assert.DoesNotContain("\r", md);
    }

    [Fact]
    public void Free_and_sibling_paths()
    {
        var dir = Directory.CreateTempSubdirectory().FullName;
        try
        {
            var first = MeetingFileWriter.FreePath("2026-11-20-1400-sync", dir);
            File.WriteAllText(first, "x");
            var second = MeetingFileWriter.FreePath("2026-11-20-1400-sync", dir);
            Assert.EndsWith("sync-2.md", second);
            File.WriteAllText(second, "x");
            Assert.EndsWith("sync-3.md", MeetingFileWriter.SiblingPath(second));
        }
        finally { Directory.Delete(dir, true); }
    }
}

public class NotesWriterTests
{
    sealed class FakeNotes(Func<string, string, string> reply, int context = 32_000) : INotesBackend
    {
        public List<string> Users { get; } = [];
        public string Name => "fake";
        public int ContextTokens => context;
        public Task<string> CompleteAsync(string system, string user, CancellationToken ct)
        {
            Users.Add(user);
            return Task.FromResult(reply(system, user));
        }
    }

    [Fact]
    public void Parses_title_line()
    {
        var n = Notes.FromReply("Title: **Roadmap Sync**\n## Summary\nDone.");
        Assert.Equal("Roadmap Sync", n.Title);
        Assert.Equal("## Summary\nDone.", n.Markdown);
    }

    [Fact]
    public void Omits_empty_sections()
    {
        var md = NotesWriter.OmitEmptySections("## Summary\nText\n\n## Decisions\n- None\n\n## Action Items\n- [ ] Ship [owner:: You]");
        Assert.DoesNotContain("Decisions", md);
        Assert.Contains("## Action Items", md);
    }

    [Fact]
    public void Chunks_respect_the_limit()
    {
        var text = string.Join("\n", Enumerable.Range(0, 100).Select(i => $"line {i} " + new string('x', 40)));
        var chunks = NotesWriter.Chunks(text, 500);
        Assert.All(chunks, c => Assert.True(c.Length <= 500));
        Assert.Equal(text, string.Join("\n", chunks));
    }

    [Fact]
    public async Task Long_transcripts_are_summarised_in_parts_then_combined()
    {
        var turns = Enumerable.Range(0, 400).Select(i => new Turn(i * 5, i % 2 == 0 ? "You" : "Them", "We discussed item number " + i + " in depth today.")).ToList();
        var backend = new FakeNotes((_, user) => user.StartsWith("Here is part") ? "## Summary\nPart." : "Title: Long one\n## Summary\nAll of it.", context: 4_000);
        var notes = await NotesWriter.WriteAsync(turns, backend);
        Assert.Equal("Long one", notes.Title);
        Assert.True(backend.Users.Count(u => u.StartsWith("Here is part")) > 1);
        Assert.StartsWith("Here is notes from consecutive parts", backend.Users[^1]);
    }

    [Fact]
    public async Task Vocabulary_correction_replaces_only_misheard_terms()
    {
        var turns = new List<Turn> { new(0, "Them", "We deploy on cooper netties next week."), new(5, "You", "Great, Kubernetes it is.") };
        var backend = new FakeNotes((system, _) => system.Contains("Vocabulary is")
            ? "Sure: [{\"from\": \"cooper netties\", \"to\": \"kubernetes\"}]"
            : "Title: Deploy\n## Summary\nDeploying.");
        var notes = await NotesWriter.WriteAsync(turns, backend, vocabulary: ["Kubernetes"]);
        Assert.Equal("We deploy on Kubernetes next week.", notes.Turns![0].Text);
        Assert.Equal("Great, Kubernetes it is.", notes.Turns[1].Text);
    }

    [Fact]
    public void Misheard_finds_the_span_that_sounds_like_the_term() =>
        Assert.Equal("an arai", NotesWriter.Misheard("arai", "Almarai", "we met an arai today"));
}

public class EndpointTests
{
    [Theory]
    [InlineData("https://api.openai.com/v1", "https://api.openai.com/v1/chat/completions", false)]
    [InlineData("https://openrouter.ai/api/v1/", "https://openrouter.ai/api/v1/chat/completions", false)]
    [InlineData("http://localhost:1234", "http://localhost:1234/v1/chat/completions", false)]
    [InlineData("https://generativelanguage.googleapis.com/v1beta/openai", "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", false)]
    [InlineData("http://localhost:11434/v1", "http://localhost:11434/api/chat", true)]
    public void OpenAI_compatible(string address, string url, bool ollama)
    {
        var e = new OpenAICompatibleNotes(address, null, null).Endpoint();
        Assert.Equal((url, ollama), (e!.Value.Url.ToString(), e.Value.Ollama));
    }

    [Theory]
    [InlineData(null, null)]
    [InlineData("https://api.anthropic.com/v1/messages", null)]
    [InlineData("https://proxy.example.com/v1", "https://proxy.example.com")]
    public void Anthropic_base_url(string? address, string? expected) => Assert.Equal(expected, AnthropicNotes.NormalizeBaseUrl(address));
}

public class CallDetectorTests
{
    [Fact]
    public void Starts_after_five_seconds_and_survives_a_short_mute()
    {
        var d = new CallDetector();
        var t = DateTimeOffset.UnixEpoch;
        Assert.Null(d.Update(true, t));
        Assert.Null(d.Update(true, t.AddSeconds(4)));
        Assert.Equal(CallEvent.Started, d.Update(true, t.AddSeconds(5)));
        Assert.Null(d.Update(true, t.AddSeconds(6)));
        Assert.Null(d.Update(false, t.AddSeconds(10)));
        Assert.Null(d.Update(false, t.AddSeconds(25)));   // 15 s off: still in the call
        Assert.Null(d.Update(true, t.AddSeconds(26)));    // back on the mic
        Assert.Null(d.Update(false, t.AddSeconds(30)));
        Assert.Equal(CallEvent.Ended, d.Update(false, t.AddSeconds(50)));
        Assert.False(d.InCall);
    }

    [Fact]
    public void A_quick_mic_check_is_not_a_call()
    {
        var d = new CallDetector();
        var t = DateTimeOffset.UnixEpoch;
        d.Update(true, t);
        d.Update(true, t.AddSeconds(3));
        Assert.Null(d.Update(false, t.AddSeconds(4)));
        Assert.Null(d.Update(true, t.AddSeconds(5)));
        Assert.Null(d.Update(true, t.AddSeconds(9)));
    }
}

public class AudioTests
{
    [Fact]
    public void Resamples_48k_to_16k_and_keeps_pitch()
    {
        var input = Enumerable.Range(0, 48_000).Select(i => (float)Math.Sin(2 * Math.PI * 440 * i / 48_000)).ToArray();
        var output = AudioFile.Resample(input, 48_000);
        Assert.Equal(16_000, output.Length);
        int crossings = 0;
        for (int i = 1000; i < 15_000; i++) if (output[i - 1] < 0 && output[i] >= 0) crossings++;
        Assert.InRange(crossings, 380, 390); // 440 Hz over 0.875 s = 385 upward crossings
    }

    [Fact]
    public void Converts_24_bit_and_float_stereo_to_mono()
    {
        byte[] pcm24 = [0x00, 0x00, 0x40, 0x00, 0x00, 0xC0]; // +0.5, -0.5
        var mono = new float[1];
        SampleConverter.ToMono(pcm24, new CaptureFormat(48_000, 2, 24, false), mono);
        Assert.Equal(0f, mono[0], 3);

        var f = new byte[8];
        BitConverter.TryWriteBytes(f.AsSpan(0), 0.25f);
        BitConverter.TryWriteBytes(f.AsSpan(4), 0.75f);
        SampleConverter.ToMono(f, new CaptureFormat(48_000, 2, 32, true), mono);
        Assert.Equal(0.5f, mono[0], 5);
    }

    [Fact]
    public void Track_writer_pads_silence_to_the_shared_clock_and_is_readable_while_open()
    {
        var dir = Directory.CreateTempSubdirectory().FullName;
        try
        {
            var now = TimeSpan.FromSeconds(2);
            var path = Path.Combine(dir, "system.pcm");
            using var writer = new TrackWriter(path, () => now);
            writer.Write(new float[1600]);                    // first packet at 2 s: 1.9 s of silence before it
            Assert.Equal(2.0, writer.Written.TotalSeconds, 3);
            now = TimeSpan.FromSeconds(10);                    // the device went quiet for 8 s
            writer.PadToClock(TimeSpan.FromSeconds(1));
            Assert.Equal(9.0, writer.Written.TotalSeconds, 3);
            writer.Flush();
            Assert.Equal(9.0, AudioFile.DurationSeconds(path), 3); // a crash now loses nothing that was flushed
            Assert.Equal(9 * 16_000, AudioFile.ReadMono16k(path).Length);
        }
        finally { Directory.Delete(dir, true); }
    }

    [Fact]
    public void Wav_round_trip()
    {
        var dir = Directory.CreateTempSubdirectory().FullName;
        try
        {
            var samples = Enumerable.Range(0, 16_000).Select(i => (float)Math.Sin(i / 10.0) * 0.5f).ToArray();
            var wav = Path.Combine(dir, "a.wav");
            AudioFile.WriteWav(wav, samples);
            var back = AudioFile.ReadMono16k(wav);
            Assert.Equal(samples.Length, back.Length);
            Assert.Equal(samples[123], back[123], 3);
            Assert.True(AudioFile.ActiveShare(back) > 0.9);
            Assert.Equal(0, AudioFile.ActiveShare(new float[16_000]));
        }
        finally { Directory.Delete(dir, true); }
    }
}
