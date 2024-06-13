import * as SDK from '../../core/sdk/sdk.js';
import type * as TraceEngine from '../../models/trace/trace.js';
/**
 * If the event's thread was identified as belonging to a worker, this will
 * return the target representing that worker. Otherwise, we return the primary
 * page's target.
 **/
export declare function targetForEvent(traceParsedData: TraceEngine.Handlers.Types.TraceParseData, event: TraceEngine.Types.TraceEvents.TraceEventData): SDK.Target.Target | null;
