using Oats.Core;
using Oats.Core.Backends;

namespace OatsWin;

/// <summary>Settings in three tabs, as in OpenOats: General, AI, Advanced. Built in code; no designer files.</summary>
sealed class SettingsForm : Form
{
    readonly Oats.Core.Settings settings;
    readonly SecretStore secrets;

    readonly TextBox notesFolder = new() { Dock = DockStyle.Fill };
    readonly ComboBox language = new() { DropDownStyle = ComboBoxStyle.DropDown, Dock = DockStyle.Fill };
    readonly TextBox vocabulary = new() { Multiline = true, ScrollBars = ScrollBars.Vertical, Height = 80, Dock = DockStyle.Fill };
    readonly ComboBox teamsCalls = Combo("Ask me with a notification", "Record automatically", "Don't detect calls");
    readonly CheckBox recordMic = new() { Text = "Record my microphone (You)", AutoSize = true };
    readonly ComboBox themSource = Combo("Teams audio only, fall back to all system audio (recommended)", "All system audio");
    readonly CheckBox keepAudio = new() { Text = "Keep the audio after the Meeting file is written", AutoSize = true };
    readonly CheckBox startWithWindows = new() { Text = "Start OatsWin when I sign in to Windows", AutoSize = true };

    readonly ComboBox transcriptionPreset = Combo(Presets.Transcription.Select(p => p.Name).ToArray());
    readonly ComboBox localEngine = Combo("Automatic (Parakeet v3 for European languages, Whisper otherwise)", "Parakeet v3 always", "Whisper large-v3-turbo always");
    readonly TextBox transcriptionAddress = new() { Dock = DockStyle.Fill };
    readonly TextBox transcriptionModel = new() { Dock = DockStyle.Fill };
    readonly TextBox transcriptionKey = new() { Dock = DockStyle.Fill, UseSystemPasswordChar = true };

    readonly ComboBox notesPreset = Combo(Presets.Notes.Select(p => p.Name).ToArray());
    readonly TextBox notesAddress = new() { Dock = DockStyle.Fill };
    readonly TextBox notesModel = new() { Dock = DockStyle.Fill };
    readonly TextBox notesKey = new() { Dock = DockStyle.Fill, UseSystemPasswordChar = true };
    readonly NumericUpDown notesContext = new() { Minimum = 2_000, Maximum = 2_000_000, Increment = 1_000, Width = 120 };
    readonly Label testResult = new() { AutoSize = true, MaximumSize = new Size(420, 0) };

    readonly TextBox prompt = new() { Multiline = true, ScrollBars = ScrollBars.Vertical, Dock = DockStyle.Fill, AcceptsReturn = true };

    public SettingsForm(Oats.Core.Settings settings, SecretStore secrets)
    {
        this.settings = settings;
        this.secrets = secrets;
        Text = "OatsWin Settings";
        Icon = TrayIcons.Idle;
        StartPosition = FormStartPosition.CenterScreen;
        AutoScaleMode = AutoScaleMode.Dpi;
        Size = new Size(720, 600);
        MinimumSize = new Size(600, 500);
        Font = new Font("Segoe UI", 9.5f);

        var tabs = new TabControl { Dock = DockStyle.Fill };
        tabs.TabPages.Add(GeneralTab());
        tabs.TabPages.Add(AiTab());
        tabs.TabPages.Add(AdvancedTab());

        var save = new Button { Text = "Save", DialogResult = DialogResult.OK, AutoSize = true };
        var cancel = new Button { Text = "Cancel", DialogResult = DialogResult.Cancel, AutoSize = true };
        save.Click += (_, _) => Save();
        var buttons = new FlowLayoutPanel { Dock = DockStyle.Bottom, FlowDirection = FlowDirection.RightToLeft, AutoSize = true, Padding = new Padding(8) };
        buttons.Controls.AddRange([cancel, save]);
        AcceptButton = save;
        CancelButton = cancel;
        Controls.Add(tabs);
        Controls.Add(buttons);
        Load_();
    }

