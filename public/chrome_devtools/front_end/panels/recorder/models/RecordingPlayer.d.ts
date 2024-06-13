import * as Common from '../../../core/common/common.js';
import type * as puppeteer from '../../../third_party/puppeteer/puppeteer.js';
import { type Step, type UserFlow } from './Schema.js';
export declare const enum PlayRecordingSpeed {
    Normal = "normal",
    Slow = "slow",
    VerySlow = "very_slow",
    ExtremelySlow = "extremely_slow"
}
export declare const enum ReplayResult {
    Failure = "Failure",
    Success = "Success"
}
export declare const defaultTimeout = 5000;
export declare class RecordingPlayer extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    userFlow: UserFlow;
    speed: PlayRecordingSpeed;
    timeout: number;
    breakpointIndexes: Set<number>;
    steppingOver: boolean;
    aborted: boolean;
    abortPromise: Promise<void>;
    constructor(userFlow: UserFlow, { speed, breakpointIndexes, }: {
        speed: PlayRecordingSpeed;
        breakpointIndexes?: Set<number>;
    });
    static connectPuppeteer(): Promise<{
        page: puppeteer.Page;
        browser: puppeteer.Browser;
    }>;
    static disconnectPuppeteer(browser: puppeteer.Browser): Promise<void>;
    stop(): Promise<void>;
    abort(): void;
    disposeForTesting(): void;
    continue(): void;
    stepOver(): void;
    updateBreakpointIndexes(breakpointIndexes: Set<number>): void;
    play(): Promise<void>;
}
export declare const enum Events {
    Abort = "Abort",
    Done = "Done",
    Step = "Step",
    Stop = "Stop",
    Error = "Error",
    Continue = "Continue"
}
type EventTypes = {
    [Events.Abort]: void;
    [Events.Done]: void;
    [Events.Step]: {
        step: Step;
        resolve: () => void;
    };
    [Events.Stop]: void;
    [Events.Continue]: void;
    [Events.Error]: Error;
};
export {};
