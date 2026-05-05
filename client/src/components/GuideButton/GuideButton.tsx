/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useState, useEffect, useRef} from 'react';
import {Button, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, IconButton, Stepper, Step, StepLabel, Chip} from '@mui/material';
import {OpenBook, NavArrowLeft, NavArrowRight, X, Play, Settings, HelpCircle} from 'iconoir-react';
import './GuideButton.scss';

type HighlightIntensity = 'low' | 'medium' | 'high';
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
type Section = 'topbar' | 'sidebar' | 'canvas' | 'settings' | 'general';

interface GuideStep {
    element: string;
    title: string;
    description: string;
    position: TooltipPosition;
    action_hint: string;
    order: number;
    section?: Section;
    next_label?: string;
    skip_option?: boolean;
    highlight_intensity?: HighlightIntensity;
}

const guideSteps: GuideStep[] = [
    {
        element: '.guide-button',
        title: 'Welcome to Agentic Signal!',
        description: 'A visual workflow builder for AI-powered automations. Build workflows by dragging nodes and connecting them.',
        position: 'right',
        action_hint: 'Click Next to begin the tour',
        order: 1,
        section: 'general',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.actions-dock [title="Settings"]',
        title: 'Settings',
        description: 'Configure AI settings like Ollama host, browser path for scraping, and manage AI models.',
        position: 'bottom',
        action_hint: 'Click to open settings panel',
        order: 2,
        section: 'topbar',
        next_label: 'Next: Save',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.actions-dock [title="Save workflow"]',
        title: 'Save Workflow',
        description: 'Download your current workflow as a JSON file to save and share your work.',
        position: 'bottom',
        action_hint: 'Click to download workflow.json',
        order: 3,
        section: 'topbar',
        next_label: 'Next: Load',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.actions-dock [title="Load workflow"]',
        title: 'Load Workflow',
        description: 'Open a previously saved workflow.json file to continue working.',
        position: 'bottom',
        action_hint: 'Click to open file picker',
        order: 4,
        section: 'topbar',
        next_label: 'Next: Clear',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.actions-dock [title="Clear workflow"]',
        title: 'Clear Canvas',
        description: 'Remove all nodes and connections to start fresh.',
        position: 'bottom',
        action_hint: 'Click to clear the canvas',
        order: 5,
        section: 'topbar',
        next_label: 'Next: Docs',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.actions-dock [title="Open Documentation"]',
        title: 'Documentation',
        description: 'Opens the official documentation in your browser for learning advanced features.',
        position: 'bottom',
        action_hint: 'Click to visit docs',
        order: 6,
        section: 'topbar',
        next_label: 'Next: Data Source',
        skip_option: true,
        highlight_intensity: 'low'
    },
    {
        element: '.nodes-dock .dock-item:first-child',
        title: 'Data Source Node',
        description: 'Provides static data to your workflow via text input or file upload.',
        position: 'right',
        action_hint: 'Drag this onto the canvas',
        order: 7,
        section: 'sidebar',
        next_label: 'Next: HTTP Node',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(3)',
        title: 'HTTP Node',
        description: 'Fetch data from external REST APIs with custom headers and request body.',
        position: 'right',
        action_hint: 'Drag to make API calls',
        order: 8,
        section: 'sidebar',
        next_label: 'Next: GET Data',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(4)',
        title: 'GET Data Node',
        description: 'Simplified HTTP GET requests for fetching public API data quickly.',
        position: 'right',
        action_hint: 'Drag for simple API calls',
        order: 9,
        section: 'sidebar',
        next_label: 'Next: Timer',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(9)',
        title: 'Timer Node',
        description: 'Trigger your workflow at regular intervals for scheduled automations.',
        position: 'right',
        action_hint: 'Drag to schedule workflows',
        order: 10,
        section: 'sidebar',
        next_label: 'Next: AI LLM',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(6)',
        title: 'AI LLM Node',
        description: 'Send text to AI models like Ollama for processing, analysis, or generation.',
        position: 'right',
        action_hint: 'Drag to add AI processing',
        order: 11,
        section: 'sidebar',
        next_label: 'Next: Tool Node',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(10)',
        title: 'Tool Node',
        description: 'Give AI the ability to call external functions like stock analysis, search, and email.',
        position: 'right',
        action_hint: 'Drag to add AI tools',
        order: 12,
        section: 'sidebar',
        next_label: 'Next: JSON Reformatter',
        skip_option: true,
        highlight_intensity: 'high'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(5)',
        title: 'JSON Reformatter Node',
        description: 'Transform and restructure JSON data to extract or reorganize fields.',
        position: 'right',
        action_hint: 'Drag to transform data',
        order: 13,
        section: 'sidebar',
        next_label: 'Next: Data Validation',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(7)',
        title: 'Data Validation Node',
        description: 'Validate incoming data against a schema to catch quality issues early.',
        position: 'right',
        action_hint: 'Drag to validate data',
        order: 14,
        section: 'sidebar',
        next_label: 'Next: Stock Analysis',
        skip_option: true,
        highlight_intensity: 'low'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(8)',
        title: 'Stock Analysis Node',
        description: 'Get real-time stock prices with technical indicators like SMA, EMA, RSI.',
        position: 'right',
        action_hint: 'Drag to track stocks',
        order: 15,
        section: 'sidebar',
        next_label: 'Next: Async Aggregator',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(2)',
        title: 'Async Data Aggregator Node',
        description: 'Combine data from multiple sources by waiting for all inputs before processing.',
        position: 'right',
        action_hint: 'Drag to combine sources',
        order: 16,
        section: 'sidebar',
        next_label: 'Next: Chart',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(11)',
        title: 'Chart Node',
        description: 'Visualize data as interactive line, bar, or pie charts.',
        position: 'right',
        action_hint: 'Drag to display charts',
        order: 17,
        section: 'sidebar',
        next_label: 'Next: Flow Spy',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.nodes-dock .dock-item:nth-child(12)',
        title: 'Data Flow Spy Node',
        description: 'Debug your workflow by viewing intermediate data at any point.',
        position: 'right',
        action_hint: 'Drag between nodes to inspect data',
        order: 18,
        section: 'sidebar',
        next_label: 'Next: Mini Map',
        skip_option: true,
        highlight_intensity: 'medium'
    },
    {
        element: '.react-flow__minimap',
        title: 'Mini Map',
        description: 'Overview of your entire workflow canvas for easy navigation.',
        position: 'left',
        action_hint: 'Click to navigate canvas',
        order: 19,
        section: 'canvas',
        next_label: 'Next: Controls',
        skip_option: true,
        highlight_intensity: 'low'
    },
    {
        element: '.react-flow__controls',
        title: 'Canvas Controls',
        description: 'Zoom in, zoom out, fit view, and lock canvas position.',
        position: 'right',
        action_hint: 'Use these buttons to navigate',
        order: 20,
        section: 'canvas',
        next_label: 'Finish Tour',
        skip_option: true,
        highlight_intensity: 'low'
    }
];

