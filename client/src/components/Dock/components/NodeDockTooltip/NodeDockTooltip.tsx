import React from 'react';
import {Tooltip, TooltipProps, tooltipClasses, styled, Box, Typography, Divider, Link} from '@mui/material';
import {AppNodeType} from '../../../nodes/workflow.gen';

const StyledTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}} />
))({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#1e1e2e',
        color: '#ffffff',
        maxWidth: 280,
        fontSize: '13px',
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: '#1e1e2e',
        '&::before': {
            border: '1px solid rgba(255,255,255,0.1)',
        }
    },
});

type RichDescription = {
    desc: string;
    bestFor: string;
    tag: string;
};

const DESCRIPTIONS: Record<AppNodeType, RichDescription> = {
    'data-source': {
        desc: "Provides static data (text, JSON, or file) to your workflow pipeline.",
        bestFor: "Starting a workflow or testing with sample data",
        tag: "Data"
    },
    'http-data': {
        desc: "Sends custom HTTP requests to any REST API with headers and body.",
        bestFor: "Calling external web services",
        tag: "APIs"
    },
    'get-data': {
        desc: "Simple HTTP GET requests for public APIs without complex setup.",
        bestFor: "Fetching data from public APIs quickly",
        tag: "APIs"
    },
    'timer': {
        desc: "Triggers your workflow automatically at set intervals or schedules.",
        bestFor: "Scheduled automations (every hour, daily, etc.)",
        tag: "Scheduling"
    },
    'llm-process': {
        desc: "Sends text to a local AI model (Ollama) for analysis, generation, or summarization.",
        bestFor: "AI-powered text processing",
        tag: "AI"
    },
    'ai-tool': {
        desc: "Gives AI access to tools: search, weather, stocks, email, and more.",
        bestFor: "Making AI agents actionable",
        tag: "AI Tools"
    },
    'json-reformatter': {
        desc: "Transforms and reshapes JSON data — extract, rename, or restructure fields.",
        bestFor: "Data cleaning and preparation",
        tag: "Data Transform"
    },
    'data-validation': {
        desc: "Checks your data against a schema to catch errors before they cause problems.",
        bestFor: "Data quality assurance",
        tag: "Validation"
    },
    'stock-analysis': {
        desc: "Fetches real-time stock prices with technical indicators (SMA, EMA, RSI).",
        bestFor: "Financial analysis and alerts",
        tag: "Finance"
    },
    'async-data-aggregator': {
        desc: "Waits for ALL connected inputs to arrive before processing (parallel data).",
        bestFor: "Combining multiple data sources",
        tag: "Logic"
    },
    'chart': {
        desc: "Displays your data as interactive line, bar, or pie charts.",
        bestFor: "Visualizing workflow results",
        tag: "Visualization"
    },
    'data-flow-spy': {
        desc: "Debug tool — inspects the actual data flowing through your pipeline at any point.",
        bestFor: "Troubleshooting workflows",
        tag: "Debugging"
    }
};

interface NodeDockTooltipProps {
    nodeType: AppNodeType;
    label: string;
    children: React.ReactElement;
}

export function NodeDockTooltip ({nodeType, label, children}: NodeDockTooltipProps) {
    const info = DESCRIPTIONS[nodeType];

    const tooltipContent = (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <Typography variant="subtitle2" sx={{fontWeight: 'bold', fontSize: '14px'}}>
                    {label}
                </Typography>
                {info?.tag && (
                    <Box sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {info.tag}
                    </Box>
                )}
            </Box>

            <Typography variant="body2" sx={{color: '#rgba(255,255,255,0.9)', lineHeight: 1.4}}>
                {info?.desc || "A workflow node."}
            </Typography>

            {info?.bestFor && (
                <Typography variant="body2" sx={{color: '#a0a0b0', mt: 0.5, fontStyle: 'italic'}}>
                    <strong>Best for:</strong> {info.bestFor}
                </Typography>
            )}

            <Divider sx={{borderColor: 'rgba(255,255,255,0.1)', my: 0.5}} />

            <Typography variant="caption" sx={{color: '#888', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>Drag to canvas to use</span>
                <Link href="#" color="primary" sx={{textDecoration: 'none', '&:hover': {textDecoration: 'underline'}}}>
                    Learn more
                </Link>
            </Typography>
        </Box>
    );

    return (
        <StyledTooltip
            title={tooltipContent}
            placement="bottom-end"
            arrow
            enterDelay={200}
            leaveDelay={0}
        >
            {children}
        </StyledTooltip>
    );
}
