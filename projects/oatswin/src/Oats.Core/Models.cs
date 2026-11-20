using System.Text.Json;
using System.Text.Json.Serialization;

namespace Oats.Core;

/// <summary>A stretch of speech in one track, in seconds from the start of the track.</summary>
public sealed record TimedSegment(double Start, double End, string Text, string? Speaker = null);

/// <summary>One Transcript line: a speaker's consecutive speech starting at <see cref="Start"/> seconds into the Meeting.</summary>
public sealed record Turn(double Start, string? Speaker, string Text);

/// <summary>
/// The audio tracks a Meeting can hold. <c>Mic</c> is You. <c>App</c> is the Teams process tree (process loopback),
/// <c>System</c> is everything the PC plays (endpoint loopback). Processing picks App when it carries sound, else System,
/// as the Them track. <c>Mixed</c> is a single imported file.
/// </summary>
public enum Track { Mic, System, App, Mixed }

public enum MeetingState { Recording, Processing, Done, NeedsAttention }

public enum Step { Transcribe, Merge, Notes }

public static class TrackNames
{
    public static string FileStem(this Track t) => t switch
    {
        Track.Mic => "mic",
        Track.System => "system",
        Track.App => "app",
        Track.Mixed => "mixed",
        _ => throw new ArgumentOutOfRangeException(nameof(t)),
    };
}

/// <summary>Contents of <c>meeting.json</c> in a Meeting's working folder.</summary>
public sealed class MeetingStatus
{
    public string Id { get; set; } = "";
    public DateTimeOffset StartedAt { get; set; }
    public DateTimeOffset? EndedAt { get; set; }
    /// <summary>Length of the longest track in seconds, known after transcription.</summary>
    public double? Duration { get; set; }
    public MeetingState State { get; set; } = MeetingState.Recording;
    public List<Step> CompletedSteps { get; set; } = [];
    /// <summary>BCP 47 code or null for automatic detection.</summary>
    public string? Language { get; set; }
    /// <summary>User-set title (rename). Wins over the Notes title.</summary>
    public string? Title { get; set; }
    /// <summary>Detected meeting app, lowercase (e.g. <c>teams</c>).</summary>
    public string? App { get; set; }
    public string? TranscriptionBackend { get; set; }
    public string? NotesBackend { get; set; }
    /// <summary>Which track was transcribed as Them: <c>app</c> or <c>system</c>.</summary>
    public string? ThemSource { get; set; }
    public string? LastError { get; set; }
    public string? MeetingFile { get; set; }
    public string? MeetingFileHash { get; set; }
    public bool Interrupted { get; set; }
    /// <summary>Set when the recording was started by Teams call detection, so the end of the call stops it.</summary>
    public bool AutoStarted { get; set; }

    /// <summary>Best known length: transcribed duration, else wall-clock from start to end.</summary>
    [JsonIgnore]
    public double? Length => Duration ?? (EndedAt is { } end ? (end - StartedAt).TotalSeconds : null);
}

/// <summary>Output of the Notes step: Notes markdown, an optional title, and the Vocabulary-corrected Transcript if any.</summary>
public sealed record Notes(string? Title, string Markdown, List<Turn>? Turns = null)
{
    /// <summary>Parses a model reply whose first line may be <c>Title: ...</c>.</summary>
    public static Notes FromReply(string reply)
    {
        var lines = reply.Trim().Split('\n').ToList();
        string? title = null;
        if (lines.Count > 0 && lines[0].TrimStart().StartsWith("title:", StringComparison.OrdinalIgnoreCase))
        {
            var first = lines[0].TrimStart();
            title = first[6..].Trim().Trim('"', '*', '#', ' ');
            lines.RemoveAt(0);
        }
        return new Notes(string.IsNullOrWhiteSpace(title) ? null : title, string.Join("\n", lines).Trim());
    }
}

public static class Json
{
    public static readonly JsonSerializerOptions Options = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
    };
}

public static class TurnText
{
    /// <summary><c>[HH:MM:SS] You: text</c> lines, the Transcript as plain text for a Notes backend.</summary>
    public static string PlainText(this IEnumerable<Turn> turns) =>
        string.Join("\n", turns.Select(t => $"[{MeetingFileWriter.Timestamp(t.Start)}] {(t.Speaker is null ? "" : t.Speaker + ": ")}{t.Text}"));
}
