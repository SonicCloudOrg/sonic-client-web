declare global {
    interface HTMLElementTagNameMap {
        'devtools-recording-list-view': RecordingListView;
    }
    interface HTMLElementEventMap {
        openrecording: OpenRecordingEvent;
        deleterecording: DeleteRecordingEvent;
    }
}
export declare class CreateRecordingEvent extends Event {
    static readonly eventName = "createrecording";
    constructor();
}
export declare class DeleteRecordingEvent extends Event {
    storageName: string;
    static readonly eventName = "deleterecording";
    constructor(storageName: string);
}
export declare class OpenRecordingEvent extends Event {
    storageName: string;
    static readonly eventName = "openrecording";
    constructor(storageName: string);
}
export declare class PlayRecordingEvent extends Event {
    storageName: string;
    static readonly eventName = "playrecording";
    constructor(storageName: string);
}
interface Recording {
    storageName: string;
    name: string;
}
export declare class RecordingListView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    connectedCallback(): void;
    set recordings(recordings: Recording[]);
    set replayAllowed(value: boolean);
}
export {};
