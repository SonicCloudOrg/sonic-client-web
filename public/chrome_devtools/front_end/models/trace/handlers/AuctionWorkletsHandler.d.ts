import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export interface AuctionWorkletsData {
    worklets: Map<Types.TraceEvents.ProcessID, Types.TraceEvents.SyntheticAuctionWorkletEvent>;
}
export declare function data(): AuctionWorkletsData;
