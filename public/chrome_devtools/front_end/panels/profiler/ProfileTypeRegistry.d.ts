import { SamplingHeapProfileType } from './HeapProfileView.js';
import { HeapSnapshotProfileType, TrackingHeapSnapshotProfileType } from './HeapSnapshotView.js';
export declare class ProfileTypeRegistry {
    heapSnapshotProfileType: HeapSnapshotProfileType;
    samplingHeapProfileType: SamplingHeapProfileType;
    trackingHeapSnapshotProfileType: TrackingHeapSnapshotProfileType;
    constructor();
}
export declare const instance: ProfileTypeRegistry;
