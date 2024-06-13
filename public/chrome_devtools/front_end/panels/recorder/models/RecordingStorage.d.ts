import { type UserFlow } from './Schema.js';
interface IdGenerator {
    next(): string;
}
export declare class RecordingStorage {
    #private;
    constructor();
    clearForTest(): void;
    setIdGeneratorForTest(idGenerator: IdGenerator): void;
    saveRecording(flow: UserFlow): Promise<StoredRecording>;
    updateRecording(storageName: string, flow: UserFlow): Promise<StoredRecording>;
    deleteRecording(storageName: string): Promise<void>;
    getRecording(storageName: string): StoredRecording | undefined;
    getRecordings(): StoredRecording[];
    static instance(): RecordingStorage;
}
export interface StoredRecording {
    storageName: string;
    flow: UserFlow;
}
export {};
