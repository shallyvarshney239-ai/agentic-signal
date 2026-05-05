param(
    [switch]$NoModel,
    [string]$Model = "phi4-mini",
    [switch]$PrereqOnly,
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage: .\setup.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "One-command setup for Agentic Signal."
    Write-Host "Installs Bun, Ollama, pulls the AI model, and installs dependencies."
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -NoModel         Skip model pull (Ollama still installed)"
    Write-Host "  -Model <name>    Pull a specific model (default: phi4-mini)"
    Write-Host "  -PrereqOnly      Only install prerequisites (Bun + Ollama), skip deps + model"
    Write-Host "  -Help            Show this help"
    exit 0
}

$ErrorActionPreference = "Stop"

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  AGENTIC SIGNAL - ONE-COMMAND SETUP" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan

# ── Bun ──────────────────────────────────
$bunInstalled = $false
if (Get-Command bun -ErrorAction SilentlyContinue) {
    $bunVer = & bun --version 2>$null
    Write-Host "[OK] Bun found: $bunVer" -ForegroundColor Green
    $bunInstalled = $true
} else {
    Write-Host "[...] Installing Bun..." -ForegroundColor Yellow
}

# ── Ollama ───────────────────────────────
$ollamaInstalled = $false
if (Get-Command ollama -ErrorAction SilentlyContinue) {
    $ollamaVer = & ollama --version 2>$null
    Write-Host "[OK] Ollama found: $ollamaVer" -ForegroundColor Green
    $ollamaInstalled = $true
} else {
    Write-Host "[...] Installing Ollama..." -ForegroundColor Yellow
}

# ── Install prerequisites if needed ──────
if (-not $bunInstalled -or -not $ollamaInstalled) {
    Write-Host ""
    Write-Host "── Installing missing prerequisites ──" -ForegroundColor Cyan

    if (-not $bunInstalled) {
        Write-Host "[...] Downloading and installing Bun..." -ForegroundColor Yellow
        irm bun.sh/install.ps1 | iex
        $env:Path = "$env:USERPROFILE\.bun\bin;$env:Path"
        Write-Host "[OK] Bun installed" -ForegroundColor Green
    }

    if (-not $ollamaInstalled) {
        Write-Host "[...] Downloading and installing Ollama..." -ForegroundColor Yellow
        $tempDir = "$env:TEMP\ollama-setup"
        New-Item -ItemType Directory -Force -Path $tempDir | Out-Null
        $installer = "$tempDir\OllamaSetup.exe"
        Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $installer
        Start-Process -FilePath $installer -ArgumentList "/S" -Wait
        Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
        Write-Host "[OK] Ollama installed" -ForegroundColor Green
    }

    Write-Host "[...] Refreshing PATH..." -ForegroundColor Yellow
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
}

# ── Ensure Ollama is running ────────────
$ollamaProc = Get-Process -Name "ollama" -ErrorAction SilentlyContinue
if (-not $ollamaProc) {
    Write-Host "[...] Starting Ollama..." -ForegroundColor Yellow
    $ollamaExe = (Get-Command ollama -ErrorAction SilentlyContinue).Source
    if ($ollamaExe) {
        Start-Process -FilePath $ollamaExe -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "[OK] Ollama started" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Could not find ollama.exe to start" -ForegroundColor Yellow
    }
} else {
    Write-Host "[OK] Ollama is running" -ForegroundColor Green
}

# ── Early exit if prereq-only ────────────
if ($PrereqOnly) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PREREQUISITES INSTALLED" -ForegroundColor Cyan
    Write-Host "  Run '.\setup.ps1' to finish setup" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    exit 0
}

# ── Pull model ──────────────────────────
if ($NoModel) {
    Write-Host "[SKIP] Model pull skipped (-NoModel)" -ForegroundColor Yellow
} else {
    Write-Host "[...] Pulling model: $Model" -ForegroundColor Yellow
    & ollama pull $Model
    Write-Host "[OK] Model pulled: $Model" -ForegroundColor Green

    Write-Host "[...] Verifying model..." -ForegroundColor Yellow
    $test = & ollama run $Model "Say OK" 2>$null
    if ($test -match "OK") {
        Write-Host "[OK] Model verified" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Model responded unexpectedly: $test" -ForegroundColor Yellow
        Write-Host "[WARN] Continuing anyway - may need troubleshooting" -ForegroundColor Yellow
    }
}

# ── Install dependencies ─────────────────
Write-Host "[...] Installing project dependencies..." -ForegroundColor Yellow
& bun install
Write-Host "[OK] Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE" -ForegroundColor Cyan
Write-Host "  Run: bun run dev" -ForegroundColor Cyan
Write-Host "  Model: $Model" -ForegroundColor Cyan
Write-Host "  Cost: `$0.00 per inference" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan