import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { type DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
export type IgnoreListGeneralRules = {
    isContentScript?: boolean;
    isKnownThirdParty?: boolean;
    isCurrentlyIgnoreListed?: boolean;
};
export declare class IgnoreListManager implements SDK.TargetManager.SDKModelObserver<SDK.DebuggerModel.DebuggerModel> {
    #private;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
        debuggerWorkspaceBinding: DebuggerWorkspaceBinding | null;
    }): IgnoreListManager;
    static removeInstance(): void;
    addChangeListener(listener: () => void): void;
    removeChangeListener(listener: () => void): void;
    modelAdded(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    modelRemoved(debuggerModel: SDK.DebuggerModel.DebuggerModel): void;
    private clearCacheIfNeeded;
    private getSkipStackFramesPatternSetting;
    private setIgnoreListPatterns;
    private getGeneralRulesForUISourceCode;
    isUserOrSourceMapIgnoreListedUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    isUserIgnoreListedURL(url: Platform.DevToolsPath.UrlString | null, options?: IgnoreListGeneralRules): boolean;
    private sourceMapAttached;
    private sourceMapDetached;
    private updateScriptRanges;
    private uiSourceCodeURL;
    canIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): boolean;
    ignoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    unIgnoreListUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): void;
    get enableIgnoreListing(): boolean;
    set enableIgnoreListing(value: boolean);
    get skipContentScripts(): boolean;
    get automaticallyIgnoreListKnownThirdPartyScripts(): boolean;
    ignoreListContentScripts(): void;
    unIgnoreListContentScripts(): void;
    ignoreListThirdParty(): void;
    unIgnoreListThirdParty(): void;
    ignoreListURL(url: Platform.DevToolsPath.UrlString): void;
    private ignoreListRegex;
    unIgnoreListURL(url: Platform.DevToolsPath.UrlString | null, options?: IgnoreListGeneralRules): void;
    private removeIgnoreListPattern;
    private ignoreListHasPattern;
    private patternChanged;
    private patternChangeFinishedForTests;
    private urlToRegExpString;
    getIgnoreListURLContextMenuItems(uiSourceCode: Workspace.UISourceCode.UISourceCode): Array<{
        text: string;
        callback: () => void;
        jslogContext: string;
    }>;
    private getIgnoreListGeneralContextMenuItems;
    getIgnoreListFolderContextMenuItems(url: Platform.DevToolsPath.UrlString, options?: IgnoreListGeneralRules): Array<{
        text: string;
        callback: () => void;
        jslogContext: string;
    }>;
}
export interface SourceRange {
    lineNumber: number;
    columnNumber: number;
}