    static ComboBox Combo(params string[] items)
    {
        var c = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Dock = DockStyle.Fill };
        c.Items.AddRange(items);
        return c;
    }

    static TableLayoutPanel Grid()
    {
        var grid = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 2, Padding = new Padding(12), AutoScroll = true };
        grid.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        grid.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        return grid;
    }

    static void Row(TableLayoutPanel grid, string label, Control control)
    {
        grid.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        grid.Controls.Add(new Label { Text = label, AutoSize = true, Anchor = AnchorStyles.Left | AnchorStyles.Top, Padding = new Padding(0, 6, 8, 0) });
        grid.Controls.Add(control);
    }

    static void Note(TableLayoutPanel grid, string text)
    {
        grid.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        grid.Controls.Add(new Label());
        grid.Controls.Add(new Label { Text = text, AutoSize = true, ForeColor = SystemColors.GrayText, MaximumSize = new Size(460, 0), Padding = new Padding(0, 0, 0, 6) });
    }

    TabPage GeneralTab()
    {
        var grid = Grid();
        var browse = new Button { Text = "Browse...", AutoSize = true };
        browse.Click += (_, _) =>
        {
            using var dialog = new FolderBrowserDialog { SelectedPath = notesFolder.Text, Description = "Where Meeting files go" };
            if (dialog.ShowDialog(this) == DialogResult.OK) notesFolder.Text = dialog.SelectedPath;
        };
        var folderRow = new TableLayoutPanel { ColumnCount = 2, Dock = DockStyle.Fill, AutoSize = true };
        folderRow.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        folderRow.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        folderRow.Controls.Add(notesFolder);
        folderRow.Controls.Add(browse);
        Row(grid, "Notes folder", folderRow);
        Note(grid, "Meeting files (Markdown) are written here. Point it at your Obsidian vault if you use one.");

        language.Items.AddRange(["auto", "en", "de", "fr", "es", "it", "nl", "pl", "pt", "sv", "da", "fi", "uk", "ru", "ar", "zh", "ja", "ko", "hi", "tr", "he"]);
        Row(grid, "Language", language);
        Note(grid, "\"auto\" detects the language. A code (e.g. ar, ja) picks Whisper when Parakeet doesn't cover it.");
        Row(grid, "Vocabulary", vocabulary);
        Note(grid, "Names and terms, one per line. Used to fix their spelling in the Transcript and Notes.");
        Row(grid, "Teams calls", teamsCalls);
        Note(grid, "OatsWin notices when Teams starts using your microphone. A recording started this way stops 20 s after the call ends.");
        Row(grid, "Them audio", themSource);
        Note(grid, "Teams-only capture needs Windows 11 (build 20348+). Both are recorded; Processing keeps whichever heard the call.");
        Row(grid, "", recordMic);
        Row(grid, "", keepAudio);
        Row(grid, "", startWithWindows);
        return new TabPage("General") { Controls = { grid } };
    }

    TabPage AiTab()
    {
        var grid = Grid();
        Row(grid, "Transcription", transcriptionPreset);
        Row(grid, "On-device engine", localEngine);
        Row(grid, "Address", transcriptionAddress);
        Row(grid, "Model", transcriptionModel);
        Row(grid, "API key", transcriptionKey);
        Note(grid, "On-device runs on this PC and sends nothing anywhere. The first run downloads the model (about 640 MB).");
        transcriptionPreset.SelectedIndexChanged += (_, _) => FillTranscription();

        Row(grid, "Notes", notesPreset);
        Row(grid, "Address", notesAddress);
        Row(grid, "Model", notesModel);
        Row(grid, "API key", notesKey);
        Row(grid, "Context (tokens)", notesContext);
        var test = new Button { Text = "Test", AutoSize = true };
        test.Click += async (_, _) => await TestNotesAsync(test);
        var testRow = new FlowLayoutPanel { AutoSize = true, Dock = DockStyle.Fill };
        testRow.Controls.AddRange([test, testResult]);
        Row(grid, "", testRow);
        Note(grid, "None writes only the Transcript. The Notes backend only ever sees text. Keys are encrypted for your Windows account.");
        notesPreset.SelectedIndexChanged += (_, _) => FillNotes();
        return new TabPage("AI") { Controls = { grid } };
    }

    TabPage AdvancedTab()
    {
        var grid = Grid();
        grid.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        grid.Controls.Add(new Label { Text = "Notes prompt", AutoSize = true });
        var reset = new Button { Text = "Reset to default", AutoSize = true };
        reset.Click += (_, _) => prompt.Text = NotesWriter.DefaultPrompt;
        grid.Controls.Add(reset);
        grid.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        grid.Controls.Add(prompt);
        grid.SetColumnSpan(prompt, 2);
        var open = new LinkLabel { Text = "Open the app data folder (Meetings, models, log)", AutoSize = true };
        open.LinkClicked += (_, _) => Shell.Open(AppPaths.Root);
        grid.Controls.Add(open);
        grid.SetColumnSpan(open, 2);
        return new TabPage("Advanced") { Controls = { grid } };
    }

    void Load_()
    {
        notesFolder.Text = settings.NotesFolder;
        language.Text = settings.Language;
        vocabulary.Text = string.Join(Environment.NewLine, settings.Vocabulary);
        teamsCalls.SelectedIndex = (int)settings.TeamsCalls;
        themSource.SelectedIndex = (int)settings.ThemSource;
        recordMic.Checked = settings.RecordMic;
        keepAudio.Checked = settings.KeepAudio;
        startWithWindows.Checked = settings.StartWithWindows;
        localEngine.SelectedIndex = (int)settings.LocalEngine;
        transcriptionPreset.SelectedItem = settings.Transcription.Name;
        transcriptionAddress.Text = settings.TranscriptionAddress ?? settings.Transcription.Address ?? "";
        transcriptionModel.Text = settings.TranscriptionModel ?? settings.Transcription.Model ?? "";
        transcriptionKey.Text = secrets.Get(Oats.Core.Settings.KeyName("transcription", settings.Transcription.Name)) ?? "";
        notesPreset.SelectedItem = settings.Notes.Name;
        notesAddress.Text = settings.NotesAddress ?? settings.Notes.Address ?? "";
        notesModel.Text = settings.NotesModel ?? settings.Notes.Model ?? "";
        notesKey.Text = secrets.Get(Oats.Core.Settings.KeyName("notes", settings.Notes.Name)) ?? "";
        notesContext.Value = Math.Clamp(settings.NotesContextTokens, 2_000, 2_000_000);
        prompt.Text = settings.NotesPrompt ?? NotesWriter.DefaultPrompt;
        UpdateEnabled();
    }

    void FillTranscription()
    {
        var p = Presets.Transcription.First(x => x.Name == (string)transcriptionPreset.SelectedItem!);
        transcriptionAddress.Text = p.Address ?? "";
        transcriptionModel.Text = p.Model ?? "";
        transcriptionKey.Text = secrets.Get(Oats.Core.Settings.KeyName("transcription", p.Name)) ?? "";
        UpdateEnabled();
    }

    void FillNotes()
    {
        var p = Presets.Notes.First(x => x.Name == (string)notesPreset.SelectedItem!);
        notesAddress.Text = p.Address ?? "";
        notesModel.Text = p.Model ?? "";
        notesKey.Text = secrets.Get(Oats.Core.Settings.KeyName("notes", p.Name)) ?? "";
        notesContext.Value = p.Type == NotesType.Anthropic ? 200_000 : p.Address?.Contains("localhost") == true ? 32_000 : 128_000;
        UpdateEnabled();
    }

    void UpdateEnabled()
    {
        bool onDevice = transcriptionPreset.SelectedIndex <= 0;
        localEngine.Enabled = onDevice;
        transcriptionAddress.Enabled = transcriptionModel.Enabled = transcriptionKey.Enabled = !onDevice;
        bool notesOn = notesPreset.SelectedIndex > 0;
        notesAddress.Enabled = notesModel.Enabled = notesKey.Enabled = notesContext.Enabled = notesOn;
    }

    async Task TestNotesAsync(Button button)
    {
        button.Enabled = false;
        testResult.ForeColor = SystemColors.ControlText;
        testResult.Text = "Testing...";
        try
        {
            var probe = new Oats.Core.Settings();
            Apply(probe);
            var backend = probe.CreateNotesBackend(_ => notesKey.Text);
            if (backend is null) { testResult.Text = "Notes are off."; return; }
            await backend.CompleteAsync("Reply with the single word OK.", "Test", CancellationToken.None);
            testResult.ForeColor = Color.SeaGreen;
            testResult.Text = $"Works ({backend.Name}).";
        }
        catch (Exception e)
        {
            testResult.ForeColor = Color.Firebrick;
            testResult.Text = e.Message;
        }
        finally { button.Enabled = true; }
    }

    void Apply(Oats.Core.Settings s)
    {
        s.NotesFolder = notesFolder.Text.Trim();
        s.Language = string.IsNullOrWhiteSpace(language.Text) ? "auto" : language.Text.Trim();
        s.Vocabulary = vocabulary.Lines.Select(l => l.Trim()).Where(l => l.Length > 0).Distinct().ToList();
        s.TeamsCalls = (TeamsCallMode)teamsCalls.SelectedIndex;
        s.ThemSource = (ThemSourceMode)themSource.SelectedIndex;
        s.RecordMic = recordMic.Checked;
        s.KeepAudio = keepAudio.Checked;
        s.StartWithWindows = startWithWindows.Checked;
        s.LocalEngine = (LocalEngine)localEngine.SelectedIndex;
        var t = Presets.Transcription.First(x => x.Name == (string)transcriptionPreset.SelectedItem!);
        s.TranscriptionPreset = t.Name;
        s.TranscriptionAddress = transcriptionAddress.Text.Trim() is var ta && ta != (t.Address ?? "") ? ta : null;
        s.TranscriptionModel = transcriptionModel.Text.Trim() is var tm && tm != (t.Model ?? "") ? tm : null;
        var n = Presets.Notes.First(x => x.Name == (string)notesPreset.SelectedItem!);
        s.NotesPreset = n.Name;
        s.NotesAddress = notesAddress.Text.Trim() is var na && na != (n.Address ?? "") ? na : null;
        s.NotesModel = notesModel.Text.Trim() is var nm && nm != (n.Model ?? "") ? nm : null;
        s.NotesContextTokens = (int)notesContext.Value;
        s.NotesPrompt = prompt.Text.Trim() == NotesWriter.DefaultPrompt.Trim() ? null : prompt.Text;
    }

    void Save()
    {
        Apply(settings);
        secrets.Set(Oats.Core.Settings.KeyName("transcription", settings.TranscriptionPreset), transcriptionKey.Text);
        secrets.Set(Oats.Core.Settings.KeyName("notes", settings.NotesPreset), notesKey.Text);
        settings.Save(AppPaths.Settings);
        try { Startup.Apply(settings.StartWithWindows); }
        catch (Exception e) { Log.Error("Updating the Run key failed", e); }
    }
}

static class Shell
{
    public static void Open(string path)
    {
        try { System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(path) { UseShellExecute = true }); }
        catch (Exception e) { Log.Error($"Opening {path} failed", e); }
    }

    public static void Reveal(string path)
    {
        try { System.Diagnostics.Process.Start("explorer.exe", $"/select,\"{path}\""); }
        catch (Exception e) { Log.Error($"Revealing {path} failed", e); }
    }
}
