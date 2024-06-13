import * as Common from '../../core/common/common.js';
import { type RecorderExtensionEndpoint } from './RecorderExtensionEndpoint.js';
export type ViewDescriptor = {
    id: string;
    title: string;
    pagePath: string;
    onShown: () => void;
    onHidden: () => void;
};
export declare class RecorderPluginManager extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    static instance(): RecorderPluginManager;
    addPlugin(plugin: RecorderExtensionEndpoint): void;
    removePlugin(plugin: RecorderExtensionEndpoint): void;
    plugins(): RecorderExtensionEndpoint[];
    registerView(descriptor: ViewDescriptor): void;
    views(): ViewDescriptor[];
    getViewDescriptor(id: string): ViewDescriptor | undefined;
    showView(id: string): void;
}
export declare const enum Events {
    PluginAdded = "pluginAdded",
    PluginRemoved = "pluginRemoved",
    ViewRegistered = "viewRegistered",
    ShowViewRequested = "showViewRequested"
}
export type EventTypes = {
    [Events.PluginAdded]: RecorderExtensionEndpoint;
    [Events.PluginRemoved]: RecorderExtensionEndpoint;
    [Events.ViewRegistered]: ViewDescriptor;
    [Events.ShowViewRequested]: ViewDescriptor;
};
