import * as SDK from '../../core/sdk/sdk.js';
import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import * as Protocol from '../../generated/protocol.js';
import { AnimationDOMNode } from './AnimationDOMNode.js';
export declare class AnimationModel extends SDK.SDKModel.SDKModel<EventTypes> {
    #private;
    readonly runtimeModel: SDK.RuntimeModel.RuntimeModel;
    readonly agent: ProtocolProxyApi.AnimationApi;
    readonly animationGroups: Map<string, AnimationGroup>;
    playbackRate: number;
    constructor(target: SDK.Target.Target);
    private reset;
    devicePixelRatio(): Promise<number>;
    animationCreated(id: string): void;
    animationCanceled(id: string): void;
    animationUpdated(payload: Protocol.Animation.Animation): Promise<void>;
    animationStarted(payload: Protocol.Animation.Animation): Promise<void>;
    private flushPendingAnimationsIfNeeded;
    private matchExistingGroups;
    private createGroupFromPendingAnimations;
    setPlaybackRate(playbackRate: number): void;
    releaseAnimations(animations: string[]): void;
    suspendModel(): Promise<void>;
    resumeModel(): Promise<void>;
    ensureEnabled(): Promise<void>;
}
export declare enum Events {
    AnimationGroupStarted = "AnimationGroupStarted",
    AnimationGroupUpdated = "AnimationGroupUpdated",
    ModelReset = "ModelReset"
}
export type EventTypes = {
    [Events.AnimationGroupStarted]: AnimationGroup;
    [Events.AnimationGroupUpdated]: AnimationGroup;
    [Events.ModelReset]: void;
};
export declare class AnimationImpl {
    #private;
    private constructor();
    static parsePayload(animationModel: AnimationModel, payload: Protocol.Animation.Animation): Promise<AnimationImpl>;
    setPayload(payload: Protocol.Animation.Animation): Promise<void>;
    private percentageToPixels;
    viewOrScrollTimeline(): Protocol.Animation.ViewOrScrollTimeline | undefined;
    id(): string;
    name(): string;
    paused(): boolean;
    playState(): string;
    setPlayState(playState: string): void;
    playbackRate(): number;
    startTime(): number;
    iterationDuration(): number;
    endTime(): number;
    finiteDuration(): number;
    currentTime(): number;
    source(): AnimationEffect;
    type(): Protocol.Animation.AnimationType;
    overlaps(animation: AnimationImpl): boolean;
    delayOrStartTime(): number;
    setTiming(duration: number, delay: number): void;
    private updateNodeStyle;
    remoteObjectPromise(): Promise<SDK.RemoteObject.RemoteObject | null>;
    cssId(): string;
}
export declare class AnimationEffect {
    #private;
    delayInternal: number;
    durationInternal: number;
    constructor(animationModel: AnimationModel, payload: Protocol.Animation.AnimationEffect);
    setPayload(payload: Protocol.Animation.AnimationEffect): void;
    delay(): number;
    endDelay(): number;
    iterations(): number;
    duration(): number;
    direction(): string;
    fill(): string;
    node(): Promise<SDK.DOMModel.DOMNode | null>;
    deferredNode(): SDK.DOMModel.DeferredDOMNode;
    backendNodeId(): Protocol.DOM.BackendNodeId;
    keyframesRule(): KeyframesRule | null;
    easing(): string;
}
export declare class KeyframesRule {
    #private;
    constructor(payload: Protocol.Animation.KeyframesRule);
    setPayload(payload: Protocol.Animation.KeyframesRule): void;
    name(): string | undefined;
    keyframes(): KeyframeStyle[];
}
export declare class KeyframeStyle {
    #private;
    constructor(payload: Protocol.Animation.KeyframeStyle);
    setPayload(payload: Protocol.Animation.KeyframeStyle): void;
    offset(): string;
    setOffset(offset: number): void;
    offsetAsNumber(): number;
    easing(): string;
}
export declare class AnimationGroup {
    #private;
    screenshotsInternal: string[];
    constructor(animationModel: AnimationModel, id: string, animations: AnimationImpl[]);
    isScrollDriven(): boolean;
    id(): string;
    animations(): AnimationImpl[];
    release(): void;
    private animationIds;
    startTime(): number;
    groupDuration(): number;
    finiteDuration(): number;
    scrollOrientation(): Protocol.DOM.ScrollOrientation | null;
    scrollNode(): Promise<AnimationDOMNode | null>;
    seekTo(currentTime: number): void;
    paused(): boolean;
    togglePause(paused: boolean): void;
    currentTimePromise(): Promise<number>;
    matches(group: AnimationGroup): boolean;
    update(group: AnimationGroup): void;
    screenshots(): HTMLImageElement[];
}
export declare class AnimationDispatcher implements ProtocolProxyApi.AnimationDispatcher {
    #private;
    constructor(animationModel: AnimationModel);
    animationCreated({ id }: Protocol.Animation.AnimationCreatedEvent): void;
    animationCanceled({ id }: Protocol.Animation.AnimationCanceledEvent): void;
    animationStarted({ animation }: Protocol.Animation.AnimationStartedEvent): void;
    animationUpdated({ animation }: Protocol.Animation.AnimationUpdatedEvent): void;
}
export declare class ScreenshotCapture {
    #private;
    constructor(animationModel: AnimationModel, screenCaptureModel: SDK.ScreenCaptureModel.ScreenCaptureModel);
    captureScreenshots(duration: number, screenshots: string[]): void;
    private screencastFrame;
    private stopScreencast;
}
export interface Request {
    endTime: number;
    screenshots: string[];
}
