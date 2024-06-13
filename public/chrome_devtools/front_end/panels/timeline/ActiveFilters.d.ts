import type * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import type * as TraceEngine from '../../models/trace/trace.js';
/** Singleton class that contains the set of active filters for the given trace
 * file.
 */
export declare class ActiveFilters {
    #private;
    static instance(opts?: {
        forceNew: boolean | null;
    }): ActiveFilters;
    static removeInstance(): void;
    activeFilters(): readonly TimelineModel.TimelineModelFilter.TimelineModelFilter[];
    setFilters(newFilters: TimelineModel.TimelineModelFilter.TimelineModelFilter[]): void;
    isVisible(event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
}
