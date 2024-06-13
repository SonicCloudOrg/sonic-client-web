import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as Bindings from '../../models/bindings/bindings.js';
import type * as BreakpointManager from '../../models/breakpoints/breakpoints.js';
export declare class DebuggerPausedMessage {
    #private;
    private readonly elementInternal;
    private contentElement;
    constructor();
    element(): Element;
    private static descriptionWithoutStack;
    private static createDOMBreakpointHitMessage;
    render(details: SDK.DebuggerModel.DebuggerPausedDetails | null, debuggerWorkspaceBinding: Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding, breakpointManager: BreakpointManager.BreakpointManager.BreakpointManager): Promise<void>;
}
export declare const BreakpointTypeNouns: Map<Protocol.DOMDebugger.DOMBreakpointType, () => Common.UIString.LocalizedString>;
