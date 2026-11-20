using System.Globalization;
using System.Text.Json;

namespace Oats.Core;

public sealed class MeetingBusyException(string id) : Exception($"Meeting {id} is being processed elsewhere.");

/// <summary>
/// A Meeting's working folder: the tracks, <c>meeting.json</c> (state, completed steps, errors) and the step checkpoints.
/// Lives under <c>%LOCALAPPDATA%\OatsWin\Meetings\&lt;id&gt;</c>; the user's Meeting file goes to their notes folder.
/// </summary>
public sealed class MeetingFolder(string path)
{
    static readonly Lock StatusGate = new();

    public string Path { get; } = path;
    public string Id => System.IO.Path.GetFileName(Path);
    public string StatusPath => System.IO.Path.Combine(Path, "meeting.json");

    public static MeetingFolder Create(string root, DateTimeOffset startedAt, string? language, string? app, bool autoStarted)
    {
        var id = startedAt.ToLocalTime().ToString("yyyyMMdd-HHmmss", CultureInfo.InvariantCulture) + "-" + Guid.NewGuid().ToString("N")[..4];
        var folder = new MeetingFolder(System.IO.Path.Combine(root, id));
        Directory.CreateDirectory(folder.Path);
        folder.WriteStatus(new MeetingStatus
        {
            Id = id, StartedAt = startedAt, Language = language, App = app, AutoStarted = autoStarted, State = MeetingState.Recording,
        });
        return folder;
    }

    public string TrackPath(Track track, string extension = ".pcm") => System.IO.Path.Combine(Path, track.FileStem() + extension);

    /// <summary>Existing files for a track, raw <c>.pcm</c> first.</summary>
    public List<string> TrackFiles(Track track) =>
        new[] { ".pcm", ".wav", ".m4a", ".flac", ".mp3" }.Select(e => TrackPath(track, e)).Where(File.Exists).ToList();

    public bool IsMixed => TrackFiles(Track.Mixed).Count > 0 || File.Exists(CheckpointPath("mixed"));

    public MeetingStatus ReadStatus()
    {
        lock (StatusGate)
            return JsonSerializer.Deserialize<MeetingStatus>(File.ReadAllText(StatusPath), Json.Options)
                ?? throw new InvalidDataException($"{StatusPath} is empty.");
    }

    public void WriteStatus(MeetingStatus status)
    {
        lock (StatusGate) WriteAtomic(StatusPath, JsonSerializer.Serialize(status, Json.Options));
    }

    /// <summary>Read-modify-write of <c>meeting.json</c>, so a rename and a Processing update don't clobber each other.</summary>
    public MeetingStatus UpdateStatus(Action<MeetingStatus> change)
    {
        lock (StatusGate)
        {
            var status = ReadStatus();
            change(status);
            WriteStatus(status);
            return status;
        }
    }

    public string CheckpointPath(string name) => System.IO.Path.Combine(Path, name + ".json");

    public T? ReadCheckpoint<T>(string name) where T : class
    {
        var path = CheckpointPath(name);
        if (!File.Exists(path)) return null;
        try { return JsonSerializer.Deserialize<T>(File.ReadAllText(path), Json.Options); }
        catch (JsonException) { return null; }
    }

    public void WriteCheckpoint<T>(string name, T value) => WriteAtomic(CheckpointPath(name), JsonSerializer.Serialize(value, Json.Options));

    public void DeleteCheckpoint(string name) => File.Delete(CheckpointPath(name));

    /// <summary>Exclusive lock held while Processing, so two runs never work on one Meeting.</summary>
    public IDisposable Lock()
    {
        try { return new FileStream(System.IO.Path.Combine(Path, ".lock"), FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None); }
        catch (IOException) { throw new MeetingBusyException(Id); }
    }

    static void WriteAtomic(string path, string text)
    {
        var temp = path + ".tmp";
        File.WriteAllText(temp, text);
        File.Move(temp, path, overwrite: true);
    }
}
