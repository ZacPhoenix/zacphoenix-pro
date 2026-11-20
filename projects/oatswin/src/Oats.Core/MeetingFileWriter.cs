using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Oats.Core;

/// <summary>
/// Builds and names the Meeting file, following the OpenOats Meeting Format (<c>schema: openoats/v1</c>), so files from
/// this app and from OpenOats on a Mac sit side by side in one Obsidian vault.
/// </summary>
public static partial class MeetingFileWriter
{
    public sealed record Content(
        string MeetingId,
        string? Title,
        DateTimeOffset StartedAt,
        double Duration,
        string? Language,
        string? Engine,
        string? App,
        bool Interrupted,
        string? Notes,
        IReadOnlyList<Turn> Turns,
        string DefaultSpeaker,
        string? Recorder = null);

    /// <summary>Title when the Notes backend gave none: the Meeting's date and time.</summary>
    public static string FallbackTitle(DateTimeOffset date) =>
        date.ToLocalTime().ToString("MMM d, yyyy, h:mm tt", CultureInfo.InvariantCulture);

    public static string Markdown(Content c)
    {
        var title = c.Title ?? FallbackTitle(c.StartedAt);
        var speakers = new List<string>();
        foreach (var t in c.Turns)
            if (t.Speaker is { } s && !speakers.Contains(s)) speakers.Add(s);

        var lines = new List<string>
        {
            "---", "schema: openoats/v1", $"title: {Quote(title)}", $"date: {Iso(c.StartedAt)}",
            $"duration: {Minutes(c.Duration)}", "participants:",
        };
        lines.AddRange((speakers.Count == 0 ? [c.DefaultSpeaker] : speakers).Select(s => $"  - {s}"));
        if (c.Recorder is { Length: > 0 } recorder) lines.Add($"recorder: {Quote(recorder)}");
        if (c.Language is { } language) lines.Add($"language: {language}");
        if (c.Engine is { } engine) lines.Add($"engine: {engine}");
        if (c.App is { } app) lines.Add($"app: {app}");
        if (c.Interrupted) lines.Add("interrupted: true");
        lines.AddRange([$"x_openoats_meeting: {Quote(c.MeetingId)}", "x_recorded_with: oatswin", "---", "", $"# {title}", ""]);
        if (c.Notes?.Trim() is { Length: > 0 } notes) lines.AddRange([notes, ""]);
        lines.AddRange(["## Transcript", ""]);
        foreach (var turn in c.Turns)
        {
            var label = turn.Speaker is null ? "" : $" **{turn.Speaker}:**";
            lines.AddRange([$"[{Timestamp(turn.Start)}]{label} {turn.Text}", ""]);
        }
        return string.Join("\n", lines);
    }

    /// <summary><c>YYYY-MM-DD-HHMM-kebab-title</c>; slug <c>meeting</c> when there is no title.</summary>
    public static string BaseName(string? title, DateTimeOffset startedAt) =>
        $"{startedAt.ToLocalTime().ToString("yyyy-MM-dd-HHmm", CultureInfo.InvariantCulture)}-{Slug(title ?? "")}";

    /// <summary>First free <c>base.md</c>, <c>base-2.md</c>, ... in <paramref name="folder"/>.</summary>
    public static string FreePath(string baseName, string folder)
    {
        var path = Path.Combine(folder, baseName + ".md");
        for (int n = 2; File.Exists(path); n++) path = Path.Combine(folder, $"{baseName}-{n}.md");
        return path;
    }

    /// <summary>Where a re-processed Meeting file goes when the user edited <paramref name="edited"/>: a <c>-2</c> sibling.</summary>
    public static string SiblingPath(string edited)
    {
        var folder = Path.GetDirectoryName(edited)!;
        var stem = Path.GetFileNameWithoutExtension(edited);
        var m = SuffixRegex().Match(stem);
        if (m.Success && File.Exists(Path.Combine(folder, stem[..m.Index] + ".md"))) stem = stem[..m.Index];
        return FreePath(stem, folder);
    }

    public static string Hash(byte[] data) => Convert.ToHexStringLower(SHA256.HashData(data));

    public static byte[] Encode(string markdown) => new UTF8Encoding(false).GetBytes(markdown.Replace("\r\n", "\n"));

    /// <summary>A Meeting's length in whole minutes, at least 1.</summary>
    public static int Minutes(double seconds) => Math.Max(1, (int)Math.Round(seconds / 60, MidpointRounding.AwayFromZero));

    public static string Timestamp(double t)
    {
        int s = (int)Math.Floor(Math.Max(0, t));
        return $"{s / 3600:00}:{s % 3600 / 60:00}:{s % 60:00}";
    }

    public static string Iso(DateTimeOffset d) => d.ToLocalTime().ToString("yyyy-MM-dd'T'HH:mm:sszzz", CultureInfo.InvariantCulture);

    public static string Quote(string value) =>
        "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", " ").Replace("\n", " ") + "\"";

    public static string Slug(string text)
    {
        var sb = new StringBuilder();
        foreach (var ch in text.ToLowerInvariant())
            sb.Append(ch < 128 && char.IsLetterOrDigit(ch) ? ch : '-');
        var result = new StringBuilder();
        foreach (var part in sb.ToString().Split('-', StringSplitOptions.RemoveEmptyEntries))
        {
            if (result.Length + part.Length + 1 > 60) break;
            if (result.Length > 0) result.Append('-');
            result.Append(part);
        }
        return result.Length == 0 ? "meeting" : result.ToString();
    }

    [GeneratedRegex(@"-\d+$")]
    private static partial Regex SuffixRegex();
}
