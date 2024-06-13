import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as DataGrid from '../../ui/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Components from './components/components.js';
export declare const buildProtocolMetadata: (domains: Iterable<ProtocolDomain>) => Map<string, {
    parameters: Components.JSONEditor.Parameter[];
    description: string;
    replyArgs: string[];
}>;
export interface Message {
    id?: number;
    method: string;
    error: Object;
    result: Object;
    params: Object;
    sessionId?: string;
}
export interface LogMessage {
    id?: number;
    domain: string;
    method: string;
    params: Object;
    type: 'send' | 'recv';
}
export interface ProtocolDomain {
    readonly domain: string;
    readonly metadata: {
        [commandName: string]: {
            parameters: Components.JSONEditor.Parameter[];
            description: string;
            replyArgs: string[];
        };
    };
}
declare const ProtocolMonitorDataGrid_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class ProtocolMonitorDataGrid extends ProtocolMonitorDataGrid_base {
    #private;
    private started;
    private startTime;
    private readonly requestTimeForId;
    private readonly dataGridRowForId;
    private readonly infoWidget;
    private readonly dataGridIntegrator;
    private readonly filterParser;
    private readonly suggestionBuilder;
    private readonly textFilterUI;
    readonly selector: UI.Toolbar.ToolbarComboBox;
    constructor(splitWidget: UI.SplitWidget.SplitWidget);
    onCommandSend(command: string, parameters: object, target?: string): void;
    wasShown(): void;
    private setRecording;
    private targetToString;
    private messageReceived;
    private messageSent;
    private saveAsFile;
}
export declare class ProtocolMonitorImpl extends UI.Widget.VBox {
    #private;
    constructor();
}
export declare class CommandAutocompleteSuggestionProvider {
    #private;
    constructor(maxHistorySize?: number);
    buildTextPromptCompletions: (expression: string, prefix: string, force?: boolean) => Promise<UI.SuggestBox.Suggestions>;
    addEntry(value: string): void;
}
export declare class InfoWidget extends UI.Widget.VBox {
    private readonly tabbedPane;
    request: {
        [x: string]: unknown;
    };
    targetId: string;
    constructor();
    render(data: {
        request: DataGrid.DataGridUtils.Cell | undefined;
        response: DataGrid.DataGridUtils.Cell | undefined;
        target: DataGrid.DataGridUtils.Cell | undefined;
        type: 'sent' | 'received' | undefined;
        selectedTab: 'request' | 'response' | undefined;
    } | null): void;
}
export declare const enum Events {
    CommandSent = "CommandSent",
    CommandChange = "CommandChange"
}
export type EventTypes = {
    [Events.CommandSent]: Components.JSONEditor.Command;
    [Events.CommandChange]: Components.JSONEditor.Command;
};
declare const EditorWidget_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.VBox;
export declare class EditorWidget extends EditorWidget_base {
    readonly jsonEditor: Components.JSONEditor.JSONEditor;
    constructor();
}
export declare function parseCommandInput(input: string): {
    command: string;
    parameters: {
        [paramName: string]: unknown;
    };
};
export {};
