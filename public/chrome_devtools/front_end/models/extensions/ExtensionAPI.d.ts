import type * as PublicAPI from '../../../extension-api/ExtensionAPI';
import type * as Platform from '../../core/platform/platform.js';
import type * as HAR from '../har/har.js';
export declare namespace PrivateAPI {
    export namespace Panels {
        const enum SearchAction {
            CancelSearch = "cancelSearch",
            PerformSearch = "performSearch",
            NextSearchResult = "nextSearchResult",
            PreviousSearchResult = "previousSearchResult"
        }
    }
    export const enum Events {
        ButtonClicked = "button-clicked-",
        PanelObjectSelected = "panel-objectSelected-",
        InspectedURLChanged = "inspected-url-changed",
        NetworkRequestFinished = "network-request-finished",
        OpenResource = "open-resource",
        PanelSearch = "panel-search-",
        ProfilingStarted = "profiling-started-",
        ProfilingStopped = "profiling-stopped-",
        ResourceAdded = "resource-added",
        ResourceContentCommitted = "resource-content-committed",
        ViewShown = "view-shown-",
        ViewHidden = "view-hidden,",
        ThemeChange = "host-theme-change"
    }
    export const enum Commands {
        AddRequestHeaders = "addRequestHeaders",
        ApplyStyleSheet = "applyStyleSheet",
        CreatePanel = "createPanel",
        CreateSidebarPane = "createSidebarPane",
        CreateToolbarButton = "createToolbarButton",
        EvaluateOnInspectedPage = "evaluateOnInspectedPage",
        ForwardKeyboardEvent = "_forwardKeyboardEvent",
        GetHAR = "getHAR",
        GetPageResources = "getPageResources",
        GetRequestContent = "getRequestContent",
        GetResourceContent = "getResourceContent",
        OpenResource = "openResource",
        Reload = "Reload",
        Subscribe = "subscribe",
        SetOpenResourceHandler = "setOpenResourceHandler",
        SetThemeChangeHandler = "setThemeChangeHandler",
        SetResourceContent = "setResourceContent",
        SetSidebarContent = "setSidebarContent",
        SetSidebarHeight = "setSidebarHeight",
        SetSidebarPage = "setSidebarPage",
        ShowPanel = "showPanel",
        Unsubscribe = "unsubscribe",
        UpdateButton = "updateButton",
        RegisterLanguageExtensionPlugin = "registerLanguageExtensionPlugin",
        GetWasmLinearMemory = "getWasmLinearMemory",
        GetWasmLocal = "getWasmLocal",
        GetWasmGlobal = "getWasmGlobal",
        GetWasmOp = "getWasmOp",
        RegisterRecorderExtensionPlugin = "registerRecorderExtensionPlugin",
        CreateRecorderView = "createRecorderView",
        ShowRecorderView = "showRecorderView",
        ShowNetworkPanel = "showNetworkPanel",
        ReportResourceLoad = "reportResourceLoad"
    }
    export const enum LanguageExtensionPluginCommands {
        AddRawModule = "addRawModule",
        RemoveRawModule = "removeRawModule",
        SourceLocationToRawLocation = "sourceLocationToRawLocation",
        RawLocationToSourceLocation = "rawLocationToSourceLocation",
        GetScopeInfo = "getScopeInfo",
        ListVariablesInScope = "listVariablesInScope",
        GetTypeInfo = "getTypeInfo",
        GetFormatter = "getFormatter",
        GetInspectableAddress = "getInspectableAddress",
        GetFunctionInfo = "getFunctionInfo",
        GetInlinedFunctionRanges = "getInlinedFunctionRanges",
        GetInlinedCalleesRanges = "getInlinedCalleesRanges",
        GetMappedLines = "getMappedLines",
        FormatValue = "formatValue",
        GetProperties = "getProperties",
        ReleaseObject = "releaseObject"
    }
    export const enum LanguageExtensionPluginEvents {
        UnregisteredLanguageExtensionPlugin = "unregisteredLanguageExtensionPlugin"
    }
    export const enum RecorderExtensionPluginCommands {
        Stringify = "stringify",
        StringifyStep = "stringifyStep",
        Replay = "replay"
    }
    export const enum RecorderExtensionPluginEvents {
        UnregisteredRecorderExtensionPlugin = "unregisteredRecorderExtensionPlugin"
    }
    export interface EvaluateOptions {
        frameURL?: string;
        useContentScriptContext?: boolean;
        scriptExecutionContext?: string;
    }
    type RegisterLanguageExtensionPluginRequest = {
        command: Commands.RegisterLanguageExtensionPlugin;
        pluginName: string;
        port: MessagePort;
        supportedScriptTypes: PublicAPI.Chrome.DevTools.SupportedScriptTypes;
    };
    export type RecordingExtensionPluginCapability = 'export' | 'replay';
    type RegisterRecorderExtensionPluginRequest = {
        command: Commands.RegisterRecorderExtensionPlugin;
        pluginName: string;
        mediaType?: string;
        capabilities: RecordingExtensionPluginCapability[];
        port: MessagePort;
    };
    type CreateRecorderViewRequest = {
        command: Commands.CreateRecorderView;
        id: string;
        title: string;
        pagePath: string;
    };
    type ShowRecorderViewRequest = {
        command: Commands.ShowRecorderView;
        id: string;
    };
    type SubscribeRequest = {
        command: Commands.Subscribe;
        type: string;
    };
    type UnsubscribeRequest = {
        command: Commands.Unsubscribe;
        type: string;
    };
    type AddRequestHeadersRequest = {
        command: Commands.AddRequestHeaders;
        extensionId: string;
        headers: {
            [key: string]: string;
        };
    };
    type ApplyStyleSheetRequest = {
        command: Commands.ApplyStyleSheet;
        styleSheet: string;
    };
    type CreatePanelRequest = {
        command: Commands.CreatePanel;
        id: string;
        title: string;
        page: string;
    };
    type ShowPanelRequest = {
        command: Commands.ShowPanel;
        id: string;
    };
    type CreateToolbarButtonRequest = {
        command: Commands.CreateToolbarButton;
        id: string;
        icon: string;
        panel: string;
        tooltip?: string;
        disabled?: boolean;
    };
    type UpdateButtonRequest = {
        command: Commands.UpdateButton;
        id: string;
        icon?: string;
        tooltip?: string;
        disabled?: boolean;
    };
    type CreateSidebarPaneRequest = {
        command: Commands.CreateSidebarPane;
        id: string;
        panel: string;
        title: string;
    };
    type SetSidebarHeightRequest = {
        command: Commands.SetSidebarHeight;
        id: string;
        height: string;
    };
    type SetSidebarContentRequest = {
        command: Commands.SetSidebarContent;
        id: string;
        evaluateOnPage?: boolean;
        expression: string;
        rootTitle?: string;
        evaluateOptions?: EvaluateOptions;
    };
    type SetSidebarPageRequest = {
        command: Commands.SetSidebarPage;
        id: string;
        page: string;
    };
    type OpenResourceRequest = {
        command: Commands.OpenResource;
        url: Platform.DevToolsPath.UrlString;
        lineNumber: number;
        columnNumber: number;
    };
    type SetOpenResourceHandlerRequest = {
        command: Commands.SetOpenResourceHandler;
        handlerPresent: boolean;
    };
    type SetThemeChangeHandlerRequest = {
        command: Commands.SetThemeChangeHandler;
        handlerPresent: boolean;
    };
    type ReloadRequest = {
        command: Commands.Reload;
        options: null | {
            userAgent?: string;
            injectedScript?: string;
            ignoreCache?: boolean;
        };
    };
    type EvaluateOnInspectedPageRequest = {
        command: Commands.EvaluateOnInspectedPage;
        expression: string;
        evaluateOptions?: EvaluateOptions;
    };
    type GetRequestContentRequest = {
        command: Commands.GetRequestContent;
        id: number;
    };
    type GetResourceContentRequest = {
        command: Commands.GetResourceContent;
        url: string;
    };
    type SetResourceContentRequest = {
        command: Commands.SetResourceContent;
        url: string;
        content: string;
        commit: boolean;
    };
    type ForwardKeyboardEventRequest = {
        command: Commands.ForwardKeyboardEvent;
        entries: Array<KeyboardEventInit & {
            eventType: string;
        }>;
    };
    type GetHARRequest = {
        command: Commands.GetHAR;
    };
    type GetPageResourcesRequest = {
        command: Commands.GetPageResources;
    };
    type GetWasmLinearMemoryRequest = {
        command: Commands.GetWasmLinearMemory;
        offset: number;
        length: number;
        stopId: unknown;
    };
    type GetWasmLocalRequest = {
        command: Commands.GetWasmLocal;
        local: number;
        stopId: unknown;
    };
    type GetWasmGlobalRequest = {
        command: Commands.GetWasmGlobal;
        global: number;
        stopId: unknown;
    };
    type GetWasmOpRequest = {
        command: Commands.GetWasmOp;
        op: number;
        stopId: unknown;
    };
    type ShowNetworkPanelRequest = {
        command: Commands.ShowNetworkPanel;
        filter: string | undefined;
    };
    type ReportResourceLoadRequest = {
        command: Commands.ReportResourceLoad;
        extensionId: string;
        resourceUrl: string;
        status: {
            success: boolean;
            errorMessage?: string;
            size?: number;
        };
    };
    export type ServerRequests = ShowRecorderViewRequest | CreateRecorderViewRequest | RegisterRecorderExtensionPluginRequest | RegisterLanguageExtensionPluginRequest | SubscribeRequest | UnsubscribeRequest | AddRequestHeadersRequest | ApplyStyleSheetRequest | CreatePanelRequest | ShowPanelRequest | CreateToolbarButtonRequest | UpdateButtonRequest | CreateSidebarPaneRequest | SetSidebarHeightRequest | SetSidebarContentRequest | SetSidebarPageRequest | OpenResourceRequest | SetOpenResourceHandlerRequest | SetThemeChangeHandlerRequest | ReloadRequest | EvaluateOnInspectedPageRequest | GetRequestContentRequest | GetResourceContentRequest | SetResourceContentRequest | ForwardKeyboardEventRequest | GetHARRequest | GetPageResourcesRequest | GetWasmLinearMemoryRequest | GetWasmLocalRequest | GetWasmGlobalRequest | GetWasmOpRequest | ShowNetworkPanelRequest | ReportResourceLoadRequest;
    export type ExtensionServerRequestMessage = PrivateAPI.ServerRequests & {
        requestId?: number;
    };
    type AddRawModuleRequest = {
        method: LanguageExtensionPluginCommands.AddRawModule;
        parameters: {
            rawModuleId: string;
            symbolsURL: string | undefined;
            rawModule: PublicAPI.Chrome.DevTools.RawModule;
        };
    };
    type SourceLocationToRawLocationRequest = {
        method: LanguageExtensionPluginCommands.SourceLocationToRawLocation;
        parameters: {
            sourceLocation: PublicAPI.Chrome.DevTools.SourceLocation;
        };
    };
    type RawLocationToSourceLocationRequest = {
        method: LanguageExtensionPluginCommands.RawLocationToSourceLocation;
        parameters: {
            rawLocation: PublicAPI.Chrome.DevTools.RawLocation;
        };
    };
    type GetScopeInfoRequest = {
        method: LanguageExtensionPluginCommands.GetScopeInfo;
        parameters: {
            type: string;
        };
    };
    type ListVariablesInScopeRequest = {
        method: LanguageExtensionPluginCommands.ListVariablesInScope;
        parameters: {
            rawLocation: PublicAPI.Chrome.DevTools.RawLocation;
        };
    };
    type RemoveRawModuleRequest = {
        method: LanguageExtensionPluginCommands.RemoveRawModule;
        parameters: {
            rawModuleId: string;
        };
    };
    type GetFunctionInfoRequest = {
        method: LanguageExtensionPluginCommands.GetFunctionInfo;
        parameters: {
            rawLocation: PublicAPI.Chrome.DevTools.RawLocation;
        };
    };
    type GetInlinedFunctionRangesRequest = {
        method: LanguageExtensionPluginCommands.GetInlinedFunctionRanges;
        parameters: {
            rawLocation: PublicAPI.Chrome.DevTools.RawLocation;
        };
    };
    type GetInlinedCalleesRangesRequest = {
        method: LanguageExtensionPluginCommands.GetInlinedCalleesRanges;
        parameters: {
            rawLocation: PublicAPI.Chrome.DevTools.RawLocation;
        };
    };
    type GetMappedLinesRequest = {
        method: LanguageExtensionPluginCommands.GetMappedLines;
        parameters: {
            rawModuleId: string;
            sourceFileURL: string;
        };
    };
    type FormatValueRequest = {
        method: LanguageExtensionPluginCommands.FormatValue;
        parameters: {
            expression: string;
            context: PublicAPI.Chrome.DevTools.RawLocation;
            stopId: number;
        };
    };
    type GetPropertiesRequest = {
        method: LanguageExtensionPluginCommands.GetProperties;
        parameters: {
            objectId: PublicAPI.Chrome.DevTools.RemoteObjectId;
        };
    };
    type ReleaseObjectRequest = {
        method: LanguageExtensionPluginCommands.ReleaseObject;
        parameters: {
            objectId: PublicAPI.Chrome.DevTools.RemoteObjectId;
        };
    };
    export type LanguageExtensionRequests = AddRawModuleRequest | SourceLocationToRawLocationRequest | RawLocationToSourceLocationRequest | GetScopeInfoRequest | ListVariablesInScopeRequest | RemoveRawModuleRequest | GetFunctionInfoRequest | GetInlinedFunctionRangesRequest | GetInlinedCalleesRangesRequest | GetMappedLinesRequest | FormatValueRequest | GetPropertiesRequest | ReleaseObjectRequest;
    type StringifyRequest = {
        method: RecorderExtensionPluginCommands.Stringify;
        parameters: {
            recording: Record<string, unknown>;
        };
    };
    type StringifyStepRequest = {
        method: RecorderExtensionPluginCommands.StringifyStep;
        parameters: {
            step: Record<string, unknown>;
        };
    };
    type ReplayRequest = {
        method: RecorderExtensionPluginCommands.Replay;
        parameters: {
            recording: Record<string, unknown>;
        };
    };
    export type RecorderExtensionRequests = StringifyRequest | StringifyStepRequest | ReplayRequest;
    export {};
}
declare global {
    interface Window {
        injectedExtensionAPI: (extensionInfo: ExtensionDescriptor, inspectedTabId: string, themeName: string, keysToForward: number[], testHook: (extensionServer: APIImpl.ExtensionServerClient, extensionAPI: APIImpl.InspectorExtensionAPI) => unknown, injectedScriptId: number, targetWindow?: Window) => void;
        buildExtensionAPIInjectedScript(extensionInfo: ExtensionDescriptor, inspectedTabId: string, themeName: string, keysToForward: number[], testHook: undefined | ((extensionServer: unknown, extensionAPI: unknown) => unknown)): string;
        chrome: PublicAPI.Chrome.DevTools.Chrome;
        webInspector?: APIImpl.InspectorExtensionAPI;
    }
}
export type ExtensionDescriptor = {
    startPage: string;
    name: string;
    exposeExperimentalAPIs: boolean;
    exposeWebInspectorNamespace?: boolean;
    allowFileAccess?: boolean;
};
declare namespace APIImpl {
    interface InspectorExtensionAPI {
        languageServices: PublicAPI.Chrome.DevTools.LanguageExtensions;
        recorder: PublicAPI.Chrome.DevTools.RecorderExtensions;
        performance: PublicAPI.Chrome.DevTools.Performance;
        network: PublicAPI.Chrome.DevTools.Network;
        panels: PublicAPI.Chrome.DevTools.Panels;
        inspectedWindow: PublicAPI.Chrome.DevTools.InspectedWindow;
    }
    interface ExtensionServerClient {
        _callbacks: {
            [key: string]: (response: unknown) => unknown;
        };
        _handlers: {
            [key: string]: (request: {
                arguments: unknown[];
            }) => unknown;
        };
        _lastRequestId: number;
        _lastObjectId: number;
        _port: MessagePort;
        _onCallback(request: unknown): void;
        _onMessage(event: MessageEvent<{
            command: string;
            requestId: number;
            arguments: unknown[];
        }>): void;
        _registerCallback(callback: (response: unknown) => unknown): number;
        registerHandler(command: string, handler: (request: {
            arguments: unknown[];
        }) => unknown): void;
        unregisterHandler(command: string): void;
        hasHandler(command: string): boolean;
        sendRequest<ResponseT>(request: PrivateAPI.ServerRequests, callback?: ((response: ResponseT) => unknown), transfers?: unknown[]): void;
        nextObjectId(): string;
    }
    type Callable = (...args: any[]) => void;
    interface EventSink<ListenerT extends Callable> extends PublicAPI.Chrome.DevTools.EventSink<ListenerT> {
        _type: string;
        _listeners: ListenerT[];
        _customDispatch: undefined | ((this: EventSink<ListenerT>, request: {
            arguments: unknown[];
        }) => unknown);
        _fire(..._vararg: Parameters<ListenerT>): void;
        _dispatch(request: {
            arguments: unknown[];
        }): void;
    }
    interface Network extends PublicAPI.Chrome.DevTools.Network {
        addRequestHeaders(headers: {
            [key: string]: string;
        }): void;
    }
    interface Request extends PublicAPI.Chrome.DevTools.Request, HAR.Log.EntryDTO {
        _id: number;
    }
    interface Panels extends PublicAPI.Chrome.DevTools.Panels {
        get SearchAction(): {
            [key: string]: string;
        };
        applyStyleSheet(styleSheet: string): void;
        setOpenResourceHandler(callback?: (resource: PublicAPI.Chrome.DevTools.Resource, lineNumber: number) => unknown): void;
        setThemeChangeHandler(callback?: (themeName: string) => unknown): void;
    }
    interface ExtensionView extends PublicAPI.Chrome.DevTools.ExtensionView {
        _id: string | null;
    }
    interface ExtensionSidebarPane extends ExtensionView, PublicAPI.Chrome.DevTools.ExtensionSidebarPane {
        setExpression(expression: string, rootTitle?: string, evaluteOptions?: PrivateAPI.EvaluateOptions, callback?: () => unknown): void;
    }
    interface PanelWithSidebar extends ExtensionView, PublicAPI.Chrome.DevTools.PanelWithSidebar {
        _hostPanelName: string;
    }
    interface LanguageExtensions extends PublicAPI.Chrome.DevTools.LanguageExtensions {
        _plugins: Map<PublicAPI.Chrome.DevTools.LanguageExtensionPlugin, MessagePort>;
    }
    interface RecorderExtensions extends PublicAPI.Chrome.DevTools.RecorderExtensions {
        _plugins: Map<PublicAPI.Chrome.DevTools.RecorderExtensionPlugin, MessagePort>;
    }
    interface ExtensionPanel extends ExtensionView, PublicAPI.Chrome.DevTools.ExtensionPanel {
        show(): void;
    }
    interface RecorderView extends ExtensionView, PublicAPI.Chrome.DevTools.RecorderView {
    }
    interface Button extends PublicAPI.Chrome.DevTools.Button {
        _id: string;
    }
    type ResourceData = {
        url: string;
        type: string;
    };
    interface Resource extends PublicAPI.Chrome.DevTools.Resource {
        _type: string;
        _url: string;
        get type(): string;
    }
}
export {};
