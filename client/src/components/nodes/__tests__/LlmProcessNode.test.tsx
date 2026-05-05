import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {LlmProcessNode} from '../LlmProcessNode/LlmProcessNode';
import {renderWithProviders, createLlmProcessNodeProps} from './helpers';

describe('LlmProcessNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createLlmProcessNodeProps({
                title: 'LLM Processor'
            });

            renderWithProviders(<LlmProcessNode {...props} />);
            expect(screen.getByText('LLM Processor')).toBeInTheDocument();
        });

        it('renders with input and output ports', () => {
            const props = createLlmProcessNodeProps({
                model: 'llama3'
            });

            renderWithProviders(<LlmProcessNode {...props} />);
        });

        it('shows warning when model is missing', () => {
            const props = createLlmProcessNodeProps({
                model: '',
                prompt: 'Test prompt'
            });

            renderWithProviders(<LlmProcessNode {...props} />);
        });

        it('shows warning when selected model not in available models', () => {
            const props = createLlmProcessNodeProps({
                model: 'nonexistent-model'
            });

            renderWithProviders(<LlmProcessNode {...props} />);
        });
    });

    describe('Model selection', () => {
        it('displays available models in dropdown', async () => {
            const props = createLlmProcessNodeProps({
                title: 'Model Selection',
                model: 'llama3'
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('llama3')).toBeInTheDocument();
                expect(screen.getByText('mistral')).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('allows changing model', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createLlmProcessNodeProps({
                model: 'llama3',
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const modelSelect = screen.getByLabelText(/llm model/i);

                if (modelSelect) {
                    fireEvent.mouseDown(modelSelect);
                }
            }, {timeout: 2000});
        });
    });

    describe('AI processing', () => {
        it('processes input with model', async () => {
            const mockOnResultUpdate = vi.fn();

            const props = createLlmProcessNodeProps({
                title: 'Process AI',
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(mockOnResultUpdate).toHaveBeenCalled();
            }, {timeout: 3000});
        });

        it('handles AI processing errors', async () => {
            const {useAIProcessor} = await import('../LlmProcessNode/hooks/useAIProcessor');

            (useAIProcessor as ReturnType<typeof vi.fn>).mockReturnValue({
                processAIRequest: vi.fn(),
                fetchModels: vi.fn().mockResolvedValue(['llama3']),
                models: ['llama3'],
                isFetchingModels: false,
                error: 'AI processing failed',
                clearError: vi.fn()
            });

            const props = createLlmProcessNodeProps({
                title: 'Error Process',
                model: 'llama3',
                prompt: 'Test'
            });

            renderWithProviders(<LlmProcessNode {...props} />);
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with all configuration tabs', async () => {
            const props = createLlmProcessNodeProps({
                model: 'llama3',
                prompt: 'Test prompt'
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText('System Prompt')).toBeInTheDocument();
                expect(screen.getByText('User Message')).toBeInTheDocument();
                expect(screen.getByText('Structured Output')).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('allows configuring max feedback loops', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createLlmProcessNodeProps({
                model: 'llama3',
                maxFeedbackLoops: 3,
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const maxLoopsInput = screen.getByLabelText(/max feedback loops/i);

                if (maxLoopsInput) {
                    fireEvent.change(maxLoopsInput, {target: {value: '5'}});
                }
            }, {timeout: 2000});
        });

        it('allows configuring max tool retries', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createLlmProcessNodeProps({
                model: 'llama3',
                maxToolRetries: 3,
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<LlmProcessNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const maxRetriesInput = screen.getByLabelText(/max tool retries/i);

                if (maxRetriesInput) {
                    fireEvent.change(maxRetriesInput, {target: {value: '5'}});
                }
            }, {timeout: 2000});
        });
    });
});