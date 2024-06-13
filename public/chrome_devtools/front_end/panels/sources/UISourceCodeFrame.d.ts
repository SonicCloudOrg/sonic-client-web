import * as Common from '../../core/common/common.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as CodeMirror from '../../third_party/codemirror.next/codemirror.next.js';
import * as SourceFrame from '../../ui/legacy/components/source_frame/source_frame.js';
import * as UI from '../../ui/legacy/legacy.js';
declare const UISourceCodeFrame_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends Events.ToolbarItemsChanged>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends Events.ToolbarItemsChanged>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends Events.ToolbarItemsChanged>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: Events.ToolbarItemsChanged): boolean;
    dispatchEventToListeners<T_3 extends Events.ToolbarItemsChanged>(eventType: import("../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof SourceFrame.SourceFrame.SourceFrameImpl;
export declare class UISourceCodeFrame extends UISourceCodeFrame_base {
    #private;
    private uiSourceCodeInternal;
    private muteSourceCodeEvents;
    private persistenceBinding;
    private uiSourceCodeEventListeners;
    private messageAndDecorationListeners;
    private readonly boundOnBindingChanged;
    private plugins;
    private readonly errorPopoverHelper;
    constructor(uiSourceCode: Workspace.UISourceCode.UISourceCode);
    private workingCopy;
    protected editorConfiguration(doc: string): CodeMirror.Extension;
    protected onFocus(): void;
    protected onBlur(): void;
    private installMessageAndDecorationListeners;
    uiSourceCode(): Workspace.UISourceCode.UISourceCode;
    setUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    private unloadUISourceCode;
    private initializeUISourceCode;
    wasShown(): void;
    willHide(): void;
    protected getContentType(): string;
    canEditSourceInternal(): boolean;
    private onNetworkPersistenceChanged;
    commitEditing(): void;
    setContent(content: string): Promise<void>;
    private createMessage;
    private allMessages;
    onTextChanged(): void;
    onWorkingCopyChanged(): void;
    private onWorkingCopyCommitted;
    private reloadPlugins;
    private onTitleChanged;
    private loadPlugins;
    private disposePlugins;
    private onBindingChanged;
    private reloadMessages;
    private updateStyle;
    private maybeSetContent;
    protected populateTextAreaContextMenu(contextMenu: UI.ContextMenu.ContextMenu, lineNumber: number, columnNumber: number): void;
    protected populateLineGutterContextMenu(contextMenu: UI.ContextMenu.ContextMenu, lineNumber: number): void;
    dispose(): void;
    private onMessageAdded;
    private onMessageRemoved;
    private onDecorationChanged;
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    private getErrorPopoverContent;
}
export declare const enum Events {
    ToolbarItemsChanged = "ToolbarItemsChanged"
}
export type EventTypes = {
    [Events.ToolbarItemsChanged]: void;
};
export {};
