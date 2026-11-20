#!/usr/bin/env bash
# Cross-builds the Windows app from Linux or macOS (needs the .NET 10 SDK). Output: dist/OatsWin-win-<arch>[.zip]
set -euo pipefail
arch="${1:-x64}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/dist/OatsWin-win-$arch"
rm -rf "$out" "$out.zip"
dotnet test --project "$root/tests/Oats.Core.Tests" -c Release
dotnet publish "$root/src/OatsWin" -c Release -r "win-$arch" --self-contained true -o "$out"
dotnet publish "$root/src/oats" -c Release -r "win-$arch" --self-contained true -o "$out"
find "$out/runtimes" -mindepth 1 -maxdepth 1 -type d ! -name "win-$arch" ! -name vulkan -exec rm -rf {} +
[ -d "$out/runtimes/vulkan" ] && find "$out/runtimes/vulkan" -mindepth 1 -maxdepth 1 -type d ! -name "win-$arch" -exec rm -rf {} +
rm -f "$out"/*.pdb "$out/ggml-metal.metal"
(cd "$out" && zip -qr "$out.zip" .)
echo "Built $out and $out.zip"
