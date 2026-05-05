import {vi} from 'vitest';
import React, {ReactNode} from 'react';
import {render, RenderOptions} from '@testing-library/react';
import {ReactFlowProvider} from '@xyflow/react';
import {ThemeProvider, createTheme} from '@mui/material';

const mockTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {main: '#00685f'},
        background: {default: '#141414', paper: '#1e1e1e'}
    },
    typography: {fontFamily: 'Roboto'},
    components: {
        MuiTooltip: {
            defaultProps: {
                arrow: true
            },
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1e1e1e',
                    color: '#fff',
                    fontSize: '0.875rem'
                },
                arrow: {
                    color: '#1e1e1e'
                }
            }
        }
    }
});

export interface MockNodeData {
    title: string;
    onConfigChange: (id: string, config: any) => void;
    onResultUpdate: (id: string, result?: any) => void;
    onFeedbackSend?: (id: string, message: any) => void;
    toSanitize?: string[];
    input?: any;
    dataSource?: { type: string; value: any };
    url?: string;
    dataType?: string;
    mode?: string;
    interval?: number;
    immediate?: boolean;
    runOnce?: boolean;
    scheduledDateTime?: string;
    repeat?: string;
    timezone?: string;
    jsonataExpression?: string;
    schema?: string;
    model?: string;
    prompt?: string;
    message?: { preffix: string; suffix: string };
    format?: { onSuccess: string; onError: string };
    maxFeedbackLoops?: number;
    maxToolRetries?: number;
    conversationHistory?: any[];
    toolSubtype?: string;
    toolSchema?: any;
    userConfig?: any;
    handler?: any;
    [key: string]: any;
}

export interface TestWrapperProps {
    children: ReactNode;
}

export function TestWrapper ({children}: TestWrapperProps) {
    return (
        <ThemeProvider theme={mockTheme as any}>
            <ReactFlowProvider>
                    {children}
                </ReactFlowProvider>
        </ThemeProvider>
    );
}

export function renderWithProviders (
    ui: React.ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) {
    return render(ui, {wrapper: TestWrapper, ...options});
}

export function createMockNodeProps (overrides: Partial<MockNodeData> = {}): any {
    const mockOnConfigChange = vi.fn();
    const mockOnResultUpdate = vi.fn();
    const mockOnFeedbackSend = vi.fn();

    return {
        id: 'test-node-1',
        type: 'test',
        zIndex: 0,
        draggable: true,
        selected: false,
        deletable: true,
        dragging: false,
        selectable: true,
        data: {
            title: 'Test Node',
            onConfigChange: mockOnConfigChange,
            onResultUpdate: mockOnResultUpdate,
            onFeedbackSend: mockOnFeedbackSend,
            toSanitize: [],
            ...overrides
        } as MockNodeData
    };
}

export function createDataSourceNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        dataSource: {
            type: 'json',
            value: '{}'
        },
        input: {},
        ...overrides
    });
}

export function createGetDataNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        url: 'https://api.example.com/data',
        dataType: 'json',
        input: {},
        ...overrides
    });
}

export function createTimerNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        mode: 'interval',
        interval: 60,
        immediate: false,
        runOnce: false,
        scheduledDateTime: '2025-01-01T00:00',
        repeat: 'once',
        timezone: 'UTC',
        input: {},
        ...overrides
    });
}

export function createLlmProcessNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        model: 'llama3',
        prompt: 'You are a helpful assistant.',
        message: {preffix: '', suffix: ''},
        format: {onSuccess: '', onError: ''},
        maxFeedbackLoops: 3,
        maxToolRetries: 3,
        conversationHistory: [],
        input: {},
        ...overrides
    });
}

export function createJsonReformatterNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        jsonataExpression: '$.data',
        input: {data: 'test'},
        ...overrides
    });
}

export function createDataValidationNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        schema: '{"type": "object"}',
        input: {name: 'test', value: 123},
        ...overrides
    });
}

export function createHttpNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        url: 'https://example.com',
        input: {},
        ...overrides
    });
}

export function createChartNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        input: null,
        ...overrides
    });
}

export function createDataFlowSpyNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        input: {data: 'test'},
        ...overrides
    });
}

export function createAsyncDataAggregatorNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        input: {},
        ...overrides
    });
}

export function createStockAnalysisNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        input: {
            symbol: 'AAPL',
            data: Array.from({length: 15}, (_, i) => ({
                date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                open: 100 + i,
                high: 105 + i,
                low: 98 + i,
                close: 103 + i,
                volume: 1000000 + i * 100000
            }))
        },
        ...overrides
    });
}

export function createToolNodeProps (overrides: Partial<MockNodeData> = {}) {
    return createMockNodeProps({
        toolSubtype: '',
        toolSchema: undefined,
        userConfig: {},
        handler: undefined,
        toSanitize: [],
        ...overrides
    });
}

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));