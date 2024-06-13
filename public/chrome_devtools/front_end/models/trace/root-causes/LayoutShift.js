// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
const fontRequestsByPrePaint = new Map();
const renderBlocksByPrePaint = new Map();
function setDefaultValue(map, shift) {
    Platform.MapUtilities.getWithDefault(map, shift, () => {
        return {
            unsizedMedia: [],
            iframes: [],
            fontChanges: [],
            renderBlockingRequests: [],
            scriptStackTrace: [],
        };
    });
}
// Important: we purposefully treat `potentially_blocking` as
// non-render-blocking here because:
// 1. An async script can run on the main thread at any point, including before
//    the page is loaded
// 2. An async script will never block the parsing and rendering process of the
//    browser.
// 3. Therefore, from a developer's point of view, there is nothing more they
//    can do if they've put `async` on, and within the context of Insights, we
//    shouldn't report an async script as render blocking.
// In the future we may want to consider suggesting the use of `defer` over
// `async`, as it doesn't have this concern, but for now we'll allow `async`
// and not report it as an issue.
const NON_RENDER_BLOCKING_VALUES = new Set([
    'non_blocking',
    'potentially_blocking',
]);
function networkRequestIsRenderBlockingInFrame(event, frameId) {
    const isRenderBlocking = !NON_RENDER_BLOCKING_VALUES.has(event.args.data.renderBlocking);
    return isRenderBlocking && event.args.data.frame === frameId;
}
export class LayoutShiftRootCauses {
    #protocolInterface;
    #rootCauseCacheMap = new Map();
    #nodeDetailsCache = new Map();
    #iframeRootCausesEnabled;
    constructor(protocolInterface, options) {
        this.#protocolInterface = protocolInterface;
        this.#iframeRootCausesEnabled = options?.enableIframeRootCauses ?? false;
    }
    /**
     * Calculates the potential root causes for a given layout shift event. Once
     * calculated, this data is cached.
     * Note: because you need all layout shift data at once to calculate these
     * correctly, this function will parse the root causes for _all_ layout shift
     * events the first time that it's called. That then populates the cache for
     * each shift, so any subsequent calls are just a constant lookup.
     */
    async rootCausesForEvent(modelData, event) {
        const cachedResult = this.#rootCauseCacheMap.get(event);
        if (cachedResult) {
            return cachedResult;
        }
        const allLayoutShifts = modelData.LayoutShifts.clusters.flatMap(cluster => cluster.events);
        // Make sure a value in the cache is set even for shifts that don't have a root cause,
        // so that we don't have to recompute when no root causes are found. In case a cause
        // for a shift is found, the default value is replaced.
        allLayoutShifts.forEach(shift => setDefaultValue(this.#rootCauseCacheMap, shift));
        // Populate the cache
        await this.blameShifts(allLayoutShifts, modelData);
        const resultForEvent = this.#rootCauseCacheMap.get(event);
        if (!resultForEvent) {
            // No root causes available for this layout shift.
            return null;
        }
        return resultForEvent;
    }
    /**
     * Determines potential root causes for shifts
     */
    async blameShifts(layoutShifts, modelData) {
        await this.linkShiftsToLayoutInvalidations(layoutShifts, modelData);
        this.linkShiftsToLayoutEvents(layoutShifts, modelData);
    }
    /**
     * "LayoutInvalidations" are a set of trace events dispatched in Blink under the name
     * "layoutInvalidationTracking", which track invalidations on the "Layout"stage of the
     * rendering pipeline. This function utilizes this event to flag potential root causes
     * to layout shifts.
     */
    async linkShiftsToLayoutInvalidations(layoutShifts, modelData) {
        const { prePaintEvents, layoutInvalidationEvents, scheduleStyleInvalidationEvents, backendNodeIds } = modelData.LayoutShifts;
        // For the purposes of determining root causes of layout shifts, we
        // consider scheduleStyleInvalidationTracking and
        // LayoutInvalidationTracking events as events that could have been the
        // cause of the layout shift.
        const eventsForLayoutInvalidation = [...layoutInvalidationEvents, ...scheduleStyleInvalidationEvents];
        const nodes = await this.#protocolInterface.pushNodesByBackendIdsToFrontend(backendNodeIds);
        const nodeIdsByBackendIdMap = new Map();
        for (let i = 0; i < backendNodeIds.length; i++) {
            nodeIdsByBackendIdMap.set(backendNodeIds[i], nodes[i]);
        }
        // Maps from PrePaint events to LayoutShifts that occured in each one.
        const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
        for (const layoutInvalidation of eventsForLayoutInvalidation) {
            // Get the first PrePaint event that happened after the current LayoutInvalidation event.
            const nextPrePaintIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(prePaintEvents, prePaint => prePaint.ts > layoutInvalidation.ts);
            if (nextPrePaintIndex === null) {
                // No PrePaint event registered after this LayoutInvalidation. Continue.
                continue;
            }
            const nextPrePaint = prePaintEvents[nextPrePaintIndex];
            const subsequentShifts = shiftsByPrePaint.get(nextPrePaint);
            if (!subsequentShifts) {
                // The PrePaint after the current LayoutInvalidation doesn't contain shifts.
                continue;
            }
            const fontChangeRootCause = this.getFontChangeRootCause(layoutInvalidation, nextPrePaint, modelData);
            const renderBlockRootCause = this.getRenderBlockRootCause(layoutInvalidation, nextPrePaint, modelData);
            const layoutInvalidationNodeId = nodeIdsByBackendIdMap.get(layoutInvalidation.args.data.nodeId);
            let unsizedMediaRootCause = null;
            let iframeRootCause = null;
            if (layoutInvalidationNodeId !== undefined &&
                Types.TraceEvents.isTraceEventLayoutInvalidationTracking(layoutInvalidation)) {
                unsizedMediaRootCause = await this.getUnsizedMediaRootCause(layoutInvalidation, layoutInvalidationNodeId);
                iframeRootCause = await this.getIframeRootCause(layoutInvalidation, layoutInvalidationNodeId);
            }
            if (!unsizedMediaRootCause && !iframeRootCause && !fontChangeRootCause && !renderBlockRootCause) {
                continue;
            }
            // Add found potential root causes to all the shifts in this PrePaint and populate the cache.
            for (const shift of subsequentShifts) {
                const rootCausesForShift = Platform.MapUtilities.getWithDefault(this.#rootCauseCacheMap, shift, () => {
                    return {
                        unsizedMedia: [],
                        iframes: [],
                        fontChanges: [],
                        renderBlockingRequests: [],
                        scriptStackTrace: [],
                    };
                });
                if (unsizedMediaRootCause &&
                    !rootCausesForShift.unsizedMedia.some(media => media.node.nodeId === unsizedMediaRootCause?.node.nodeId) &&
                    shift.args.frame === layoutInvalidation.args.data.frame) {
                    rootCausesForShift.unsizedMedia.push(unsizedMediaRootCause);
                }
                if (iframeRootCause &&
                    !rootCausesForShift.iframes.some(injectedIframe => injectedIframe.iframe.nodeId === iframeRootCause?.iframe.nodeId)) {
                    rootCausesForShift.iframes.push(iframeRootCause);
                }
                if (fontChangeRootCause) {
                    // Unlike other root causes, we calculate fonts causing a shift only once,
                    // which means we assign the built array instead of appending new objects
                    // to it.
                    rootCausesForShift.fontChanges = fontChangeRootCause;
                }
                if (renderBlockRootCause) {
                    rootCausesForShift.renderBlockingRequests = renderBlockRootCause;
                }
            }
        }
    }
    /**
     * For every shift looks up the initiator of its corresponding Layout event. This initiator
     * is assigned by the RendererHandler and contains the stack trace of the point in a script
     * that caused a style recalculation or a relayout. This stack trace is added to the shift's
     * potential root causes.
     * Note that a Layout cannot always be linked to a script, in that case, we cannot add a
     * "script causing reflow" as a potential root cause to the corresponding shift.
     */
    linkShiftsToLayoutEvents(layoutShifts, modelData) {
        const { prePaintEvents } = modelData.LayoutShifts;
        // Maps from PrePaint events to LayoutShifts that occured in each one.
        const shiftsByPrePaint = getShiftsByPrePaintEvents(layoutShifts, prePaintEvents);
        const eventTriggersLayout = ({ name }) => {
            const knownName = name;
            return knownName === "Layout" /* Types.TraceEvents.KnownEventName.Layout */;
        };
        const layoutEvents = modelData.Renderer.allTraceEntries.filter(eventTriggersLayout);
        for (const layout of layoutEvents) {
            // Get the first PrePaint event that happened after the current layout event.
            const nextPrePaintIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(prePaintEvents, prePaint => prePaint.ts > layout.ts + (layout.dur || 0));
            if (nextPrePaintIndex === null) {
                // No PrePaint event registered after this LayoutInvalidation. Continue.
                continue;
            }
            const nextPrePaint = prePaintEvents[nextPrePaintIndex];
            const subsequentShifts = shiftsByPrePaint.get(nextPrePaint);
            if (!subsequentShifts) {
                // The PrePaint after the current LayoutInvalidation doesn't contain shifts.
                continue;
            }
            const layoutNode = modelData.Renderer.entryToNode.get(layout);
            const initiator = layoutNode ? modelData.Initiators.eventToInitiator.get(layoutNode.entry) : null;
            const stackTrace = initiator?.args?.data?.stackTrace;
            if (!stackTrace) {
                continue;
            }
            // Add found potential root causes to all the shifts in this PrePaint and populate the cache.
            for (const shift of subsequentShifts) {
                const rootCausesForShift = Platform.MapUtilities.getWithDefault(this.#rootCauseCacheMap, shift, () => {
                    return {
                        unsizedMedia: [],
                        iframes: [],
                        fontChanges: [],
                        renderBlockingRequests: [],
                        scriptStackTrace: [],
                    };
                });
                if (rootCausesForShift.scriptStackTrace.length === 0) {
                    rootCausesForShift.scriptStackTrace = stackTrace;
                }
            }
        }
    }
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because a media element without dimensions was resized.
     */
    async getUnsizedMediaRootCause(layoutInvalidation, layoutInvalidationNodeId) {
        // Filter events to resizes only.
        if (layoutInvalidation.args.data.reason !== "Size changed" /* Types.TraceEvents.LayoutInvalidationReason.SIZE_CHANGED */) {
            return null;
        }
        const layoutInvalidationNode = await this.getNodeDetails(layoutInvalidationNodeId);
        if (!layoutInvalidationNode) {
            return null;
        }
        const computedStylesList = await this.#protocolInterface.getComputedStyleForNode(layoutInvalidationNode.nodeId);
        const computedStyles = new Map(computedStylesList.map(item => [item.name, item.value]));
        if (computedStyles && !(await nodeIsUnfixedMedia(layoutInvalidationNode, computedStyles))) {
            return null;
        }
        const authoredDimensions = await this.getNodeAuthoredDimensions(layoutInvalidationNode);
        if (dimensionsAreExplicit(authoredDimensions)) {
            return null;
        }
        const computedDimensions = computedStyles ? getNodeComputedDimensions(computedStyles) : {};
        return { node: layoutInvalidationNode, authoredDimensions, computedDimensions };
    }
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because a node, which is an ancestor to an iframe, was injected.
     */
    async getIframeRootCause(layoutInvalidation, layoutInvalidationNodeId) {
        if (!this.#iframeRootCausesEnabled) {
            return null;
        }
        if (!layoutInvalidation.args.data.nodeName?.startsWith('IFRAME') &&
            layoutInvalidation.args.data.reason !== "Style changed" /* Types.TraceEvents.LayoutInvalidationReason.STYLE_CHANGED */ &&
            layoutInvalidation.args.data.reason !== "Added to layout" /* Types.TraceEvents.LayoutInvalidationReason.ADDED_TO_LAYOUT */) {
            return null;
        }
        const layoutInvalidationNode = await this.getNodeDetails(layoutInvalidationNodeId);
        if (!layoutInvalidationNode) {
            return null;
        }
        const iframe = firstIframeInDOMTree(layoutInvalidationNode);
        if (!iframe) {
            return null;
        }
        return { iframe };
    }
    async getNodeDetails(nodeId) {
        let nodeDetails = this.#nodeDetailsCache.get(nodeId);
        if (nodeDetails !== undefined) {
            return nodeDetails;
        }
        nodeDetails = await this.#protocolInterface.getNode(nodeId);
        this.#nodeDetailsCache.set(nodeId, nodeDetails);
        return nodeDetails;
    }
    /**
     * Given a layout invalidation event and a sorted array, returns the subset of requests that arrived within a
     * 500ms window before the layout invalidation.
     */
    requestsInInvalidationWindow(layoutInvalidation, modelData) {
        const requestsSortedByEndTime = modelData.NetworkRequests.byTime.sort((req1, req2) => {
            const req1EndTime = req1.ts + req1.dur;
            const req2EndTime = req2.ts + req2.dur;
            return req1EndTime - req2EndTime;
        });
        const lastRequestIndex = Platform.ArrayUtilities.nearestIndexFromEnd(requestsSortedByEndTime, request => request.ts + request.dur < layoutInvalidation.ts);
        if (lastRequestIndex === null) {
            return [];
        }
        const MAX_DELTA_FOR_FONT_REQUEST = Helpers.Timing.secondsToMicroseconds(Types.Timing.Seconds(0.5));
        const requestsInInvalidationWindow = [];
        // Get all requests finished within the valid window.
        for (let i = lastRequestIndex; i > -1; i--) {
            const previousRequest = requestsSortedByEndTime[i];
            const previousRequestEndTime = previousRequest.ts + previousRequest.dur;
            if (layoutInvalidation.ts - previousRequestEndTime < MAX_DELTA_FOR_FONT_REQUEST) {
                const requestInInvalidationWindow = { request: previousRequest };
                const initiator = this.#protocolInterface.getInitiatorForRequest(previousRequest.args.data.url);
                requestInInvalidationWindow.initiator = initiator || undefined;
                requestsInInvalidationWindow.push(requestInInvalidationWindow);
            }
            else {
                // No more requests fit in the time window.
                break;
            }
        }
        return requestsInInvalidationWindow;
    }
    /**
     * Given a LayoutInvalidation trace event, determines if it was dispatched
     * because fonts were changed and if so returns the information of all network
     * request with which the fonts were possibly fetched, if any. The computed
     * network requests are cached for the corresponding prepaint event, meaning
     * that other LayoutInvalidation events that correspond to the same prepaint
     * are not processed and the cached network requests for the prepaint is
     * returned instead.
     */
    getFontChangeRootCause(layoutInvalidation, nextPrePaint, modelData) {
        if (layoutInvalidation.args.data.reason !== "Fonts changed" /* Types.TraceEvents.LayoutInvalidationReason.FONTS_CHANGED */) {
            return null;
        }
        // Prevent computing the result of this function multiple times per PrePaint event.
        const fontRequestsForPrepaint = fontRequestsByPrePaint.get(nextPrePaint);
        if (fontRequestsForPrepaint !== undefined) {
            return fontRequestsForPrepaint;
        }
        const fontRequestsInThisPrepaint = this.getFontRequestsInInvalidationWindow(this.requestsInInvalidationWindow(layoutInvalidation, modelData));
        fontRequestsByPrePaint.set(nextPrePaint, fontRequestsInThisPrepaint);
        return fontRequestsInThisPrepaint;
    }
    /**
     * Given the requests that arrived within a 500ms window before the layout invalidation, returns the font
     * requests of them.
     */
    getFontRequestsInInvalidationWindow(requestsInInvalidationWindow) {
        const fontRequests = [];
        // Get all requests finished within the valid window.
        for (let i = 0; i < requestsInInvalidationWindow.length; i++) {
            const fontRequest = requestsInInvalidationWindow[i];
            if (!fontRequest.request.args.data.mimeType.startsWith('font')) {
                continue;
            }
            const fontFace = this.#protocolInterface.fontFaceForSource(fontRequest.request.args.data.url);
            if (!fontFace || fontFace.fontDisplay === 'optional') {
                // Setting font-display to optional is part of what the developer
                // can do to avoid layout shifts due to FOIT/FOUT, as such we cannot
                // suggest any actionable insight here.
                continue;
            }
            fontRequest.fontFace = fontFace;
            fontRequests.push(fontRequest);
        }
        return fontRequests;
    }
    /**
     * Given a LayoutInvalidation trace event, determines if it arrived within a 500ms window before the layout
     * invalidation and if so returns the information of all network request, if any. The computed network
     * requests are cached for the corresponding prepaint event, meaning that other LayoutInvalidation events
     * that correspond to the same prepaint are not processed and the cached network requests for the prepaint is
     *  returned instead.
     */
    getRenderBlockRootCause(layoutInvalidation, nextPrePaint, modelData) {
        // Prevent computing the result of this function multiple times per PrePaint event.
        const renderBlocksInPrepaint = renderBlocksByPrePaint.get(nextPrePaint);
        if (renderBlocksInPrepaint !== undefined) {
            return renderBlocksInPrepaint;
        }
        const renderBlocksInThisPrepaint = getRenderBlockRequestsInInvalidationWindow(this.requestsInInvalidationWindow(layoutInvalidation, modelData));
        renderBlocksByPrePaint.set(nextPrePaint, renderBlocksInThisPrepaint);
        return renderBlocksInThisPrepaint;
    }
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
    async nodeMatchedStylesPropertyGetter(node) {
        const response = await this.#protocolInterface.getMatchedStylesForNode(node.nodeId);
        function cssPropertyValueGetter(cssProperty) {
            let prop = response.inlineStyle?.cssProperties.find(prop => prop.name === cssProperty);
            if (prop) {
                return prop.value;
            }
            for (const { rule } of response.matchedCSSRules || []) {
                const prop = rule.style.cssProperties.find(prop => prop.name === cssProperty);
                if (prop) {
                    return prop.value;
                }
            }
            prop = response.attributesStyle?.cssProperties.find(prop => prop.name === cssProperty);
            if (prop) {
                return prop.value;
            }
            return null;
        }
        return cssPropertyValueGetter;
    }
    /**
     * Returns the CSS dimensions set to the node from its matched styles.
     */
    async getNodeAuthoredDimensions(node) {
        const authoredDimensions = {};
        const cssMatchedRulesGetter = await this.nodeMatchedStylesPropertyGetter(node);
        if (!cssMatchedRulesGetter) {
            return authoredDimensions;
        }
        const attributesFlat = node.attributes || [];
        const attributes = [];
        for (let i = 0; i < attributesFlat.length; i += 2) {
            attributes.push({ name: attributesFlat[i], value: attributesFlat[i + 1] });
        }
        const htmlHeight = attributes.find(attr => attr.name === 'height' && htmlAttributeIsExplicit(attr));
        const htmlWidth = attributes.find(attr => attr.name === 'width' && htmlAttributeIsExplicit(attr));
        const cssExplicitAspectRatio = cssMatchedRulesGetter('aspect-ratio') || undefined;
        if (htmlHeight && htmlWidth && cssExplicitAspectRatio) {
            return { height: htmlHeight.value, width: htmlWidth.value, aspectRatio: cssExplicitAspectRatio };
        }
        const cssHeight = cssMatchedRulesGetter('height') || undefined;
        const cssWidth = cssMatchedRulesGetter('width') || undefined;
        return { height: cssHeight, width: cssWidth, aspectRatio: cssExplicitAspectRatio };
    }
}
/**
 * Given the requests that arrived within a 500ms window before the layout invalidation, returns the render
 * block requests of them.
 */
