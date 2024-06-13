import * as Common from '../../core/common/common.js';
import type * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import * as UI from '../../ui/legacy/legacy.js';
export type ParsedSize = {
    any: 'any';
    formatted: string;
} | {
    width: number;
    height: number;
    formatted: string;
};
declare const AppManifestView_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class AppManifestView extends AppManifestView_base implements SDK.TargetManager.Observer {
    private readonly emptyView;
    private readonly reportView;
    private readonly errorsSection;
    private readonly installabilitySection;
    private readonly identitySection;
    private readonly presentationSection;
    private readonly iconsSection;
    private readonly windowControlsSection;
    private readonly protocolHandlersSection;
    private readonly shortcutSections;
    private readonly screenshotsSections;
    private nameField;
    private shortNameField;
    private descriptionField;
    private readonly startURLField;
    private readonly themeColorSwatch;
    private readonly backgroundColorSwatch;
    private orientationField;
    private displayField;
    private readonly newNoteUrlField;
    private readonly throttler;
    private registeredListeners;
    private target?;
    private resourceTreeModel?;
    private serviceWorkerManager?;
    private overlayModel?;
    private protocolHandlersView;
    constructor(emptyView: UI.EmptyWidget.EmptyWidget, reportView: UI.ReportView.ReportView, throttler: Common.Throttler.Throttler);
    getStaticSections(): UI.ReportView.Section[];
    getManifestElement(): Element;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    private updateManifest;
    private renderManifest;
    getInstallabilityErrorMessages(installabilityErrors: Protocol.Page.InstallabilityError[]): string[];
    private loadImage;
    parseSizes(sizes: string, resourceName: Platform.UIString.LocalizedString, imageUrl: string, imageResourceErrors: Platform.UIString.LocalizedString[]): ParsedSize[];
    checkSizeProblem(size: ParsedSize, type: string | undefined, image: HTMLImageElement, resourceName: Platform.UIString.LocalizedString, imageUrl: string): {
        error?: Platform.UIString.LocalizedString;
        hasSquareSize: boolean;
    };
    private appendImageResourceToSection;
    wasShown(): void;
    private appendWindowControlsToSection;
}
export declare const enum Events {
    ManifestDetected = "ManifestDetected",
    ManifestRendered = "ManifestRendered"
}
export type EventTypes = {
    [Events.ManifestDetected]: boolean;
    [Events.ManifestRendered]: void;
};
export {};
