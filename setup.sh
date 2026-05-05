#!/bin/bash
set -e

INSTALL_BUN=false
INSTALL_OLLAMA=false
SKIP_MODEL=false
MODEL_NAME="phi4-mini"
PREREQ_ONLY=false

usage () {
    echo "Usage: ./setup.sh [OPTIONS]"
    echo ""
    echo "One-command setup for Agentic Signal."
    echo "Installs Bun, Ollama, pulls the AI model, and installs dependencies."
    echo ""
    echo "Options:"
    echo "  --no-model        Skip model pull (Ollama still installed)"
    echo "  --model <name>    Pull a specific model (default: phi4-mini)"
    echo "  --prereq-only     Only install prerequisites (Bun + Ollama), skip deps + model"
    echo "  --help            Show this help"
    exit 0
}

for arg in "$@"; do
    case $arg in
        --no-model)    SKIP_MODEL=true ;;
        --model)       shift; MODEL_NAME="$1" ;;
        --prereq-only) PREREQ_ONLY=true ;;
        --help)        usage ;;
    esac
    shift 2>/dev/null || true
done

echo "═══════════════════════════════════════"
echo "  AGENTIC SIGNAL - ONE-COMMAND SETUP"
echo "═══════════════════════════════════════"

# ── Bun ──────────────────────────────────
if command -v bun &> /dev/null; then
    echo "[OK] Bun found: $(bun --version)"
else
    INSTALL_BUN=true
    echo "[…] Installing Bun..."
fi

# ── Ollama ───────────────────────────────
if command -v ollama &> /dev/null; then
    echo "[OK] Ollama found: $(ollama --version)"
else
    INSTALL_OLLAMA=true
    echo "[…] Installing Ollama..."
fi

# ── Install prerequisites if needed ──────
if $INSTALL_BUN || $INSTALL_OLLAMA; then
    echo ""
    echo "── Installing missing prerequisites ──"

    if $INSTALL_BUN; then
        echo "[…] Downloading and installing Bun..."
        curl -fsSL https://bun.sh/install | bash
        export BUN_INSTALL="$HOME/.bun"
        export PATH="$BUN_INSTALL/bin:$PATH"
        echo "[OK] Bun $(bun --version) installed"
    fi

    if $INSTALL_OLLAMA; then
        echo "[…] Downloading and installing Ollama..."
        curl -fsSL https://ollama.com/install.sh | sh
        echo "[OK] Ollama installed"
    fi
fi

# ── Start Ollama service ────────────────
if command -v systemctl &> /dev/null && systemctl is-active --quiet ollama 2>/dev/null; then
    echo "[OK] Ollama service running"
elif command -v systemctl &> /dev/null; then
    echo "[…] Starting Ollama service..."
    systemctl --user start ollama 2>/dev/null || sudo systemctl start ollama 2>/dev/null || true
    echo "[OK] Ollama service started (or already running)"
fi

# ── Pull model ──────────────────────────
if $PREREQ_ONLY; then
    echo ""
    echo "═══════════════════════════════════════"
    echo "  PREREQUISITES INSTALLED"
    echo "  Run './setup.sh' to finish setup"
    echo "═══════════════════════════════════════"
    exit 0
fi

if $SKIP_MODEL; then
    echo "[SKIP] Model pull skipped (--no-model)"
else
    echo "[…] Pulling model: $MODEL_NAME"
    ollama pull "$MODEL_NAME"
    echo "[OK] Model pulled: $MODEL_NAME"

    echo "[…] Verifying model..."
    TEST=$(ollama run "$MODEL_NAME" "Say OK" 2>/dev/null)
    if echo "$TEST" | grep -qi "OK"; then
        echo "[OK] Model verified"
    else
        echo "[WARN] Model responded unexpectedly: $TEST"
        echo "[WARN] Continuing anyway - may need troubleshooting"
    fi
fi

# ── Install dependencies ─────────────────
echo "[…] Installing project dependencies..."
bun install
echo "[OK] Dependencies installed"

echo ""
echo "═══════════════════════════════════════"
echo "  SETUP COMPLETE"
echo "  Run: bun run dev"
echo "  Model: $MODEL_NAME"
echo "  Cost: \$0.00 per inference"
echo "═══════════════════════════════════════"