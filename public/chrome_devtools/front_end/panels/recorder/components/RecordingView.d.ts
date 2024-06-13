import * as SDK from '../../../core/sdk/sdk.js';
import type * as PublicExtensions from '../../../models/extensions/extensions.js';
import type * as Converters from '../converters/converters.js';
import type * as Extensions from '../extensions/extensions.js';
import * as Models from '../models/models.js';
import { PlayRecordingSpeed } from '../models/RecordingPlayer.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-recording-view': RecordingView;
    }
}
export interface ReplayState {
    isPlaying: boolean;
    isPausedOnBreakpoint: boolean;
}
export interface RecordingViewData {
    replayState: ReplayState;
    isRecording: boolean;
    recordingTogglingInProgress: boolean;
    recording: Models.Schema.UserFlow;
    currentStep?: Models.Schema.Step;
    currentError?: Error;
    sections: Models.Section.Section[];
    settings?: Models.RecordingSettings.RecordingSettings;
    recorderSettings?: Models.RecorderSettings.RecorderSettings;
    lastReplayResult?: Models.RecordingPlayer.ReplayResult;
    replayAllowed: boolean;
    breakpointIndexes: Set<number>;
    builtInConverters: Converters.Converter.Converter[];
    extensionConverters: Converters.Converter.Converter[];
    replayExtensions: Extensions.ExtensionManager.Extension[];
    extensionDescriptor?: PublicExtensions.RecorderPluginManager.ViewDescriptor;
}
export declare class RecordingFinishedEvent extends Event {
    static readonly eventName = "recordingfinished";
    constructor();
}
export declare const enum TargetPanel {
    PerformancePanel = "timeline",
    Default = "chrome-recorder"
}
interface PlayRecordingEventData {
    targetPanel: TargetPanel;
    speed: PlayRecordingSpeed;
    extension?: Extensions.ExtensionManager.Extension;
}
export declare class PlayRecordingEvent extends Event {
    static readonly eventName = "playrecording";
    readonly data: PlayRecordingEventData;
    constructor(data?: PlayRecordingEventData);
}
export declare class AbortReplayEvent extends Event {
    static readonly eventName = "abortreplay";
    constructor();
}
export declare class RecordingChangedEvent extends Event {
    static readonly eventName = "recordingchanged";
    data: {
        currentStep: Models.Schema.Step;
        newStep: Models.Schema.Step;
    };
    constructor(currentStep: Models.Schema.Step, newStep: Models.Schema.Step);
}
export declare class AddAssertionEvent extends Event {
    static readonly eventName = "addassertion";
    constructor();
}
export declare class RecordingTitleChangedEvent extends Event {
    static readonly eventName = "recordingtitlechanged";
    title: string;
    constructor(title: string);
}
export declare class NetworkConditionsChanged extends Event {
    static readonly eventName = "networkconditionschanged";
    data?: SDK.NetworkManager.Conditions;
    constructor(data?: SDK.NetworkManager.Conditions);
}
export declare class TimeoutChanged extends Event {
    static readonly eventName = "timeoutchanged";
    data?: number;
    constructor(data?: number);
}
export declare class RecordingView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    set data(data: RecordingViewData);
    connectedCallback(): void;
    disconnectedCallback(): void;
    scrollToBottom(): void;
    showCodeToggle: () => void;
}
export {};
