import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
export declare class IsLong extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    #private;
    constructor();
    setMinimumRecordDuration(value: TraceEngine.Types.Timing.MilliSeconds): void;
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
}
export declare class Category extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    constructor();
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
}
export declare class TimelineRegExp extends TimelineModel.TimelineModelFilter.TimelineModelFilter {
    private regExpInternal;
    constructor(regExp?: RegExp);
    setRegExp(regExp: RegExp | null): void;
    regExp(): RegExp | null;
    accept(event: TraceEngine.Types.TraceEvents.TraceEventData, traceParsedData?: TraceEngine.Handlers.Types.TraceParseData): boolean;
}
