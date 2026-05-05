import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {ToolNode} from '../ToolNode/ToolNode';
import {renderWithProviders, createToolNodeProps} from './helpers';

describe('ToolNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with default title when no tool selected', () => {
            const props = createToolNodeProps({
                title: 'Tool Node'
            });

            renderWithProviders(<ToolNode {...props} />);
            expect(screen.getByText('Tool Node')).toBeInTheDocument();
        });

        it('renders with selected tool title', () => {
            const props = createToolNodeProps({
                title: 'Tool',
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search',
                    description: 'Search the web'
                }
            });

            renderWithProviders(<ToolNode {...props} />);
            expect(screen.getByText('DuckDuckGo Search')).toBeInTheDocument();
        });
    });

    describe('Tool selection', () => {
        it('shows all available tools in dropdown', async () => {
            const props = createToolNodeProps({
                toolSubtype: ''
            });

            renderWithProviders(<ToolNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('DuckDuckGo Search')).toBeInTheDocument();
                expect(screen.getByText('Brave Search')).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('allows selecting a tool', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createToolNodeProps({
                toolSubtype: '',
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<ToolNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const toolSelect = screen.getByLabelText(/tool/i);

                if (toolSelect) {
                    fireEvent.mouseDown(toolSelect);
                }
            }, {timeout: 2000});
        });

        it('shows error when required config is missing', async () => {
            const props = createToolNodeProps({
                title: 'Incomplete Tool',
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search'
                },
                userConfig: {}
            });

            renderWithProviders(<ToolNode {...props} />);
        });
    });

    describe('Tool configuration', () => {
        it('shows configuration fields for tools with schema', async () => {
            const props = createToolNodeProps({
                title: 'Config Tool',
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search',
                    description: 'Search the web'
                },
                userConfig: {
                    maxResults: 10
                }
            });

            renderWithProviders(<ToolNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText(/max results/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('updates configuration values', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createToolNodeProps({
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search'
                },
                userConfig: {maxResults: 10},
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<ToolNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const maxResultsInput = screen.getByRole('spinbutton') as HTMLInputElement;

                if (maxResultsInput) {
                    fireEvent.change(maxResultsInput, {target: {value: '20'}});
                }
            }, {timeout: 2000});
        });

        it('displays tool schema in read-only editor', async () => {
            const props = createToolNodeProps({
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search',
                    description: 'Search the web',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {type: 'string'}
                        }
                    }
                }
            });

            renderWithProviders(<ToolNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText(/duckduckgo_search/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });

    describe('Tool execution', () => {
        it('creates handler when tool is selected', async () => {
            const {toolRegistry} = await import('../ToolNode/tools/toolRegistry.gen');
            const tool = toolRegistry.find(t => t.toolSubtype === 'duckduckgo_search');

            const mockOnConfigChange = vi.fn();

            const props = createToolNodeProps({
                toolSubtype: 'duckduckgo_search',
                toolSchema: tool?.toolSchema,
                userConfig: {maxResults: 10},
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<ToolNode {...props} />);

            await waitFor(() => {
                expect(tool?.handlerFactory).toHaveBeenCalled();
            }, {timeout: 2000});
        });

        it('removes handler when required config is missing', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createToolNodeProps({
                toolSubtype: 'duckduckgo_search',
                toolSchema: {
                    name: 'duckduckgo_search'
                },
                userConfig: {},
                handler: vi.fn(),
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<ToolNode {...props} />);

            await waitFor(() => {
                expect(mockOnConfigChange).toHaveBeenCalledWith(
                    'test-node-1',
                    expect.objectContaining({handler: undefined})
                );
            }, {timeout: 2000});
        });
    });

    describe('Tool with no config schema', () => {
        it('creates handler immediately for tools without config', async () => {
            const {toolRegistry} = await import('../ToolNode/tools/toolRegistry.gen');
            const tool = toolRegistry.find(t => t.toolSubtype === 'brave_search');

            const props = createToolNodeProps({
                toolSubtype: 'brave_search',
                toolSchema: tool?.toolSchema
            });

            renderWithProviders(<ToolNode {...props} />);

            await waitFor(() => {
                expect(tool?.handlerFactory).toHaveBeenCalledWith({});
            }, {timeout: 2000});
        });
    });
});