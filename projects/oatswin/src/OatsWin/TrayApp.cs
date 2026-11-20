using Oats.Core;

namespace OatsWin;

/// <summary>
/// The whole app: a notification-area icon. Start/Stop, the hotkey, Teams call detection, the Processing queue, recent
/// Meetings, import, settings. Nothing runs during a call except the recorder.
/// </summary>
sealed class TrayApp : ApplicationContext
{
    readonly Control ui = new();
    readonly NotifyIcon tray = new() { Icon = TrayIcons.Idle, Text = "OatsWin", Visible = true };
    readonly ContextMenuStrip menu = new();
    readonly System.Windows.Forms.Timer uiTimer = new() { Interval = 1000 };
    readonly System.Windows.Forms.Timer callTimer = new() { Interval = 2000 };
    readonly HotkeyWindow hotkey = new();
    readonly CallDetector detector = new();
    readonly MeetingStore store = new(AppPaths.Meetings);
    readonly SecretStore secrets = new();
    readonly ProcessingQueue queue;
    Oats.Core.Settings settings;
    RecordingSession? session;
    bool starting;
    Action? balloonAction;
    string? progressLine;
    bool callPromptShown;

    public TrayApp(bool background)
    {
        ui.CreateControl();
        Directory.CreateDirectory(AppPaths.Root);
        settings = Oats.Core.Settings.Load(AppPaths.Settings);
        Log.Info($"OatsWin started on {Environment.OSVersion}");

        if (!settings.ConsentAcknowledged && !AskConsent())
        {
            ExitThread();
            Environment.Exit(0);
        }

        queue = new ProcessingQueue(() => settings, secrets);
        queue.Finished += (folder, status) => OnUi(() => OnProcessed(folder, status));
        queue.Progress += line => OnUi(() => { progressLine = line; RefreshTray(); });

        tray.ContextMenuStrip = menu;
        menu.Opening += (_, _) => BuildMenu();
        tray.MouseClick += (_, e) => { if (e.Button == MouseButtons.Left) ToggleRecording(); };
        tray.BalloonTipClicked += (_, _) => { var a = balloonAction; balloonAction = null; a?.Invoke(); };
        hotkey.Pressed += ToggleRecording;
        uiTimer.Tick += (_, _) => RefreshTray();
        callTimer.Tick += (_, _) => PollTeams();
        callTimer.Start();

        var recovered = store.Recover();
        foreach (var folder in recovered) queue.Enqueue(folder);
        if (recovered.Count > 0)
            Notify("Recovered unfinished Meetings", $"{recovered.Count} Meeting(s) left by a crash or restart are being processed now.");
        else if (!background)
            Notify("OatsWin is ready", $"Click the oat icon or press Ctrl+Alt+Shift+R to record. {(settings.TeamsCalls == TeamsCallMode.Off ? "" : "Teams calls are detected automatically.")}");
        queue.PrefetchModels();
    }

    bool AskConsent()
    {
        var answer = MessageBox.Show(
            "OatsWin records your microphone and your PC's audio (the other side of your Teams calls).\n\n" +
            "Many places require consent from some or all participants before a conversation is recorded " +
            "(for example all-party consent states in the U.S., and the GDPR in the EU). You are responsible for knowing " +
            "the law where you are and for telling people when you record them.\n\n" +
            "Transcription runs on this PC by default. Nothing leaves it unless you turn on a cloud service in Settings.\n\n" +
            "Do you understand and accept this?",
            "OatsWin: recording consent", MessageBoxButtons.YesNo, MessageBoxIcon.Information);
        if (answer != DialogResult.Yes) return false;
        settings.ConsentAcknowledged = true;
        Directory.CreateDirectory(settings.NotesFolder);
        settings.Save(AppPaths.Settings);
        return true;
    }

    void OnUi(Action action)
    {
        if (ui.IsDisposed) return;
        if (ui.InvokeRequired) ui.BeginInvoke(action);
        else action();
    }

    void Notify(string title, string text, Action? onClick = null, ToolTipIcon icon = ToolTipIcon.Info)
    {
        balloonAction = onClick;
        tray.ShowBalloonTip(5000, title, text, icon);
    }

    // ---------------------------------------------------------------- recording

    void ToggleRecording()
    {
        if (session is not null) StopRecording();
        else _ = StartRecordingAsync(autoStarted: false);
    }

