// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Platform from '../../../core/platform/platform.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as Util from '../util/util.js';
import { AssertedEventType, StepType, } from './Schema.js';
import { areSelectorsEqual, createEmulateNetworkConditionsStep, createViewportStep } from './SchemaUtils.js';
import { evaluateInAllFrames, getTargetFrameContext } from './SDKUtils.js';
const formatAsJSLiteral = Platform.StringUtilities.formatAsJSLiteral;
const unrelatedNavigationTypes = new Set([
    'typed',
    'address_bar',
    'auto_bookmark',
    'auto_subframe',
    'generated',
    'auto_toplevel',
    'reload',
    'keyword',
    'keyword_generated',
]);
const createShortcuts = (descriptors) => {
    const shortcuts = [];
    for (const shortcut of descriptors) {
        for (const key of shortcut) {
            const shortcutBase = { meta: false, ctrl: false, shift: false, alt: false, keyCode: -1 };
            const { keyCode, modifiers } = UI.KeyboardShortcut.KeyboardShortcut.keyCodeAndModifiersFromKey(key);
            shortcutBase.keyCode = keyCode;
            const modifiersMap = UI.KeyboardShortcut.Modifiers;
            shortcutBase.ctrl = Boolean(modifiers & modifiersMap.Ctrl);
            shortcutBase.meta = Boolean(modifiers & modifiersMap.Meta);
            shortcutBase.shift = Boolean(modifiers & modifiersMap.Shift);
            shortcutBase.shift = Boolean(modifiers & modifiersMap.Alt);
            if (shortcutBase.keyCode !== -1) {
                shortcuts.push(shortcutBase);
            }
        }
    }
    return shortcuts;
};
const evaluateInAllTargets = async (worldName, targets, expression) => {
    await Promise.all(targets.map(target => evaluateInAllFrames(worldName, target, expression)));
};
const RecorderBinding = Object.freeze({
    addStep: 'addStep',
    stopShortcut: 'stopShortcut',
});
export class RecordingSession extends Common.ObjectWrapper.ObjectWrapper {
    #target;
    #pageAgent;
    #targetAgent;
    #networkManager;
    #resourceTreeModel;
    #targets = new Map();
    #lastNavigationEntryIdByTarget = new Map();
    #lastNavigationHistoryByTarget = new Map();
    #scriptIdentifiers = new Map();
    #runtimeEventDescriptors = new Map();
    #childTargetEventDescriptors = new Map();
    #mutex = new Common.Mutex.Mutex();
    #userFlow;
    #stepsPendingNavigationByTargetId = new Map();
    #started = false;
    #selectorTypesToRecord = [];
    constructor(target, opts) {
        super();
        this.#target = target;
        this.#pageAgent = target.pageAgent();
        this.#targetAgent = target.targetAgent();
        this.#networkManager = SDK.NetworkManager.MultitargetNetworkManager.instance();
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('ResourceTreeModel is missing for the target: ' + target.id());
        }
        this.#resourceTreeModel = resourceTreeModel;
        this.#target = target;
        this.#userFlow = { title: opts.title, selectorAttribute: opts.selectorAttribute, steps: [] };
        this.#selectorTypesToRecord = opts.selectorTypesToRecord;
    }
    /**
     * @returns - A deep copy of the session's current user flow.
     */
    cloneUserFlow() {
        return structuredClone(this.#userFlow);
    }
    /**
     * Overwrites the session's current user flow with the given one.
     *
     * This method will not dispatch an `recordingupdated` event.
     */
    overwriteUserFlow(flow) {
        this.#userFlow = structuredClone(flow);
    }
    async start() {
        if (this.#started) {
            throw new Error('The session has started');
        }
        this.#started = true;
        this.#networkManager.addEventListener("ConditionsChanged" /* SDK.NetworkManager.MultitargetNetworkManager.Events.ConditionsChanged */, this.#appendCurrentNetworkStep, this);
        await this.#appendInitialSteps();
        // Focus the target so that events can be captured without additional actions.
        await this.#pageAgent.invoke_bringToFront();
        await this.#setUpTarget(this.#target);
    }
    async stop() {
        // Wait for any remaining updates.
        await this.#dispatchRecordingUpdate();
        // Create a deadlock for the remaining events.
        void this.#mutex.acquire();
        await Promise.all([...this.#targets.values()].map(this.#tearDownTarget));
        this.#networkManager.removeEventListener("ConditionsChanged" /* SDK.NetworkManager.MultitargetNetworkManager.Events.ConditionsChanged */, this.#appendCurrentNetworkStep, this);
    }
    async #appendInitialSteps() {
        // Quick validation before doing anything.
        const mainFrame = this.#resourceTreeModel.mainFrame;
        if (!mainFrame) {
            throw new Error('Could not find mainFrame.');
        }
        // Network step.
        if (this.#networkManager.networkConditions() !== SDK.NetworkManager.NoThrottlingConditions) {
            this.#appendCurrentNetworkStep();
        }
        // Viewport step.
        const { cssLayoutViewport } = await this.#target.pageAgent().invoke_getLayoutMetrics();
        this.#appendStep(createViewportStep(cssLayoutViewport));
        // Navigation step.
        const history = await this.#resourceTreeModel.navigationHistory();
        if (history) {
            const entry = history.entries[history.currentIndex];
            this.#lastNavigationEntryIdByTarget.set(this.#target.id(), entry.id);
            this.#lastNavigationHistoryByTarget.set(this.#target.id(), history.entries.map(entry => entry.id));
            this.#userFlow.steps.push({
                type: StepType.Navigate,
                url: entry.url,
                assertedEvents: [{ type: AssertedEventType.Navigation, url: entry.url, title: entry.title }],
            });
        }
        else {
            this.#userFlow.steps.push({
                type: StepType.Navigate,
                url: mainFrame.url,
                assertedEvents: [
                    { type: AssertedEventType.Navigation, url: mainFrame.url, title: await this.#getDocumentTitle(this.#target) },
                ],
            });
        }
        // Commit
        void this.#dispatchRecordingUpdate();
    }
    async #getDocumentTitle(target) {
        const response = await target.runtimeAgent().invoke_evaluate({ expression: 'document.title' });
        return response.result?.value || '';
    }
    #appendCurrentNetworkStep() {
        const networkConditions = this.#networkManager.networkConditions();
        this.#appendStep(createEmulateNetworkConditionsStep(networkConditions));
    }
    #updateTimeout;
    #updateListeners = [];
    #dispatchRecordingUpdate() {
        if (this.#updateTimeout) {
            clearTimeout(this.#updateTimeout);
        }
        this.#updateTimeout = setTimeout(() => {
            // Making a copy to prevent mutations of this.userFlow by event consumers.
            this.dispatchEventToListeners("recordingupdated" /* Events.RecordingUpdated */, structuredClone(this.#userFlow));
            this.#updateTimeout = undefined;
            for (const resolve of this.#updateListeners) {
                resolve();
            }
            this.#updateListeners.length = 0;
        }, 100);
        return new Promise(resolve => {
            this.#updateListeners.push(resolve);
        });
    }
    get #previousStep() {
        return this.#userFlow.steps.slice(-1)[0];
    }
    /**
     * Contains keys that are pressed related to a change step.
     */
    #pressedChangeKeys = new Set();
    /**
     * Shift-reduces a given step into the user flow.
     */
    #appendStep(step) {
        switch (step.type) {
            case 'doubleClick': {
                for (let j = this.#userFlow.steps.length - 1; j > 0; j--) {
                    const previousStep = this.#userFlow.steps[j];
                    if (previousStep.type === 'click') {
                        step.selectors = previousStep.selectors;
                        this.#userFlow.steps.splice(j, 1);
                        break;
                    }
                }
                break;
            }
            case 'change': {
                const previousStep = this.#previousStep;
                if (!previousStep) {
                    break;
                }
                switch (previousStep.type) {
                    // Merging changes.
                    case 'change':
                        if (!areSelectorsEqual(step, previousStep)) {
                            break;
                        }
                        this.#userFlow.steps[this.#userFlow.steps.length - 1] = step;
                        void this.#dispatchRecordingUpdate();
                        return;
                    // Ignore key downs resulting in inputs.
                    case 'keyDown':
                        this.#pressedChangeKeys.add(previousStep.key);
                        this.#userFlow.steps.pop();
                        this.#appendStep(step);
                        return;
                }
                break;
            }
            case 'keyDown': {
                // This can happen if there are successive keydown's from a repeated key
                // for example.
                if (this.#pressedChangeKeys.has(step.key)) {
                    return;
                }
                break;
            }
            case 'keyUp': {
                // Ignore key ups coming from change inputs.
                if (this.#pressedChangeKeys.has(step.key)) {
                    this.#pressedChangeKeys.delete(step.key);
                    return;
                }
                break;
            }
        }
        this.#userFlow.steps.push(step);
        void this.#dispatchRecordingUpdate();
    }
    #handleBeforeUnload(context, sdkTarget) {
        const lastStep = this.#userFlow.steps[this.#userFlow.steps.length - 1];
        if (lastStep && !lastStep.assertedEvents?.find(event => event.type === AssertedEventType.Navigation)) {
            const target = context.target || 'main';
            const frameSelector = (context.frame || []).join(',');
            const lastStepTarget = lastStep.target || 'main';
            const lastStepFrameSelector = (('frame' in lastStep ? lastStep.frame : []) || []).join(',');
            if (target === lastStepTarget && frameSelector === lastStepFrameSelector) {
                lastStep.assertedEvents = [{ type: AssertedEventType.Navigation }];
                this.#stepsPendingNavigationByTargetId.set(sdkTarget.id(), lastStep);
                void this.#dispatchRecordingUpdate();
            }
        }
    }
    #replaceUnloadWithNavigation(target, event) {
        const stepPendingNavigation = this.#stepsPendingNavigationByTargetId.get(target.id());
        if (!stepPendingNavigation) {
            return;
        }
        const step = stepPendingNavigation;
        if (!step.assertedEvents) {
            return;
        }
        const navigationEvent = step.assertedEvents.find(event => event.type === AssertedEventType.Navigation);
        if (!navigationEvent || navigationEvent.url) {
            return;
        }
        navigationEvent.url = event.url;
        navigationEvent.title = event.title;
        void this.#dispatchRecordingUpdate();
    }
    #handleStopShortcutBinding(event) {
        const shortcutLength = Number(event.data.payload);
        // Look for one less step as the last one gets consumed before creating a step
        for (let index = 0; index < shortcutLength - 1; index++) {
            this.#userFlow.steps.pop();
        }
        this.dispatchEventToListeners("recordingstopped" /* Events.RecordingStopped */, structuredClone(this.#userFlow));
    }
    #receiveBindingCalled(target, event) {
        switch (event.data.name) {
            case RecorderBinding.stopShortcut:
                this.#handleStopShortcutBinding(event);
                return;
            case RecorderBinding.addStep:
                this.#handleAddStepBinding(target, event);
                return;
            default:
                return;
        }
    }
    #handleAddStepBinding(target, event) {
        const executionContextId = event.data.executionContextId;
        let frameId;
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        if (runtimeModel) {
            for (const context of runtimeModel.executionContexts()) {
                if (context.id === executionContextId) {
                    frameId = context.frameId;
                    break;
                }
            }
        }
        if (!frameId) {
            throw new Error('No execution context found for the binding call + ' + JSON.stringify(event.data));
        }
        const step = JSON.parse(event.data.payload);
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        const frame = resourceTreeModel.frameForId(frameId);
        if (!frame) {
            throw new Error('Could not find frame.');
        }
        const context = getTargetFrameContext(target, frame);
        if (step.type === 'beforeUnload') {
            this.#handleBeforeUnload(context, target);
            return;
        }
        // TODO: type-safe parsing from client steps to internal step format.
        switch (step.type) {
            case 'change': {
                this.#appendStep({
                    type: 'change',
                    value: step.value,
                    selectors: step.selectors,
                    frame: context.frame.length ? context.frame : undefined,
                    target: context.target,
                });
                break;
            }
            case 'doubleClick': {
                this.#appendStep({
                    type: 'doubleClick',
                    target: context.target,
                    selectors: step.selectors,
                    offsetY: step.offsetY,
                    offsetX: step.offsetX,
                    frame: context.frame.length ? context.frame : undefined,
                    deviceType: step.deviceType,
                    button: step.button,
                });
                break;
            }
            case 'click': {
                this.#appendStep({
                    type: 'click',
                    target: context.target,
                    selectors: step.selectors,
                    offsetY: step.offsetY,
                    offsetX: step.offsetX,
                    frame: context.frame.length ? context.frame : undefined,
                    duration: step.duration,
                    deviceType: step.deviceType,
                    button: step.button,
                });
                break;
            }
            case 'keyUp': {
                this.#appendStep({
                    type: 'keyUp',
                    key: step.key,
                    frame: context.frame.length ? context.frame : undefined,
                    target: context.target,
                });
                break;
            }
            case 'keyDown': {
                this.#appendStep({
                    type: 'keyDown',
                    frame: context.frame.length ? context.frame : undefined,
                    target: context.target,
                    key: step.key,
                });
                break;
            }
            default:
                throw new Error('Unhandled client event');
        }
    }
    #getStopShortcuts() {
        const descriptors = UI.ShortcutRegistry.ShortcutRegistry.instance()
            .shortcutsForAction('chrome-recorder.start-recording')
            .map(key => key.descriptors.map(press => press.key));
        return createShortcuts(descriptors);
    }
    static get #allowUntrustedEvents() {
        try {
            // This setting is set during the test to work around the fact that Puppeteer cannot
            // send trusted change and input events.
            Common.Settings.Settings.instance().settingForTest('untrusted-recorder-events');
            return true;
        }
        catch {
        }
        return false;
    }
    #setUpTarget = async (target) => {
        if (target.type() !== SDK.Target.Type.Frame) {
            return;
        }
        this.#targets.set(target.id(), target);
        const a11yModel = target.model(SDK.AccessibilityModel.AccessibilityModel);
        Platform.assertNotNullOrUndefined(a11yModel);
        await a11yModel.resumeModel();
        await this.#addBindings(target);
        await this.#injectApplicationScript(target);
        const childTargetManager = target.model(SDK.ChildTargetManager.ChildTargetManager);
        Platform.assertNotNullOrUndefined(childTargetManager);
        this.#childTargetEventDescriptors.set(target, [
            childTargetManager.addEventListener("TargetCreated" /* SDK.ChildTargetManager.Events.TargetCreated */, this.#receiveTargetCreated.bind(this, target)),
            childTargetManager.addEventListener("TargetDestroyed" /* SDK.ChildTargetManager.Events.TargetDestroyed */, this.#receiveTargetClosed.bind(this, target)),
            childTargetManager.addEventListener("TargetInfoChanged" /* SDK.ChildTargetManager.Events.TargetInfoChanged */, this.#receiveTargetInfoChanged.bind(this, target)),
        ]);
        await Promise.all(childTargetManager.childTargets().map(this.#setUpTarget));
    };
    #tearDownTarget = async (target) => {
        const descriptors = this.#childTargetEventDescriptors.get(target);
        if (descriptors) {
            Common.EventTarget.removeEventListeners(descriptors);
        }
        await this.#injectCleanUpScript(target);
        await this.#removeBindings(target);
    };
    async #addBindings(target) {
        const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        Platform.assertNotNullOrUndefined(runtimeModel);
        this.#runtimeEventDescriptors.set(target, [runtimeModel.addEventListener(SDK.RuntimeModel.Events.BindingCalled, this.#receiveBindingCalled.bind(this, target))]);
        await Promise.all(Object.values(RecorderBinding)
            .map(name => runtimeModel.addBinding({ name, executionContextName: Util.DEVTOOLS_RECORDER_WORLD_NAME })));
    }
    async #removeBindings(target) {
        await Promise.all(Object.values(RecorderBinding).map(name => target.runtimeAgent().invoke_removeBinding({ name })));
        const descriptors = this.#runtimeEventDescriptors.get(target);
        if (descriptors) {
            Common.EventTarget.removeEventListeners(descriptors);
        }
    }
    async #injectApplicationScript(target) {
        const injectedScript = await Util.InjectedScript.get();
        const script = `
      ${injectedScript};DevToolsRecorder.startRecording({getAccessibleName, getAccessibleRole}, {
        debug: ${Util.isDebugBuild},
        allowUntrustedEvents: ${RecordingSession.#allowUntrustedEvents},
        selectorTypesToRecord: ${JSON.stringify(this.#selectorTypesToRecord)},
        selectorAttribute: ${this.#userFlow.selectorAttribute ? formatAsJSLiteral(this.#userFlow.selectorAttribute) : undefined},
        stopShortcuts: ${JSON.stringify(this.#getStopShortcuts())},
      });
    `;
        const [{ identifier }] = await Promise.all([
            target.pageAgent().invoke_addScriptToEvaluateOnNewDocument({ source: script, worldName: Util.DEVTOOLS_RECORDER_WORLD_NAME, includeCommandLineAPI: true }),
            evaluateInAllFrames(Util.DEVTOOLS_RECORDER_WORLD_NAME, target, script),
        ]);
        this.#scriptIdentifiers.set(target.id(), identifier);
    }
    async #injectCleanUpScript(target) {
        const scriptId = this.#scriptIdentifiers.get(target.id());
        if (!scriptId) {
            return;
        }
        await target.pageAgent().invoke_removeScriptToEvaluateOnNewDocument({ identifier: scriptId });
        await evaluateInAllTargets(Util.DEVTOOLS_RECORDER_WORLD_NAME, [...this.#targets.values()], 'DevToolsRecorder.stopRecording()');
    }
    #receiveTargetCreated(target, event) {
        void this.#handleEvent({ type: 'targetCreated', event, target });
    }
    #receiveTargetClosed(eventTarget, event) {
        // TODO(alexrudenko): target here appears to be the parent target of the target that is closed.
        // Therefore, we need to find the real target via the targets map.
        const childTarget = this.#targets.get(event.data);
        if (childTarget) {
            void this.#handleEvent({ type: 'targetClosed', event, target: childTarget });
        }
    }
    #receiveTargetInfoChanged(eventTarget, event) {
        const target = this.#targets.get(event.data.targetId) || eventTarget;
        void this.#handleEvent({ type: 'targetInfoChanged', event, target });
    }
    #handleEvent(event) {
        return this.#mutex.run(async () => {
            try {
                if (Util.isDebugBuild) {
                    console.time(`Processing ${JSON.stringify(event)}`);
                }
                switch (event.type) {
                    case 'targetClosed':
                        await this.#handleTargetClosed(event);
                        break;
                    case 'targetCreated':
                        await this.#handleTargetCreated(event);
                        break;
                    case 'targetInfoChanged':
                        await this.#handleTargetInfoChanged(event);
                        break;
                }
                if (Util.isDebugBuild) {
                    console.timeEnd(`Processing ${JSON.stringify(event)}`);
                }
            }
            catch (err) {
                console.error('Error happened while processing recording events: ', err.message, err.stack);
            }
        });
    }
    async #handleTargetCreated(event) {
        if (event.event.data.type !== 'page' && event.event.data.type !== 'iframe') {
            return;
        }
        await this.#targetAgent.invoke_attachToTarget({ targetId: event.event.data.targetId, flatten: true });
        const target = SDK.TargetManager.TargetManager.instance().targets().find(t => t.id() === event.event.data.targetId);
        if (!target) {
            throw new Error('Could not find target.');
        }
        // Generally an new target implies all other targets are not waiting for something special in their event buffers, so we flush them here.
        await this.#setUpTarget(target);
        // Emitted for e2e tests.
        window.dispatchEvent(new Event('recorderAttachedToTarget'));
    }
    async #handleTargetClosed(event) {
        const stepPendingNavigation = this.#stepsPendingNavigationByTargetId.get(event.target.id());
        if (stepPendingNavigation) {
            delete stepPendingNavigation.assertedEvents;
            this.#stepsPendingNavigationByTargetId.delete(event.target.id());
        }
        // TODO(alexrudenko): figure out how this works with sections
        // TODO(alexrudenko): Ignore close events as they only matter for popups but cause more trouble than benefits
        // const closeStep: CloseStep = {
        //   type: 'close',
        //   target: getTargetName(event.target),
        // };
        // this.appendStep(closeStep);
    }
    async #handlePageNavigation(resourceTreeModel, target) {
        const history = await resourceTreeModel.navigationHistory();
        if (!history) {
            return false;
        }
        const entry = history.entries[history.currentIndex];
        const prevId = this.#lastNavigationEntryIdByTarget.get(target.id());
        if (prevId === entry.id) {
            return true;
        }
        this.#lastNavigationEntryIdByTarget.set(target.id(), entry.id);
        const lastHistory = this.#lastNavigationHistoryByTarget.get(target.id()) || [];
        this.#lastNavigationHistoryByTarget.set(target.id(), history.entries.map(entry => entry.id));
        if (unrelatedNavigationTypes.has(entry.transitionType) || lastHistory.includes(entry.id)) {
            const stepPendingNavigation = this.#stepsPendingNavigationByTargetId.get(target.id());
            if (stepPendingNavigation) {
                delete stepPendingNavigation.assertedEvents;
                this.#stepsPendingNavigationByTargetId.delete(target.id());
            }
            this.#appendStep({
                type: StepType.Navigate,
                url: entry.url,
                assertedEvents: [{ type: AssertedEventType.Navigation, url: entry.url, title: entry.title }],
            });
        }
        else {
            this.#replaceUnloadWithNavigation(target, { type: AssertedEventType.Navigation, url: entry.url, title: entry.title });
        }
        return true;
    }
    async #handleTargetInfoChanged(event) {
        if (event.event.data.type !== 'page' && event.event.data.type !== 'iframe') {
            return;
        }
        const target = event.target;
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('ResourceTreeModel is missing in handleNavigation');
        }
        if (event.event.data.type === 'iframe') {
            this.#replaceUnloadWithNavigation(target, { type: AssertedEventType.Navigation, url: event.event.data.url, title: await this.#getDocumentTitle(target) });
        }
        else if (event.event.data.type === 'page') {
            if (await this.#handlePageNavigation(resourceTreeModel, target)) {
                return;
            }
            // Needed for #getDocumentTitle to return something meaningful.
            await this.#waitForDOMContentLoadedWithTimeout(resourceTreeModel, 500);
            this.#replaceUnloadWithNavigation(target, { type: AssertedEventType.Navigation, url: event.event.data.url, title: await this.#getDocumentTitle(target) });
        }
    }
    async #waitForDOMContentLoadedWithTimeout(resourceTreeModel, timeout) {
        let resolver = () => Promise.resolve();
        const contentLoadedPromise = new Promise(resolve => {
            resolver = resolve;
        });
        const onDomContentLoaded = () => {
            resourceTreeModel.removeEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded, onDomContentLoaded);
            resolver();
        };
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded, onDomContentLoaded);
        await Promise.any([
            contentLoadedPromise,
            new Promise(resolve => setTimeout(() => {
                resourceTreeModel.removeEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded, onDomContentLoaded);
                resolve();
            }, timeout)),
        ]);
    }
}
//# sourceMappingURL=RecordingSession.js.map