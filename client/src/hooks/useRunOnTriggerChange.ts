/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useEffect, useRef} from "react";

type UseRunOnTriggerChangeProps = {
    clearError: () => void;
    clearOutput: () => void;
    runCallback: () => void;
    skipFirstRun?: boolean;
    compareValues?: boolean;
}

function deepEqual (a: any, b: any): boolean {
    if (a === b) return true;

    if (a == null || b == null) return a === b;

    if (typeof a !== typeof b) return false;

    if (typeof a === 'object') {
        if (Array.isArray(a) !== Array.isArray(b)) return false;

        if (Array.isArray(a)) {
            if (a.length !== b.length) return false;

            return a.every((item, index) => deepEqual(item, b[index]));
        }

        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => deepEqual(a[key], b[key]));
    }

    return false;
}

export function useRunOnTriggerChange ({
    clearError,
    clearOutput,
    runCallback,
    skipFirstRun = false,
    compareValues = true
}: UseRunOnTriggerChangeProps, changeTriggers: any[] = []) {
    const previousValuesRef = useRef<any[]>([]);
    const isFirstRunRef = useRef(true);
    const hasChangesRef = useRef(false);

    useEffect(() => {
        if (changeTriggers.some((trigger) => trigger == undefined)) {
            return;
        }

        if (skipFirstRun && isFirstRunRef.current) {
            isFirstRunRef.current = false;
            previousValuesRef.current = [...changeTriggers];

            return;
        }

        if (compareValues && !isFirstRunRef.current) {
            const hasActualChange = changeTriggers.some((trigger, index) => {
                const prev = previousValuesRef.current[index];

                return !deepEqual(trigger, prev);
            });

            if (!hasActualChange) {
                return;
            }
        }

        isFirstRunRef.current = false;
        previousValuesRef.current = [...changeTriggers];
        hasChangesRef.current = true;

        clearError();
        clearOutput();
        runCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, changeTriggers);
}
