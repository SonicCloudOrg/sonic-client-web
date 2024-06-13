// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import { ParallelConnection } from './Connections.js';
import { ResourceTreeModel } from './ResourceTreeModel.js';
import { SDKModel } from './SDKModel.js';
import { Type } from './Target.js';
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
     * @description Text that refers to the main target. The main target is the primary webpage that
     * DevTools is connected to. This text is used in various places in the UI as a label/name to inform
     * the user which target/webpage they are currently connected to, as DevTools may connect to multiple
     * targets at the same time in some scenarios.
     */
    main: 'Main',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/ChildTargetManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ChildTargetManager extends SDKModel {
    #targetManager;
    #parentTarget;
    #targetAgent;
    #targetInfosInternal = new Map();
    #childTargetsBySessionId = new Map();
    #childTargetsById = new Map();
    #parallelConnections = new Map();
    #parentTargetId = null;
    constructor(parentTarget) {
        super(parentTarget);
        this.#targetManager = parentTarget.targetManager();
        this.#parentTarget = parentTarget;
        this.#targetAgent = parentTarget.targetAgent();
        parentTarget.registerTargetDispatcher(this);
        const browserTarget = this.#targetManager.browserTarget();
        if (browserTarget) {
            if (browserTarget !== parentTarget) {
                void browserTarget.targetAgent().invoke_autoAttachRelated({ targetId: parentTarget.id(), waitForDebuggerOnStart: true });
            }
        }
        else {
            void this.#targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
        }
        if (parentTarget.parentTarget()?.type() !== Type.Frame && !Host.InspectorFrontendHost.isUnderTest()) {
            void this.#targetAgent.invoke_setDiscoverTargets({ discover: true });
            void this.#targetAgent.invoke_setRemoteLocations({ locations: [{ host: 'localhost', port: 9229 }] });
        }
    }
    static install(attachCallback) {
        ChildTargetManager.attachCallback = attachCallback;
        SDKModel.register(ChildTargetManager, { capabilities: 32 /* Capability.Target */, autostart: true });
    }
    childTargets() {
        return Array.from(this.#childTargetsBySessionId.values());
    }
    async suspendModel() {
        await this.#targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
    }
    async resumeModel() {
        await this.#targetAgent.invoke_setAutoAttach({ autoAttach: true, waitForDebuggerOnStart: true, flatten: true });
    }
    dispose() {
        for (const sessionId of this.#childTargetsBySessionId.keys()) {
            this.detachedFromTarget({ sessionId, targetId: undefined });
        }
    }
    targetCreated({ targetInfo }) {
        this.#targetInfosInternal.set(targetInfo.targetId, targetInfo);
        this.fireAvailableTargetsChanged();
        this.dispatchEventToListeners("TargetCreated" /* Events.TargetCreated */, targetInfo);
    }
    targetInfoChanged({ targetInfo }) {
        this.#targetInfosInternal.set(targetInfo.targetId, targetInfo);
        const target = this.#childTargetsById.get(targetInfo.targetId);
        if (target) {
            if (target.targetInfo()?.subtype === 'prerender' && !targetInfo.subtype) {
                const resourceTreeModel = target.model(ResourceTreeModel);
                target.updateTargetInfo(targetInfo);
                if (resourceTreeModel && resourceTreeModel.mainFrame) {
                    resourceTreeModel.primaryPageChanged(resourceTreeModel.mainFrame, "Activation" /* PrimaryPageChangeType.Activation */);
                }
                target.setName(i18nString(UIStrings.main));
            }
            else {
                target.updateTargetInfo(targetInfo);
            }
        }
        this.fireAvailableTargetsChanged();
        this.dispatchEventToListeners("TargetInfoChanged" /* Events.TargetInfoChanged */, targetInfo);
    }
    targetDestroyed({ targetId }) {
        this.#targetInfosInternal.delete(targetId);
        this.fireAvailableTargetsChanged();
        this.dispatchEventToListeners("TargetDestroyed" /* Events.TargetDestroyed */, targetId);
    }
    targetCrashed({ targetId }) {
        this.#targetInfosInternal.delete(targetId);
        const target = this.#childTargetsById.get(targetId);
        if (target) {
            target.dispose('targetCrashed event from CDP');
        }
        this.fireAvailableTargetsChanged();
        this.dispatchEventToListeners("TargetDestroyed" /* Events.TargetDestroyed */, targetId);
    }
    fireAvailableTargetsChanged() {
        TargetManager.instance().dispatchEventToListeners("AvailableTargetsChanged" /* TargetManagerEvents.AvailableTargetsChanged */, [...this.#targetInfosInternal.values()]);
    }
    async getParentTargetId() {
        if (!this.#parentTargetId) {
            this.#parentTargetId = (await this.#parentTarget.targetAgent().invoke_getTargetInfo({})).targetInfo.targetId;
        }
        return this.#parentTargetId;
    }
    async getTargetInfo() {
        return (await this.#parentTarget.targetAgent().invoke_getTargetInfo({})).targetInfo;
    }
    async attachedToTarget({ sessionId, targetInfo, waitingForDebugger }) {
        if (this.#parentTargetId === targetInfo.targetId) {
            return;
        }
        let type = Type.Browser;
        let targetName = '';
        if (targetInfo.type === 'worker' && targetInfo.title && targetInfo.title !== targetInfo.url) {
            targetName = targetInfo.title;
        }
        else if (!['page', 'iframe', 'webview'].includes(targetInfo.type)) {
            const KNOWN_FRAME_PATTERNS = [
                '^chrome://print/$',
                '^chrome://file-manager/',
                '^chrome://feedback/',
                '^chrome://.*\\.top-chrome/$',
                '^chrome://view-cert/$',
                '^devtools://',
            ];
            if (KNOWN_FRAME_PATTERNS.some(p => targetInfo.url.match(p))) {
                type = Type.Frame;
            }
            else {
                const parsedURL = Common.ParsedURL.ParsedURL.fromString(targetInfo.url);
                targetName =
                    parsedURL ? parsedURL.lastPathComponentWithFragment() : '#' + (++ChildTargetManager.lastAnonymousTargetId);
            }
        }
        if (targetInfo.type === 'iframe' || targetInfo.type === 'webview') {
            type = Type.Frame;
        }
        else if (targetInfo.type === 'background_page' || targetInfo.type === 'app' || targetInfo.type === 'popup_page') {
            type = Type.Frame;
        }
        // TODO(lfg): ensure proper capabilities for child pages (e.g. portals).
        else if (targetInfo.type === 'page') {
            type = Type.Frame;
        }
        else if (targetInfo.type === 'worker') {
            type = Type.Worker;
        }
        else if (targetInfo.type === 'worklet') {
            type = Type.Worklet;
        }
        else if (targetInfo.type === 'shared_worker') {
            type = Type.SharedWorker;
        }
        else if (targetInfo.type === 'shared_storage_worklet') {
            type = Type.SharedStorageWorklet;
        }
        else if (targetInfo.type === 'service_worker') {
            type = Type.ServiceWorker;
        }
        else if (targetInfo.type === 'auction_worklet') {
            type = Type.AuctionWorklet;
        }
        const target = this.#targetManager.createTarget(targetInfo.targetId, targetName, type, this.#parentTarget, sessionId, undefined, undefined, targetInfo);
        this.#childTargetsBySessionId.set(sessionId, target);
        this.#childTargetsById.set(target.id(), target);
        if (ChildTargetManager.attachCallback) {
            await ChildTargetManager.attachCallback({ target, waitingForDebugger });
        }
        // [crbug/1423096] Invoking this on a worker session that is not waiting for the debugger can force the worker
        // to resume even if there is another session waiting for the debugger.
        if (waitingForDebugger) {
            void target.runtimeAgent().invoke_runIfWaitingForDebugger();
        }
    }
    detachedFromTarget({ sessionId }) {
        if (this.#parallelConnections.has(sessionId)) {
            this.#parallelConnections.delete(sessionId);
        }
        else {
            const target = this.#childTargetsBySessionId.get(sessionId);
            if (target) {
                target.dispose('target terminated');
                this.#childTargetsBySessionId.delete(sessionId);
                this.#childTargetsById.delete(target.id());
            }
        }
    }
    receivedMessageFromTarget({}) {
        // We use flatten protocol.
    }
    async createParallelConnection(onMessage) {
        // The main Target id is actually just `main`, instead of the real targetId.
        // Get the real id (requires an async operation) so that it can be used synchronously later.
        const targetId = await this.getParentTargetId();
        const { connection, sessionId } = await this.createParallelConnectionAndSessionForTarget(this.#parentTarget, targetId);
        connection.setOnMessage(onMessage);
        this.#parallelConnections.set(sessionId, connection);
        return { connection, sessionId };
    }
    async createParallelConnectionAndSessionForTarget(target, targetId) {
        const targetAgent = target.targetAgent();
        const targetRouter = target.router();
        const sessionId = (await targetAgent.invoke_attachToTarget({ targetId, flatten: true })).sessionId;
        const connection = new ParallelConnection(targetRouter.connection(), sessionId);
        targetRouter.registerSession(target, sessionId, connection);
        connection.setOnDisconnect(() => {
            targetRouter.unregisterSession(sessionId);
            void targetAgent.invoke_detachFromTarget({ sessionId });
        });
        return { connection, sessionId };
    }
    targetInfos() {
        return Array.from(this.#targetInfosInternal.values());
    }
    static lastAnonymousTargetId = 0;
    static attachCallback;
}
//# sourceMappingURL=ChildTargetManager.js.map