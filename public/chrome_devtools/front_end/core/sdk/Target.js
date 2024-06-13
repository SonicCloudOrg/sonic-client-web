// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import * as ProtocolClient from '../protocol_client/protocol_client.js';
import { SDKModel } from './SDKModel.js';
export class Target extends ProtocolClient.InspectorBackend.TargetBase {
    #targetManagerInternal;
    #nameInternal;
    #inspectedURLInternal;
    #inspectedURLName;
    #capabilitiesMask;
    #typeInternal;
    #parentTargetInternal;
    #idInternal;
    #modelByConstructor;
    #isSuspended;
    #targetInfoInternal;
    #creatingModels;
    constructor(targetManager, id, name, type, parentTarget, sessionId, suspended, connection, targetInfo) {
        const needsNodeJSPatching = type === Type.Node;
        super(needsNodeJSPatching, parentTarget, sessionId, connection);
        this.#targetManagerInternal = targetManager;
        this.#nameInternal = name;
        this.#inspectedURLInternal = Platform.DevToolsPath.EmptyUrlString;
        this.#inspectedURLName = '';
        this.#capabilitiesMask = 0;
        switch (type) {
            case Type.Frame:
                this.#capabilitiesMask = 1 /* Capability.Browser */ | 8192 /* Capability.Storage */ | 2 /* Capability.DOM */ | 4 /* Capability.JS */ |
                    8 /* Capability.Log */ | 16 /* Capability.Network */ | 32 /* Capability.Target */ | 128 /* Capability.Tracing */ | 256 /* Capability.Emulation */ |
                    1024 /* Capability.Input */ | 2048 /* Capability.Inspector */ | 32768 /* Capability.Audits */ | 65536 /* Capability.WebAuthn */ | 131072 /* Capability.IO */ |
                    262144 /* Capability.Media */ | 524288 /* Capability.EventBreakpoints */;
                if (parentTarget?.type() !== Type.Frame) {
                    // This matches backend exposing certain capabilities only for the main frame.
                    this.#capabilitiesMask |=
                        4096 /* Capability.DeviceEmulation */ | 64 /* Capability.ScreenCapture */ | 512 /* Capability.Security */ | 16384 /* Capability.ServiceWorker */;
                    if (Common.ParsedURL.schemeIs(targetInfo?.url, 'chrome-extension:')) {
                        this.#capabilitiesMask &= ~512 /* Capability.Security */;
                    }
                    // TODO(dgozman): we report service workers for the whole frame tree on the main frame,
                    // while we should be able to only cover the subtree corresponding to the target.
                }
                break;
            case Type.ServiceWorker:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 8 /* Capability.Log */ | 16 /* Capability.Network */ | 32 /* Capability.Target */ |
                    2048 /* Capability.Inspector */ | 131072 /* Capability.IO */ | 524288 /* Capability.EventBreakpoints */;
                if (parentTarget?.type() !== Type.Frame) {
                    this.#capabilitiesMask |= 1 /* Capability.Browser */;
                }
                break;
            case Type.SharedWorker:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 8 /* Capability.Log */ | 16 /* Capability.Network */ | 32 /* Capability.Target */ |
                    131072 /* Capability.IO */ | 262144 /* Capability.Media */ | 2048 /* Capability.Inspector */ | 524288 /* Capability.EventBreakpoints */;
                break;
            case Type.SharedStorageWorklet:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 8 /* Capability.Log */ | 2048 /* Capability.Inspector */ | 524288 /* Capability.EventBreakpoints */;
                break;
            case Type.Worker:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 8 /* Capability.Log */ | 16 /* Capability.Network */ | 32 /* Capability.Target */ |
                    131072 /* Capability.IO */ | 262144 /* Capability.Media */ | 256 /* Capability.Emulation */ | 524288 /* Capability.EventBreakpoints */;
                break;
            case Type.Worklet:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 8 /* Capability.Log */ | 524288 /* Capability.EventBreakpoints */;
                break;
            case Type.Node:
                this.#capabilitiesMask = 4 /* Capability.JS */;
                break;
            case Type.AuctionWorklet:
                this.#capabilitiesMask = 4 /* Capability.JS */ | 524288 /* Capability.EventBreakpoints */;
                break;
            case Type.Browser:
                this.#capabilitiesMask = 32 /* Capability.Target */ | 131072 /* Capability.IO */;
                break;
            case Type.Tab:
                this.#capabilitiesMask = 32 /* Capability.Target */ | 128 /* Capability.Tracing */;
                break;
        }
        this.#typeInternal = type;
        this.#parentTargetInternal = parentTarget;
        this.#idInternal = id;
        /* } */
        this.#modelByConstructor = new Map();
        this.#isSuspended = suspended;
        this.#targetInfoInternal = targetInfo;
    }
    createModels(required) {
        this.#creatingModels = true;
        const registeredModels = Array.from(SDKModel.registeredModels.entries());
        // Create early models.
        for (const [modelClass, info] of registeredModels) {
            if (info.early) {
                this.model(modelClass);
            }
        }
        // Create autostart and required models.
        for (const [modelClass, info] of registeredModels) {
            if (info.autostart || required.has(modelClass)) {
                this.model(modelClass);
            }
        }
        this.#creatingModels = false;
    }
    id() {
        return this.#idInternal;
    }
    name() {
        return this.#nameInternal || this.#inspectedURLName;
    }
    setName(name) {
        if (this.#nameInternal === name) {
            return;
        }
        this.#nameInternal = name;
        this.#targetManagerInternal.onNameChange(this);
    }
    type() {
        return this.#typeInternal;
    }
    markAsNodeJSForTest() {
        super.markAsNodeJSForTest();
        this.#typeInternal = Type.Node;
    }
    targetManager() {
        return this.#targetManagerInternal;
    }
    hasAllCapabilities(capabilitiesMask) {
        // TODO(dgozman): get rid of this method, once we never observe targets with
        // capability mask.
        return (this.#capabilitiesMask & capabilitiesMask) === capabilitiesMask;
    }
    decorateLabel(label) {
        return (this.#typeInternal === Type.Worker || this.#typeInternal === Type.ServiceWorker) ? '\u2699 ' + label :
            label;
    }
    parentTarget() {
        return this.#parentTargetInternal;
    }
    outermostTarget() {
        let lastTarget = null;
        let currentTarget = this;
        do {
            if (currentTarget.type() !== Type.Tab && currentTarget.type() !== Type.Browser) {
                lastTarget = currentTarget;
            }
            currentTarget = currentTarget.parentTarget();
        } while (currentTarget);
        return lastTarget;
    }
    dispose(reason) {
        super.dispose(reason);
        this.#targetManagerInternal.removeTarget(this);
        for (const model of this.#modelByConstructor.values()) {
            model.dispose();
        }
    }
    model(modelClass) {
        if (!this.#modelByConstructor.get(modelClass)) {
            const info = SDKModel.registeredModels.get(modelClass);
            if (info === undefined) {
                throw 'Model class is not registered @' + new Error().stack;
            }
            if ((this.#capabilitiesMask & info.capabilities) === info.capabilities) {
                const model = new modelClass(this);
                this.#modelByConstructor.set(modelClass, model);
                if (!this.#creatingModels) {
                    this.#targetManagerInternal.modelAdded(this, modelClass, model, this.#targetManagerInternal.isInScope(this));
                }
            }
        }
        return this.#modelByConstructor.get(modelClass) || null;
    }
    models() {
        return this.#modelByConstructor;
    }
    inspectedURL() {
        return this.#inspectedURLInternal;
    }
    setInspectedURL(inspectedURL) {
        this.#inspectedURLInternal = inspectedURL;
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(inspectedURL);
        this.#inspectedURLName = parsedURL ? parsedURL.lastPathComponentWithFragment() : '#' + this.#idInternal;
        this.#targetManagerInternal.onInspectedURLChange(this);
        if (!this.#nameInternal) {
            this.#targetManagerInternal.onNameChange(this);
        }
    }
    async suspend(reason) {
        if (this.#isSuspended) {
            return;
        }
        this.#isSuspended = true;
        await Promise.all(Array.from(this.models().values(), m => m.preSuspendModel(reason)));
        await Promise.all(Array.from(this.models().values(), m => m.suspendModel(reason)));
    }
    async resume() {
        if (!this.#isSuspended) {
            return;
        }
        this.#isSuspended = false;
        await Promise.all(Array.from(this.models().values(), m => m.resumeModel()));
        await Promise.all(Array.from(this.models().values(), m => m.postResumeModel()));
    }
    suspended() {
        return this.#isSuspended;
    }
    updateTargetInfo(targetInfo) {
        this.#targetInfoInternal = targetInfo;
    }
    targetInfo() {
        return this.#targetInfoInternal;
    }
}
export var Type;
(function (Type) {
    Type["Frame"] = "frame";
    Type["ServiceWorker"] = "service-worker";
    Type["Worker"] = "worker";
    Type["SharedWorker"] = "shared-worker";
    Type["SharedStorageWorklet"] = "shared-storage-worklet";
    Type["Node"] = "node";
    Type["Browser"] = "browser";
    Type["AuctionWorklet"] = "auction-worklet";
    Type["Worklet"] = "worklet";
    Type["Tab"] = "tab";
})(Type || (Type = {}));
//# sourceMappingURL=Target.js.map