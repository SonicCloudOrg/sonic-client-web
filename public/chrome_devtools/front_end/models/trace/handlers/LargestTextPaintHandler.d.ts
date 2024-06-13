import type * as Protocol from '../../../generated/protocol.js';
import * as Types from '../types/types.js';
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function data(): Map<Protocol.DOM.BackendNodeId, Types.TraceEvents.TraceEventLargestTextPaintCandidate>;
