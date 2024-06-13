// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
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
 *     * Neither the #name of Google Inc. nor the names of its
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
import * as Common from '../common/common.js';
import * as i18n from '../i18n/i18n.js';
import { Events as RuntimeModelEvents, RuntimeModel } from './RuntimeModel.js';
import { Type } from './Target.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
     *@description Service worker running status displayed in the Service Workers view in the Application panel
     */
    running: 'running',
    /**
     *@description Service worker running status displayed in the Service Workers view in the Application panel
     */
    starting: 'starting',
    /**
     *@description Service worker running status displayed in the Service Workers view in the Application panel
     */
    stopped: 'stopped',
    /**
     *@description Service worker running status displayed in the Service Workers view in the Application panel
     */
    stopping: 'stopping',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    activated: 'activated',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    activating: 'activating',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    installed: 'installed',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    installing: 'installing',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    new: 'new',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     */
    redundant: 'redundant',
    /**
     *@description Service worker version status displayed in the Threads view of the Debugging side pane in the Sources panel
     *@example {sw.js} PH1
     *@example {117} PH2
     *@example {activated} PH3
     */
    sSS: '{PH1} #{PH2} ({PH3})',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/ServiceWorkerManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class ServiceWorkerManager extends SDKModel {
    #agent;
    #registrationsInternal;
    #enabled;
    #forceUpdateSetting;
    serviceWorkerNetworkRequestsPanelStatus;
    constructor(target) {
        super(target);
        target.registerServiceWorkerDispatcher(new ServiceWorkerDispatcher(this));
        this.#agent = target.serviceWorkerAgent();
        this.#registrationsInternal = new Map();
        this.#enabled = false;
        void this.enable();
        this.#forceUpdateSetting =
            Common.Settings.Settings.instance().createSetting('service-worker-update-on-reload', false);
        if (this.#forceUpdateSetting.get()) {
            this.forceUpdateSettingChanged();
        }
        this.#forceUpdateSetting.addChangeListener(this.forceUpdateSettingChanged, this);
        new ServiceWorkerContextNamer(target, this);
        /** Status of service worker network requests panel */
        this.serviceWorkerNetworkRequestsPanelStatus = {
            isOpen: false,
            openedAt: 0,
        };
    }
    async enable() {
        if (this.#enabled) {
            return;
        }
        this.#enabled = true;
        await this.#agent.invoke_enable();
    }
    async disable() {
        if (!this.#enabled) {
            return;
        }
        this.#enabled = false;
        this.#registrationsInternal.clear();
        await this.#agent.invoke_enable();
    }
    registrations() {
        return this.#registrationsInternal;
    }
    hasRegistrationForURLs(urls) {
        for (const registration of this.#registrationsInternal.values()) {
            if (urls.filter(url => url && url.startsWith(registration.scopeURL)).length === urls.length) {
                return true;
            }
        }
        return false;
    }
    findVersion(versionId) {
        for (const registration of this.registrations().values()) {
            const version = registration.versions.get(versionId);
            if (version) {
                return version;
            }
        }
        return null;
    }
    deleteRegistration(registrationId) {
        const registration = this.#registrationsInternal.get(registrationId);
        if (!registration) {
            return;
        }
        if (registration.isRedundant()) {
            this.#registrationsInternal.delete(registrationId);
            this.dispatchEventToListeners("RegistrationDeleted" /* Events.RegistrationDeleted */, registration);
            return;
        }
        registration.deleting = true;
        for (const version of registration.versions.values()) {
            void this.stopWorker(version.id);
        }
        void this.unregister(registration.scopeURL);
    }
    async updateRegistration(registrationId) {
        const registration = this.#registrationsInternal.get(registrationId);
        if (!registration) {
            return;
        }
        await this.#agent.invoke_updateRegistration({ scopeURL: registration.scopeURL });
    }
    async deliverPushMessage(registrationId, data) {
        const registration = this.#registrationsInternal.get(registrationId);
        if (!registration) {
            return;
        }
        const origin = Common.ParsedURL.ParsedURL.extractOrigin(registration.scopeURL);
        await this.#agent.invoke_deliverPushMessage({ origin, registrationId, data });
    }
    async dispatchSyncEvent(registrationId, tag, lastChance) {
        const registration = this.#registrationsInternal.get(registrationId);
        if (!registration) {
            return;
        }
        const origin = Common.ParsedURL.ParsedURL.extractOrigin(registration.scopeURL);
        await this.#agent.invoke_dispatchSyncEvent({ origin, registrationId, tag, lastChance });
    }
    async dispatchPeriodicSyncEvent(registrationId, tag) {
        const registration = this.#registrationsInternal.get(registrationId);
        if (!registration) {
            return;
        }
        const origin = Common.ParsedURL.ParsedURL.extractOrigin(registration.scopeURL);
        await this.#agent.invoke_dispatchPeriodicSyncEvent({ origin, registrationId, tag });
    }
    async unregister(scopeURL) {
        await this.#agent.invoke_unregister({ scopeURL });
    }
    async startWorker(scopeURL) {
        await this.#agent.invoke_startWorker({ scopeURL });
    }
    async skipWaiting(scopeURL) {
        await this.#agent.invoke_skipWaiting({ scopeURL });
    }
    async stopWorker(versionId) {
        await this.#agent.invoke_stopWorker({ versionId });
    }
    async inspectWorker(versionId) {
        await this.#agent.invoke_inspectWorker({ versionId });
    }
    workerRegistrationUpdated(registrations) {
        for (const payload of registrations) {
            let registration = this.#registrationsInternal.get(payload.registrationId);
            if (!registration) {
                registration = new ServiceWorkerRegistration(payload);
                this.#registrationsInternal.set(payload.registrationId, registration);
                this.dispatchEventToListeners("RegistrationUpdated" /* Events.RegistrationUpdated */, registration);
                continue;
            }
            registration.update(payload);
            if (registration.shouldBeRemoved()) {
                this.#registrationsInternal.delete(registration.id);
                this.dispatchEventToListeners("RegistrationDeleted" /* Events.RegistrationDeleted */, registration);
            }
            else {
                this.dispatchEventToListeners("RegistrationUpdated" /* Events.RegistrationUpdated */, registration);
            }
        }
    }
    workerVersionUpdated(versions) {
        const registrations = new Set();
        for (const payload of versions) {
            const registration = this.#registrationsInternal.get(payload.registrationId);
            if (!registration) {
                continue;
            }
            registration.updateVersion(payload);
            registrations.add(registration);
        }
        for (const registration of registrations) {
            if (registration.shouldBeRemoved()) {
                this.#registrationsInternal.delete(registration.id);
                this.dispatchEventToListeners("RegistrationDeleted" /* Events.RegistrationDeleted */, registration);
            }
            else {
                this.dispatchEventToListeners("RegistrationUpdated" /* Events.RegistrationUpdated */, registration);
            }
        }
    }
    workerErrorReported(payload) {
        const registration = this.#registrationsInternal.get(payload.registrationId);
        if (!registration) {
            return;
        }
        registration.errors.push(payload);
        this.dispatchEventToListeners("RegistrationErrorAdded" /* Events.RegistrationErrorAdded */, { registration: registration, error: payload });
    }
    forceUpdateOnReloadSetting() {
        return this.#forceUpdateSetting;
    }
    forceUpdateSettingChanged() {
        const forceUpdateOnPageLoad = this.#forceUpdateSetting.get();
        void this.#agent.invoke_setForceUpdateOnPageLoad({ forceUpdateOnPageLoad });
    }
}
class ServiceWorkerDispatcher {
    #manager;
    constructor(manager) {
        this.#manager = manager;
    }
    workerRegistrationUpdated({ registrations }) {
        this.#manager.workerRegistrationUpdated(registrations);
    }
    workerVersionUpdated({ versions }) {
        this.#manager.workerVersionUpdated(versions);
    }
    workerErrorReported({ errorMessage }) {
        this.#manager.workerErrorReported(errorMessage);
    }
}
/**
 * For every version, we keep a history of ServiceWorkerVersionState. Every time
 * a version is updated we will add a new state at the head of the history chain.
 * This history tells us information such as what the current state is, or when
 * the version becomes installed.
 */
