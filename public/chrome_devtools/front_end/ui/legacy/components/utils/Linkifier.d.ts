import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import type * as Protocol from '../../../../generated/protocol.js';
import * as Bindings from '../../../../models/bindings/bindings.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import type * as TraceEngine from '../../../../models/trace/trace.js';
import * as Workspace from '../../../../models/workspace/workspace.js';
import type * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
export declare class Linkifier extends Common.ObjectWrapper.ObjectWrapper<EventTypes> implements SDK.TargetManager.Observer {
    private readonly maxLength;
    private readonly anchorsByTarget;
    private readonly locationPoolByTarget;
    private useLinkDecorator;
    constructor(maxLengthForDisplayedURLs?: number, useLinkDecorator?: boolean);
    static setLinkDecorator(linkDecorator: LinkDecorator): void;
    private updateAllAnchorDecorations;
    private static bindUILocation;
    private static unbindUILocation;
    /**
     * When we link to a breakpoint condition, we need to stash the BreakpointLocation as the revealable
     * in the LinkInfo.
     */
    private static bindBreakpoint;
    /**
     * When we link to a breakpoint condition, we store the BreakpointLocation in the revealable.
     * Clear it when the LiveLocation updates.
     */
    private static unbindBreakpoint;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    maybeLinkifyScriptLocation(target: SDK.Target.Target | null, scriptId: Protocol.Runtime.ScriptId | null, sourceURL: Platform.DevToolsPath.UrlString, lineNumber: number | undefined, options?: LinkifyOptions): HTMLElement | null;
    linkifyScriptLocation(target: SDK.Target.Target | null, scriptId: Protocol.Runtime.ScriptId | null, sourceURL: Platform.DevToolsPath.UrlString, lineNumber: number | undefined, options?: LinkifyOptions): HTMLElement;
    linkifyRawLocation(rawLocation: SDK.DebuggerModel.Location, fallbackUrl: Platform.DevToolsPath.UrlString, className?: string): Element;
    maybeLinkifyConsoleCallFrame(target: SDK.Target.Target | null, callFrame: Protocol.Runtime.CallFrame | TraceEngine.Types.TraceEvents.TraceEventCallFrame, options?: LinkifyOptions): HTMLElement | null;
    linkifyStackTraceTopFrame(target: SDK.Target.Target | null, stackTrace: Protocol.Runtime.StackTrace): HTMLElement;
    linkifyCSSLocation(rawLocation: SDK.CSSModel.CSSLocation, classes?: string): Element;
    reset(): void;
    dispose(): void;
    private updateAnchor;
    private static updateLinkDecorations;
    static linkifyURL(url: Platform.DevToolsPath.UrlString, options?: LinkifyURLOptions): HTMLElement;
    static linkifyRevealable(revealable: Object, text: string | HTMLElement, fallbackHref?: Platform.DevToolsPath.UrlString, title?: string, className?: string, jslogContext?: string): HTMLElement;
    private static createLink;
    private static setTrimmedText;
    private static appendTextWithoutHashes;
    private static appendHiddenText;
    static untruncatedNodeText(node: Node): string;
    static linkInfo(link: Element | null): LinkInfo | null;
    private static handleClick;
    static handleClickFromNewComponentLand(linkInfo: LinkInfo): void;
    static invokeFirstAction(linkInfo: LinkInfo): boolean;
    static linkHandlerSetting(): Common.Settings.Setting<string>;
    static registerLinkHandler(title: string, handler: LinkHandler): void;
    static unregisterLinkHandler(title: string): void;
    static uiLocation(link: Element): Workspace.UISourceCode.UILocation | null;
    static linkActions(info: LinkInfo): {
        section: string;
        title: string;
        jslogContext: string;
        handler: () => Promise<void> | void;
    }[];
}
export interface LinkDecorator extends Common.EventTarget.EventTarget<LinkDecorator.EventTypes> {
    linkIcon(uiSourceCode: Workspace.UISourceCode.UISourceCode): IconButton.Icon.Icon | null;
}
export declare namespace LinkDecorator {
    const enum Events {
        LinkIconChanged = "LinkIconChanged"
    }
    type EventTypes = {
        [Events.LinkIconChanged]: Workspace.UISourceCode.UISourceCode;
    };
}
export declare class LinkContextMenuProvider implements UI.ContextMenu.Provider<Node> {
    appendApplicableItems(_event: Event, contextMenu: UI.ContextMenu.ContextMenu, target: Node): void;
}
export declare class LinkHandlerSettingUI implements UI.SettingsUI.SettingUI {
    private element;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): LinkHandlerSettingUI;
    update(): void;
    private onChange;
    settingElement(): Element | null;
}
export declare class ContentProviderContextMenuProvider implements UI.ContextMenu
    .Provider<Workspace.UISourceCode.UISourceCode | SDK.Resource.Resource | SDK.NetworkRequest.NetworkRequest> {
    appendApplicableItems(_event: Event, contextMenu: UI.ContextMenu.ContextMenu, contentProvider: Workspace.UISourceCode.UISourceCode | SDK.Resource.Resource | SDK.NetworkRequest.NetworkRequest): void;
}
interface LinkInfo {
    icon: IconButton.Icon.Icon | null;
    enableDecorator: boolean;
    uiLocation: Workspace.UISourceCode.UILocation | null;
    liveLocation: Bindings.LiveLocation.LiveLocation | null;
    url: Platform.DevToolsPath.UrlString | null;
    lineNumber: number | null;
    columnNumber: number | null;
    inlineFrameIndex: number;
    revealable: Object | null;
    fallback: Element | null;
    userMetric?: Host.UserMetrics.Action;
    jslogContext?: string;
}
export interface LinkifyURLOptions {
    text?: string;
    className?: string;
    lineNumber?: number;
    columnNumber?: number;
    showColumnNumber?: boolean;
    inlineFrameIndex?: number;
    preventClick?: boolean;
    maxLength?: number;
    tabStop?: boolean;
    bypassURLTrimming?: boolean;
    userMetric?: Host.UserMetrics.Action;
    jslogContext?: string;
}
export interface LinkifyOptions {
    className?: string;
    columnNumber?: number;
    showColumnNumber?: boolean;
    inlineFrameIndex: number;
    tabStop?: boolean;
    userMetric?: Host.UserMetrics.Action;
    jslogContext?: string;
    /**
     * {@link LinkDisplayOptions.revealBreakpoint}
     */
    revealBreakpoint?: boolean;
}
export type LinkHandler = (arg0: TextUtils.ContentProvider.ContentProvider, arg1: number) => void;
export declare const enum Events {
    LiveLocationUpdated = "liveLocationUpdated"
}
export type EventTypes = {
    [Events.LiveLocationUpdated]: Bindings.LiveLocation.LiveLocation;
};
export {};