function getRenderBlockRequestsInInvalidationWindow(requestsInInvalidationWindow) {
    const renderBlockingRequests = [];
    // Get all requests finished within the valid window.
    for (let i = 0; i < requestsInInvalidationWindow.length; i++) {
        const mainFrameId = requestsInInvalidationWindow[i].request.args.data.frame;
        if (!networkRequestIsRenderBlockingInFrame(requestsInInvalidationWindow[i].request, mainFrameId)) {
            continue;
        }
        renderBlockingRequests.push(requestsInInvalidationWindow[i]);
    }
    return renderBlockingRequests;
}
function firstIframeInDOMTree(root) {
    if (root.nodeName === 'IFRAME') {
        return root;
    }
    const children = root.children;
    if (!children) {
        return null;
    }
    for (const child of children) {
        const iFrameInChild = firstIframeInDOMTree(child);
        if (iFrameInChild) {
            return iFrameInChild;
        }
    }
    return null;
}
function cssPropertyIsExplicitlySet(propertyValue) {
    return !['auto', 'initial', 'unset', 'inherit'].includes(propertyValue);
}
function htmlAttributeIsExplicit(attr) {
    return parseInt(attr.value, 10) >= 0;
}
function computedStyleHasBackroundImage(computedStyle) {
    const CSS_URL_REGEX = /^url\("([^"]+)"\)$/;
    const backgroundImage = computedStyle.get('background-image');
    if (!backgroundImage) {
        return false;
    }
    return CSS_URL_REGEX.test(backgroundImage);
}
function computedStyleHasFixedPosition(computedStyle) {
    const position = computedStyle.get('position');
    if (!position) {
        return false;
    }
    return position === 'fixed' || position === 'absolute';
}
function getNodeComputedDimensions(computedStyle) {
    const computedDimensions = {};
    computedDimensions.height = computedStyle.get('height');
    computedDimensions.width = computedStyle.get('width');
    computedDimensions.aspectRatio = computedStyle.get('aspect-ratio');
    return computedDimensions;
}
/**
 * Determines if a node is a media element and is not fixed positioned
 * (i.e. "position: fixed;" or "position: absolute;")
 */
