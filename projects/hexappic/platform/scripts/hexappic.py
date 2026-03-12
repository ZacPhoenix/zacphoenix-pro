#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TICKETS_DIR = ROOT / "tickets"
BOARD_PATH = ROOT / "boards" / "kanban.md"
REPORTS_DIR = ROOT / "reports"
REQUIRED_FIELDS = ["Status", "Owner", "Source Docs"]
STATUS_ORDER = ["Backlog", "Ready", "In Progress", "Review", "Blocked", "Done"]


def load_ticket(path: Path) -> dict:
    text = path.read_text()
    title = text.splitlines()[0].lstrip("# ").strip()
    data = {"path": path, "title": title, "raw": text}
    for field in REQUIRED_FIELDS:
        match = re.search(rf"- \*\*{re.escape(field)}:\*\*\s*(.+)", text)
        data[field] = match.group(1).strip() if match else None
    source_docs = []
    capture = False
    for line in text.splitlines():
        if line.startswith("- **Source Docs:**"):
            capture = True
            continue
        if capture:
            if line.startswith("  - "):
                source_docs.append(line.replace("  - ", "", 1).strip().strip("`").strip())
            else:
                break
    data["source_docs"] = source_docs
    evidence_match = re.search(r"## Evidence\n(.+?)(?:\n## |\Z)", text, re.S)
    data["evidence"] = evidence_match.group(1).strip() if evidence_match else ""
    return data


def load_tickets() -> list[dict]:
    return [load_ticket(path) for path in sorted(TICKETS_DIR.glob("*.md"))]


def board() -> int:
    sys.stdout.write(BOARD_PATH.read_text())
    return 0


def readout() -> int:
    tickets = load_tickets()
    counts = {status: 0 for status in STATUS_ORDER}
    for ticket in tickets:
        status = ticket.get("Status")
        if status in counts:
            counts[status] += 1
    lines = [
        "# Hexappic Platform Readout",
        "",
        f"Generated: {dt.datetime.now().isoformat()}",
        "",
        "## Ticket Counts",
    ]
    lines.extend([f"- {status}: {counts[status]}" for status in STATUS_ORDER])
    lines.extend([
        "",
        "## Tickets",
    ])
    for ticket in tickets:
        lines.append(f"- {ticket['title']} — {ticket['Status']} — owner: {ticket['Owner']}")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    out = REPORTS_DIR / "phase-2-readout.md"
    out.write_text("\n".join(lines) + "\n")
    sys.stdout.write(str(out) + "\n")
    return 0


def validate() -> int:
    errors: list[str] = []
    tickets = load_tickets()
    board_text = BOARD_PATH.read_text()

    for ticket in tickets:
        for field in REQUIRED_FIELDS:
            if not ticket.get(field):
                errors.append(f"{ticket['path'].name}: missing field {field}")
        if not ticket["source_docs"]:
            errors.append(f"{ticket['path'].name}: no source docs listed")
        for rel in ticket["source_docs"]:
            target = (ticket["path"].parent / rel).resolve()
            if not target.exists():
                errors.append(f"{ticket['path'].name}: broken source doc link {rel}")
        if ticket.get("Status") == "Done" and "Pending" in ticket.get("evidence", ""):
            errors.append(f"{ticket['path'].name}: done ticket cannot have pending evidence")
        ticket_id = ticket['path'].stem
        if ticket_id not in board_text:
            errors.append(f"{ticket['path'].name}: missing from board")

    if errors:
        sys.stderr.write("Validation failed:\n")
        for err in errors:
            sys.stderr.write(f"- {err}\n")
        return 1

    sys.stdout.write("Validation OK\n")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Hexappic local platform helper")
    parser.add_argument("command", choices=["board", "readout", "validate"])
    args = parser.parse_args()
    if args.command == "board":
        return board()
    if args.command == "readout":
        return readout()
    if args.command == "validate":
        return validate()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
