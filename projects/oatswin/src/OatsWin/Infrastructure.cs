using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Win32;

namespace OatsWin;

/// <summary>Where everything lives: <c>%LOCALAPPDATA%\OatsWin</c>.</summary>
static class AppPaths
{
    public static readonly string Root = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "OatsWin");
    public static string Meetings => Path.Combine(Root, "Meetings");
    public static string Models => Path.Combine(Root, "Models");
    public static string Settings => Path.Combine(Root, "settings.json");
    public static string Secrets => Path.Combine(Root, "secrets.json");
    public static string LogFile => Path.Combine(Root, "oatswin.log");
}

/// <summary>Plain-text log for diagnosing capture problems on real hardware. Rotates at 2 MB.</summary>
static class Log
{
    static readonly Lock Gate = new();

    public static void Info(string message) => Write("INFO", message);
    public static void Error(string message, Exception? e = null) => Write("ERROR", e is null ? message : $"{message}: {e}");

    static void Write(string level, string message)
    {
        try
        {
            lock (Gate)
            {
                Directory.CreateDirectory(AppPaths.Root);
                var info = new FileInfo(AppPaths.LogFile);
                if (info.Exists && info.Length > 2_000_000) File.Move(AppPaths.LogFile, AppPaths.LogFile + ".1", overwrite: true);
                File.AppendAllText(AppPaths.LogFile, $"{DateTimeOffset.Now:yyyy-MM-dd HH:mm:ss.fff} {level} {message}{Environment.NewLine}");
            }
        }
        catch (IOException) { }
    }
}

/// <summary>API keys, encrypted with DPAPI for the current Windows user (the counterpart of the macOS Keychain).</summary>
sealed class SecretStore
{
    static readonly byte[] Entropy = "OatsWin.v1"u8.ToArray();
    readonly Dictionary<string, string> protectedValues;

    public SecretStore()
    {
        try
        {
            protectedValues = File.Exists(AppPaths.Secrets)
                ? JsonSerializer.Deserialize<Dictionary<string, string>>(File.ReadAllText(AppPaths.Secrets)) ?? []
                : [];
        }
        catch (JsonException) { protectedValues = []; }
    }

    public string? Get(string name)
    {
        if (!protectedValues.TryGetValue(name, out var value)) return null;
        try { return Encoding.UTF8.GetString(ProtectedData.Unprotect(Convert.FromBase64String(value), Entropy, DataProtectionScope.CurrentUser)); }
        catch (CryptographicException) { return null; }
    }

    public void Set(string name, string? secret)
    {
        if (string.IsNullOrWhiteSpace(secret)) protectedValues.Remove(name);
        else protectedValues[name] = Convert.ToBase64String(ProtectedData.Protect(Encoding.UTF8.GetBytes(secret.Trim()), Entropy, DataProtectionScope.CurrentUser));
        Directory.CreateDirectory(AppPaths.Root);
        File.WriteAllText(AppPaths.Secrets, JsonSerializer.Serialize(protectedValues));
    }
}

static class Startup
{
    const string RunKey = @"Software\Microsoft\Windows\CurrentVersion\Run";

    public static void Apply(bool enabled)
    {
        using var key = Registry.CurrentUser.CreateSubKey(RunKey);
        if (enabled) key.SetValue("OatsWin", $"\"{Environment.ProcessPath}\" --background");
        else key.DeleteValue("OatsWin", throwOnMissingValue: false);
    }
}

static partial class Native
{
    const uint EsContinuous = 0x80000000, EsSystemRequired = 0x00000001;

    [LibraryImport("kernel32.dll")]
    private static partial uint SetThreadExecutionState(uint flags);

    /// <summary>Keeps the PC from sleeping mid-meeting (the display may still turn off). Call on the UI thread.</summary>
    public static void KeepAwake(bool on) => SetThreadExecutionState(on ? EsContinuous | EsSystemRequired : EsContinuous);

    [LibraryImport("user32.dll", SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static partial bool RegisterHotKey(IntPtr hWnd, int id, uint modifiers, uint vk);

    [LibraryImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static partial bool UnregisterHotKey(IntPtr hWnd, int id);
}

/// <summary>Global hotkey Ctrl+Alt+Shift+R toggles recording from any app.</summary>
sealed class HotkeyWindow : NativeWindow, IDisposable
{
    const int WmHotkey = 0x0312, Id = 0x4F41;
    const uint ModAlt = 0x1, ModControl = 0x2, ModShift = 0x4, ModNoRepeat = 0x4000;

    public event Action? Pressed;
    public bool Registered { get; }

    public HotkeyWindow()
    {
        CreateHandle(new CreateParams());
        Registered = Native.RegisterHotKey(Handle, Id, ModControl | ModAlt | ModShift | ModNoRepeat, (uint)Keys.R);
        if (!Registered) Log.Info("Hotkey Ctrl+Alt+Shift+R is taken by another app");
    }

    protected override void WndProc(ref Message m)
    {
        if (m.Msg == WmHotkey && (int)m.WParam == Id) Pressed?.Invoke();
        base.WndProc(ref m);
    }

    public void Dispose()
    {
        if (Registered) Native.UnregisterHotKey(Handle, Id);
        DestroyHandle();
    }
}
