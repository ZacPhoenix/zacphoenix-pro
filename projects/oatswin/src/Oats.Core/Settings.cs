using System.Text.Json;
using Oats.Core.Backends;

namespace Oats.Core;

public enum TeamsCallMode { Ask, Auto, Off }

public enum ThemSourceMode
{
    /// <summary>Record the Teams process tree and the whole system; transcribe Teams if it carries sound.</summary>
    TeamsThenSystem,
    /// <summary>Record only what the default playback device plays.</summary>
    SystemOnly,
}

public enum LocalEngine
{
    /// <summary>Parakeet v3 for its 25 European languages (and automatic detection), Whisper for everything else.</summary>
    Auto,
    Parakeet,
    Whisper,
}

/// <summary>User settings, stored as JSON next to the Meetings. API keys are stored separately, encrypted.</summary>
public sealed class Settings
{
    public string NotesFolder { get; set; } = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "Meetings");
    /// <summary>BCP 47 code, or <c>auto</c>.</summary>
    public string Language { get; set; } = "auto";
    public List<string> Vocabulary { get; set; } = [];
    public bool RecordMic { get; set; } = true;
    public ThemSourceMode ThemSource { get; set; } = ThemSourceMode.TeamsThenSystem;
    public TeamsCallMode TeamsCalls { get; set; } = TeamsCallMode.Ask;
    public bool KeepAudio { get; set; } = true;
    public bool StartWithWindows { get; set; }
    public bool ConsentAcknowledged { get; set; }

    public string TranscriptionPreset { get; set; } = "On-device";
    public LocalEngine LocalEngine { get; set; } = LocalEngine.Auto;
    public string? TranscriptionAddress { get; set; }
    public string? TranscriptionModel { get; set; }

    public string NotesPreset { get; set; } = "None";
    public string? NotesAddress { get; set; }
    public string? NotesModel { get; set; }
    public int NotesContextTokens { get; set; } = 32_000;
    /// <summary>Null means <see cref="NotesWriter.DefaultPrompt"/>.</summary>
    public string? NotesPrompt { get; set; }

    public string? LanguageOrNull => string.IsNullOrWhiteSpace(Language) || Language == "auto" ? null : Language.Trim();

    public Preset<TranscriptionType> Transcription =>
        Presets.Transcription.FirstOrDefault(p => p.Name == TranscriptionPreset) ?? Presets.Transcription[0];

    public Preset<NotesType> Notes => Presets.Notes.FirstOrDefault(p => p.Name == NotesPreset) ?? Presets.Notes[0];

    public static Settings Load(string path)
    {
        try
        {
            if (File.Exists(path)) return JsonSerializer.Deserialize<Settings>(File.ReadAllText(path), Json.Options) ?? new();
        }
        catch (JsonException) { File.Copy(path, path + ".bad", overwrite: true); }
        return new Settings();
    }

    public void Save(string path)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        var temp = path + ".tmp";
        File.WriteAllText(temp, JsonSerializer.Serialize(this, Json.Options));
        File.Move(temp, path, overwrite: true);
    }

    /// <summary>Secret-store key for the API key of the selected Transcription or Notes preset.</summary>
    public static string KeyName(string slot, string preset) => $"{slot}:{preset}";

    /// <summary>Builds the Notes backend from settings; null when Notes are off.</summary>
    public INotesBackend? CreateNotesBackend(Func<string, string?> secret)
    {
        var p = Notes;
        var key = secret(KeyName("notes", p.Name));
        var address = string.IsNullOrWhiteSpace(NotesAddress) ? p.Address : NotesAddress;
        var model = string.IsNullOrWhiteSpace(NotesModel) ? p.Model : NotesModel;
        return p.Type switch
        {
            NotesType.None => null,
            NotesType.Anthropic => new AnthropicNotes(address, model, key),
            _ => new OpenAICompatibleNotes(address ?? "", model, key, NotesContextTokens),
        };
    }

    /// <summary>Builds a cloud Transcription backend; null when On-device is selected (the app supplies that one).</summary>
    public ITranscriptionBackend? CreateCloudTranscription(Func<string, string?> secret)
    {
        var p = Transcription;
        if (p.Type == TranscriptionType.OnDevice) return null;
        return new OpenAIStyleTranscription(
            string.IsNullOrWhiteSpace(TranscriptionAddress) ? p.Address : TranscriptionAddress,
            string.IsNullOrWhiteSpace(TranscriptionModel) ? p.Model : TranscriptionModel,
            secret(KeyName("transcription", p.Name)));
    }
}
