import type * as Protocol from '../../generated/protocol.js';
import * as TraceEngine from '../../models/trace/trace.js';
import { type TimelineModelFilter } from './TimelineModelFilter.js';
export declare class Node {
    totalTime: number;
    selfTime: number;
    id: string | symbol;
    event: TraceEngine.Types.TraceEvents.TraceEventData | null;
    parent: Node | null;
    groupId: string;
    isGroupNodeInternal: boolean;
    depth: number;
    constructor(id: string | symbol, event: TraceEngine.Types.TraceEvents.TraceEventData | null);
    isGroupNode(): boolean;
    hasChildren(): boolean;
    setHasChildren(_value: boolean): void;
    /**
     * Returns the direct descendants of this node.
     * @returns a map with ordered <nodeId, Node> tuples.
     */
    children(): ChildrenCache;
    searchTree(matchFunction: (arg0: TraceEngine.Types.TraceEvents.TraceEventData) => boolean, results?: Node[]): Node[];
}
export declare class TopDownNode extends Node {
    root: TopDownRootNode | null;
    private hasChildrenInternal;
    childrenInternal: ChildrenCache | null;
    parent: TopDownNode | null;
    constructor(id: string | symbol, event: TraceEngine.Types.TraceEvents.TraceEventData | null, parent: TopDownNode | null);
    hasChildren(): boolean;
    setHasChildren(value: boolean): void;
    children(): ChildrenCache;
    private buildChildren;
    getRoot(): TopDownRootNode | null;
}
export declare class TopDownRootNode extends TopDownNode {
    readonly filter: (e: TraceEngine.Types.TraceEvents.TraceEventData) => boolean;
    readonly events: TraceEngine.Types.TraceEvents.TraceEventData[];
    readonly startTime: TraceEngine.Types.Timing.MilliSeconds;
    readonly endTime: TraceEngine.Types.Timing.MilliSeconds;
    eventGroupIdCallback: ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null | undefined;
    readonly doNotAggregate: boolean | undefined;
    totalTime: number;
    selfTime: number;
    constructor(events: TraceEngine.Types.TraceEvents.TraceEventData[], filters: TimelineModelFilter[], startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds, doNotAggregate?: boolean, eventGroupIdCallback?: ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null);
    children(): ChildrenCache;
    private grouppedTopNodes;
    getEventGroupIdCallback(): ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null | undefined;
}
export declare class BottomUpRootNode extends Node {
    private childrenInternal;
    readonly events: TraceEngine.Types.TraceEvents.TraceEventData[];
    private textFilter;
    readonly filter: (e: TraceEngine.Types.TraceEvents.TraceEventData) => boolean;
    readonly startTime: TraceEngine.Types.Timing.MilliSeconds;
    readonly endTime: TraceEngine.Types.Timing.MilliSeconds;
    private eventGroupIdCallback;
    totalTime: number;
    constructor(events: TraceEngine.Types.TraceEvents.TraceEventData[], textFilter: TimelineModelFilter, filters: TimelineModelFilter[], startTime: TraceEngine.Types.Timing.MilliSeconds, endTime: TraceEngine.Types.Timing.MilliSeconds, eventGroupIdCallback: ((arg0: TraceEngine.Types.TraceEvents.TraceEventData) => string) | null);
    hasChildren(): boolean;
    filterChildren(children: ChildrenCache): ChildrenCache;
    children(): ChildrenCache;
    private ungrouppedTopNodes;
    private grouppedTopNodes;
}
export declare class GroupNode extends Node {
    private readonly childrenInternal;
    isGroupNodeInternal: boolean;
    constructor(id: string, parent: BottomUpRootNode | TopDownRootNode, event: TraceEngine.Types.TraceEvents.TraceEventData);
    addChild(child: BottomUpNode, selfTime: number, totalTime: number): void;
    hasChildren(): boolean;
    children(): ChildrenCache;
}
export declare class BottomUpNode extends Node {
    parent: Node;
    private root;
    depth: number;
    private cachedChildren;
    private hasChildrenInternal;
    constructor(root: BottomUpRootNode, id: string, event: TraceEngine.Types.TraceEvents.TraceEventData, hasChildren: boolean, parent: Node);
    hasChildren(): boolean;
    setHasChildren(value: boolean): void;
    children(): ChildrenCache;
    searchTree(matchFunction: (arg0: TraceEngine.Types.TraceEvents.TraceEventData) => boolean, results?: Node[]): Node[];
}
export declare function eventStackFrame(event: TraceEngine.Types.TraceEvents.TraceEventData): Protocol.Runtime.CallFrame | null;
export declare function generateEventID(event: TraceEngine.Types.TraceEvents.TraceEventData): string;
export type ChildrenCache = Map<string | symbol, Node>;
