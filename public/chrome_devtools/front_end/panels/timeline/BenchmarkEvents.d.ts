import type * as TraceEngine from '../../models/trace/trace.js';
export declare class TraceLoadEvent extends Event {
    duration: TraceEngine.Types.Timing.MilliSeconds;
    static readonly eventName = "traceload";
    constructor(duration: TraceEngine.Types.Timing.MilliSeconds);
}
declare global {
    interface HTMLElementEventMap {
        [TraceLoadEvent.eventName]: TraceLoadEvent;
    }
}
