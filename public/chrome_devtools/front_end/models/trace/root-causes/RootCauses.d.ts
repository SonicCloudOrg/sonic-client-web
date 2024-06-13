import type * as Protocol from '../../../generated/protocol.js';
import { LayoutShiftRootCauses } from './LayoutShift.js';
export type RootCauseProtocolInterface = {
    getInitiatorForRequest(url: string): Protocol.Network.Initiator | null;
    pushNodesByBackendIdsToFrontend(backendNodeIds: Protocol.DOM.BackendNodeId[]): Promise<Protocol.DOM.NodeId[]>;
    getNode(nodeId: Protocol.DOM.NodeId): Promise<Protocol.DOM.Node | null>;
    getComputedStyleForNode(nodeId: Protocol.DOM.NodeId): Promise<Protocol.CSS.CSSComputedStyleProperty[]>;
    getMatchedStylesForNode(nodeId: Protocol.DOM.NodeId): Promise<Protocol.CSS.GetMatchedStylesForNodeResponse>;
    fontFaceForSource(url: string): Protocol.CSS.FontFace | undefined;
};
export declare class RootCauses {
    readonly layoutShifts: LayoutShiftRootCauses;
    constructor(protocolInterface: RootCauseProtocolInterface);
}
export { LayoutShiftRootCauses } from './LayoutShift.js';
