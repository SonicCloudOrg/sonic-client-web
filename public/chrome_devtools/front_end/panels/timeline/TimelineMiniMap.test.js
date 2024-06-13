// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
import * as ModificationsManager from '../../services/modifications_manager/modifications_manager.js';
import { raf, renderElementIntoDOM } from '../../testing/DOMHelpers.js';
import { describeWithEnvironment } from '../../testing/EnvironmentHelpers.js';
import { TraceLoader } from '../../testing/TraceLoader.js';
import * as TimelineComponents from './components/components.js';
import * as Timeline from './timeline.js';
describeWithEnvironment('TimelineMiniMap', function () {
    it('always shows the responsiveness, CPU activity and network panel', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
        const container = document.createElement('div');
        renderElementIntoDOM(container);
        const minimap = new Timeline.TimelineMiniMap.TimelineMiniMap();
        minimap.markAsRoot();
        minimap.show(container);
        minimap.setData({
            traceParsedData,
            settings: {
                showMemory: false,
                showScreenshots: false,
            },
        });
        await raf();
        assert.exists(container.querySelector('#timeline-overview-responsiveness'));
        assert.exists(container.querySelector('#timeline-overview-cpu-activity'));
        assert.exists(container.querySelector('#timeline-overview-network'));
        assert.isNull(container.querySelector('#timeline-overview-filmstrip'));
        assert.isNull(container.querySelector('#timeline-overview-memory'));
        minimap.detach();
    });
    it('will show the other panels if they are set to visible', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
        const container = document.createElement('div');
        renderElementIntoDOM(container);
        const minimap = new Timeline.TimelineMiniMap.TimelineMiniMap();
        minimap.markAsRoot();
        minimap.show(container);
        minimap.setData({
            traceParsedData,
            settings: {
                showMemory: true,
                showScreenshots: true,
            },
        });
        await raf();
        assert.exists(container.querySelector('#timeline-overview-responsiveness'));
        assert.exists(container.querySelector('#timeline-overview-cpu-activity'));
        assert.exists(container.querySelector('#timeline-overview-network'));
        assert.exists(container.querySelector('#timeline-overview-filmstrip'));
        assert.exists(container.querySelector('#timeline-overview-memory'));
        minimap.detach();
    });
    it('creates the first breadcrumb', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
        const container = document.createElement('div');
        renderElementIntoDOM(container);
        const minimap = new Timeline.TimelineMiniMap.TimelineMiniMap();
        minimap.markAsRoot();
        minimap.show(container);
        minimap.setData({
            traceParsedData,
            settings: {
                showMemory: true,
                showScreenshots: true,
            },
        });
        minimap.addInitialBreadcrumb();
        await raf();
        if (!minimap.breadcrumbs) {
            throw new Error('The MiniMap unexpectedly did not create any breadcrumbs');
        }
        assert.strictEqual(TimelineComponents.Breadcrumbs.flattenBreadcrumbs(minimap.breadcrumbs.initialBreadcrumb).length, 1);
        assert.deepEqual(minimap.breadcrumbs.initialBreadcrumb, { window: traceParsedData.Meta.traceBounds, child: null });
    });
    it('stores breadcrumbs to be serialized', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
        const minimap = new Timeline.TimelineMiniMap.TimelineMiniMap();
        minimap.setData({
            traceParsedData,
            settings: {
                showMemory: true,
                showScreenshots: true,
            },
        });
        minimap.addInitialBreadcrumb();
        const entireTraceBounds = traceParsedData.Meta.traceBounds;
        const newBounds = {
            ...entireTraceBounds,
            min: TraceEngine.Types.Timing.MicroSeconds((entireTraceBounds.max + entireTraceBounds.min) / 2),
        };
        minimap.breadcrumbs?.add(newBounds);
        const serializableModifications = ModificationsManager.ModificationsManager.ModificationsManager.activeManager()?.toJSON();
        assert.deepEqual(serializableModifications?.initialBreadcrumb.child, { window: { min: 1020035455504, max: 1020036087961, range: 1264914 }, child: null });
    });
});
//# sourceMappingURL=TimelineMiniMap.test.js.map