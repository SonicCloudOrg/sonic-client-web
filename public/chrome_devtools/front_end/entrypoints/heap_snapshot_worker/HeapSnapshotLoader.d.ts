import type * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
import { JSHeapSnapshot } from './HeapSnapshot.js';
import { type HeapSnapshotWorkerDispatcher } from './HeapSnapshotWorkerDispatcher.js';
export declare class HeapSnapshotLoader {
    #private;
    constructor(dispatcher: HeapSnapshotWorkerDispatcher);
    dispose(): void;
    close(): void;
    buildSnapshot(options: HeapSnapshotModel.HeapSnapshotModel.HeapSnapshotOptions): JSHeapSnapshot;
    write(chunk: string): void;
}
