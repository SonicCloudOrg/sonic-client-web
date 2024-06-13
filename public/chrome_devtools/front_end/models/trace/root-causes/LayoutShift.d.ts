import type * as Protocol from '../../../generated/protocol.js';
import { type TraceParseData } from '../handlers/types.js';
import * as Types from '../types/types.js';
import { type RootCauseProtocolInterface } from './RootCauses.js';
export type CSSDimensions = {
    width?: string;
    height?: string;
    aspectRatio?: string;
};
export interface UnsizedMedia {
    node: Protocol.DOM.Node;
    authoredDimensions?: CSSDimensions;
    computedDimensions: CSSDimensions;
}
export interface InjectedIframe {
    iframe: Protocol.DOM.Node;
}
export interface RootCauseRequest {
    request: Types.TraceEvents.SyntheticNetworkRequest;
    initiator?: Protocol.Network.Initiator;
}
export interface FontChange extends RootCauseRequest {
    fontFace: Protocol.CSS.FontFace;
}
export interface RenderBlockingRequest extends RootCauseRequest {
}
export interface LayoutShiftRootCausesData {
    unsizedMedia: UnsizedMedia[];
    iframes: InjectedIframe[];
    fontChanges: FontChange[];
    renderBlockingRequests: RenderBlockingRequest[];
    scriptStackTrace: Types.TraceEvents.TraceEventCallFrame[];
}
interface Options {
    /** Checking iframe root causes can be an expensive operation, so it is disabled by default. */
    enableIframeRootCauses?: boolean;
}
export declare class LayoutShiftRootCauses {
    #private;
    constructor(protocolInterface: RootCauseProtocolInterface, options?: Options);
    /**
     * Calculates the potential root causes for a given layout shift event. Once
     * calculated, this data is cached.
     * Note: because you need all layout shift data at once to calculate these
     * correctly, this function will parse the root causes for _all_ layout shift
     * events the first time that it's called. That then populates the cache for
     * each shift, so any subsequent calls are just a constant lookup.
     */
    rootCausesForEvent(modelData: TraceParseData, event: Types.TraceEvents.TraceEventLayoutShift): Promise<Readonly<LayoutShiftRootCausesData> | null>;
    /**
     * Determines potential root causes for shifts
     */
    blameShifts(layoutShifts: Types.TraceEvents.TraceEventLayoutShift[], modelData: TraceParseData): Promise<void>;
    /**
     * "LayoutInvalidations" are a set of trace events dispatched in Blink under the name
     * "layoutInvalidationTracking", which track invalidations on the "Layout"stage of the
     * rendering pipeline. This function utilizes this event to flag potential root causes
     * to layout shifts.
     */
    linkShiftsToLayoutInvalidations(layoutShifts: Types.TraceEvents.TraceEventLayoutShift[], modelData: TraceParseData): Promise<void>;
    /**
     * For every shift looks up the initiator of its corresponding Layout event. This initiator
     * is assigned by the RendererHandler and contains the stack trace of the point in a script
     * that caused a style recalculation or a relayout. This stack trace is added to the shift's
     * potential root causes.
     * Note that a Layout cannot always be linked to a script, in that case, we cannot add a
     * "script causing reflow" as a potential root cause to the corresponding shift.
     */
    linkShiftsToLayoutEvents(layoutShifts: Types.TraceEvents.TraceEventLayoutShift[], modelData: TraceParseData): void;
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because a media element without dimensions was resized.
     */
    getUnsizedMediaRootCause(layoutInvalidation: Types.TraceEvents.TraceEventLayoutInvalidationTracking, layoutInvalidationNodeId: Protocol.DOM.NodeId): Promise<UnsizedMedia | null>;
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because a node, which is an ancestor to an iframe, was injected.
     */
    getIframeRootCause(layoutInvalidation: Types.TraceEvents.TraceEventLayoutInvalidationTracking, layoutInvalidationNodeId: Protocol.DOM.NodeId): Promise<InjectedIframe | null>;
    getNodeDetails(nodeId: Protocol.DOM.NodeId): Promise<Protocol.DOM.Node | null>;
    /**
     * Given a layout invalidation event and a sorted array, returns the subset of requests that arrived within a
     * 500ms window before the layout invalidation.
     */
    requestsInInvalidationWindow(layoutInvalidation: Types.TraceEvents.TraceEventLayoutInvalidationTracking | Types.TraceEvents.TraceEventScheduleStyleInvalidationTracking, modelData: TraceParseData): RootCauseRequest[];
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because fonts were changed and if so returns the information of all network
     * request with which the fonts were possibly fetched, if any. The computed
     * network requests are cached for the corresponding prepaint event, meaning
     * that other LayoutInvalidation events that correspond to the same prepaint
     * are not processed and the cached network requests for the prepaint is
     * returned instead.
     */
    getFontChangeRootCause(layoutInvalidation: Types.TraceEvents.TraceEventLayoutInvalidationTracking | Types.TraceEvents.TraceEventScheduleStyleInvalidationTracking, nextPrePaint: Types.TraceEvents.TraceEventPrePaint, modelData: TraceParseData): FontChange[] | null;
    /**
     * Given the requests that arrived within a 500ms window before the layout invalidation, returns the font
     * requests of them.
     */
    getFontRequestsInInvalidationWindow(requestsInInvalidationWindow: RootCauseRequest[]): FontChange[];
    /**
     * Given a LayoutInvalidation trace event, determines if it arrived within a 500ms window before the layout
     * invalidation and if so returns the information of all network request, if any. The computed network
     * requests are cached for the corresponding prepaint event, meaning that other LayoutInvalidation events
     * that correspond to the same prepaint are not processed and the cached network requests for the prepaint is
     *  returned instead.
     */
    getRenderBlockRootCause(layoutInvalidation: Types.TraceEvents.TraceEventLayoutInvalidationTracking | Types.TraceEvents.TraceEventScheduleStyleInvalidationTracking, nextPrePaint: Types.TraceEvents.TraceEventPrePaint, modelData: TraceParseData): RenderBlockingRequest[] | null;
    /**
     * Returns a function that retrieves the active value of a given
     * CSS property within the matched styles of the param node.
     * The first occurence within the matched styles is returned and the
     * value is looked up in the following order, which follows CSS
     * specificity:
     * 1. Inline styles.
     * 2. CSS rules matching this node, from all applicable stylesheets.
     * 3. Attribute defined styles.
     */
    nodeMatchedStylesPropertyGetter(node: Protocol.DOM.Node): Promise<((property: string) => string | null)>;
    /**
     * Returns the CSS dimensions set to the node from its matched styles.
     */
    getNodeAuthoredDimensions(node: Protocol.DOM.Node): Promise<CSSDimensions>;
}
export {};
