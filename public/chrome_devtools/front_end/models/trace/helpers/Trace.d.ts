import type * as CPUProfile from '../../cpu_profile/cpu_profile.js';
import * as Types from '../types/types.js';
type MatchedPairType<T extends Types.TraceEvents.TraceEventPairableAsync> = Types.TraceEvents.SyntheticEventPair<T>;
type MatchingPairableAsyncEvents = {
    begin: Types.TraceEvents.TraceEventPairableAsyncBegin | null;
    end: Types.TraceEvents.TraceEventPairableAsyncEnd | null;
    instant?: Types.TraceEvents.TraceEventPairableAsyncInstant[];
};
export declare function extractOriginFromTrace(firstNavigationURL: string): string | null;
export type EventsInThread<T extends Types.TraceEvents.TraceEventData> = Map<Types.TraceEvents.ThreadID, T[]>;
export declare function addEventToProcessThread<T extends Types.TraceEvents.TraceEventData>(event: T, eventsInProcessThread: Map<Types.TraceEvents.ProcessID, EventsInThread<T>>): void;
type TimeSpan = {
    ts: Types.Timing.MicroSeconds;
    dur?: Types.Timing.MicroSeconds;
};
export declare function eventTimeComparator(a: TimeSpan, b: TimeSpan): -1 | 0 | 1;
/**
 * Sorts all the events in place, in order, by their start time. If they have
 * the same start time, orders them by longest first.
 */
export declare function sortTraceEventsInPlace(events: {
    ts: Types.Timing.MicroSeconds;
    dur?: Types.Timing.MicroSeconds;
}[]): void;
/**
 * Returns an array of ordered events that results after merging the two
 * ordered input arrays.
 */
export declare function mergeEventsInOrder<T1 extends Types.TraceEvents.TraceEventData, T2 extends Types.TraceEvents.TraceEventData>(eventsArray1: readonly T1[], eventsArray2: readonly T2[]): (T1 | T2)[];
export declare function getNavigationForTraceEvent(event: Types.TraceEvents.TraceEventData, eventFrameId: string, navigationsByFrameId: Map<string, Types.TraceEvents.TraceEventNavigationStart[]>): Types.TraceEvents.TraceEventNavigationStart | null;
export declare function extractId(event: Types.TraceEvents.TraceEventPairableAsync | MatchedPairType<Types.TraceEvents.TraceEventPairableAsync>): string | undefined;
export declare function activeURLForFrameAtTime(frameId: string, time: Types.Timing.MicroSeconds, rendererProcessesByFrame: Map<string, Map<Types.TraceEvents.ProcessID, {
    frame: Types.TraceEvents.TraceFrame;
    window: Types.Timing.TraceWindowMicroSeconds;
}[]>>): string | null;
/**
 * @param node the node attached to the profile call. Here a node represents a function in the call tree.
 * @param profileId the profile ID that the sample came from that backs this call.
 * @param sampleIndex the index of the sample in the given profile that this call was created from
 * @param ts the timestamp of the profile call
 * @param pid the process ID of the profile call
 * @param tid the thread ID of the profile call
 *
 * See `panels/timeline/docs/profile_calls.md` for more context on how these events are created.
 */
export declare function makeProfileCall(node: CPUProfile.ProfileTreeModel.ProfileNode, profileId: Types.TraceEvents.ProfileID, sampleIndex: number, ts: Types.Timing.MicroSeconds, pid: Types.TraceEvents.ProcessID, tid: Types.TraceEvents.ThreadID): Types.TraceEvents.SyntheticProfileCall;
export declare function makeSyntheticTraceEntry(name: string, ts: Types.Timing.MicroSeconds, pid: Types.TraceEvents.ProcessID, tid: Types.TraceEvents.ThreadID): Types.TraceEvents.SyntheticTraceEntry;
/**
 * Matches beginning events with TraceEventPairableAsyncEnd and TraceEventPairableAsyncInstant (ASYNC_NESTABLE_INSTANT)
 * if provided, though currently only coming from Animations. Traces may contain multiple instant events so we need to
 * account for that.
 *
 * @returns {Map<string, MatchingPairableAsyncEvents>} Map of the animation's ID to it's matching events.
 */
