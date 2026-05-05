/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {NodeDescriptor} from "../types";
import {ChartNode as component} from "./ChartNode";
import {Icon, NODE_TYPE, TITLE} from "./constants";
import {assertIsChartNodeData, ChartNode} from "./types/workflow";


export const ChartNodeDescriptor: NodeDescriptor<typeof NODE_TYPE, ChartNode> = {
    type: NODE_TYPE,
    component,
    icon: Icon,
    title: TITLE,
    color: '#0891b2',
    assertion: assertIsChartNodeData,
    defaultData: {
        title: TITLE,
        input: {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
            "data": [65, 78, 72, 88, 82],
            "title": "Sample Data Trend"
        },
        toSanitize: ["input"],
    }
};