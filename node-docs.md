# Agentic Signal - Node Documentation

Welcome to the complete guide for all nodes in Agentic Signal. This document explains each node in simple language, what it does, and how to use it.

---

## Quick Reference

| Node | What It Does | Best For |
|------|--------------|----------|
| **Data Source** | Provides static data | Config files, test data |
| **HTTP Node** | Fetches web pages | Scraping dynamic websites |
| **GET Data** | Calls APIs | External data integration |
| **Timer** | Schedules workflows | Periodic automation |
| **AI LLM** | Processes with AI | Text analysis, generation |
| **AI Tool** | Adds capabilities to AI | Search, calculations, APIs |
| **JSON Reformatter** | Transforms data | Data extraction, reshaping |
| **Data Validation** | Checks data quality | Error prevention |
| **Stock Analysis** | Analyzes financial data | Technical indicators |
| **Async Aggregator** | Combines multiple sources | Parallel data collection |
| **Chart** | Visualizes data | Dashboards, reports |
| **Data Flow Spy** | Debugging tool | Inspect data flow |

---

## 1. Data Source Node

**What it does:** Provides static data to your workflow. Think of it as a data entry point.

### Simple Explanation
You can paste JSON data or write markdown content here. When the workflow runs, this node outputs whatever you entered.

### How to Use It
1. Choose between **JSON** or **Markdown** mode
2. Enter your data in the text area
3. Optionally upload files (for markdown mode)

### Example Use Case
```
[Data Source: API Configuration] --> [HTTP: Call API]
```
Use when you need to provide fixed configuration data or sample data for testing.

---

## 2. Fetch Web Page Node (HTTP)

**What it does:** Loads a web page and returns its HTML content.

### Simple Explanation
Give it a URL and it will fetch that web page using a headless browser. This is useful for pages that need JavaScript to load content - like news sites or SPAs.

### How to Use It
1. Enter the URL of the web page you want to fetch
2. Connect it to a Timer if you want it to run periodically
3. The output is beautified HTML that you can process further

### Example Use Case
```
[Timer: Daily] --> [Fetch Web: news.ycombinator.com] --> [AI LLM: Summarize headlines]
```
Use for scraping dynamic websites that require JavaScript rendering.

---

## 3. GET Data Node

**What it does:** Makes HTTP GET requests to APIs and returns the response data.

### Simple Explanation
Think of it as asking a website for information. You provide a URL, and it returns whatever the API sends back - JSON, text, CSV, etc.

### How to Use It
1. Enter the API URL
2. Choose the expected data format (JSON, text, CSV, XML, etc.)
3. The node will parse and return the data in that format

### Supported Formats
- **JSON**: Parsed as JavaScript objects
- **Text**: Raw text response
- **CSV**: Parsed as array of objects
- **XML**: Returns as string
- **Blob/ArrayBuffer**: Binary data

### Example Use Case
```
[Timer: Every hour] --> [GET Data: weather API] --> [JSON Reformatter: Extract forecast] --> [Chart: Display temps]
```
Use to fetch data from any REST API or external service.

---

## 4. Timer Node

**What it does:** Triggers your workflow on a schedule.

### Simple Explanation
This is like an alarm clock for your workflow. You can set it to trigger every X seconds, or at specific times daily/weekly/monthly.

### Two Modes

#### Interval Mode
Set it to run every X seconds. For example:
- 60 seconds = every minute
- 3600 seconds = every hour
- 86400 seconds = every day

**Options:**
- **Run once**: Stops after the first trigger
- **Trigger immediately**: Runs right away, then repeats

#### Scheduled Mode
Set specific date and time, with optional repetition:
- **Once**: Runs at the scheduled time
- **Daily**: Repeats every day at that time
- **Weekly**: Repeats weekly (choose days)
- **Monthly**: Repeats monthly

### Example Use Case
```
[Timer: Every 5 minutes] --> [GET Data: Stock prices] --> [Stock Analysis] --> [Chart: Price trends]
```
Use to create automated monitoring or reporting workflows.

---

## 5. AI LLM Node (AI Data Processing)

**What it does:** Processes text and data using AI (Large Language Models like Llama, Phi, Gemma).

### Simple Explanation
Send any data to this node and it will process it using AI. You can give it instructions (system prompt), and it will analyze, summarize, transform, or generate content based on your instructions.

### Key Features

