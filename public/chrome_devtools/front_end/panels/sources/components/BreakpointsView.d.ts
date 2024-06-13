import * as Common from '../../../core/common/common.js';
import * as Platform from '../../../core/platform/platform.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as Breakpoints from '../../../models/breakpoints/breakpoints.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as UI from '../../../ui/legacy/legacy.js';
export interface BreakpointsViewData {
    breakpointsActive: boolean;
    pauseOnUncaughtExceptions: boolean;
    pauseOnCaughtExceptions: boolean;
    independentPauseToggles: boolean;
    groups: BreakpointGroup[];
}
export interface BreakpointGroup {
    name: string;
    url: Platform.DevToolsPath.UrlString;
    editable: boolean;
    expanded: boolean;
    breakpointItems: BreakpointItem[];
}
export interface BreakpointItem {
    id: string;
    location: string;
    codeSnippet: string;
    isHit: boolean;
    status: BreakpointStatus;
    type: SDK.DebuggerModel.BreakpointType;
    hoverText?: string;
}
export declare const enum BreakpointStatus {
    ENABLED = "ENABLED",
    DISABLED = "DISABLED",
    INDETERMINATE = "INDETERMINATE"
}
export declare class BreakpointsSidebarController implements UI.ContextFlavorListener.ContextFlavorListener {
    #private;
    private constructor();
    static instance({ forceNew, breakpointManager, settings }?: {
        forceNew: boolean | null;
        breakpointManager: Breakpoints.BreakpointManager.BreakpointManager;
        settings: Common.Settings.Settings;
    }): BreakpointsSidebarController;
    static removeInstance(): void;
    static targetSupportsIndependentPauseOnExceptionToggles(): boolean;
    flavorChanged(_object: Object | null): void;
    breakpointEditFinished(breakpoint: Breakpoints.BreakpointManager.Breakpoint | null, edited: boolean): void;
    breakpointStateChanged(breakpointItem: BreakpointItem, checked: boolean): void;
    breakpointEdited(breakpointItem: BreakpointItem, editButtonClicked: boolean): Promise<void>;
    breakpointsRemoved(breakpointItems: BreakpointItem[]): void;
    expandedStateChanged(url: Platform.DevToolsPath.UrlString, expanded: boolean): void;
    jumpToSource(breakpointItem: BreakpointItem): Promise<void>;
    setPauseOnUncaughtExceptions(value: boolean): void;
    setPauseOnCaughtExceptions(value: boolean): void;
    update(): Promise<void>;
    getUpdatedBreakpointViewData(): Promise<BreakpointsViewData>;
}
export declare class BreakpointsView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): BreakpointsView;
    constructor();
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    set data(data: BreakpointsViewData);
    connectedCallback(): void;
    render(): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-breakpoint-view': BreakpointsView;
    }
}