    async Task StartRecordingAsync(bool autoStarted)
    {
        if (session is not null || starting) return;
        starting = true;
        try
        {
            Directory.CreateDirectory(AppPaths.Meetings);
            var free = new DriveInfo(Path.GetPathRoot(AppPaths.Meetings)!).AvailableFreeSpace;
            if (free < 1_000_000_000)
            {
                Notify("Not enough disk space", "OatsWin needs at least 1 GB free to record safely.", icon: ToolTipIcon.Warning);
                return;
            }
            var app = Teams.FindRootProcessId() is null ? null : "teams";
            var folder = MeetingFolder.Create(AppPaths.Meetings, DateTimeOffset.Now, settings.LanguageOrNull, app, autoStarted);
            try
            {
                session = await RecordingSession.StartAsync(folder, settings);
            }
            catch (Exception e)
            {
                Log.Error("Starting the recording failed", e);
                Directory.Delete(folder.Path, true);
                Notify("Couldn't start recording", e.Message, icon: ToolTipIcon.Error);
                return;
            }
            session.Problem += message => OnUi(() =>
            {
                if (message.StartsWith("stop:", StringComparison.Ordinal))
                {
                    StopRecording();
                    Notify("Recording stopped", message[5..], icon: ToolTipIcon.Warning);
                }
            });
            Native.KeepAwake(true);
            uiTimer.Start();
            Log.Info($"Recording {folder.Id}: {string.Join("; ", session.Sources)}");
            if (session.Warnings.Count > 0) Notify("Recording, with a problem", string.Join(" ", session.Warnings), icon: ToolTipIcon.Warning);
            else if (autoStarted) Notify("Recording your Teams call", "It stops by itself when the call ends. Click the oat icon to stop now.");
            RefreshTray();
        }
        finally { starting = false; }
    }

    void StopRecording()
    {
        var s = session;
        if (s is null) return;
        session = null;
        uiTimer.Stop();
        Native.KeepAwake(false);
        try { s.Stop(); }
        catch (Exception e) { Log.Error("Stopping the recording failed", e); }
        finally { s.Dispose(); }
        queue.Enqueue(s.Folder);
        Notify("Processing your Meeting", "You'll get a notification when the Meeting file is ready.");
        RefreshTray();
    }

    void PollTeams()
    {
        if (settings.TeamsCalls == TeamsCallMode.Off) return;
        bool onMic;
        try { onMic = Teams.OnMicrophone(); }
        catch (Exception e) { Log.Error("Reading Teams microphone state failed", e); return; }
        switch (detector.Update(onMic, DateTimeOffset.Now))
        {
            case CallEvent.Started when session is null:
                Log.Info("Teams call detected");
                if (settings.TeamsCalls == TeamsCallMode.Auto) _ = StartRecordingAsync(autoStarted: true);
                else
                {
                    callPromptShown = true;
                    Notify("Record this Teams call?", "Click here to start recording. It stops by itself when the call ends.",
                        () => { if (detector.InCall) _ = StartRecordingAsync(autoStarted: true); });
                }
                break;
            case CallEvent.Ended:
                Log.Info("Teams call ended");
                if (callPromptShown) { callPromptShown = false; balloonAction = null; }
                if (session?.Folder.ReadStatus().AutoStarted == true) StopRecording();
                break;
        }
    }

    // ---------------------------------------------------------------- processing results

    void OnProcessed(MeetingFolder folder, MeetingStatus status)
    {
        var file = status.MeetingFile;
        if (status.State == MeetingState.Done && file is not null)
        {
            var silentApp = status.ThemSource == "system" && folder.ReadStatus().App == "teams" && settings.ThemSource == ThemSourceMode.TeamsThenSystem;
            Notify("Meeting file ready", Path.GetFileName(file) + (silentApp ? "\n(Teams-only capture heard nothing; used all system audio.)" : ""),
                () => Shell.Open(file));
        }
        else
        {
            Notify("Meeting needs attention", (status.LastError ?? "Processing failed.") + "\nClick to retry.",
                () => queue.Enqueue(folder), ToolTipIcon.Warning);
        }
        RefreshTray();
    }

    // ---------------------------------------------------------------- tray

    void RefreshTray()
    {
        string text;
        if (session is { } s)
        {
            var (mic, them) = s.TakeLevels();
            tray.Icon = TrayIcons.Recording;
            text = $"Recording {s.Elapsed:hh\\:mm\\:ss}\nYou {Meter(mic)}  Them {Meter(them)}";
        }
        else if (queue.Count > 0 || progressLine is not null)
        {
            tray.Icon = TrayIcons.Processing;
            text = progressLine ?? $"Processing {queue.Count} Meeting(s)";
        }
        else
        {
            tray.Icon = TrayIcons.Idle;
            text = "OatsWin: click to record (Ctrl+Alt+Shift+R)";
        }
        tray.Text = text.Length > 127 ? text[..127] : text;
    }

    static string Meter(float peak)
    {
        double db = 20 * Math.Log10(Math.Max(peak, 1e-6));
        int bars = (int)Math.Clamp((db + 60) / 12, 0, 5);
        return new string('█', bars) + new string('░', 5 - bars);
    }

