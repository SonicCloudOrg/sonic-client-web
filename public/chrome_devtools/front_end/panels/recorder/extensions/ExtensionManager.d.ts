import * as Common from '../../../core/common/common.js';
import * as Extensions from '../../../models/extensions/extensions.js';
export interface Extension {
    getName(): string;
    getMediaType(): string | undefined;
    stringify(recording: Object): Promise<string>;
    stringifyStep(step: Object): Promise<string>;
    getCapabilities(): Array<'replay' | 'export'>;
    replay(recording: Object): void;
}
export declare class ExtensionManager extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    static instance(): ExtensionManager;
    constructor();
    attach(): void;
    detach(): void;
    extensions(): Extension[];
    getView(descriptorId: string): ExtensionIframe;
}
declare class ExtensionIframe {
    #private;
    constructor(descriptor: Extensions.RecorderPluginManager.ViewDescriptor);
    show(): void;
    hide(): void;
    frame(): HTMLIFrameElement;
}
export declare const enum Events {
    ExtensionsUpdated = "extensionsUpdated"
}
export type EventTypes = {
    [Events.ExtensionsUpdated]: Extension[];
};
export {};
