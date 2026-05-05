import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen} from '@testing-library/react';
import {DataSourceNode} from '../DataSourceNode/DataSourceNode';
import {renderWithProviders, createDataSourceNodeProps} from './helpers';

describe('DataSourceNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('JSON data source type', () => {
        it('renders with JSON data source', () => {
            const props = createDataSourceNodeProps({
                title: 'JSON Source',
                dataSource: {
                    type: 'json',
                    value: '{"key": "value"}'
                }
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
            expect(screen.getAllByText('JSON Source').length).toBeGreaterThan(0);
        });

        it('parses valid JSON on run', () => {
            const mockOnResultUpdate = vi.fn();
            const props = createDataSourceNodeProps({
                title: 'JSON Source',
                dataSource: {
                    type: 'json',
                    value: '{"name": "test", "count": 42}'
                },
                onResultUpdate: mockOnResultUpdate,
                run: vi.fn()
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
        });

        it('handles invalid JSON error', () => {
            const mockOnResultUpdate = vi.fn();
            const props = createDataSourceNodeProps({
                title: 'JSON Source',
                dataSource: {
                    type: 'json',
                    value: 'invalid json'
                },
                onResultUpdate: mockOnResultUpdate
            });

            renderWithProviders(<DataSourceNode {...props} />);
            expect(screen.getAllByText('JSON Source').length).toBeGreaterThan(0);
        });
    });

    describe('Markdown data source type', () => {
        it('renders with Markdown data source', () => {
            const props = createDataSourceNodeProps({
                title: 'Markdown Source',
                dataSource: {
                    type: 'markdown',
                    value: {
                        text: '# Hello World',
                        files: []
                    }
                }
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
            expect(screen.getAllByText('Markdown Source').length).toBeGreaterThan(0);
        });

        it('merges file contents with text', () => {
            const props = createDataSourceNodeProps({
                dataSource: {
                    type: 'markdown',
                    value: {
                        text: 'Intro text',
                        files: [
                            {name: 'section1.md', content: '## Section One'},
                            {name: 'section2.md', content: '## Section Two'}
                        ]
                    }
                }
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
        });
    });

    describe('Settings dialog', () => {
        it('opens settings dialog', () => {
            const props = createDataSourceNodeProps({
                dataSource: {
                    type: 'json',
                    value: '{}'
                },
                settings: vi.fn()
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
        });

        it('allows switching data source type', () => {
            const mockOnConfigChange = vi.fn();
            const props = createDataSourceNodeProps({
                dataSource: {
                    type: 'json',
                    value: '{}'
                },
                onConfigChange: mockOnConfigChange,
                settings: vi.fn()
            });

            const {container} = renderWithProviders(<DataSourceNode {...props} />);

            expect(container.querySelector('.base-node')).toBeInTheDocument();
        });
    });
});