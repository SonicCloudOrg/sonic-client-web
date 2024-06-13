import * as TraceEngine from '../../models/trace/trace.js';
export interface InitiatorData {
    event: TraceEngine.Types.TraceEvents.TraceEventData;
    initiator: TraceEngine.Types.TraceEvents.TraceEventData;
    isEntryHidden?: boolean;
    isInitiatorHidden?: boolean;
}
/**
 * Given an event that the user has selected, this function returns all the
 * data of events and their initiators that need to be drawn on the flamechart.
 * The reason that this can return multiple InitiatorEntry objects is because we draw the
 * entire chain: for each, we see if it had an initiator, and
 * work backwards to draw each one, as well as the events initiated directly by the entry.
 */
export declare function initiatorsDataToDraw(traceEngineData: TraceEngine.Handlers.Types.TraceParseData, selectedEvent: TraceEngine.Types.TraceEvents.TraceEventData, hiddenEntries: TraceEngine.Types.TraceEvents.TraceEventData[], expandableEntries: TraceEngine.Types.TraceEvents.TraceEventData[]): readonly InitiatorData[];
