namespace Oats.Core.Backends;

/// <summary>Turns one track's audio file into timed segments.</summary>
public interface ITranscriptionBackend
{
    /// <summary>Short engine name written to the Meeting file's <c>engine</c> field, e.g. <c>parakeet-v3</c>.</summary>
    string Name { get; }
    /// <summary>True if the backend labels speakers itself (used only for single mixed-file imports).</summary>
    bool SeparatesSpeakers => false;
    /// <param name="audioPath">A <c>.pcm</c> (16 kHz mono s16le), <c>.wav</c>, or any format <see cref="Audio.AudioFile.ExternalDecoder"/> reads.</param>
    /// <param name="language">BCP 47 code, or null for the backend's own detection.</param>
    Task<List<TimedSegment>> TranscribeAsync(string audioPath, string? language, IProgress<double>? progress, CancellationToken ct);
    /// <summary>Frees loaded models. Processing calls it after the transcribe step.</summary>
    void Unload() { }
}

/// <summary>A language model that only ever sees text: system + user prompt in, text out.</summary>
public interface INotesBackend
{
    string Name { get; }
    /// <summary>Approximate context size in tokens, used to decide when to summarise in pieces.</summary>
    int ContextTokens { get; }
    Task<string> CompleteAsync(string system, string user, CancellationToken ct);
}

public enum TranscriptionType { OnDevice, OpenAIStyle }

public enum NotesType { None, OpenAICompatible, Anthropic }

/// <summary>A named starting configuration for a backend: fills in its address and default model.</summary>
public sealed record Preset<TKind>(string Name, TKind Type, string? Address, string? Model, bool NeedsKey);

public static class Presets
{
    public static readonly IReadOnlyList<Preset<NotesType>> Notes =
    [
        new("None", NotesType.None, null, null, false),
        new("Anthropic", NotesType.Anthropic, "https://api.anthropic.com", "claude-opus-5-5", true),
        new("OpenAI", NotesType.OpenAICompatible, "https://api.openai.com/v1", "gpt-4.1-mini", true),
        new("OpenRouter", NotesType.OpenAICompatible, "https://openrouter.ai/api/v1", "google/gemini-3-flash-preview", true),
        new("Gemini", NotesType.OpenAICompatible, "https://generativelanguage.googleapis.com/v1beta/openai", "gemini-3-flash-preview", true),
        new("Ollama", NotesType.OpenAICompatible, "http://localhost:11434/v1", "qwen3:8b", false),
        new("LM Studio", NotesType.OpenAICompatible, "http://localhost:1234/v1", null, false),
        new("llama.cpp", NotesType.OpenAICompatible, "http://localhost:8080/v1", null, false),
        new("Custom (OpenAI-compatible)", NotesType.OpenAICompatible, "", null, false),
    ];

    public static readonly IReadOnlyList<Preset<TranscriptionType>> Transcription =
    [
        new("On-device", TranscriptionType.OnDevice, null, null, false),
        new("OpenAI", TranscriptionType.OpenAIStyle, "https://api.openai.com/v1", "whisper-1", true),
        new("Groq", TranscriptionType.OpenAIStyle, "https://api.groq.com/openai/v1", "whisper-large-v3-turbo", true),
        new("Self-hosted Whisper", TranscriptionType.OpenAIStyle, "http://localhost:8000/v1", "whisper-1", false),
    ];
}
