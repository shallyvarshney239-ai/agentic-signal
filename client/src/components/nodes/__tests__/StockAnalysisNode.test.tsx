import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {StockAnalysisNode} from '../StockAnalysisNode/StockAnalysisNode';
import {renderWithProviders, createStockAnalysisNodeProps} from './helpers';

describe('StockAnalysisNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createStockAnalysisNodeProps({
                title: 'Stock Analysis'
            });

            renderWithProviders(<StockAnalysisNode {...props} />);
            expect(screen.getByText('Stock Analysis')).toBeInTheDocument();
        });
    });

    describe('Stock data processing', () => {
        it('processes valid stock data with indicators', async () => {
            const validInput = {
                symbol: 'AAPL',
                data: Array.from({length: 15}, (_, i) => ({
                    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                    open: 100 + i,
                    high: 105 + i,
                    low: 98 + i,
                    close: 103 + i,
                    volume: 1000000 + i * 100000
                }))
            };

            const mockOnResultUpdate = vi.fn();

            const props = createStockAnalysisNodeProps({
                title: 'AAPL Analysis',
                input: validInput,
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<StockAnalysisNode {...props} />);
        });

        it('rejects data with less than 10 points', async () => {
            const insufficientInput = {
                symbol: 'SHORT',
                data: [
                    {date: '2024-01-01', open: 100, high: 105, low: 98, close: 103, volume: 1000000}
                ]
            };

            const mockOnFeedbackSend = vi.fn();

            const props = createStockAnalysisNodeProps({
                title: 'Insufficient Data',
                input: insufficientInput,
                onFeedbackSend: mockOnFeedbackSend
            });

            renderWithProviders(<StockAnalysisNode {...props} />);
        });

        it('handles invalid stock data schema', async () => {
            const invalidInput = {
                symbol: 123,
                data: 'not an array'
            };

            const mockOnFeedbackSend = vi.fn();

            const props = createStockAnalysisNodeProps({
                title: 'Invalid Schema',
                input: invalidInput,
                onFeedbackSend: mockOnFeedbackSend
            });

            renderWithProviders(<StockAnalysisNode {...props} />);
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with expected input format', async () => {
            const props = createStockAnalysisNodeProps();

            renderWithProviders(<StockAnalysisNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText(/expected input format/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});