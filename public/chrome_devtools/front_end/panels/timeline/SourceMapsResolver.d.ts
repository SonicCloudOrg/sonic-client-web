import type * as TraceEngine from '../../models/trace/trace.js';
export declare class NodeNamesUpdated extends Event {
    static readonly eventName = "nodenamesupdated";
    constructor();
}
export declare class SourceMapsResolver extends EventTarget {
    #private;
    constructor(traceData: TraceEngine.Handlers.Types.TraceParseData);
    static clearResolvedNodeNames(): void;
    static resolvedNodeNameForEntry(entry: TraceEngine.Types.TraceEvents.SyntheticProfileCall): string | null;
    static storeResolvedNodeNameForEntry(pid: TraceEngine.Types.TraceEvents.ProcessID, tid: TraceEngine.Types.TraceEvents.ThreadID, nodeId: number, resolvedFunctionName: string | null): void;
    install(): Promise<void>;
    /**
     * Removes the event listeners and stops tracking newly added sourcemaps.
     * Should be called before destroying an instance of this class to avoid leaks
     * with listeners.
     */
    uninstall(): void;
}
