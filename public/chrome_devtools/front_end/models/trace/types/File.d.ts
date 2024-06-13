import type * as Protocol from '../../../generated/protocol.js';
import { type TraceWindowMicroSeconds } from './Timing.js';
import { type ProcessID, type SampleIndex, type ThreadID, type TraceEventData } from './TraceEvents.js';
export type TraceFile = {
    traceEvents: readonly TraceEventData[];
    metadata: MetaData;
};
export interface Breadcrumb {
    window: TraceWindowMicroSeconds;
    child: Breadcrumb | null;
}
export declare const enum DataOrigin {
    CPUProfile = "CPUProfile",
    TraceEvents = "TraceEvents"
}
export declare const enum EventKeyType {
    RawEvent = "r",
    SyntheticEvent = "s",
    ProfileCall = "p"
}
export type RawEventKey = `${EventKeyType.RawEvent}-${number}`;
export type SyntheticEventKey = `${EventKeyType.SyntheticEvent}-${number}`;
export type ProfileCallKey = `${EventKeyType.ProfileCall}-${ProcessID}-${ThreadID}-${SampleIndex}-${Protocol.integer}`;
export type TraceEventSerializableKey = RawEventKey | ProfileCallKey | SyntheticEventKey;
export type RawEventKeyValues = {
    type: EventKeyType.RawEvent;
    rawIndex: number;
};
export type SyntheticEventKeyValues = {
    type: EventKeyType.SyntheticEvent;
    rawIndex: number;
};
export type ProfileCallKeyValues = {
    type: EventKeyType.ProfileCall;
    processID: ProcessID;
    threadID: ThreadID;
    sampleIndex: SampleIndex;
    protocol: Protocol.integer;
};
export type TraceEventSerializableKeyValues = RawEventKeyValues | ProfileCallKeyValues | SyntheticEventKeyValues;
export interface Modifications {
    entriesModifications: {
        hiddenEntries: TraceEventSerializableKey[];
        expandableEntries: TraceEventSerializableKey[];
    };
    initialBreadcrumb: Breadcrumb;
}
/**
 * Trace metadata that we persist to the file. This will allow us to
 * store specifics for the trace, e.g., which tracks should be visible
 * on load.
 */
export interface MetaData {
    source?: 'DevTools';
    startTime?: string;
    networkThrottling?: string;
    cpuThrottling?: number;
    hardwareConcurrency?: number;
    dataOrigin?: DataOrigin;
    modifications?: Modifications;
}
export type Contents = TraceFile | TraceEventData[];
export declare function traceEventKeyToValues(key: TraceEventSerializableKey): TraceEventSerializableKeyValues;