export function GuideButton () {
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const clearHighlight = () => {
        setHighlightedElement(null);
    };

    useEffect(() => {
        if (!open) {
            clearHighlight();

            return;
        }

        const selector = guideSteps[currentStep]?.element;

        if (selector) {
            try {
                const element = document.querySelector(selector) as HTMLElement;

                if (element) {
                    setHighlightedElement(element);
                    element.scrollIntoView({behavior: 'smooth', block: 'center'});
                }
            } catch {
                console.warn('Invalid selector:', selector);
            }
        }
    }, [open, currentStep]);

    const handleOpen = () => {
        setOpen(true);
        setCurrentStep(0);
    };

    const handleClose = () => {
        setOpen(false);
        clearHighlight();
    };

    const handleNext = () => {
        if (currentStep < guideSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSkip = () => {
        const remainingSteps = guideSteps.filter((_, i) => i > currentStep);

        if (remainingSteps.length > 0) {
            setCurrentStep(guideSteps.length - 1);
        }
    };

    const currentStepData = guideSteps[currentStep];
    const isLastStep = currentStep === guideSteps.length - 1;
    const isFirstStep = currentStep === 0;

    const getSectionColor = (section?: Section) => {
        switch (section) {
            case 'topbar':
                return '#9c27b0';
            case 'sidebar':
                return '#2196f3';
            case 'canvas':
                return '#4caf50';
            case 'settings':
                return '#ff9800';
            default:
                return '#607d8b';
        }
    };

    const getSectionLabel = (section?: Section) => {
        switch (section) {
            case 'topbar':
                return 'TOP BAR';
            case 'sidebar':
                return 'SIDEBAR';
            case 'canvas':
                return 'CANVAS';
            case 'settings':
                return 'SETTINGS';
            default:
                return 'OVERVIEW';
        }
    };

    const getHighlightGlow = (intensity?: HighlightIntensity) => {
        switch (intensity) {
            case 'high':
                return '0 0 0 4px rgba(102, 126, 234, 0.5), 0 0 20px rgba(102, 126, 234, 0.4)';
            case 'medium':
                return '0 0 0 3px rgba(102, 126, 234, 0.4), 0 0 15px rgba(102, 126, 234, 0.3)';
            case 'low':
                return '0 0 0 2px rgba(102, 126, 234, 0.3), 0 0 10px rgba(102, 126, 234, 0.2)';
            default:
                return '0 0 0 3px rgba(102, 126, 234, 0.4), 0 0 15px rgba(102, 126, 234, 0.3)';
        }
    };

    useEffect(() => {
        if (highlightedElement && open) {
            const step = guideSteps[currentStep];
            const glow = getHighlightGlow(step.highlight_intensity);

            highlightedElement.style.boxShadow = glow;
            highlightedElement.style.zIndex = '9999';
            highlightedElement.style.position = 'relative';
        }

        return () => {
            if (highlightedElement) {
                highlightedElement.style.boxShadow = '';
                highlightedElement.style.zIndex = '';
                highlightedElement.style.position = '';
            }
        };
    }, [highlightedElement, open, currentStep]);

    return (
        <>
            <Button
                className="guide-button"
                variant="contained"
                startIcon={<OpenBook />}
                onClick={handleOpen}
            >
                Guide
            </Button>

            <div ref={highlightRef} className="guide-highlight-overlay" />

            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
                className="guide-dialog"
            >
                <DialogTitle className="guide-dialog-title">
                    <Box className="guide-title-content">
                        <Box className="guide-step-number">
                            <Typography variant="caption" className="step-number-text">
                                {currentStepData.order}
                            </Typography>
                        </Box>
                        <Box className="guide-title-text">
                            <Typography variant="h6" component="span" className="step-title">
                                {currentStepData.title}
                            </Typography>
                            <Typography variant="caption" className="step-target">
                                Target: {currentStepData.element}
                            </Typography>
                        </Box>
                        <Box
                            className="guide-section-badge"
                            style={{backgroundColor: getSectionColor(currentStepData.section)}}
                        >
                            {getSectionLabel(currentStepData.section)}
                        </Box>
                    </Box>
                    <IconButton className="guide-close-button" onClick={handleClose}>
                        <X />
                    </IconButton>
                </DialogTitle>

                <DialogContent className="guide-dialog-content">
                    <Box className="guide-content-wrapper">
                        <Box className="guide-description-section">
                            <Box className="guide-description-icon">
                                <HelpCircle />
                            </Box>
                            <Typography variant="body1" className="guide-description">
                                {currentStepData.description}
                            </Typography>
                        </Box>

                        <Box className="guide-action-hint-section">
                            <Box className="guide-action-hint-header">
                                <Settings />
                                <Typography variant="subtitle2" className="action-label">
                                    Action Required
                                </Typography>
                            </Box>
                            <Chip
                                label={currentStepData.action_hint}
                                className="guide-action-chip"
                                icon={<Settings />}
                            />
                        </Box>

                        {currentStepData.next_label && (
                            <Box className="guide-next-preview">
                                <Typography variant="caption" className="next-preview-label">
                                    Up Next:
                                </Typography>
                                <Typography variant="body2" className="next-preview-text">
                                    {currentStepData.next_label}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>

                <DialogActions className="guide-dialog-actions">
                    <Box className="guide-stepper">
                        <Typography variant="caption" className="step-count">
                            Step {currentStep + 1} of {guideSteps.length}
                        </Typography>
                        <Stepper activeStep={currentStep} className="guide-stepper-inner">
                            {guideSteps.map((step, index) => (
                                <Step key={index} completed={index < currentStep}>
                                    <StepLabel
                                        StepIconComponent={() => (
                                            <Box
                                                className={`step-dot ${index === currentStep ? 'active' : ''}`}
                                                title={step.title}
                                            >
                                                {index < currentStep ? '✓' : index + 1}
                                            </Box>
                                        )}
                                    />
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    <Box className="guide-navigation">
                        {currentStepData.skip_option && !isLastStep && (
                            <Button
                                variant="text"
                                color="inherit"
                                onClick={handleSkip}
                                className="skip-button"
                            >
                                Skip Tour
                            </Button>
                        )}

                        <Box className="nav-buttons">
                            <Button
                                variant="outlined"
                                startIcon={<NavArrowLeft />}
                                onClick={handlePrevious}
                                disabled={isFirstStep}
                            >
                                Back
                            </Button>

                            {isLastStep ? (
                                <Button
                                    variant="contained"
                                    onClick={handleClose}
                                    startIcon={<Play />}
                                >
                                    Start Building!
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    endIcon={<NavArrowRight />}
                                    onClick={handleNext}
                                >
                                    {currentStepData.next_label || 'Next'}
                                </Button>
                            )}
                        </Box>
                    </Box>
                </DialogActions>
            </Dialog>
        </>
    );
}
