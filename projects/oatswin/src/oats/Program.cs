using Oats.Core;
using Oats.Core.Backends;
using Oats.OnDevice;

// oats: the Processing pipeline from the command line. Also how OatsWin's pipeline is tested without a Windows desktop.
//
//   oats transcribe <mic.wav> [<them.wav>] [options]     Meeting file to stdout (one file = a mixed recording)
//   oats process <meeting-folder> [options]              (re)process a recorded Meeting folder, print the Meeting file path
//
// Options:
//   --language <code>       BCP 47 code; default automatic
//   --engine <name>         auto | parakeet | whisper | openai | groq | self-hosted   (default auto = on-device)
//   --notes <preset>        None | Anthropic | OpenAI | OpenRouter | Gemini | Ollama | "LM Studio" | llama.cpp
//   --model <id>            model for --notes
//   --vocabulary <a,b,c>    names and terms to spell exactly
//   --models <dir>          on-device model folder (default %LOCALAPPDATA%/OatsWin/Models)
//   --out <dir>             where the Meeting file is written (process; default the notes folder from settings)
// Keys come from OATS_NOTES_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY and OATS_TRANSCRIPTION_KEY / OPENAI_API_KEY / GROQ_API_KEY.

if (args.Length < 2 || args[0] is not ("transcribe" or "process"))
{
    Console.Error.WriteLine("usage: oats transcribe <mic.wav> [<them.wav>] [--language xx] [--engine auto|parakeet|whisper|openai|groq|self-hosted] [--notes <preset>] [--model <id>] [--vocabulary a,b] [--models <dir>]");
    Console.Error.WriteLine("       oats process <meeting-folder> [same options] [--out <dir>]");
    return 2;
}

var positional = new List<string>();
var options = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
for (int i = 1; i < args.Length; i++)
{
    if (args[i].StartsWith("--", StringComparison.Ordinal) && i + 1 < args.Length) options[args[i][2..]] = args[++i];
    else positional.Add(args[i]);
}

var appData = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OatsWin");
var models = new ModelStore(options.GetValueOrDefault("models") ?? Path.Combine(appData, "Models"));
string? language = options.GetValueOrDefault("language") is { } l && l != "auto" ? l : null;
var vocabulary = (options.GetValueOrDefault("vocabulary") ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList();
var stderr = new Progress<string>(m => Console.Error.WriteLine(m));

static string? Env(params string[] names) => names.Select(Environment.GetEnvironmentVariable).FirstOrDefault(v => !string.IsNullOrEmpty(v));

ITranscriptionBackend transcription = options.GetValueOrDefault("engine")?.ToLowerInvariant() switch
{
    "openai" => new OpenAIStyleTranscription("https://api.openai.com/v1", "whisper-1", Env("OATS_TRANSCRIPTION_KEY", "OPENAI_API_KEY")),
    "groq" => new OpenAIStyleTranscription("https://api.groq.com/openai/v1", "whisper-large-v3-turbo", Env("OATS_TRANSCRIPTION_KEY", "GROQ_API_KEY")),
    "self-hosted" => new OpenAIStyleTranscription("http://localhost:8000/v1", "whisper-1", Env("OATS_TRANSCRIPTION_KEY")),
    "parakeet" => new OnDeviceTranscription(models, LocalEngine.Parakeet, vocabulary),
    "whisper" => new OnDeviceTranscription(models, LocalEngine.Whisper, vocabulary),
    _ => new OnDeviceTranscription(models, LocalEngine.Auto, vocabulary),
};
if (transcription is OnDeviceTranscription onDevice) await onDevice.EnsureModelsAsync(language, stderr, default);

INotesBackend? notes = null;
if (options.GetValueOrDefault("notes") is { } presetName && !presetName.Equals("none", StringComparison.OrdinalIgnoreCase))
{
    var preset = Presets.Notes.FirstOrDefault(p => p.Name.Equals(presetName, StringComparison.OrdinalIgnoreCase))
        ?? throw new ArgumentException($"Unknown notes preset {presetName}");
    var model = options.GetValueOrDefault("model") ?? preset.Model;
    notes = preset.Type == NotesType.Anthropic
        ? new AnthropicNotes(preset.Address, model, Env("OATS_NOTES_KEY", "ANTHROPIC_API_KEY"))
        : new OpenAICompatibleNotes(preset.Address ?? "", model, Env("OATS_NOTES_KEY", "OPENAI_API_KEY"));
}

if (args[0] == "transcribe")
{
    var root = Directory.CreateTempSubdirectory("oats-cli-");
    try
    {
        var folder = MeetingFolder.Create(root.FullName, new DateTimeOffset(File.GetLastWriteTime(positional[0])), language, null, false);
        if (positional.Count == 1)
            File.Copy(positional[0], folder.TrackPath(Track.Mixed, Path.GetExtension(positional[0])));
        else
        {
            File.Copy(positional[0], folder.TrackPath(Track.Mic, Path.GetExtension(positional[0])));
            File.Copy(positional[1], folder.TrackPath(Track.System, Path.GetExtension(positional[1])));
        }
        folder.UpdateStatus(s => s.State = MeetingState.Processing);
        var status = await Processing.RunAsync(folder, new ProcessingOptions(transcription, Path.Combine(root.FullName, "out"),
            notes, null, vocabulary, KeepAudio: false, Progress: stderr));
        if (status.MeetingFile is { } file) Console.Write(File.ReadAllText(file));
        if (status.LastError is { } error) Console.Error.WriteLine($"Needs attention: {error}");
        return status.State == MeetingState.Done ? 0 : 1;
    }
    finally { root.Delete(true); }
}
else
{
    var folder = new MeetingFolder(Path.GetFullPath(positional[0]));
    Processing.PrepareReprocess(folder);
    var settings = Settings.Load(Path.Combine(appData, "settings.json"));
    var status = await Processing.RunAsync(folder, new ProcessingOptions(transcription, options.GetValueOrDefault("out") ?? settings.NotesFolder,
        notes, settings.NotesPrompt, vocabulary.Count > 0 ? vocabulary : settings.Vocabulary, Progress: stderr));
    Console.WriteLine(status.MeetingFile);
    if (status.LastError is { } error) Console.Error.WriteLine($"Needs attention: {error}");
    return status.State == MeetingState.Done ? 0 : 1;
}