    void BuildMenu()
    {
        menu.Items.Clear();
        if (session is { } s)
        {
            menu.Items.Add(new ToolStripMenuItem($"Recording {s.Elapsed:hh\\:mm\\:ss}") { Enabled = false });
            menu.Items.Add(new ToolStripMenuItem("Stop recording", null, (_, _) => StopRecording()) { Font = Bold, ShortcutKeyDisplayString = "Ctrl+Alt+Shift+R" });
        }
        else
        {
            var label = detector.InCall ? "Record Teams call" : "Start recording";
            menu.Items.Add(new ToolStripMenuItem(label, null, (_, _) => _ = StartRecordingAsync(detector.InCall)) { Font = Bold, ShortcutKeyDisplayString = "Ctrl+Alt+Shift+R" });
        }
        if (progressLine is not null || queue.Count > 0)
            menu.Items.Add(new ToolStripMenuItem(progressLine ?? $"Processing {queue.Count} Meeting(s)") { Enabled = false });
        menu.Items.Add(new ToolStripSeparator());

        var recent = new ToolStripMenuItem("Recent Meetings");
        foreach (var folder in store.All().Where(f => f.Id != session?.Folder.Id).Take(10))
        {
            MeetingStatus st;
            try { st = folder.ReadStatus(); }
            catch (Exception) { continue; }
            var name = st.Title ?? (st.MeetingFile is { } mf ? Path.GetFileNameWithoutExtension(mf) : MeetingFileWriter.FallbackTitle(st.StartedAt));
            var item = new ToolStripMenuItem(st.State switch
            {
                MeetingState.NeedsAttention => $"⚠ {name} (retry)",
                MeetingState.Processing => $"{name} (processing)",
                _ => name,
            });
            item.Click += (_, _) =>
            {
                if (st.State == MeetingState.NeedsAttention) queue.Enqueue(folder);
                else if (st.MeetingFile is { } file && File.Exists(file)) Shell.Open(file);
            };
            if (st.State == MeetingState.NeedsAttention && st.LastError is { } err) item.ToolTipText = err;
            recent.DropDownItems.Add(item);
            var audio = new ToolStripMenuItem("Show audio in Explorer", null, (_, _) => Shell.Open(folder.Path));
            var reprocess = new ToolStripMenuItem("Re-process", null, (_, _) => { Processing.PrepareReprocess(folder); queue.Enqueue(folder); })
            { Enabled = st.State != MeetingState.Processing };
            item.DropDownItems.AddRange([audio, reprocess]);
        }
        if (recent.DropDownItems.Count == 0) recent.DropDownItems.Add(new ToolStripMenuItem("None yet") { Enabled = false });
        menu.Items.Add(recent);
        menu.Items.Add("Import audio file...", null, (_, _) => Import());
        menu.Items.Add("Open notes folder", null, (_, _) => { Directory.CreateDirectory(settings.NotesFolder); Shell.Open(settings.NotesFolder); });
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Settings...", null, (_, _) => OpenSettings());
        menu.Items.Add("Quit OatsWin", null, (_, _) => Quit());
    }

    static readonly Font Bold = new(SystemFonts.MenuFont ?? SystemFonts.DefaultFont, FontStyle.Bold);

    void OpenSettings()
    {
        using var form = new SettingsForm(settings, secrets);
        if (form.ShowDialog() == DialogResult.OK)
        {
            settings = Oats.Core.Settings.Load(AppPaths.Settings);
            queue.PrefetchModels();
        }
    }

    void Import()
    {
        using var dialog = new OpenFileDialog
        {
            Title = "Import a recording",
            Filter = "Audio and video|*.wav;*.mp3;*.m4a;*.aac;*.wma;*.flac;*.mp4;*.mov;*.webm;*.ogg|All files|*.*",
        };
        if (dialog.ShowDialog() != DialogResult.OK) return;
        var path = dialog.FileName;
        Notify("Importing", Path.GetFileName(path));
        _ = Task.Run(() =>
        {
            var samples = WinAudio.Decode(path) ?? (path.EndsWith(".wav", StringComparison.OrdinalIgnoreCase) ? Oats.Core.Audio.AudioFile.ReadMono16k(path) : null);
            if (samples is null)
            {
                OnUi(() => Notify("Couldn't import", $"Windows can't read {Path.GetFileName(path)}.", icon: ToolTipIcon.Warning));
                return;
            }
            var folder = MeetingFolder.Create(AppPaths.Meetings, new DateTimeOffset(File.GetLastWriteTime(path)), settings.LanguageOrNull, null, false);
            Oats.Core.Audio.AudioFile.WriteWav(folder.TrackPath(Track.Mixed, ".wav"), samples);
            folder.UpdateStatus(s => { s.State = MeetingState.Processing; s.Title = Path.GetFileNameWithoutExtension(path); });
            queue.Enqueue(folder);
        });
    }

    void Quit()
    {
        if (session is not null)
        {
            var answer = MessageBox.Show("A recording is in progress. Stop it and quit? The Meeting is processed the next time OatsWin starts.",
                "OatsWin", MessageBoxButtons.OKCancel, MessageBoxIcon.Question);
            if (answer != DialogResult.OK) return;
            StopRecording();
        }
        tray.Visible = false;
        ExitThread();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            uiTimer.Dispose();
            callTimer.Dispose();
            hotkey.Dispose();
            tray.Dispose();
            menu.Dispose();
            ui.Dispose();
        }
        base.Dispose(disposing);
    }
}
