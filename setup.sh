#!/bin/bash
echo "═══════════════════════════════════════"
echo "  GARAGE INFERENCE SETUP"
echo "  Model: phi4-mini (Tier 1)"
echo "═══════════════════════════════════════"

# Check Bun
if ! command -v bun &> /dev/null; then
    echo "Bun is required. Install: https://bun.sh"
    exit 1
fi
echo "OK Bun found"

# Check Ollama
if ! command -v ollama &> /dev/null; then
    echo "Ollama is required. Download: https://ollama.com/download"
    echo "After installing Ollama, re-run this script."
    exit 1
fi
echo "OK Ollama found"

# Pull the model
echo "Pulling phi4-mini (Tier 1)..."
ollama pull phi4-mini
echo "OK Model pulled"

# Verify
echo "Verifying model..."
TEST=$(ollama run phi4-mini "Say OK" 2>/dev/null)
if echo "$TEST" | grep -qi "OK"; then
    echo "OK Model verified"
else
    echo "WARN Model response: $TEST"
    echo "May need troubleshooting. Continue anyway."
fi

# Install deps
echo "Installing dependencies..."
bun install
echo "OK Dependencies installed"

echo ""
echo "═══════════════════════════════════════"
echo "  SETUP COMPLETE"
echo "  Run: bun run dev"
echo "  Model: phi4-mini (3.8B params)"
echo "  Cost: $0.00 per run"
echo "═══════════════════════════════════════"