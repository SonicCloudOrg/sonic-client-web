// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Spec from './web-vitals-injected/spec/spec.js';
const LIVE_METRICS_WORLD_NAME = 'live_metrics_world';
let liveMetricsInstance;
class InjectedScript {
    static #injectedScript;
    static async get() {
        if (!this.#injectedScript) {
            const url = new URL('./web-vitals-injected/web-vitals-injected.generated.js', import.meta.url);
            const result = await fetch(url);
            this.#injectedScript = await result.text();
        }
        return this.#injectedScript;
    }
}
export class LiveMetrics extends Common.ObjectWrapper.ObjectWrapper {
    #target;
    #scriptIdentifier;
    #lastResetContextId;
    #lcpValue;
    #clsValue;
    #inpValue;
    #interactions = [];
    #mutex = new Common.Mutex.Mutex();
    constructor() {
        super();
        SDK.TargetManager.TargetManager.instance().observeTargets(this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!liveMetricsInstance || forceNew) {
            liveMetricsInstance = new LiveMetrics();
        }
        return liveMetricsInstance;
    }
    get lcpValue() {
        return this.#lcpValue;
    }
    get clsValue() {
        return this.#clsValue;
    }
    get inpValue() {
        return this.#inpValue;
    }
    get interactions() {
        return this.#interactions;
    }
    /**
     * DOM nodes can't be sent over a runtime binding, so we have to retrieve
     * them separately.
     */
    async #resolveDomNode(index, executionContextId) {
        if (!this.#target) {
            return null;
        }
        const runtimeModel = this.#target.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            return null;
        }
        const domModel = this.#target.model(SDK.DOMModel.DOMModel);
        if (!domModel) {
            return null;
        }
        const { result } = await this.#target.runtimeAgent().invoke_evaluate({
            expression: `window.getNodeForIndex(${index})`,
            contextId: executionContextId,
        });
        if (!result) {
            return null;
        }
        const remoteObject = runtimeModel.createRemoteObject(result);
        return domModel.pushObjectAsNodeToFrontend(remoteObject);
    }
    async #handleWebVitalsEvent(webVitalsEvent, executionContextId) {
        switch (webVitalsEvent.name) {
            case 'LCP': {
                const lcpEvent = {
                    value: webVitalsEvent.value,
                    rating: webVitalsEvent.rating,
                };
                if (webVitalsEvent.nodeIndex !== undefined) {
                    const node = await this.#resolveDomNode(webVitalsEvent.nodeIndex, executionContextId);
                    if (node) {
                        lcpEvent.node = node;
                    }
                }
                this.#lcpValue = lcpEvent;
                break;
            }
            case 'CLS': {
                const event = {
                    value: webVitalsEvent.value,
                    rating: webVitalsEvent.rating,
                };
                this.#clsValue = event;
                break;
            }
            case 'INP': {
                const inpEvent = {
                    value: webVitalsEvent.value,
                    rating: webVitalsEvent.rating,
                    interactionType: webVitalsEvent.interactionType,
                };
                if (webVitalsEvent.nodeIndex !== undefined) {
                    const node = await this.#resolveDomNode(webVitalsEvent.nodeIndex, executionContextId);
                    if (node) {
                        inpEvent.node = node;
                    }
                }
                this.#inpValue = inpEvent;
                break;
            }
            case 'Interaction': {
                const { nodeIndex, ...rest } = webVitalsEvent;
                const interactionEvent = rest;
                if (nodeIndex !== undefined) {
                    const node = await this.#resolveDomNode(nodeIndex, executionContextId);
                    if (node) {
                        interactionEvent.node = node;
                    }
                }
                this.#interactions.push(interactionEvent);
                break;
            }
            case 'reset': {
                this.#lcpValue = undefined;
                this.#clsValue = undefined;
                this.#inpValue = undefined;
                this.#interactions = [];
                break;
            }
        }
        this.dispatchEventToListeners("status" /* Events.Status */, {
            lcp: this.#lcpValue,
            cls: this.#clsValue,
            inp: this.#inpValue,
            interactions: this.#interactions,
        });
    }
    async #onBindingCalled(event) {
        const { data } = event;
        if (data.name !== Spec.EVENT_BINDING_NAME) {
            return;
        }
        const webVitalsEvent = JSON.parse(data.payload);
        // Previously injected scripts will persist if DevTools is closed and reopened.
        // Ensure we only handle events from the same execution context as the most recent "reset" event.
        // "reset" events are only emitted once when the script is injected.
        if (webVitalsEvent.name === 'reset') {
            this.#lastResetContextId = data.executionContextId;
        }
        else if (this.#lastResetContextId !== data.executionContextId) {
            return;
        }
        // Async tasks can be performed while handling an event (e.g. resolving DOM node)
        // Use a mutex here to ensure the events are handled in the order they are received.
        await this.#mutex.run(async () => {
            await this.#handleWebVitalsEvent(webVitalsEvent, data.executionContextId);
        });
    }
    targetAdded(target) {
        if (target !== SDK.TargetManager.TargetManager.instance().primaryPageTarget()) {
            return;
        }
        void this.#enable(target);
    }
    targetRemoved(target) {
        if (target !== SDK.TargetManager.TargetManager.instance().primaryPageTarget()) {
            return;
        }
        void this.#disable();
    }
    async #enable(target) {
        if (this.#target) {
            return;
        }
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            return;
        }
        runtimeModel.addEventListener(SDK.RuntimeModel.Events.BindingCalled, this.#onBindingCalled, this);
        await runtimeModel.addBinding({
            name: Spec.EVENT_BINDING_NAME,
            executionContextName: LIVE_METRICS_WORLD_NAME,
        });
        const source = await InjectedScript.get();
        const { identifier } = await target.pageAgent().invoke_addScriptToEvaluateOnNewDocument({
            source,
            worldName: LIVE_METRICS_WORLD_NAME,
            runImmediately: true,
        });
        this.#scriptIdentifier = identifier;
        this.#target = target;
    }
    async #disable() {
        if (!this.#target) {
            return;
        }
        const runtimeModel = this.#target.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            return;
        }
        if (this.#scriptIdentifier) {
            await this.#target.pageAgent().invoke_removeScriptToEvaluateOnNewDocument({
                identifier: this.#scriptIdentifier,
            });
        }
        await runtimeModel.removeBinding({
            name: Spec.EVENT_BINDING_NAME,
        });
        runtimeModel.removeEventListener(SDK.RuntimeModel.Events.BindingCalled, this.#onBindingCalled, this);
        this.#target = undefined;
    }
}
//# sourceMappingURL=LiveMetrics.js.map