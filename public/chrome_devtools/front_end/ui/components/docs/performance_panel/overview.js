// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../../../models/trace/trace.js';
import * as Timeline from '../../../../panels/timeline/timeline.js';
import * as TraceBounds from '../../../../services/trace_bounds/trace_bounds.js';
import * as EnvironmentHelpers from '../../../../testing/EnvironmentHelpers.js';
import * as TraceLoader from '../../../../testing/TraceLoader.js';
import * as ComponentSetup from '../../helpers/helpers.js';
await EnvironmentHelpers.initializeGlobalVars();
await ComponentSetup.ComponentServerSetup.setup();
const container = document.querySelector('div.container');
if (!container) {
    throw new Error('could not find container');
}
const params = new URLSearchParams(window.location.search);
const fileName = (params.get('trace') || 'web-dev') + '.json.gz';
const customStartWindowTime = params.get('windowStart');
const customEndWindowTime = params.get('windowEnd');
async function renderMiniMap(containerSelector, options) {
    const container = document.querySelector(containerSelector);
    if (!container) {
        throw new Error('could not find container');
    }
    const traceParsedData = await TraceLoader.TraceLoader.traceEngine(null, fileName);
    const mainThread = TraceEngine.Handlers.Threads.threadsInRenderer(traceParsedData.Renderer, traceParsedData.AuctionWorklets)
        .find(t => t.type === "MAIN_THREAD" /* TraceEngine.Handlers.Threads.ThreadType.MAIN_THREAD */);
    if (!mainThread) {
        throw new Error('Could not find main thread.');
    }
    const minimap = new Timeline.TimelineMiniMap.TimelineMiniMap();
    minimap.markAsRoot();
    minimap.show(container);
    TraceBounds.TraceBounds.BoundsManager.instance().resetWithNewBounds(traceParsedData.Meta.traceBounds);
    const zoomedWindow = TraceEngine.Extras.MainThreadActivity.calculateWindow(traceParsedData.Meta.traceBounds, mainThread.entries);
    TraceBounds.TraceBounds.BoundsManager.instance().setTimelineVisibleWindow(zoomedWindow);
    minimap.setData({
        traceParsedData: traceParsedData,
        settings: {
            showMemory: options.showMemory,
            showScreenshots: true,
        },
    });
    if (customStartWindowTime && customEndWindowTime) {
        TraceBounds.TraceBounds.BoundsManager.instance().setTimelineVisibleWindow(TraceEngine.Helpers.Timing.traceWindowFromMilliSeconds(TraceEngine.Types.Timing.MilliSeconds(Number(customStartWindowTime)), TraceEngine.Types.Timing.MilliSeconds(Number(customEndWindowTime))));
    }
}
await renderMiniMap('.container', { showMemory: false });
await renderMiniMap('.container-with-memory', { showMemory: true });
//# sourceMappingURL=overview.js.map