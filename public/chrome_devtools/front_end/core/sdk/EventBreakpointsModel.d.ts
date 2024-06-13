import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import { CategorizedBreakpoint } from './CategorizedBreakpoint.js';
import { type EventListenerPausedDetailsAuxData } from './DebuggerModel.js';
import { SDKModel } from './SDKModel.js';
import { type Target } from './Target.js';
import { type SDKModelObserver } from './TargetManager.js';
export declare const enum InstrumentationNames {
    BeforeBidderWorkletBiddingStart = "beforeBidderWorkletBiddingStart",
    BeforeBidderWorkletReportingStart = "beforeBidderWorkletReportingStart",
    BeforeSellerWorkletScoringStart = "beforeSellerWorkletScoringStart",
    BeforeSellerWorkletReportingStart = "beforeSellerWorkletReportingStart",
    SetTimeout = "setTimeout",
    ClearTimeout = "clearTimeout",
    SetInterval = "setInterval",
    ClearInterval = "clearInterval",
    SetTimeoutCallback = "setTimeout.callback",
    SetIntervalCallback = "setInterval.callback",
    ScriptFirstStatement = "scriptFirstStatement",
    ScriptBlockedByCSP = "scriptBlockedByCSP",
    SharedStorageWorkletScriptFirstStatement = "sharedStorageWorkletScriptFirstStatement",
    RequestAnimationFrame = "requestAnimationFrame",
    CancelAnimationFrame = "cancelAnimationFrame",
    RequestAnimationFrameCallback = "requestAnimationFrame.callback",
    WebGLErrorFired = "webglErrorFired",
    WebGLWarningFired = "webglWarningFired",
    ElementSetInnerHTML = "Element.setInnerHTML",
    CanvasContextCreated = "canvasContextCreated",
    GeolocationGetCurrentPosition = "Geolocation.getCurrentPosition",
    GeolocationWatchPosition = "Geolocation.watchPosition",
    NotificationRequestPermission = "Notification.requestPermission",
    DOMWindowClose = "DOMWindow.close",
    DocumentWrite = "Document.write",
    AudioContextCreated = "audioContextCreated",
    AudioContextClosed = "audioContextClosed",
    AudioContextResumed = "audioContextResumed",
    AudioContextSuspended = "audioContextSuspended"
}
export declare class EventBreakpointsModel extends SDKModel<void> {
    readonly agent: ProtocolProxyApi.EventBreakpointsApi;
    constructor(target: Target);
}
declare class EventListenerBreakpoint extends CategorizedBreakpoint {
    setEnabled(enabled: boolean): void;
    updateOnModel(model: EventBreakpointsModel): void;
    static readonly instrumentationPrefix = "instrumentation:";
}
export declare class EventBreakpointsManager implements SDKModelObserver<EventBreakpointsModel> {
    #private;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): EventBreakpointsManager;
    private createInstrumentationBreakpoints;
    eventListenerBreakpoints(): EventListenerBreakpoint[];
    resolveEventListenerBreakpoint({ eventName }: EventListenerPausedDetailsAuxData): EventListenerBreakpoint | null;
    modelAdded(eventBreakpointModel: EventBreakpointsModel): void;
    modelRemoved(_eventBreakpointModel: EventBreakpointsModel): void;
}
export {};
