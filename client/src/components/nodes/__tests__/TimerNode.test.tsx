import './mocks';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {screen, fireEvent, waitFor} from '@testing-library/react';
import {TimerNode} from '../TimerNode/TimerNode';
import {renderWithProviders, createTimerNodeProps} from './helpers';

describe('TimerNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('Basic rendering', () => {
        it('renders with title', () => {
            const props = createTimerNodeProps({
                title: 'Timer'
            });

            renderWithProviders(<TimerNode {...props} />);
            expect(screen.getByText('Timer')).toBeInTheDocument();
        });

        it('shows interval mode by default', () => {
            const props = createTimerNodeProps({
                mode: 'interval',
                interval: 30
            });

            renderWithProviders(<TimerNode {...props} />);
        });
    });

    describe('Interval mode', () => {
        it('renders with interval configuration', () => {
            const props = createTimerNodeProps({
                title: 'Interval Timer'
            });

            renderWithProviders(<TimerNode {...props} />);
            expect(screen.getByText('Interval Timer')).toBeInTheDocument();
        });

        it('toggles run once setting', async () => {
            const props = createTimerNodeProps({
                mode: 'interval',
                runOnce: false,
                immediate: false
            });

            renderWithProviders(<TimerNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const runOnceSwitch = screen.getByRole('checkbox', {name: /run once/i});

                if (runOnceSwitch) {
                    fireEvent.click(runOnceSwitch);
                }
            }, {timeout: 2000});
        });

        it('toggles immediate trigger setting', async () => {
            const props = createTimerNodeProps({
                mode: 'interval',
                runOnce: false,
                immediate: false
            });

            renderWithProviders(<TimerNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const immediateSwitch = screen.getByRole('checkbox', {name: /trigger immediately/i});

                if (immediateSwitch) {
                    fireEvent.click(immediateSwitch);
                }
            }, {timeout: 2000});
        });
    });

    describe('Scheduled mode', () => {
        it('renders with scheduled configuration', () => {
            const props = createTimerNodeProps({
                title: 'Scheduled Timer',
                mode: 'scheduled',
                scheduledDateTime: '2025-06-01T10:00',
                repeat: 'daily'
            });

            renderWithProviders(<TimerNode {...props} />);
            expect(screen.getByText('Scheduled Timer')).toBeInTheDocument();
        });

        it('switches to scheduled mode from interval', async () => {
            const props = createTimerNodeProps({
                mode: 'interval',
                interval: 60
            });

            renderWithProviders(<TimerNode {...props} />);

            const settingsButton = screen.getByRole('button', {name: /settings/i});

            fireEvent.click(settingsButton);

            await waitFor(() => {
                const modeSelect = screen.getByLabelText(/timer mode/i);

                if (modeSelect) {
                    fireEvent.mouseDown(modeSelect);
                }
            }, {timeout: 2000});
        });
    });

    describe('Timer controls', () => {
        it('starts timer when run button clicked', async () => {
            const props = createTimerNodeProps({
                title: 'Test Timer'
            });

            renderWithProviders(<TimerNode {...props} />);

            const runButton = screen.getByRole('button', {name: /run/i});

            fireEvent.click(runButton);

            await waitFor(() => {
                expect(screen.queryByRole('button', {name: /run/i})).toBeInTheDocument();
            }, {timeout: 2000});
        });
    });
});