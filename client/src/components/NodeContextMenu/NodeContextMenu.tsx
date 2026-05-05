/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {Menu, MenuItem, ListItemIcon, ListItemText, Typography, Box} from "@mui/material";
import {Trash, Xmark} from "iconoir-react";
import "./NodeContextMenu.scss";

interface NodeContextMenuProps {
    open: boolean;
    anchorPosition: {left: number; top: number} | null;
    nodeTitle: string;
    onClose: () => void;
    onDelete: () => void;
    onDisconnect: () => void;
}

export function NodeContextMenu ({
    open,
    anchorPosition,
    nodeTitle,
    onClose,
    onDelete,
    onDisconnect
}: NodeContextMenuProps) {
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition ?? undefined}
            onContextMenu={(e) => e.preventDefault()}
            transformOrigin={{
                horizontal: 'left',
                vertical: 'top'
            }}
            PaperProps={{
                className: "node-context-menu",
                elevation: 8
            }}
            MenuListProps={{
                dense: true
            }}
        >
            <Box className="menu-header">
                <Typography variant="caption" className="node-name">
                    {nodeTitle}
                </Typography>
            </Box>
            <MenuItem
                onClick={() => {
                    onDisconnect();
                    onClose();
                }}
                className="menu-item disconnect"
            >
                <ListItemIcon>
                    <Xmark width={18} height={18} />
                </ListItemIcon>
                <ListItemText primary="Disconnect" />
            </MenuItem>
            <MenuItem
                onClick={() => {
                    onDelete();
                    onClose();
                }}
                className="menu-item delete"
            >
                <ListItemIcon>
                    <Trash width={18} height={18} />
                </ListItemIcon>
                <ListItemText primary="Delete Node" />
            </MenuItem>
        </Menu>
    );
}