/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {NodeDescriptor} from "../types";
import {DataSourceNode as component} from "./DataSourceNode";
import {Icon, NODE_TYPE, TITLE} from "./constants";
import {assertIsDataSourceNodeData, DATA_SOURCE_TYPES, DataSourceNode} from "./types/workflow";

export const DataSourceNodeDescriptor: NodeDescriptor<typeof NODE_TYPE, DataSourceNode> = {
    type: NODE_TYPE,
    component: component,
    icon: Icon,
    title: TITLE,
    color: '#059669',
    assertion: assertIsDataSourceNodeData,
    defaultData: {
        title: TITLE,
        dataSource: {
            value: `{ "example": "Hello, World!", "timestamp": "2025-01-01T00:00:00Z" }`,
            type: DATA_SOURCE_TYPES.JSON
        },
        toSanitize: ["input"],
    }
};