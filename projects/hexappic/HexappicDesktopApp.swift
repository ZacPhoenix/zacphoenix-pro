import Cocoa

final class AppDelegate: NSObject, NSApplicationDelegate {
    private let platformRoot = URL(fileURLWithPath: "/Users/zacphoenix/clawd/projects/hexappic/platform")
    private var window: NSWindow!
    private var textView: NSTextView!
    private var titleLabel: NSTextField!
    private var statusLabel: NSTextField!

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildWindow()
        buildMenu()
        showOverview(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }

    private func buildWindow() {
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1320, height: 900),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = "Hexappic"

        let root = NSView(frame: window.contentView!.bounds)
        root.autoresizingMask = [.width, .height]
        window.contentView = root

        let sidebar = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 260, height: root.bounds.height))
        sidebar.material = .sidebar
        sidebar.blendingMode = .behindWindow
        sidebar.state = .active
        sidebar.autoresizingMask = [.height]
        root.addSubview(sidebar)

        let brand = NSTextField(labelWithString: "HEXAPPIC")
        brand.font = NSFont.systemFont(ofSize: 24, weight: .black)
        brand.textColor = NSColor(calibratedRed: 0.87, green: 0.34, blue: 0.06, alpha: 1)
        brand.frame = NSRect(x: 24, y: root.bounds.height - 68, width: 200, height: 32)
        brand.autoresizingMask = [.minYMargin]
        sidebar.addSubview(brand)

        let subtitle = NSTextField(labelWithString: "AI-run microcompany cockpit")
        subtitle.font = NSFont.systemFont(ofSize: 12, weight: .semibold)
        subtitle.textColor = .secondaryLabelColor
        subtitle.frame = NSRect(x: 24, y: root.bounds.height - 92, width: 210, height: 20)
        subtitle.autoresizingMask = [.minYMargin]
        sidebar.addSubview(subtitle)

        let buttons: [(String, Selector)] = [
            ("Overview", #selector(showOverview(_:))),
            ("Board", #selector(showBoard(_:))),
            ("Readout", #selector(showReadout(_:))),
            ("Operating Model", #selector(showOperatingModel(_:))),
            ("Workflow", #selector(showWorkflow(_:))),
            ("Validate", #selector(runValidate(_:))),
            ("Open Folder", #selector(openFolder(_:)))
        ]

        var y = root.bounds.height - 150
        for (title, action) in buttons {
            let button = NSButton(title: title, target: self, action: action)
            button.bezelStyle = .rounded
            button.frame = NSRect(x: 22, y: y, width: 210, height: 34)
            button.autoresizingMask = [.minYMargin]
            sidebar.addSubview(button)
            y -= 44
        }

        let contentX: CGFloat = 260
        let contentWidth = root.bounds.width - contentX

        titleLabel = NSTextField(labelWithString: "")
        titleLabel.font = NSFont.systemFont(ofSize: 28, weight: .bold)
        titleLabel.frame = NSRect(x: contentX + 28, y: root.bounds.height - 64, width: contentWidth - 56, height: 34)
        titleLabel.autoresizingMask = [.width, .minYMargin]
        root.addSubview(titleLabel)

        statusLabel = NSTextField(labelWithString: "")
        statusLabel.font = NSFont.systemFont(ofSize: 12, weight: .medium)
        statusLabel.textColor = .secondaryLabelColor
        statusLabel.frame = NSRect(x: contentX + 28, y: root.bounds.height - 88, width: contentWidth - 56, height: 18)
        statusLabel.autoresizingMask = [.width, .minYMargin]
        root.addSubview(statusLabel)

        let scrollView = NSScrollView(frame: NSRect(x: contentX + 24, y: 24, width: contentWidth - 48, height: root.bounds.height - 128))
        scrollView.borderType = .noBorder
        scrollView.hasVerticalScroller = true
        scrollView.autoresizingMask = [.width, .height]

        textView = NSTextView(frame: scrollView.bounds)
        textView.isEditable = false
        textView.isRichText = false
        textView.font = NSFont.monospacedSystemFont(ofSize: 14, weight: .regular)
        textView.backgroundColor = NSColor(calibratedWhite: 0.985, alpha: 1)
        textView.textColor = .labelColor
        textView.textContainerInset = NSSize(width: 18, height: 18)
        scrollView.documentView = textView
        root.addSubview(scrollView)

        window.makeKeyAndOrderFront(nil)
    }

    private func buildMenu() {
        let mainMenu = NSMenu()

        let appMenuItem = NSMenuItem()
        mainMenu.addItem(appMenuItem)
        let appMenu = NSMenu()
        appMenuItem.submenu = appMenu
        appMenu.addItem(withTitle: "About Hexappic", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        appMenu.addItem(NSMenuItem.separator())
        appMenu.addItem(withTitle: "Quit Hexappic", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")

        let viewMenuItem = NSMenuItem()
        mainMenu.addItem(viewMenuItem)
        let viewMenu = NSMenu(title: "View")
        viewMenuItem.submenu = viewMenu
        viewMenu.addItem(withTitle: "Overview", action: #selector(showOverview(_:)), keyEquivalent: "1")
        viewMenu.addItem(withTitle: "Board", action: #selector(showBoard(_:)), keyEquivalent: "2")
        viewMenu.addItem(withTitle: "Readout", action: #selector(showReadout(_:)), keyEquivalent: "3")
        viewMenu.addItem(withTitle: "Operating Model", action: #selector(showOperatingModel(_:)), keyEquivalent: "4")
        viewMenu.addItem(withTitle: "Workflow", action: #selector(showWorkflow(_:)), keyEquivalent: "5")
        viewMenu.addItem(NSMenuItem.separator())
        viewMenu.addItem(withTitle: "Validate", action: #selector(runValidate(_:)), keyEquivalent: "r")

        NSApp.mainMenu = mainMenu
    }

    private func setContent(title: String, status: String, body: String) {
        titleLabel.stringValue = title
        statusLabel.stringValue = status
        textView.string = body
        textView.scrollToBeginningOfDocument(nil)
    }

    private func readFile(_ relativePath: String) -> String {
        let url = platformRoot.appendingPathComponent(relativePath)
        return (try? String(contentsOf: url, encoding: .utf8)) ?? "Unable to read: \(relativePath)"
    }

    private func runHexappicCommand(_ args: [String]) -> (Int32, String, String) {
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/usr/bin/python3")
        process.arguments = [platformRoot.appendingPathComponent("scripts/hexappic.py").path] + args
        process.currentDirectoryURL = URL(fileURLWithPath: "/Users/zacphoenix/clawd")

        let stdout = Pipe()
        let stderr = Pipe()
        process.standardOutput = stdout
        process.standardError = stderr

        do {
            try process.run()
            process.waitUntilExit()
        } catch {
            return (1, "", error.localizedDescription)
        }

        let out = String(data: stdout.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        let err = String(data: stderr.fileHandleForReading.readDataToEndOfFile(), encoding: .utf8) ?? ""
        return (process.terminationStatus, out, err)
    }

    @objc private func showOverview(_ sender: Any?) {
        let board = readFile("boards/kanban.md")
        let model = readFile("docs/operating-model.md")
        let report = readFile("reports/phase-2-readout.md")
        let body = """
Hexappic is a local-first, artifact-driven microcompany operating system.

Quick summary
- Sponsor / CEO: Zac
- PM: Hex
- Supporting roles: Dev + Research agents
- Core rule: no fake org chart, no fake done, no process theater

--- BOARD ---
\(board)

--- READOUT ---
\(report)

--- OPERATING MODEL ---
\(model)
"""
        setContent(title: "Overview", status: "Local-first microcompany snapshot", body: body)
    }

    @objc private func showBoard(_ sender: Any?) {
        setContent(title: "Board", status: "Ticket status board", body: readFile("boards/kanban.md"))
    }

    @objc private func showReadout(_ sender: Any?) {
        let (_, out, err) = runHexappicCommand(["readout"])
        let path = out.trimmingCharacters(in: .whitespacesAndNewlines)
        let reportText = readFile("reports/phase-2-readout.md")
        let suffix = err.isEmpty ? "" : "\n\n--- STDERR ---\n\(err)"
        setContent(title: "Readout", status: path.isEmpty ? "Generated locally" : path, body: reportText + suffix)
    }

    @objc private func showOperatingModel(_ sender: Any?) {
        setContent(title: "Operating Model", status: "Roles, principles, rules", body: readFile("docs/operating-model.md"))
    }

    @objc private func showWorkflow(_ sender: Any?) {
        setContent(title: "Workflow", status: "Execution path and artifact rules", body: readFile("docs/workflow.md"))
    }

    @objc private func runValidate(_ sender: Any?) {
        let (code, out, err) = runHexappicCommand(["validate"])
        var body = "Command: python3 projects/hexappic/platform/scripts/hexappic.py validate\n\n"
        if !out.isEmpty { body += out }
        if !err.isEmpty { body += "\n\n" + err }
        let status = code == 0 ? "Validation OK" : "Validation failed"
        setContent(title: "Validate", status: status, body: body)
    }

    @objc private func openFolder(_ sender: Any?) {
        NSWorkspace.shared.open(platformRoot)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
