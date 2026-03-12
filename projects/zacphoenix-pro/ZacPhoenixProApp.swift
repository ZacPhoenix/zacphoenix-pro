import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate, WKNavigationDelegate {
    var window: NSWindow!
    var webView: WKWebView!
    let pageURL = URL(fileURLWithPath: "/Users/zacphoenix/clawd/projects/zacphoenix-pro/index.html")

    func applicationDidFinishLaunching(_ notification: Notification) {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")

        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.setValue(false, forKey: "drawsBackground")

        let contentRect = NSRect(x: 0, y: 0, width: 1400, height: 920)
        window = NSWindow(
            contentRect: contentRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = "Zac Phoenix Pro"
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)

        buildMenu()
        loadPage()
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    private func buildMenu() {
        let mainMenu = NSMenu()

        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        appMenu.addItem(withTitle: "About Zac Phoenix Pro", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Zac Phoenix Pro", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        let fileMenuItem = NSMenuItem()
        mainMenu.addItem(fileMenuItem)
        let fileMenu = NSMenu(title: "File")
        fileMenuItem.submenu = fileMenu
        fileMenu.addItem(withTitle: "Reload", action: #selector(reloadPage), keyEquivalent: "r")
        fileMenu.addItem(withTitle: "Open Project Folder", action: #selector(openProjectFolder), keyEquivalent: "o")
        fileMenu.addItem(withTitle: "Open in Default Browser", action: #selector(openInBrowser), keyEquivalent: "b")

        NSApp.mainMenu = mainMenu
    }

    private func loadPage() {
        webView.loadFileURL(pageURL, allowingReadAccessTo: pageURL.deletingLastPathComponent())
    }

    @objc private func reloadPage() {
        if webView.url == nil {
            loadPage()
        } else {
            webView.reload()
        }
    }

    @objc private func openProjectFolder() {
        NSWorkspace.shared.open(pageURL.deletingLastPathComponent())
    }

    @objc private func openInBrowser() {
        NSWorkspace.shared.open(pageURL)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
