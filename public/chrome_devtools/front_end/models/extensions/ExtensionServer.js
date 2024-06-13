/*
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Logs from '../../models/logs/logs.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import * as Bindings from '../bindings/bindings.js';
import * as HAR from '../har/har.js';
import * as Workspace from '../workspace/workspace.js';
import { ExtensionButton, ExtensionPanel, ExtensionSidebarPane } from './ExtensionPanel.js';
import { HostUrlPattern } from './HostUrlPattern.js';
import { LanguageExtensionEndpoint } from './LanguageExtensionEndpoint.js';
import { RecorderExtensionEndpoint } from './RecorderExtensionEndpoint.js';
import { RecorderPluginManager } from './RecorderPluginManager.js';
const extensionOrigins = new WeakMap();
const kAllowedOrigins = [].map(url => (new URL(url)).origin);
let extensionServerInstance;
export class HostsPolicy {
    runtimeAllowedHosts;
    runtimeBlockedHosts;
    static create(policy) {
        const runtimeAllowedHosts = [];
        const runtimeBlockedHosts = [];
        if (policy) {
            for (const pattern of policy.runtimeAllowedHosts) {
                const parsedPattern = HostUrlPattern.parse(pattern);
                if (!parsedPattern) {
                    return null;
                }
                runtimeAllowedHosts.push(parsedPattern);
            }
            for (const pattern of policy.runtimeBlockedHosts) {
                const parsedPattern = HostUrlPattern.parse(pattern);
                if (!parsedPattern) {
                    return null;
                }
                runtimeBlockedHosts.push(parsedPattern);
            }
        }
        return new HostsPolicy(runtimeAllowedHosts, runtimeBlockedHosts);
    }
    constructor(runtimeAllowedHosts, runtimeBlockedHosts) {
        this.runtimeAllowedHosts = runtimeAllowedHosts;
        this.runtimeBlockedHosts = runtimeBlockedHosts;
    }
    isAllowedOnURL(inspectedURL) {
        if (!inspectedURL) {
            // If there aren't any blocked hosts retain the old behavior and don't worry about the inspectedURL
            return this.runtimeBlockedHosts.length === 0;
        }
        if (this.runtimeBlockedHosts.some(pattern => pattern.matchesUrl(inspectedURL)) &&
            !this.runtimeAllowedHosts.some(pattern => pattern.matchesUrl(inspectedURL))) {
            return false;
        }
        return true;
    }
}
class RegisteredExtension {
    name;
    hostsPolicy;
    allowFileAccess;
    constructor(name, hostsPolicy, allowFileAccess) {
        this.name = name;
        this.hostsPolicy = hostsPolicy;
        this.allowFileAccess = allowFileAccess;
    }
    isAllowedOnTarget(inspectedURL) {
        if (!inspectedURL) {
            inspectedURL = SDK.TargetManager.TargetManager.instance().primaryPageTarget()?.inspectedURL();
        }
        if (!inspectedURL) {
            return false;
        }
        if (!ExtensionServer.canInspectURL(inspectedURL)) {
            return false;
        }
        if (!this.hostsPolicy.isAllowedOnURL(inspectedURL)) {
            return false;
        }
        if (!this.allowFileAccess) {
            let parsedURL;
            try {
                parsedURL = new URL(inspectedURL);
            }
            catch (exception) {
                return false;
            }
            return parsedURL.protocol !== 'file:';
        }
        return true;
    }
}
export class RevealableNetworkRequestFilter {
    filter;
    constructor(filter) {
        this.filter = filter;
    }
}
export class ExtensionServer extends Common.ObjectWrapper.ObjectWrapper {
    clientObjects;
    handlers;
    subscribers;
    subscriptionStartHandlers;
    subscriptionStopHandlers;
    extraHeaders;
    requests;
    requestIds;
    lastRequestId;
    registeredExtensions;
    status;
    sidebarPanesInternal;
    extensionsEnabled;
    inspectedTabId;
    extensionAPITestHook;
    themeChangeHandlers = new Map();
    #pendingExtensions = [];
    constructor() {
        super();
        this.clientObjects = new Map();
        this.handlers = new Map();
        this.subscribers = new Map();
        this.subscriptionStartHandlers = new Map();
        this.subscriptionStopHandlers = new Map();
        this.extraHeaders = new Map();
        this.requests = new Map();
        this.requestIds = new Map();
        this.lastRequestId = 0;
        this.registeredExtensions = new Map();
        this.status = new ExtensionStatus();
        this.sidebarPanesInternal = [];
        // TODO(caseq): properly unload extensions when we disable them.
        this.extensionsEnabled = true;
        this.registerHandler("addRequestHeaders" /* PrivateAPI.Commands.AddRequestHeaders */, this.onAddRequestHeaders.bind(this));
        this.registerHandler("applyStyleSheet" /* PrivateAPI.Commands.ApplyStyleSheet */, this.onApplyStyleSheet.bind(this));
        this.registerHandler("createPanel" /* PrivateAPI.Commands.CreatePanel */, this.onCreatePanel.bind(this));
        this.registerHandler("createSidebarPane" /* PrivateAPI.Commands.CreateSidebarPane */, this.onCreateSidebarPane.bind(this));
        this.registerHandler("createToolbarButton" /* PrivateAPI.Commands.CreateToolbarButton */, this.onCreateToolbarButton.bind(this));
        this.registerHandler("evaluateOnInspectedPage" /* PrivateAPI.Commands.EvaluateOnInspectedPage */, this.onEvaluateOnInspectedPage.bind(this));
        this.registerHandler("_forwardKeyboardEvent" /* PrivateAPI.Commands.ForwardKeyboardEvent */, this.onForwardKeyboardEvent.bind(this));
        this.registerHandler("getHAR" /* PrivateAPI.Commands.GetHAR */, this.onGetHAR.bind(this));
        this.registerHandler("getPageResources" /* PrivateAPI.Commands.GetPageResources */, this.onGetPageResources.bind(this));
        this.registerHandler("getRequestContent" /* PrivateAPI.Commands.GetRequestContent */, this.onGetRequestContent.bind(this));
        this.registerHandler("getResourceContent" /* PrivateAPI.Commands.GetResourceContent */, this.onGetResourceContent.bind(this));
        this.registerHandler("Reload" /* PrivateAPI.Commands.Reload */, this.onReload.bind(this));
        this.registerHandler("setOpenResourceHandler" /* PrivateAPI.Commands.SetOpenResourceHandler */, this.onSetOpenResourceHandler.bind(this));
        this.registerHandler("setThemeChangeHandler" /* PrivateAPI.Commands.SetThemeChangeHandler */, this.onSetThemeChangeHandler.bind(this));
        this.registerHandler("setResourceContent" /* PrivateAPI.Commands.SetResourceContent */, this.onSetResourceContent.bind(this));
        this.registerHandler("setSidebarHeight" /* PrivateAPI.Commands.SetSidebarHeight */, this.onSetSidebarHeight.bind(this));
        this.registerHandler("setSidebarContent" /* PrivateAPI.Commands.SetSidebarContent */, this.onSetSidebarContent.bind(this));
        this.registerHandler("setSidebarPage" /* PrivateAPI.Commands.SetSidebarPage */, this.onSetSidebarPage.bind(this));
        this.registerHandler("showPanel" /* PrivateAPI.Commands.ShowPanel */, this.onShowPanel.bind(this));
        this.registerHandler("subscribe" /* PrivateAPI.Commands.Subscribe */, this.onSubscribe.bind(this));
        this.registerHandler("openResource" /* PrivateAPI.Commands.OpenResource */, this.onOpenResource.bind(this));
        this.registerHandler("unsubscribe" /* PrivateAPI.Commands.Unsubscribe */, this.onUnsubscribe.bind(this));
        this.registerHandler("updateButton" /* PrivateAPI.Commands.UpdateButton */, this.onUpdateButton.bind(this));
        this.registerHandler("registerLanguageExtensionPlugin" /* PrivateAPI.Commands.RegisterLanguageExtensionPlugin */, this.registerLanguageExtensionEndpoint.bind(this));
        this.registerHandler("getWasmLinearMemory" /* PrivateAPI.Commands.GetWasmLinearMemory */, this.onGetWasmLinearMemory.bind(this));
        this.registerHandler("getWasmGlobal" /* PrivateAPI.Commands.GetWasmGlobal */, this.onGetWasmGlobal.bind(this));
        this.registerHandler("getWasmLocal" /* PrivateAPI.Commands.GetWasmLocal */, this.onGetWasmLocal.bind(this));
        this.registerHandler("getWasmOp" /* PrivateAPI.Commands.GetWasmOp */, this.onGetWasmOp.bind(this));
        this.registerHandler("registerRecorderExtensionPlugin" /* PrivateAPI.Commands.RegisterRecorderExtensionPlugin */, this.registerRecorderExtensionEndpoint.bind(this));
        this.registerHandler("reportResourceLoad" /* PrivateAPI.Commands.ReportResourceLoad */, this.onReportResourceLoad.bind(this));
        this.registerHandler("createRecorderView" /* PrivateAPI.Commands.CreateRecorderView */, this.onCreateRecorderView.bind(this));
        this.registerHandler("showRecorderView" /* PrivateAPI.Commands.ShowRecorderView */, this.onShowRecorderView.bind(this));
        this.registerHandler("showNetworkPanel" /* PrivateAPI.Commands.ShowNetworkPanel */, this.onShowNetworkPanel.bind(this));
        window.addEventListener('message', this.onWindowMessage, false); // Only for main window.
        const existingTabId = window.DevToolsAPI && window.DevToolsAPI.getInspectedTabId && window.DevToolsAPI.getInspectedTabId();
        if (existingTabId) {
            this.setInspectedTabId({ data: existingTabId });
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.SetInspectedTabId, this.setInspectedTabId, this);
        this.initExtensions();
        ThemeSupport.ThemeSupport.instance().addEventListener(ThemeSupport.ThemeChangeEvent.eventName, this.#onThemeChange);
    }
    get isEnabledForTest() {
        return this.extensionsEnabled;
    }
    dispose() {
        ThemeSupport.ThemeSupport.instance().removeEventListener(ThemeSupport.ThemeChangeEvent.eventName, this.#onThemeChange);
        // Set up by this.initExtensions in the constructor.
        SDK.TargetManager.TargetManager.instance().removeEventListener("InspectedURLChanged" /* SDK.TargetManager.Events.InspectedURLChanged */, this.inspectedURLChanged, this);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.removeEventListener(Host.InspectorFrontendHostAPI.Events.SetInspectedTabId, this.setInspectedTabId, this);
        window.removeEventListener('message', this.onWindowMessage, false);
    }
    #onThemeChange = () => {
        const themeName = ThemeSupport.ThemeSupport.instance().themeName();
        for (const port of this.themeChangeHandlers.values()) {
            port.postMessage({ command: "host-theme-change" /* PrivateAPI.Events.ThemeChange */, themeName });
        }
    };
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!extensionServerInstance || forceNew) {
            extensionServerInstance?.dispose();
            extensionServerInstance = new ExtensionServer();
        }
        return extensionServerInstance;
    }
    initializeExtensions() {
        // Defer initialization until DevTools is fully loaded.
        if (this.inspectedTabId !== null) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.setAddExtensionCallback(this.addExtension.bind(this));
        }
    }
    hasExtensions() {
        return Boolean(this.registeredExtensions.size);
    }
    notifySearchAction(panelId, action, searchString) {
        this.postNotification("panel-search-" /* PrivateAPI.Events.PanelSearch */ + panelId, action, searchString);
    }
    notifyViewShown(identifier, frameIndex) {
        this.postNotification("view-shown-" /* PrivateAPI.Events.ViewShown */ + identifier, frameIndex);
    }
    notifyViewHidden(identifier) {
        this.postNotification("view-hidden," /* PrivateAPI.Events.ViewHidden */ + identifier);
    }
    notifyButtonClicked(identifier) {
        this.postNotification("button-clicked-" /* PrivateAPI.Events.ButtonClicked */ + identifier);
    }
    profilingStarted() {
        this.postNotification("profiling-started-" /* PrivateAPI.Events.ProfilingStarted */);
    }
    profilingStopped() {
        this.postNotification("profiling-stopped-" /* PrivateAPI.Events.ProfilingStopped */);
    }
    registerLanguageExtensionEndpoint(message, _shared_port) {
        if (message.command !== "registerLanguageExtensionPlugin" /* PrivateAPI.Commands.RegisterLanguageExtensionPlugin */) {
            return this.status.E_BADARG('command', `expected ${"registerLanguageExtensionPlugin" /* PrivateAPI.Commands.RegisterLanguageExtensionPlugin */}`);
        }
        const { pluginManager } = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
        const { pluginName, port, supportedScriptTypes: { language, symbol_types } } = message;
        const symbol_types_array = (Array.isArray(symbol_types) && symbol_types.every(e => typeof e === 'string') ? symbol_types : []);
        const extensionOrigin = this.getExtensionOrigin(_shared_port);
        const endpoint = new LanguageExtensionEndpoint(extensionOrigin, pluginName, { language, symbol_types: symbol_types_array }, port);
        pluginManager.addPlugin(endpoint);
        return this.status.OK();
    }
    async loadWasmValue(expectValue, convert, expression, stopId) {
        const { pluginManager } = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance();
        const callFrame = pluginManager.callFrameForStopId(stopId);
        if (!callFrame) {
            return this.status.E_BADARG('stopId', 'Unknown stop id');
        }
        const result = await callFrame.debuggerModel.agent.invoke_evaluateOnCallFrame({
            callFrameId: callFrame.id,
            expression,
            silent: true,
            returnByValue: !expectValue,
            generatePreview: expectValue,
            throwOnSideEffect: true,
        });
        if (!result.exceptionDetails && !result.getError()) {
            return convert(result.result);
        }
        return this.status.E_FAILED('Failed');
    }
    async onGetWasmLinearMemory(message) {
        if (message.command !== "getWasmLinearMemory" /* PrivateAPI.Commands.GetWasmLinearMemory */) {
            return this.status.E_BADARG('command', `expected ${"getWasmLinearMemory" /* PrivateAPI.Commands.GetWasmLinearMemory */}`);
        }
        return await this.loadWasmValue(false, result => result.value, `[].slice.call(new Uint8Array(memories[0].buffer, ${Number(message.offset)}, ${Number(message.length)}))`, message.stopId);
    }
    convertWasmValue(valueClass, index) {
        return obj => {
            if (obj.type === 'undefined') {
                return;
            }
            if (obj.type !== 'object' || obj.subtype !== 'wasmvalue') {
                return this.status.E_FAILED('Bad object type');
            }
            const type = obj?.description;
            const value = obj.preview?.properties?.find(o => o.name === 'value')?.value ?? '';
            switch (type) {
                case 'i32':
                case 'f32':
                case 'f64':
                    return { type, value: Number(value) };
                case 'i64':
                    return { type, value: BigInt(value) };
                case 'v128':
                    return { type, value };
                default:
                    return { type: 'reftype', valueClass, index };
            }
        };
    }
    async onGetWasmGlobal(message) {
        if (message.command !== "getWasmGlobal" /* PrivateAPI.Commands.GetWasmGlobal */) {
            return this.status.E_BADARG('command', `expected ${"getWasmGlobal" /* PrivateAPI.Commands.GetWasmGlobal */}`);
        }
        const global = Number(message.global);
        const result = await this.loadWasmValue(true, this.convertWasmValue('global', global), `globals[${global}]`, message.stopId);
        return result ?? this.status.E_BADARG('global', `No global with index ${global}`);
    }
    async onGetWasmLocal(message) {
        if (message.command !== "getWasmLocal" /* PrivateAPI.Commands.GetWasmLocal */) {
            return this.status.E_BADARG('command', `expected ${"getWasmLocal" /* PrivateAPI.Commands.GetWasmLocal */}`);
        }
        const local = Number(message.local);
        const result = await this.loadWasmValue(true, this.convertWasmValue('local', local), `locals[${local}]`, message.stopId);
        return result ?? this.status.E_BADARG('local', `No local with index ${local}`);
    }
    async onGetWasmOp(message) {
        if (message.command !== "getWasmOp" /* PrivateAPI.Commands.GetWasmOp */) {
            return this.status.E_BADARG('command', `expected ${"getWasmOp" /* PrivateAPI.Commands.GetWasmOp */}`);
        }
        const op = Number(message.op);
        const result = await this.loadWasmValue(true, this.convertWasmValue('operand', op), `stack[${op}]`, message.stopId);
        return result ?? this.status.E_BADARG('op', `No operand with index ${op}`);
    }
    registerRecorderExtensionEndpoint(message, _shared_port) {
        if (message.command !== "registerRecorderExtensionPlugin" /* PrivateAPI.Commands.RegisterRecorderExtensionPlugin */) {
            return this.status.E_BADARG('command', `expected ${"registerRecorderExtensionPlugin" /* PrivateAPI.Commands.RegisterRecorderExtensionPlugin */}`);
        }
        const { pluginName, mediaType, port, capabilities } = message;
        RecorderPluginManager.instance().addPlugin(new RecorderExtensionEndpoint(pluginName, port, capabilities, mediaType));
        return this.status.OK();
    }
    onReportResourceLoad(message) {
        if (message.command !== "reportResourceLoad" /* PrivateAPI.Commands.ReportResourceLoad */) {
            return this.status.E_BADARG('command', `expected ${"reportResourceLoad" /* PrivateAPI.Commands.ReportResourceLoad */}`);
        }
        const { resourceUrl, extensionId, status } = message;
        const url = resourceUrl;
        const initiator = { target: null, frameId: null, initiatorUrl: extensionId, extensionId };
        const pageResource = {
            url,
            initiator,
            errorMessage: status.errorMessage,
            success: status.success ?? null,
            size: status.size ?? null,
        };
        SDK.PageResourceLoader.PageResourceLoader.instance().resourceLoadedThroughExtension(pageResource);
        return this.status.OK();
    }
    onShowRecorderView(message) {
        if (message.command !== "showRecorderView" /* PrivateAPI.Commands.ShowRecorderView */) {
            return this.status.E_BADARG('command', `expected ${"showRecorderView" /* PrivateAPI.Commands.ShowRecorderView */}`);
        }
        RecorderPluginManager.instance().showView(message.id);
        return undefined;
    }
    onShowNetworkPanel(message) {
        if (message.command !== "showNetworkPanel" /* PrivateAPI.Commands.ShowNetworkPanel */) {
            return this.status.E_BADARG('command', `expected ${"showNetworkPanel" /* PrivateAPI.Commands.ShowNetworkPanel */}`);
        }
        void Common.Revealer.reveal(new RevealableNetworkRequestFilter(message.filter));
        return this.status.OK();
    }
    onCreateRecorderView(message, port) {
        if (message.command !== "createRecorderView" /* PrivateAPI.Commands.CreateRecorderView */) {
            return this.status.E_BADARG('command', `expected ${"createRecorderView" /* PrivateAPI.Commands.CreateRecorderView */}`);
        }
        const id = message.id;
        // The ids are generated on the client API side and must be unique, so the check below
        // shouldn't be hit unless someone is bypassing the API.
        if (this.clientObjects.has(id)) {
            return this.status.E_EXISTS(id);
        }
        const pagePath = ExtensionServer.expandResourcePath(this.getExtensionOrigin(port), message.pagePath);
        if (pagePath === undefined) {
            return this.status.E_BADARG('pagePath', 'Resources paths cannot point to non-extension resources');
        }
        const onShown = () => this.notifyViewShown(id);
        const onHidden = () => this.notifyViewHidden(id);
        RecorderPluginManager.instance().registerView({
            id,
            pagePath,
            title: message.title,
            onShown,
            onHidden,
        });
        return this.status.OK();
    }
    inspectedURLChanged(event) {
        if (!ExtensionServer.canInspectURL(event.data.inspectedURL())) {
            this.disableExtensions();
            return;
        }
        if (event.data !== SDK.TargetManager.TargetManager.instance().primaryPageTarget()) {
            return;
        }
        this.requests = new Map();
        this.enableExtensions();
        const url = event.data.inspectedURL();
        this.postNotification("inspected-url-changed" /* PrivateAPI.Events.InspectedURLChanged */, url);
        const extensions = this.#pendingExtensions.splice(0);
        extensions.forEach(e => this.addExtension(e));
    }
    hasSubscribers(type) {
        return this.subscribers.has(type);
    }
    isNotificationAllowedForExtension(port, type, ..._args) {
        if (type === "network-request-finished" /* PrivateAPI.Events.NetworkRequestFinished */) {
            const entry = _args[1];
            const origin = extensionOrigins.get(port);
            const extension = origin && this.registeredExtensions.get(origin);
            if (extension?.isAllowedOnTarget(entry.request.url)) {
                return true;
            }
            return false;
        }
        return true;
    }
    postNotification(type, ..._vararg) {
        if (!this.extensionsEnabled) {
            return;
        }
        const subscribers = this.subscribers.get(type);
        if (!subscribers) {
            return;
        }
        const message = { command: 'notify-' + type, arguments: Array.prototype.slice.call(arguments, 1) };
        for (const subscriber of subscribers) {
            if (this.extensionEnabled(subscriber) && this.isNotificationAllowedForExtension(subscriber, type, ..._vararg)) {
                subscriber.postMessage(message);
            }
        }
    }
    onSubscribe(message, port) {
        if (message.command !== "subscribe" /* PrivateAPI.Commands.Subscribe */) {
            return this.status.E_BADARG('command', `expected ${"subscribe" /* PrivateAPI.Commands.Subscribe */}`);
        }
        const subscribers = this.subscribers.get(message.type);
        if (subscribers) {
            subscribers.add(port);
        }
        else {
            this.subscribers.set(message.type, new Set([port]));
            const handler = this.subscriptionStartHandlers.get(message.type);
            if (handler) {
                handler();
            }
        }
        return undefined;
    }
    onUnsubscribe(message, port) {
        if (message.command !== "unsubscribe" /* PrivateAPI.Commands.Unsubscribe */) {
            return this.status.E_BADARG('command', `expected ${"unsubscribe" /* PrivateAPI.Commands.Unsubscribe */}`);
        }
        const subscribers = this.subscribers.get(message.type);
        if (!subscribers) {
            return;
        }
        subscribers.delete(port);
        if (!subscribers.size) {
            this.subscribers.delete(message.type);
            const handler = this.subscriptionStopHandlers.get(message.type);
            if (handler) {
                handler();
            }
        }
        return undefined;
    }
    onAddRequestHeaders(message) {
        if (message.command !== "addRequestHeaders" /* PrivateAPI.Commands.AddRequestHeaders */) {
            return this.status.E_BADARG('command', `expected ${"addRequestHeaders" /* PrivateAPI.Commands.AddRequestHeaders */}`);
        }
        const id = message.extensionId;
        if (typeof id !== 'string') {
            return this.status.E_BADARGTYPE('extensionId', typeof id, 'string');
        }
        let extensionHeaders = this.extraHeaders.get(id);
        if (!extensionHeaders) {
            extensionHeaders = new Map();
            this.extraHeaders.set(id, extensionHeaders);
        }
        for (const name in message.headers) {
            extensionHeaders.set(name, message.headers[name]);
        }
        const allHeaders = {};
        for (const headers of this.extraHeaders.values()) {
            for (const [name, value] of headers) {
                if (name !== '__proto__' && typeof value === 'string') {
                    allHeaders[name] = value;
                }
            }
        }
        SDK.NetworkManager.MultitargetNetworkManager.instance().setExtraHTTPHeaders(allHeaders);
        return undefined;
    }
    onApplyStyleSheet(message) {
        if (message.command !== "applyStyleSheet" /* PrivateAPI.Commands.ApplyStyleSheet */) {
            return this.status.E_BADARG('command', `expected ${"applyStyleSheet" /* PrivateAPI.Commands.ApplyStyleSheet */}`);
        }
        if (!Root.Runtime.experiments.isEnabled('apply-custom-stylesheet')) {
            return;
        }
        const styleSheet = document.createElement('style');
        styleSheet.textContent = message.styleSheet;
        document.head.appendChild(styleSheet);
        ThemeSupport.ThemeSupport.instance().addCustomStylesheet(message.styleSheet);
        // Add to all the shadow roots that have already been created
        for (let node = document.body; node; node = node.traverseNextNode(document.body)) {
            if (node instanceof ShadowRoot) {
                ThemeSupport.ThemeSupport.instance().injectCustomStyleSheets(node);
            }
        }
        return undefined;
    }
    getExtensionOrigin(port) {
        const origin = extensionOrigins.get(port);
        if (!origin) {
            throw new Error('Received a message from an unregistered extension');
        }
        return origin;
    }
    onCreatePanel(message, port) {
        if (message.command !== "createPanel" /* PrivateAPI.Commands.CreatePanel */) {
            return this.status.E_BADARG('command', `expected ${"createPanel" /* PrivateAPI.Commands.CreatePanel */}`);
        }
        const id = message.id;
        // The ids are generated on the client API side and must be unique, so the check below
        // shouldn't be hit unless someone is bypassing the API.
        if (this.clientObjects.has(id) || UI.InspectorView.InspectorView.instance().hasPanel(id)) {
            return this.status.E_EXISTS(id);
        }
        const page = ExtensionServer.expandResourcePath(this.getExtensionOrigin(port), message.page);
        if (page === undefined) {
            return this.status.E_BADARG('page', 'Resources paths cannot point to non-extension resources');
        }
        let persistentId = this.getExtensionOrigin(port) + message.title;
        persistentId = persistentId.replace(/\s/g, '');
        const panelView = new ExtensionServerPanelView(persistentId, i18n.i18n.lockedString(message.title), new ExtensionPanel(this, persistentId, id, page));
        this.clientObjects.set(id, panelView);
        UI.InspectorView.InspectorView.instance().addPanel(panelView);
        return this.status.OK();
    }
    onShowPanel(message) {
        if (message.command !== "showPanel" /* PrivateAPI.Commands.ShowPanel */) {
            return this.status.E_BADARG('command', `expected ${"showPanel" /* PrivateAPI.Commands.ShowPanel */}`);
        }
        let panelViewId = message.id;
        const panelView = this.clientObjects.get(message.id);
        if (panelView && panelView instanceof ExtensionServerPanelView) {
            panelViewId = panelView.viewId();
        }
        void UI.InspectorView.InspectorView.instance().showPanel(panelViewId);
        return undefined;
    }
    onCreateToolbarButton(message, port) {
        if (message.command !== "createToolbarButton" /* PrivateAPI.Commands.CreateToolbarButton */) {
            return this.status.E_BADARG('command', `expected ${"createToolbarButton" /* PrivateAPI.Commands.CreateToolbarButton */}`);
        }
        const panelView = this.clientObjects.get(message.panel);
        if (!panelView || !(panelView instanceof ExtensionServerPanelView)) {
            return this.status.E_NOTFOUND(message.panel);
        }
        const resourcePath = ExtensionServer.expandResourcePath(this.getExtensionOrigin(port), message.icon);
        if (resourcePath === undefined) {
            return this.status.E_BADARG('icon', 'Resources paths cannot point to non-extension resources');
        }
        const button = new ExtensionButton(this, message.id, resourcePath, message.tooltip, message.disabled);
        this.clientObjects.set(message.id, button);
        void panelView.widget().then(appendButton);
        function appendButton(panel) {
            panel.addToolbarItem(button.toolbarButton());
        }
        return this.status.OK();
    }
    onUpdateButton(message, port) {
        if (message.command !== "updateButton" /* PrivateAPI.Commands.UpdateButton */) {
            return this.status.E_BADARG('command', `expected ${"updateButton" /* PrivateAPI.Commands.UpdateButton */}`);
        }
        const button = this.clientObjects.get(message.id);
        if (!button || !(button instanceof ExtensionButton)) {
            return this.status.E_NOTFOUND(message.id);
        }
        const resourcePath = message.icon && ExtensionServer.expandResourcePath(this.getExtensionOrigin(port), message.icon);
        if (message.icon && resourcePath === undefined) {
            return this.status.E_BADARG('icon', 'Resources paths cannot point to non-extension resources');
        }
        button.update(resourcePath, message.tooltip, message.disabled);
        return this.status.OK();
    }
    onCreateSidebarPane(message) {
        if (message.command !== "createSidebarPane" /* PrivateAPI.Commands.CreateSidebarPane */) {
            return this.status.E_BADARG('command', `expected ${"createSidebarPane" /* PrivateAPI.Commands.CreateSidebarPane */}`);
        }
        const id = message.id;
        const sidebar = new ExtensionSidebarPane(this, message.panel, i18n.i18n.lockedString(message.title), id);
        this.sidebarPanesInternal.push(sidebar);
        this.clientObjects.set(id, sidebar);
        this.dispatchEventToListeners("SidebarPaneAdded" /* Events.SidebarPaneAdded */, sidebar);
        return this.status.OK();
    }
    sidebarPanes() {
        return this.sidebarPanesInternal;
    }
    onSetSidebarHeight(message) {
        if (message.command !== "setSidebarHeight" /* PrivateAPI.Commands.SetSidebarHeight */) {
            return this.status.E_BADARG('command', `expected ${"setSidebarHeight" /* PrivateAPI.Commands.SetSidebarHeight */}`);
        }
        const sidebar = this.clientObjects.get(message.id);
        if (!sidebar || !(sidebar instanceof ExtensionSidebarPane)) {
            return this.status.E_NOTFOUND(message.id);
        }
        sidebar.setHeight(message.height);
        return this.status.OK();
    }
    onSetSidebarContent(message, port) {
        if (message.command !== "setSidebarContent" /* PrivateAPI.Commands.SetSidebarContent */) {
            return this.status.E_BADARG('command', `expected ${"setSidebarContent" /* PrivateAPI.Commands.SetSidebarContent */}`);
        }
        const { requestId, id, rootTitle, expression, evaluateOptions, evaluateOnPage } = message;
        const sidebar = this.clientObjects.get(id);
        if (!sidebar || !(sidebar instanceof ExtensionSidebarPane)) {
            return this.status.E_NOTFOUND(message.id);
        }
        function callback(error) {
            const result = error ? this.status.E_FAILED(error) : this.status.OK();
            this.dispatchCallback(requestId, port, result);
        }
        if (evaluateOnPage) {
            sidebar.setExpression(expression, rootTitle, evaluateOptions, this.getExtensionOrigin(port), callback.bind(this));
            return undefined;
        }
        sidebar.setObject(message.expression, message.rootTitle, callback.bind(this));
        return undefined;
    }
    onSetSidebarPage(message, port) {
        if (message.command !== "setSidebarPage" /* PrivateAPI.Commands.SetSidebarPage */) {
            return this.status.E_BADARG('command', `expected ${"setSidebarPage" /* PrivateAPI.Commands.SetSidebarPage */}`);
        }
        const sidebar = this.clientObjects.get(message.id);
        if (!sidebar || !(sidebar instanceof ExtensionSidebarPane)) {
            return this.status.E_NOTFOUND(message.id);
        }
        const resourcePath = ExtensionServer.expandResourcePath(this.getExtensionOrigin(port), message.page);
        if (resourcePath === undefined) {
            return this.status.E_BADARG('page', 'Resources paths cannot point to non-extension resources');
        }
        sidebar.setPage(resourcePath);
        return undefined;
    }
    onOpenResource(message) {
        if (message.command !== "openResource" /* PrivateAPI.Commands.OpenResource */) {
            return this.status.E_BADARG('command', `expected ${"openResource" /* PrivateAPI.Commands.OpenResource */}`);
        }
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(message.url);
        if (uiSourceCode) {
            void Common.Revealer.reveal(uiSourceCode.uiLocation(message.lineNumber, message.columnNumber));
            return this.status.OK();
        }
        const resource = Bindings.ResourceUtils.resourceForURL(message.url);
        if (resource) {
            void Common.Revealer.reveal(resource);
            return this.status.OK();
        }
        const request = Logs.NetworkLog.NetworkLog.instance().requestForURL(message.url);
        if (request) {
            void Common.Revealer.reveal(request);
            return this.status.OK();
        }
        return this.status.E_NOTFOUND(message.url);
    }
    onSetOpenResourceHandler(message, port) {
        if (message.command !== "setOpenResourceHandler" /* PrivateAPI.Commands.SetOpenResourceHandler */) {
            return this.status.E_BADARG('command', `expected ${"setOpenResourceHandler" /* PrivateAPI.Commands.SetOpenResourceHandler */}`);
        }
        const extension = this.registeredExtensions.get(this.getExtensionOrigin(port));
        if (!extension) {
            throw new Error('Received a message from an unregistered extension');
        }
        const { name } = extension;
        if (message.handlerPresent) {
            Components.Linkifier.Linkifier.registerLinkHandler(name, this.handleOpenURL.bind(this, port));
        }
        else {
            Components.Linkifier.Linkifier.unregisterLinkHandler(name);
        }
        return undefined;
    }
    onSetThemeChangeHandler(message, port) {
        if (message.command !== "setThemeChangeHandler" /* PrivateAPI.Commands.SetThemeChangeHandler */) {
            return this.status.E_BADARG('command', `expected ${"setThemeChangeHandler" /* PrivateAPI.Commands.SetThemeChangeHandler */}`);
        }
        const extensionOrigin = this.getExtensionOrigin(port);
        const extension = this.registeredExtensions.get(extensionOrigin);
        if (!extension) {
            throw new Error('Received a message from an unregistered extension');
        }
        if (message.handlerPresent) {
            this.themeChangeHandlers.set(extensionOrigin, port);
        }
        else {
            this.themeChangeHandlers.delete(extensionOrigin);
        }
        return undefined;
    }
    handleOpenURL(port, contentProvider, lineNumber) {
        port.postMessage({ command: 'open-resource', resource: this.makeResource(contentProvider), lineNumber: lineNumber + 1 });
    }
    extensionAllowedOnURL(url, port) {
        const origin = extensionOrigins.get(port);
        const extension = origin && this.registeredExtensions.get(origin);
        return Boolean(extension?.isAllowedOnTarget(url));
    }
    extensionAllowedOnTarget(target, port) {
        return this.extensionAllowedOnURL(target.inspectedURL(), port);
    }
    onReload(message, port) {
        if (message.command !== "Reload" /* PrivateAPI.Commands.Reload */) {
            return this.status.E_BADARG('command', `expected ${"Reload" /* PrivateAPI.Commands.Reload */}`);
        }
        const options = (message.options || {});
        SDK.NetworkManager.MultitargetNetworkManager.instance().setUserAgentOverride(typeof options.userAgent === 'string' ? options.userAgent : '', null);
        let injectedScript;
        if (options.injectedScript) {
            injectedScript = '(function(){' + options.injectedScript + '})()';
        }
        const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!target) {
            return this.status.OK();
        }
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!this.extensionAllowedOnTarget(target, port)) {
            return this.status.E_FAILED('Permission denied');
        }
        resourceTreeModel?.reloadPage(Boolean(options.ignoreCache), injectedScript);
        return this.status.OK();
    }
    onEvaluateOnInspectedPage(message, port) {
        if (message.command !== "evaluateOnInspectedPage" /* PrivateAPI.Commands.EvaluateOnInspectedPage */) {
            return this.status.E_BADARG('command', `expected ${"evaluateOnInspectedPage" /* PrivateAPI.Commands.EvaluateOnInspectedPage */}`);
        }
        const { requestId, expression, evaluateOptions } = message;
        function callback(error, object, wasThrown) {
            let result;
            if (error || !object) {
                result = this.status.E_PROTOCOLERROR(error?.toString());
            }
            else if (wasThrown) {
                result = { isException: true, value: object.description };
            }
            else {
                result = { value: object.value };
            }
            this.dispatchCallback(requestId, port, result);
        }
        return this.evaluate(expression, true, true, evaluateOptions, this.getExtensionOrigin(port), callback.bind(this));
    }
    async onGetHAR(message, port) {
        if (message.command !== "getHAR" /* PrivateAPI.Commands.GetHAR */) {
            return this.status.E_BADARG('command', `expected ${"getHAR" /* PrivateAPI.Commands.GetHAR */}`);
        }
        const requests = Logs.NetworkLog.NetworkLog.instance().requests().filter(r => this.extensionAllowedOnURL(r.url(), port));
        const harLog = await HAR.Log.Log.build(requests);
        for (let i = 0; i < harLog.entries.length; ++i) {
            // @ts-ignore
            harLog.entries[i]._requestId = this.requestId(requests[i]);
        }
        return harLog;
    }
    makeResource(contentProvider) {
        return { url: contentProvider.contentURL(), type: contentProvider.contentType().name() };
    }
    onGetPageResources(_message, port) {
        const resources = new Map();
        function pushResourceData(contentProvider) {
            if (!resources.has(contentProvider.contentURL())) {
                resources.set(contentProvider.contentURL(), this.makeResource(contentProvider));
            }
            return false;
        }
        let uiSourceCodes = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodesForProjectType(Workspace.Workspace.projectTypes.Network);
        uiSourceCodes = uiSourceCodes.concat(Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodesForProjectType(Workspace.Workspace.projectTypes.ContentScripts));
        uiSourceCodes.forEach(pushResourceData.bind(this));
        for (const resourceTreeModel of SDK.TargetManager.TargetManager.instance().models(SDK.ResourceTreeModel.ResourceTreeModel)) {
            if (this.extensionAllowedOnTarget(resourceTreeModel.target(), port)) {
                resourceTreeModel.forAllResources(pushResourceData.bind(this));
            }
        }
        return [...resources.values()];
    }
    async getResourceContent(contentProvider, message, port) {
        if (!this.extensionAllowedOnURL(contentProvider.contentURL(), port)) {
            this.dispatchCallback(message.requestId, port, this.status.E_FAILED('Permission denied'));
            return undefined;
        }
        const { content, isEncoded } = await contentProvider.requestContent();
        this.dispatchCallback(message.requestId, port, { encoding: isEncoded ? 'base64' : '', content: content });
    }
    onGetRequestContent(message, port) {
        if (message.command !== "getRequestContent" /* PrivateAPI.Commands.GetRequestContent */) {
            return this.status.E_BADARG('command', `expected ${"getRequestContent" /* PrivateAPI.Commands.GetRequestContent */}`);
        }
        const request = this.requestById(message.id);
        if (!request) {
            return this.status.E_NOTFOUND(message.id);
        }
        void this.getResourceContent(request, message, port);
        return undefined;
    }
    onGetResourceContent(message, port) {
        if (message.command !== "getResourceContent" /* PrivateAPI.Commands.GetResourceContent */) {
            return this.status.E_BADARG('command', `expected ${"getResourceContent" /* PrivateAPI.Commands.GetResourceContent */}`);
        }
        const url = message.url;
        const contentProvider = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(url) ||
            Bindings.ResourceUtils.resourceForURL(url);
        if (!contentProvider) {
            return this.status.E_NOTFOUND(url);
        }
        void this.getResourceContent(contentProvider, message, port);
        return undefined;
    }
    onSetResourceContent(message, port) {
        if (message.command !== "setResourceContent" /* PrivateAPI.Commands.SetResourceContent */) {
            return this.status.E_BADARG('command', `expected ${"setResourceContent" /* PrivateAPI.Commands.SetResourceContent */}`);
        }
        const { url, requestId, content, commit } = message;
        function callbackWrapper(error) {
            const response = error ? this.status.E_FAILED(error) : this.status.OK();
            this.dispatchCallback(requestId, port, response);
        }
        if (!this.extensionAllowedOnURL(url, port)) {
            return this.status.E_FAILED('Permission denied');
        }
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(url);
        if (!uiSourceCode || !uiSourceCode.contentType().isDocumentOrScriptOrStyleSheet()) {
            const resource = SDK.ResourceTreeModel.ResourceTreeModel.resourceForURL(url);
            if (!resource) {
                return this.status.E_NOTFOUND(url);
            }
            return this.status.E_NOTSUPPORTED('Resource is not editable');
        }
        uiSourceCode.setWorkingCopy(content);
        if (commit) {
            uiSourceCode.commitWorkingCopy();
        }
        callbackWrapper.call(this, null);
        return undefined;
    }
    requestId(request) {
        const requestId = this.requestIds.get(request);
        if (requestId === undefined) {
            const newId = ++this.lastRequestId;
            this.requestIds.set(request, newId);
            this.requests.set(newId, request);
            return newId;
        }
        return requestId;
    }
    requestById(id) {
        return this.requests.get(id);
    }
    onForwardKeyboardEvent(message) {
        if (message.command !== "_forwardKeyboardEvent" /* PrivateAPI.Commands.ForwardKeyboardEvent */) {
            return this.status.E_BADARG('command', `expected ${"_forwardKeyboardEvent" /* PrivateAPI.Commands.ForwardKeyboardEvent */}`);
        }
        message.entries.forEach(handleEventEntry);
        function handleEventEntry(entry) {
            // Fool around closure compiler -- it has its own notion of both KeyboardEvent constructor
            // and initKeyboardEvent methods and overriding these in externs.js does not have effect.
            const event = new window.KeyboardEvent(entry.eventType, {
                key: entry.key,
                code: entry.code,
                keyCode: entry.keyCode,
                location: entry.location,
                ctrlKey: entry.ctrlKey,
                altKey: entry.altKey,
                shiftKey: entry.shiftKey,
                metaKey: entry.metaKey,
            });
            // @ts-ignore
            event.__keyCode = keyCodeForEntry(entry);
            document.dispatchEvent(event);
        }
        function keyCodeForEntry(entry) {
            let keyCode = entry.keyCode;
            if (!keyCode) {
                // This is required only for synthetic events (e.g. dispatched in tests).
                if (entry.key === Platform.KeyboardUtilities.ESCAPE_KEY) {
                    keyCode = 27;
                }
            }
            return keyCode || 0;
        }
        return undefined;
    }
    dispatchCallback(requestId, port, result) {
        if (requestId) {
            port.postMessage({ command: 'callback', requestId: requestId, result: result });
        }
    }
    initExtensions() {
        this.registerAutosubscriptionHandler("resource-added" /* PrivateAPI.Events.ResourceAdded */, Workspace.Workspace.WorkspaceImpl.instance(), Workspace.Workspace.Events.UISourceCodeAdded, this.notifyResourceAdded);
        this.registerAutosubscriptionTargetManagerHandler("network-request-finished" /* PrivateAPI.Events.NetworkRequestFinished */, SDK.NetworkManager.NetworkManager, SDK.NetworkManager.Events.RequestFinished, this.notifyRequestFinished);
        function onElementsSubscriptionStarted() {
            UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, this.notifyElementsSelectionChanged, this);
        }
        function onElementsSubscriptionStopped() {
            UI.Context.Context.instance().removeFlavorChangeListener(SDK.DOMModel.DOMNode, this.notifyElementsSelectionChanged, this);
        }
        this.registerSubscriptionHandler("panel-objectSelected-" /* PrivateAPI.Events.PanelObjectSelected */ + 'elements', onElementsSubscriptionStarted.bind(this), onElementsSubscriptionStopped.bind(this));
        this.registerResourceContentCommittedHandler(this.notifyUISourceCodeContentCommitted);
        SDK.TargetManager.TargetManager.instance().addEventListener("InspectedURLChanged" /* SDK.TargetManager.Events.InspectedURLChanged */, this.inspectedURLChanged, this);
    }
    notifyResourceAdded(event) {
        const uiSourceCode = event.data;
        this.postNotification("resource-added" /* PrivateAPI.Events.ResourceAdded */, this.makeResource(uiSourceCode));
    }
    notifyUISourceCodeContentCommitted(event) {
        const { uiSourceCode, content } = event.data;
        this.postNotification("resource-content-committed" /* PrivateAPI.Events.ResourceContentCommitted */, this.makeResource(uiSourceCode), content);
    }
    async notifyRequestFinished(event) {
        const request = event.data;
        const entry = await HAR.Log.Entry.build(request);
        this.postNotification("network-request-finished" /* PrivateAPI.Events.NetworkRequestFinished */, this.requestId(request), entry);
    }
    notifyElementsSelectionChanged() {
        this.postNotification("panel-objectSelected-" /* PrivateAPI.Events.PanelObjectSelected */ + 'elements');
    }
    sourceSelectionChanged(url, range) {
        this.postNotification("panel-objectSelected-" /* PrivateAPI.Events.PanelObjectSelected */ + 'sources', {
            startLine: range.startLine,
            startColumn: range.startColumn,
            endLine: range.endLine,
            endColumn: range.endColumn,
            url: url,
        });
    }
    setInspectedTabId(event) {
        const oldId = this.inspectedTabId;
        this.inspectedTabId = event.data;
        if (oldId === null) {
            // Run deferred init
            this.initializeExtensions();
        }
    }
    addExtensionFrame({ startPage, name }) {
        const iframe = document.createElement('iframe');
        iframe.src = startPage;
        iframe.dataset.devtoolsExtension = name;
        iframe.style.display = 'none';
        document.body.appendChild(iframe); // Only for main window.
    }
    addExtension(extensionInfo) {
        const startPage = extensionInfo.startPage;
        const inspectedURL = SDK.TargetManager.TargetManager.instance().primaryPageTarget()?.inspectedURL() ?? '';
        if (inspectedURL === '') {
            this.#pendingExtensions.push(extensionInfo);
            return;
        }
        if (!ExtensionServer.canInspectURL(inspectedURL)) {
            this.disableExtensions();
        }
        if (!this.extensionsEnabled) {
            this.#pendingExtensions.push(extensionInfo);
            return;
        }
        const hostsPolicy = HostsPolicy.create(extensionInfo.hostsPolicy);
        if (!hostsPolicy) {
            return;
        }
        try {
            const startPageURL = new URL(startPage);
            const extensionOrigin = startPageURL.origin;
            const name = extensionInfo.name || `Extension ${extensionOrigin}`;
            const extensionRegistration = new RegisteredExtension(name, hostsPolicy, Boolean(extensionInfo.allowFileAccess));
            if (!extensionRegistration.isAllowedOnTarget(inspectedURL)) {
                this.#pendingExtensions.push(extensionInfo);
                return;
            }
            if (!this.registeredExtensions.get(extensionOrigin)) {
                // See ExtensionAPI.js for details.
                const injectedAPI = self.buildExtensionAPIInjectedScript(extensionInfo, this.inspectedTabId, ThemeSupport.ThemeSupport.instance().themeName(), UI.ShortcutRegistry.ShortcutRegistry.instance().globalShortcutKeys(), ExtensionServer.instance().extensionAPITestHook);
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.setInjectedScriptForOrigin(extensionOrigin, injectedAPI);
                this.registeredExtensions.set(extensionOrigin, extensionRegistration);
            }
            this.addExtensionFrame(extensionInfo);
        }
        catch (e) {
            console.error('Failed to initialize extension ' + startPage + ':' + e);
            return false;
        }
        return true;
    }
    registerExtension(origin, port) {
        if (!this.registeredExtensions.has(origin)) {
            if (origin !== window.location.origin) { // Just ignore inspector frames.
                console.error('Ignoring unauthorized client request from ' + origin);
            }
            return;
        }
        extensionOrigins.set(port, origin);
        port.addEventListener('message', this.onmessage.bind(this), false);
        port.start();
    }
    onWindowMessage = (event) => {
        if (event.data === 'registerExtension') {
            this.registerExtension(event.origin, event.ports[0]);
        }
    };
    extensionEnabled(port) {
        if (!this.extensionsEnabled) {
            return false;
        }
        const origin = extensionOrigins.get(port);
        if (!origin) {
            return false;
        }
        const extension = this.registeredExtensions.get(origin);
        if (!extension) {
            return false;
        }
        return extension.isAllowedOnTarget();
    }
    async onmessage(event) {
        const message = event.data;
        let result;
        const port = event.currentTarget;
        const handler = this.handlers.get(message.command);
        if (!handler) {
            result = this.status.E_NOTSUPPORTED(message.command);
        }
        else if (!this.extensionEnabled(port)) {
            result = this.status.E_FAILED('Permission denied');
        }
        else {
            result = await handler(message, event.target);
        }
        if (result && message.requestId) {
            this.dispatchCallback(message.requestId, event.target, result);
        }
    }
    registerHandler(command, callback) {
        console.assert(Boolean(command));
        this.handlers.set(command, callback);
    }
    registerSubscriptionHandler(eventTopic, onSubscribeFirst, onUnsubscribeLast) {
        this.subscriptionStartHandlers.set(eventTopic, onSubscribeFirst);
        this.subscriptionStopHandlers.set(eventTopic, onUnsubscribeLast);
    }
    registerAutosubscriptionHandler(eventTopic, eventTarget, frontendEventType, handler) {
        this.registerSubscriptionHandler(eventTopic, () => eventTarget.addEventListener(frontendEventType, handler, this), () => eventTarget.removeEventListener(frontendEventType, handler, this));
    }
    registerAutosubscriptionTargetManagerHandler(eventTopic, modelClass, frontendEventType, handler) {
        this.registerSubscriptionHandler(eventTopic, () => SDK.TargetManager.TargetManager.instance().addModelListener(modelClass, frontendEventType, handler, this), () => SDK.TargetManager.TargetManager.instance().removeModelListener(modelClass, frontendEventType, handler, this));
    }
    registerResourceContentCommittedHandler(handler) {
        function addFirstEventListener() {
            Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.WorkingCopyCommittedByUser, handler, this);
            Workspace.Workspace.WorkspaceImpl.instance().setHasResourceContentTrackingExtensions(true);
        }
        function removeLastEventListener() {
            Workspace.Workspace.WorkspaceImpl.instance().setHasResourceContentTrackingExtensions(false);
            Workspace.Workspace.WorkspaceImpl.instance().removeEventListener(Workspace.Workspace.Events.WorkingCopyCommittedByUser, handler, this);
        }
        this.registerSubscriptionHandler("resource-content-committed" /* PrivateAPI.Events.ResourceContentCommitted */, addFirstEventListener.bind(this), removeLastEventListener.bind(this));
    }
    static expandResourcePath(extensionOrigin, resourcePath) {
        const strippedOrigin = new URL(extensionOrigin).origin;
        const resourceURL = new URL(Common.ParsedURL.normalizePath(resourcePath), strippedOrigin);
        if (resourceURL.origin !== strippedOrigin) {
            return undefined;
        }
        return resourceURL.href;
    }
    evaluate(expression, exposeCommandLineAPI, returnByValue, options, securityOrigin, callback) {
        let context;
        function resolveURLToFrame(url) {
            let found = null;
            function hasMatchingURL(frame) {
                found = (frame.url === url) ? frame : null;
                return found;
            }
            SDK.ResourceTreeModel.ResourceTreeModel.frames().some(hasMatchingURL);
            return found;
        }
        options = options || {};
        let frame;
        if (options.frameURL) {
            frame = resolveURLToFrame(options.frameURL);
        }
        else {
            const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
            const resourceTreeModel = target && target.model(SDK.ResourceTreeModel.ResourceTreeModel);
            frame = resourceTreeModel && resourceTreeModel.mainFrame;
        }
        if (!frame) {
            if (options.frameURL) {
                console.warn('evaluate: there is no frame with URL ' + options.frameURL);
            }
            else {
                console.warn('evaluate: the main frame is not yet available');
            }
            return this.status.E_NOTFOUND(options.frameURL || '<top>');
        }
        // We shouldn't get here if the outermost frame can't be inspected by an extension, but
        // let's double check for subframes.
        const extension = this.registeredExtensions.get(securityOrigin);
        if (!extension?.isAllowedOnTarget(frame.url)) {
            return this.status.E_FAILED('Permission denied');
        }
        let contextSecurityOrigin;
        if (options.useContentScriptContext) {
            contextSecurityOrigin = securityOrigin;
        }
        else if (options.scriptExecutionContext) {
            contextSecurityOrigin = options.scriptExecutionContext;
        }
        const runtimeModel = frame.resourceTreeModel().target().model(SDK.RuntimeModel.RuntimeModel);
        const executionContexts = runtimeModel ? runtimeModel.executionContexts() : [];
        if (contextSecurityOrigin) {
            for (let i = 0; i < executionContexts.length; ++i) {
                const executionContext = executionContexts[i];
                if (executionContext.frameId === frame.id && executionContext.origin === contextSecurityOrigin &&
                    !executionContext.isDefault) {
                    context = executionContext;
                }
            }
            if (!context) {
                console.warn('The JavaScript context ' + contextSecurityOrigin + ' was not found in the frame ' + frame.url);
                return this.status.E_NOTFOUND(contextSecurityOrigin);
            }
        }
        else {
            for (let i = 0; i < executionContexts.length; ++i) {
                const executionContext = executionContexts[i];
                if (executionContext.frameId === frame.id && executionContext.isDefault) {
                    context = executionContext;
                }
            }
            if (!context) {
                return this.status.E_FAILED(frame.url + ' has no execution context');
            }
        }
        if (!extension?.isAllowedOnTarget(context.origin)) {
            return this.status.E_FAILED('Permission denied');
        }
        void context
            .evaluate({
            expression: expression,
            objectGroup: 'extension',
            includeCommandLineAPI: exposeCommandLineAPI,
            silent: true,
            returnByValue: returnByValue,
            generatePreview: false,
        }, 
        /* userGesture */ false, /* awaitPromise */ false)
            .then(onEvaluate);
        function onEvaluate(result) {
            if ('error' in result) {
                callback(result.error, null, false);
                return;
            }
            callback(null, result.object || null, Boolean(result.exceptionDetails));
        }
        return undefined;
    }
    static canInspectURL(url) {
        let parsedURL;
        // This is only to work around invalid URLs we're occasionally getting from some tests.
        // TODO(caseq): make sure tests supply valid URLs or we specifically handle invalid ones.
        try {
            parsedURL = new URL(url);
        }
        catch (exception) {
            return false;
        }
        if (kAllowedOrigins.includes(parsedURL.origin)) {
            return true;
        }
        if (parsedURL.protocol === 'chrome:' || parsedURL.protocol === 'devtools:' ||
            parsedURL.protocol === 'chrome-untrusted:' || parsedURL.protocol === 'chrome-error:' ||
            parsedURL.protocol === 'chrome-search:') {
            return false;
        }
        if (parsedURL.protocol.startsWith('http') && parsedURL.hostname.match(/^chrome\.google\.com\.?$/) &&
            parsedURL.pathname.startsWith('/webstore')) {
            return false;
        }
        if (parsedURL.protocol.startsWith('http') && parsedURL.hostname.match(/^chromewebstore\.google\.com\.?$/)) {
            return false;
        }
        if ((window.DevToolsAPI && window.DevToolsAPI.getOriginsForbiddenForExtensions &&
            window.DevToolsAPI.getOriginsForbiddenForExtensions() ||
            []).includes(parsedURL.origin)) {
            return false;
        }
        return true;
    }
    disableExtensions() {
        this.extensionsEnabled = false;
    }
    enableExtensions() {
        this.extensionsEnabled = true;
    }
}
class ExtensionServerPanelView extends UI.View.SimpleView {
    name;
    panel;
    constructor(name, title, panel) {
        super(title);
        this.name = name;
        this.panel = panel;
    }
    viewId() {
        return this.name;
    }
    widget() {
        return Promise.resolve(this.panel);
    }
}
export class ExtensionStatus {
    OK;
    E_EXISTS;
    E_BADARG;
    E_BADARGTYPE;
    E_NOTFOUND;
    E_NOTSUPPORTED;
    E_PROTOCOLERROR;
    E_FAILED;
    constructor() {
        function makeStatus(code, description, ...details) {
            const status = { code, description, details };
            if (code !== 'OK') {
                status.isError = true;
                console.error('Extension server error: ' + Platform.StringUtilities.sprintf(description, ...details));
            }
            return status;
        }
        this.OK = makeStatus.bind(null, 'OK', 'OK');
        this.E_EXISTS = makeStatus.bind(null, 'E_EXISTS', 'Object already exists: %s');
        this.E_BADARG = makeStatus.bind(null, 'E_BADARG', 'Invalid argument %s: %s');
        this.E_BADARGTYPE = makeStatus.bind(null, 'E_BADARGTYPE', 'Invalid type for argument %s: got %s, expected %s');
        this.E_NOTFOUND = makeStatus.bind(null, 'E_NOTFOUND', 'Object not found: %s');
        this.E_NOTSUPPORTED = makeStatus.bind(null, 'E_NOTSUPPORTED', 'Object does not support requested operation: %s');
        this.E_PROTOCOLERROR = makeStatus.bind(null, 'E_PROTOCOLERROR', 'Inspector protocol error: %s');
        this.E_FAILED = makeStatus.bind(null, 'E_FAILED', 'Operation failed: %s');
    }
}
//# sourceMappingURL=ExtensionServer.js.map