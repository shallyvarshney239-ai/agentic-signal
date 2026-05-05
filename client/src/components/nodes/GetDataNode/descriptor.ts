/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {NodeDescriptor} from "../types";
import {GetDataNode as component} from "./GetDataNode";
import {Icon, NODE_TYPE, TITLE} from "./constants";
import {assertIsGetDataNodeData, GetDataNode} from "./types/workflow";


export const GetDataNodeDescriptor: NodeDescriptor<typeof NODE_TYPE, GetDataNode> = {
    type: NODE_TYPE,
    component,
    icon: Icon,
    title: TITLE,
    color: '#2563eb',
    assertion: assertIsGetDataNodeData,
    defaultData: {
        title: TITLE,
        url: "https://api.exchangerate-api.com/v4/latest/USD",
        dataType: "json",
        toSanitize: ["input"],
    }
};