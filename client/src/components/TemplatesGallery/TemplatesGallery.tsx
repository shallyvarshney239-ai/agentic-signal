/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useState, useMemo} from "react";
import {BaseDialog} from "../BaseDialog";
import {ConfirmDialog} from "../ConfirmDialog";
import {templates, type WorkflowTemplate} from "../../data/templates";
import "./TemplatesGallery.scss";

interface TemplatesGalleryProps {
    open: boolean;
    onClose: () => void;
    onUseTemplate: (template: {nodes: any[], edges: any[]}, merge: boolean) => void;
    hasExistingWorkflow: boolean;
}

const nodeColors: Record<string, string> = {
    "data-source": "#4caf50",
    "timer": "#ff9800",
    "http": "#2196f3",
    "chart": "#9c27b0",
    "llm-process": "#e91e63",
    "data-flow-spy": "#607d8b",
    "data-validation": "#00bcd4",
    "async-data-aggregator": "#8bc34a",
    "ai-tool": "#ff5722",
    "json-reformatter": "#673ab7"
};

const nodeIcons: Record<string, string> = {
    "data-source": "DS",
    "timer": "TM",
    "http": "HT",
    "chart": "CH",
    "llm-process": "AI",
    "data-flow-spy": "SP",
    "data-validation": "VL",
    "async-data-aggregator": "AG",
    "ai-tool": "TL",
    "json-reformatter": "JS"
};

export function TemplatesGallery ({
    open,
    onClose,
    onUseTemplate,
    hasExistingWorkflow
}: TemplatesGalleryProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const filteredTemplates = useMemo(() => {
        if (!searchTerm.trim()) return templates;

        const lowerSearch = searchTerm.toLowerCase();

        return templates.filter(
            template =>
                template.name.toLowerCase().includes(lowerSearch) ||
                template.description.toLowerCase().includes(lowerSearch)
        );
    }, [searchTerm]);

    const handleTemplateClick = (template: WorkflowTemplate) => {
        setSelectedTemplate(template);
    };

    const handleUseTemplate = () => {
        if (!selectedTemplate) return;

        if (hasExistingWorkflow) {
            setShowConfirmDialog(true);
        } else {
            onUseTemplate({nodes: selectedTemplate.nodes, edges: selectedTemplate.edges}, false);
            onClose();
        }
    };

    const handleConfirmChoice = (merge: boolean) => {
        if (selectedTemplate) {
            onUseTemplate({nodes: selectedTemplate.nodes, edges: selectedTemplate.edges}, merge);
            setShowConfirmDialog(false);
            setSelectedTemplate(null);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedTemplate(null);
        setShowConfirmDialog(false);
        onClose();
    };

    return (
        <>
            <BaseDialog
                open={open}
                onClose={handleClose}
                title="Start from Template"
                maxWidth="lg"
            >
                <div className="templates-gallery">
                    <div className="search-container">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search templates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {filteredTemplates.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔍</div>
                            <div className="empty-state-text">
                                No templates found matching "{searchTerm}"
                            </div>
                        </div>
                    ) : (
                        <div className="templates-grid">
                            {filteredTemplates.map((template) => (
                                <div
                                    key={template.id}
                                    className={`template-card ${
                                        selectedTemplate?.id === template.id ? "selected" : ""
                                    }`}
                                    onClick={() => handleTemplateClick(template)}
                                >
                                    <div className="template-header">
                                        <h3 className="template-name">{template.name}</h3>
                                        <span className="node-count-badge">
                                            {template.nodeCount} nodes
                                        </span>
                                    </div>

                                    <p className="template-description">{template.description}</p>

                                    <div className="mini-preview">
                                        {template.nodes.slice(0, 5).map((node) => (
                                            <div
                                                key={node.id}
                                                className="node-icon"
                                                style={{
                                                    backgroundColor:
                                                        nodeColors[node.type] || "#666"
                                                }}
                                                title={node.type}
                                            >
                                                {nodeIcons[node.type] || "N"}
                                            </div>
                                        ))}
                                        {template.nodes.length > 5 && (
                                            <div
                                                className="node-icon"
                                                style={{backgroundColor: "#666"}}
                                            >
                                                +{template.nodes.length - 5}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        className="use-template-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTemplate(template);
                                            handleUseTemplate();
                                        }}
                                    >
                                        Use Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </BaseDialog>

            <ConfirmDialog
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                title="Load Template"
                message="A workflow is already loaded. Would you like to add to the existing workflow or replace it?"
                confirmLabel="Add to Existing"
                cancelLabel="Replace"
                onConfirm={() => handleConfirmChoice(true)}
                onCancel={() => handleConfirmChoice(false)}
            />
        </>
    );
}