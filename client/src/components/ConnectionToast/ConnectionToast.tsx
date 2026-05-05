import {useEffect, useState} from 'react';
import {CheckCircle, WarningCircle} from 'iconoir-react';
import './ConnectionToast.scss';

export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
}

interface ConnectionToastProps {
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

function ConnectionToastItem ({toast, onDismiss}: ConnectionToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const Icon = toast.type === 'success' ? CheckCircle : WarningCircle;

    return (
        <div className={`connection-toast ${toast.type}`}>
            <Icon className="toast-icon" />
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}

interface ConnectionToastContainerProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export function ConnectionToastContainer ({toasts, onDismiss}: ConnectionToastContainerProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="connection-toast-container">
            {toasts.map(toast => (
                <ConnectionToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
            ))}
        </div>
    );
}

export function useToast () {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (type: ToastMessage['type'], message: string) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        setToasts(prev => [...prev, {id, type, message}]);
    };

    const dismissToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return {
        toasts,
        addToast,
        dismissToast,
        success: (message: string) => addToast('success', message),
        error: (message: string) => addToast('error', message),
        info: (message: string) => addToast('info', message)
    };
}