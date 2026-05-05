import {vi} from 'vitest';
import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

global.ResizeObserver = class ResizeObserver {
    observe () {}
    unobserve () {}
    disconnect () {}
};

global.IntersectionObserver = class IntersectionObserver {
    observe () {}
    unobserve () {}
    disconnect () {}
};

global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue({}),
    text: vi.fn().mockResolvedValue(''),
    blob: vi.fn().mockResolvedValue(new Blob()),
    arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
});

vi.mock('@xyflow/react', async (importOriginal) => {
    const actual = await importOriginal() as any;

    const mockUseStore = vi.fn((selector?: (state: any) => any) => {
        const defaultState = {
            nodes: [],
            edges: [],
            selectedNodes: []
        };

        return selector ? selector(defaultState) : defaultState;
    });

    return {
        ...actual,
        useStore: mockUseStore,
        useReactFlow: vi.fn().mockReturnValue({
            getNodes: vi.fn().mockReturnValue([]),
            getEdges: vi.fn().mockReturnValue([]),
            getNode: vi.fn(),
            setEdges: vi.fn(),
            setNodes: vi.fn(),
            addNodes: vi.fn(),
            deleteElements: vi.fn()
        }),
        ReactFlowProvider: ({children}: {children: any}) => children,
        Background: ({children}: {children?: any}) => children,
        MiniMap: () => null,
        Controls: () => null,
        Panel: ({children}: {children?: any}) => children,
        BackgroundVariant: {Dots: 'dots'},
        Handle: () => null,
        Position: {Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right'}
    };
});

vi.mock('../../../hooks/useSettings', () => ({
    useSettings: () => ({settings: {browserPath: '/usr/bin/chromium'}}),
    SettingsProvider: ({children}: {children: any}) => children,
    SettingsContext: {
        Consumer: ({children}: any) => children({settings: {browserPath: '/usr/bin/chromium'}})
    }
}));

vi.mock('../../../hooks/useNodeValidation', () => ({
    useNodeValidation: () => ({isValid: true, message: null, errors: [], warnings: []})
}));

vi.mock('../../../hooks/useTimerTrigger', () => ({
    useTimerTrigger: vi.fn()
}));

vi.mock('../../../hooks/useRunOnTriggerChange', () => ({
    useRunOnTriggerChange: vi.fn()
}));

vi.mock('../../../hooks/useDebouncedState', () => ({
    useDebouncedState: vi.fn(() => ['', vi.fn()])
}));

vi.mock('../../../utils', async (importOriginal) => {
    const actual = await importOriginal() as any;

    const mockDarkTheme = {
        palette: {
            mode: 'dark',
            primary: {main: '#00685f'},
            background: {default: '#141414', paper: '#1e1e1e'}
        },
        typography: {fontFamily: 'Roboto'}
    };

    return {
        ...actual,
        darkTheme: mockDarkTheme,
        parseUrl: vi.fn((url: string) => url),
        formatContentForDisplay: vi.fn((input: any) => {
            if (input === null || input === undefined) return 'No output available';

            if (typeof input === 'object') return JSON.stringify(input, null, 2);

            return String(input);
        }),
        isoToLocalDatetime: vi.fn((isoString: string) => isoString),
        localDatetimeToIso: vi.fn((localString: string) => localString),
        isTauri: vi.fn(() => false),
        getNodeColor: vi.fn(() => '#00685f'),
        markdownFilePrefix: vi.fn(() => 'file:'),
        markdownImageFilePrefix: vi.fn(() => 'image:')
    };
});

vi.mock('../../BaseNode/utils', () => ({
    runTask: (callback: () => Promise<void>, setRunning: (running: boolean) => void) => {
        setRunning(true);
        callback().finally(() => setRunning(false));
    }
}));

vi.mock('../../HttpNode/services/graphqlService', () => ({
    GraphQLService: {
        renderHtml: vi.fn().mockResolvedValue('<html><body>Test</body></html>')
    }
}));

vi.mock('../../LlmProcessNode/hooks/useAIProcessor', () => ({
    useAIProcessor: vi.fn(() => ({
        processAIRequest: vi.fn().mockResolvedValue('Test result'),
        fetchModels: vi.fn().mockResolvedValue(['llama3', 'mistral', 'codellama']),
        models: ['llama3', 'mistral', 'codellama'],
        isFetchingModels: false,
        error: null,
        clearError: vi.fn()
    }))
}));

vi.mock('../../ToolNode/tools/toolRegistry.gen', () => ({
    toolRegistry: [
        {
            toolSubtype: 'duckduckgo_search',
            title: 'DuckDuckGo Search',
            icon: 'search-icon',
            toolSchema: {
                name: 'duckduckgo_search',
                description: 'Search the web',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {type: 'string'}
                    }
                }
            },
            userConfigSchema: {
                maxResults: {
                    type: 'number',
                    required: true,
                    description: 'Maximum search results'
                }
            },
            handlerFactory: vi.fn((config) => vi.fn().mockResolvedValue({results: []})),
            toSanitize: []
        },
        {
            toolSubtype: 'brave_search',
            title: 'Brave Search',
            icon: 'brave-icon',
            toolSchema: {
                name: 'brave_search',
                description: 'Brave web search'
            },
            userConfigSchema: {},
            handlerFactory: vi.fn(() => vi.fn().mockResolvedValue({results: []})),
            toSanitize: []
        }
    ]
}));

vi.mock('../../TimerNode/services/timerService', () => ({
    graphQLService: {
        startTimer: vi.fn().mockResolvedValue(undefined),
        stopTimer: vi.fn().mockResolvedValue(undefined),
        subscribeToTimer: vi.fn().mockReturnValue(vi.fn()),
        dispose: vi.fn()
    }
}));

vi.mock('../../types/ollama.types', () => ({
    getDefaultUserConfigValues: vi.fn((schema) => {
        if (!schema) return {};

        const defaults: Record<string, any> = {};

        for (const [key, value] of Object.entries(schema || {})) {
            const schemaValue = value as { type: string };

            if (schemaValue.type === 'number') defaults[key] = 0;
            else if (schemaValue.type === 'string') defaults[key] = '';
            else defaults[key] = undefined;
        }

        return defaults;
    }),
    MessageRole: {SYSTEM: 'system', USER: 'user', ASSISTANT: 'assistant'}
}));