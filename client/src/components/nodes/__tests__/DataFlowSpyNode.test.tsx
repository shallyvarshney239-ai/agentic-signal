import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {DataFlowSpyNode} from '../DataFlowSpyNode/DataFlowSpyNode';
import {renderWithProviders, createDataFlowSpyNodeProps} from './helpers';

describe('DataFlowSpyNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createDataFlowSpyNodeProps({
                title: 'Data Spy'
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
            expect(screen.getByText('Data Spy')).toBeInTheDocument();
        });
    });

    describe('Data formatting', () => {
        it('displays JSON object', async () => {
            const mockInput = {name: 'test', value: 123};

            const props = createDataFlowSpyNodeProps({
                title: 'JSON Spy',
                input: mockInput
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });

        it('displays array data', async () => {
            const mockInput = [1, 2, 3, 4, 5];

            const props = createDataFlowSpyNodeProps({
                title: 'Array Spy',
                input: mockInput
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });

        it('displays string data', async () => {
            const mockInput = 'Plain text content';

            const props = createDataFlowSpyNodeProps({
                title: 'String Spy',
                input: mockInput
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });

        it('displays number data', async () => {
            const mockInput = 42;

            const props = createDataFlowSpyNodeProps({
                title: 'Number Spy',
                input: mockInput
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });

        it('handles null input', async () => {
            const props = createDataFlowSpyNodeProps({
                title: 'Null Spy',
                input: null
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });

        it('handles undefined input', async () => {
            const props = createDataFlowSpyNodeProps({
                title: 'Undefined Spy',
                input: undefined
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);
        });
    });

    describe('Output dialog', () => {
        it('opens output dialog', async () => {
            const props = createDataFlowSpyNodeProps({
                title: 'Spy Output',
                input: {data: 'test'}
            });

            renderWithProviders(<DataFlowSpyNode {...props} />);

            const outputButton = screen.getByRole('button', {name: /output/i});

            fireEvent.click(outputButton);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});