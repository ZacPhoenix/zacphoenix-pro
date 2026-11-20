namespace OatsWin;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        using var single = new Mutex(true, @"Local\OatsWin.SingleInstance", out bool first);
        if (!first)
        {
            MessageBox.Show("OatsWin is already running. Look for the oat icon in the notification area (you may need to click ^).",
                "OatsWin", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }
        Application.SetHighDpiMode(HighDpiMode.PerMonitorV2);
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.ThreadException += (_, e) => Log.Error("UI thread exception", e.Exception);
        AppDomain.CurrentDomain.UnhandledException += (_, e) => Log.Error("Unhandled exception", e.ExceptionObject as Exception);
        Application.Run(new TrayApp(background: args.Contains("--background")));
    }
}