export class ServiceWorkerVersionState {
    runningStatus;
    status;
    lastUpdatedTimestamp;
    previousState;
    constructor(runningStatus, status, previousState, timestamp) {
        this.runningStatus = runningStatus;
        this.status = status;
        this.lastUpdatedTimestamp = timestamp;
        this.previousState = previousState;
    }
}
export class ServiceWorkerRouterRule {
    condition;
    source;
    id;
    constructor(condition, source, id) {
        this.condition = condition;
        this.source = source;
        this.id = id;
    }
}
export class ServiceWorkerVersion {
    id;
    scriptURL;
    parsedURL;
    securityOrigin;
    scriptLastModified;
    scriptResponseTime;
    controlledClients;
    targetId;
    routerRules;
    currentState;
    registration;
    constructor(registration, payload) {
        this.registration = registration;
        this.update(payload);
    }
    update(payload) {
        this.id = payload.versionId;
        this.scriptURL = payload.scriptURL;
        const parsedURL = new Common.ParsedURL.ParsedURL(payload.scriptURL);
        this.securityOrigin = parsedURL.securityOrigin();
        this.currentState =
            new ServiceWorkerVersionState(payload.runningStatus, payload.status, this.currentState, Date.now());
        this.scriptLastModified = payload.scriptLastModified;
        this.scriptResponseTime = payload.scriptResponseTime;
        if (payload.controlledClients) {
            this.controlledClients = payload.controlledClients.slice();
        }
        else {
            this.controlledClients = [];
        }
        this.targetId = payload.targetId || null;
        this.routerRules = null;
        if (payload.routerRules) {
            this.routerRules = this.parseJSONRules(payload.routerRules);
        }
    }
    isStartable() {
        return !this.registration.isDeleted && this.isActivated() && this.isStopped();
    }
    isStoppedAndRedundant() {
        return this.runningStatus === "stopped" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Stopped */ &&
            this.status === "redundant" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Redundant */;
    }
    isStopped() {
        return this.runningStatus === "stopped" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Stopped */;
    }
    isStarting() {
        return this.runningStatus === "starting" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Starting */;
    }
    isRunning() {
        return this.runningStatus === "running" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Running */;
    }
    isStopping() {
        return this.runningStatus === "stopping" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Stopping */;
    }
    isNew() {
        return this.status === "new" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.New */;
    }
    isInstalling() {
        return this.status === "installing" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installing */;
    }
    isInstalled() {
        return this.status === "installed" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installed */;
    }
    isActivating() {
        return this.status === "activating" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activating */;
    }
    isActivated() {
        return this.status === "activated" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activated */;
    }
    isRedundant() {
        return this.status === "redundant" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Redundant */;
    }
    get status() {
        return this.currentState.status;
    }
    get runningStatus() {
        return this.currentState.runningStatus;
    }
    mode() {
        if (this.isNew() || this.isInstalling()) {
            return "installing" /* ServiceWorkerVersion.Modes.Installing */;
        }
        if (this.isInstalled()) {
            return "waiting" /* ServiceWorkerVersion.Modes.Waiting */;
        }
        if (this.isActivating() || this.isActivated()) {
            return "active" /* ServiceWorkerVersion.Modes.Active */;
        }
        return "redundant" /* ServiceWorkerVersion.Modes.Redundant */;
    }
    parseJSONRules(input) {
        try {
            const parsedObject = JSON.parse(input);
            if (!Array.isArray(parsedObject)) {
                console.error('Parse error: `routerRules` in ServiceWorkerVersion should be an array');
                return null;
            }
            const routerRules = [];
            for (const parsedRule of parsedObject) {
                const { condition, source, id } = parsedRule;
                if (condition === undefined || source === undefined || id === undefined) {
                    console.error('Parse error: Missing some fields of `routerRules` in ServiceWorkerVersion');
                    return null;
                }
                routerRules.push(new ServiceWorkerRouterRule(JSON.stringify(condition), JSON.stringify(source), id));
            }
            return routerRules;
        }
        catch (e) {
            console.error('Parse error: Invalid `routerRules` in ServiceWorkerVersion');
            return null;
        }
    }
}
(function (ServiceWorkerVersion) {
    ServiceWorkerVersion.RunningStatus = {
        ["running" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Running */]: i18nLazyString(UIStrings.running),
        ["starting" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Starting */]: i18nLazyString(UIStrings.starting),
        ["stopped" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Stopped */]: i18nLazyString(UIStrings.stopped),
        ["stopping" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Stopping */]: i18nLazyString(UIStrings.stopping),
    };
    ServiceWorkerVersion.Status = {
        ["activated" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activated */]: i18nLazyString(UIStrings.activated),
        ["activating" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activating */]: i18nLazyString(UIStrings.activating),
        ["installed" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installed */]: i18nLazyString(UIStrings.installed),
        ["installing" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installing */]: i18nLazyString(UIStrings.installing),
        ["new" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.New */]: i18nLazyString(UIStrings.new),
        ["redundant" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Redundant */]: i18nLazyString(UIStrings.redundant),
    };
})(ServiceWorkerVersion || (ServiceWorkerVersion = {}));
export class ServiceWorkerRegistration {
    #fingerprintInternal;
    id;
    scopeURL;
    securityOrigin;
    isDeleted;
    versions;
    deleting;
    errors;
    constructor(payload) {
        this.update(payload);
        this.versions = new Map();
        this.deleting = false;
        this.errors = [];
    }
    update(payload) {
        this.#fingerprintInternal = Symbol('fingerprint');
        this.id = payload.registrationId;
        this.scopeURL = payload.scopeURL;
        const parsedURL = new Common.ParsedURL.ParsedURL(payload.scopeURL);
        this.securityOrigin = parsedURL.securityOrigin();
        this.isDeleted = payload.isDeleted;
    }
    fingerprint() {
        return this.#fingerprintInternal;
    }
    versionsByMode() {
        const result = new Map();
        for (const version of this.versions.values()) {
            result.set(version.mode(), version);
        }
        return result;
    }
    updateVersion(payload) {
        this.#fingerprintInternal = Symbol('fingerprint');
        let version = this.versions.get(payload.versionId);
        if (!version) {
            version = new ServiceWorkerVersion(this, payload);
            this.versions.set(payload.versionId, version);
            return version;
        }
        version.update(payload);
        return version;
    }
    isRedundant() {
        for (const version of this.versions.values()) {
            if (!version.isStoppedAndRedundant()) {
                return false;
            }
        }
        return true;
    }
    shouldBeRemoved() {
        return this.isRedundant() && (!this.errors.length || this.deleting);
    }
    canBeRemoved() {
        return this.isDeleted || this.deleting;
    }
    clearErrors() {
        this.#fingerprintInternal = Symbol('fingerprint');
        this.errors = [];
    }
}
class ServiceWorkerContextNamer {
    #target;
    #serviceWorkerManager;
    #versionByTargetId;
    constructor(target, serviceWorkerManager) {
        this.#target = target;
        this.#serviceWorkerManager = serviceWorkerManager;
        this.#versionByTargetId = new Map();
        serviceWorkerManager.addEventListener("RegistrationUpdated" /* Events.RegistrationUpdated */, this.registrationsUpdated, this);
        serviceWorkerManager.addEventListener("RegistrationDeleted" /* Events.RegistrationDeleted */, this.registrationsUpdated, this);
        TargetManager.instance().addModelListener(RuntimeModel, RuntimeModelEvents.ExecutionContextCreated, this.executionContextCreated, this);
    }
    registrationsUpdated() {
        this.#versionByTargetId.clear();
        const registrations = this.#serviceWorkerManager.registrations().values();
        for (const registration of registrations) {
            for (const version of registration.versions.values()) {
                if (version.targetId) {
                    this.#versionByTargetId.set(version.targetId, version);
                }
            }
        }
        this.updateAllContextLabels();
    }
    executionContextCreated(event) {
        const executionContext = event.data;
        const serviceWorkerTargetId = this.serviceWorkerTargetId(executionContext.target());
        if (!serviceWorkerTargetId) {
            return;
        }
        this.updateContextLabel(executionContext, this.#versionByTargetId.get(serviceWorkerTargetId) || null);
    }
    serviceWorkerTargetId(target) {
        if (target.parentTarget() !== this.#target || target.type() !== Type.ServiceWorker) {
            return null;
        }
        return target.id();
    }
    updateAllContextLabels() {
        for (const target of TargetManager.instance().targets()) {
            const serviceWorkerTargetId = this.serviceWorkerTargetId(target);
            if (!serviceWorkerTargetId) {
                continue;
            }
            const version = this.#versionByTargetId.get(serviceWorkerTargetId) || null;
            const runtimeModel = target.model(RuntimeModel);
            const executionContexts = runtimeModel ? runtimeModel.executionContexts() : [];
            for (const context of executionContexts) {
                this.updateContextLabel(context, version);
            }
        }
    }
    updateContextLabel(context, version) {
        if (!version) {
            context.setLabel('');
            return;
        }
        const parsedUrl = Common.ParsedURL.ParsedURL.fromString(context.origin);
        const label = parsedUrl ? parsedUrl.lastPathComponentWithFragment() : context.name;
        const localizedStatus = ServiceWorkerVersion.Status[version.status];
        context.setLabel(i18nString(UIStrings.sSS, { PH1: label, PH2: version.id, PH3: localizedStatus() }));
    }
}
SDKModel.register(ServiceWorkerManager, { capabilities: 16384 /* Capability.ServiceWorker */, autostart: true });
//# sourceMappingURL=ServiceWorkerManager.js.map