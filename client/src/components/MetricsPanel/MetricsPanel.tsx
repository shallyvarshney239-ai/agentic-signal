/* eslint-disable react-hooks/exhaustive-deps */
/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import React from "react";
import {metricsStore} from "../../services/metricsStore";
import {OllamaService} from "../../services/ollamaService";
import {useEffect, useState} from "react";

interface Props { open: boolean; onClose: () => void; }

export function MetricsPanel ({open, onClose}: Props) {
    const _a = useState(metricsStore.getAggregateMetrics()), m = _a[0], setM = _a[1];
    const _b = useState(OllamaService.getInstance().getTelemetry()), t = _b[0], setT = _b[1];

    useEffect(function () {
        if (open) {
            const i = setInterval(function () {
                setM(metricsStore.getAggregateMetrics());
                setT(OllamaService.getInstance().getTelemetry());
            }, 2000);

            return function () { return clearInterval(i); };
        }
    }, [open]);

    if (!open) return null;

    const cloud = t.totalTokens > 0 ? ((t.totalTokens / 1000) * 0.00015).toFixed(4) : "0.00";
    const sections = [
        ["MODEL", localStorage.getItem("selectedModel") || "phi4-mini", "Tier 1"],
        ["SESSION",
            "Calls: " + t.totalCalls,
            "Tokens: " + t.totalTokens.toLocaleString(),
            "Latency: " + Math.round(t.avgLatencyMs) + "ms",
            "tokens/sec: " + t.avgTokensPerSec,
            "Cost: USD 0.00 (LOCAL)"
        ],
        ["CLOUD",
            "GPT-4o-mini: ~USD " + cloud,
            "10k calls/mo: USD 0 vs ~60",
        ],
        ["WOW GAP",
            "Raw: " + m.wowGapRawScore + "%",
            "Project: " + m.wowGapProjectScore + "%",
            "GAP: +" + m.wowGapDelta + "%",
        ],
        ["TECHNIQUES",
            "Pipeline runs: " + m.totalRuns,
            "Fallback: " + Math.round(m.llmCallAvoidanceRate * 100) + "%",
            "Success: " + Math.round(m.successRate * 100) + "%",
        ],
    ];

    return React.createElement("div", {
        style: {
            position: "fixed", top: 0, right: 0, width: 400, height: "100vh",
            background: "#1e1e2e", color: "#cdd6f4",
            boxShadow: "-4px 0 20px rgba(0,0,0,0.3)",
            zIndex: 1300, overflow: "auto", padding: 24,
        }
    },
    React.createElement("div", {style: {display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}},
        React.createElement("h2", {style: {margin: 0, fontSize: 20}}, "GARAGE METRICS"),
        React.createElement("button", {
            onClick: onClose,
            style: {padding: "4px 12px", background: "transparent", border: "1px solid #45475a", color: "#a6adc8", borderRadius: 4, cursor: "pointer"}
        }, "Close")
    ),
    sections.map(function (g) {
        return React.createElement("div", {
            key: g[0],
            style: {background: "#313244", borderRadius: 8, padding: 12, marginBottom: 12}
        },
        React.createElement("div", {style: {fontSize: 11, textTransform: "uppercase", color: "#a6adc8", marginBottom: 4}}, g[0]),
        g.slice(1).filter(Boolean).map(function (v) {
            return React.createElement("div", {key: String(v), style: {fontSize: 13, margin: "2px 0"}}, String(v));
        })
        );
    }),
    React.createElement("button", {
        onClick: function () {
            const r = metricsStore.exportReport();

            navigator.clipboard.writeText(JSON.stringify(r, null, 2));
        },
        style: {
            width: "100%", padding: 8, background: "#89b4fa",
            color: "#1e1e2e", border: "none", borderRadius: 6,
            cursor: "pointer", fontWeight: 600, fontSize: 14,
        }
    }, "Export Benchmark Report")
    );
}
