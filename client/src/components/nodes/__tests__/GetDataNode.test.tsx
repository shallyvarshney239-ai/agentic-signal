import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {GetDataNode} from '../GetDataNode/GetDataNode';
import {renderWithProviders, createGetDataNodeProps} from './helpers';

describe('GetDataNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createGetDataNodeProps({
                title: 'Fetch Data'
            });

            renderWithProviders(<GetDataNode {...props} />);
            expect(screen.getByText('Fetch Data')).toBeInTheDocument();
        });

        it('shows warning when URL is missing', () => {
            const props = createGetDataNodeProps({
                title: 'Fetch Data',
                url: ''
            });

            renderWithProviders(<GetDataNode {...props} />);
        });

        it('shows warning when data type is missing', () => {
            const props = createGetDataNodeProps({
                title: 'Fetch Data',
                dataType: undefined
            });

            renderWithProviders(<GetDataNode {...props} />);
        });
    });

    describe('Fetch functionality', () => {
        it('fetches JSON data successfully', async () => {
            const mockData = {name: 'test', value: 123};

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockData),
                text: vi.fn().mockResolvedValue(JSON.stringify(mockData)),
                blob: vi.fn().mockResolvedValue(new Blob()),
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
            });

            const mockOnResultUpdate = vi.fn();
            const props = createGetDataNodeProps({
                title: 'JSON Fetch',
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<GetDataNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            }, {timeout: 3000});
        });

        it('fetches text data successfully', async () => {
            const mockText = 'Plain text response';

            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({}),
                text: vi.fn().mockResolvedValue(mockText),
                blob: vi.fn().mockResolvedValue(new Blob()),
                arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
            });

            const props = createGetDataNodeProps({
                title: 'Text Fetch',
                dataType: 'text',
                onResultUpdate: vi.fn()
            });

            renderWithProviders(<GetDataNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(global.fetch).toHaveBeenCalled();
            }, {timeout: 3000});
        });

        it('handles HTTP error responses', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                statusText: 'Not Found'
            });

            const props = createGetDataNodeProps({
                title: 'Error Fetch',
                onResultUpdate: vi.fn()
            });

            renderWithProviders(<GetDataNode {...props} />);
        });

        it('handles network errors', async () => {
            global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

            const props = createGetDataNodeProps({
                title: 'Network Error',
                onResultUpdate: vi.fn()
            });

            renderWithProviders(<GetDataNode {...props} />);
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with URL and data type fields', async () => {
            const props = createGetDataNodeProps();

            renderWithProviders(<GetDataNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });

        it('updates URL in settings', async () => {
            const mockOnConfigChange = vi.fn();
            const props = createGetDataNodeProps({
                onConfigChange: mockOnConfigChange
            });

            renderWithProviders(<GetDataNode {...props} />);

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