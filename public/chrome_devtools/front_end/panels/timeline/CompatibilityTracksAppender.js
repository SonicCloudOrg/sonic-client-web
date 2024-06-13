// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { AnimationsTrackAppender } from './AnimationsTrackAppender.js';
import { getEventLevel } from './AppenderUtils.js';
import * as TimelineComponents from './components/components.js';
import { getEventStyle } from './EventUICategory.js';
import { ExtensionDataGatherer } from './ExtensionDataGatherer.js';
import { ExtensionTrackAppender } from './ExtensionTrackAppender.js';
import { GPUTrackAppender } from './GPUTrackAppender.js';
import { InteractionsTrackAppender } from './InteractionsTrackAppender.js';
import { LayoutShiftsTrackAppender } from './LayoutShiftsTrackAppender.js';
import { ThreadAppender } from './ThreadAppender.js';
import { InstantEventVisibleDurationMs, } from './TimelineFlameChartDataProvider.js';
import { TimingsTrackAppender } from './TimingsTrackAppender.js';
export const TrackNames = ['Animations', 'Timings', 'Interactions', 'GPU', 'LayoutShifts', 'Thread', 'Thread_AuctionWorklet', 'Extension'];
export class CompatibilityTracksAppender {
    #trackForLevel = new Map();
    #trackForGroup = new Map();
    #eventsForTrack = new Map();
    #trackEventsForTreeview = new Map();
    #flameChartData;
    #traceParsedData;
    #entryData;
    #colorGenerator;
    #allTrackAppenders = [];
    #visibleTrackNames = new Set([...TrackNames]);
    #legacyEntryTypeByLevel;
    #timingsTrackAppender;
    #animationsTrackAppender;
    #interactionsTrackAppender;
    #gpuTrackAppender;
    #layoutShiftsTrackAppender;
    #threadAppenders = [];
    /**
     * @param flameChartData the data used by the flame chart renderer on
     * which the track data will be appended.
     * @param traceParsedData the trace parsing engines output.
     * @param entryData the array containing all event to be rendered in
     * the flamechart.
     * @param legacyEntryTypeByLevel an array containing the type of
     * each entry in the entryData array. Indexed by the position the
     * corresponding entry occupies in the entryData array. This reference
     * is needed only for compatibility with the legacy flamechart
     * architecture and should be removed once all tracks use the new
     * system.
     */
    constructor(flameChartData, traceParsedData, entryData, legacyEntryTypeByLevel) {
        this.#flameChartData = flameChartData;
        this.#traceParsedData = traceParsedData;
        this.#entryData = entryData;
        this.#colorGenerator = new Common.Color.Generator(
        /* hueSpace= */ { min: 30, max: 55, count: undefined }, 
        /* satSpace= */ { min: 70, max: 100, count: 6 }, 
        /* lightnessSpace= */ 50, 
        /* alphaSpace= */ 0.7);
        this.#legacyEntryTypeByLevel = legacyEntryTypeByLevel;
        this.#timingsTrackAppender = new TimingsTrackAppender(this, this.#traceParsedData, this.#colorGenerator);
        this.#allTrackAppenders.push(this.#timingsTrackAppender);
        this.#interactionsTrackAppender = new InteractionsTrackAppender(this, this.#traceParsedData, this.#colorGenerator);
        this.#allTrackAppenders.push(this.#interactionsTrackAppender);
        this.#animationsTrackAppender = new AnimationsTrackAppender(this, this.#traceParsedData);
        this.#allTrackAppenders.push(this.#animationsTrackAppender);
        this.#gpuTrackAppender = new GPUTrackAppender(this, this.#traceParsedData);
        this.#allTrackAppenders.push(this.#gpuTrackAppender);
        // Layout Shifts track in OPP was called the "Experience" track even though
        // all it shows are layout shifts.
        this.#layoutShiftsTrackAppender = new LayoutShiftsTrackAppender(this, this.#traceParsedData);
        this.#allTrackAppenders.push(this.#layoutShiftsTrackAppender);
        this.#addThreadAppenders();
        if (Root.Runtime.experiments.isEnabled("timeline-extensions" /* Root.Runtime.ExperimentName.TIMELINE_EXTENSIONS */)) {
            this.#addExtensionAppenders();
        }
        ThemeSupport.ThemeSupport.instance().addEventListener(ThemeSupport.ThemeChangeEvent.eventName, () => {
            for (const group of this.#flameChartData.groups) {
                // We only need to update the color here, because FlameChart will call `scheduleUpdate()` when theme is changed.
                group.style.color = ThemeSupport.ThemeSupport.instance().getComputedValue('--sys-color-on-surface');
                group.style.backgroundColor =
                    ThemeSupport.ThemeSupport.instance().getComputedValue('--sys-color-cdt-base-container');
            }
        });
    }
    setFlameChartDataAndEntryData(flameChartData, entryData, legacyEntryTypeByLevel) {
        this.#trackForGroup.clear();
        this.#flameChartData = flameChartData;
        this.#entryData = entryData;
        this.#legacyEntryTypeByLevel = legacyEntryTypeByLevel;
    }
    getFlameChartTimelineData() {
        return this.#flameChartData;
    }
    #addExtensionAppenders() {
        const tracks = ExtensionDataGatherer.instance().getExtensionData();
        for (const trackData of tracks) {
            this.#allTrackAppenders.push(new ExtensionTrackAppender(this, trackData));
        }
    }
    #addThreadAppenders() {
        const weight = (appender) => {
            switch (appender.threadType) {
                case "MAIN_THREAD" /* TraceEngine.Handlers.Threads.ThreadType.MAIN_THREAD */: {
                    // Within tracks of the main thread, those with data
                    // from about:blank are treated with the lowest priority,
                    // since there's a chance they have only noise from the
                    // navigation to about:blank done on record and reload.
                    if (!appender.getUrl()) {
                        // We expect each appender to have a URL as we filter out empty URL
                        // processes, but in the event that we do not have a URL (can
                        // happen for a generic trace), return 2, to ensure these are put
                        // below any that do have value URLs.
                        return 2;
                    }
                    const asUrl = new URL(appender.getUrl());
                    if (asUrl.protocol === 'about:') {
                        return 2;
                    }
                    return (appender.isOnMainFrame && appender.getUrl() !== '') ? 0 : 1;
                }
                case "WORKER" /* TraceEngine.Handlers.Threads.ThreadType.WORKER */:
                    return 3;
                case "RASTERIZER" /* TraceEngine.Handlers.Threads.ThreadType.RASTERIZER */:
                    return 4;
                case "THREAD_POOL" /* TraceEngine.Handlers.Threads.ThreadType.THREAD_POOL */:
                    return 5;
                case "AUCTION_WORKLET" /* TraceEngine.Handlers.Threads.ThreadType.AUCTION_WORKLET */:
                    return 6;
                case "OTHER" /* TraceEngine.Handlers.Threads.ThreadType.OTHER */:
                    return 7;
                default:
                    return 8;
            }
        };
        const threads = TraceEngine.Handlers.Threads.threadsInTrace(this.#traceParsedData);
        const processedAuctionWorkletsIds = new Set();
        const showAllEvents = Root.Runtime.experiments.isEnabled('timeline-show-all-events');
        for (const { pid, tid, name, type } of threads) {
            if (this.#traceParsedData.Meta.traceIsGeneric) {
                // If the trace is generic, we just push all of the threads with no
                // effort to differentiate them, hence overriding the thread type to be
                // OTHER for all threads.
                this.#threadAppenders.push(new ThreadAppender(this, this.#traceParsedData, pid, tid, name, "OTHER" /* TraceEngine.Handlers.Threads.ThreadType.OTHER */));
                continue;
            }
            // These threads have no useful information. Omit them
            if ((name === 'Chrome_ChildIOThread' || name === 'Compositor' || name === 'GpuMemoryThread') && !showAllEvents) {
                continue;
            }
            const maybeWorklet = this.#traceParsedData.AuctionWorklets.worklets.get(pid);
            if (processedAuctionWorkletsIds.has(pid)) {
                // Keep track of this process to ensure we only add the following
                // tracks once per process and not once per thread.
                continue;
            }
            if (maybeWorklet) {
                processedAuctionWorkletsIds.add(pid);
                // Each AuctionWorklet event represents two threads:
                // 1. the Utility Thread
                // 2. the V8 Helper Thread
                // Note that the names passed here are not used visually. TODO: remove this name?
                this.#threadAppenders.push(new ThreadAppender(this, this.#traceParsedData, pid, maybeWorklet.args.data.utilityThread.tid, 'auction-worket-utility', "AUCTION_WORKLET" /* TraceEngine.Handlers.Threads.ThreadType.AUCTION_WORKLET */));
                this.#threadAppenders.push(new ThreadAppender(this, this.#traceParsedData, pid, maybeWorklet.args.data.v8HelperThread.tid, 'auction-worklet-v8helper', "AUCTION_WORKLET" /* TraceEngine.Handlers.Threads.ThreadType.AUCTION_WORKLET */));
                continue;
            }
            this.#threadAppenders.push(new ThreadAppender(this, this.#traceParsedData, pid, tid, name, type));
        }
        this.#threadAppenders.sort((a, b) => weight(a) - weight(b));
        this.#allTrackAppenders.push(...this.#threadAppenders);
    }
    timingsTrackAppender() {
        return this.#timingsTrackAppender;
    }
    animationsTrackAppender() {
        return this.#animationsTrackAppender;
    }
    interactionsTrackAppender() {
        return this.#interactionsTrackAppender;
    }
    gpuTrackAppender() {
        return this.#gpuTrackAppender;
    }
    layoutShiftsTrackAppender() {
        return this.#layoutShiftsTrackAppender;
    }
    threadAppenders() {
        return this.#threadAppenders;
    }
    eventsInTrack(trackAppender) {
        const cachedData = this.#eventsForTrack.get(trackAppender);
        if (cachedData) {
            return cachedData;
        }
        // Calculate the levels occupied by a track.
        let trackStartLevel = null;
        let trackEndLevel = null;
        for (const [level, track] of this.#trackForLevel) {
            if (track !== trackAppender) {
                continue;
            }
            if (trackStartLevel === null) {
                trackStartLevel = level;
            }
            trackEndLevel = level;
        }
        if (trackStartLevel === null || trackEndLevel === null) {
            throw new Error(`Could not find events for track: ${trackAppender}`);
        }
        const entryLevels = this.#flameChartData.entryLevels;
        const events = [];
        for (let i = 0; i < entryLevels.length; i++) {
            if (trackStartLevel <= entryLevels[i] && entryLevels[i] <= trackEndLevel) {
                events.push(this.#entryData[i]);
            }
        }
        events.sort((a, b) => a.ts - b.ts);
        this.#eventsForTrack.set(trackAppender, events);
        return events;
    }
    /**
     * Gets the events to be shown in the tree views of the details pane
     * (Bottom-up, Call tree, etc.). These are the events from the track
     * that can be arranged in a tree shape.
     */
    eventsForTreeView(trackAppender) {
        const cachedData = this.#trackEventsForTreeview.get(trackAppender);
        if (cachedData) {
            return cachedData;
        }
        let trackEvents = this.eventsInTrack(trackAppender);
        if (!TraceEngine.Helpers.TreeHelpers.canBuildTreesFromEvents(trackEvents)) {
            // Some tracks can include both async and sync events. When this
            // happens, we use all events for the tree views if a trees can be
            // built from both sync and async events. If this is not possible,
            // async events are filtered out and only sync events are used
            // (it's assumed a tree can always be built using a tracks sync
            // events).
            trackEvents = trackEvents.filter(e => !TraceEngine.Types.TraceEvents.isAsyncPhase(e.ph));
        }
        this.#trackEventsForTreeview.set(trackAppender, trackEvents);
        return trackEvents;
    }
    /**
     * Caches the track appender that owns a flame chart group. FlameChart
     * groups are created for each track in the timeline. When an user
     * selects a track in the UI, the track's group is passed to the model
     * layer to inform about the selection.
     */
    registerTrackForGroup(group, appender) {
        this.#flameChartData.groups.push(group);
        this.#trackForGroup.set(group, appender);
    }
    /**
     * Returns number of tracks of given type already appended.
     * Used to name the "Raster Thread 6" tracks, etc
     */
    getCurrentTrackCountForThreadType(threadType) {
        return this.#threadAppenders.filter(appender => appender.threadType === threadType && appender.headerAppended())
            .length;
    }
    /**
     * Looks up a FlameChart group for a given appender.
     */
    groupForAppender(targetAppender) {
        let foundGroup = null;
        for (const [group, appender] of this.#trackForGroup) {
            if (appender === targetAppender) {
                foundGroup = group;
                break;
            }
        }
        return foundGroup;
    }
    /**
     * Given a FlameChart group, gets the events to be shown in the tree
     * views if that group was registered by the appender system.
     */
    groupEventsForTreeView(group) {
        const track = this.#trackForGroup.get(group);
        if (!track) {
            return null;
        }
        return this.eventsForTreeView(track);
    }
    /**
     * Caches the track appender that owns a level. An appender takes
     * ownership of a level when it appends data to it.
     * The cache is useful to determine what appender should handle a
     * query from the flame chart renderer when an event's feature (like
     * style, title, etc.) is needed.
     */
    registerTrackForLevel(level, appender) {
        // TODO(crbug.com/1442454) Figure out how to avoid the circular calls.
        this.#trackForLevel.set(level, appender);
    }
    /**
     * Adds an event to the flame chart data at a defined level.
     * @param event the event to be appended,
     * @param level the level to append the event,
     * @param appender the track which the event belongs to.
     * @returns the index of the event in all events to be rendered in the flamechart.
     */
    appendEventAtLevel(event, level, appender) {
        // TODO(crbug.com/1442454) Figure out how to avoid the circular calls.
        this.#trackForLevel.set(level, appender);
        const index = this.#entryData.length;
        this.#entryData.push(event);
        this.#legacyEntryTypeByLevel[level] = "TrackAppender" /* EntryType.TrackAppender */;
        this.#flameChartData.entryLevels[index] = level;
        this.#flameChartData.entryStartTimes[index] = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(event.ts);
        const msDuration = event.dur ||
            TraceEngine.Helpers.Timing.millisecondsToMicroseconds(InstantEventVisibleDurationMs);
        this.#flameChartData.entryTotalTimes[index] = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(msDuration);
        return index;
    }
    /**
     * Adds into the flame chart data a list of trace events.
     * @param events the trace events that will be appended to the flame chart.
     * The events should be taken straight from the trace handlers. The handlers
     * should sort the events by start time, and the parent event is before the
     * child.
     * @param trackStartLevel the flame chart level from which the events will
     * be appended.
     * @param appender the track that the trace events belong to.
     * @param eventAppendedCallback an optional function called after the
     * event has been added to the timeline data. This allows the caller
     * to know f.e. the position of the event in the entry data. Use this
     * hook to customize the data after it has been appended, f.e. to add
     * decorations to a set of the entries.
     * @returns the next level after the last occupied by the appended these
     * trace events (the first available level to append next track).
     */
    appendEventsAtLevel(events, trackStartLevel, appender, eventAppendedCallback) {
        const lastUsedTimeByLevel = [];
        for (let i = 0; i < events.length; ++i) {
            const event = events[i];
            if (!this.entryIsVisibleInTimeline(event)) {
                continue;
            }
            const level = getEventLevel(event, lastUsedTimeByLevel);
            const index = this.appendEventAtLevel(event, trackStartLevel + level, appender);
            eventAppendedCallback?.(event, index);
        }
        this.#legacyEntryTypeByLevel.length = trackStartLevel + lastUsedTimeByLevel.length;
        this.#legacyEntryTypeByLevel.fill("TrackAppender" /* EntryType.TrackAppender */, trackStartLevel);
        return trackStartLevel + lastUsedTimeByLevel.length;
    }
    entryIsVisibleInTimeline(entry) {
        if (this.#traceParsedData.Meta.traceIsGeneric) {
            return true;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventUpdateCounters(entry)) {
            // These events are not "visible" on the timeline because they are instant events with 0 duration.
            // However, the Memory view (CountersGraph in the codebase) relies on
            // finding the UpdateCounters events within the user's active trace
            // selection in order to show the memory usage for the selected time
            // period.
            // Therefore we mark them as visible so they are appended onto the Thread
            // track, and hence accessible by the CountersGraph view.
            return true;
        }
        // Gate the visibility of post message events behind the experiement flag
        if (TraceEngine.Types.TraceEvents.isTraceEventSchedulePostMessage(entry) ||
            TraceEngine.Types.TraceEvents.isTraceEventHandlePostMessage(entry)) {
            return Root.Runtime.experiments.isEnabled("timeline-show-postmessage-events" /* Root.Runtime.ExperimentName.TIMELINE_SHOW_POST_MESSAGE_EVENTS */);
        }
        if (TraceEngine.Types.Extensions.isSyntheticExtensionEntry(entry)) {
            return true;
        }
        // Default styles are globally defined for each event name. Some
        // events are hidden by default.
        const eventStyle = getEventStyle(entry.name);
        const eventIsTiming = TraceEngine.Types.TraceEvents.isTraceEventConsoleTime(entry) ||
            TraceEngine.Types.TraceEvents.isTraceEventPerformanceMeasure(entry) ||
            TraceEngine.Types.TraceEvents.isTraceEventPerformanceMark(entry);
        return (eventStyle && !eventStyle.hidden) || eventIsTiming;
    }
    /**
     * Gets the all track appenders that have been set to be visible.
     */
    allVisibleTrackAppenders() {
        return this.#allTrackAppenders.filter(track => this.#visibleTrackNames.has(track.appenderName));
    }
    allThreadAppendersByProcess() {
        const appenders = this.allVisibleTrackAppenders();
        const result = new Map();
        for (const appender of appenders) {
            if (!(appender instanceof ThreadAppender)) {
                continue;
            }
            const existing = result.get(appender.processId()) ?? [];
            existing.push(appender);
            result.set(appender.processId(), existing);
        }
        return result;
    }
    /**
     * Sets the visible tracks internally
     * @param visibleTracks set with the names of the visible track
     * appenders. If undefined, all tracks are set to be visible.
     */
    setVisibleTracks(visibleTracks) {
        if (!visibleTracks) {
            this.#visibleTrackNames = new Set([...TrackNames]);
            return;
        }
        this.#visibleTrackNames = visibleTracks;
    }
    /**
     * Returns the color an event is shown with in the timeline.
     */
    colorForEvent(event, level) {
        const track = this.#trackForLevel.get(level);
        if (!track) {
            throw new Error('Track not found for level');
        }
        return track.colorForEvent(event);
    }
    /**
     * Returns the title an event is shown with in the timeline.
     */
    titleForEvent(event, level) {
        const track = this.#trackForLevel.get(level);
        if (!track) {
            throw new Error('Track not found for level');
        }
        return track.titleForEvent(event);
    }
    /**
     * Returns the info shown when an event in the timeline is hovered.
     */
    highlightedEntryInfo(event, level) {
        const track = this.#trackForLevel.get(level);
        if (!track) {
            throw new Error('Track not found for level');
        }
        // Add any warnings information to the tooltip. Done here to avoid duplicating this call in every appender.
        // By doing this here, we ensure that any warnings that are
        // added to the WarningsHandler are automatically used and added
        // to the tooltip.
        const warningElements = TimelineComponents.DetailsView.buildWarningElementsForEvent(event, this.#traceParsedData);
        const { title, formattedTime, warningElements: extraWarningElements } = track.highlightedEntryInfo(event);
        return {
            title,
            formattedTime,
            warningElements: warningElements.concat(extraWarningElements || []),
        };
    }
}
//# sourceMappingURL=CompatibilityTracksAppender.js.map