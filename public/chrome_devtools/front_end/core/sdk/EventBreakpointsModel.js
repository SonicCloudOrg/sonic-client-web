// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { CategorizedBreakpoint } from './CategorizedBreakpoint.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
export class EventBreakpointsModel extends SDKModel {
    agent;
    constructor(target) {
        super(target);
        this.agent = target.eventBreakpointsAgent();
    }
}
// This implementation (as opposed to similar class in DOMDebuggerModel) is for
// instrumentation breakpoints in targets that run JS but do not have a DOM.
class EventListenerBreakpoint extends CategorizedBreakpoint {
    setEnabled(enabled) {
        if (this.enabled() === enabled) {
            return;
        }
        super.setEnabled(enabled);
        for (const model of TargetManager.instance().models(EventBreakpointsModel)) {
            this.updateOnModel(model);
        }
    }
    updateOnModel(model) {
        if (this.enabled()) {
            void model.agent.invoke_setInstrumentationBreakpoint({ eventName: this.name });
        }
        else {
            void model.agent.invoke_removeInstrumentationBreakpoint({ eventName: this.name });
        }
    }
    static instrumentationPrefix = 'instrumentation:';
}
let eventBreakpointManagerInstance;
export class EventBreakpointsManager {
    #eventListenerBreakpointsInternal = [];
    constructor() {
        this.createInstrumentationBreakpoints("auction-worklet" /* Category.AuctionWorklet */, [
            "beforeBidderWorkletBiddingStart" /* InstrumentationNames.BeforeBidderWorkletBiddingStart */,
            "beforeBidderWorkletReportingStart" /* InstrumentationNames.BeforeBidderWorkletReportingStart */,
            "beforeSellerWorkletScoringStart" /* InstrumentationNames.BeforeSellerWorkletScoringStart */,
            "beforeSellerWorkletReportingStart" /* InstrumentationNames.BeforeSellerWorkletReportingStart */,
        ]);
        this.createInstrumentationBreakpoints("animation" /* Category.Animation */, [
            "requestAnimationFrame" /* InstrumentationNames.RequestAnimationFrame */,
            "cancelAnimationFrame" /* InstrumentationNames.CancelAnimationFrame */,
            "requestAnimationFrame.callback" /* InstrumentationNames.RequestAnimationFrameCallback */,
        ]);
        this.createInstrumentationBreakpoints("canvas" /* Category.Canvas */, [
            "canvasContextCreated" /* InstrumentationNames.CanvasContextCreated */,
            "webglErrorFired" /* InstrumentationNames.WebGLErrorFired */,
            "webglWarningFired" /* InstrumentationNames.WebGLWarningFired */,
        ]);
        this.createInstrumentationBreakpoints("geolocation" /* Category.Geolocation */, [
            "Geolocation.getCurrentPosition" /* InstrumentationNames.GeolocationGetCurrentPosition */,
            "Geolocation.watchPosition" /* InstrumentationNames.GeolocationWatchPosition */,
        ]);
        this.createInstrumentationBreakpoints("notification" /* Category.Notification */, [
            "Notification.requestPermission" /* InstrumentationNames.NotificationRequestPermission */,
        ]);
        this.createInstrumentationBreakpoints("parse" /* Category.Parse */, [
            "Element.setInnerHTML" /* InstrumentationNames.ElementSetInnerHTML */,
            "Document.write" /* InstrumentationNames.DocumentWrite */,
        ]);
        this.createInstrumentationBreakpoints("script" /* Category.Script */, [
            "scriptFirstStatement" /* InstrumentationNames.ScriptFirstStatement */,
            "scriptBlockedByCSP" /* InstrumentationNames.ScriptBlockedByCSP */,
        ]);
        this.createInstrumentationBreakpoints("shared-storage-worklet" /* Category.SharedStorageWorklet */, [
            "sharedStorageWorkletScriptFirstStatement" /* InstrumentationNames.SharedStorageWorkletScriptFirstStatement */,
        ]);
        this.createInstrumentationBreakpoints("timer" /* Category.Timer */, [
            "setTimeout" /* InstrumentationNames.SetTimeout */,
            "clearTimeout" /* InstrumentationNames.ClearTimeout */,
            "setInterval" /* InstrumentationNames.SetInterval */,
            "clearInterval" /* InstrumentationNames.ClearInterval */,
            "setTimeout.callback" /* InstrumentationNames.SetTimeoutCallback */,
            "setInterval.callback" /* InstrumentationNames.SetIntervalCallback */,
        ]);
        this.createInstrumentationBreakpoints("window" /* Category.Window */, [
            "DOMWindow.close" /* InstrumentationNames.DOMWindowClose */,
        ]);
        this.createInstrumentationBreakpoints("web-audio" /* Category.WebAudio */, [
            "audioContextCreated" /* InstrumentationNames.AudioContextCreated */,
            "audioContextClosed" /* InstrumentationNames.AudioContextClosed */,
            "audioContextResumed" /* InstrumentationNames.AudioContextResumed */,
            "audioContextSuspended" /* InstrumentationNames.AudioContextSuspended */,
        ]);
        TargetManager.instance().observeModels(EventBreakpointsModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!eventBreakpointManagerInstance || forceNew) {
            eventBreakpointManagerInstance = new EventBreakpointsManager();
        }
        return eventBreakpointManagerInstance;
    }
    createInstrumentationBreakpoints(category, instrumentationNames) {
        for (const instrumentationName of instrumentationNames) {
            this.#eventListenerBreakpointsInternal.push(new EventListenerBreakpoint(category, instrumentationName));
        }
    }
    eventListenerBreakpoints() {
        return this.#eventListenerBreakpointsInternal.slice();
    }
    resolveEventListenerBreakpoint({ eventName }) {
        if (!eventName.startsWith(EventListenerBreakpoint.instrumentationPrefix)) {
            return null;
        }
        const instrumentationName = eventName.substring(EventListenerBreakpoint.instrumentationPrefix.length);
        return this.#eventListenerBreakpointsInternal.find(b => b.name === instrumentationName) || null;
    }
    modelAdded(eventBreakpointModel) {
        for (const breakpoint of this.#eventListenerBreakpointsInternal) {
            if (breakpoint.enabled()) {
                breakpoint.updateOnModel(eventBreakpointModel);
            }
        }
    }
    modelRemoved(_eventBreakpointModel) {
    }
}
SDKModel.register(EventBreakpointsModel, { capabilities: 524288 /* Capability.EventBreakpoints */, autostart: false });
//# sourceMappingURL=EventBreakpointsModel.js.map