// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import { CategorizedBreakpoint } from './CategorizedBreakpoint.js';
import { DOMModel, Events as DOMModelEvents } from './DOMModel.js';
import { RemoteObject } from './RemoteObject.js';
import { RuntimeModel } from './RuntimeModel.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
export class DOMDebuggerModel extends SDKModel {
    agent;
    #runtimeModelInternal;
    #domModel;
    #domBreakpointsInternal;
    #domBreakpointsSetting;
    suspended = false;
    constructor(target) {
        super(target);
        this.agent = target.domdebuggerAgent();
        this.#runtimeModelInternal = target.model(RuntimeModel);
        this.#domModel = target.model(DOMModel);
        this.#domModel.addEventListener(DOMModelEvents.DocumentUpdated, this.documentUpdated, this);
        this.#domModel.addEventListener(DOMModelEvents.NodeRemoved, this.nodeRemoved, this);
        this.#domBreakpointsInternal = [];
        this.#domBreakpointsSetting = Common.Settings.Settings.instance().createLocalSetting('dom-breakpoints', []);
        if (this.#domModel.existingDocument()) {
            void this.documentUpdated();
        }
    }
    runtimeModel() {
        return this.#runtimeModelInternal;
    }
    async suspendModel() {
        this.suspended = true;
    }
    async resumeModel() {
        this.suspended = false;
    }
    async eventListeners(remoteObject) {
        console.assert(remoteObject.runtimeModel() === this.#runtimeModelInternal);
        if (!remoteObject.objectId) {
            return [];
        }
        const listeners = await this.agent.invoke_getEventListeners({ objectId: remoteObject.objectId });
        const eventListeners = [];
        for (const payload of listeners.listeners || []) {
            const location = this.#runtimeModelInternal.debuggerModel().createRawLocationByScriptId(payload.scriptId, payload.lineNumber, payload.columnNumber);
            if (!location) {
                continue;
            }
            eventListeners.push(new EventListener(this, remoteObject, payload.type, payload.useCapture, payload.passive, payload.once, payload.handler ? this.#runtimeModelInternal.createRemoteObject(payload.handler) : null, payload.originalHandler ? this.#runtimeModelInternal.createRemoteObject(payload.originalHandler) : null, location, null));
        }
        return eventListeners;
    }
    retrieveDOMBreakpoints() {
        void this.#domModel.requestDocument();
    }
    domBreakpoints() {
        return this.#domBreakpointsInternal.slice();
    }
    hasDOMBreakpoint(node, type) {
        return this.#domBreakpointsInternal.some(breakpoint => (breakpoint.node === node && breakpoint.type === type));
    }
    setDOMBreakpoint(node, type) {
        for (const breakpoint of this.#domBreakpointsInternal) {
            if (breakpoint.node === node && breakpoint.type === type) {
                this.toggleDOMBreakpoint(breakpoint, true);
                return breakpoint;
            }
        }
        const breakpoint = new DOMBreakpoint(this, node, type, true);
        this.#domBreakpointsInternal.push(breakpoint);
        this.saveDOMBreakpoints();
        this.enableDOMBreakpoint(breakpoint);
        this.dispatchEventToListeners("DOMBreakpointAdded" /* Events.DOMBreakpointAdded */, breakpoint);
        return breakpoint;
    }
    removeDOMBreakpoint(node, type) {
        this.removeDOMBreakpoints(breakpoint => breakpoint.node === node && breakpoint.type === type);
    }
    removeAllDOMBreakpoints() {
        this.removeDOMBreakpoints(_breakpoint => true);
    }
    toggleDOMBreakpoint(breakpoint, enabled) {
        if (enabled === breakpoint.enabled) {
            return;
        }
        breakpoint.enabled = enabled;
        if (enabled) {
            this.enableDOMBreakpoint(breakpoint);
        }
        else {
            this.disableDOMBreakpoint(breakpoint);
        }
        this.dispatchEventToListeners("DOMBreakpointToggled" /* Events.DOMBreakpointToggled */, breakpoint);
    }
    enableDOMBreakpoint(breakpoint) {
        if (breakpoint.node.id) {
            void this.agent.invoke_setDOMBreakpoint({ nodeId: breakpoint.node.id, type: breakpoint.type });
            breakpoint.node.setMarker(Marker, true);
        }
    }
    disableDOMBreakpoint(breakpoint) {
        if (breakpoint.node.id) {
            void this.agent.invoke_removeDOMBreakpoint({ nodeId: breakpoint.node.id, type: breakpoint.type });
            breakpoint.node.setMarker(Marker, this.nodeHasBreakpoints(breakpoint.node) ? true : null);
        }
    }
    nodeHasBreakpoints(node) {
        for (const breakpoint of this.#domBreakpointsInternal) {
            if (breakpoint.node === node && breakpoint.enabled) {
                return true;
            }
        }
        return false;
    }
    resolveDOMBreakpointData(auxData) {
        const type = auxData['type'];
        const node = this.#domModel.nodeForId(auxData['nodeId']);
        if (!type || !node) {
            return null;
        }
        let targetNode = null;
        let insertion = false;
        if (type === "subtree-modified" /* Protocol.DOMDebugger.DOMBreakpointType.SubtreeModified */) {
            insertion = auxData['insertion'] || false;
            targetNode = this.#domModel.nodeForId(auxData['targetNodeId']);
        }
        return { type: type, node: node, targetNode: targetNode, insertion: insertion };
    }
    currentURL() {
        const domDocument = this.#domModel.existingDocument();
        return domDocument ? domDocument.documentURL : Platform.DevToolsPath.EmptyUrlString;
    }
    async documentUpdated() {
        if (this.suspended) {
            return;
        }
        const removed = this.#domBreakpointsInternal;
        this.#domBreakpointsInternal = [];
        this.dispatchEventToListeners("DOMBreakpointsRemoved" /* Events.DOMBreakpointsRemoved */, removed);
        // this.currentURL() is empty when the page is reloaded because the
        // new document has not been requested yet and the old one has been
        // removed. Therefore, we need to request the document and wait for it.
        // Note that requestDocument() caches the document so that it is requested
        // only once.
        const document = await this.#domModel.requestDocument();
        const currentURL = document ? document.documentURL : Platform.DevToolsPath.EmptyUrlString;
        for (const breakpoint of this.#domBreakpointsSetting.get()) {
            if (breakpoint.url === currentURL) {
                void this.#domModel.pushNodeByPathToFrontend(breakpoint.path).then(appendBreakpoint.bind(this, breakpoint));
            }
        }
        function appendBreakpoint(breakpoint, nodeId) {
            const node = nodeId ? this.#domModel.nodeForId(nodeId) : null;
            if (!node) {
                return;
            }
            const domBreakpoint = new DOMBreakpoint(this, node, breakpoint.type, breakpoint.enabled);
            this.#domBreakpointsInternal.push(domBreakpoint);
            if (breakpoint.enabled) {
                this.enableDOMBreakpoint(domBreakpoint);
            }
            this.dispatchEventToListeners("DOMBreakpointAdded" /* Events.DOMBreakpointAdded */, domBreakpoint);
        }
    }
    removeDOMBreakpoints(filter) {
        const removed = [];
        const left = [];
        for (const breakpoint of this.#domBreakpointsInternal) {
            if (filter(breakpoint)) {
                removed.push(breakpoint);
                if (breakpoint.enabled) {
                    breakpoint.enabled = false;
                    this.disableDOMBreakpoint(breakpoint);
                }
            }
            else {
                left.push(breakpoint);
            }
        }
        if (!removed.length) {
            return;
        }
        this.#domBreakpointsInternal = left;
        this.saveDOMBreakpoints();
        this.dispatchEventToListeners("DOMBreakpointsRemoved" /* Events.DOMBreakpointsRemoved */, removed);
    }
    nodeRemoved(event) {
        if (this.suspended) {
            return;
        }
        const { node } = event.data;
        const children = node.children() || [];
        this.removeDOMBreakpoints(breakpoint => breakpoint.node === node || children.indexOf(breakpoint.node) !== -1);
    }
    saveDOMBreakpoints() {
        const currentURL = this.currentURL();
        const breakpoints = this.#domBreakpointsSetting.get().filter((breakpoint) => breakpoint.url !== currentURL);
        for (const breakpoint of this.#domBreakpointsInternal) {
            breakpoints.push({ url: currentURL, path: breakpoint.node.path(), type: breakpoint.type, enabled: breakpoint.enabled });
        }
        this.#domBreakpointsSetting.set(breakpoints);
    }
}
const Marker = 'breakpoint-marker';
export class DOMBreakpoint {
    domDebuggerModel;
    node;
    type;
    enabled;
    constructor(domDebuggerModel, node, type, enabled) {
        this.domDebuggerModel = domDebuggerModel;
        this.node = node;
        this.type = type;
        this.enabled = enabled;
    }
}
export class EventListener {
    #domDebuggerModelInternal;
    #eventTarget;
    #typeInternal;
    #useCaptureInternal;
    #passiveInternal;
    #onceInternal;
    #handlerInternal;
    #originalHandlerInternal;
    #locationInternal;
    #sourceURLInternal;
    #customRemoveFunction;
    #originInternal;
    constructor(domDebuggerModel, eventTarget, type, useCapture, passive, once, handler, originalHandler, location, customRemoveFunction, origin) {
        this.#domDebuggerModelInternal = domDebuggerModel;
        this.#eventTarget = eventTarget;
        this.#typeInternal = type;
        this.#useCaptureInternal = useCapture;
        this.#passiveInternal = passive;
        this.#onceInternal = once;
        this.#handlerInternal = handler;
        this.#originalHandlerInternal = originalHandler || handler;
        this.#locationInternal = location;
        const script = location.script();
        this.#sourceURLInternal = script ? script.contentURL() : Platform.DevToolsPath.EmptyUrlString;
        this.#customRemoveFunction = customRemoveFunction;
        this.#originInternal = origin || "Raw" /* EventListener.Origin.Raw */;
    }
    domDebuggerModel() {
        return this.#domDebuggerModelInternal;
    }
    type() {
        return this.#typeInternal;
    }
    useCapture() {
        return this.#useCaptureInternal;
    }
    passive() {
        return this.#passiveInternal;
    }
    once() {
        return this.#onceInternal;
    }
    handler() {
        return this.#handlerInternal;
    }
    location() {
        return this.#locationInternal;
    }
    sourceURL() {
        return this.#sourceURLInternal;
    }
    originalHandler() {
        return this.#originalHandlerInternal;
    }
    canRemove() {
        return Boolean(this.#customRemoveFunction) || this.#originInternal !== "FrameworkUser" /* EventListener.Origin.FrameworkUser */;
    }
    remove() {
        if (!this.canRemove()) {
            return Promise.resolve(undefined);
        }
        if (this.#originInternal !== "FrameworkUser" /* EventListener.Origin.FrameworkUser */) {
            function removeListener(type, listener, useCapture) {
                this.removeEventListener(type, listener, useCapture);
                // @ts-ignore:
                if (this['on' + type]) {
                    // @ts-ignore:
                    this['on' + type] = undefined;
                }
            }
            return this.#eventTarget
                .callFunction(removeListener, [
                RemoteObject.toCallArgument(this.#typeInternal),
                RemoteObject.toCallArgument(this.#originalHandlerInternal),
                RemoteObject.toCallArgument(this.#useCaptureInternal),
            ])
                .then(() => undefined);
        }
        if (this.#customRemoveFunction) {
            function callCustomRemove(type, listener, useCapture, passive) {
                this.call(null, type, listener, useCapture, passive);
            }
            return this.#customRemoveFunction
                .callFunction(callCustomRemove, [
                RemoteObject.toCallArgument(this.#typeInternal),
                RemoteObject.toCallArgument(this.#originalHandlerInternal),
                RemoteObject.toCallArgument(this.#useCaptureInternal),
                RemoteObject.toCallArgument(this.#passiveInternal),
            ])
                .then(() => undefined);
        }
        return Promise.resolve(undefined);
    }
    canTogglePassive() {
        return this.#originInternal !== "FrameworkUser" /* EventListener.Origin.FrameworkUser */;
    }
    togglePassive() {
        return this.#eventTarget
            .callFunction(callTogglePassive, [
            RemoteObject.toCallArgument(this.#typeInternal),
            RemoteObject.toCallArgument(this.#originalHandlerInternal),
            RemoteObject.toCallArgument(this.#useCaptureInternal),
            RemoteObject.toCallArgument(this.#passiveInternal),
        ])
            .then(() => undefined);
        function callTogglePassive(type, listener, useCapture, passive) {
            this.removeEventListener(type, listener, { capture: useCapture });
            this.addEventListener(type, listener, { capture: useCapture, passive: !passive });
        }
    }
    origin() {
        return this.#originInternal;
    }
    markAsFramework() {
        this.#originInternal = "Framework" /* EventListener.Origin.Framework */;
    }
    isScrollBlockingType() {
        return this.#typeInternal === 'touchstart' || this.#typeInternal === 'touchmove' ||
            this.#typeInternal === 'mousewheel' || this.#typeInternal === 'wheel';
    }
}
export class CSPViolationBreakpoint extends CategorizedBreakpoint {
    #typeInternal;
    constructor(category, type) {
        super(category, type);
        this.#typeInternal = type;
    }
    type() {
        return this.#typeInternal;
    }
}
export class DOMEventListenerBreakpoint extends CategorizedBreakpoint {
    eventTargetNames;
    constructor(eventName, eventTargetNames, category) {
        super(category, eventName);
        this.eventTargetNames = eventTargetNames;
    }
    setEnabled(enabled) {
        if (this.enabled() === enabled) {
            return;
        }
        super.setEnabled(enabled);
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            this.updateOnModel(model);
        }
    }
    updateOnModel(model) {
        for (const eventTargetName of this.eventTargetNames) {
            if (this.enabled()) {
                void model.agent.invoke_setEventListenerBreakpoint({ eventName: this.name, targetName: eventTargetName });
            }
            else {
                void model.agent.invoke_removeEventListenerBreakpoint({ eventName: this.name, targetName: eventTargetName });
            }
        }
    }
    static listener = 'listener:';
}
let domDebuggerManagerInstance;
export class DOMDebuggerManager {
    #xhrBreakpointsSetting;
    #xhrBreakpointsInternal;
    #cspViolationsToBreakOn;
    #eventListenerBreakpointsInternal;
    constructor() {
        this.#xhrBreakpointsSetting = Common.Settings.Settings.instance().createLocalSetting('xhr-breakpoints', []);
        this.#xhrBreakpointsInternal = new Map();
        for (const breakpoint of this.#xhrBreakpointsSetting.get()) {
            this.#xhrBreakpointsInternal.set(breakpoint.url, breakpoint.enabled);
        }
        this.#cspViolationsToBreakOn = [];
        this.#cspViolationsToBreakOn.push(new CSPViolationBreakpoint("trusted-type-violation" /* Category.TrustedTypeViolation */, "trustedtype-sink-violation" /* Protocol.DOMDebugger.CSPViolationType.TrustedtypeSinkViolation */));
        this.#cspViolationsToBreakOn.push(new CSPViolationBreakpoint("trusted-type-violation" /* Category.TrustedTypeViolation */, "trustedtype-policy-violation" /* Protocol.DOMDebugger.CSPViolationType.TrustedtypePolicyViolation */));
        this.#eventListenerBreakpointsInternal = [];
        this.createEventListenerBreakpoints("media" /* Category.Media */, [
            'play', 'pause', 'playing', 'canplay', 'canplaythrough', 'seeking',
            'seeked', 'timeupdate', 'ended', 'ratechange', 'durationchange', 'volumechange',
            'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied',
            'stalled', 'loadedmetadata', 'loadeddata', 'waiting',
        ], ['audio', 'video']);
        this.createEventListenerBreakpoints("picture-in-picture" /* Category.PictureInPicture */, ['enterpictureinpicture', 'leavepictureinpicture'], ['video']);
        this.createEventListenerBreakpoints("picture-in-picture" /* Category.PictureInPicture */, ['resize'], ['PictureInPictureWindow']);
        this.createEventListenerBreakpoints("picture-in-picture" /* Category.PictureInPicture */, ['enter'], ['documentPictureInPicture']);
        this.createEventListenerBreakpoints("clipboard" /* Category.Clipboard */, ['copy', 'cut', 'paste', 'beforecopy', 'beforecut', 'beforepaste'], ['*']);
        this.createEventListenerBreakpoints("control" /* Category.Control */, [
            'resize',
            'scroll',
            'scrollend',
            'scrollsnapchange',
            'scrollsnapchanging',
            'zoom',
            'focus',
            'blur',
            'select',
            'change',
            'submit',
            'reset',
        ], ['*']);
        this.createEventListenerBreakpoints("device" /* Category.Device */, ['deviceorientation', 'devicemotion'], ['*']);
        this.createEventListenerBreakpoints("dom-mutation" /* Category.DomMutation */, [
            'DOMActivate',
            'DOMFocusIn',
            'DOMFocusOut',
            'DOMAttrModified',
            'DOMCharacterDataModified',
            'DOMNodeInserted',
            'DOMNodeInsertedIntoDocument',
            'DOMNodeRemoved',
            'DOMNodeRemovedFromDocument',
            'DOMSubtreeModified',
            'DOMContentLoaded',
        ], ['*']);
        this.createEventListenerBreakpoints("drag-drop" /* Category.DragDrop */, ['drag', 'dragstart', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop'], ['*']);
        this.createEventListenerBreakpoints("keyboard" /* Category.Keyboard */, ['keydown', 'keyup', 'keypress', 'input'], ['*']);
        this.createEventListenerBreakpoints("load" /* Category.Load */, [
            'load',
            'beforeunload',
            'unload',
            'abort',
            'error',
            'hashchange',
            'popstate',
            'navigate',
            'navigatesuccess',
            'navigateerror',
            'currentchange',
            'navigateto',
            'navigatefrom',
            'finish',
            'dispose',
        ], ['*']);
        this.createEventListenerBreakpoints("mouse" /* Category.Mouse */, [
            'auxclick',
            'click',
            'dblclick',
            'mousedown',
            'mouseup',
            'mouseover',
            'mousemove',
            'mouseout',
            'mouseenter',
            'mouseleave',
            'mousewheel',
            'wheel',
            'contextmenu',
        ], ['*']);
        this.createEventListenerBreakpoints("pointer" /* Category.Pointer */, [
            'pointerover',
            'pointerout',
            'pointerenter',
            'pointerleave',
            'pointerdown',
            'pointerup',
            'pointermove',
            'pointercancel',
            'gotpointercapture',
            'lostpointercapture',
            'pointerrawupdate',
        ], ['*']);
        this.createEventListenerBreakpoints("touch" /* Category.Touch */, ['touchstart', 'touchmove', 'touchend', 'touchcancel'], ['*']);
        this.createEventListenerBreakpoints("worker" /* Category.Worker */, ['message', 'messageerror'], ['*']);
        this.createEventListenerBreakpoints("xhr" /* Category.Xhr */, ['readystatechange', 'load', 'loadstart', 'loadend', 'abort', 'error', 'progress', 'timeout'], ['xmlhttprequest', 'xmlhttprequestupload']);
        TargetManager.instance().observeModels(DOMDebuggerModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!domDebuggerManagerInstance || forceNew) {
            domDebuggerManagerInstance = new DOMDebuggerManager();
        }
        return domDebuggerManagerInstance;
    }
    cspViolationBreakpoints() {
        return this.#cspViolationsToBreakOn.slice();
    }
    createEventListenerBreakpoints(category, eventNames, eventTargetNames) {
        for (const eventName of eventNames) {
            this.#eventListenerBreakpointsInternal.push(new DOMEventListenerBreakpoint(eventName, eventTargetNames, category));
        }
    }
    resolveEventListenerBreakpoint({ eventName, targetName }) {
        const listenerPrefix = 'listener:';
        if (eventName.startsWith(listenerPrefix)) {
            eventName = eventName.substring(listenerPrefix.length);
        }
        else {
            return null;
        }
        targetName = (targetName || '*').toLowerCase();
        let result = null;
        for (const breakpoint of this.#eventListenerBreakpointsInternal) {
            if (eventName && breakpoint.name === eventName && breakpoint.eventTargetNames.indexOf(targetName) !== -1) {
                result = breakpoint;
            }
            if (!result && eventName && breakpoint.name === eventName && breakpoint.eventTargetNames.indexOf('*') !== -1) {
                result = breakpoint;
            }
        }
        return result;
    }
    eventListenerBreakpoints() {
        return this.#eventListenerBreakpointsInternal.slice();
    }
    updateCSPViolationBreakpoints() {
        const violationTypes = this.#cspViolationsToBreakOn.filter(v => v.enabled()).map(v => v.type());
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            this.updateCSPViolationBreakpointsForModel(model, violationTypes);
        }
    }
    updateCSPViolationBreakpointsForModel(model, violationTypes) {
        void model.agent.invoke_setBreakOnCSPViolation({ violationTypes: violationTypes });
    }
    xhrBreakpoints() {
        return this.#xhrBreakpointsInternal;
    }
    saveXHRBreakpoints() {
        const breakpoints = [];
        for (const url of this.#xhrBreakpointsInternal.keys()) {
            breakpoints.push({ url: url, enabled: this.#xhrBreakpointsInternal.get(url) || false });
        }
        this.#xhrBreakpointsSetting.set(breakpoints);
    }
    addXHRBreakpoint(url, enabled) {
        this.#xhrBreakpointsInternal.set(url, enabled);
        if (enabled) {
            for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
                void model.agent.invoke_setXHRBreakpoint({ url });
            }
        }
        this.saveXHRBreakpoints();
    }
    removeXHRBreakpoint(url) {
        const enabled = this.#xhrBreakpointsInternal.get(url);
        this.#xhrBreakpointsInternal.delete(url);
        if (enabled) {
            for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
                void model.agent.invoke_removeXHRBreakpoint({ url });
            }
        }
        this.saveXHRBreakpoints();
    }
    toggleXHRBreakpoint(url, enabled) {
        this.#xhrBreakpointsInternal.set(url, enabled);
        for (const model of TargetManager.instance().models(DOMDebuggerModel)) {
            if (enabled) {
                void model.agent.invoke_setXHRBreakpoint({ url });
            }
            else {
                void model.agent.invoke_removeXHRBreakpoint({ url });
            }
        }
        this.saveXHRBreakpoints();
    }
    modelAdded(domDebuggerModel) {
        for (const url of this.#xhrBreakpointsInternal.keys()) {
            if (this.#xhrBreakpointsInternal.get(url)) {
                void domDebuggerModel.agent.invoke_setXHRBreakpoint({ url: url });
            }
        }
        for (const breakpoint of this.#eventListenerBreakpointsInternal) {
            if (breakpoint.enabled()) {
                breakpoint.updateOnModel(domDebuggerModel);
            }
        }
        const violationTypes = this.#cspViolationsToBreakOn.filter(v => v.enabled()).map(v => v.type());
        this.updateCSPViolationBreakpointsForModel(domDebuggerModel, violationTypes);
    }
    modelRemoved(_domDebuggerModel) {
    }
}
SDKModel.register(DOMDebuggerModel, { capabilities: 2 /* Capability.DOM */, autostart: false });
//# sourceMappingURL=DOMDebuggerModel.js.map