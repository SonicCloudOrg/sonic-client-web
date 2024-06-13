// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assertNotNullOrUndefined } from '../platform/platform.js';
import { SDKModel } from './SDKModel.js';
import { TargetManager } from './TargetManager.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel, } from './ResourceTreeModel.js';
// Holds preloading related information.
//
// - SpeculationRule rule sets
// - Preloading attempts
// - Relationship between rule sets and preloading attempts
export class PreloadingModel extends SDKModel {
    agent;
    loaderIds = [];
    targetJustAttached = true;
    lastPrimaryPageModel = null;
    documents = new Map();
    constructor(target) {
        super(target);
        target.registerPreloadDispatcher(new PreloadDispatcher(this));
        this.agent = target.preloadAgent();
        void this.agent.invoke_enable();
        const targetInfo = target.targetInfo();
        if (targetInfo !== undefined && targetInfo.subtype === 'prerender') {
            this.lastPrimaryPageModel = TargetManager.instance().primaryPageTarget()?.model(PreloadingModel) || null;
        }
        TargetManager.instance().addModelListener(ResourceTreeModel, ResourceTreeModelEvents.PrimaryPageChanged, this.onPrimaryPageChanged, this);
    }
    dispose() {
        super.dispose();
        TargetManager.instance().removeModelListener(ResourceTreeModel, ResourceTreeModelEvents.PrimaryPageChanged, this.onPrimaryPageChanged, this);
        void this.agent.invoke_disable();
    }
    ensureDocumentPreloadingData(loaderId) {
        if (this.documents.get(loaderId) === undefined) {
            this.documents.set(loaderId, new DocumentPreloadingData());
        }
    }
    currentLoaderId() {
        // Target is just attached and didn't received CDP events that we can infer loaderId.
        if (this.targetJustAttached) {
            return null;
        }
        if (this.loaderIds.length === 0) {
            throw new Error('unreachable');
        }
        return this.loaderIds[this.loaderIds.length - 1];
    }
    currentDocument() {
        const loaderId = this.currentLoaderId();
        return loaderId === null ? null : this.documents.get(loaderId) || null;
    }
    // Returns a rule set of the current page.
    //
    // Returns reference. Don't save returned values.
    // Returned value may or may not be updated as the time grows.
    getRuleSetById(id) {
        return this.currentDocument()?.ruleSets.getById(id) || null;
    }
    // Returns rule sets of the current page.
    //
    // Returns array of pairs of id and reference. Don't save returned references.
    // Returned values may or may not be updated as the time grows.
    getAllRuleSets() {
        return this.currentDocument()?.ruleSets.getAll() || [];
    }
    getPreloadCountsByRuleSetId() {
        const countsByRuleSetId = new Map();
        for (const { value } of this.getPreloadingAttempts(null)) {
            for (const ruleSetId of [null, ...value.ruleSetIds]) {
                if (countsByRuleSetId.get(ruleSetId) === undefined) {
                    countsByRuleSetId.set(ruleSetId, new Map());
                }
                const countsByStatus = countsByRuleSetId.get(ruleSetId);
                assertNotNullOrUndefined(countsByStatus);
                const i = countsByStatus.get(value.status) || 0;
                countsByStatus.set(value.status, i + 1);
            }
        }
        return countsByRuleSetId;
    }
    // Returns a preloading attempt of the current page.
    //
    // Returns reference. Don't save returned values.
    // Returned value may or may not be updated as the time grows.
    getPreloadingAttemptById(id) {
        const document = this.currentDocument();
        if (document === null) {
            return null;
        }
        return document.preloadingAttempts.getById(id, document.sources) || null;
    }
    // Returs preloading attempts of the current page that triggered by the rule set with `ruleSetId`.
    // `ruleSetId === null` means "do not filter".
    //
    // Returns array of pairs of id and reference. Don't save returned references.
    // Returned values may or may not be updated as the time grows.
    getPreloadingAttempts(ruleSetId) {
        const document = this.currentDocument();
        if (document === null) {
            return [];
        }
        return document.preloadingAttempts.getAll(ruleSetId, document.sources);
    }
    // Returs preloading attempts of the previousPgae.
    //
    // Returns array of pairs of id and reference. Don't save returned references.
    // Returned values may or may not be updated as the time grows.
    getPreloadingAttemptsOfPreviousPage() {
        if (this.loaderIds.length <= 1) {
            return [];
        }
        const document = this.documents.get(this.loaderIds[this.loaderIds.length - 2]);
        if (document === undefined) {
            return [];
        }
        return document.preloadingAttempts.getAll(null, document.sources);
    }
    onPrimaryPageChanged(event) {
        const { frame, type } = event.data;
        // Model of prerendered page's target will hands over. Do nothing for the initiator page.
        if (this.lastPrimaryPageModel === null && type === "Activation" /* PrimaryPageChangeType.Activation */) {
            return;
        }
        if (this.lastPrimaryPageModel !== null && type !== "Activation" /* PrimaryPageChangeType.Activation */) {
            return;
        }
        if (this.lastPrimaryPageModel !== null && type === "Activation" /* PrimaryPageChangeType.Activation */) {
            // Hand over from the model of the last primary page.
            this.loaderIds = this.lastPrimaryPageModel.loaderIds;
            for (const [loaderId, prev] of this.lastPrimaryPageModel.documents.entries()) {
                this.ensureDocumentPreloadingData(loaderId);
                this.documents.get(loaderId)?.mergePrevious(prev);
            }
        }
        this.lastPrimaryPageModel = null;
        // Note that at this timing ResourceTreeFrame.loaderId is ensured to
        // be non empty and Protocol.Network.LoaderId because it is filled
        // by ResourceTreeFrame.navigate.
        const currentLoaderId = frame.loaderId;
        // Holds histories for two pages at most.
        this.loaderIds.push(currentLoaderId);
        this.loaderIds = this.loaderIds.slice(-2);
        this.ensureDocumentPreloadingData(currentLoaderId);
        for (const loaderId of this.documents.keys()) {
            if (!this.loaderIds.includes(loaderId)) {
                this.documents.delete(loaderId);
            }
        }
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onRuleSetUpdated(event) {
        const ruleSet = event.ruleSet;
        const loaderId = ruleSet.loaderId;
        // Infer current loaderId if DevTools is opned at the current page.
        if (this.currentLoaderId() === null) {
            this.loaderIds = [loaderId];
            this.targetJustAttached = false;
        }
        this.ensureDocumentPreloadingData(loaderId);
        this.documents.get(loaderId)?.ruleSets.upsert(ruleSet);
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onRuleSetRemoved(event) {
        const id = event.id;
        for (const document of this.documents.values()) {
            document.ruleSets.delete(id);
        }
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onPreloadingAttemptSourcesUpdated(event) {
        const loaderId = event.loaderId;
        this.ensureDocumentPreloadingData(loaderId);
        const document = this.documents.get(loaderId);
        if (document === undefined) {
            return;
        }
        document.sources.update(event.preloadingAttemptSources);
        document.preloadingAttempts.maybeRegisterNotTriggered(document.sources);
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onPrefetchStatusUpdated(event) {
        const loaderId = event.key.loaderId;
        this.ensureDocumentPreloadingData(loaderId);
        const attempt = {
            action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
            key: event.key,
            status: convertPreloadingStatus(event.status),
            prefetchStatus: event.prefetchStatus || null,
            requestId: event.requestId,
        };
        this.documents.get(loaderId)?.preloadingAttempts.upsert(attempt);
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onPrerenderStatusUpdated(event) {
        const loaderId = event.key.loaderId;
        this.ensureDocumentPreloadingData(loaderId);
        const attempt = {
            action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
            key: event.key,
            status: convertPreloadingStatus(event.status),
            prerenderStatus: event.prerenderStatus || null,
            disallowedMojoInterface: event.disallowedMojoInterface || null,
            mismatchedHeaders: event.mismatchedHeaders || null,
        };
        this.documents.get(loaderId)?.preloadingAttempts.upsert(attempt);
        this.dispatchEventToListeners("ModelUpdated" /* Events.ModelUpdated */);
    }
    onPreloadEnabledStateUpdated(event) {
        this.dispatchEventToListeners("WarningsUpdated" /* Events.WarningsUpdated */, event);
    }
}
SDKModel.register(PreloadingModel, { capabilities: 2 /* Capability.DOM */, autostart: false });
class PreloadDispatcher {
    model;
    constructor(model) {
        this.model = model;
    }
    ruleSetUpdated(event) {
        this.model.onRuleSetUpdated(event);
    }
    ruleSetRemoved(event) {
        this.model.onRuleSetRemoved(event);
    }
    preloadingAttemptSourcesUpdated(event) {
        this.model.onPreloadingAttemptSourcesUpdated(event);
    }
    prefetchStatusUpdated(event) {
        this.model.onPrefetchStatusUpdated(event);
    }
    prerenderStatusUpdated(event) {
        this.model.onPrerenderStatusUpdated(event);
    }
    preloadEnabledStateUpdated(event) {
        void this.model.onPreloadEnabledStateUpdated(event);
    }
}
class DocumentPreloadingData {
    ruleSets = new RuleSetRegistry();
    preloadingAttempts = new PreloadingAttemptRegistry();
    sources = new SourceRegistry();
    mergePrevious(prev) {
        // Note that CDP events Preload.ruleSetUpdated/Deleted and
        // Preload.preloadingAttemptSourcesUpdated with a loaderId are emitted to target that bounded to
        // a document with the loaderId. On the other hand, prerendering activation changes targets
        // of Preload.prefetch/prerenderStatusUpdated, i.e. activated page receives those events for
        // triggering outcome "Success".
        if (!this.ruleSets.isEmpty() || !this.sources.isEmpty()) {
            throw new Error('unreachable');
        }
        this.ruleSets = prev.ruleSets;
        this.preloadingAttempts.mergePrevious(prev.preloadingAttempts);
        this.sources = prev.sources;
    }
}
class RuleSetRegistry {
    map = new Map();
    isEmpty() {
        return this.map.size === 0;
    }
    // Returns reference. Don't save returned values.
    // Returned values may or may not be updated as the time grows.
    getById(id) {
        return this.map.get(id) || null;
    }
    // Returns reference. Don't save returned values.
    // Returned values may or may not be updated as the time grows.
    getAll() {
        return Array.from(this.map.entries()).map(([id, value]) => ({ id, value }));
    }
    upsert(ruleSet) {
        this.map.set(ruleSet.id, ruleSet);
    }
    delete(id) {
        this.map.delete(id);
    }
}
function convertPreloadingStatus(status) {
    switch (status) {
        case "Pending" /* Protocol.Preload.PreloadingStatus.Pending */:
            return "Pending" /* PreloadingStatus.Pending */;
        case "Running" /* Protocol.Preload.PreloadingStatus.Running */:
            return "Running" /* PreloadingStatus.Running */;
        case "Ready" /* Protocol.Preload.PreloadingStatus.Ready */:
            return "Ready" /* PreloadingStatus.Ready */;
        case "Success" /* Protocol.Preload.PreloadingStatus.Success */:
            return "Success" /* PreloadingStatus.Success */;
        case "Failure" /* Protocol.Preload.PreloadingStatus.Failure */:
            return "Failure" /* PreloadingStatus.Failure */;
        case "NotSupported" /* Protocol.Preload.PreloadingStatus.NotSupported */:
            return "NotSupported" /* PreloadingStatus.NotSupported */;
    }
    throw new Error('unreachable');
}
function makePreloadingAttemptId(key) {
    let action;
    switch (key.action) {
        case "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */:
            action = 'Prefetch';
            break;
        case "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */:
            action = 'Prerender';
            break;
    }
    let targetHint;
    switch (key.targetHint) {
        case undefined:
            targetHint = 'undefined';
            break;
        case "Blank" /* Protocol.Preload.SpeculationTargetHint.Blank */:
            targetHint = 'Blank';
            break;
        case "Self" /* Protocol.Preload.SpeculationTargetHint.Self */:
            targetHint = 'Self';
            break;
    }
    return `${key.loaderId}:${action}:${key.url}:${targetHint}`;
}
class PreloadingAttemptRegistry {
    map = new Map();
    enrich(attempt, source) {
        let ruleSetIds = [];
        let nodeIds = [];
        if (source !== null) {
            ruleSetIds = source.ruleSetIds;
            nodeIds = source.nodeIds;
        }
        return {
            ...attempt,
            ruleSetIds,
            nodeIds,
        };
    }
    // Returns reference. Don't save returned values.
    // Returned values may or may not be updated as the time grows.
    getById(id, sources) {
        const attempt = this.map.get(id) || null;
        if (attempt === null) {
            return null;
        }
        return this.enrich(attempt, sources.getById(id));
    }
    // Returs preloading attempts that triggered by the rule set with `ruleSetId`.
    // `ruleSetId === null` means "do not filter".
    //
    // Returns reference. Don't save returned values.
    // Returned values may or may not be updated as the time grows.
    getAll(ruleSetId, sources) {
        return [...this.map.entries()]
            .map(([id, value]) => ({ id, value: this.enrich(value, sources.getById(id)) }))
            .filter(({ value }) => !ruleSetId || value.ruleSetIds.includes(ruleSetId));
    }
    upsert(attempt) {
        const id = makePreloadingAttemptId(attempt.key);
        this.map.set(id, attempt);
    }
    // Speculation rules emits a CDP event Preload.preloadingAttemptSourcesUpdated
    // and an IPC SpeculationHost::UpdateSpeculationCandidates. The latter emits
    // Preload.prefetch/prerenderAttemptUpdated for each preload attempt triggered.
    // In general, "Not triggered to triggered" period is short (resp. long) for
    // eager (resp. non-eager) preloads. For not yet emitted ones, we fill
    // "Not triggered" preload attempts and show them.
    maybeRegisterNotTriggered(sources) {
        for (const [id, { key }] of sources.entries()) {
            if (this.map.get(id) !== undefined) {
                continue;
            }
            let attempt;
            switch (key.action) {
                case "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */:
                    attempt = {
                        action: "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */,
                        key,
                        status: "NotTriggered" /* PreloadingStatus.NotTriggered */,
                        prefetchStatus: null,
                        // Fill invalid request id.
                        requestId: '',
                    };
                    break;
                case "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */:
                    attempt = {
                        action: "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */,
                        key,
                        status: "NotTriggered" /* PreloadingStatus.NotTriggered */,
                        prerenderStatus: null,
                        disallowedMojoInterface: null,
                        mismatchedHeaders: null,
                    };
                    break;
            }
            this.map.set(id, attempt);
        }
    }
    mergePrevious(prev) {
        for (const [id, attempt] of this.map.entries()) {
            prev.map.set(id, attempt);
        }
        this.map = prev.map;
    }
}
class SourceRegistry {
    map = new Map();
    entries() {
        return this.map.entries();
    }
    isEmpty() {
        return this.map.size === 0;
    }
    getById(id) {
        return this.map.get(id) || null;
    }
    update(sources) {
        this.map = new Map(sources.map(s => [makePreloadingAttemptId(s.key), s]));
    }
}
//# sourceMappingURL=PreloadingModel.js.map