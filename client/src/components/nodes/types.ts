/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export type Position = { x: number; y: number };

export type DataNode = {
    data: any;
}

export type NodeDescriptor<T extends string, N extends DataNode> = {
    type: T;
    component: React.ComponentType<any>;
    icon: React.ReactElement<{className?: string}>;
    title: string;
    /** Accent color for the node card (left bar, icon bg). Defaults to teal. */
    color?: string;
    assertion: (data: unknown) => void;
    defaultData: N["data"];
};