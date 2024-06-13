import type * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare const enum SelectorTimingsKey {
    Elapsed = "elapsed (us)",
    RejectPercentage = "reject_percentage",
    FastRejectCount = "fast_reject_count",
    MatchAttempts = "match_attempts",
    MatchCount = "match_count",
    Selector = "selector",
    StyleSheetId = "style_sheet_id"
}
export declare class TimelineSelectorStatsView extends UI.Widget.VBox {
    #private;
    constructor(traceParsedData: TraceEngine.Handlers.Types.TraceParseData | null);
    setEvent(event: TraceEngine.Types.TraceEvents.TraceEventUpdateLayoutTree): boolean;
    setAggregatedEvents(events: TraceEngine.Types.TraceEvents.TraceEventUpdateLayoutTree[]): void;
    private createRowsForTable;
}
