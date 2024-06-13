import type * as Protocol from '../../generated/protocol.js';
import type * as Platform from '../../core/platform/platform.js';
export declare class ProfileNode {
    callFrame: Protocol.Runtime.CallFrame;
    callUID: string;
    self: number;
    total: number;
    id: number;
    parent: ProfileNode | null;
    children: ProfileNode[];
    functionName: string;
    depth: number;
    deoptReason: string | null;
    constructor(callFrame: Protocol.Runtime.CallFrame);
    get scriptId(): Protocol.Runtime.ScriptId;
    get url(): Platform.DevToolsPath.UrlString;
    get lineNumber(): number;
    get columnNumber(): number;
    setFunctionName(name: string | null): void;
}
export declare class ProfileTreeModel {
    root: ProfileNode;
    total: number;
    maxDepth: number;
    constructor();
    initialize(root: ProfileNode): void;
    private assignDepthsAndParents;
    private calculateTotals;
}
