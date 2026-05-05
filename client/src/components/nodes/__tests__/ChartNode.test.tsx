import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {ChartNode} from '../ChartNode/ChartNode';
import {renderWithProviders, createChartNodeProps} from './helpers';

describe('ChartNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createChartNodeProps({
                title: 'Chart Display'
            });

            renderWithProviders(<ChartNode {...props} />);
            expect(screen.getByText('Chart Display')).toBeInTheDocument();
        });
    });

    describe('Chart data processing', () => {
        it('processes Chart.js format data', async () => {
            const chartInput = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                datasets: [{
                    label: 'Sales',
                    data: [10, 20, 30, 40],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)'
                }]
            };

            const mockOnResultUpdate = vi.fn();

            const props = createChartNodeProps({
                title: 'Sales Chart',
                input: chartInput,
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<ChartNode {...props} />);
        });

        it('processes simple array format', async () => {
            const chartInput = {
                labels: ['Point 1', 'Point 2', 'Point 3'],
                data: [25, 50, 75]
            };

            const props = createChartNodeProps({
                title: 'Simple Chart',
                input: chartInput
            });

            renderWithProviders(<ChartNode {...props} />);
        });

        it('processes XY point array format', async () => {
            const chartInput = [
                {x: '2024-01', y: 100},
                {x: '2024-02', y: 150},
                {x: '2024-03', y: 200},
                {x: '2024-04', y: 180},
                {x: '2024-05', y: 220}
            ];

            const props = createChartNodeProps({
                title: 'XY Chart',
                input: chartInput
            });

            renderWithProviders(<ChartNode {...props} />);
        });

        it('handles invalid chart data', async () => {
            const invalidInput = {invalid: 'structure'};
            const mockOnFeedbackSend = vi.fn();

            const props = createChartNodeProps({
                title: 'Invalid Chart',
                input: invalidInput,
                onFeedbackSend: mockOnFeedbackSend
            });

            renderWithProviders(<ChartNode {...props} />);
        });
    });

    describe('Output dialog', () => {
        it('opens output dialog when data is available', async () => {
            const chartInput = {
                labels: ['A', 'B', 'C'],
                data: [10, 20, 30]
            };

            const props = createChartNodeProps({
                title: 'Chart Output',
                input: chartInput
            });

            renderWithProviders(<ChartNode {...props} />);

            const outputButton = screen.getByRole('button', {name: /output/i});

            fireEvent.click(outputButton);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with expected input format', async () => {
            const props = createChartNodeProps();

            renderWithProviders(<ChartNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByText(/expected input format/i)).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});