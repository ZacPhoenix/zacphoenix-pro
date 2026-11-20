using System.Text.Json;
using System.Text.RegularExpressions;
using Oats.Core.Backends;

namespace Oats.Core;

public sealed class NotesEmptyException() : Exception(
    "The model returned empty notes. Thinking mode may be enabled on the server, or the token budget ran out before the notes were written.");

/// <summary>Step 3: Vocabulary correction, then Notes from the notes prompt, in pieces when the Transcript exceeds the model's context.</summary>
public static class NotesWriter
{
    public const string DefaultPrompt = """
        You write meeting notes in Markdown from a meeting transcript. "You" is the person who recorded the meeting; "Them" is everyone else.
        Write in the language of the transcript, using these sections in this order:

        ## Summary
        One to three short paragraphs, past tense, no bullet points: what was discussed and decided.

        ## Decisions
        A flat bullet list of decisions made.

        ## Action Items
        One line per task: `- [ ] task [owner:: You]` (owner only if known, You or Them; add `[due:: YYYY-MM-DD]` only if a date was set).

        ## Open Questions
        A bullet list of unresolved questions that need follow-up.

        Leave out any section that would be empty. Don't invent facts.
        """;

    /// <summary>Tokens kept free for the model's reply.</summary>
    const int ReplyTokens = 2048;

    public static async Task<Notes> WriteAsync(IReadOnlyList<Turn> turns, INotesBackend backend, string? prompt = null,
        IReadOnlyList<string>? vocabulary = null, CancellationToken ct = default)
    {
        vocabulary ??= [];
        var corrected = await CorrectVocabularyAsync(turns, vocabulary, backend, ct);
        var system = (string.IsNullOrWhiteSpace(prompt) ? DefaultPrompt : prompt)
            + "\n\nStart your reply with one line `Title: <short meeting title>`, then the notes.";
        if (vocabulary.Count > 0) system += $" Spell these names and terms exactly: {string.Join(", ", vocabulary)}.";

        var notes = Notes.FromReply(await WriteAsync(corrected.PlainText(), true, system, backend, 0, ct));
        notes = notes with { Markdown = OmitEmptySections(notes.Markdown) };
        if (notes.Title is null && notes.Markdown.StartsWith("# ", StringComparison.Ordinal))
        {
            // a model that headed its notes with the title
            var split = notes.Markdown.Split('\n', 2);
            notes = new Notes(split[0][2..].Trim(), split.Length > 1 ? split[1].Trim() : "");
        }
        if (notes.Markdown.Length == 0) throw new NotesEmptyException();
        return notes with { Turns = corrected.SequenceEqual(turns) ? null : corrected.ToList() };
    }

