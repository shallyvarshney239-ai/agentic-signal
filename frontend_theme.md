# 🎯 Workflow Builder UI Theme (Dark – Developer Grade)

This is a production-level UI system specification. You should be able to
directly translate this into Tailwind / CSS / component architecture.

---

# 🧠 DESIGN PHILOSOPHY

- Canvas-first experience
- Low cognitive load
- Strong visual hierarchy
- Functional minimalism (not aesthetic clutter)
- Subtle depth, not flashy gradients

---

# 🎨 COLOR SYSTEM

## 🔳 Base Colors

```css
--bg-primary: #0b0f14; /* Main background */
--bg-secondary: #11161c; /* Panels */
--bg-tertiary: #151b23; /* Elevated surfaces */

--border-subtle: #1f2630;
--border-strong: #2a3440;
```

---

## ✨ Accent System (Clean, Non-AI-looking)

```css
--accent-primary: #14b8a6; /* Teal (main brand) */
--accent-hover: #0ea5a4;

--accent-blue: #3b82f6; /* Data */
--accent-orange: #f59e0b; /* Logic */
--accent-green: #22c55e; /* Integrations */
--accent-purple: #8b5cf6; /* AI nodes (subtle, not dominant) */
```

---

## 📝 Typography Colors

```css
--text-primary: #e6edf3;
--text-secondary: #9aa4af;
--text-muted: #6b7280;
```

---

## ⚡ Feedback Colors

```css
--success: #22c55e;
--warning: #f59e0b;
--error: #ef4444;
```

---

# 🧱 LAYOUT STRUCTURE

```
--------------------------------------------------------
| Topbar                                               |
--------------------------------------------------------
| Left Sidebar | Canvas (Main)       | Right Sidebar   |
|              |                     |                 |
|              |                     |                 |
--------------------------------------------------------
| Floating Controls (Zoom etc.)                       |
--------------------------------------------------------
```

---

# 📐 DIMENSIONS

| Component      | Width / Height |
| -------------- | -------------- |
| Topbar         | 64px height    |
| Left Sidebar   | 260px          |
| Right Sidebar  | 300px          |
| Canvas Padding | 24px           |

---

# 🔝 TOPBAR (Minimal + Functional)

## Structure

```plaintext
[Logo] [Project Name ▼]        [Workflow Name ✏️]

                        [Run ▶] [Save 💾] [⋯] [AI Copilot]
```

## Rules

- Background: `--bg-secondary`
- Border bottom: `1px solid --border-subtle`
- No icons clutter
- AI Copilot = highlighted CTA

---

## Components

### 🟢 Run Button

- Background: `--accent-primary`
- Hover: `--accent-hover`

### ⚪ Save Button

- Ghost button
- Border: subtle

### 🤖 AI Copilot

- Slight glow effect
- Positioned right-most

---

# 📚 LEFT SIDEBAR (PRIMARY INTERACTION)

## Structure

```plaintext
[ Search Nodes 🔍 ]

CORE
- Trigger
- Data
- Logic

AI
- LLM
- Prompt
- Agent

INTEGRATIONS
- API
- Webhook
- Database

UTILITIES
- Timer
- Validator
- Code
```

---

## Styling

- Background: `--bg-secondary`
- Divider: subtle line
- Items:

  - Padding: `10px 12px`
  - Border radius: `8px`
  - Hover: `--bg-tertiary`

---

## Behavior

- Draggable nodes
- Collapsible sections
- Search filters instantly

---

# 🎯 CANVAS (MAIN AREA)

## Background

```css
background-color: #0b0f14;
background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
background-size: 24px 24px;
```

👉 Keep it subtle — avoid noisy patterns

---

## EMPTY STATE

```plaintext
👋 Welcome

Start building your workflow

[ + Add Trigger ]   [ Browse Templates ]

or drag nodes from the left panel
```

---

## Rules

- Center aligned
- CTA is dominant
- No heavy card UI → keep it light

---

# 🧩 NODES DESIGN

## Node Card

```css
background: #11161c;
border: 1px solid #1f2630;
border-radius: 12px;
padding: 12px;
```

---

## Node Types

| Type        | Color  |
| ----------- | ------ |
| Trigger     | Teal   |
| Data        | Blue   |
| Logic       | Orange |
| AI          | Purple |
| Integration | Green  |

---

## Interaction

- Hover → slight scale (1.02)
- Selected → border highlight
- Drag → soft shadow

---

# 📊 RIGHT SIDEBAR (CONTEXT PANEL)

## States

### 1. No Selection

- Templates
- Recent workflows
- Tips

---

### 2. Node Selected

- Config panel
- Inputs / outputs
- API fields

---

## Styling

- Background: `--bg-secondary`
- Cards:

  - Background: `--bg-tertiary`
  - Radius: `10px`

---

# 🎛 FLOATING CONTROLS

## Zoom Panel

```plaintext
[-] 100% [+] [Fit]
```

## Position

- Bottom-center
- Floating glass panel

---

## Styling

```css
background: rgba(17, 22, 28, 0.7);
backdrop-filter: blur(10px);
border: 1px solid var(--border-subtle);
```

---

# 🤖 AI COPILOT (FLOATING)

## Position

- Bottom-right

## Style

- Circular button
- Teal glow
- Subtle pulse animation

---

# ⚡ MICRO INTERACTIONS

- Node drop → bounce animation
- Connect line → smooth curve animation
- Hover → soft elevation
- Click → fast feedback (no delay)

---

# 🧠 UX IMPROVEMENTS

## 1. Guided Flow

After adding first node:

```plaintext
"Now choose next step:"
- Process Data
- Call API
- Use AI
```

---

## 2. Command Palette

Shortcut:

```
Ctrl + K
```

Functions:

- Add node
- Search actions
- Run workflow

---

## 3. Smart Suggestions

Context-aware recommendations after each node

---

# 📏 SPACING SYSTEM

Use **8px grid**

```plaintext
8px → micro spacing
16px → component spacing
24px → section spacing
32px → layout spacing
```

---

# 🧪 IMPLEMENTATION STACK (Recommended)

- React Flow → Canvas
- Tailwind CSS → Styling
- Zustand → State
- Framer Motion → Animations
- Radix UI → Accessibility primitives

---

# 🚫 WHAT TO AVOID

- Too many colors
- Glassmorphism everywhere
- Icon-only buttons
- Overloaded topbar
- Heavy gradients

---

# ✅ FINAL CHECKLIST

- [ ] Can user start in <3 seconds?
- [ ] Is primary action obvious?
- [ ] Is canvas dominant?
- [ ] Is visual hierarchy clear?
- [ ] Does UI feel calm, not chaotic?

---

# 🔥 RESULT

If implemented correctly, your product will feel:

- Professional (not hackathon-grade)
- Fast and intuitive
- Comparable to tools like n8n / Retool / Figma

---

If you want next step: I can convert this into **exact Tailwind + React
components** so you can plug directly into your project without trial-error.
