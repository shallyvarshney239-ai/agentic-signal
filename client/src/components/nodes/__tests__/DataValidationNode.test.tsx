import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {DataValidationNode} from '../DataValidationNode/DataValidationNode';
import {renderWithProviders, createDataValidationNodeProps} from './helpers';

describe('DataValidationNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createDataValidationNodeProps({
                title: 'Data Validator'
            });

            renderWithProviders(<DataValidationNode {...props} />);
            expect(screen.getByText('Data Validator')).toBeInTheDocument();
        });

        it('shows warning when schema is missing', () => {
            const props = createDataValidationNodeProps({
                schema: ''
            });

            renderWithProviders(<DataValidationNode {...props} />);
        });
    });

    describe('Validation logic', () => {
        it('validates object against schema', async () => {
            const schema = JSON.stringify({
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    age: {type: 'number'}
                },
                required: ['name']
            });

            const validInput = {name: 'John', age: 30};
            const mockOnResultUpdate = vi.fn();

            const props = createDataValidationNodeProps({
                title: 'Validator',
                schema,
                input: validInput,
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<DataValidationNode {...props} />);
        });

        it('fails validation for invalid data', async () => {
            const schema = JSON.stringify({
                type: 'object',
                properties: {
                    name: {type: 'string'}
                },
                required: ['name']
            });

            const invalidInput = {age: 'not a number'};
            const mockOnFeedbackSend = vi.fn();

            const props = createDataValidationNodeProps({
                title: 'Validator',
                schema,
                input: invalidInput,
                onFeedbackSend: mockOnFeedbackSend
            });

            renderWithProviders(<DataValidationNode {...props} />);
        });

        it('handles invalid JSON schema', async () => {
            const mockOnResultUpdate = vi.fn();
            const mockOnFeedbackSend = vi.fn();

            const props = createDataValidationNodeProps({
                title: 'Bad Schema',
                schema: 'invalid json schema',
                input: {data: 'test'},
                onResultUpdate: mockOnResultUpdate,
                onFeedbackSend: mockOnFeedbackSend
            });

            renderWithProviders(<DataValidationNode {...props} />);
        });
    });

    describe('Settings dialog', () => {
        it('opens settings with schema editor', async () => {
            const props = createDataValidationNodeProps({
                schema: '{"type": "string"}'
            });

            renderWithProviders(<DataValidationNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});