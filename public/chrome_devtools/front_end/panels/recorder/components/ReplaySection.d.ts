import type * as Extensions from '../extensions/extensions.js';
import type * as Models from '../models/models.js';
import { PlayRecordingSpeed } from '../models/RecordingPlayer.js';
export declare class StartReplayEvent extends Event {
    speed: PlayRecordingSpeed;
    extension?: Extensions.ExtensionManager.Extension | undefined;
    static readonly eventName = "startreplay";
    constructor(speed: PlayRecordingSpeed, extension?: Extensions.ExtensionManager.Extension | undefined);
}
export interface ReplaySectionProps {
    disabled: boolean;
}
export interface ReplaySectionData {
    settings: Models.RecorderSettings.RecorderSettings;
    replayExtensions: Extensions.ExtensionManager.Extension[];
}
export declare class ReplaySection extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    set data(data: ReplaySectionData);
    get disabled(): boolean;
    set disabled(disabled: boolean);
    connectedCallback(): void;
}
declare global {
    interface HTMLElementEventMap {
        startreplay: StartReplayEvent;
    }
    interface HTMLElementTagNameMap {
        'devtools-replay-section': ReplaySection;
    }
}
