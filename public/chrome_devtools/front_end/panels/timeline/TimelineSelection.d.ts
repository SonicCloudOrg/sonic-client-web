import * as TraceEngine from '../../models/trace/trace.js';
type PermittedObjectTypes = TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame | TraceEngine.Types.TraceEvents.TraceEventData | SelectionRange;
declare const SelectionRangeSymbol: unique symbol;
export type SelectionRange = typeof SelectionRangeSymbol;
export declare class TimelineSelection {
    readonly startTime: TraceEngine.Types.Timing.MilliSeconds;
    readonly endTime: TraceEngine.Types.Timing.MilliSeconds;
    readonly object: PermittedObjectTypes;
    constructor(startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds, object: PermittedObjectTypes);
    static isFrameObject(object: PermittedObjectTypes): object is TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame;
    static fromFrame(frame: TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame): TimelineSelection;
    static isSyntheticNetworkRequestDetailsEventSelection(object: PermittedObjectTypes): object is TraceEngine.Types.TraceEvents.SyntheticNetworkRequest;
    static isTraceEventSelection(object: PermittedObjectTypes): object is TraceEngine.Types.TraceEvents.TraceEventData;
    static fromTraceEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): TimelineSelection;
    static isRangeSelection(object: PermittedObjectTypes): object is SelectionRange;
    static fromRange(startTime: number, endTime: number): TimelineSelection;
}
export {};
