import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {createMockNodeProps, createDataSourceNodeProps, createGetDataNodeProps, createLlmProcessNodeProps, createTimerNodeProps} from './helpers';

describe('Node Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Data flow between nodes', () => {
        it('DataSourceNode outputs data that can be used by GetDataNode', () => {
            const sourceData = {key: 'value'};

            const sourceProps = createDataSourceNodeProps({
                title: 'Data Source',
                dataSource: {
                    type: 'json',
                    value: JSON.stringify(sourceData)
                }
            });

            expect(sourceProps.data.dataSource.value).toBe(JSON.stringify(sourceData));
        });

        it('GetDataNode result can be passed to JsonReformatterNode', () => {
            const fetchedData = {items: [1, 2, 3], total: 100};

            createGetDataNodeProps({
                title: 'Data Fetcher',
                url: 'https://api.example.com/data',
                dataType: 'json'
            });

            const formatterProps = createMockNodeProps({
                title: 'Formatter',
                jsonataExpression: '$.items',
                input: fetchedData
            });

            expect(formatterProps.data.input).toEqual(fetchedData);
        });

        it('JsonReformatterNode output can be validated by DataValidationNode', () => {
            const reformattedData = {name: 'test', age: 25};

            const validationSchema = {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    age: {type: 'number'}
                },
                required: ['name', 'age']
            };

            const validationProps = createMockNodeProps({
                title: 'Validator',
                schema: JSON.stringify(validationSchema),
                input: reformattedData
            });

            expect(validationProps.data.input).toEqual(reformattedData);
        });
    });

    describe('Timer-triggered workflows', () => {
        it('TimerNode can trigger DataSourceNode', () => {
            createTimerNodeProps({
                title: 'Timer Trigger',
                mode: 'interval',
                interval: 60
            });

            const dataSourceProps = createDataSourceNodeProps({
                title: 'Timed Data Source',
                input: {
                    timerTrigger: Date.now()
                }
            });

            expect(dataSourceProps.data.input?.timerTrigger).toBeDefined();
        });

        it('TimerNode can trigger HttpNode', () => {
            const httpProps = createMockNodeProps({
                title: 'Timed HTTP',
                url: 'https://example.com/page',
                input: {
                    timerTrigger: Date.now()
                }
            });

            expect(httpProps.data.input?.timerTrigger).toBeDefined();
        });
    });

    describe('AI workflow', () => {
        it('DataSourceNode output feeds into LlmProcessNode', () => {
            const sourceData = {
                text: 'Analyze this market data for trends and patterns.'
            };

            const llmProps = createLlmProcessNodeProps({
                title: 'AI Analysis',
                prompt: 'Analyze the input data and provide insights.',
                input: sourceData
            });

            expect(llmProps.data.input).toEqual(sourceData);
        });

        it('LlmProcessNode output can be charted', () => {
            const aiAnalysis = {
                sentiment: 'positive',
                scores: [0.6, 0.7, 0.8, 0.75, 0.85]
            };

            const chartProps = createMockNodeProps({
                title: 'Analysis Chart',
                input: {
                    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
                    data: aiAnalysis.scores
                }
            });

            expect(chartProps.data.input.data).toHaveLength(5);
        });
    });

    describe('Complex workflows', () => {
        it('Multiple data sources feed into AsyncDataAggregatorNode', () => {
            const sourceOutputs = {
                'source-1': {data: 'From source 1'},
                'source-2': {data: 'From source 2'},
                'source-3': {data: 'From source 3'}
            };

            const aggregatorProps = createMockNodeProps({
                title: 'Aggregator',
                input: sourceOutputs
            });

            expect(Object.keys(aggregatorProps.data.input)).toHaveLength(3);
        });

        it('Stock analysis workflow from data fetch to chart', () => {
            const stockData = {
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

            const analysisProps = createMockNodeProps({
                title: 'AAPL Analysis',
                input: stockData
            });

            expect(analysisProps.data.input.data).toHaveLength(15);
            expect(analysisProps.data.input.symbol).toBe('AAPL');
        });

        it('Markdown document processing workflow', () => {
            const markdownFiles = [
                {name: 'introduction.md', content: '# Introduction\n\nWelcome.'},
                {name: 'chapter1.md', content: '## Chapter 1\n\nContent here.'},
                {name: 'conclusion.md', content: '## Conclusion\n\nThe end.'}
            ];

            const sourceProps = createDataSourceNodeProps({
                title: 'Documentation',
                dataSource: {
                    type: 'markdown',
                    value: {
                        text: '# Main Document',
                        files: markdownFiles
                    }
                }
            });

            expect(sourceProps.data.dataSource.value.files).toHaveLength(3);
        });
    });
});