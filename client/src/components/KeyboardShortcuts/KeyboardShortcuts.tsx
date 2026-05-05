import './KeyboardShortcuts.scss';
import {BaseDialog} from '../BaseDialog';

type ShortcutDefinition = {
    action: string;
    shortcuts: string[][];
};

type ShortcutSection = {
    title: string;
    items: ShortcutDefinition[];
};

const SHORTCUT_SECTIONS: ShortcutSection[] = [
    {
        title: 'Workflow',
        items: [
            {action: 'Save workflow', shortcuts: [['mod', 's']]},
            {action: 'Load workflow', shortcuts: [['mod', 'o']]},
            {action: 'Undo', shortcuts: [['mod', 'z']]},
            {action: 'Redo', shortcuts: [['mod', 'shift', 'z'], ['mod', 'y']]},
            {action: 'Delete selection', shortcuts: [['delete'], ['backspace']]},
            {action: 'Select all nodes and edges', shortcuts: [['mod', 'a']]},
            {action: 'Duplicate selection', shortcuts: [['mod', 'd']]},
            {action: 'Clear selection / close shortcuts', shortcuts: [['escape']]},
        ]
    },
    {
        title: 'Canvas',
        items: [
            {action: 'Pan canvas while held', shortcuts: [['space']]},
            {action: 'Zoom in', shortcuts: [['+'], ['=']]},
            {action: 'Zoom out', shortcuts: [['-']]},
            {action: 'Reset zoom', shortcuts: [['0']]},
            {action: 'Fit workflow to view', shortcuts: [['f']]},
        ]
    },
    {
        title: 'Help',
        items: [
            {action: 'Toggle shortcuts dialog', shortcuts: [['mod', '/'], ['mod', '?']]},
        ]
    }
];

export function isMacPlatform (): boolean {
    if (typeof navigator === 'undefined') {
        return false;
    }

    return /(Mac|iPhone|iPad|iPod)/i.test(navigator.platform);
}

function getKeyLabel (key: string, isMac: boolean): string {
    switch (key) {
        case 'mod':
            return isMac ? '⌘' : 'Ctrl';
        case 'ctrl':
            return isMac ? '⌃' : 'Ctrl';
        case 'shift':
            return 'Shift';
        case 'alt':
            return isMac ? '⌥' : 'Alt';
        case 'delete':
            return 'Delete';
        case 'backspace':
            return isMac ? 'Delete' : 'Backspace';
        case 'escape':
            return 'Esc';
        case 'space':
            return 'Space';
        default:
            return key.length === 1 ? key.toUpperCase() : key;
    }
}

export function formatShortcutHint (keys: string[]): string {
    const isMac = isMacPlatform();

    return keys
        .map((key) => getKeyLabel(key, isMac))
        .join(isMac ? ' ' : '+');
}

type KeyboardShortcutsProps = {
    open: boolean;
    onClose: () => void;
};

export function KeyboardShortcuts ({open, onClose}: KeyboardShortcutsProps) {
    const isMac = isMacPlatform();

    return (
        <BaseDialog open={open} onClose={onClose} title="Keyboard Shortcuts" maxWidth="md">
            <div className="keyboard-shortcuts">
                <p className="keyboard-shortcuts__intro">
                    {isMac ? 'Mac shortcuts use the ⌘ Cmd key.' : 'Windows shortcuts use the Ctrl key.'}
                </p>

                {SHORTCUT_SECTIONS.map((section) => (
                    <section key={section.title} className="keyboard-shortcuts__section">
                        <h3 className="keyboard-shortcuts__section-title">{section.title}</h3>

                        <div className="keyboard-shortcuts__list">
                            {section.items.map((item) => (
                                <div key={item.action} className="keyboard-shortcuts__row">
                                    <span className="keyboard-shortcuts__action">{item.action}</span>

                                    <div className="keyboard-shortcuts__combos">
                                        {item.shortcuts.map((combo) => (
                                            <div key={combo.join('-')} className="keyboard-shortcuts__combo">
                                                {combo.map((key) => (
                                                    <kbd key={key} className="keyboard-shortcuts__key">
                                                        {getKeyLabel(key, isMac)}
                                                    </kbd>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </BaseDialog>
    );
}
