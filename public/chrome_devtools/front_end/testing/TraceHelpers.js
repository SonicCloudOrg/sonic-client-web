// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../core/sdk/sdk.js';
import * as Bindings from '../models/bindings/bindings.js';
import * as CPUProfile from '../models/cpu_profile/cpu_profile.js';
import * as TraceEngine from '../models/trace/trace.js';
import * as Workspace from '../models/workspace/workspace.js';
import * as Timeline from '../panels/timeline/timeline.js';
import * as PerfUI from '../ui/legacy/components/perf_ui/perf_ui.js';
import { initializeGlobalVars } from './EnvironmentHelpers.js';
import { TraceLoader } from './TraceLoader.js';
// This mock class is used for instancing a flame chart in the helpers.
// Its implementation is empty because the methods aren't used by the
// helpers, only the mere definition.
export class MockFlameChartDelegate {
    windowChanged(_startTime, _endTime, _animate) {
    }
    updateRangeSelection(_startTime, _endTime) {
    }
    updateSelectedGroup(_flameChart, _group) {
    }
}
/**
 * Draws a set of tracks track in the flame chart using the new system.
 * For this to work, every track that will be rendered must have a
 * corresponding track appender registered in the
 * CompatibilityTracksAppender.
 *
 * @param traceFileName The name of the trace file to be loaded into the
 * flame chart.
 * @param trackAppenderNames A Set with the names of the tracks to be
 * rendered. For example, Set("Timings").
 * @param expanded whether the track should be expanded
 * @param trackName optional param to filter tracks by their name.
 * @returns a flame chart element and its corresponding data provider.
 */
export async function getMainFlameChartWithTracks(traceFileName, trackAppenderNames, expanded, trackName) {
    await initializeGlobalVars();
    // This function is used to load a component example.
    const traceParsedData = await TraceLoader.traceEngine(/* context= */ null, traceFileName);
    const dataProvider = new Timeline.TimelineFlameChartDataProvider.TimelineFlameChartDataProvider();
    // The data provider still needs a reference to the legacy model to
    // work properly.
    dataProvider.setModel(traceParsedData);
    const tracksAppender = dataProvider.compatibilityTracksAppenderInstance();
    tracksAppender.setVisibleTracks(trackAppenderNames);
    dataProvider.buildFromTrackAppenders({ filterThreadsByName: trackName, expandedTracks: expanded ? trackAppenderNames : undefined });
    const delegate = new MockFlameChartDelegate();
    const flameChart = new PerfUI.FlameChart.FlameChart(dataProvider, delegate);
    const minTime = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(traceParsedData.Meta.traceBounds.min);
    const maxTime = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(traceParsedData.Meta.traceBounds.max);
    flameChart.setWindowTimes(minTime, maxTime);
    flameChart.markAsRoot();
    flameChart.update();
    return { flameChart, dataProvider };
}
/**
 * Draws the network track in the flame chart using the legacy system.
 *
 * @param traceFileName The name of the trace file to be loaded to the flame
 * chart.
 * @param expanded if the track is expanded
 * @returns a flame chart element and its corresponding data provider.
 */
export async function getNetworkFlameChart(traceFileName, expanded) {
    await initializeGlobalVars();
    const traceParsedData = await TraceLoader.traceEngine(/* context= */ null, traceFileName);
    const minTime = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(traceParsedData.Meta.traceBounds.min);
    const maxTime = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(traceParsedData.Meta.traceBounds.max);
    const dataProvider = new Timeline.TimelineFlameChartNetworkDataProvider.TimelineFlameChartNetworkDataProvider();
    dataProvider.setModel(traceParsedData);
    dataProvider.setWindowTimes(minTime, maxTime);
    dataProvider.timelineData().groups.forEach(group => {
        group.expanded = expanded;
    });
    const delegate = new MockFlameChartDelegate();
    const flameChart = new PerfUI.FlameChart.FlameChart(dataProvider, delegate);
    flameChart.setWindowTimes(minTime, maxTime);
    flameChart.markAsRoot();
    flameChart.update();
    return { flameChart, dataProvider };
}
// We create here a cross-test base trace event. It is assumed that each
// test will import this default event and copy-override properties at will.
export const defaultTraceEvent = {
    name: 'process_name',
    tid: TraceEngine.Types.TraceEvents.ThreadID(0),
    pid: TraceEngine.Types.TraceEvents.ProcessID(0),
    ts: TraceEngine.Types.Timing.MicroSeconds(0),
    cat: 'test',
    ph: "M" /* TraceEngine.Types.TraceEvents.Phase.METADATA */,
};
/**
 * Gets the tree in a thread.
 * @see RendererHandler.ts
 */
