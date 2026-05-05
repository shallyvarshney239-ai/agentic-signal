/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {Panel} from '@xyflow/react';
import {Button, Typography, Box} from '@mui/material';
import {ArrowRight, Plus} from 'iconoir-react';
import './CanvasEmptyState.scss';

interface CanvasEmptyStateProps {
    onOpenTemplates: () => void;
}

export function CanvasEmptyState ({onOpenTemplates}: CanvasEmptyStateProps) {
    return (
        <Panel position="top-center" className="canvas-empty-state">
            <Box className="empty-state-card">
                <Box className="empty-state-icon">
                    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="8" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="30" y="8" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="17" y="26" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <path d="M22 17H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M26 17V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M30 30V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </Box>
                <Typography variant="h5" className="empty-state-title">
                    Build Your Workflow
                </Typography>
                <Typography variant="body1" className="empty-state-description">
                    Drag nodes from the left panel or start from a template
                </Typography>
                <Box className="empty-state-actions">
                    <Button
                        variant="contained"
                        className="start-template-btn"
                        endIcon={<ArrowRight width={16} height={16} />}
                        onClick={onOpenTemplates}
                    >
                        Browse Templates
                    </Button>
                    <Button
                        variant="outlined"
                        className="add-trigger-btn"
                        startIcon={<Plus width={16} height={16} />}
                    >
                        Add Trigger
                    </Button>
                </Box>
                <Box className="hint-text">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M7 4v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>or drag nodes from the left panel</span>
                </Box>
            </Box>
        </Panel>
    );
}