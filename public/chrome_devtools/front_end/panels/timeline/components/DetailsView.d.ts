import type * as Protocol from '../../../generated/protocol.js';
import * as TraceEngine from '../../../models/trace/trace.js';
export declare function buildWarningElementsForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData, traceParsedData: TraceEngine.Handlers.Types.TraceParseData): HTMLSpanElement[];
export interface DetailRow {
    key: string;
    value: string;
}
export declare function buildRowsForWebSocketEvent(event: TraceEngine.Types.TraceEvents.TraceEventWebSocketCreate | TraceEngine.Types.TraceEvents.TraceEventWebSocketInfo | TraceEngine.Types.TraceEvents.TraceEventWebSocketTransfer, traceParsedData: TraceEngine.Handlers.Types.TraceParseData): readonly DetailRow[];
/**
 * This method does not output any content but instead takes a list of
 * invalidations and groups them, doing some processing of the data to collect
 * invalidations grouped by the reason/cause.
 * It also returns all BackendNodeIds that are related to these invalidations
 * so that they can be fetched via CDP.
 * It is exported only for testing purposes.
 **/
export declare function generateInvalidationsList(invalidations: TraceEngine.Types.TraceEvents.SyntheticInvalidation[]): {
    groupedByReason: Record<string, TraceEngine.Types.TraceEvents.SyntheticInvalidation[]>;
    backendNodeIds: Set<Protocol.DOM.BackendNodeId>;
};
