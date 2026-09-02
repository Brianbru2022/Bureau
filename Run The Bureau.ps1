$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $projectRoot

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Host 'pnpm is required. Install Node.js 20+ and enable pnpm, then run this file again.' -ForegroundColor Yellow
  Read-Host 'Press Enter to close'
  exit 1
}

Write-Host 'Starting The Bureau of Questionable Knowledge at http://localhost:3000 ...' -ForegroundColor Cyan
Start-Process 'http://localhost:3000'
pnpm dev
