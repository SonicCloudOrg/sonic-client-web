import * as HeapSnapshotModel from '../../models/heap_snapshot_model/heap_snapshot_model.js';
export declare class HeapSnapshotWorkerDispatcher {
    #private;
    constructor(postMessage: typeof Window.prototype.postMessage);
    sendEvent(name: string, data: unknown): void;
    dispatchMessage({ data }: {
        data: HeapSnapshotModel.HeapSnapshotModel.WorkerCommand;
    }): void;
}