async function nodeIsUnfixedMedia(node, computedStyle) {
    const localName = node.localName;
    const isBackgroundImage = computedStyleHasBackroundImage(computedStyle);
    if (localName !== 'img' && localName !== 'video' && !isBackgroundImage) {
        // Not a media element.
        return false;
    }
    const isFixed = computedStyleHasFixedPosition(computedStyle);
    return !isFixed;
}
/**
 * Determines if a CSS dimensions object explicitly defines both width and height
 * (i.e. not set to auto, inherit, etc.)
 */
function dimensionsAreExplicit(dimensions) {
    const { height, width, aspectRatio } = dimensions;
    const explicitHeight = Boolean(height && cssPropertyIsExplicitlySet(height));
    const explicitWidth = Boolean(width && cssPropertyIsExplicitlySet(width));
    const explicitAspectRatio = Boolean(aspectRatio && cssPropertyIsExplicitlySet(aspectRatio));
    const explicitWithAR = (explicitHeight || explicitWidth) && explicitAspectRatio;
    return (explicitHeight && explicitWidth) || explicitWithAR;
}
/**
 * Given an array of layout shift and PrePaint events, returns a mapping from
 * PrePaint events to layout shifts dispatched within it.
 */
function getShiftsByPrePaintEvents(layoutShifts, prePaintEvents) {
    // Maps from PrePaint events to LayoutShifts that occured in each one.
    const shiftsByPrePaint = new Map();
    // Associate all shifts to their corresponding PrePaint.
    for (const prePaintEvent of prePaintEvents) {
        const firstShiftIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(layoutShifts, shift => shift.ts >= prePaintEvent.ts);
        if (firstShiftIndex === null) {
            // No layout shifts registered after this PrePaint start. Continue.
            continue;
        }
        for (let i = firstShiftIndex; i < layoutShifts.length; i++) {
            const shift = layoutShifts[i];
            if (shift.ts >= prePaintEvent.ts && shift.ts <= prePaintEvent.ts + prePaintEvent.dur) {
                const shiftsInPrePaint = Platform.MapUtilities.getWithDefault(shiftsByPrePaint, prePaintEvent, () => []);
                shiftsInPrePaint.push(shift);
            }
            if (shift.ts > prePaintEvent.ts + prePaintEvent.dur) {
                // Reached the end of this PrePaint. Continue to the next one.
                break;
            }
        }
    }
    return shiftsByPrePaint;
}
//# sourceMappingURL=LayoutShift.js.map