import * as SDK from '../../../core/sdk/sdk.js';
import type * as Protocol from '../../../generated/protocol.js';
import type * as Handlers from '../handlers/handlers.js';
import * as Types from '../types/types.js';
export declare function clearCacheForTesting(): void;
/**
 * Looks up the DOM Node on the page for the given BackendNodeId. Uses the
 * provided TraceParseData as the cache and will cache the result after the
 * first lookup.
 */
export declare function domNodeForBackendNodeID(modelData: Handlers.Types.TraceParseData, nodeId: Protocol.DOM.BackendNodeId): Promise<SDK.DOMModel.DOMNode | null>;
/**
 * Extracts a set of NodeIds for a given event.
 * NOTE: you probably don't want to call this and instead use
 * `extractRelatedDOMNodesFromEvent`, which will fetch the nodes over CDP.
 * This method is primarily exported so we can test the logic more easily
 * without having to mock the CDP layer.
 **/
export declare function nodeIdsForEvent(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventData): Set<Protocol.DOM.BackendNodeId>;
/**
 * Looks up for backend node ids in different types of trace events
 * and resolves them into related DOM nodes.
 * This method should be progressively updated to support more events
 * containing node ids which we want to resolve.
 */
export declare function extractRelatedDOMNodesFromEvent(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventData): Promise<Map<Protocol.DOM.BackendNodeId, SDK.DOMModel.DOMNode | null> | null>;
/**
 * Takes a set of Protocol.DOM.BackendNodeId ids and will return a map of NodeId=>DOMNode.
 * Results are cached based on 1) the provided TraceParseData and 2) the provided set of IDs.
 */
export declare function domNodesForMultipleBackendNodeIds(modelData: Handlers.Types.TraceParseData, nodeIds: Array<Protocol.DOM.BackendNodeId>): Promise<Map<Protocol.DOM.BackendNodeId, SDK.DOMModel.DOMNode | null>>;
export interface LayoutShiftSource {
    previousRect: DOMRect;
    currentRect: DOMRect;
    node: SDK.DOMModel.DOMNode;
}
/**
 * Calculates and returns a list of sources for a LayoutShift.
 * Here, a source is considered as a node that moved and contributed to the
 * given LayoutShift existing and the score it was given. Each source returned
 * contains a reference to the DOM Node, and its dimensions (as a DOMRect), both
 * before and now, so we can see how this node changed and how that impacted the
 * layout shift.
 *
 * This data is cached based on the provided model data and the given layout
 * shift, so it is is safe to call multiple times with the same input.
 */
export declare function sourcesForLayoutShift(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventLayoutShift): Promise<readonly LayoutShiftSource[]>;
/**
 * Takes a LayoutShift and normalizes its node dimensions based on the device
 * pixel ratio (DPR) of the user's display.
 * This is required because the Layout Instability API is not based on CSS
 * pixels, but physical pixels. Therefore we need to map these to normalized CSS
 * pixels if we can. For example, if the user is on a device with a DPR of 2,
 * the values of the node dimensions reported by the Instability API need to be
 * divided by 2 to be accurate.
 * This function is safe to call multiple times as results are cached based on
 * the provided model data.
 * See https://crbug.com/1300309 for details.
 */
export declare function normalizedImpactedNodesForLayoutShift(modelData: Handlers.Types.TraceParseData, event: Types.TraceEvents.TraceEventLayoutShift): Promise<readonly Types.TraceEvents.TraceImpactedNode[]>;