export function getTree(thread) {
    const tree = thread.tree;
    if (!tree) {
        assert(false, `Couldn't get tree in thread ${thread.name}`);
    }
    return tree;
}
/**
 * Gets the n-th root from a tree in a thread.
 * @see RendererHandler.ts
 */
export function getRootAt(thread, index) {
    const tree = getTree(thread);
    const node = [...tree.roots][index];
    if (node === undefined) {
        assert(false, `Couldn't get the id of the root at index ${index} in thread ${thread.name}`);
    }
    return node;
}
/**
 * Gets all nodes in a thread. To finish this task, we Walk through all the nodes, starting from the root node.
 */
export function getAllNodes(roots) {
    const allNodes = [];
    const children = Array.from(roots);
    while (children.length > 0) {
        const childNode = children.shift();
        if (childNode) {
            allNodes.push(childNode);
            children.push(...childNode.children);
        }
    }
    return allNodes;
}
/**
 * Gets the node with an id from a tree in a thread.
 * @see RendererHandler.ts
 */
export function getNodeFor(thread, nodeId) {
    const tree = getTree(thread);
    function findNode(nodes, nodeId) {
        for (const node of nodes) {
            const event = node.entry;
            if (TraceEngine.Types.TraceEvents.isProfileCall(event) && event.nodeId === nodeId) {
                return node;
            }
            return findNode(node.children, nodeId);
        }
        return undefined;
    }
    const node = findNode(tree.roots, nodeId);
    if (!node) {
        assert(false, `Couldn't get the node with id ${nodeId} in thread ${thread.name}`);
    }
    return node;
}
/**
 * Gets all the `events` for the `nodes`.
 */
export function getEventsIn(nodes) {
    return [...nodes].flatMap(node => node ? node.entry : []);
}
/**
 * Pretty-prints a tree.
 */
export function prettyPrint(tree, predicate = () => true, indentation = 2, delimiter = ' ', prefix = '-', newline = '\n', out = '') {
    let skipped = false;
    return printNodes(tree.roots);
    function printNodes(nodes) {
        for (const node of nodes) {
            const event = node.entry;
            if (!predicate(node, event)) {
                out += `${!skipped ? newline : ''}.`;
                skipped = true;
                continue;
            }
            skipped = false;
            const spacing = new Array(node.depth * indentation).fill(delimiter).join('');
            const eventType = TraceEngine.Types.TraceEvents.isTraceEventDispatch(event) ? `(${event.args.data?.type})` : false;
            const jsFunctionName = TraceEngine.Types.TraceEvents.isProfileCall(event) ?
                `(${event.callFrame.functionName || 'anonymous'})` :
                false;
            const duration = `[${(event.dur || 0) / 1000}ms]`;
            const info = [jsFunctionName, eventType, duration].filter(Boolean);
            out += `${newline}${spacing}${prefix}${event.name} ${info.join(' ')}`;
            out = printNodes(node.children);
        }
        return out;
    }
}
/**
 * Builds a mock TraceEventComplete.
 */
export function makeCompleteEvent(name, ts, dur, cat = '*', pid = 0, tid = 0) {
    return {
        args: {},
        cat,
        name,
        ph: "X" /* TraceEngine.Types.TraceEvents.Phase.COMPLETE */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(ts),
        dur: TraceEngine.Types.Timing.MicroSeconds(dur),
    };
}
export function makeAsyncStartEvent(name, ts, pid = 0, tid = 0) {
    return {
        args: {},
        cat: '*',
        name,
        ph: "b" /* TraceEngine.Types.TraceEvents.Phase.ASYNC_NESTABLE_START */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(ts),
    };
}
export function makeAsyncEndEvent(name, ts, pid = 0, tid = 0) {
    return {
        args: {},
        cat: '*',
        name,
        ph: "e" /* TraceEngine.Types.TraceEvents.Phase.ASYNC_NESTABLE_END */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(ts),
    };
}
export function makeCompleteEventInMilliseconds(name, tsMillis, durMillis, cat = '*', pid = 0, tid = 0) {
    return makeCompleteEvent(name, TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(tsMillis)), TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(durMillis)), cat, pid, tid);
}
/**
 * Builds a mock TraceEventInstant.
 */
export function makeInstantEvent(name, tsMicroseconds, cat = '', pid = 0, tid = 0, s = "t" /* TraceEngine.Types.TraceEvents.TraceEventScope.THREAD */) {
    return {
        args: {},
        cat,
        name,
        ph: "I" /* TraceEngine.Types.TraceEvents.Phase.INSTANT */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(tsMicroseconds),
        s,
    };
}
/**
 * Builds a mock TraceEventBegin.
 */
