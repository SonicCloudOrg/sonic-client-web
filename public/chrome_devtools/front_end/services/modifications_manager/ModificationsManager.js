// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
import * as TimelineComponents from '../../panels/timeline/components/components.js';
import * as EventsSerializer from '../events_serializer/events_serializer.js';
const modificationsManagerByTraceIndex = [];
let activeManager;
export class ModificationsManager {
    #entriesFilter;
    #timelineBreadcrumbs;
    #modifications = null;
    #traceParsedData;
    #eventsSerializer;
    /**
     * Gets the ModificationsManager instance corresponding to a trace
     * given its index used in Model#traces. If no index is passed gets
     * the manager instance for the last trace. If no instance is found,
     * throws.
     */
    static activeManager() {
        return activeManager;
    }
    /**
     * Initializes a ModificationsManager instance for a parsed trace or changes the active manager for an existing one.
     * This needs to be called if and a trace has been parsed or switched to.
     */
    static initAndActivateModificationsManager(traceModel, traceIndex) {
        // If a manager for a given index has already been created, active it.
        if (modificationsManagerByTraceIndex[traceIndex]) {
            activeManager = modificationsManagerByTraceIndex[traceIndex];
            ModificationsManager.activeManager()?.applyModificationsIfPresent();
        }
        const traceParsedData = traceModel.traceParsedData(traceIndex);
        if (!traceParsedData) {
            throw new Error('ModificationsManager was initialized without a corresponding trace data');
        }
        const traceBounds = traceParsedData.Meta.traceBounds;
        const traceEvents = traceModel.rawTraceEvents(traceIndex);
        if (!traceEvents) {
            throw new Error('ModificationsManager was initialized without a corresponding raw trace events array');
        }
        const syntheticEventsManager = traceModel.syntheticTraceEventsManager(traceIndex);
        if (!syntheticEventsManager) {
            throw new Error('ModificationsManager was initialized without a corresponding SyntheticEventsManager');
        }
        const metadata = traceModel.metadata(traceIndex);
        const newModificationsManager = new ModificationsManager({
            traceParsedData,
            traceBounds,
            rawTraceEvents: traceEvents,
            modifications: metadata?.modifications,
            syntheticEvents: syntheticEventsManager.getSyntheticTraceEvents(),
        });
        modificationsManagerByTraceIndex[traceIndex] = newModificationsManager;
        activeManager = newModificationsManager;
        ModificationsManager.activeManager()?.applyModificationsIfPresent();
    }
    constructor({ traceParsedData, traceBounds, modifications }) {
        const entryToNodeMap = new Map([...traceParsedData.Samples.entryToNode, ...traceParsedData.Renderer.entryToNode]);
        this.#entriesFilter = new TraceEngine.EntriesFilter.EntriesFilter(entryToNodeMap);
        this.#timelineBreadcrumbs = new TimelineComponents.Breadcrumbs.Breadcrumbs(traceBounds);
        this.#modifications = modifications || null;
        this.#traceParsedData = traceParsedData;
        this.#eventsSerializer = new EventsSerializer.EventsSerializer();
    }
    getEntriesFilter() {
        return this.#entriesFilter;
    }
    getTimelineBreadcrumbs() {
        return this.#timelineBreadcrumbs;
    }
    /**
     * Builds all modifications into a serializable object written into
     * the 'modifications' trace file metadata field.
     */
    toJSON() {
        const hiddenEntries = this.#entriesFilter.invisibleEntries()
            .map(entry => this.#eventsSerializer.keyForEvent(entry))
            .filter(entry => entry !== null);
        const expandableEntries = this.#entriesFilter.expandableEntries()
            .map(entry => this.#eventsSerializer.keyForEvent(entry))
            .filter(entry => entry !== null);
        this.#modifications = {
            entriesModifications: {
                hiddenEntries: hiddenEntries,
                expandableEntries: expandableEntries,
            },
            initialBreadcrumb: this.#timelineBreadcrumbs.initialBreadcrumb,
        };
        return this.#modifications;
    }
    applyModificationsIfPresent() {
        const modifications = this.#modifications;
        if (!modifications) {
            return;
        }
        const hiddenEntries = modifications.entriesModifications.hiddenEntries;
        const expandableEntries = modifications.entriesModifications.expandableEntries;
        this.applyEntriesFilterModifications(hiddenEntries, expandableEntries);
        this.#timelineBreadcrumbs.setInitialBreadcrumbFromLoadedModifications(modifications.initialBreadcrumb);
    }
    applyEntriesFilterModifications(hiddenEntriesKeys, expandableEntriesKeys) {
        const hiddenEntries = hiddenEntriesKeys.map(key => this.#eventsSerializer.eventForKey(key, this.#traceParsedData));
        const expandableEntries = expandableEntriesKeys.map(key => this.#eventsSerializer.eventForKey(key, this.#traceParsedData));
        this.#entriesFilter.setHiddenAndExpandableEntries(hiddenEntries, expandableEntries);
    }
}
//# sourceMappingURL=ModificationsManager.js.map