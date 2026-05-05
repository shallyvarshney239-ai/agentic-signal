const fs = require("fs");
const path = require("path");

const dir = path.join("C:/Users/Shubh Varshney/Downloads/agentic-signal/client/src/components", "MetricsPanel");
fs.mkdirSync(dir, { recursive: true });

const mp = '/* Copyright 2025 shally */\n' +
'import { Box, Button, Paper, Typography } from "@mui/material";\n' +
'import { metricsStore } from "../../services/metricsStore";\n' +
'import { OllamaService } from "../../services/ollamaService";\n' +
'import { useEffect, useState } from "react";\n' +
'\n' +
'interface Props { open: boolean; onClose: () => void; }\n' +
'\n' +
'export function MetricsPanel({ open, onClose }: Props) {\n' +
'    const [metrics, setMetrics] = useState(metricsStore.getAggregateMetrics());\n' +
'    const [telemetry, setTelemetry] = useState(OllamaService.getInstance().getTelemetry());\n' +
'    useEffect(() => { if(open) { const i=setInterval(()=>{setMetrics(metricsStore.getAggregateMetrics());setTelemetry(OllamaService.getInstance().getTelemetry());},2000); return ()=>clearInterval(i); } }, [open]);\n' +
'    if(!open) return null;\n' +
'    const c = telemetry.totalCalls > 0 ? ((telemetry.totalTokens/1000)*0.00015).toFixed(4) : "0.00";\n' +
'    return React.createElement("div",{style:{position:"fixed",top:0,right:0,width:420,height:"100vh",background:"#1e1e2e",boxShadow:"-4px 0 20px rgba(0,0,0,0.3)",zIndex:1300,overflow:"auto",padding:24,color:"#cdd6f4"}},\n' +
'        React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},\n' +
'            React.createElement("h2",{style:{margin:0,fontSize:18}},"GARAGE METRICS"),\n' +
'            React.createElement("button",{onClick:onClose,style:{background:"none",border:"1px solid #45475a",color:"#cdd6f4",padding:"4px 12px",borderRadius:4,cursor:"pointer"}},"Close")\n' +
'        ),\n' +
'        ...[ \n' +
'            ["MODEL","llama3.2:3b-q4_K_M","3B params | Q4_K_M | Tier 1"],\n' +
'            ["SESSION","LLM Calls: "+telemetry.totalCalls,"Tokens: "+telemetry.totalTokens.toLocaleString(),"Latency: "+Math.round(telemetry.avgLatencyMs)+"ms","Tokens/sec: "+telemetry.avgTokensPerSec,"Cost: USD 0.00 (LOCAL)"],\n' +
'            ["CLOUD","GPT-4o-mini: ~USD "+c,"10k/mo: USD 0 vs ~USD 60"],\n' +
'            ["WOW GAP","Raw: "+metrics.wowGapRawScore+"%","Project: "+metrics.wowGapProjectScore+"%","GAP: +"+metrics.wowGapDelta+"%"],\n' +
'            ["TECHNIQUES","Pipeline runs: "+metrics.totalRuns,"Fallback: "+Math.round(metrics.llmCallAvoidanceRate*100)+"%","Success: "+Math.round(metrics.successRate*100)+"%"]\n' +
'        ].map(function(g){return React.createElement("div",{key:g[0],style:{background:"#313244",borderRadius:8,padding:12,marginBottom:12}},\n' +
'            React.createElement("div",{style:{fontSize:11,textTransform:"uppercase",color:"#a6adc8",marginBottom:4}},g[0]),\n' +
'            ...g.slice(1).map(function(v){return React.createElement("div",{key:v,style:{fontSize:13,margin:"2px 0"}},v)})\n' +
'        )}),\n' +
'        React.createElement("button",{onClick:function(){var r=metricsStore.exportReport();navigator.clipboard.writeText(JSON.stringify(r,null,2));},style:{width:"100%",padding:"8px",background:"#89b4fa",color:"#1e1e2e",border:"none",borderRadius:4,cursor:"pointer",fontWeight:600}},"Export Report")\n' +
'    );\n' +
'}\n';

fs.writeFileSync(path.join(dir, "MetricsPanel.tsx"), mp);
console.log("MetricsPanel.tsx created");