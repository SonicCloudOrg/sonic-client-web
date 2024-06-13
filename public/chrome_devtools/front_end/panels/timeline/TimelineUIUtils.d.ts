import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as LegacyComponents from '../../ui/legacy/components/utils/utils.js';
import { type CategoryPalette, type TimelineCategory, TimelineRecordStyle } from './EventUICategory.js';
type LinkifyLocationOptions = {
    scriptId: Protocol.Runtime.ScriptId | null;
    url: string;
    lineNumber: number;
    columnNumber?: number;
    isFreshRecording?: boolean;
    target: SDK.Target.Target | null;
    linkifier: LegacyComponents.Linkifier.Linkifier;
};
export declare class TimelineUIUtils {
    static frameDisplayName(frame: Protocol.Runtime.CallFrame): string;
    static testContentMatching(traceEvent: TraceEngine.Types.TraceEvents.TraceEventData, regExp: RegExp, traceParsedData?: TraceEngine.Handlers.Types.TraceParseData): boolean;
    static eventStyle(event: TraceEngine.Types.TraceEvents.TraceEventData): TimelineRecordStyle;
    static eventColor(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    static eventTitle(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
    static isUserFrame(frame: Protocol.Runtime.CallFrame): boolean;
    static syntheticNetworkRequestCategory(request: TraceEngine.Types.TraceEvents.SyntheticNetworkRequest): NetworkCategory;
    static networkCategoryColor(category: NetworkCategory): string;
    static buildDetailsTextForTraceEvent(event: TraceEngine.Types.TraceEvents.TraceEventData, traceParsedData: TraceEngine.Handlers.Types.TraceParseData): Promise<string | null>;
    static buildDetailsNodeForTraceEvent(event: TraceEngine.Types.TraceEvents.TraceEventData, target: SDK.Target.Target | null, linkifier: LegacyComponents.Linkifier.Linkifier, isFreshRecording: boolean | undefined, traceParsedData: TraceEngine.Handlers.Types.TraceParseData): Promise<Node | null>;
    static linkifyLocation(linkifyOptions: LinkifyLocationOptions): Element | null;
    static linkifyTopCallFrame(event: TraceEngine.Types.TraceEvents.TraceEventData, target: SDK.Target.Target | null, linkifier: LegacyComponents.Linkifier.Linkifier, isFreshRecording?: boolean): Element | null;
    static buildDetailsNodeForMarkerEvents(event: TraceEngine.Types.TraceEvents.MarkerEvent): HTMLElement;
    static buildConsumeCacheDetails(eventData: {
        consumedCacheSize?: number;
        cacheRejected?: boolean;
        cacheKind?: string;
    }, contentHelper: TimelineDetailsContentHelper): void;
    static buildTraceEventDetails(traceParseData: TraceEngine.Handlers.Types.TraceParseData, event: TraceEngine.Types.TraceEvents.TraceEventData, linkifier: LegacyComponents.Linkifier.Linkifier, detailed: boolean): Promise<DocumentFragment>;
    static statsForTimeRange(events: TraceEngine.Types.TraceEvents.TraceEventData[], startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds): {
        [x: string]: number;
    };
    static buildSyntheticNetworkRequestDetails(traceParseData: TraceEngine.Handlers.Types.TraceParseData, event: TraceEngine.Types.TraceEvents.SyntheticNetworkRequest, linkifier: LegacyComponents.Linkifier.Linkifier): Promise<DocumentFragment>;
    private static renderEventJson;
    static stackTraceFromCallFrames(callFrames: Protocol.Runtime.CallFrame[] | TraceEngine.Types.TraceEvents.TraceEventCallFrame[]): Protocol.Runtime.StackTrace;
    private static generateCauses;
    private static createEntryLink;
    private static generateInvalidationsList;
    private static generateInvalidationsForReason;
    private static aggregatedStatsForTraceEvent;
    static buildPicturePreviewContent(traceData: TraceEngine.Handlers.Types.TraceParseData, event: TraceEngine.Types.TraceEvents.TraceEventPaint, target: SDK.Target.Target): Promise<Element | null>;
    static createEventDivider(event: TraceEngine.Types.TraceEvents.TraceEventData, zeroTime: number): Element;
    static visibleEventsFilter(): TimelineModel.TimelineModelFilter.TimelineModelFilter;
    static categories(): CategoryPalette;
    static generatePieChart(aggregatedStats: {
        [x: string]: number;
    }, selfCategory?: TimelineCategory, selfTime?: number): Element;
    static generateDetailsContentForFrame(frame: TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame, filmStrip: TraceEngine.Extras.FilmStrip.Data | null, filmStripFrame: TraceEngine.Extras.FilmStrip.Frame | null): DocumentFragment;
    static frameDuration(frame: TraceEngine.Handlers.ModelHandlers.Frames.TimelineFrame): Element;
    static quadWidth(quad: number[]): number;
    static quadHeight(quad: number[]): number;
    static eventDispatchDesciptors(): EventDispatchTypeDescriptor[];
    static markerStyleForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): TimelineMarkerStyle;
    static colorForId(id: string): string;
    static displayNameForFrame(frame: TraceEngine.Types.TraceEvents.TraceFrame, trimAt?: number): string;
}
export declare const enum NetworkCategory {
    HTML = "HTML",
    Script = "Script",
    Style = "Style",
    Media = "Media",
    Other = "Other"
}
export declare const aggregatedStatsKey: unique symbol;
export declare const previewElementSymbol: unique symbol;
export declare class EventDispatchTypeDescriptor {
    priority: number;
    color: string;
    eventTypes: string[];
    constructor(priority: number, color: string, eventTypes: string[]);
}
export declare class TimelineDetailsContentHelper {
    fragment: DocumentFragment;
    private linkifierInternal;
    private target;
    element: HTMLDivElement;
    private tableElement;
    constructor(target: SDK.Target.Target | null, linkifier: LegacyComponents.Linkifier.Linkifier | null);
    addSection(title: string, swatchColor?: string): void;
    linkifier(): LegacyComponents.Linkifier.Linkifier | null;
    appendTextRow(title: string, value: string | number | boolean): void;
    appendElementRow(title: string, content: string | Node, isWarning?: boolean, isStacked?: boolean): void;
    appendLocationRow(title: string, url: string, startLine: number, startColumn?: number): void;
    appendLocationRange(title: string, url: Platform.DevToolsPath.UrlString, startLine: number, endLine?: number): void;
    createChildStackTraceElement(stackTrace: Protocol.Runtime.StackTrace): void;
}
export declare const categoryBreakdownCacheSymbol: unique symbol;
export interface TimelineMarkerStyle {
    title: string;
    color: string;
    lineWidth: number;
    dashStyle: number[];
    tall: boolean;
    lowPriority: boolean;
}
/**
 * Given a particular event, this method can adjust its timestamp by
 * substracting the timestamp of the previous navigation. This helps in cases
 * where the user has navigated multiple times in the trace, so that we can show
 * the LCP (for example) relative to the last navigation.
 **/
export declare function timeStampForEventAdjustedForClosestNavigationIfPossible(event: TraceEngine.Types.TraceEvents.TraceEventData, traceParsedData: TraceEngine.Handlers.Types.TraceParseData | null): TraceEngine.Types.Timing.MilliSeconds;
/**
 * Determines if an event is potentially a marker event. A marker event here
 * is a single moment in time that we want to highlight on the timeline, such as
 * the LCP time. This method does not filter out events: for example, it treats
 * every LCP Candidate event as a potential marker event.
 **/
export declare function isMarkerEvent(traceParseData: TraceEngine.Handlers.Types.TraceParseData, event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
export {};
