import * as Protocol from '../../generated/protocol.js';
import { SDKModel } from './SDKModel.js';
import { type Target } from './Target.js';
export interface WithId<I, V> {
    id: I;
    value: V;
}
export declare class PreloadingModel extends SDKModel<EventTypes> {
    private agent;
    private loaderIds;
    private targetJustAttached;
    private lastPrimaryPageModel;
    private documents;
    constructor(target: Target);
    dispose(): void;
    private ensureDocumentPreloadingData;
    private currentLoaderId;
    private currentDocument;
    getRuleSetById(id: Protocol.Preload.RuleSetId): Protocol.Preload.RuleSet | null;
    getAllRuleSets(): WithId<Protocol.Preload.RuleSetId, Protocol.Preload.RuleSet>[];
    getPreloadCountsByRuleSetId(): Map<Protocol.Preload.RuleSetId | null, Map<PreloadingStatus, number>>;
    getPreloadingAttemptById(id: PreloadingAttemptId): PreloadingAttempt | null;
    getPreloadingAttempts(ruleSetId: Protocol.Preload.RuleSetId | null): WithId<PreloadingAttemptId, PreloadingAttempt>[];
    getPreloadingAttemptsOfPreviousPage(): WithId<PreloadingAttemptId, PreloadingAttempt>[];
    private onPrimaryPageChanged;
    onRuleSetUpdated(event: Protocol.Preload.RuleSetUpdatedEvent): void;
    onRuleSetRemoved(event: Protocol.Preload.RuleSetRemovedEvent): void;
    onPreloadingAttemptSourcesUpdated(event: Protocol.Preload.PreloadingAttemptSourcesUpdatedEvent): void;
    onPrefetchStatusUpdated(event: Protocol.Preload.PrefetchStatusUpdatedEvent): void;
    onPrerenderStatusUpdated(event: Protocol.Preload.PrerenderStatusUpdatedEvent): void;
    onPreloadEnabledStateUpdated(event: Protocol.Preload.PreloadEnabledStateUpdatedEvent): void;
}
export declare const enum Events {
    ModelUpdated = "ModelUpdated",
    WarningsUpdated = "WarningsUpdated"
}
export type EventTypes = {
    [Events.ModelUpdated]: void;
    [Events.WarningsUpdated]: Protocol.Preload.PreloadEnabledStateUpdatedEvent;
};
export declare const enum PreloadingStatus {
    NotTriggered = "NotTriggered",
    Pending = "Pending",
    Running = "Running",
    Ready = "Ready",
    Success = "Success",
    Failure = "Failure",
    NotSupported = "NotSupported"
}
export type PreloadingAttemptId = string;
export type PreloadingAttempt = PrefetchAttempt | PrerenderAttempt;
export interface PrefetchAttempt {
    action: Protocol.Preload.SpeculationAction.Prefetch;
    key: Protocol.Preload.PreloadingAttemptKey;
    status: PreloadingStatus;
    prefetchStatus: Protocol.Preload.PrefetchStatus | null;
    requestId: Protocol.Network.RequestId;
    ruleSetIds: Protocol.Preload.RuleSetId[];
    nodeIds: Protocol.DOM.BackendNodeId[];
}
export interface PrerenderAttempt {
    action: Protocol.Preload.SpeculationAction.Prerender;
    key: Protocol.Preload.PreloadingAttemptKey;
    status: PreloadingStatus;
    prerenderStatus: Protocol.Preload.PrerenderFinalStatus | null;
    disallowedMojoInterface: string | null;
    mismatchedHeaders: Protocol.Preload.PrerenderMismatchedHeaders[] | null;
    ruleSetIds: Protocol.Preload.RuleSetId[];
    nodeIds: Protocol.DOM.BackendNodeId[];
}
export type PreloadingAttemptInternal = PrefetchAttemptInternal | PrerenderAttemptInternal;
export interface PrefetchAttemptInternal {
    action: Protocol.Preload.SpeculationAction.Prefetch;
    key: Protocol.Preload.PreloadingAttemptKey;
    status: PreloadingStatus;
    prefetchStatus: Protocol.Preload.PrefetchStatus | null;
    requestId: Protocol.Network.RequestId;
}
export interface PrerenderAttemptInternal {
    action: Protocol.Preload.SpeculationAction.Prerender;
    key: Protocol.Preload.PreloadingAttemptKey;
    status: PreloadingStatus;
    prerenderStatus: Protocol.Preload.PrerenderFinalStatus | null;
    disallowedMojoInterface: string | null;
    mismatchedHeaders: Protocol.Preload.PrerenderMismatchedHeaders[] | null;
}
