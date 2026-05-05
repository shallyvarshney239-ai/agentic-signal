/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {createTheme} from "@mui/material";
import {BACKEND_PORT} from "@shared/constants";

export const darkTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#00685f',
            dark: '#005049',
            light: '#6bd8cb',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#565e74',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5faf8',
            paper: '#ffffff',
        },
        text: {
            primary: '#171d1c',
            secondary: '#3d4947',
            disabled: '#6d7a77',
        },
        divider: '#bcc9c6',
        error: {
            main: '#ba1a1a',
        },
    },
    typography: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        fontSize: 13,
        button: {
            textTransform: 'none',
            fontWeight: 500,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#171d1c',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: 500,
                    borderRadius: '4px',
                    padding: '4px 8px',
                },
                arrow: {
                    color: '#171d1c',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                },
            }
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.07), 0 1px 4px rgba(0, 0, 0, 0.04)',
                }
            }
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
                }
            }
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    padding: '16px 20px',
                    fontWeight: 600,
                    borderBottom: '1px solid #e2e8f0',
                    color: '#171d1c',
                }
            }
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    padding: '20px',
                    color: '#171d1c',
                }
            }
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    padding: '12px 20px',
                    borderTop: '1px solid #e2e8f0',
                }
            }
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '13px',
                },
            }
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#6d7a77',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#00685f',
                        borderWidth: '2px',
                    },
                },
                notchedOutline: {
                    borderColor: '#bcc9c6',
                },
            }
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: '#3d4947',
                    fontSize: '13px',
                    fontFamily: "'Inter', system-ui, sans-serif",
                }
            }
        },
        MuiSelect: {
            styleOverrides: {
                select: {
                    color: '#171d1c',
                }
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '13px',
                    color: '#171d1c',
                    '&:hover': {
                        backgroundColor: '#f0f5f2',
                    },
                    '&.Mui-selected': {
                        backgroundColor: '#eaefed',
                        '&:hover': {
                            backgroundColor: '#e4e9e7',
                        }
                    }
                }
            }
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '13px',
                    minHeight: '40px',
                    color: '#3d4947',
                    '&.Mui-selected': {
                        color: '#00685f',
                    }
                }
            }
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: '#00685f',
                }
            }
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: '11px',
                    borderRadius: '9999px',
                }
            }
        },
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: '#00685f',
                    },
                    '&.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#00685f',
                    }
                }
            }
        },
    }
});


export const isValidJsonString = (input: any): boolean => {
    if (input === undefined || input === null) {
        return false;
    }

    if (typeof input === 'string') {
        try {
            JSON.parse(input);

            return true;
        } catch {
            return false;
        }
    }

    return false;
}

export const formatContentForDisplay = (input: any): string | undefined => {
    if (input === undefined || input === null) {
        return undefined;
    }

    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input);

            return `\`\`\`json\n${JSON.stringify(parsed, null, 4)}\n\`\`\``;
        } catch {
            return input;
        }
    }

    return `\`\`\`json\n${JSON.stringify(input, null, 4)}\n\`\`\``;
};

export const parseUrl = (initialUrl: string): string => {
    let url = initialUrl.trim();

    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        url = `https://${url}`;
    }

    let parsedUrl: URL;

    try {
        parsedUrl = new URL(url);
    } catch {
        throw new Error("Invalid URL");
    }

    if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(parsedUrl.hostname)) {
        throw new Error("Invalid domain in URL");
    }

    return url;
}

export const isTauri = (): boolean => {
    return typeof window !== 'undefined' && (
        window.__TAURI_INTERNALS__ !== undefined ||
        window.location.protocol === 'tauri:' ||
        window.location.hostname === 'tauri.localhost'
    );
};

export const getField = <T, >(source: any, key: string, fallback: T): T => {
    if (source && typeof source === "object" && key in source && source[key] !== undefined && source[key] !== null && source[key] !== "") {
        return source[key];
    }

    return fallback;
};

export const graphqlBaseUrl = isTauri()
    ? `http://localhost:${BACKEND_PORT}/graphql`
    : "/graphql";

export function isoToLocalDatetime (isoString: string): string {
    const date = new Date(isoString);
    // Format: YYYY-MM-DDTHH:mm (required format for datetime-local input)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function localDatetimeToIso (localDatetime: string): string {
    const date = new Date(localDatetime);

    return date.toISOString();
}
