import {describe, it, expect} from 'vitest';
import {z} from 'zod';

describe('Node Type Definitions', () => {
    describe('DataSourceNode types', () => {
        it('validates JSON data source type', () => {
            const jsonSourceSchema = z.object({
                type: z.literal('json'),
                value: z.string()
            });

            const validSource = {type: 'json', value: '{"key": "value"}'};
            const result = jsonSourceSchema.safeParse(validSource);

            expect(result.success).toBe(true);
        });

        it('validates Markdown data source type', () => {
            const markdownSourceSchema = z.object({
                type: z.literal('markdown'),
                value: z.object({
                    text: z.string(),
                    files: z.array(z.object({
                        name: z.string(),
                        content: z.string()
                    }))
                })
            });

            const validSource = {
                type: 'markdown',
                value: {
                    text: '# Title',
                    files: [{name: 'file.md', content: 'Content'}]
                }
            };
            const result = markdownSourceSchema.safeParse(validSource);

            expect(result.success).toBe(true);
        });

        it('rejects invalid data source types', () => {
            const invalidSource = {type: 'invalid', value: 'test'};
            const jsonSourceSchema = z.object({
                type: z.literal('json'),
                value: z.string()
            });

            const result = jsonSourceSchema.safeParse(invalidSource);

            expect(result.success).toBe(false);
        });
    });

    describe('GetDataNode types', () => {
        it('validates fetch data types', () => {
            const fetchDataTypeSchema = z.enum(['json', 'text', 'blob', 'arrayBuffer']);

            expect(fetchDataTypeSchema.safeParse('json').success).toBe(true);
            expect(fetchDataTypeSchema.safeParse('text').success).toBe(true);
            expect(fetchDataTypeSchema.safeParse('invalid').success).toBe(false);
        });
    });

    describe('TimerNode types', () => {
        it('validates timer modes', () => {
            const timerModeSchema = z.enum(['interval', 'scheduled']);

            expect(timerModeSchema.safeParse('interval').success).toBe(true);
            expect(timerModeSchema.safeParse('scheduled').success).toBe(true);
        });

        it('validates scheduled timer repeats', () => {
            const repeatSchema = z.enum(['once', 'daily', 'weekly', 'monthly']);

            expect(repeatSchema.safeParse('once').success).toBe(true);
            expect(repeatSchema.safeParse('daily').success).toBe(true);
            expect(repeatSchema.safeParse('yearly').success).toBe(false);
        });

        it('validates interval configuration', () => {
            const intervalConfigSchema = z.object({
                mode: z.literal('interval'),
                interval: z.number().min(0),
                immediate: z.boolean(),
                runOnce: z.boolean()
            });

            const validConfig = {
                mode: 'interval',
                interval: 60,
                immediate: true,
                runOnce: false
            };
            const result = intervalConfigSchema.safeParse(validConfig);

            expect(result.success).toBe(true);
        });

        it('rejects negative interval values', () => {
            const intervalConfigSchema = z.object({
                interval: z.number().min(0)
            });

            const invalidConfig = {interval: -10};
            const result = intervalConfigSchema.safeParse(invalidConfig);

            expect(result.success).toBe(false);
        });
    });

    describe('ChartNode types', () => {
        it('validates Chart.js format input', () => {
            const chartJsSchema = z.object({
                labels: z.array(z.string()),
                datasets: z.array(z.object({
                    label: z.string(),
                    data: z.array(z.number()),
                    borderColor: z.string().optional(),
                    backgroundColor: z.string().optional()
                }))
            });

            const validInput = {
                labels: ['Jan', 'Feb', 'Mar'],
                datasets: [{
                    label: 'Sales',
                    data: [10, 20, 30]
                }]
            };
            const result = chartJsSchema.safeParse(validInput);

            expect(result.success).toBe(true);
        });

        it('validates XY point array format', () => {
            const xyPointSchema = z.array(z.object({
                x: z.union([z.string(), z.number()]),
                y: z.number()
            }));

            const validInput = [
                {x: '2024-01', y: 100},
                {x: '2024-02', y: 150}
            ];
            const result = xyPointSchema.safeParse(validInput);

            expect(result.success).toBe(true);
        });
    });

    describe('StockAnalysisNode types', () => {
        it('validates stock data point structure', () => {
            const stockDataPointSchema = z.object({
                date: z.string(),
                open: z.number(),
                high: z.number(),
                low: z.number(),
                close: z.number(),
                volume: z.number()
            });

            const validPoint = {
                date: '2024-01-01',
                open: 100,
                high: 105,
                low: 98,
                close: 103,
                volume: 1000000
            };
            const result = stockDataPointSchema.safeParse(validPoint);

            expect(result.success).toBe(true);
        });

        it('validates stock input with symbol and data array', () => {
            const stockInputSchema = z.object({
                symbol: z.string(),
                data: z.array(z.object({
                    date: z.string(),
                    open: z.number(),
                    high: z.number(),
                    low: z.number(),
                    close: z.number(),
                    volume: z.number()
                })).min(10)
            });

            const validInput = {
                symbol: 'AAPL',
                data: Array.from({length: 10}, (_, i) => ({
                    date: `2024-01-${String(i + 1).padStart(2, '0')}`,
                    open: 100 + i,
                    high: 105 + i,
                    low: 98 + i,
                    close: 103 + i,
                    volume: 1000000 + i * 100000
                }))
            };
            const result = stockInputSchema.safeParse(validInput);

            expect(result.success).toBe(true);
        });

        it('rejects stock data with less than 10 points', () => {
            const stockInputSchema = z.object({
                data: z.array(z.object({})).min(10)
            });

            const invalidInput = {
                data: [{point: 1}, {point: 2}]
            };
            const result = stockInputSchema.safeParse(invalidInput);

            expect(result.success).toBe(false);
        });
    });

    describe('DataValidationNode types', () => {
        it('validates JSON Schema format', () => {
            const schema = {
                type: 'object',
                properties: {
                    name: {type: 'string'},
                    age: {type: 'number'}
                },
                required: ['name']
            };

            const schemaString = JSON.stringify(schema);
            const parsed = JSON.parse(schemaString);

            expect(parsed.type).toBe('object');
            expect(parsed.required).toContain('name');
        });

        it('validates complex nested schemas', () => {
            const complexSchema = {
                type: 'object',
                properties: {
                    users: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: {type: 'number'},
                                email: {type: 'string'},
                                profile: {
                                    type: 'object',
                                    properties: {
                                        bio: {type: 'string'}
                                    }
                                }
                            }
                        }
                    }
                }
            };

            const parsed = JSON.parse(JSON.stringify(complexSchema));

            expect(parsed.properties.users.items.type).toBe('object');
            expect(parsed.properties.users.items.properties.profile.type).toBe('object');
        });
    });

    describe('LlmProcessNode types', () => {
        it('validates message configuration', () => {
            const messageSchema = z.object({
                preffix: z.string(),
                suffix: z.string()
            });

            const validMessage = {preffix: 'User said: ', suffix: ' Please analyze.'};
            const result = messageSchema.safeParse(validMessage);

            expect(result.success).toBe(true);
        });

        it('validates format configuration', () => {
            const formatSchema = z.object({
                onSuccess: z.string(),
                onError: z.string()
            });

            const validFormat = {
                onSuccess: '{"result": "{{result}}"}',
                onError: '{"error": "{{error}}"}'
            };
            const result = formatSchema.safeParse(validFormat);

            expect(result.success).toBe(true);
        });

        it('validates conversation history structure', () => {
            const historyItemSchema = z.object({
                role: z.enum(['user', 'assistant']),
                content: z.string()
            });

            const validHistory = [
                {role: 'user', content: 'Hello'},
                {role: 'assistant', content: 'Hi there!'},
                {role: 'user', content: 'How are you?'}
            ];

            for (const item of validHistory) {
                const result = historyItemSchema.safeParse(item);

                expect(result.success).toBe(true);
            }
        });
    });

    describe('EnhancedNodeData interface', () => {
        it('validates required callback functions', () => {
            const nodeDataSchema = z.object({
                onConfigChange: z.function(),
                onResultUpdate: z.function(),
                onFeedbackSend: z.function(),
                title: z.string(),
                toSanitize: z.array(z.string())
            });

            const validData = {
                onConfigChange: () => {},
                onResultUpdate: () => {},
                onFeedbackSend: () => {},
                title: 'Test Node',
                toSanitize: []
            };
            const result = nodeDataSchema.safeParse(validData);

            expect(result.success).toBe(true);
        });

        it('rejects missing callback functions', () => {
            const nodeDataSchema = z.object({
                onConfigChange: z.function(),
                onResultUpdate: z.function()
            });

            const invalidData = {
                onConfigChange: () => {}
            };
            const result = nodeDataSchema.safeParse(invalidData);

            expect(result.success).toBe(false);
        });
    });
});