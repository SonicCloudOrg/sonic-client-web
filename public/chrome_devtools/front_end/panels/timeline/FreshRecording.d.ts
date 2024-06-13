import type * as TraceEngine from '../../models/trace/trace.js';
/**
 * In multiple places we need to know if the trace we are working on is fresh
 * or not. We cannot store that data in the trace file's metadata (otherwise a
 * loaded trace file could claim to be fresh), so we store it here. When a new trace
 * is loaded, we set this flag accordingly.
 **/
export declare class Tracker {
    #private;
    static instance(opts?: {
        forceNew: boolean;
    }): Tracker;
    registerFreshRecording(data: TraceEngine.Handlers.Types.TraceParseData): void;
    recordingIsFresh(data: TraceEngine.Handlers.Types.TraceParseData): boolean;
}
