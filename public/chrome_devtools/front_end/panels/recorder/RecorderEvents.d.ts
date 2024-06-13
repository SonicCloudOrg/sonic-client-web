import type * as Models from './models/models.js';
export declare class ReplayFinishedEvent extends Event {
    static readonly eventName = "replayfinished";
    constructor();
}
export declare class RecordingStateChangedEvent extends Event {
    recording: Models.Schema.UserFlow;
    static readonly eventName = "recordingstatechanged";
    constructor(recording: Models.Schema.UserFlow);
}
