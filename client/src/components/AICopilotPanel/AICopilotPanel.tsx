/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
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
    Play,
    LightBulb,
    Trash,
    Check,
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
    actions?: WorkflowAction[];
};

type WorkflowAction = {
    type: 'build_workflow' | 'suggest_modification';
    data: WorkflowPlan | ModificationPlan;
    label: string;
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

const SYSTEM_PROMPT_BASE = `You are an AI workflow assistant for Agentic Signal, a visual workflow automation platform.

YOUR CAPABILITIES:
1. BUILD - Create new workflows from scratch based on user requests
2. MODIFY - Suggest improvements to existing workflows (requires user permission)
3. EXPLAIN - Help users understand how nodes work
4. TROUBLESHOOT - Debug workflow issues

IMPORTANT RULES:
- ALWAYS ask permission before modifying or adding nodes to existing workflows
- Explain WHY each change is needed before applying
- Sensitive data (API keys, tokens, passwords) is automatically masked in the context
- Be concise but informative in your responses

NODE TYPES AVAILABLE:
- data-source: Input node for static data (JSON or Markdown text)
- get-data: HTTP GET requests to external REST APIs
- http-data: Fetch rendered web pages using headless browser
- timer: Trigger workflow at intervals (in seconds)
- llm-process: Send text to AI (Ollama) for processing with optional tools
- tool: Call external functions (stock-analysis, weather, search, calculations)
- json-reformatter: Transform and format JSON data using JSONata expressions
- data-validation: Validate data against JSON schemas
- stock-analysis: Get stock market data with technical indicators
- async-data-aggregator: Combine data from multiple sources (waits for all inputs)
- chart: Visualize data as interactive charts (line, bar, pie)
- data-flow-spy: Debug workflow by viewing intermediate data

RESPONSE FORMAT FOR BUILDING WORKFLOWS:
\`\`\`json
{
  "action": "build_workflow",
  "plan": {
    "nodes": [
      {"id": "node1", "type": "timer", "position": {"x": 100, "y": 200}, "data": {"interval": 3600, "title": "Hourly Trigger"}},
      {"id": "node2", "type": "stock-analysis", "position": {"x": 400, "y": 200}, "data": {"symbol": "AAPL"}}
    ],
    "edges": [
      {"id": "edge1", "source": "node1", "target": "node2"}
    ]
  },
  "explanation": "This workflow triggers hourly to fetch AAPL stock prices"
}
\`\`\`

RESPONSE FORMAT FOR SUGGESTING MODIFICATIONS:
\`\`\`json
{
  "action": "suggest_modification",
  "explanation": "I recommend adding a Timer node to trigger the workflow every hour. This will automate the data fetching process.",
  "changes": {
    "addNodes": [
      {"id": "new-timer", "type": "timer", "position": {"x": 50, "y": 100}, "data": {"interval": 3600, "title": "Hourly Timer"}}
    ],
    "addEdges": [
      {"id": "new-edge", "source": "new-timer", "target": "existing-node-id"}
    ]
  }
}
\`\`\`

For general questions or help, respond naturally without using the JSON format.`;

export function AICopilotPanel ({nodes, edges, onAddNodes: _onAddNodes}: AICopilotPanelProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: uuidv4(),
            role: 'assistant',
            content: "Hi! I'm your AI workflow assistant. I can see your current workflow on the canvas. Describe what you'd like to do, and I'll help you build or modify your workflow.",
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
    const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'done' | 'error'>('idle');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const ollamaService = OllamaService.getInstance();

    useEffect(() => {
        if (open && !contextLoaded) {
            const context = generateWorkflowContext(nodes, edges);

            setWorkflowContext(context);
            setContextLoaded(true);
        }

        if (!open) {
            setContextLoaded(false);
        }
    }, [open, contextLoaded, nodes, edges]);

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

    const validateNodeStructure = (plan: WorkflowPlan): {valid: boolean; error?: string} => {
        if (!plan || typeof plan !== 'object') {
            return {valid: false, error: 'Invalid workflow plan'};
        }

        if (!Array.isArray(plan.nodes) || plan.nodes.length === 0) {
            return {valid: false, error: 'No nodes in workflow plan'};
        }

        for (const node of plan.nodes) {
            if (!node.type) {
                return {valid: false, error: `Node ${node.id || 'unknown'} is missing a type`};
            }

            if (!node.position) {
                return {valid: false, error: `Node ${node.id || 'unknown'} is missing position`};
            }
        }

        return {valid: true};
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
        }

        setBuildStatus('idle');

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
                        const label = `Build Workflow (${nodeCount} node${nodeCount !== 1 ? 's' : ''}${edgeCount > 0 ? `, ${edgeCount} edge${edgeCount !== 1 ? 's' : ''}` : ''})`;

                        const assistantMessage: Message = {
                            id: uuidv4(),
                            role: 'assistant',
                            content: parsed.explanation || 'Here is a workflow I built for you:',
                            timestamp: new Date(),
                            actions: [
                                {
                                    type: 'build_workflow',
                                    data: parsed.plan as WorkflowPlan,
                                    label
                                }
                            ]
                        };

                        setMessages(prev => [...prev, assistantMessage]);
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
                            actions: [
                                {
                                    type: 'suggest_modification',
                                    data: parsed as unknown as ModificationPlan,
                                    label: 'Apply Changes'
                                }
                            ]
                        };

                        setMessages(prev => [...prev, assistantMessage]);
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

    const handleBuildWorkflow = (plan: WorkflowPlan) => {
        const validation = validateNodeStructure(plan);

        if (!validation.valid) {
            setMessages(prev => [...prev, {
                id: uuidv4(),
                role: 'assistant',
                content: `Cannot build: ${validation.error}`,
                timestamp: new Date(),
            }]);

            return;
        }

        setBuildStatus('building');

        // Add a status message showing what will be built
        const nodeList = plan.nodes.map(n => `• ${n.data?.title || n.type}`).join('\n');
        const edgeCount = (plan.edges || []).length;

        setMessages(prev => [...prev, {
            id: uuidv4(),
            role: 'assistant',
            content: `Building workflow with ${plan.nodes.length} node${plan.nodes.length !== 1 ? 's' : ''}:\n${nodeList}${edgeCount > 0 ? `\n\n${edgeCount} connection${edgeCount !== 1 ? 's' : ''} included` : ''}`,
            timestamp: new Date(),
        }]);

        const event = new CustomEvent('ai-build-workflow', {detail: plan});

        window.dispatchEvent(event);

        // Close after a brief delay so the event can be processed
        setTimeout(() => {
            setBuildStatus('done');
            setOpen(false);
        }, 300);
    };

    const handleSuggestModification = (plan: ModificationPlan) => {
        const event = new CustomEvent('ai-modify-workflow', {detail: plan});

        window.dispatchEvent(event);

        setTimeout(() => {
            setOpen(false);
        }, 300);
    };

    const dismissAction = (messageId: string, actionIndex: number) => {
        setMessages(prev => prev.map(m => {
            if (m.id !== messageId) return m;

            const updatedActions = (m.actions || []).filter((_, i) => i !== actionIndex);

            return {...m, actions: updatedActions};
        }));
    };

    const handleOpenClearDialog = () => setClearDialogOpen(true);
    const handleCloseClearDialog = () => setClearDialogOpen(false);

    const handleClearChat = () => {
        setMessages([{
            id: uuidv4(),
            role: 'assistant',
            content: "Hi! I'm your AI workflow assistant. I can see your current workflow on the canvas. Describe what you'd like to do, and I'll help you build or modify your workflow.",
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

                                    {message.actions && message.actions.length > 0 && (
                                        <Box className="message-actions">
                                            {message.actions.map((action, idx) => (
                                                <Box key={idx} className="action-wrapper">
                                                    {action.type === 'suggest_modification' && (
                                                        <Box className="confirm-actions">
                                                            <IconButton
                                                                onClick={() => handleSuggestModification(action.data as ModificationPlan)}
                                                                className="accept-button"
                                                                title="Accept changes"
                                                            >
                                                                <Check />
                                                            </IconButton>
                                                            <IconButton
                                                                onClick={() => dismissAction(message.id, idx)}
                                                                className="decline-button"
                                                                title="Decline changes"
                                                            >
                                                                <Xmark />
                                                            </IconButton>
                                                        </Box>
                                                    )}
                                                    {action.type === 'build_workflow' && (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            startIcon={buildStatus === 'building' ? <CircularProgress size={16} color="inherit" /> : <Play />}
                                                            onClick={() => handleBuildWorkflow(action.data as WorkflowPlan)}
                                                            className="action-button build"
                                                            disabled={buildStatus === 'building'}
                                                        >
                                                            {buildStatus === 'building' ? 'Building...' : action.label}
                                                        </Button>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
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