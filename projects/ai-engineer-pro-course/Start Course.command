#!/bin/bash
# Double-click on macOS to start the course and open it in your browser.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 18+ is required. Install it from https://nodejs.org or with: brew install node"
  read -r -p "Press Enter to close."
  exit 1
fi
node server.mjs
