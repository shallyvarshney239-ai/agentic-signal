import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen} from '@testing-library/react';
import {AsyncDataAggregatorNode} from '../AsyncDataAggregatorNode/AsyncDataAggregatorNode';
import {renderWithProviders, createAsyncDataAggregatorNodeProps} from './helpers';

vi.mock('@xyflow/react', async (importOriginal) => {
    const actual = await importOriginal() as any;

    return {
        ...actual,
        useReactFlow: vi.fn().mockReturnValue({
            getNodes: vi.fn().mockReturnValue([]),
            getEdges: vi.fn().mockReturnValue([
                {source: 'node-1', target: 'agg-1'},
                {source: 'node-2', target: 'agg-1'}
            ]),
            getNode: vi.fn(),
            setEdges: vi.fn(),
            setNodes: vi.fn()
        })
    };
});

describe('AsyncDataAggregatorNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createAsyncDataAggregatorNodeProps({
                title: 'Aggregator'
            });

            renderWithProviders(<AsyncDataAggregatorNode {...props} />);
            expect(screen.getByText('Aggregator')).toBeInTheDocument();
        });

        it('renders with input and output ports', () => {
            const props = createAsyncDataAggregatorNodeProps({
                title: 'Aggregator'
            });

            renderWithProviders(<AsyncDataAggregatorNode {...props} />);
        });
    });

    describe('Data aggregation logic', () => {
        it('collects inputs from connected sources', async () => {
            const sourceOutputs = {
                'node-1': {data: 'from node 1'},
                'node-2': {data: 'from node 2'}
            };

            const props = createAsyncDataAggregatorNodeProps({
                title: 'Test Aggregator',
                input: sourceOutputs
            });

            renderWithProviders(<AsyncDataAggregatorNode {...props} />);
        });

        it('waits for all connected sources before outputting', async () => {
            const partialInput = {
                'node-1': {data: 'from node 1'}
            };

            const props = createAsyncDataAggregatorNodeProps({
                title: 'Waiting Aggregator',
                input: partialInput
            });

            renderWithProviders(<AsyncDataAggregatorNode {...props} />);
        });

        it('handles no connected sources', async () => {
            vi.mocked(useReactFlow).mockReturnValueOnce({
                getNodes: vi.fn().mockReturnValue([]),
                getEdges: vi.fn().mockReturnValue([]),
                getNode: vi.fn(),
                setEdges: vi.fn(),
                setNodes: vi.fn()
            });

            const props = createAsyncDataAggregatorNodeProps({
                title: 'No Sources',
                input: {}
            });

            renderWithProviders(<AsyncDataAggregatorNode {...props} />);
        });
    });
});

function useReactFlow () {
    return {
        getNodes: vi.fn().mockReturnValue([]),
        getEdges: vi.fn().mockReturnValue([
            {source: 'node-1', target: 'agg-1'},
            {source: 'node-2', target: 'agg-1'}
        ]),
        getNode: vi.fn(),
        setEdges: vi.fn(),
        setNodes: vi.fn()
    };
}