/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {NodeDescriptor} from "../types";
import {ToolNode as component} from "./ToolNode";
import {Icon, NODE_TYPE} from "./constants";
import {assertIsToolNodeData, ToolNode} from "./types/workflow";


export const ToolNodeDescriptor: NodeDescriptor<typeof NODE_TYPE, ToolNode> = {
    type: NODE_TYPE,
    component,
    icon: Icon,
    title: "AI Tool",
    color: '#db2777',
    assertion: assertIsToolNodeData,
    defaultData: {
        title: "AI Tool",
        toolSubtype: "",
        toolSchema: {} as any,
        userConfig: {},
        handler: undefined,
        toSanitize: ["input", "handler", "toolSchema"]
    }
};