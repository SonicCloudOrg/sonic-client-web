import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
import { type FrameProcessData } from './MetaHandler.js';
import { type TraceEventHandlerName } from './types.js';
export declare function handleUserConfig(userConfig: Types.Configuration.Configuration): void;
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): RendererHandlerData;
/**
 * Steps through all the renderer processes we've located so far in the meta
 * handler, obtaining their URL, checking whether they are the main frame, and
 * collecting each one of their threads' name. This meta handler's data is
 * assigned to the renderer handler's data.
 */
export declare function assignMeta(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>, mainFrameId: string, rendererProcessesByFrame: FrameProcessData, threadsInProcess: Map<Types.TraceEvents.ProcessID, Map<Types.TraceEvents.ThreadID, Types.TraceEvents.TraceEventThreadName>>): void;
/**
 * Assigns origins to all threads in all processes.
 * @see assignMeta
 */
export declare function assignOrigin(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>, rendererProcessesByFrame: FrameProcessData): void;
/**
 * Assigns whether or not a thread is the main frame to all threads in all processes.
 * @see assignMeta
 */
export declare function assignIsMainFrame(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>, mainFrameId: string, rendererProcessesByFrame: FrameProcessData): void;
/**
 * Assigns the thread name to all threads in all processes.
 * @see assignMeta
 */
export declare function assignThreadName(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>, rendererProcessesByFrame: FrameProcessData, threadsInProcess: Map<Types.TraceEvents.ProcessID, Map<Types.TraceEvents.ThreadID, Types.TraceEvents.TraceEventThreadName>>): void;
/**
 * Removes unneeded trace data opportunistically stored while handling events.
 * This currently does the following:
 *  - Deletes processes with an unkonwn origin.
 */
export declare function sanitizeProcesses(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>): void;
/**
 * Removes unneeded trace data opportunistically stored while handling events.
 * This currently does the following:
 *  - Deletes threads with no roots.
 */
export declare function sanitizeThreads(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>): void;
/**
 * Creates a hierarchical structure from the trace events. Each thread in each
 * process will contribute to their own individual hierarchy.
 *
 * The trace data comes in as a contiguous array of events, against which we
 * make a couple of assumptions:
 *
 *  1. Events are temporally-ordered in terms of start time (though they're
 *     not necessarily ordered as such in the data stream).
 *  2. If event B's start and end times are within event A's time boundaries
 *     we assume that A is the parent of B.
 *
 * Therefore we expect to reformulate something like:
 *
 * [ Task A ][ Task B ][ Task C ][ Task D ][ Task E ]
 *
 * Into something hierarchically-arranged like below:
 *
 * |------------- Task A -------------||-- Task E --|
 *  |-- Task B --||-- Task D --|
 *   |- Task C -|
 */
export declare function buildHierarchy(processes: Map<Types.TraceEvents.ProcessID, RendererProcess>, options?: {
    filter: {
        has: (name: Types.TraceEvents.KnownEventName) => boolean;
    };
}): void;
export declare function makeCompleteEvent(event: Types.TraceEvents.TraceEventBegin | Types.TraceEvents.TraceEventEnd): Types.TraceEvents.SyntheticCompleteEvent | null;
export declare function deps(): TraceEventHandlerName[];
export interface RendererHandlerData {
    processes: Map<Types.TraceEvents.ProcessID, RendererProcess>;
    /**
     * A map of all compositor workers (which we show in the UI as Rasterizers)
     * by the process ID.
     */
    compositorTileWorkers: Map<Types.TraceEvents.ProcessID, Types.TraceEvents.ThreadID[]>;
    entryToNode: Map<Types.TraceEvents.SyntheticTraceEntry, Helpers.TreeHelpers.TraceEntryNode>;
    /**
     * All trace events and synthetic profile calls made from
     * samples.
     */
    allTraceEntries: Types.TraceEvents.SyntheticTraceEntry[];
}
export interface RendererProcess {
    url: string | null;
    isOnMainFrame: boolean;
    threads: Map<Types.TraceEvents.ThreadID, RendererThread>;
}
export interface RendererThread {
    name: string | null;
    /**
     * Contains trace events and synthetic profile calls made from
     * samples.
     */
    entries: Types.TraceEvents.SyntheticTraceEntry[];
    profileCalls: Types.TraceEvents.SyntheticProfileCall[];
    tree?: Helpers.TreeHelpers.TraceEntryTree;
}
