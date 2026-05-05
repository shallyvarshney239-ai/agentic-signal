Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  GARAGE INFERENCE SETUP" -ForegroundColor Cyan
Write-Host "  Model: phi4-mini (Tier 1)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# Check Bun
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
    Write-Host "Bun is required. Install: https://bun.sh" -ForegroundColor Red
    exit 1
}
Write-Host "OK Bun found" -ForegroundColor Green

# Check Ollama
if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Write-Host "Ollama is required. Download: https://ollama.com/download" -ForegroundColor Red
    Write-Host "After installing Ollama, re-run this script." -ForegroundColor Yellow
    exit 1
}
Write-Host "OK Ollama found" -ForegroundColor Green

# Pull the model
Write-Host "Pulling phi4-mini (Tier 1)..." -ForegroundColor Yellow
ollama pull phi4-mini
Write-Host "OK Model pulled" -ForegroundColor Green

# Verify
Write-Host "Verifying model..." -ForegroundColor Yellow
$test = ollama run phi4-mini "Say OK" 2>$null
if ($test -match "OK") {
    Write-Host "OK Model verified" -ForegroundColor Green
} else {
    Write-Host "WARN Model responded: $test" -ForegroundColor Yellow
    Write-Host "May need troubleshooting. Continue anyway." -ForegroundColor Yellow
}

# Install deps
Write-Host "Installing dependencies..." -ForegroundColor Yellow
bun install
Write-Host "OK Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "  Run: bun run dev" -ForegroundColor Cyan
Write-Host "  Model: phi4-mini (3.8B params)" -ForegroundColor Cyan
Write-Host "  Cost: $0.00 per run" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan