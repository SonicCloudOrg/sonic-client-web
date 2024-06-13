// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
import { describeWithEnvironment } from '../../testing/EnvironmentHelpers.js';
import { getMainThread } from '../../testing/TraceHelpers.js';
import { TraceLoader } from '../../testing/TraceLoader.js';
import * as Timeline from './timeline.js';
describeWithEnvironment('TimelineFilters', () => {
    describe('IsLong', () => {
        it('returns true if the event is longer than the defined duration for a new engine event', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'one-second-interaction.json.gz');
            const longEvent = getMainThread(traceParsedData.Renderer).entries.find(event => {
                return event.dur &&
                    event.dur >
                        TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(50));
            });
            if (!longEvent) {
                throw new Error('Could not find expected long event.');
            }
            const filter = new Timeline.TimelineFilters.IsLong();
            filter.setMinimumRecordDuration(TraceEngine.Types.Timing.MilliSeconds(50));
            assert.isTrue(filter.accept(longEvent));
        });
        it('returns false if the event is shorter than the defined duration for a new engine event', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'one-second-interaction.json.gz');
            const longEvent = getMainThread(traceParsedData.Renderer).entries.find(event => {
                return event.dur &&
                    event.dur >
                        TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(50)) &&
                    event.dur <
                        TraceEngine.Helpers.Timing.millisecondsToMicroseconds(TraceEngine.Types.Timing.MilliSeconds(100));
            });
            if (!longEvent) {
                throw new Error('Could not find expected long event.');
            }
            const filter = new Timeline.TimelineFilters.IsLong();
            filter.setMinimumRecordDuration(TraceEngine.Types.Timing.MilliSeconds(101));
            assert.isFalse(filter.accept(longEvent));
        });
    });
    describe('Category', () => {
        it('returns false for a new event if it has a category that is hidden', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'user-timings.json.gz');
            // These events are usually visible, so make the category hidden before
            // running this test.
            Timeline.EventUICategory.getCategoryStyles()['scripting'].hidden = true;
            const userTimingEvent = (traceParsedData.UserTimings.performanceMeasures).at(0);
            if (!userTimingEvent) {
                throw new Error('Could not find expected event.');
            }
            const filter = new Timeline.TimelineFilters.Category();
            assert.isFalse(filter.accept(userTimingEvent));
            Timeline.EventUICategory.getCategoryStyles()['scripting'].hidden = false;
        });
        it('returns true for a new event if it has a category that is visible', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'user-timings.json.gz');
            const userTimingEvent = (traceParsedData.UserTimings.performanceMeasures).at(0);
            if (!userTimingEvent) {
                throw new Error('Could not find expected event.');
            }
            const filter = new Timeline.TimelineFilters.Category();
            assert.isTrue(filter.accept(userTimingEvent));
            Timeline.EventUICategory.getCategoryStyles()['scripting'].hidden = false;
        });
    });
});
//# sourceMappingURL=TimelineFilters.test.js.map