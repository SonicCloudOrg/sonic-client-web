import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as Types from './types/types.js';
export declare class TracingManager extends SDK.SDKModel.SDKModel<void> {
    #private;
    constructor(target: SDK.Target.Target);
    bufferUsage(usage?: number, eventCount?: number, percentFull?: number): void;
    eventsCollected(events: Types.TraceEvents.TraceEventData[]): void;
    tracingComplete(): void;
    reset(): Promise<void>;
    start(client: TracingManagerClient, categoryFilter: string, options: string): Promise<Protocol.ProtocolResponseWithError>;
    stop(): void;
}
export interface TracingManagerClient {
    traceEventsCollected(events: Types.TraceEvents.TraceEventData[]): void;
    tracingComplete(): void;
    tracingBufferUsage(usage: number): void;
    eventsRetrievalProgress(progress: number): void;
}
