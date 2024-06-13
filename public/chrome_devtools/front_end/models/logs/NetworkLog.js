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
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
const UIStrings = {
    /**
     * @description When DevTools doesn't know the URL that initiated a network request, we
     * show this phrase instead. 'unknown' would also work in this context.
     */
    anonymous: '<anonymous>',
};
const str_ = i18n.i18n.registerUIStrings('models/logs/NetworkLog.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let networkLogInstance;
export class NetworkLog extends Common.ObjectWrapper.ObjectWrapper {
    requestsInternal;
    sentNetworkRequests;
    receivedNetworkResponses;
    requestsSet;
    requestsMap;
    pageLoadForManager;
    isRecording;
    modelListeners;
    initiatorData;
    unresolvedPreflightRequests;
    constructor() {
        super();
        this.requestsInternal = [];
        this.sentNetworkRequests = [];
        this.receivedNetworkResponses = [];
        this.requestsSet = new Set();
        this.requestsMap = new Map();
        this.pageLoadForManager = new Map();
        this.isRecording = true;
        this.modelListeners = new WeakMap();
        this.initiatorData = new WeakMap();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.NetworkManager.NetworkManager, this);
        const recordLogSetting = Common.Settings.Settings.instance().moduleSetting('network-log.record-log');
        recordLogSetting.addChangeListener(() => {
            const preserveLogSetting = Common.Settings.Settings.instance().moduleSetting('network-log.preserve-log');
            if (!preserveLogSetting.get() && recordLogSetting.get()) {
                this.reset(true);
            }
            this.setIsRecording(recordLogSetting.get());
        }, this);
        this.unresolvedPreflightRequests = new Map();
    }
    static instance() {
        if (!networkLogInstance) {
            networkLogInstance = new NetworkLog();
        }
        return networkLogInstance;
    }
    static removeInstance() {
        networkLogInstance = undefined;
    }
    modelAdded(networkManager) {
        const eventListeners = [];
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.RequestStarted, this.onRequestStarted, this));
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.RequestUpdated, this.onRequestUpdated, this));
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.RequestRedirected, this.onRequestRedirect, this));
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.RequestFinished, this.onRequestUpdated, this));
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.MessageGenerated, this.networkMessageGenerated.bind(this, networkManager)));
        eventListeners.push(networkManager.addEventListener(SDK.NetworkManager.Events.ResponseReceived, this.onResponseReceived, this));
        const resourceTreeModel = networkManager.target().model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (resourceTreeModel) {
            eventListeners.push(resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.WillReloadPage, this.willReloadPage, this));
            eventListeners.push(resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.PrimaryPageChanged, this.onPrimaryPageChanged, this));
            eventListeners.push(resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.Load, this.onLoad, this));
            eventListeners.push(resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded, this.onDOMContentLoaded.bind(this, resourceTreeModel)));
        }
        this.modelListeners.set(networkManager, eventListeners);
    }
    modelRemoved(networkManager) {
        this.removeNetworkManagerListeners(networkManager);
    }
    removeNetworkManagerListeners(networkManager) {
        Common.EventTarget.removeEventListeners(this.modelListeners.get(networkManager) || []);
    }
    setIsRecording(enabled) {
        if (this.isRecording === enabled) {
            return;
        }
        this.isRecording = enabled;
        if (enabled) {
            SDK.TargetManager.TargetManager.instance().observeModels(SDK.NetworkManager.NetworkManager, this);
        }
        else {
            SDK.TargetManager.TargetManager.instance().unobserveModels(SDK.NetworkManager.NetworkManager, this);
            SDK.TargetManager.TargetManager.instance()
                .models(SDK.NetworkManager.NetworkManager)
                .forEach(this.removeNetworkManagerListeners.bind(this));
        }
    }
    requestForURL(url) {
        return this.requestsInternal.find(request => request.url() === url) || null;
    }
    originalRequestForURL(url) {
        return this.sentNetworkRequests.find(request => request.url === url) || null;
    }
    originalResponseForURL(url) {
        return this.receivedNetworkResponses.find(response => response.url === url) || null;
    }
    requests() {
        return this.requestsInternal;
    }
    requestByManagerAndId(networkManager, requestId) {
        // We iterate backwards because the last item will likely be the one needed for console network request lookups.
        for (let i = this.requestsInternal.length - 1; i >= 0; i--) {
            const request = this.requestsInternal[i];
            if (requestId === request.requestId() &&
                networkManager === SDK.NetworkManager.NetworkManager.forRequest(request)) {
                return request;
            }
        }
        return null;
    }
    requestByManagerAndURL(networkManager, url) {
        for (const request of this.requestsInternal) {
            if (url === request.url() && networkManager === SDK.NetworkManager.NetworkManager.forRequest(request)) {
                return request;
            }
        }
        return null;
    }
    initializeInitiatorSymbolIfNeeded(request) {
        let initiatorInfo = this.initiatorData.get(request);
        if (initiatorInfo) {
            return initiatorInfo;
        }
        initiatorInfo = {
            info: null,
            chain: null,
            request: undefined,
        };
        this.initiatorData.set(request, initiatorInfo);
        return initiatorInfo;
    }
    static initiatorInfoForRequest(request, existingInitiatorData) {
        const initiatorInfo = existingInitiatorData || {
            info: null,
            chain: null,
            request: undefined,
        };
        let type = "other" /* SDK.NetworkRequest.InitiatorType.Other */;
        let url = Platform.DevToolsPath.EmptyUrlString;
        let lineNumber = undefined;
        let columnNumber = undefined;
        let scriptId = null;
        let initiatorStack = null;
        let initiatorRequest = null;
        const initiator = request.initiator();
        const redirectSource = request.redirectSource();
        if (redirectSource) {
            type = "redirect" /* SDK.NetworkRequest.InitiatorType.Redirect */;
            url = redirectSource.url();
        }
        else if (initiator) {
            if (initiator.type === "parser" /* Protocol.Network.InitiatorType.Parser */) {
                type = "parser" /* SDK.NetworkRequest.InitiatorType.Parser */;
                url = initiator.url ? initiator.url : url;
                lineNumber = initiator.lineNumber;
                columnNumber = initiator.columnNumber;
            }
            else if (initiator.type === "script" /* Protocol.Network.InitiatorType.Script */) {
                for (let stack = initiator.stack; stack;) {
                    const topFrame = stack.callFrames.length ? stack.callFrames[0] : null;
                    if (!topFrame) {
                        stack = stack.parent;
                        continue;
                    }
                    type = "script" /* SDK.NetworkRequest.InitiatorType.Script */;
                    url = (topFrame.url || i18nString(UIStrings.anonymous));
                    lineNumber = topFrame.lineNumber;
                    columnNumber = topFrame.columnNumber;
                    scriptId = topFrame.scriptId;
                    break;
                }
                if (!initiator.stack && initiator.url) {
                    type = "script" /* SDK.NetworkRequest.InitiatorType.Script */;
                    url = initiator.url;
                    lineNumber = initiator.lineNumber;
                }
                if (initiator.stack?.callFrames?.length) {
                    initiatorStack = initiator.stack;
                }
            }
            else if (initiator.type === "preload" /* Protocol.Network.InitiatorType.Preload */) {
                type = "preload" /* SDK.NetworkRequest.InitiatorType.Preload */;
            }
            else if (initiator.type === "preflight" /* Protocol.Network.InitiatorType.Preflight */) {
                type = "preflight" /* SDK.NetworkRequest.InitiatorType.Preflight */;
                initiatorRequest = request.preflightInitiatorRequest();
            }
            else if (initiator.type === "SignedExchange" /* Protocol.Network.InitiatorType.SignedExchange */) {
                type = "signedExchange" /* SDK.NetworkRequest.InitiatorType.SignedExchange */;
                url = initiator.url || Platform.DevToolsPath.EmptyUrlString;
            }
        }
        initiatorInfo.info = { type, url, lineNumber, columnNumber, scriptId, stack: initiatorStack, initiatorRequest };
        return initiatorInfo.info;
    }
    initiatorInfoForRequest(request) {
        const initiatorInfo = this.initializeInitiatorSymbolIfNeeded(request);
        if (initiatorInfo.info) {
            return initiatorInfo.info;
        }
        return NetworkLog.initiatorInfoForRequest(request, initiatorInfo);
    }
    initiatorGraphForRequest(request) {
        const initiated = new Map();
        const networkManager = SDK.NetworkManager.NetworkManager.forRequest(request);
        for (const otherRequest of this.requestsInternal) {
            const otherRequestManager = SDK.NetworkManager.NetworkManager.forRequest(otherRequest);
            if (networkManager === otherRequestManager && this.initiatorChain(otherRequest).has(request)) {
                // save parent request of otherRequst in order to build the initiator chain table later
                const initiatorRequest = this.initiatorRequest(otherRequest);
                if (initiatorRequest) {
                    initiated.set(otherRequest, initiatorRequest);
                }
            }
        }
        return { initiators: this.initiatorChain(request), initiated: initiated };
    }
    initiatorChain(request) {
        const initiatorDataForRequest = this.initializeInitiatorSymbolIfNeeded(request);
        let initiatorChainCache = initiatorDataForRequest.chain;
        if (initiatorChainCache) {
            return initiatorChainCache;
        }
        initiatorChainCache = new Set();
        let checkRequest = request;
        while (checkRequest) {
            const initiatorData = this.initializeInitiatorSymbolIfNeeded(checkRequest);
            if (initiatorData.chain) {
                Platform.SetUtilities.addAll(initiatorChainCache, initiatorData.chain);
                break;
            }
            if (initiatorChainCache.has(checkRequest)) {
                break;
            }
            initiatorChainCache.add(checkRequest);
            checkRequest = this.initiatorRequest(checkRequest);
        }
        initiatorDataForRequest.chain = initiatorChainCache;
        return initiatorChainCache;
    }
    initiatorRequest(request) {
        const initiatorData = this.initializeInitiatorSymbolIfNeeded(request);
        if (initiatorData.request !== undefined) {
            return initiatorData.request;
        }
        const url = this.initiatorInfoForRequest(request).url;
        const networkManager = SDK.NetworkManager.NetworkManager.forRequest(request);
        initiatorData.request = networkManager ? this.requestByManagerAndURL(networkManager, url) : null;
        return initiatorData.request;
    }
    willReloadPage() {
        if (!Common.Settings.Settings.instance().moduleSetting('network-log.preserve-log').get()) {
            this.reset(true);
        }
    }
    onPrimaryPageChanged(event) {
        const mainFrame = event.data.frame;
        const manager = mainFrame.resourceTreeModel().target().model(SDK.NetworkManager.NetworkManager);
        if (!manager || mainFrame.resourceTreeModel().target().parentTarget()?.type() === SDK.Target.Type.Frame) {
            return;
        }
        // If a page resulted in an error, the browser will navigate to an internal error page
        // hosted at 'chrome-error://...'. In this case, skip the frame navigated event to preserve
        // the network log.
        if (mainFrame.url !== mainFrame.unreachableUrl() && Common.ParsedURL.schemeIs(mainFrame.url, 'chrome-error:')) {
            return;
        }
        const preserveLog = Common.Settings.Settings.instance().moduleSetting('network-log.preserve-log').get();
        const oldRequests = this.requestsInternal;
        const oldManagerRequests = this.requestsInternal.filter(request => SDK.NetworkManager.NetworkManager.forRequest(request) === manager);
        const oldRequestsSet = this.requestsSet;
        this.requestsInternal = [];
        this.sentNetworkRequests = [];
        this.receivedNetworkResponses = [];
        this.requestsSet = new Set();
        this.requestsMap.clear();
        this.unresolvedPreflightRequests.clear();
        this.dispatchEventToListeners(Events.Reset, { clearIfPreserved: !preserveLog });
        // Preserve requests from the new session.
        let currentPageLoad = null;
        const requestsToAdd = [];
        for (const request of oldManagerRequests) {
            if (event.data.type !== "Activation" /* SDK.ResourceTreeModel.PrimaryPageChangeType.Activation */ &&
                request.loaderId !== mainFrame.loaderId) {
                continue;
            }
            if (!currentPageLoad) {
                currentPageLoad = new SDK.PageLoad.PageLoad(request);
                let redirectSource = request.redirectSource();
                while (redirectSource) {
                    requestsToAdd.push(redirectSource);
                    redirectSource = redirectSource.redirectSource();
                }
            }
            requestsToAdd.push(request);
        }
        // Preserve service worker requests from the new session.
        const serviceWorkerRequestsToAdd = [];
        for (const swRequest of oldRequests) {
            if (!swRequest.initiatedByServiceWorker()) {
                continue;
            }
            // If there is a matching request that came before this one, keep it.
            const keepRequest = requestsToAdd.some(request => request.url() === swRequest.url() && request.issueTime() <= swRequest.issueTime());
            if (keepRequest) {
                serviceWorkerRequestsToAdd.push(swRequest);
            }
        }
        requestsToAdd.push(...serviceWorkerRequestsToAdd);
        for (const request of requestsToAdd) {
            currentPageLoad?.bindRequest(request);
            oldRequestsSet.delete(request);
            this.addRequest(request);
        }
        if (preserveLog) {
            for (const request of oldRequestsSet) {
                this.addRequest(request, true);
                request.preserved = true;
            }
        }
        if (currentPageLoad) {
            this.pageLoadForManager.set(manager, currentPageLoad);
        }
    }
    addRequest(request, preserveLog) {
        this.requestsInternal.push(request);
        this.requestsSet.add(request);
        const requestList = this.requestsMap.get(request.requestId());
        if (!requestList) {
            this.requestsMap.set(request.requestId(), [request]);
        }
        else {
            requestList.push(request);
        }
        this.tryResolvePreflightRequests(request);
        this.dispatchEventToListeners(Events.RequestAdded, { request, preserveLog });
    }
    removeRequest(request) {
        const index = this.requestsInternal.indexOf(request);
        if (index > -1) {
            this.requestsInternal.splice(index, 1);
        }
        this.requestsSet.delete(request);
        this.requestsMap.delete(request.requestId());
        this.dispatchEventToListeners(Events.RequestRemoved, { request });
    }
    tryResolvePreflightRequests(request) {
        if (request.isPreflightRequest()) {
            const initiator = request.initiator();
            if (initiator && initiator.requestId) {
                const [initiatorRequest] = this.requestsForId(initiator.requestId);
                if (initiatorRequest) {
                    request.setPreflightInitiatorRequest(initiatorRequest);
                    initiatorRequest.setPreflightRequest(request);
                }
                else {
                    this.unresolvedPreflightRequests.set(initiator.requestId, request);
                }
            }
        }
        else {
            const preflightRequest = this.unresolvedPreflightRequests.get(request.requestId());
            if (preflightRequest) {
                this.unresolvedPreflightRequests.delete(request.requestId());
                request.setPreflightRequest(preflightRequest);
                preflightRequest.setPreflightInitiatorRequest(request);
                // Force recomputation of initiator info, if it already exists.
                const data = this.initiatorData.get(preflightRequest);
                if (data) {
                    data.info = null;
                }
                this.dispatchEventToListeners(Events.RequestUpdated, { request: preflightRequest });
            }
        }
    }
    importRequests(requests) {
        this.reset(true);
        this.requestsInternal = [];
        this.sentNetworkRequests = [];
        this.receivedNetworkResponses = [];
        this.requestsSet.clear();
        this.requestsMap.clear();
        this.unresolvedPreflightRequests.clear();
        for (const request of requests) {
            this.addRequest(request);
        }
    }
    onRequestStarted(event) {
        const { request, originalRequest } = event.data;
        if (originalRequest) {
            this.sentNetworkRequests.push(originalRequest);
        }
        this.requestsSet.add(request);
        const manager = SDK.NetworkManager.NetworkManager.forRequest(request);
        const pageLoad = manager ? this.pageLoadForManager.get(manager) : null;
        if (pageLoad) {
            pageLoad.bindRequest(request);
        }
        this.addRequest(request);
    }
    onResponseReceived(event) {
        const response = event.data.response;
        this.receivedNetworkResponses.push(response);
    }
    onRequestUpdated(event) {
        const request = event.data;
        if (!this.requestsSet.has(request)) {
            return;
        }
        // This is only triggered in an edge case in which Chrome reports 2 preflight requests. The
        // first preflight gets aborted and should not be shown in DevTools.
        // (see https://crbug.com/1290390 for details)
        if (request.isPreflightRequest() &&
            request.corsErrorStatus()?.corsError === "UnexpectedPrivateNetworkAccess" /* Protocol.Network.CorsError.UnexpectedPrivateNetworkAccess */) {
            this.removeRequest(request);
            return;
        }
        this.dispatchEventToListeners(Events.RequestUpdated, { request });
    }
    onRequestRedirect(event) {
        this.initiatorData.delete(event.data);
    }
    onDOMContentLoaded(resourceTreeModel, event) {
        const networkManager = resourceTreeModel.target().model(SDK.NetworkManager.NetworkManager);
        const pageLoad = networkManager ? this.pageLoadForManager.get(networkManager) : null;
        if (pageLoad) {
            pageLoad.contentLoadTime = event.data;
        }
    }
    onLoad(event) {
        const networkManager = event.data.resourceTreeModel.target().model(SDK.NetworkManager.NetworkManager);
        const pageLoad = networkManager ? this.pageLoadForManager.get(networkManager) : null;
        if (pageLoad) {
            pageLoad.loadTime = event.data.loadTime;
        }
    }
    reset(clearIfPreserved) {
        this.requestsInternal = [];
        this.sentNetworkRequests = [];
        this.receivedNetworkResponses = [];
        this.requestsSet.clear();
        this.requestsMap.clear();
        this.unresolvedPreflightRequests.clear();
        const managers = new Set(SDK.TargetManager.TargetManager.instance().models(SDK.NetworkManager.NetworkManager));
        for (const manager of this.pageLoadForManager.keys()) {
            if (!managers.has(manager)) {
                this.pageLoadForManager.delete(manager);
            }
        }
        this.dispatchEventToListeners(Events.Reset, { clearIfPreserved });
    }
    networkMessageGenerated(networkManager, event) {
        const { message, warning, requestId } = event.data;
        const consoleMessage = new SDK.ConsoleModel.ConsoleMessage(networkManager.target().model(SDK.RuntimeModel.RuntimeModel), "network" /* Protocol.Log.LogEntrySource.Network */, warning ? "warning" /* Protocol.Log.LogEntryLevel.Warning */ : "info" /* Protocol.Log.LogEntryLevel.Info */, message);
        this.associateConsoleMessageWithRequest(consoleMessage, requestId);
        networkManager.target().model(SDK.ConsoleModel.ConsoleModel)?.addMessage(consoleMessage);
    }
    associateConsoleMessageWithRequest(consoleMessage, requestId) {
        const target = consoleMessage.target();
        const networkManager = target ? target.model(SDK.NetworkManager.NetworkManager) : null;
        if (!networkManager) {
            return;
        }
        const request = this.requestByManagerAndId(networkManager, requestId);
        if (!request) {
            return;
        }
        consoleMessageToRequest.set(consoleMessage, request);
        const initiator = request.initiator();
        if (initiator) {
            consoleMessage.stackTrace = initiator.stack || undefined;
            if (initiator.url) {
                consoleMessage.url = initiator.url;
                consoleMessage.line = initiator.lineNumber || 0;
            }
        }
    }
    static requestForConsoleMessage(consoleMessage) {
        return consoleMessageToRequest.get(consoleMessage) || null;
    }
    requestsForId(requestId) {
        return this.requestsMap.get(requestId) || [];
    }
}
const consoleMessageToRequest = new WeakMap();
export var Events;
(function (Events) {
    Events["Reset"] = "Reset";
    Events["RequestAdded"] = "RequestAdded";
    Events["RequestUpdated"] = "RequestUpdated";
    Events["RequestRemoved"] = "RequestRemoved";
})(Events || (Events = {}));
//# sourceMappingURL=NetworkLog.js.map