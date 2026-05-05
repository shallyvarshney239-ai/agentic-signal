/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useState, useRef, useEffect, useMemo} from 'react';
import {
    Box,
    Drawer,
    IconButton,
    Typography,
    TextField,
    Button,
    Avatar,
    Chip,
    Collapse,
    CircularProgress,
    Select,
    MenuItem,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import {
    OpenBook,
    Send,
    Xmark,
    NavArrowDown,
    NavArrowUp,
    Brain,
    Star,
    LightBulb,
    Trash,
} from 'iconoir-react';
import {v4 as uuidv4} from 'uuid';
import './AICopilotPanel.scss';
import {OllamaService} from '../../services/ollamaService';
import {MessageRole} from '../../types/ollama.types';
import type {AppNode} from '../nodes/workflow.gen';
import type {Edge} from '@xyflow/react';
import {generateWorkflowContext, generateModificationPreview} from '../../utils/workflowContext';

type Message = {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
};

type WorkflowPlan = {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
};

type ModificationPlan = {
    explanation: string;
    changes: {
        addNodes?: WorkflowNode[];
        removeNodeIds?: string[];
        addEdges?: WorkflowEdge[];
        removeEdgeIds?: string[];
    };
};

type WorkflowNode = {
    id: string;
    type: string;
    position: {x: number; y: number};
    data: Record<string, any>;
};

type WorkflowEdge = {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
};

interface AICopilotPanelProps {
    nodes: AppNode[];
    edges: Edge[];
    onAddNodes?: (nodes: AppNode[]) => void;
}

const SYSTEM_PROMPT_BASE = `You are an AI workflow automation agent for Agentic Signal. Your job is to DIRECTLY build and modify workflows on the canvas based on user requests. DO NOT ask for permission — apply changes immediately.

CAPABILITIES:
1. BUILD - Build a complete workflow from described requirements
2. MODIFY - Add/remove nodes and edges on the existing canvas
3. EXPLAIN/TROUBLESHOOT - Help understand and debug workflows

CRITICAL RULES:
- ALWAYS respond with a valid JSON build_workflow or suggest_modification action when the user requests workflow changes
- DO NOT ask "would you like me to..." — just DO it
- DO NOT say "shall I proceed?" or "let me know if you want me to build this" — BUILD IT
- If the canvas is empty and user asks to build something, use build_workflow
- If the canvas has nodes and user asks to add/change, use suggest_modification
- ALL edges MUST include both "sourceHandle": "right-source" AND "targetHandle": "left-target" unless connecting to a timer-trigger or tools-target
- Position new nodes intelligently — space them at least 340px apart horizontally and 152px vertically
- Use EXACT node type strings from the list below
- Every node needs an id, type, position (x,y), and data object
- Sensitive data is automatically masked

AVAILABLE NODE TYPES (use these exact strings):
- data-source: Static data input (JSON or Markdown text)
- get-data: HTTP GET requests to external REST APIs
- http-data: Fetch rendered web pages using headless browser
- timer: Trigger workflow at intervals or on schedule. Data must include \`interval\` (ms), \`intervalMode\` ("interval"), \`runOnce\`
- llm-process: Send text to AI (Ollama) for processing. Data should include \`systemPrompt\`, \`promptPrefix\`, \`promptSuffix\`
- tool: External function wrapper. Data must include \`toolSubtype\` (e.g. "brave-search", "duckduckgo-search", "date-time-now", "sort", "max", "min", "csv-to-array", "stock-analysis-tool", "fetch-weather-data")
- json-reformatter: Transform JSON using JSONata expressions. Data should include \`expression\`
- data-validation: Validate data against JSON schemas. Data should include \`schema\`
- stock-analysis: Technical stock indicators. Data should include \`symbol\`
- async-data-aggregator: Combine multiple data sources. Accepts multiple inputs
- chart: Visualize data as charts. Must be terminal sink node
- data-flow-spy: Debug node to inspect data. Terminal sink node

RESPONSE FORMAT — build_workflow (use when canvas is empty or user wants a completely new workflow):
\`\`\`json
{
  "action": "build_workflow",
  "plan": {
    "nodes": [
      {"id": "node1", "type": "timer", "position": {"x": 100, "y": 100}, "data": {"interval": 300000, "title": "5-Minute Timer"}},
      {"id": "node2", "type": "get-data", "position": {"x": 440, "y": 100}, "data": {"url": "https://api.example.com/data", "dataType": "json", "title": "Fetch Data"}},
      {"id": "node3", "type": "chart", "position": {"x": 780, "y": 100}, "data": {"chartType": "line", "title": "Data Chart"}}
    ],
    "edges": [
      {"id": "edge1", "source": "node1", "target": "node2", "sourceHandle": "timer-trigger", "targetHandle": "timer-trigger"},
      {"id": "edge2", "source": "node2", "target": "node3", "sourceHandle": "right-source", "targetHandle": "left-target"}
    ]
  },
  "explanation": "Built a workflow that fetches data every 5 minutes and displays it as a chart."
}
\`\`\`

RESPONSE FORMAT — suggest_modification (use when canvas has existing nodes and user wants to add/remove/modify):
\`\`\`json
{
  "action": "suggest_modification",
  "explanation": "Adding a timer to automate the data fetch every 15 minutes.",
  "changes": {
    "addNodes": [
      {"id": "new-timer", "type": "timer", "position": {"x": 100, "y": 50}, "data": {"interval": 900000, "title": "15-Minute Timer"}}
    ],
    "removeNodeIds": [],
    "addEdges": [
      {"id": "new-edge", "source": "new-timer", "target": "EXISTING_NODE_ID", "sourceHandle": "timer-trigger", "targetHandle": "timer-trigger"}
    ],
    "removeEdgeIds": []
  }
}
\`\`\`

EDGE/CONNECTION RULES (CRITICAL):
- Timer → Source Node (get-data, data-source, http-data): sourceHandle="timer-trigger", targetHandle="timer-trigger"
- Timer → LLM Process: sourceHandle="timer-trigger", targetHandle="timer-trigger"
- Source/Processor → Processor/Sink (standard data flow): sourceHandle="right-source", targetHandle="left-target"
- Tool → LLM Process: sourceHandle="right-source", targetHandle="tools-target"
- A chart or data-flow-spy MUST be the last node in any chain — they have no output
- async-data-aggregator can accept connections from multiple sources

For general questions or help, respond naturally without JSON.`;

export function AICopilotPanel ({nodes, edges, onAddNodes: _onAddNodes}: AICopilotPanelProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'assistant',
            content: "Hi! I'm your AI workflow builder. Describe the workflow you want, and I'll build it directly on your canvas — no confirmation needed. What would you like to create?",
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedSuggestions, setExpandedSuggestions] = useState(true);
    const [contextLoaded, setContextLoaded] = useState(false);
    const [workflowContext, setWorkflowContext] = useState('');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [clearDialogOpen, setClearDialogOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ollamaService = OllamaService.getInstance();

    useEffect(() => {
        if (open) {
            const context = generateWorkflowContext(nodes, edges);
            setWorkflowContext(context);
            setContextLoaded(true);
        } else {
            setContextLoaded(false);
        }
    }, [open, nodes, edges]);

    useEffect(() => {
        if (open) {
            fetchAvailableModels();
        }
    }, [open]);

    const fetchAvailableModels = async () => {
        setIsLoadingModels(true);
        const res = await ollamaService.fetchModels();

        if (res.success && res.models) {
            const modelNames = res.models.map(m => m.name);

            setAvailableModels(modelNames);
            const storedModel = localStorage.getItem('selectedModel');

            if (storedModel && modelNames.includes(storedModel)) {
                setSelectedModel(storedModel);
            } else if (modelNames.length > 0) {
                setSelectedModel(modelNames[0]);
            } else {
                setSelectedModel('');
            }
        } else {
            setAvailableModels([]);
            setSelectedModel('');
        }

        setIsLoadingModels(false);
    };

    const handleModelChange = (model: string) => {
        setSelectedModel(model);
        localStorage.setItem('selectedModel', model);
    };

    const systemPrompt = useMemo(
        () => `${SYSTEM_PROMPT_BASE}\n\n${workflowContext}`,
        [workflowContext]
    );

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getModel = (): string => {
        return selectedModel;
    };

    const parseResponse = (content: string): {action: string; plan?: any; explanation: string; changes?: any} | null => {
        // Multiple patterns for JSON extraction
        const patterns = [
            /```json\s*([\s\S]*?)```/, // ```json ... ```
            /```\s*([\s\S]*?)```/, // ``` ... ```
            /({[\s\S]*"action"[\s\S]*})/, // Raw JSON with action field
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);

            if (match) {
                try {
                    const parsed = JSON.parse(match[1].trim());

                    if (parsed.action) {
                        console.log('[AI Copilot] JSON parsed successfully:', parsed);

                        return parsed;
                    }
                } catch (e) {
                    continue; // Try next pattern
                }
            }
        }

        console.log('[AI Copilot] No JSON found in response. Content preview:', content.substring(0, 200));

        return null;
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        if (!selectedModel) {
            setMessages(prev => [...prev, {
                id: uuidv4(),
                role: 'assistant',
                content: 'Please select an Ollama model from the dropdown above to continue.',
                timestamp: new Date(),
            }]);

            return;

        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const chatMessages = [
                {role: MessageRole.SYSTEM, content: systemPrompt, images: [] as string[]},
                ...messages.map(m => ({
                    role: m.role === 'user' ? MessageRole.USER : MessageRole.ASSISTANT,
                    content: m.content,
                    images: [] as string[]
                })),
                {role: MessageRole.USER, content: input.trim(), images: [] as string[]}
            ];

            const response = await ollamaService.fetchAIResponse({
                messages: chatMessages,
                model: getModel(),
                maxToolRetries: 1
            });

            if ('reply' in response && response.reply) {
                const parsed = parseResponse(response.reply);

                if (parsed) {
                    console.log('[AI Copilot] Parsed response:', parsed);

                    if (parsed.action === 'build_workflow' && parsed.plan) {
                        const nodeCount = (parsed.plan.nodes || []).length;
                        const edgeCount = (parsed.plan.edges || []).length;

                        const assistantMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: parsed.explanation || `Building a workflow with ${nodeCount} node(s)...`,
                            timestamp: new Date(),
                        };

                        setMessages(prev => [...prev, assistantMessage]);

                        // Auto-build immediately
                        window.dispatchEvent(new CustomEvent('ai-build-workflow', {detail: parsed.plan}));
                        setTimeout(() => setOpen(false), 300);
                    } else if (parsed.action === 'suggest_modification') {
                        const preview = generateModificationPreview(
                            {explanation: parsed.explanation || '', changes: parsed.changes || {}},
                            nodes
                        );
                        const assistantMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: preview,
                            timestamp: new Date(),
                        };

                        setMessages(prev => [...prev, assistantMessage]);

                        // Auto-apply modifications immediately
                        const plan: ModificationPlan = {
                            explanation: parsed.explanation || '',
                            changes: parsed.changes || {}
                        };
                        window.dispatchEvent(new CustomEvent('ai-modify-workflow', {detail: plan}));
                        setTimeout(() => setOpen(false), 300);
                    } else {
                        const assistantMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: response.reply,
                            timestamp: new Date(),
                        };

                        setMessages(prev => [...prev, assistantMessage]);
                    }
                } else {
                    const assistantMessage: Message = {
                        id: uuidv4(),
                        role: 'assistant',
                        content: response.reply,
                        timestamp: new Date(),
                    };

                    setMessages(prev => [...prev, assistantMessage]);
                }
            } else if ('error' in response) {
                const errorMessage: Message = {
                    id: uuidv4(),
                    role: 'assistant',
                    content: `Sorry, I encountered an error: ${response.error}. Make sure Ollama is running and you have a model installed.`,
                    timestamp: new Date(),
                };

                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            const errorMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to connect to Ollama. Please ensure Ollama is running.'}`,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, errorMessage]);
        }

        setLoading(false);
    };

    const handleOpenClearDialog = () => setClearDialogOpen(true);
    const handleCloseClearDialog = () => setClearDialogOpen(false);

    const handleClearChat = () => {
        setMessages([{
            id: uuidv4(),
            role: 'assistant',
            content: "Hi! I'm your AI workflow builder. Describe the workflow you want, and I'll build it directly on your canvas — no confirmation needed. What would you like to create?",
            timestamp: new Date(),
        }]);
        setInput('');
        setClearDialogOpen(false);
    };

    const suggestions = [
        {label: 'Add hourly timer', prompt: 'Add a timer node to trigger my workflow every hour'},
        {label: 'Add AI processing', prompt: 'Add an AI LLM node to process the data after collection'},
        {label: 'Show current workflow', prompt: 'What nodes are on my canvas right now?'},
        {label: 'Create stock monitor', prompt: 'Create a workflow to monitor stock prices every 15 minutes'},
    ];

    return (
        <>
            <Button
                className="ai-copilot-toggle"
                variant="contained"
                startIcon={<OpenBook />}
                onClick={() => setOpen(true)}
            >
                AI Copilot
            </Button>

            <Drawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
                className="ai-copilot-drawer"
                variant="persistent"
                slotProps={{
                    backdrop: {
                        invisible: true
                    }
                }}
            >
                <Box className="ai-copilot-panel">
                    <Box className="ai-copilot-header">
                        <Box className="ai-copilot-title">
                            <Avatar className="ai-avatar">
                                <Brain />
                            </Avatar>
                            <Box>
                                <Typography variant="h6">AI Workflow Copilot</Typography>
                                <FormControl size="small" className="model-selector">
                                    {isLoadingModels ? (
                                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                            <CircularProgress size={14} />
                                            <Typography variant="caption">Loading models...</Typography>
                                        </Box>
                                    ) : availableModels.length > 0 ? (
                                        <Select
                                            value={selectedModel}
                                            onChange={(e) => handleModelChange(e.target.value)}
                                            displayEmpty
                                            size="small"
                                        >
                                            {availableModels.map(model => (
                                                <MenuItem key={model} value={model}>{model}</MenuItem>
                                            ))}
                                        </Select>
                                    ) : (
                                        <Typography variant="caption" color="error">
                                            No models available. Add one in Settings.
                                        </Typography>
                                    )}
                                </FormControl>
                            </Box>
                        </Box>
                        <Box sx={{display: 'flex', gap: 0.5}}>
                            <IconButton onClick={handleOpenClearDialog} title="Clear chat">
                                <Trash />
                            </IconButton>
                            <IconButton onClick={() => setOpen(false)}>
                                <Xmark />
                            </IconButton>
                        </Box>
                    </Box>

                    <Box className="ai-copilot-messages">
                        {messages.map((message) => (
                            <Box
                                key={message.id}
                                className={`message ${message.role}`}
                            >
                                {message.role === 'assistant' && (
                                    <Avatar className="message-avatar assistant">
                                        <Star />
                                    </Avatar>
                                )}
                                <Box className="message-content">
                                    <Typography className="message-text">
                                        {message.content}
                                    </Typography>
                                </Box>
                                {message.role === 'user' && (
                                    <Avatar className="message-avatar user">U</Avatar>
                                )}
                            </Box>
                        ))}

                        {loading && (
                            <Box className="message assistant loading">
                                <Avatar className="message-avatar assistant">
                                    <Star />
                                </Avatar>
                                <Box className="message-content">
                                    <Box className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </Box>
                                </Box>
                            </Box>
                        )}

                        <div ref={messagesEndRef} />
                    </Box>

                    <Box className="ai-copilot-suggestions">
                        <Box
                            className="suggestions-header"
                            onClick={() => setExpandedSuggestions(!expandedSuggestions)}
                        >
                            <Box className="suggestions-title">
                                <LightBulb />
                                <Typography>Quick Examples</Typography>
                            </Box>
                            <IconButton size="small">
                                {expandedSuggestions ? <NavArrowUp /> : <NavArrowDown />}
                            </IconButton>
                        </Box>
                        <Collapse in={expandedSuggestions}>
                            <Box className="suggestions-list">
                                {suggestions.map((suggestion, idx) => (
                                    <Chip
                                        key={idx}
                                        label={suggestion.label}
                                        onClick={() => {
                                            setInput(suggestion.prompt);
                                            handleSend();
                                        }}
                                        className="suggestion-chip"
                                    />
                                ))}
                            </Box>
                        </Collapse>
                    </Box>

                    <Box className="ai-copilot-input">
                        <TextField
                            fullWidth
                            placeholder="Describe your workflow task..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            multiline
                            maxRows={4}
                            disabled={loading}
                            className="input-field"
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={!input.trim() || loading}
                            className="send-button"
                        >
                            {loading ? <CircularProgress size={24} /> : <Send />}
                        </IconButton>
                    </Box>
                </Box>
            </Drawer>

            <Dialog
                open={clearDialogOpen}
                onClose={handleCloseClearDialog}
                PaperProps={{
                    sx: {
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)'
                    }
                }}
            >
                <DialogTitle>Clear Chat History?</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{color: 'var(--text-secondary)'}}>
                        This will delete all messages and start a fresh conversation.
                        Your current workflow on the canvas will not be affected.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{padding: '8px 24px 16px'}}>
                    <Button onClick={handleCloseClearDialog}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClearChat}
                        color="error"
                        variant="contained"
                        sx={{backgroundColor: '#ef4444', '&:hover': {backgroundColor: '#dc2626'}}}
                    >
                        Clear
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}