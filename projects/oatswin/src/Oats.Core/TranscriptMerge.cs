using System.Text;

namespace Oats.Core;

/// <summary>
/// Step 2: merge per-track segments by time into turns and drop Mic-track echoes of Them.
/// When you take a call on speakers, the mic hears the other side a little later and quieter. A Mic segment whose
/// words mostly appear in overlapping Them speech is that echo, not you.
/// </summary>
public static class TranscriptMerge
{
    /// <summary>Same-speaker segments closer than this are joined into one turn.</summary>
    public const double JoinGap = 2;
    /// <summary>How far around a mic segment to look for the Them speech it might echo.</summary>
    public const double EchoWindow = 1.5;
    /// <summary>Share of a mic segment's words found in overlapping Them speech above which it is echo.</summary>
    public const double EchoOverlap = 0.6;

    public static List<Turn> Merge(IReadOnlyList<TimedSegment> mic, IReadOnlyList<TimedSegment> them)
    {
        var items = mic.Where(s => !IsEcho(s, them)).Select(s => (s, (string?)"You"))
            .Concat(them.Select(s => (s, (string?)"Them")))
            .OrderBy(x => x.s.Start)
            .ToList();
        return Join(items);
    }

    /// <summary>Without speaker labels, consecutive segments may be different people, so each stays its own line.</summary>
    public static List<Turn> Mixed(IReadOnlyList<TimedSegment> segments, bool separatesSpeakers)
    {
        var sorted = segments.OrderBy(s => s.Start).ToList();
        if (!separatesSpeakers)
            return sorted.Select(s => s.Text.Trim()).Zip(sorted)
                .Where(x => x.First.Length > 0)
                .Select(x => new Turn(x.Second.Start, "Speaker", x.First))
                .ToList();
        return Join(sorted.Select(s => (s, (string?)(s.Speaker ?? "Speaker"))).ToList());
    }

    public static bool IsEcho(TimedSegment segment, IReadOnlyList<TimedSegment> them)
    {
        var words = NormalizedWords(segment.Text);
        if (words.Count == 0) return true;
        var heard = them
            .Where(t => t.Start <= segment.End + EchoWindow && t.End >= segment.Start - EchoWindow)
            .SelectMany(t => NormalizedWords(t.Text))
            .ToHashSet();
        if (heard.Count == 0) return false;
        // The mic hears Them quieter, so its words are often slightly off ("pig" for "pic").
        int shared = words.Count(w => heard.Contains(w)
            || (w.Length >= 3 && heard.Any(h => EditDistance(w, h) <= Math.Max(1, w.Length / 4))));
        return (double)shared / words.Count >= EchoOverlap;
    }

    public static int EditDistance(string a, string b)
    {
        var row = new int[b.Length + 1];
        for (int j = 0; j <= b.Length; j++) row[j] = j;
        for (int i = 0; i < a.Length; i++)
        {
            int previous = row[0];
            row[0] = i + 1;
            for (int j = 0; j < b.Length; j++)
            {
                int current = row[j + 1];
                row[j + 1] = Math.Min(Math.Min(row[j + 1] + 1, row[j] + 1), previous + (a[i] == b[j] ? 0 : 1));
                previous = current;
            }
        }
        return row[b.Length];
    }

    static List<Turn> Join(List<(TimedSegment Segment, string? Speaker)> items)
    {
        var turns = new List<Turn>();
        double lastEnd = double.NegativeInfinity;
        foreach (var (segment, speaker) in items)
        {
            var text = segment.Text.Trim();
            if (text.Length == 0) continue;
            if (turns.Count > 0 && turns[^1].Speaker == speaker && segment.Start - lastEnd <= JoinGap)
                turns[^1] = turns[^1] with { Text = turns[^1].Text + " " + text };
            else
                turns.Add(new Turn(segment.Start, speaker, text));
            lastEnd = Math.Max(segment.End, segment.Start);
        }
        return turns;
    }

    /// <summary>Lowercased letter-or-digit words.</summary>
    public static List<string> NormalizedWords(string text)
    {
        var words = new List<string>();
        var current = new StringBuilder();
        foreach (var ch in text.ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(ch)) current.Append(ch);
            else if (current.Length > 0) { words.Add(current.ToString()); current.Clear(); }
        }
        if (current.Length > 0) words.Add(current.ToString());
        return words;
    }
}