export function makeBeginEvent(name, ts, cat = '*', pid = 0, tid = 0) {
    return {
        args: {},
        cat,
        name,
        ph: "B" /* TraceEngine.Types.TraceEvents.Phase.BEGIN */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(ts),
    };
}
/**
 * Builds a mock TraceEventEnd.
 */
export function makeEndEvent(name, ts, cat = '*', pid = 0, tid = 0) {
    return {
        args: {},
        cat,
        name,
        ph: "E" /* TraceEngine.Types.TraceEvents.Phase.END */,
        pid: TraceEngine.Types.TraceEvents.ProcessID(pid),
        tid: TraceEngine.Types.TraceEvents.ThreadID(tid),
        ts: TraceEngine.Types.Timing.MicroSeconds(ts),
    };
}
export function makeProfileCall(functionName, tsMs, durMs, pid = TraceEngine.Types.TraceEvents.ProcessID(0), tid = TraceEngine.Types.TraceEvents.ThreadID(0), nodeId = 0, url = '') {
    return {
        cat: '',
        name: 'ProfileCall',
        nodeId,
        sampleIndex: 0,
        profileId: TraceEngine.Types.TraceEvents.ProfileID('fake-profile-id'),
        ph: "X" /* TraceEngine.Types.TraceEvents.Phase.COMPLETE */,
        pid,
        tid,
        ts: TraceEngine.Types.Timing.MicroSeconds(tsMs),
        dur: TraceEngine.Types.Timing.MicroSeconds(durMs),
        selfTime: TraceEngine.Types.Timing.MicroSeconds(0),
        callFrame: {
            functionName,
            scriptId: '',
            url: url,
            lineNumber: -1,
            columnNumber: -1,
        },
        args: {},
    };
}
export const DevToolsTimelineCategory = 'disabled-by-default-devtools.timeline';
/**
 * Mocks an object compatible with the return type of the
 * RendererHandler using only an array of ordered entries.
 */
export function makeMockRendererHandlerData(entries) {
    const { tree, entryToNode } = TraceEngine.Helpers.TreeHelpers.treify(entries, { filter: { has: () => true } });
    const mockThread = {
        tree,
        name: 'thread',
        entries,
        profileCalls: entries.filter(TraceEngine.Types.TraceEvents.isProfileCall),
    };
    const mockProcess = {
        url: 'url',
        isOnMainFrame: true,
        threads: new Map([[1, mockThread]]),
    };
    const renderereEvents = [];
    for (const entry of entries) {
        if (TraceEngine.Types.TraceEvents.isTraceEventRendererEvent(entry)) {
            renderereEvents.push(entry);
        }
    }
    return {
        processes: new Map([[1, mockProcess]]),
        compositorTileWorkers: new Map(),
        entryToNode,
        allTraceEntries: renderereEvents,
    };
}
/**
 * Mocks an object compatible with the return type of the
 * SamplesHandler using only an array of ordered profile calls.
 */
