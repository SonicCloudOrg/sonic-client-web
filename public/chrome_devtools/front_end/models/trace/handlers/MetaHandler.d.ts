import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export type MetaHandlerData = {
    traceIsGeneric: boolean;
    traceBounds: Types.Timing.TraceWindowMicroSeconds;
    browserProcessId: Types.TraceEvents.ProcessID;
    processNames: Map<Types.TraceEvents.ProcessID, Types.TraceEvents.TraceEventProcessName>;
    browserThreadId: Types.TraceEvents.ThreadID;
    gpuProcessId: Types.TraceEvents.ProcessID;
    gpuThreadId?: Types.TraceEvents.ThreadID;
    viewportRect?: DOMRect;
    navigationsByFrameId: Map<string, Types.TraceEvents.TraceEventNavigationStart[]>;
    navigationsByNavigationId: Map<string, Types.TraceEvents.TraceEventNavigationStart>;
    threadsInProcess: Map<Types.TraceEvents.ProcessID, Map<Types.TraceEvents.ThreadID, Types.TraceEvents.TraceEventThreadName>>;
    mainFrameId: string;
    mainFrameURL: string;
    /**
     * A frame can have multiple renderer processes, at the same time,
     * a renderer process can have multiple URLs. This map tracks the
     * processes active on a given frame, with the time window in which
     * they were active. Because a renderer process might have multiple
     * URLs, each process in each frame has an array of windows, with an
     * entry for each URL it had.
     */
    rendererProcessesByFrame: FrameProcessData;
    topLevelRendererIds: Set<Types.TraceEvents.ProcessID>;
    frameByProcessId: Map<Types.TraceEvents.ProcessID, Map<string, Types.TraceEvents.TraceFrame>>;
    mainFrameNavigations: Types.TraceEvents.TraceEventNavigationStart[];
};
export type FrameProcessData = Map<string, Map<Types.TraceEvents.ProcessID, {
    frame: Types.TraceEvents.TraceFrame;
    window: Types.Timing.TraceWindowMicroSeconds;
}[]>>;
export declare function data(): MetaHandlerData;
