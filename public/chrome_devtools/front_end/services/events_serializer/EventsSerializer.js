// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import * as TraceEngine from '../../models/trace/trace.js';
export class EventsSerializer {
    #modifiedProfileCallByKey = new Map();
    keyForEvent(event) {
        if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
            return `${"p" /* TraceEngine.Types.File.EventKeyType.ProfileCall */}-${event.pid}-${event.tid}-${TraceEngine.Types.TraceEvents.SampleIndex(event.sampleIndex)}-${event.nodeId}`;
        }
        const rawEvents = TraceEngine.Helpers.SyntheticEvents.SyntheticEventsManager.getActiveManager().getRawTraceEvents();
        const key = TraceEngine.Types.TraceEvents.isSyntheticBasedEvent(event) ?
            `${"s" /* TraceEngine.Types.File.EventKeyType.SyntheticEvent */}-${rawEvents.indexOf(event.rawSourceEvent)}` :
            `${"r" /* TraceEngine.Types.File.EventKeyType.RawEvent */}-${rawEvents.indexOf(event)}`;
        if (key.length < 3) {
            return null;
        }
        return key;
    }
    eventForKey(key, traceParsedData) {
        const eventValues = TraceEngine.Types.File.traceEventKeyToValues(key);
        if (EventsSerializer.isProfileCallKey(eventValues)) {
            return this.#getModifiedProfileCallByKeyValues(eventValues, traceParsedData);
        }
        if (EventsSerializer.isSyntheticEventKey(eventValues)) {
            const syntheticEvents = TraceEngine.Helpers.SyntheticEvents.SyntheticEventsManager.getActiveManager().getSyntheticTraceEvents();
            const syntheticEvent = syntheticEvents.at(eventValues.rawIndex);
            if (!syntheticEvent) {
                throw new Error(`Attempted to get a synthetic event from an unknown raw event index: ${eventValues.rawIndex}`);
            }
            return syntheticEvent;
        }
        if (EventsSerializer.isRawEventKey(eventValues)) {
            const rawEvents = TraceEngine.Helpers.SyntheticEvents.SyntheticEventsManager.getActiveManager().getRawTraceEvents();
            return rawEvents[eventValues.rawIndex];
        }
        throw new Error(`Unknown trace event serializable key values: ${eventValues.join('-')}`);
    }
    static isProfileCallKey(key) {
        return key.type === "p" /* TraceEngine.Types.File.EventKeyType.ProfileCall */;
    }
    static isRawEventKey(key) {
        return key.type === "r" /* TraceEngine.Types.File.EventKeyType.RawEvent */;
    }
    static isSyntheticEventKey(key) {
        return key.type === "s" /* TraceEngine.Types.File.EventKeyType.SyntheticEvent */;
    }
    #getModifiedProfileCallByKeyValues(key, traceParsedData) {
        const cacheResult = this.#modifiedProfileCallByKey.get(key);
        if (cacheResult) {
            return cacheResult;
        }
        const profileCallsInThread = traceParsedData.Renderer.processes.get(key.processID)?.threads.get(key.threadID)?.profileCalls;
        if (!profileCallsInThread) {
            throw new Error(`Unknown profile call serializable key: ${(key)}`);
        }
        // Do a binary search on the complete profile call list to efficiently lookup for a
        // match based on sample index and node id. We need both because multiple calls can share
        // the same sample index, in which case we need to break the tie with the node id (by which
        // calls in a sample stack are ordered, allowing us to do a single search).
        const matchRangeStartIndex = Platform.ArrayUtilities.nearestIndexFromBeginning(profileCallsInThread, e => e.sampleIndex >= key.sampleIndex && e.nodeId >= key.protocol);
        const match = matchRangeStartIndex !== null && profileCallsInThread.at(matchRangeStartIndex);
        if (!match) {
            throw new Error(`Unknown profile call serializable key: ${(key)}`);
        }
        // Cache to avoid looking up in subsequent calls.
        this.#modifiedProfileCallByKey.set(key, match);
        return match;
    }
}
//# sourceMappingURL=EventsSerializer.js.map