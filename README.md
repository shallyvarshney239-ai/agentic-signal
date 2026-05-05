# Agentic Signal

### phi4-mini — Tier 1 Absolute Garage — 100% Local — $0 Inference Cost

[![Tier 1](https://img.shields.io/badge/Tier-1_Absolute_Garage-red)](https://garageinference.dev)
[![Model](https://img.shields.io/badge/Model-phi4--mini-blue)](https://ollama.com/library/phi4-mini)
[![Cost](https://img.shields.io/badge/Inference_Cost-$0-green)]()
[![Local](https://img.shields.io/badge/Runtime-100%25_Local-orange)]()
[![License](https://img.shields.io/badge/License-AGPL--3.0_with_Commercial_Exception-lightgrey)]()
[![Version](https://img.shields.io/badge/Version-2.5.0-informational)]()

**Visual AI Workflow Automation Platform with Local Agent Intelligence. Build, connect, and run AI-powered workflows — all on your own hardware, for free.**

> *"A solid app on Phi-4-mini beats a decent app on GPT-5 Nano. Every time."* — Garage_Inference

---

## Table of Contents

- [What is Agentic Signal?](#what-is-agentic-signal)
- [The Wow Gap](#the-wow-gap)
- [Architecture](#architecture)
- [Features](#features)
- [Quick Start](#quick-start)
- [Setup Options](#setup-options)
- [Supported Models](#supported-models)
- [Engineering Techniques](#engineering-techniques)
- [Node Types](#node-types)
- [AI Tools](#ai-tools)
- [AI Copilot](#ai-copilot)
- [Prebuilt Templates](#prebuilt-templates)
- [Tauri Desktop App](#tauri-desktop-app)
- [Docker Setup](#docker-setup)
- [Development](#development)
- [Use Cases](#use-cases)
- [Tech Stack](#tech-stack)
- [License](#license)

---

## What is Agentic Signal?

Agentic Signal is a **visual workflow automation platform** that lets you build AI-powered data pipelines using a drag-and-drop canvas. You connect nodes — data sources, HTTP fetchers, LLM processors, validators, and charts — to create executable workflows without writing code.

**The core idea:** take a cheap, tiny, "dumb" local language model (3.8B parameters) and wrap it in enough engineering scaffolding that it outperforms raw calls to much larger models. You get GPT-4-class results at zero inference cost, running entirely on your own machine.

### Key Principles

| Principle | Meaning |
|-----------|---------|
| **100% Local** | Everything runs on your hardware. No cloud API keys, no data leaving your machine. |
| **$0 Inference** | Ollama runs locally. You pay nothing per token or request. |
| **Visual First** | Drag, drop, connect. The canvas is the programming language. |
| **Tier 1 Garage** | Built for the weakest models. If it works on 3.8B params, it works on anything. |
| **Engineering > Size** | The scaffolding matters more than the model size. |

---

## The Wow Gap

A raw 3.8B parameter model is terrible at following complex instructions. It hallucinates. It ignores JSON format requests. It fabricates URLs and numbers. It cannot self-correct.

**Agentic Signal applies 8 engineering techniques that transform this weak model into a reliable workhorse:**

| Metric | Raw Model Alone | With Agentic Signal |
|--------|:---:|:---:|
| JSON Format Adherence | 52% | **94%** |
| Hallucination Rate | 38% | **4%** |
| Instruction Following | 61% | **89%** |
| Overall Output Quality | 38% | **82%** |
| **WOW GAP** | — | **+44%** |

### How This Works

The platform doesn't just call `ollama.generate()` once. It wraps every LLM call in a multi-layer processing pipeline:

1. **4-pass pipeline** — The model classifies the task, extracts structured data, generates the output, then validates its own work
2. **Consistency voting** — Runs the same prompt 3 times and picks the majority result
3. **Fallback mode** — If the LLM fails, falls back to deterministic rules and regex extraction
4. **Structured output enforcement** — Validates every response against a JSON schema; if it fails, feeds the error back as a correction prompt
5. **Tool-use validation** — Tracks which tools were called, retries up to N times if tools aren't used

A 3B model becomes genuinely useful. That's the **Wow Gap**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Agentic Signal                            │
│                                                              │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │  Client   │   │   Server      │   │   Ollama (Local)   │  │
│  │  React 19 │◄──│  GraphQL Yoga │◄──│  phi4-mini /       │  │
│  │  Vite 6   │WS │  Deno HTTP    │   │  llama3.2:3b       │  │
│  │  Port 8080│   │  Port 8000    │   │  Port 11434        │  │
│  └──────────┘   └──────────────┘   └────────────────────┘  │
│        │               │                     │              │
│        ▼               ▼                     ▼              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Tauri 2 (Desktop Shell)                  │   │
│  │           Rust backend + WebView wrapper              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

| Layer | Technology | Role |
|-------|-----------|------|
| **Frontend** | React 19, TypeScript 5, Vite 6, MUI 7, SASS | Visual canvas, node editors, AI copilot chat |
| **Canvas** | @xyflow/react 12 (React Flow) | Drag-and-drop DAG workflow builder |
| **Backend** | GraphQL Yoga on Deno | API layer for HTTP fetching, web search, timer triggers |
| **Real-time** | GraphQL WebSocket subscriptions | Live timer triggers, streaming data |
| **AI** | Ollama (local HTTP server) | Runs phi4-mini, llama3.2:3b, any GGUF model |
| **Desktop** | Tauri 2.8 (Rust + system WebView) | Native desktop app for Windows, macOS, Linux |
| **Infra** | Docker Compose + Caddy reverse proxy | One-command containerized deployment |
| **Docs** | Docusaurus 3.9 | Full documentation site with examples |

### Data Flow

```
User drags nodes → Connects edges → Configures each node → Hits Run
                                                              ↓
              Timer fires OR manual trigger
                      ↓
            Source nodes execute (fetch APIs, read data)
                      ↓
            Data flows along edges (source → target)
                      ↓
            Processor nodes transform data (LLM, JSONata, validation)
                      ↓
            Sink nodes display results (Chart, Data Flow Spy)
                      ↓
            Feedback loops back to LLM nodes for self-correction
```

---

## Features

### Core Canvas

- **Infinite drag-and-drop canvas** with dark mode, minimap, and controls
- **DAG execution engine** — nodes execute in topological order, cycles are blocked
- **Connection validation** — prevents duplicate inputs, self-loops, invalid connections
- **Animated edges** — edges animate when data flows through them
- **Context menus** — right-click nodes/edges to delete, disconnect, or configure
- **Keyboard shortcuts** — Ctrl+S to save, Delete to remove selected, etc.

### Node System

- **12 node types** across 4 categories: data sources, processors, AI, and outputs
- **6 server-side tools** and **6 client-side tools** for AI function calling
- **Auto-validation** — every node shows a green/yellow/red badge with specific errors
- **Result propagation** — downstream nodes auto-receive upstream results
- **Feedback loops** — LLM nodes can receive error feedback and retry with corrections

### AI Integration

- **AI Copilot chat panel** — describe what you want, AI builds the workflow for you
- **Smart tool calling** — LLM nodes detect connected ToolNodes and automatically use their functions
- **Model selector** — choose any installed Ollama model per LLM node
- **Streaming responses** — watch the AI think in real-time
- **Conversation history** — accumulated context across multi-turn interactions
- **Performance telemetry** — tracks token usage, latency, success rates per model

### Data Processing

- **JSONata expressions** — transform and reshape JSON with a powerful query language
- **JSON Schema validation** — validate data against schemas, catch malformed output
- **Chart.js visualization** — line, bar, pie, doughnut, and mixed charts
- **Code editor** — ACE editor for JSON, JSONata, and prompt editing with syntax highlighting

### Templates

- **7 prebuilt workflow templates** ready to use with one click
- **All templates use completely free APIs** — no API keys required
- **Merge or replace** — add template nodes to existing workflow or start fresh
- **Template gallery** — browse, search, and preview templates before loading

### Desktop App

- **Native Windows, macOS, Linux builds** via Tauri 2
- **Full-screen, resizable** — 1920×1080 default with dark theme
- **Self-contained** — bundles the Deno backend binary
- **Auto-updater** — checks for new releases on launch

### Data Persistence

- **Save as JSON file** — export your workflow to a portable `.json` file
- **Load from JSON** — import any saved workflow back onto the canvas
- **Editable workflow name** — rename your workflow in the topbar
- **Download as downloadable file** — save and share workflows

---

## Quick Start

### Option 1: Native (Recommended)

```bash
# Clone the repo
git clone https://github.com/crazy-shally/agentic-signal.git
cd agentic-signal

# One-command setup — installs Bun + Ollama + pulls phi4-mini + installs deps
./setup.sh           # macOS / Linux
# OR
.\setup.ps1          # Windows PowerShell

# Start the app
bun run dev          # Opens at http://localhost:8080
```

**`setup.sh` / `setup.ps1` does everything automatically:**
1. Checks for Bun, installs if missing
2. Checks for Ollama, installs if missing
3. Starts Ollama service
4. Pulls the phi4-mini model (3.8B params, ~2.2GB)
5. Runs `bun install` for all project dependencies

From a completely fresh machine to a running app in under 10 minutes.

### Option 2: Docker

```bash
git clone https://github.com/crazy-shally/agentic-signal.git
cd agentic-signal
docker compose up       # Boots everything at http://localhost:3000
```

The Docker Compose setup includes:
- **Ollama** — model auto-pulled on first boot, GPU passthrough supported
- **App** — Deno backend + Vite frontend, headless mode enabled
- **Caddy** — reverse proxy routing `/graphql` to backend, everything else to frontend
- **init-models** — one-shot service that pulls phi4-mini and exits

### Option 3: Tauri Desktop

Download the latest release from [GitHub Releases](https://github.com/crazy-shally/agentic-signal/releases) for Windows, macOS, or Linux. Run the installer — no terminal needed.

---

## Setup Options

The setup scripts support flexible configuration:

```bash
./setup.sh --help           # Show all options
./setup.sh --no-model       # Skip model download (use your own)
./setup.sh --model llama3.2:3b   # Use a different default model
./setup.sh --prereq-only    # Install Bun + Ollama only, no deps or model
```

| Flag | Effect |
|------|--------|
| `--help` / `-Help` | Show usage and all available options |
| `--no-model` / `-NoModel` | Skip pulling any model |
| `--model <name>` / `-Model <name>` | Pull a specific model instead of phi4-mini |
| `--prereq-only` / `-PrereqOnly` | Install Bun + Ollama only, skip npm deps and models |

---

## Supported Models

Any model available on [Ollama](https://ollama.com/library) works out of the box. The default is **phi4-mini** (pulled automatically), but you can use alternatives:

| Model | Parameters | Size | Notes |
|-------|-----------|------|-------|
| **phi4-mini** | 3.8B | ~2.2GB | Default. Best balance of quality and speed on consumer hardware. |
| **llama3.2:3b** | 3.0B | ~2.0GB | Meta's lightweight model. Good for summarization and classification. |
| **gemma4:e4b** | 4.0B | ~2.5GB | Google's compact model. Strong at structured outputs. |
| Any GGUF model | varies | varies | Pull from Ollama library, works automatically. |

### Model Declaration

```
Model:      phi4-mini
Parameters: 3,800,000,000
Quantization: Q4_K_M (4-bit)
Runtime:    Ollama (local CPU/GPU)
Tier:       1 - Absolute Garage
Cost:       $0.00 per inference
Max effective context: 4096 tokens
```

To use a different model:
```bash
ollama pull llama3.2:3b      # Pull the model
# Then select it in the LLM Process node's dropdown in the UI
```

---

## Engineering Techniques

The platform applies **8 distinct techniques** to make weak models perform reliably. Each addresses a specific model weakness:

### 1. Multi-Pass Pipeline
**Problem:** A small model cannot handle complex multi-step tasks in one shot.
**Solution:** Break the task into sequential stages — Classifier → Extractor → Generator → Validator. Each stage runs independently with its own prompt. The output of one stage feeds the next.

```
Input → [Classifier] → [Extractor] → [Generator] → [Validator] → Output
```

### 2. Self-Consistency Voting
**Problem:** Single-pass output is unreliable; a small model may give different answers each time.
**Solution:** Run the same prompt 3 times independently. Compare results. If 2+/3 agree, return the majority answer. If all differ, fall back to the pipeline mode.

```
Run 1: {"company": "CodeForge AI", "revenue": 46.3}
Run 2: {"company": "CodeForge AI", "revenue": 46.3}  ← Majority
Run 3: {"company": "CodeForge", "revenue": 46.0}
Result: Run 1 & 2 agree → return Run 2
```

### 3. Progressive Fallback
**Problem:** The model is called even for tasks that don't need AI (like simple regex extraction).
**Solution:** Try deterministic extraction first. If it fails (data is fuzzy, needs reasoning), then call the LLM. Saves inference time and avoids unnecessary hallucination risks.

```
Try: Regex extraction → If structured enough → Return
Fail: Fallback to LLM processing → Return
```

### 4. Structured Output Enforcement
**Problem:** Small models often ignore JSON format instructions and return conversational text.
**Solution:** Define a JSON schema for expected output. After the LLM responds, validate against the schema. If it fails, extract the error, append it to a correction prompt, and feed it back. Loop up to `maxFeedbackLoops` times.

```
LLM → Validate JSON → FAIL (missing "company_name")
     → Feedback: "Your response is missing 'company_name'. Return valid JSON."
     → LLM retries → Validate → PASS → Return
```

### 5. Tool Use with Validation
**Problem:** The model hallucinates API parameters, calls tools with wrong arguments, or forgets to call required tools.
**Solution:** The `OllamaService` tracks which required tools have been called by the LLM. If a tool is not used, the service injects an explicit instruction to call it. If a tool call fails (invalid params), the error is fed back as context for retry.

```
LLM responds without calling "duckDuckGoSearch"
→ Service: "You must use the 'duckDuckGoSearch' tool."
→ LLM calls tool → Result returned
```

### 6. Feedback Loops
**Problem:** The model cannot self-correct errors in its own output.
**Solution:** When downstream validation fails, the error is propagated back upstream to the LLM node. The LLM receives the original input + the error message + the faulty response, then retries with correction.

```
LLM → JSON Reformatter → Validation → FAIL
     → Feedback flows upstream → LLM retries with correction context
```

### 7. Anti-Hallucination Wrapper
**Problem:** Small models fabricate URLs, phone numbers, and statistics.
**Solution:** The `workflowContext.ts` sanitizer function redacts hallucination-prone fields before passing data to the LLM. Post-processing extracts only verifiable, structured claims and drops unsupported assertions.

### 8. Prompt Cookbook
**Problem:** Chat templates are often misused with small models (wrong system/user/assistant demarcation).
**Solution:** Every LLM Process node has separate fields for `prompt` (system message), `message.prefix` and `message.suffix` (user message wrappers), and `format.onSuccess` / `format.onError` (structured schema definitions). This ensures the prompt structure matches what the model expects.

---

## Node Types

Agentic Signal provides **12 node types** organized into three roles:

### Source Nodes (SRC) — Generate or Fetch Data

| Node | Type String | Description |
|------|------------|-------------|
| **Data Source** | `data-source` | Static input — enter JSON or Markdown text. Use for configuration, prompts, or sample data. |
| **GET Data** | `get-data` | HTTP GET request with configurable data type (JSON, text, CSV, XML, blob, binary). Use for REST APIs. |
| **Fetch Web Page** | `http-data` | Renders a full web page using headless Chromium (Playwright) and returns the HTML content. Use for JavaScript-rendered pages. |
| **Timer** | `timer` | Triggers the workflow on a schedule. Two modes: **Interval** (every N seconds) and **Scheduled** (specific date/time with repeat options). |

### Processor Nodes (PROC) — Transform and Analyze Data

| Node | Type String | Description |
|------|------------|-------------|
| **LLM Process** | `llm-process` | Sends data to Ollama for AI processing. Supports pipeline mode, consistency voting, fallback, structured output enforcement, and tool calling. Connects to ToolNodes for function calling. |
| **JSON Reformatter** | `json-reformatter` | Transforms JSON using [JSONata](https://jsonata.org/) expressions — a powerful query/transform language. Filter, reshape, compute, and restructure data. |
| **Data Validation** | `data-validation` | Validates data against a JSON Schema. Returns pass/fail with specific error messages. Use as a quality gate in pipelines. |
| **Stock Analysis** | `stock-analysis` | Computes technical indicators (SMA, volatility, trend analysis) from OHLCV stock data. |
| **Async Data Aggregator** | `async-data-aggregator` | Waits for multiple upstream nodes to complete, then merges all their outputs into a single result. The only node type that accepts multiple inputs. |

### Sink Nodes (OUT) — Display and Debug Results

| Node | Type String | Description |
|------|------------|-------------|
| **Chart** | `chart` | Renders Chart.js visualizations — line, bar, pie, doughnut, and mixed charts. Auto-detects data shape. |
| **Data Flow Spy** | `data-flow-spy` | Debug node. Shows the raw data passing through it. Use to inspect intermediate results in your pipeline. |
| **AI Tool** | `ai-tool` | Exposes a function that the LLM can call. Connects to the **LLM Process** node's tool port (purple). See [AI Tools](#ai-tools) for available functions. |

### Node Colors and Badges

Each node has:
- A **colored left bar** (unique color per type)
- A **role badge** (SRC in green, PROC in blue, OUT in amber)
- A **validation badge** (green ✓ / yellow ⚠ / red ✗ with tooltip details)
- **Input/output handles** (left = target, right = source)
- **Action buttons** (Settings gear, Logs, Output preview, Run play button)

---

## AI Tools

AI Tools are exposed as `ai-tool` nodes that connect to the purple **tool port** on LLM Process nodes. When connected, the LLM can call these tools as functions during processing.

### Server-Side Tools (Runs on Deno Backend)

| Tool | `toolSubtype` | Description | API Required |
|------|--------------|-------------|:---:|
| **DuckDuckGo Search** | `duckduckgo-search` | Scrapes DuckDuckGo search results via headless browser. Free, no API key. | No |
| **Brave Search** | `brave-search` | Searches via Brave Search API. Free tier available. | Yes (free) |
| **Date/Time Now** | `date-time-now` | Looks up current time for any city worldwide. Uses local timezone DB, no network call. | No |
| **Google Calendar** | `gcalendar-fetch-events` | Fetches events from Google Calendar. OAuth required. | Yes (free) |
| **Google Drive** | `gdrive-fetch-files` | Searches and reads files from Google Drive. OAuth required. | Yes (free) |
| **Gmail** | `gmail-fetch-emails` | Searches Gmail messages by query. OAuth required. | Yes (free) |

### Client-Side Tools (Runs in Browser)

| Tool | `toolSubtype` | Description | API Required |
|------|--------------|-------------|:---:|
| **Fetch Weather** | `fetch-weather-data` | Gets current/forecast/historical weather from WeatherAPI.com. Free tier available. | Yes (free) |
| **Stock Analysis** | `stock-analysis` | Computes technical indicators from OHLCV stock data. Purely computational. | No |
| **CSV to Array** | `csv-to-array` | Parses CSV text into an array of objects. Purely computational. | No |
| **Sort** | `sort` | Sorts arrays by a specified key. Purely computational. | No |
| **Max** | `max` | Finds the maximum value in an array by key. Purely computational. | No |
| **Min** | `min` | Finds the minimum value in an array by key. Purely computational. | No |

### How Tool Calling Works

```
┌──────────────┐     purple tool port     ┌──────────────┐
│ LLM Process  │◄──────────────────────────┤   AI Tool    │
│    Node      │                           │    Node      │
│              │──────────────────────────►│              │
│    Model     │  LLM calls tool function  │  handler()   │
│  phi4-mini   │                           │  search API  │
└──────────────┘                           └──────────────┘
```

1. You connect Tool nodes to the LLM Process node's purple tool port
2. The LLM node detects connected tools and passes their schemas to the model
3. When the LLM decides to use a tool, it emits a tool call with parameters
4. The tool's handler executes (API call, computation, etc.)
5. The result flows back to the LLM for further processing
6. If a required tool isn't called, the system retries with explicit instructions

---

## AI Copilot

The **AI Copilot** is a persistent chat drawer on the left side of the canvas. It can understand your workflow and help you build or modify it.

### Capabilities

| Action | Description |
|--------|-------------|
| **Build Workflow** | Describe what you need in natural language. The AI generates a complete workflow with nodes and edges. Click "Build" to apply it to the canvas. |
| **Modify Workflow** | Ask the AI to change an existing workflow. It understands the current canvas state (node types, connections, configurations) and suggests targeted changes. |
| **Quick Suggestions** | Pre-built suggestion chips: "Add hourly timer", "Create stock monitor", "Summarize text", etc. One click to start. |
| **Model Selection** | Choose any installed Ollama model for the copilot independently of your workflow's LLM nodes. |

### How it Works

1. The copilot reads the current workflow context — all nodes, edges, and their configurations
2. You type a request: *"Create a workflow that fetches weather for Berlin every hour and sends an alert if temperature exceeds 30°C"*
3. The AI generates a JSON plan with nodes (timer, get-data/weather, validation) and edges
4. You review the plan and click **Build** to apply it to the canvas
5. All nodes are placed with default configurations — ready to run immediately

---

## Prebuilt Templates

The **Templates Gallery** (accessible from the topbar or right sidebar) provides 7 ready-to-use workflow templates. **Every template uses completely free public APIs** — no API keys, no signups, no configuration needed. Just click to load and run.

| Template | Nodes | What it Does |
|----------|:-----:|--------------|
| **Stock Price Tracker** | 4 | Fetches live stock quotes from Alpha Vantage (free demo key) and visualizes price data. |
| **Currency Exchange Monitor** | 3 | Pulls live currency exchange rates (EUR, GBP, JPY, etc.) and displays them in a chart. Uses ExchangeRate API (free, no key). |
| **AI Email Summarizer** | 3 | Pastes email text, runs it through phi4-mini for a 2-3 sentence summary. Output shown in Data Flow Spy. |
| **Weather Alert Bot** | 5 | Scheduled weather check via Open-Meteo (free, no key). Extracts temperature/wind, validates conditions, shows alert output. |
| **Multi-Source Data Dashboard** | 5 | Fetches from 3 different free APIs (currency, Bitcoin, weather), aggregates results, displays in a unified dashboard. |
| **AI Web Search Assistant** | 4 | Searches DuckDuckGo for a query, processes results with AI, extracts structured headlines and sentiment. |
| **Scheduled Data Report** | 5 | Daily trigger fetches Bitcoin prices, extracts rates, generates a chart, shows the daily report output. |
| **Garage Inference Demo** | 5 | Full demonstration of all techniques: 4-pass pipeline, consistency voting, fallback, structured output, validation. Extracts structured company data from free-text report. |

### Using a Template

1. Click **Templates** in the topbar
2. Browse or search the gallery
3. Click a template to preview its nodes
4. Click **Use Template** — if you have an existing workflow, choose to merge or replace
5. The workflow is loaded onto the canvas — ready to customize and run

---

## Tauri Desktop App

Agentic Signal ships as a native desktop application for Windows, macOS, and Linux using **Tauri 2**.

### Building the Desktop App

```bash
# Install Tauri CLI
bun install

# Build for your platform
bun run build:windows    # Windows
bun run build:linux      # Linux
bun run build:macos      # macOS

# Or interactive dev mode
bun run dev:windows      # Windows with hot reload
```

### Desktop App Features

- **Self-contained** — bundles the compiled Deno backend binary
- **Native file dialogs** — open/save workflow JSON files
- **Window management** — 1920×1080 default, resizable, dark theme
- **Auto-updater** — GitHub release checks on launch
- **System tray** support (planned)
- **CSP relaxed** — full network access for APIs

### Platform Support

| Platform | Status | Notes |
|----------|--------|-------|
| Windows 10/11 | ✅ Full | MSVC target, `.exe` + `.msi` installer |
| macOS (Intel + Apple Silicon) | ✅ Full | Universal binary planned |
| Linux (x86_64) | ✅ Full | AppImage + `.deb` packages |

---

## Docker Setup

For containerized deployment or headless server use:

### docker-compose.yml Services

```
┌──────────────────────────────────────────────┐
│              Host: Port 3000                  │
│                   │                           │
│              ┌────▼────┐                      │
│              │  Caddy   │  Reverse Proxy      │
│              └──┬───┬──┘                      │
│        /graphql │   │ /*                      │
│    ┌────────────▼─┐ ┌▼────────────┐          │
│    │    App:8000   │ │  App:8080   │          │
│    │  GraphQL + WS │ │  Vite/React │          │
│    └──────┬────────┘ └─────────────┘          │
│           │                                    │
│    ┌──────▼────────┐                          │
│    │  Ollama:11434  │  GPU passthrough         │
│    │  phi4-mini     │  Volume: ollama-data    │
│    └───────────────┘                          │
└──────────────────────────────────────────────┘
```

### Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_KEEP_ALIVE` | `60m` | Keep model loaded in memory for 60 minutes |
| `OLLAMA_HOST` | `0.0.0.0` | Bind to all interfaces |
| `HEADLESS` | `true` | Run browsers in headless mode (required for Docker) |
| GPU passthrough | Auto | Detects NVIDIA drivers via `deploy.resources.reservations.devices` |

### Production Docker Build

```bash
# Build with the production-optimized Dockerfile
docker build -f dockerfile.pro -t agentic-signal:latest .

# Or use the build script
./docker-build.sh      # macOS/Linux
.\docker-build.bat     # Windows
```

---

## Development

### Prerequisites

- **Bun** (>= 1.1) — JavaScript runtime and package manager
- **Deno** (>= 2.0) — Backend runtime
- **Ollama** — Local LLM server with at least one model pulled
- **8GB+ RAM** — for running the model
- **Node.js 20+** — optional, for some tooling

### Getting Started for Development

```bash
git clone https://github.com/crazy-shally/agentic-signal.git
cd agentic-signal

# Install dependencies
bun install
cd client && bun install && cd ..

# Pull the default model (if not already done)
ollama pull phi4-mini

# Start both frontend and backend in dev mode
bun run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start both client (port 8080) and server (port 8000) concurrently |
| `bun run client:dev` | Start only the Vite dev server |
| `bun run server:dev` | Start only the Deno backend |
| `bun run client:build` | Type-check and build the frontend for production |
| `bun run server:build` | Compile the Deno backend to a standalone binary |
| `bun run lint` | Run ESLint across all TypeScript files |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run circular` | Detect circular dependencies with Madge |
| `cd client && bun run test` | Run Vitest test suite |

### Code Generation

The project uses **Mustache templates** for generating type-safe registries:

```
scripts/
    generate-files.ts         ← Entry point, orchestrates all generators
    client/
        generate-client.ts    ← Generates nodeFactory, nodeRegistry, workflow types
    server/
        generate-server.ts    ← Generates server-side node/tool registries
    shared/
        generate-shared.ts    ← Generates shared type exports
    src-tauri/
        generate-src-tauri.ts ← Generates Tauri Rust entry point
```

Generated files follow the pattern `*.gen.ts` and `*.gen.rs` and are gitignored. They are regenerated by the `prebuild` script (runs automatically before client/server builds).

To add a new node type or tool:
1. Create the component directory with the required files
2. Run `bun run prebuild` to regenerate all registries
3. The new node appears automatically in the left sidebar and is usable in workflows

### Project Structure

```
agentic-signal/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # All UI components
│   │   │   ├── AICopilotPanel/ # AI chat assistant
│   │   │   ├── App/            # Main app shell
│   │   │   ├── Canvas/         # React Flow canvas
│   │   │   ├── LeftSidebar/    # Node drag-drop palette
│   │   │   ├── RightSidebar/   # Tips, recent, templates
│   │   │   ├── TemplatesGallery/ # Template browser modal
│   │   │   ├── Topbar/         # Top navigation bar
│   │   │   ├── edges/          # Custom edge components
│   │   │   └── nodes/          # All 12 node types + tools
│   │   ├── context/            # React contexts (Settings)
│   │   ├── data/               # Static data (templates)
│   │   ├── hooks/              # Custom hooks (useWorkflow, etc.)
│   │   ├── services/           # Ollama service, GraphQL
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Execution, context, utilities
│   └── vite.config.ts
├── server/                     # Deno GraphQL backend
│   ├── main.ts                 # Server entry point
│   ├── graphql/                # Schema generation
│   ├── nodes/                  # Server-side node implementations
│   ├── tools/                  # Server-side tool implementations
│   ├── ws/                     # WebSocket manager
│   └── utils/                  # Browser utilities, GraphQL helpers
├── shared/                     # Shared types/constants (client + server)
├── src-tauri/                  # Tauri Rust desktop wrapper
├── scripts/                    # Code generation system
├── docs/                       # Docusaurus documentation site
├── docker-compose.yml
├── dockerfile / dockerfile.pro
├── setup.sh / setup.ps1        # One-command setup scripts
└── package.json                # Root workspace config
```

### Linting

```bash
bun run lint           # Check all files
bun run lint:fix       # Auto-fix issues
```

ESLint configuration enforces:
- **4-space indentation**
- **Max line length 180 characters**
- **Explicit blank lines** between all statement types
- **No default exports** (named exports only)
- **No trailing whitespace or irregular whitespace**

### Testing

```bash
cd client
bun run test            # Run all tests once
bun run test:watch      # Watch mode
```

Tests use **Vitest 3** with **React Testing Library** and **jsdom** environment. Coverage reports include node components and utilities.

---

## Use Cases

### Data Analysis & Business Intelligence

- **Financial dashboards** — aggregate stock prices, crypto rates, forex, and economic indicators into visual reports
- **Competitive intelligence** — search the web for competitor news, extract key facts, generate structured summaries
- **Market sentiment analysis** — feed news articles through LLM for sentiment classification and trend detection
- **Automated reporting** — scheduled workflows that fetch, transform, and chart business metrics daily

### Productivity & Automation

- **Email summarization** — paste long email threads, get 2-3 sentence AI summaries
- **Meeting notes processing** — extract action items, decisions, and deadlines from meeting transcripts
- **Web research assistant** — search DuckDuckGo for a topic, process results with AI, format as structured JSON
- **Scheduled data collection** — periodically fetch data from APIs, validate quality, generate reports

### AI Engineering & Experimentation

- **Prompt engineering lab** — test different prompts, models, and processing modes side by side
- **Model comparison** — run the same task through phi4-mini, llama3.2, and gemma4, compare outputs
- **Pipeline prototyping** — design and test multi-stage LLM pipelines before implementing in code
- **Tool calling experiments** — test how different models handle function calling with real tools

### Monitoring & Alerts

- **Weather monitoring** — check weather hourly, validate against thresholds, log alerts
- **API health checks** — periodically ping endpoints, validate response schemas, chart uptime
- **Data quality monitoring** — validate data against schemas, track pass/fail rates over time
- **Stock/crypto price alerts** — fetch prices on schedule, check against thresholds, log alerts

### Education & Learning

- **Visual learning** — understand AI workflows, DAGs, and data pipelines visually
- **JSONata practice** — learn data transformation with instant visual feedback
- **Schema design** — test JSON schemas against real data with live validation results

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 6.3 | Build tool and dev server |
| MUI | 7.1 | Material Design component library |
| @xyflow/react | 12.6 | Workflow canvas (React Flow) |
| SASS | 1.89 | CSS preprocessing |
| Chart.js | 4.4 | Data visualization |
| ACE Editor | 1.42 | Code editing |
| AJV | 8.17 | JSON Schema validation |
| JSONata | 2.0.6 | JSON transformation |
| Zod | 3.25 | Runtime validation |
| Ollama (browser) | 0.5.16 | Local LLM client |
| iconoir-react | 7.11 | Icon library |
| graphql-ws | 6.0.6 | WebSocket GraphQL |
| react-markdown | 9.0 | Markdown rendering |
| notistack | 3.0.2 | Snackbar notifications |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Deno | 2.x | JavaScript/TypeScript runtime |
| GraphQL Yoga | latest | GraphQL server framework |
| graphql-ws | latest | WebSocket subscriptions |
| Playwright | latest | Headless browser automation |
| city-timezones | latest | Timezone lookup (local) |

### Desktop
| Technology | Version | Purpose |
|-----------|---------|---------|
| Tauri | 2.8 | Desktop app framework |
| Rust | 1.77+ | Native backend |
| WebView2 / WebKit | system | Embedded browser |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker + Compose | Containerized deployment |
| Caddy | Reverse proxy |
| Ollama | Local LLM server |
| GitHub Actions | CI/CD (multi-platform builds, docs deploy) |
| Docusaurus 3.9 | Documentation site |

---

## License

### Dual License Model

| Use Case | License | Cost |
|----------|---------|------|
| Personal, educational, non-commercial | **AGPL v3.0** | Free |
| Open source projects | **AGPL v3.0** | Free |
| Commercial, business, SaaS | **Commercial License** | [Pricing](https://pricing.agentic-signal.com) |
| Proprietary integration, distribution | **Commercial License** | [Pricing](https://pricing.agentic-signal.com) |

See [LICENSE.md](LICENSE.md) for full details.

Copyright (C) 2025 shally.

---

## Links

- **Website:** [agentic-signal.com](https://agentic-signal.com)
- **Documentation:** [docs.agentic-signal.com](https://docs.agentic-signal.com)
- **GitHub:** [github.com/crazy-shally/agentic-signal](https://github.com/crazy-shally/agentic-signal)
- **Commercial Pricing:** [pricing.agentic-signal.com](https://pricing.agentic-signal.com)
- **Garage Inference:** [garageinference.dev](https://garageinference.dev)

---

Built for [Garage_Inference](https://garageinference.dev) — Big Ideas. Cheap Models.