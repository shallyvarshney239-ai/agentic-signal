import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {JsonReformatterNode} from '../JsonReformatterNode/JsonReformatterNode';
import {renderWithProviders, createJsonReformatterNodeProps} from './helpers';

describe('JsonReformatterNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createJsonReformatterNodeProps({
                title: 'JSON Reformatter'
            });

            renderWithProviders(<JsonReformatterNode {...props} />);
            expect(screen.getByText('JSON Reformatter')).toBeInTheDocument();
        });
    });

    describe('Jsonata expression', () => {
        it('processes valid jsonata expression', async () => {
            const mockInput = {data: {name: 'test', items: [1, 2, 3]}};
            const mockOnResultUpdate = vi.fn();

            const props = createJsonReformatterNodeProps({
                title: 'Transform',
                jsonataExpression: '$.data.name',
                input: mockInput,
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<JsonReformatterNode {...props} />);
        });

        it('handles empty expression', async () => {
            const mockOnResultUpdate = vi.fn();

            const props = createJsonReformatterNodeProps({
                title: 'Empty Expression',
                jsonataExpression: '',
                input: {data: 'test'},
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<JsonReformatterNode {...props} />);
        });

        it('handles invalid jsonata expression error', async () => {
            const mockOnResultUpdate = vi.fn();

            const props = createJsonReformatterNodeProps({
                title: 'Invalid Expression',
                jsonataExpression: '$.invalid[',
                input: {data: 'test'},
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<JsonReformatterNode {...props} />);
        });

        it('processes array operations', async () => {
            const mockInput = {items: [{price: 10}, {price: 20}, {price: 30}]};

            const props = createJsonReformatterNodeProps({
                title: 'Array Filter',
                jsonataExpression: '$.items[price > 15]',
                input: mockInput,
                onResultUpdate: vi.fn()
            });

            renderWithProviders(<JsonReformatterNode {...props} />);
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with expression editor', async () => {
            const props = createJsonReformatterNodeProps({
                jsonataExpression: '$.data'
            });

            renderWithProviders(<JsonReformatterNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});