    /// <summary>Asks only for misheard-term replacements and applies them in code, so the Transcript otherwise stays verbatim.</summary>
    public static async Task<IReadOnlyList<Turn>> CorrectVocabularyAsync(IReadOnlyList<Turn> turns, IReadOnlyList<string> vocabulary,
        INotesBackend backend, CancellationToken ct = default)
    {
        if (vocabulary.Count == 0 || turns.Count == 0) return turns;
        var system = $$"""
            You fix speech-recognition mistakes in names and terms. The Vocabulary is: {{string.Join(", ", vocabulary)}}.
            Find places in the transcript where a Vocabulary term was written wrongly: misspelled, merged, or heard as other words that sound like it (often ordinary words, e.g. "cooper netties" for "Kubernetes"). Reply with only a JSON array like [{"from": "exact wrong text as it appears", "to": "Vocabulary term"}], or [] if there are none. "from" is only the misheard words, never the correct words around them. Never suggest any other change.
            """;
        var replacements = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var piece in Chunks(turns.PlainText(), Budget(system, backend)))
        {
            var reply = await backend.CompleteAsync(system, piece, ct);
            int open = reply.IndexOf('['), close = reply.LastIndexOf(']');
            if (open < 0 || close <= open) continue;
            List<Dictionary<string, string>>? pairs;
            try { pairs = JsonSerializer.Deserialize<List<Dictionary<string, string>>>(reply[open..(close + 1)]); }
            catch (JsonException) { continue; }
            foreach (var pair in pairs ?? [])
            {
                var from = pair.GetValueOrDefault("from")?.Trim();
                var to = pair.GetValueOrDefault("to") ?? "";
                var term = vocabulary.FirstOrDefault(v => string.Equals(v, to, StringComparison.OrdinalIgnoreCase));
                if (string.IsNullOrEmpty(from) || term is null) continue;
                var misheard = Misheard(from, term, piece);
                if (misheard is not null && misheard != term) replacements[misheard] = term;
            }
        }
        if (replacements.Count == 0) return turns;
        return turns.Select(turn =>
        {
            var text = turn.Text;
            foreach (var (from, to) in replacements.OrderByDescending(r => r.Key.Length))
            {
                var pattern = @"(?<![\p{L}\p{N}])" + Regex.Escape(from) + @"(?![\p{L}\p{N}])";
                text = Regex.Replace(text, pattern, to.Replace("$", "$$"), RegexOptions.IgnoreCase);
            }
            return turn with { Text = text };
        }).ToList();
    }

    /// <summary>
    /// The words to replace with <paramref name="term"/>: <paramref name="from"/> if it sounds like the term, else the run of
    /// words in or around it that sounds most like it. Null if nothing does, so a replacement can't swallow neighbouring words.
    /// </summary>
    public static string? Misheard(string from, string term, string text)
    {
        if (Similarity(from, term) >= 0.6) return from;
        static List<string> Words(string s) => Regex.Split(s, @"[^\p{L}\p{N}']+").Where(w => w.Length > 0).ToList();
        var all = Words(text);
        var target = Words(from).Select(w => w.ToLowerInvariant()).ToList();
        if (target.Count == 0 || all.Count < target.Count) return null;
        (string Span, double Score)? best = null;
        for (int start = 0; start <= all.Count - target.Count; start++)
        {
            if (!all.Skip(start).Take(target.Count).Select(w => w.ToLowerInvariant()).SequenceEqual(target)) continue;
            int end = start + target.Count;
            for (int lo = Math.Max(0, start - 1); lo < end; lo++)
                for (int hi = Math.Max(lo, start) + 1; hi <= Math.Min(all.Count, end + 1); hi++)
                {
                    var span = string.Join(" ", all.Skip(lo).Take(hi - lo));
                    var score = Similarity(span, term);
                    if (score >= 0.6 && score > (best?.Score ?? 0)) best = (span, score);
                }
        }
        return best?.Span;
    }

    /// <summary>1 for the same letters, 0 for nothing in common. Doubled letters count once and y counts as i.</summary>
    public static double Similarity(string a, string b)
    {
        static string Letters(string s)
        {
            var chars = new List<char>();
            foreach (var c in s.ToLowerInvariant())
            {
                if (!char.IsLetter(c)) continue;
                var x = c == 'y' ? 'i' : c;
                if (chars.Count == 0 || chars[^1] != x) chars.Add(x);
            }
            return new string(chars.ToArray());
        }
        var p = Letters(a);
        var q = Letters(b);
        return 1 - (double)TranscriptMerge.EditDistance(p, q) / Math.Max(Math.Max(p.Length, q.Length), 1);
    }

    /// <summary>Summarises text in one call if it fits, else part by part and then combines the partial notes.</summary>
    static async Task<string> WriteAsync(string text, bool transcript, string system, INotesBackend backend, int depth, CancellationToken ct)
    {
        var what = transcript ? "the meeting transcript" : "notes from consecutive parts of one meeting";
        var pieces = depth < 3 ? Chunks(text, Budget(system, backend)) : [text];
        if (pieces.Count <= 1)
        {
            var ask = transcript ? "Write the meeting notes:" : "Combine them into one set of meeting notes, merging duplicates:";
            return await backend.CompleteAsync(system, $"Here is {what}:\n\n{text}\n\n{ask}", ct);
        }
        var parts = new List<string>();
        for (int i = 0; i < pieces.Count; i++)
            parts.Add(await backend.CompleteAsync(system,
                $"Here is part {i + 1} of {pieces.Count} of {what}:\n\n{pieces[i]}\n\nWrite the meeting notes for this part:", ct));
        return await WriteAsync(string.Join("\n\n---\n\n", parts), false, system, backend, depth + 1, ct);
    }

    /// <summary>Characters of input per call, at about 4 characters per token.</summary>
    public static int Budget(string system, INotesBackend backend) =>
        Math.Max(1000, backend.ContextTokens - ReplyTokens - system.Length / 4 - 100) * 4;

    /// <summary>Splits text at line breaks into pieces of at most <paramref name="maxChars"/> (hard-splitting overlong lines).</summary>
    public static List<string> Chunks(string text, int maxChars)
    {
        var pieces = new List<string>();
        var current = "";
        foreach (var raw in text.Split('\n'))
        {
            var line = raw;
            while (line.Length > maxChars)
            {
                if (current.Length > 0) { pieces.Add(current); current = ""; }
                pieces.Add(line[..maxChars]);
                line = line[maxChars..];
            }
            if (current.Length > 0 && current.Length + line.Length + 1 > maxChars) { pieces.Add(current); current = ""; }
            current = current.Length == 0 ? line : current + "\n" + line;
        }
        if (current.Length > 0) pieces.Add(current);
        return pieces;
    }

    /// <summary>Drops <c>##</c> sections with no content, or only "None" / "N/A".</summary>
    public static string OmitEmptySections(string markdown)
    {
        var sections = ("\n" + markdown).Split("\n## ");
        var kept = sections.Take(1).Concat(sections.Skip(1).Where(section =>
        {
            var split = section.Split('\n', 2);
            var body = split.Length > 1 ? split[1] : "";
            var bare = body.ToLowerInvariant().Trim('-', '*', '•', '.', ' ', '\n', '\t', '\r');
            return bare is not ("" or "none" or "n/a" or "na" or "nothing");
        }));
        return string.Join("\n## ", kept).Trim();
    }
}
