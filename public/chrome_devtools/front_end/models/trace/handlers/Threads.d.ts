import type * as Helpers from '../helpers/helpers.js';
import type * as Types from '../types/types.js';
import { type AuctionWorkletsData } from './AuctionWorkletsHandler.js';
import type * as Renderer from './RendererHandler.js';
import { type TraceParseData } from './types.js';
export interface ThreadData {
    pid: Types.TraceEvents.ProcessID;
    tid: Types.TraceEvents.ThreadID;
    entries: readonly Types.TraceEvents.SyntheticTraceEntry[];
    processIsOnMainFrame: boolean;
    tree: Helpers.TreeHelpers.TraceEntryTree;
    type: ThreadType;
    name: string | null;
    entryToNode: Map<Types.TraceEvents.SyntheticTraceEntry, Helpers.TreeHelpers.TraceEntryNode>;
}
export declare const enum ThreadType {
    MAIN_THREAD = "MAIN_THREAD",
    WORKER = "WORKER",
    RASTERIZER = "RASTERIZER",
    AUCTION_WORKLET = "AUCTION_WORKLET",
    OTHER = "OTHER",
    CPU_PROFILE = "CPU_PROFILE",
    THREAD_POOL = "THREAD_POOL"
}
export declare function threadsInRenderer(rendererData: Renderer.RendererHandlerData, auctionWorkletsData: AuctionWorkletsData): readonly ThreadData[];
/**
 * Given trace parsed data, this helper will return a high level array of
 * ThreadData. This is useful because it allows you to get a list of threads
 * regardless of if the trace is a CPU Profile or a Tracing profile. Thus you
 * can use this helper to iterate over threads in confidence that it will work
 * for both trace types.
 */
export declare function threadsInTrace(traceParseData: TraceParseData): readonly ThreadData[];
