import '../../../ui/legacy/legacy.js';
import type * as Platform from '../../../core/platform/platform.js';
export declare const FEEDBACK_URL: Platform.DevToolsPath.UrlString;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-start-view': StartView;
    }
}
export declare class CreateRecordingEvent extends Event {
    static readonly eventName = "createrecording";
    constructor();
}
export declare class StartView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    connectedCallback(): void;
}