#### System Prompt
Write instructions for how the AI should behave. For example:
- "You are a financial analyst"
- "Summarize this article in 3 sentences"
- "Extract the key numbers from this text"

#### Message Modifiers
- **Prefix**: Add before input data
- **Suffix**: Add after input data

#### Structured Output
Define JSON schemas to get AI responses in a specific format.

#### Tool Support
Connect AI Tool nodes to give the AI capabilities like web search or calculations.

### How to Use It
1. Select an AI model (e.g., llama3, phi4-mini)
2. Write your system prompt
3. Connect data from previous nodes
4. Optionally connect AI Tools for enhanced capabilities

### Example Use Case
```
[GET Data: News articles] --> [AI LLM: Extract key events, sentiment] --> [JSON Reformatter: Structure output]
```
Use for text analysis, summarization, classification, entity extraction, or any AI-powered processing.

---

## 6. AI Tool Node

**What it does:** Provides functions/capabilities that AI can use during processing.

### Simple Explanation
This gives your AI "superpowers". Connect it to an AI LLM node, and the AI can call these tools when it needs information or wants to perform actions.

### Available Tools

| Tool | What It Does | When to Use |
|------|--------------|-------------|
| **Stock Analysis** | Calculates technical indicators | Financial analysis |
| **Fetch Weather** | Gets current weather data | Weather-based workflows |
| **Brave Search** | Web search (requires API key) | Research tasks |
| **DuckDuckGo Search** | Free web search | Quick lookups |
| **Gmail Fetch Emails** | Reads emails (requires OAuth) | Email automation |
| **Google Calendar** | Gets calendar events | Scheduling workflows |
| **Google Drive** | Lists files | Document automation |
| **Date/Time Now** | Gets current timestamp | Time-sensitive tasks |
| **Sort/Max/Min** | Array operations | Data manipulation |
| **CSV to Array** | Parses CSV data | Data import |

### How to Use It
1. Select the tool you want to use
2. Configure any required settings (API keys, etc.)
3. Connect the tool output to an AI LLM node

### Example Use Case
```
[AI Tool: Brave Search] --> [AI LLM: Research company news]
```
Use when you want AI to gather real-time information or perform calculations.

---

## 7. JSON Reformatter Node

**What it does:** Transforms and reshapes data using JSONata expressions.

### Simple Explanation
Think of it as a powerful filter and transformer. You write a short expression that tells the node how to extract or reshape your data. It can filter arrays, extract specific fields, perform calculations, and more.

### JSONata Examples

| Expression | What It Does |
|------------|--------------|
| `$.products` | Get all products |
| `$.items[price > 100]` | Filter items over $100 |
| `$.items.name` | Extract all names |
| `$sum($.prices)` | Add up all prices |
| `$keys($)` | Get all object keys |
| `$.date & " - " & $.author` | Concatenate fields |

### How to Use It
1. Enter your JSONata expression
2. Connect data to the input
3. The output is the transformed result

### Example Use Case
```
[GET Data: API response] --> [JSON Reformatter: Extract only prices and dates] --> [Chart: Plot prices]
```
Use to clean up messy API responses, extract specific data, or reshape data for visualization.

---

## 8. Data Validation Node

**What it does:** Checks if data matches an expected format (JSON Schema).

### Simple Explanation
Before your workflow processes data, this node makes sure the data is in the right shape. If it's not, it tells the previous nodes what went wrong so they can fix it.

### How to Use It
1. Write a JSON Schema that describes valid data
2. Connect your data to the input
3. If valid: data passes through
4. If invalid: error feedback is sent to previous nodes

### Example Schema
```json
{
  "type": "object",
  "required": ["symbol", "data"],
  "properties": {
    "symbol": { "type": "string" },
    "data": {
      "type": "array",
      "items": { "type": "number" }
    }
  }
}
```
This schema requires: an object with a string "symbol" and an array of numbers called "data".

### Example Use Case
```
[GET Data: External API] --> [Data Validation: Check response format] --> [AI LLM: Process data]
```
Use to catch bad data early and prevent errors downstream.

---

## 9. Stock Analysis Node

**What it does:** Calculates technical indicators on stock price data.

### Simple Explanation
Feed it stock price data and it computes useful metrics like moving averages, trend direction, volatility, and price changes.

### What It Calculates

| Indicator | What It Means |
|-----------|---------------|
| **pctChange** | Percentage change from previous close |
| **sma5** | 5-day simple moving average |
| **sma10** | 10-day simple moving average |
| **volumeRatio** | Volume compared to average |
| **slope** | Price trend direction |
| **volatility** | How much the price swings |
| **trend** | "up", "down", or "sideways" |