export function makeMockSamplesHandlerData(profileCalls) {
    const { tree, entryToNode } = TraceEngine.Helpers.TreeHelpers.treify(profileCalls, { filter: { has: () => true } });
    const profile = {
        nodes: [],
        startTime: profileCalls.at(0)?.ts || TraceEngine.Types.Timing.MicroSeconds(0),
        endTime: profileCalls.at(-1)?.ts || TraceEngine.Types.Timing.MicroSeconds(10e5),
        samples: [],
        timeDeltas: [],
    };
    const nodesIds = new Map();
    const lastTimestamp = profile.startTime;
    for (const profileCall of profileCalls) {
        let node = nodesIds.get(profileCall.nodeId);
        if (!node) {
            node = {
                id: profileCall.nodeId,
                callFrame: profileCall.callFrame,
            };
            profile.nodes.push(node);
            nodesIds.set(profileCall.nodeId, node);
        }
        profile.samples?.push(node.id);
        const timeDelta = profileCall.ts - lastTimestamp;
        profile.timeDeltas?.push(timeDelta);
    }
    const profileData = {
        rawProfile: profile,
        parsedProfile: new CPUProfile.CPUProfileDataModel.CPUProfileDataModel(profile),
        profileCalls,
        profileTree: tree,
        profileId: TraceEngine.Types.TraceEvents.ProfileID('fake-profile-id'),
    };
    const profilesInThread = new Map([[1, profileData]]);
    return {
        profilesInProcess: new Map([[1, profilesInThread]]),
        entryToNode,
    };
}
export class FakeFlameChartProvider {
    minimumBoundary() {
        return 0;
    }
    hasTrackConfigurationMode() {
        return false;
    }
    totalTime() {
        return 100;
    }
    formatValue(value) {
        return value.toString();
    }
    maxStackDepth() {
        return 3;
    }
    prepareHighlightedEntryInfo(_entryIndex) {
        return null;
    }
    canJumpToEntry(_entryIndex) {
        return false;
    }
    entryTitle(entryIndex) {
        return `Entry ${entryIndex}`;
    }
    entryFont(_entryIndex) {
        return null;
    }
    entryColor(entryIndex) {
        return [
            'lightblue',
            'lightpink',
            'yellow',
            'lightgray',
            'lightgreen',
            'lightsalmon',
            'orange',
            'pink',
        ][entryIndex % 8];
    }
    decorateEntry() {
        return false;
    }
    forceDecoration(_entryIndex) {
        return false;
    }
    textColor(_entryIndex) {
        return 'black';
    }
    timelineData() {
        return PerfUI.FlameChart.FlameChartTimelineData.createEmpty();
    }
}
export function getMainThread(data) {
    let mainThread = null;
    for (const [, process] of data.processes) {
        for (const [, thread] of process.threads) {
            if (thread.name === 'CrRendererMain') {
                mainThread = thread;
                break;
            }
        }
    }
    if (!mainThread) {
        throw new Error('Could not find main thread.');
    }
    return mainThread;
}
export function getBaseTraceParseModelData(overrides = {}) {
    return {
        Animations: [],
        LayoutShifts: {
            clusters: [],
            sessionMaxScore: 0,
            clsWindowID: 0,
            prePaintEvents: [],
            layoutInvalidationEvents: [],
            styleRecalcInvalidationEvents: [],
            backendNodeIds: [],
            scoreRecords: [],
        },
        Meta: {
            traceBounds: {
                min: TraceEngine.Types.Timing.MicroSeconds(0),
                max: TraceEngine.Types.Timing.MicroSeconds(100),
                range: TraceEngine.Types.Timing.MicroSeconds(100),
            },
            browserProcessId: TraceEngine.Types.TraceEvents.ProcessID(-1),
            browserThreadId: TraceEngine.Types.TraceEvents.ThreadID(-1),
            gpuProcessId: TraceEngine.Types.TraceEvents.ProcessID(-1),
            gpuThreadId: TraceEngine.Types.TraceEvents.ThreadID(-1),
            threadsInProcess: new Map(),
            navigationsByFrameId: new Map(),
            navigationsByNavigationId: new Map(),
            mainFrameId: '',
            mainFrameURL: '',
            rendererProcessesByFrame: new Map(),
            topLevelRendererIds: new Set(),
            frameByProcessId: new Map(),
            mainFrameNavigations: [],
        },
        Renderer: {
            processes: new Map(),
            compositorTileWorkers: new Map(),
            entryToNode: new Map(),
            allTraceEntries: [],
        },
        Screenshots: [],
        Samples: {
            profiles: new Map(),
            processes: new Map(),
        },
        PageLoadMetrics: { metricScoresByFrameId: new Map(), lcpEventNodeIdToDOMNodeMap: new Map() },
        UserInteractions: { allEvents: [], interactionEvents: [] },
        NetworkRequests: {
            byOrigin: new Map(),
            byTime: [],
        },
        GPU: {
            mainGPUThreadTasks: [],
            errorsByUseCase: new Map(),
        },
        UserTimings: {
            timings: [],
        },
        LargestImagePaint: new Map(),
        LargestTextPaint: new Map(),
        ...overrides,
    };
}
/**
 * A helper that will query the given array of events and find the first event
 * matching the predicate. It will also assert that a match is found, which
 * saves the need to do that for every test.
 */
export function getEventOfType(events, predicate) {
    const match = events.find(predicate);
    if (!match) {
        throw new Error('Failed to find matching event of type.');
    }
    return match;
}
/**
 * The Performance Panel is integrated with the IgnoreListManager so in tests
 * that render a flame chart or a track appender, it needs to be setup to avoid
 * errors.
 */
export function setupIgnoreListManagerEnvironment() {
    const targetManager = SDK.TargetManager.TargetManager.instance({ forceNew: true });
    const workspace = Workspace.Workspace.WorkspaceImpl.instance({ forceNew: true });
    const resourceMapping = new Bindings.ResourceMapping.ResourceMapping(targetManager, workspace);
    const debuggerWorkspaceBinding = Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance({
        forceNew: true,
        resourceMapping,
        targetManager,
    });
    const ignoreListManager = Bindings.IgnoreListManager.IgnoreListManager.instance({
        forceNew: true,
        debuggerWorkspaceBinding,
    });
    return { ignoreListManager };
}
//# sourceMappingURL=TraceHelpers.js.map