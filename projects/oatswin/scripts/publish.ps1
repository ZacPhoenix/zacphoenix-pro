# Builds a self-contained OatsWin folder and zip in dist\ (no .NET install needed on the target PC).
#   pwsh scripts/publish.ps1            # x64
#   pwsh scripts/publish.ps1 -Arch arm64
param([ValidateSet("x64", "arm64")] [string]$Arch = "x64")
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root "dist\OatsWin-win-$Arch"
if (Test-Path $out) { Remove-Item $out -Recurse -Force }

dotnet test --project (Join-Path $root "tests\Oats.Core.Tests") -c Release
dotnet publish (Join-Path $root "src\OatsWin") -c Release -r "win-$Arch" --self-contained true -o $out
dotnet publish (Join-Path $root "src\oats") -c Release -r "win-$Arch" --self-contained true -o $out

# Whisper.net ships native libraries for every OS; keep only this architecture's.
Get-ChildItem (Join-Path $out "runtimes") -Directory | Where-Object { $_.Name -notin @("win-$Arch", "vulkan") } | Remove-Item -Recurse -Force
$vulkan = Join-Path $out "runtimes\vulkan"
if (Test-Path $vulkan) { Get-ChildItem $vulkan -Directory | Where-Object { $_.Name -ne "win-$Arch" } | Remove-Item -Recurse -Force }
Remove-Item (Join-Path $out "*.pdb"), (Join-Path $out "ggml-metal.metal") -ErrorAction SilentlyContinue

$zip = "$out.zip"
if (Test-Path $zip) { Remove-Item $zip }
Compress-Archive -Path "$out\*" -DestinationPath $zip
Write-Host "Built $out and $zip"