export declare function matchEvents(unpairedEvents: Types.TraceEvents.TraceEventPairableAsync[]): Map<string, MatchingPairableAsyncEvents>;
export declare function createSortedSyntheticEvents<T extends Types.TraceEvents.TraceEventPairableAsync>(matchedPairs: Map<string, {
    begin: Types.TraceEvents.TraceEventPairableAsyncBegin | null;
    end: Types.TraceEvents.TraceEventPairableAsyncEnd | null;
    instant?: Types.TraceEvents.TraceEventPairableAsyncInstant[];
}>, syntheticEventCallback?: (syntheticEvent: MatchedPairType<T>) => void): MatchedPairType<T>[];
export declare function createMatchedSortedSyntheticEvents<T extends Types.TraceEvents.TraceEventPairableAsync>(unpairedAsyncEvents: T[], syntheticEventCallback?: (syntheticEvent: MatchedPairType<T>) => void): MatchedPairType<T>[];
/**
 * Different trace events return line/column numbers that are 1 or 0 indexed.
 * This function knows which events return 1 indexed numbers and normalizes
 * them. The UI expects 0 indexed line numbers, so that is what we return.
 */
export declare function getZeroIndexedLineAndColumnForEvent(event: Types.TraceEvents.TraceEventData): {
    lineNumber?: number;
    columnNumber?: number;
};
/**
 * Different trace events contain stack traces with line/column numbers
 * that are 1 or 0 indexed.
 * This function knows which events return 1 indexed numbers and normalizes
 * them. The UI expects 0 indexed line numbers, so that is what we return.
 */
export declare function getZeroIndexedStackTraceForEvent(event: Types.TraceEvents.TraceEventData): Types.TraceEvents.TraceEventCallFrame[] | null;
export declare function frameIDForEvent(event: Types.TraceEvents.TraceEventData): string | null;
export declare function isTopLevelEvent(event: Types.TraceEvents.TraceEventData): boolean;
export declare function findUpdateLayoutTreeEvents(events: Types.TraceEvents.TraceEventData[], startTime: Types.Timing.MicroSeconds, endTime?: Types.Timing.MicroSeconds): Types.TraceEvents.TraceEventUpdateLayoutTree[];
export interface ForEachEventConfig {
    onStartEvent: (event: Types.TraceEvents.TraceEventData) => void;
    onEndEvent: (event: Types.TraceEvents.TraceEventData) => void;
    onInstantEvent?: (event: Types.TraceEvents.TraceEventData) => void;
    eventFilter?: (event: Types.TraceEvents.TraceEventData) => boolean;
    startTime?: Types.Timing.MicroSeconds;
    endTime?: Types.Timing.MicroSeconds;
    ignoreAsyncEvents?: boolean;
}
/**
 * Iterates events in a tree hierarchically, from top to bottom,
 * calling back on every event's start and end in the order
 * dictated by the corresponding timestamp.
 *
 * Events are assumed to be in ascendent order by timestamp.
 *
 * Events with 0 duration are treated as instant events. These do not have a
 * begin and end, but will be passed to the config.onInstantEvent callback as
 * they are discovered. Do not provide this callback if you are not interested
 * in them.
 *
 * For example, given this tree, the following callbacks
 * are expected to be made in the following order
 * |---------------A---------------|
 *  |------B------||-------D------|
 *    |---C---|
 *
 * 1. Start A
 * 3. Start B
 * 4. Start C
 * 5. End C
 * 6. End B
 * 7. Start D
 * 8. End D
 * 9. End A
 *
 * By default, async events are skipped. This behaviour can be
 * overriden making use of the config.ignoreAsyncEvents parameter.
 */
export declare function forEachEvent(events: Types.TraceEvents.TraceEventData[], config: ForEachEventConfig): void;
export declare function eventHasCategory(event: Types.TraceEvents.TraceEventData, category: string): boolean;
export {};
