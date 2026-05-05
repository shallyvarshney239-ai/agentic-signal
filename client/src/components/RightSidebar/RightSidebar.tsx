/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {Clock, OpenBook, Spark, ArrowRight} from 'iconoir-react';
import './RightSidebar.scss';

type RightSidebarProps = {
    onOpenTemplates: () => void;
};

const QUICK_TIPS = [
    'Drag nodes from the left panel onto the canvas',
    'Connect nodes by dragging from an output handle',
    'Press Delete to remove a selected node',
    'Use Ctrl+S to save your workflow',
];

const RECENT_WORKFLOWS = [
    {name: 'My first workflow', updated: '2 hrs ago'},
    {name: 'Stock price tracker', updated: 'Yesterday'},
    {name: 'AI data pipeline', updated: '3 days ago'},
];

export function RightSidebar ({onOpenTemplates}: RightSidebarProps) {
    return (
        <aside className="right-sidebar">
            {/* Templates CTA */}
            <div className="rs-section">
                <h4 className="rs-section-title">
                    <OpenBook width={14} height={14} />
                    Templates
                </h4>
                <button className="rs-template-btn" onClick={onOpenTemplates}>
                    <div className="rs-template-icon">
                        <Spark width={18} height={18} />
                    </div>
                    <div className="rs-template-text">
                        <span className="rs-template-name">Browse Templates</span>
                        <span className="rs-template-sub">Start from a ready-made workflow</span>
                    </div>
                    <ArrowRight width={14} height={14} className="rs-template-arrow" />
                </button>
            </div>

            {/* Recent Workflows */}
            <div className="rs-section">
                <h4 className="rs-section-title">
                    <Clock width={14} height={14} />
                    Recent
                </h4>
                <div className="rs-list">
                    {RECENT_WORKFLOWS.map(wf => (
                        <div key={wf.name} className="rs-list-item">
                            <div className="rs-list-dot" />
                            <div className="rs-list-info">
                                <span className="rs-list-name">{wf.name}</span>
                                <span className="rs-list-meta">{wf.updated}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Tips */}
            <div className="rs-section rs-section--tips">
                <h4 className="rs-section-title rs-section-title--tips">Quick Tips</h4>
                <ul className="rs-tips">
                    {QUICK_TIPS.map((tip, i) => (
                        <li key={i} className="rs-tip-item">
                            <span className="rs-tip-num">{i + 1}</span>
                            {tip}
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}
