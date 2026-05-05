const fs = require("fs");
const path = require("path");

const base = "C:/Users/Shubh Varshney/Downloads/agentic-signal/client/src/components";

// Create MetricsPanel.tsx
const dir = path.join(base, "MetricsPanel");
fs.mkdirSync(dir, { recursive: true });

const mp = `/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import { Box, Button, Paper, Typography } from "@mui/material";
import { metricsStore } from "../../services/metricsStore";
import { OllamaService } from "../../services/ollamaService";
import { useEffect, useState } from "react";

interface Props { open: boolean; onClose: () => void; }

export function MetricsPanel({ open, onClose }: Props) {
    const [metrics, setMetrics] = useState(metricsStore.getAggregateMetrics());
    const [telemetry, setTelemetry] = useState(OllamaService.getInstance().getTelemetry());

    useEffect(() => {
        if (open) {
            const i = setInterval(() => {
                setMetrics(metricsStore.getAggregateMetrics());
                setTelemetry(OllamaService.getInstance().getTelemetry());
            }, 2000);
            return () => clearInterval(i);
        }
    }, [open]);

    if (!open) return null;

    return (
        <Box sx={{
            position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
            bgcolor: "background.paper", boxShadow: 3, zIndex: 1300,
            overflow: "auto", p: 3,
        }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6">GARAGE METRICS</Typography>
                <Button onClick={onClose} size="small">Close</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>MODEL IDENTITY</Typography>
                <Typography variant="body2">llama3.2:3b-q4_K_M</Typography>
                <Typography variant="body2">3B params | Q4_K_M | Tier 1</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>THIS SESSION</Typography>
                <Typography variant="body2">LLM Calls: {telemetry.totalCalls}</Typography>
                <Typography variant="body2">Total Tokens: {telemetry.totalTokens.toLocaleString()}</Typography>
                <Typography variant="body2">Avg Latency: {Math.round(telemetry.avgLatencyMs)}ms</Typography>
                <Typography variant="body2">Tokens/sec: {telemetry.avgTokensPerSec}</Typography>
                <Typography variant="body2" color="success.main">Cost: $0.00 (ALL LOCAL)</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>CLOUD COMPARISON</Typography>
                <Typography variant="body2">
                    Same calls on GPT-4o-mini: ~${telemetry.totalCalls > 0 ? ((telemetry.totalTokens / 1000) * 0.00015).toFixed(4) : "0.00"}
                </Typography>
                <Typography variant="body2">10k calls/mo: $0 vs ~$60</Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>WOW GAP SCORE</Typography>
                <Typography variant="body2">Raw Model Quality: {metrics.wowGapRawScore}%</Typography>
                <Typography variant="body2">Project Quality: {metrics.wowGapProjectScore}%</Typography>
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                    WOW GAP: +{metrics.wowGapDelta}%
                </Typography>
            </Paper>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>TECHNIQUES ACTIVE</Typography>
                <Typography variant="body2">Pipeline runs: {metrics.totalRuns}</Typography>
                <Typography variant="body2">Fallback avoidance: {Math.round(metrics.llmCallAvoidanceRate * 100)}%</Typography>
                <Typography variant="body2">Success rate: {Math.round(metrics.successRate * 100)}%</Typography>
            </Paper>

            <Button variant="outlined" size="small" fullWidth onClick={() => {
                const r = metricsStore.exportReport();
                navigator.clipboard.writeText(JSON.stringify(r, null, 2));
            }}>
                Export Benchmark Report
            </Button>
        </Box>
    );
}
`;

fs.writeFileSync(path.join(dir, "MetricsPanel.tsx"), mp);
console.log("MetricsPanel.tsx created");