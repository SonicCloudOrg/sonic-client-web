import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { type CanShowSurveyResult, type ChangeEvent, type ClickEvent, type ContextMenuDescriptor, type DoAidaConversationResult, type DragEvent, type EnumeratedHistogram, type EventTypes, type ExtensionDescriptor, type HoverEvent, type ImpressionEvent, type InspectorFrontendHostAPI, type KeyDownEvent, type LoadNetworkResourceResult, type ResizeEvent, type ShowSurveyResult, type SyncInformation } from './InspectorFrontendHostAPI.js';
/**
 * The InspectorFrontendHostStub is a stub interface used the frontend is loaded like a webpage. Examples:
 *   - devtools://devtools/bundled/devtools_app.html
 *   - https://chrome-devtools-frontend.appspot.com/serve_rev/@030cc140435b0152645522b9864b75cac6c0a854/worker_app.html
 *   - http://localhost:9222/devtools/inspector.html?ws=localhost:9222/devtools/page/xTARGET_IDx
 *
 * When the frontend runs within the native embedder, then the InspectorFrontendHostAPI methods are provided
 * by devtools_compatibility.js. Those leverage `DevToolsAPI.sendMessageToEmbedder()` which match up with
 * the embedder API defined here: https://source.chromium.org/search?q=f:devtools%20f:dispatcher%20f:cc%20symbol:CreateForDevToolsFrontend&sq=&ss=chromium%2Fchromium%2Fsrc
 * The native implementations live in devtools_ui_bindings.cc: https://source.chromium.org/chromium/chromium/src/+/main:chrome/browser/devtools/devtools_ui_bindings.cc
 */
export declare class InspectorFrontendHostStub implements InspectorFrontendHostAPI {
    #private;
    events: Common.EventTarget.EventTarget<EventTypes>;
    recordedCountHistograms: {
        histogramName: string;
        sample: number;
        min: number;
        exclusiveMax: number;
        bucketSize: number;
    }[];
    recordedEnumeratedHistograms: {
        actionName: EnumeratedHistogram;
        actionCode: number;
    }[];
    recordedPerformanceHistograms: {
        histogramName: string;
        duration: number;
    }[];
    constructor();
    platform(): string;
    loadCompleted(): void;
    bringToFront(): void;
    closeWindow(): void;
    setIsDocked(isDocked: boolean, callback: () => void): void;
    showSurvey(trigger: string, callback: (arg0: ShowSurveyResult) => void): void;
    canShowSurvey(trigger: string, callback: (arg0: CanShowSurveyResult) => void): void;
    /**
     * Requests inspected page to be placed atop of the inspector frontend with specified bounds.
     */
    setInspectedPageBounds(bounds: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    inspectElementCompleted(): void;
    setInjectedScriptForOrigin(origin: string, script: string): void;
    inspectedURLChanged(url: Platform.DevToolsPath.UrlString): void;
    copyText(text: string | null | undefined): void;
    openInNewTab(url: Platform.DevToolsPath.UrlString): void;
    openSearchResultsInNewTab(query: string): void;
    showItemInFolder(fileSystemPath: Platform.DevToolsPath.RawPathString): void;
    save(url: Platform.DevToolsPath.RawPathString | Platform.DevToolsPath.UrlString, content: string, forceSaveAs: boolean, isBase64: boolean): void;
    append(url: Platform.DevToolsPath.RawPathString | Platform.DevToolsPath.UrlString, content: string): void;
    close(url: Platform.DevToolsPath.RawPathString | Platform.DevToolsPath.UrlString): void;
    sendMessageToBackend(message: string): void;
    recordCountHistogram(histogramName: string, sample: number, min: number, exclusiveMax: number, bucketSize: number): void;
    recordEnumeratedHistogram(actionName: EnumeratedHistogram, actionCode: number, bucketSize: number): void;
    recordPerformanceHistogram(histogramName: string, duration: number): void;
    recordUserMetricsAction(umaName: string): void;
    requestFileSystems(): void;
    addFileSystem(type?: string): void;
    removeFileSystem(fileSystemPath: Platform.DevToolsPath.RawPathString): void;
    isolatedFileSystem(fileSystemId: string, registeredName: string): FileSystem | null;
    loadNetworkResource(url: string, headers: string, streamId: number, callback: (arg0: LoadNetworkResourceResult) => void): void;
    registerPreference(name: string, options: {
        synced?: boolean;
    }): void;
    getPreferences(callback: (arg0: {
        [x: string]: string;
    }) => void): void;
    getPreference(name: string, callback: (arg0: string) => void): void;
    setPreference(name: string, value: string): void;
    removePreference(name: string): void;
    clearPreferences(): void;
    getSyncInformation(callback: (arg0: SyncInformation) => void): void;
    getHostConfig(callback: (arg0: Root.Runtime.HostConfig) => void): void;
    upgradeDraggedFileSystemPermissions(fileSystem: FileSystem): void;
    indexPath(requestId: number, fileSystemPath: Platform.DevToolsPath.RawPathString, excludedFolders: string): void;
    stopIndexing(requestId: number): void;
    searchInPath(requestId: number, fileSystemPath: Platform.DevToolsPath.RawPathString, query: string): void;
    zoomFactor(): number;
    zoomIn(): void;
    zoomOut(): void;
    resetZoom(): void;
    setWhitelistedShortcuts(shortcuts: string): void;
    setEyeDropperActive(active: boolean): void;
    showCertificateViewer(certChain: string[]): void;
    reattach(callback: () => void): void;
    readyForTest(): void;
    connectionReady(): void;
    setOpenNewWindowForPopups(value: boolean): void;
    setDevicesDiscoveryConfig(config: Adb.Config): void;
    setDevicesUpdatesEnabled(enabled: boolean): void;
    performActionOnRemotePage(pageId: string, action: string): void;
    openRemotePage(browserId: string, url: string): void;
    openNodeFrontend(): void;
    showContextMenuAtPoint(x: number, y: number, items: ContextMenuDescriptor[], document: Document): void;
    isHostedMode(): boolean;
    setAddExtensionCallback(callback: (arg0: ExtensionDescriptor) => void): void;
    initialTargetId(): Promise<string | null>;
    doAidaConversation(request: string, streamId: number, callback: (result: DoAidaConversationResult) => void): void;
    registerAidaClientEvent(request: string): void;
    recordImpression(event: ImpressionEvent): void;
    recordResize(event: ResizeEvent): void;
    recordClick(event: ClickEvent): void;
    recordHover(event: HoverEvent): void;
    recordDrag(event: DragEvent): void;
    recordChange(event: ChangeEvent): void;
    recordKeyDown(event: KeyDownEvent): void;
}
export declare let InspectorFrontendHostInstance: InspectorFrontendHostStub;
export declare function isUnderTest(prefs?: {
    [x: string]: string;
}): boolean;