### Expected Input Format
```json
{
  "symbol": "AAPL",
  "data": [
    { "timestamp": "2024-01-01", "open": 180, "high": 182, "low": 179, "close": 181, "volume": 1000000 },
    ...
  ]
}
```

### Example Use Case
```
[GET Data: Stock prices] --> [Stock Analysis: Compute indicators] --> [Chart: Display SMA lines]
```
Use for financial analysis, trading signals, or investment dashboards.

---

## 10. Async Data Aggregator Node

**What it does:** Combines data from multiple nodes and waits until all of them are done.

### Simple Explanation
Imagine you're collecting data from 3 different APIs. This node waits for all three to finish, then combines all the results into one output.

### How to Use It
1. Connect multiple nodes to this node's different input handles
2. The node waits until all connections have sent data
3. When all data arrives, it outputs an array with all results

### Example Use Case
```
[GET Data: Weather]    -----\                    [Async Aggregator] --> [AI LLM: Compare locations]
[GET Data: News]       -----+--> [AI LLM: Summarize] /
[GET Data: Stocks]     -----/                     /
```
Use when you need to gather data from multiple sources before proceeding.

---

## 11. Chart Node (Display Chart)

**What it does:** Displays data as an interactive line chart.

### Simple Explanation
Give it numbers and labels, and it creates a nice line chart that you can view in the workflow.

### Supported Input Formats

**Simple format:**
```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "data": [100, 150, 120]
}
```

**Multi-series format:**
```json
{
  "labels": ["Jan", "Feb", "Mar"],
  "datasets": [
    { "label": "Sales", "data": [100, 150, 120] },
    { "label": "Revenue", "data": [80, 100, 90] }
  ]
}
```

**Point format:**
```json
[{ "x": "Jan", "y": 100 }, { "x": "Feb", "y": 150 }]
```

### Example Use Case
```
[Timer: Daily] --> [GET Data: Energy prices] --> [Chart: Visualize daily prices]
```
Use to create dashboards, show trends, or visualize any numerical data.

---

## 12. Data Flow Spy Node

**What it does:** Shows you what data is passing through at that point in the workflow.

### Simple Explanation
Think of it as a "window" into your workflow. It displays the current data in a readable format so you can see what's happening, then passes the data through unchanged.

### How to Use It
1. Place this node between other nodes
2. Click on it to see what data is flowing through
3. The data continues to the next node unchanged

### What It Shows
- JSON data formatted nicely
- Long content is truncated for readability
- You can see exactly what's being passed between nodes

### Example Use Case
```
[GET Data: API] --> [Data Flow Spy: Check response] --> [JSON Reformatter: Extract fields]
```
Use for debugging, troubleshooting, or understanding how data flows through your workflow.

---

## Connecting Nodes

### Connection Rules

1. **Output (right side) → Input (left side)**
   - Connect from a node's output handle to another node's input handle

2. **Data flows left to right**
   - Left nodes execute first
   - Data moves from left to right

3. **Timer triggers run independently**
   - Timer nodes trigger their connected chain
   - Multiple timers can run in parallel

### Common Patterns

#### Sequential Processing
```
[Data] --> [Transform] --> [Process] --> [Output]
```

#### Parallel with Aggregation
```
[API 1] --> \                    [Combine] --> [Final]
[API 2] --> [Process 1] --> [Aggreg] /
[API 3] --> /                    /
```

#### Scheduled Workflow
```
[Timer] --> [Fetch] --> [Process] --> [Store/Display]
```

---

## Tips and Best Practices

### Start Simple
- Begin with a single path: Timer → Get Data → Output
- Add complexity gradually

### Use Data Flow Spy
- Place it between nodes when debugging
- Check data formats before connecting

### Validate Early
- Use Data Validation before critical processing
- Catch errors before they propagate

### Combine for Power
- Async Aggregator + AI LLM = multi-source analysis
- Timer + HTTP + AI = automated monitoring

### Keep AI Focused
- Write clear system prompts
- Use structured output for predictable results

---

## Need Help?

- **Guide Button**: Click the "Guide" button in the app for step-by-step tutorials
- **Documentation**: Visit [agentic-signal.com](https://agentic-signal.com) for more resources
- **AI Copilot**: Use the AI Copilot to describe your workflow and get help building it