import * as TraceEngine from '../../models/trace/trace.js';
export declare abstract class TimelineModelFilter {
    abstract accept(_event: TraceEngine.Types.TraceEvents.TraceEventData, traceParsedData?: TraceEngine.Handlers.Types.TraceParseData): boolean;
}
export declare class TimelineVisibleEventsFilter extends TimelineModelFilter {
    private readonly visibleTypes;
    constructor(visibleTypes: string[]);
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
    static eventType(event: TraceEngine.Types.TraceEvents.TraceEventData): TraceEngine.Types.TraceEvents.KnownEventName;
}
export declare class TimelineInvisibleEventsFilter extends TimelineModelFilter {
    #private;
    constructor(invisibleTypes: TraceEngine.Types.TraceEvents.KnownEventName[]);
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
}
export declare class ExclusiveNameFilter extends TimelineModelFilter {
    #private;
    constructor(excludeNames: TraceEngine.Types.TraceEvents.KnownEventName[]);
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
}
