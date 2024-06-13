// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
import { TimelineJSProfileProcessor } from './TimelineJSProfile.js';
export class Node {
    totalTime;
    selfTime;
    id;
    event;
    parent;
    groupId;
    isGroupNodeInternal;
    depth;
    constructor(id, event) {
        this.totalTime = 0;
        this.selfTime = 0;
        this.id = id;
        this.event = event;
        this.groupId = '';
        this.isGroupNodeInternal = false;
        this.depth = 0;
    }
    isGroupNode() {
        return this.isGroupNodeInternal;
    }
    hasChildren() {
        throw 'Not implemented';
    }
    setHasChildren(_value) {
        throw 'Not implemented';
    }
    /**
     * Returns the direct descendants of this node.
     * @returns a map with ordered <nodeId, Node> tuples.
     */
    children() {
        throw 'Not implemented';
    }
    searchTree(matchFunction, results) {
        results = results || [];
        if (this.event && matchFunction(this.event)) {
            results.push(this);
        }
        for (const child of this.children().values()) {
            child.searchTree(matchFunction, results);
        }
        return results;
    }
}
export class TopDownNode extends Node {
    root;
    hasChildrenInternal;
    childrenInternal;
    parent;
    constructor(id, event, parent) {
        super(id, event);
        this.root = parent && parent.root;
        this.hasChildrenInternal = false;
        this.childrenInternal = null;
        this.parent = parent;
    }
    hasChildren() {
        return this.hasChildrenInternal;
    }
    setHasChildren(value) {
        this.hasChildrenInternal = value;
    }
    children() {
        return this.childrenInternal || this.buildChildren();
    }
    buildChildren() {
        // Tracks the ancestor path of this node, includes the current node.
        const path = [];
        for (let node = this; node.parent && !node.isGroupNode(); node = node.parent) {
            path.push(node);
        }
        path.reverse();
        const children = new Map();
        const self = this;
        const root = this.root;
        if (!root) {
            this.childrenInternal = children;
            return this.childrenInternal;
        }
        const startTime = root.startTime;
        const endTime = root.endTime;
        const instantEventCallback = root.doNotAggregate ? onInstantEvent : undefined;
        const eventIdCallback = root.doNotAggregate ? undefined : generateEventID;
        const eventGroupIdCallback = root.getEventGroupIdCallback();
        let depth = 0;
        // The amount of ancestors found to match this node's ancestors
        // during the event tree walk.
        let matchedDepth = 0;
        let currentDirectChild = null;
        // Walk on the full event tree to find this node's children.
        TraceEngine.Helpers.Trace.forEachEvent(root.events, {
            onStartEvent,
            onEndEvent,
            onInstantEvent: instantEventCallback,
            startTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(startTime),
            endTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(endTime),
            eventFilter: root.filter,
            ignoreAsyncEvents: false,
        });
        function onStartEvent(e) {
            const { startTime: currentStartTime, endTime: currentEndTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            ++depth;
            if (depth > path.length + 2) {
                return;
            }
            if (!matchPath(e)) {
                return;
            }
            const actualEndTime = currentEndTime !== undefined ? Math.min(currentEndTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(startTime, currentStartTime);
            if (duration < 0) {
                console.error('Negative event duration');
            }
            processEvent(e, duration);
        }
        function onInstantEvent(e) {
            ++depth;
            if (matchedDepth === path.length && depth <= path.length + 2) {
                processEvent(e, 0);
            }
            --depth;
        }
        /**
         * Creates a child node.
         */
        function processEvent(e, duration) {
            if (depth === path.length + 2) {
                if (!currentDirectChild) {
                    return;
                }
                currentDirectChild.setHasChildren(true);
                currentDirectChild.selfTime -= duration;
                return;
            }
            let id;
            let groupId = '';
            if (!eventIdCallback) {
                id = Symbol('uniqueId');
            }
            else {
                id = eventIdCallback(e);
                groupId = eventGroupIdCallback ? eventGroupIdCallback(e) : '';
                if (groupId) {
                    id += '/' + groupId;
                }
            }
            let node = children.get(id);
            if (!node) {
                node = new TopDownNode(id, e, self);
                node.groupId = groupId;
                children.set(id, node);
            }
            node.selfTime += duration;
            node.totalTime += duration;
            currentDirectChild = node;
        }
        /**
         * Checks if the path of ancestors of an event matches the path of
         * ancestors of the current node. In other words, checks if an event
         * is a child of this node. As the check is done, the partial result
         * is cached on `matchedDepth`, for future checks.
         */
        function matchPath(e) {
            const { endTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            if (matchedDepth === path.length) {
                return true;
            }
            if (matchedDepth !== depth - 1) {
                return false;
            }
            if (!endTime) {
                return false;
            }
            if (!eventIdCallback) {
                if (e === path[matchedDepth].event) {
                    ++matchedDepth;
                }
                return false;
            }
            let id = eventIdCallback(e);
            const groupId = eventGroupIdCallback ? eventGroupIdCallback(e) : '';
            if (groupId) {
                id += '/' + groupId;
            }
            if (id === path[matchedDepth].id) {
                ++matchedDepth;
            }
            return false;
        }
        function onEndEvent() {
            --depth;
            if (matchedDepth > depth) {
                matchedDepth = depth;
            }
        }
        this.childrenInternal = children;
        return children;
    }
    getRoot() {
        return this.root;
    }
}
export class TopDownRootNode extends TopDownNode {
    filter;
    events;
    startTime;
    endTime;
    eventGroupIdCallback;
    doNotAggregate;
    totalTime;
    selfTime;
    constructor(events, filters, startTime, endTime, doNotAggregate, eventGroupIdCallback) {
        super('', null, null);
        this.root = this;
        this.events = events;
        this.filter = (e) => filters.every(f => f.accept(e));
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventGroupIdCallback = eventGroupIdCallback;
        this.doNotAggregate = doNotAggregate;
        this.totalTime = endTime - startTime;
        this.selfTime = this.totalTime;
    }
    children() {
        return this.childrenInternal || this.grouppedTopNodes();
    }
    grouppedTopNodes() {
        const flatNodes = super.children();
        for (const node of flatNodes.values()) {
            this.selfTime -= node.totalTime;
        }
        if (!this.eventGroupIdCallback) {
            return flatNodes;
        }
        const groupNodes = new Map();
        for (const node of flatNodes.values()) {
            if (!node.event) {
                continue;
            }
            const groupId = this.eventGroupIdCallback(node.event);
            let groupNode = groupNodes.get(groupId);
            if (!groupNode) {
                groupNode = new GroupNode(groupId, this, node.event);
                groupNodes.set(groupId, groupNode);
            }
            groupNode.addChild(node, node.selfTime, node.totalTime);
        }
        this.childrenInternal = groupNodes;
        return groupNodes;
    }
    getEventGroupIdCallback() {
        return this.eventGroupIdCallback;
    }
}
export class BottomUpRootNode extends Node {
    childrenInternal;
    events;
    textFilter;
    filter;
    startTime;
    endTime;
    eventGroupIdCallback;
    totalTime;
    constructor(events, textFilter, filters, startTime, endTime, eventGroupIdCallback) {
        super('', null);
        this.childrenInternal = null;
        this.events = events;
        this.textFilter = textFilter;
        this.filter = (e) => filters.every(f => f.accept(e));
        this.startTime = startTime;
        this.endTime = endTime;
        this.eventGroupIdCallback = eventGroupIdCallback;
        this.totalTime = endTime - startTime;
    }
    hasChildren() {
        return true;
    }
    filterChildren(children) {
        for (const [id, child] of children) {
            // to provide better context to user only filter first (top) level.
            if (child.event && child.depth <= 1 && !this.textFilter.accept(child.event)) {
                children.delete(id);
            }
        }
        return children;
    }
    children() {
        if (!this.childrenInternal) {
            this.childrenInternal = this.filterChildren(this.grouppedTopNodes());
        }
        return this.childrenInternal;
    }
    ungrouppedTopNodes() {
        const root = this;
        const startTime = this.startTime;
        const endTime = this.endTime;
        const nodeById = new Map();
        const selfTimeStack = [endTime - startTime];
        const firstNodeStack = [];
        const totalTimeById = new Map();
        TraceEngine.Helpers.Trace.forEachEvent(this.events, {
            onStartEvent,
            onEndEvent,
            startTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(this.startTime),
            endTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(this.endTime),
            eventFilter: this.filter,
            ignoreAsyncEvents: false,
        });
        function onStartEvent(e) {
            const { startTime: currentStartTime, endTime: currentEndTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            const actualEndTime = currentEndTime !== undefined ? Math.min(currentEndTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(currentStartTime, startTime);
            selfTimeStack[selfTimeStack.length - 1] -= duration;
            selfTimeStack.push(duration);
            const id = generateEventID(e);
            const noNodeOnStack = !totalTimeById.has(id);
            if (noNodeOnStack) {
                totalTimeById.set(id, duration);
            }
            firstNodeStack.push(noNodeOnStack);
        }
        function onEndEvent(event) {
            const id = generateEventID(event);
            let node = nodeById.get(id);
            if (!node) {
                node = new BottomUpNode(root, id, event, false, root);
                nodeById.set(id, node);
            }
            node.selfTime += selfTimeStack.pop() || 0;
            if (firstNodeStack.pop()) {
                node.totalTime += totalTimeById.get(id) || 0;
                totalTimeById.delete(id);
            }
            if (firstNodeStack.length) {
                node.setHasChildren(true);
            }
        }
        this.selfTime = selfTimeStack.pop() || 0;
        for (const pair of nodeById) {
            if (pair[1].selfTime <= 0) {
                nodeById.delete(pair[0]);
            }
        }
        return nodeById;
    }
    grouppedTopNodes() {
        const flatNodes = this.ungrouppedTopNodes();
        if (!this.eventGroupIdCallback) {
            return flatNodes;
        }
        const groupNodes = new Map();
        for (const node of flatNodes.values()) {
            if (!node.event) {
                continue;
            }
            const groupId = this.eventGroupIdCallback(node.event);
            let groupNode = groupNodes.get(groupId);
            if (!groupNode) {
                groupNode = new GroupNode(groupId, this, node.event);
                groupNodes.set(groupId, groupNode);
            }
            groupNode.addChild(node, node.selfTime, node.selfTime);
        }
        return groupNodes;
    }
}
export class GroupNode extends Node {
    childrenInternal;
    isGroupNodeInternal;
    constructor(id, parent, event) {
        super(id, event);
        this.childrenInternal = new Map();
        this.parent = parent;
        this.isGroupNodeInternal = true;
    }
    addChild(child, selfTime, totalTime) {
        this.childrenInternal.set(child.id, child);
        this.selfTime += selfTime;
        this.totalTime += totalTime;
        child.parent = this;
    }
    hasChildren() {
        return true;
    }
    children() {
        return this.childrenInternal;
    }
}
export class BottomUpNode extends Node {
    parent;
    root;
    depth;
    cachedChildren;
    hasChildrenInternal;
    constructor(root, id, event, hasChildren, parent) {
        super(id, event);
        this.parent = parent;
        this.root = root;
        this.depth = (parent.depth || 0) + 1;
        this.cachedChildren = null;
        this.hasChildrenInternal = hasChildren;
    }
    hasChildren() {
        return this.hasChildrenInternal;
    }
    setHasChildren(value) {
        this.hasChildrenInternal = value;
    }
    children() {
        if (this.cachedChildren) {
            return this.cachedChildren;
        }
        const selfTimeStack = [0];
        const eventIdStack = [];
        const eventStack = [];
        const nodeById = new Map();
        const startTime = this.root.startTime;
        const endTime = this.root.endTime;
        let lastTimeMarker = startTime;
        const self = this;
        TraceEngine.Helpers.Trace.forEachEvent(this.root.events, {
            onStartEvent,
            onEndEvent,
            startTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(startTime),
            endTime: TraceEngine.Helpers.Timing.millisecondsToMicroseconds(endTime),
            eventFilter: this.root.filter,
            ignoreAsyncEvents: false,
        });
        function onStartEvent(e) {
            const { startTime: currentStartTime, endTime: currentEndTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            const actualEndTime = currentEndTime !== undefined ? Math.min(currentEndTime, endTime) : endTime;
            const duration = actualEndTime - Math.max(currentStartTime, startTime);
            if (duration < 0) {
                console.assert(false, 'Negative duration of an event');
            }
            selfTimeStack[selfTimeStack.length - 1] -= duration;
            selfTimeStack.push(duration);
            const id = generateEventID(e);
            eventIdStack.push(id);
            eventStack.push(e);
        }
        function onEndEvent(e) {
            const { startTime: currentStartTime, endTime: currentEndTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            const selfTime = selfTimeStack.pop();
            const id = eventIdStack.pop();
            eventStack.pop();
            let node;
            for (node = self; node.depth > 1; node = node.parent) {
                if (node.id !== eventIdStack[eventIdStack.length + 1 - node.depth]) {
                    return;
                }
            }
            if (node.id !== id || eventIdStack.length < self.depth) {
                return;
            }
            const childId = eventIdStack[eventIdStack.length - self.depth];
            node = nodeById.get(childId);
            if (!node) {
                const event = eventStack[eventStack.length - self.depth];
                const hasChildren = eventStack.length > self.depth;
                node = new BottomUpNode(self.root, childId, event, hasChildren, self);
                nodeById.set(childId, node);
            }
            const actualEndTime = currentEndTime !== undefined ? Math.min(currentEndTime, endTime) : endTime;
            const totalTime = actualEndTime - Math.max(currentStartTime, lastTimeMarker);
            node.selfTime += selfTime || 0;
            node.totalTime += totalTime;
            lastTimeMarker = actualEndTime;
        }
        this.cachedChildren = this.root.filterChildren(nodeById);
        return this.cachedChildren;
    }
    searchTree(matchFunction, results) {
        results = results || [];
        if (this.event && matchFunction(this.event)) {
            results.push(this);
        }
        return results;
    }
}
export function eventStackFrame(event) {
    if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
        return event.callFrame;
    }
    const topFrame = event.args?.data?.stackTrace?.[0];
    if (!topFrame) {
        return null;
    }
    return { ...topFrame, scriptId: String(topFrame.scriptId) };
}
export function generateEventID(event) {
    if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
        const name = TimelineJSProfileProcessor.isNativeRuntimeFrame(event.callFrame) ?
            TimelineJSProfileProcessor.nativeGroup(event.callFrame.functionName) :
            event.callFrame.functionName;
        const location = event.callFrame.scriptId || event.callFrame.url || '';
        return `f:${name}@${location}`;
    }
    if (TraceEngine.Types.TraceEvents.isTraceEventTimeStamp(event)) {
        return `${event.name}:${event.args.data.message}`;
    }
    return event.name;
}
//# sourceMappingURL=TimelineProfileTree.js.map