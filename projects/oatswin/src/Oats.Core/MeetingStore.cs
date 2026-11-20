namespace Oats.Core;

/// <summary>All Meeting working folders, plus crash recovery on launch.</summary>
public sealed class MeetingStore(string root)
{
    public string Root { get; } = root;

    public IEnumerable<MeetingFolder> All()
    {
        if (!Directory.Exists(Root)) yield break;
        foreach (var dir in Directory.EnumerateDirectories(Root).OrderDescending())
            if (File.Exists(Path.Combine(dir, "meeting.json"))) yield return new MeetingFolder(dir);
    }

    public MeetingFolder? Find(string id) => All().FirstOrDefault(f => f.Id == id);

    /// <summary>
    /// Meetings left in <c>recording</c> (crash, power loss, force quit) are closed at the last flushed sample and marked
    /// interrupted; they and Meetings left in <c>processing</c> are returned to be queued.
    /// </summary>
    public List<MeetingFolder> Recover(ISet<string>? activeIds = null)
    {
        var queue = new List<MeetingFolder>();
        foreach (var folder in All())
        {
            if (activeIds?.Contains(folder.Id) == true) continue;
            MeetingStatus status;
            try { status = folder.ReadStatus(); }
            catch (Exception) { continue; }
            if (status.State == MeetingState.Recording)
            {
                var last = Enum.GetValues<Track>().SelectMany(folder.TrackFiles)
                    .Select(f => new DateTimeOffset(File.GetLastWriteTimeUtc(f), TimeSpan.Zero))
                    .DefaultIfEmpty(status.StartedAt).Max();
                folder.UpdateStatus(s => { s.State = MeetingState.Processing; s.Interrupted = true; s.EndedAt = last; });
                queue.Add(folder);
            }
            else if (status.State == MeetingState.Processing)
            {
                queue.Add(folder);
            }
        }
        return queue;
    }
}
