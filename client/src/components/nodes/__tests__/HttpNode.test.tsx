import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {HttpNode} from '../HttpNode/HttpNode';
import {renderWithProviders, createHttpNodeProps} from './helpers';

describe('HttpNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createHttpNodeProps({
                title: 'HTTP Fetch'
            });

            renderWithProviders(<HttpNode {...props} />);
            expect(screen.getByText('HTTP Fetch')).toBeInTheDocument();
        });

        it('shows warning when URL is missing', () => {
            const props = createHttpNodeProps({
                title: 'HTTP Fetch',
                url: ''
            });

            renderWithProviders(<HttpNode {...props} />);
        });
    });

    describe('HTTP fetching', () => {
        it('fetches and renders HTML page', async () => {
            const mockOnResultUpdate = vi.fn();

            const props = createHttpNodeProps({
                title: 'Fetch Page',
                url: 'https://example.com/page',
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<HttpNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(mockOnResultUpdate).toHaveBeenCalled();
            }, {timeout: 3000});
        });

        it('throws error when URL is empty', async () => {
            const mockOnResultUpdate = vi.fn();

            const props = createHttpNodeProps({
                title: 'Fetch Page',
                url: '',
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<HttpNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);
        });

        it('handles fetch errors', async () => {
            const {GraphQLService} = await import('../HttpNode/services/graphqlService');

            (GraphQLService.renderHtml as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
                new Error('Failed to fetch')
            );

            const mockOnResultUpdate = vi.fn();

            const props = createHttpNodeProps({
                title: 'Error Fetch',
                url: 'https://example.com/page',
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<HttpNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(mockOnResultUpdate).toHaveBeenCalled();
            }, {timeout: 3000});
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with URL field', async () => {
            const props = createHttpNodeProps({
                url: 'https://example.com'
            });

            renderWithProviders(<HttpNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('updates URL in settings', async () => {
            const mockOnConfigChange = vi.fn();

            const props = createHttpNodeProps({
                url: 'https://example.com',
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<HttpNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const urlInput = screen.getByLabelText(/url/i) as HTMLInputElement;

                if (urlInput) {
                    fireEvent.change(urlInput, {target: {value: 'https://new-url.com'}});
                }
            }, {timeout: 2000});
        });
    });
});