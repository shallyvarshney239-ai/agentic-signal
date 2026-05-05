/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const EDGE_ANIMATION_DELAY = 50;

export const runTask = async (task: () => Promise<void>, setIsRunning: (isRunning: boolean) => void) => {
    setIsRunning(true);

    const startTime = performance.now();

    if (EDGE_ANIMATION_DELAY > 0) {
        await sleep(EDGE_ANIMATION_DELAY);
    }

    await task();

    const endTime = performance.now();
    const remainingDelay = Math.max(0, EDGE_ANIMATION_DELAY - (endTime - startTime));

    setTimeout(() => {
        setIsRunning(false);
    }, remainingDelay);
};