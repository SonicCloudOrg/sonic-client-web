import '../../../ui/legacy/legacy.js';
import * as Models from '../models/models.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-create-recording-view': CreateRecordingView;
    }
    interface HTMLElementEventMap {
        recordingstarted: RecordingStartedEvent;
        recordingcancelled: RecordingCancelledEvent;
    }
}
export declare class RecordingStartedEvent extends Event {
    static readonly eventName = "recordingstarted";
    name: string;
    selectorAttribute?: string;
    selectorTypesToRecord: Models.Schema.SelectorType[];
    constructor(name: string, selectorTypesToRecord: Models.Schema.SelectorType[], selectorAttribute?: string);
}
export declare class RecordingCancelledEvent extends Event {
    static readonly eventName = "recordingcancelled";
    constructor();
}
export interface CreateRecordingViewData {
    recorderSettings: Models.RecorderSettings.RecorderSettings;
}
export declare class CreateRecordingView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    connectedCallback(): void;
    set data(data: CreateRecordingViewData);
    startRecording(): void;
}
