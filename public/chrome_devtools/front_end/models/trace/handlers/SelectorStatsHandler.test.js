// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TraceLoader } from '../../../testing/TraceLoader.js';
import * as TraceEngine from '../trace.js';
describe('SelectorStatsHandler', () => {
    it('associates timings and stats with each UpdateLayoutEvent', async function () {
        TraceEngine.Handlers.ModelHandlers.SelectorStats.reset();
        const events = await TraceLoader.rawEvents(this, 'selector-stats.json.gz');
        for (const event of events) {
            TraceEngine.Handlers.ModelHandlers.SelectorStats.handleEvent(event);
        }
        const data = TraceEngine.Handlers.ModelHandlers.SelectorStats.data();
        // There are 10 UpdateLayoutTree events that we expect to find
        // SelectorStats for.
        assert.strictEqual(data.dataForUpdateLayoutEvent.size, 10);
        // We need the first updateLayoutEvent that happened before the
        // SelectorStats. This timestamp was found by looking through the trace and
        // finding the first SelectorStats event, and then finding the closest
        // previous UpdateLayoutTreeEvent
        const targetTimeStamp = 400015719531;
        const updateLayoutEvent = events.find(event => {
            return TraceEngine.Types.TraceEvents.isTraceEventUpdateLayoutTree(event) && event.ts === targetTimeStamp;
        });
        assert.isOk(updateLayoutEvent);
        if (!TraceEngine.Types.TraceEvents.isTraceEventUpdateLayoutTree(updateLayoutEvent)) {
            assert.fail('Event was of the wrong type.');
        }
        const selectorInfo = data.dataForUpdateLayoutEvent.get(updateLayoutEvent);
        assert.isOk(selectorInfo);
        // Ensure that we dumped the timings into the event
        assert.lengthOf(selectorInfo.timings, 325);
    });
});
//# sourceMappingURL=SelectorStatsHandler.test.js.map