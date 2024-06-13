// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { describeWithEnvironment } from '../../../testing/EnvironmentHelpers.js';
import { TraceLoader } from '../../../testing/TraceLoader.js';
import * as TraceEngine from '../trace.js';
describeWithEnvironment('TraceEvent types', function () {
    const { Phase, isNestableAsyncPhase, isAsyncPhase, isFlowPhase } = TraceEngine.Types.TraceEvents;
    it('is able to determine if a phase is a nestable async phase', function () {
        assert.isTrue(isNestableAsyncPhase("b" /* Phase.ASYNC_NESTABLE_START */));
        assert.isTrue(isNestableAsyncPhase("e" /* Phase.ASYNC_NESTABLE_END */));
        assert.isTrue(isNestableAsyncPhase("n" /* Phase.ASYNC_NESTABLE_INSTANT */));
    });
    it('is able to determine if a phase is not a nestable async phase', function () {
        assert.isFalse(isNestableAsyncPhase("B" /* Phase.BEGIN */));
        assert.isFalse(isNestableAsyncPhase("E" /* Phase.END */));
        assert.isFalse(isNestableAsyncPhase("S" /* Phase.ASYNC_BEGIN */));
    });
    it('is able to determine if a phase is an async phase', function () {
        assert.isTrue(isAsyncPhase("b" /* Phase.ASYNC_NESTABLE_START */));
        assert.isTrue(isAsyncPhase("e" /* Phase.ASYNC_NESTABLE_END */));
        assert.isTrue(isAsyncPhase("n" /* Phase.ASYNC_NESTABLE_INSTANT */));
        assert.isTrue(isAsyncPhase("S" /* Phase.ASYNC_BEGIN */));
        assert.isTrue(isAsyncPhase("T" /* Phase.ASYNC_STEP_INTO */));
        assert.isTrue(isAsyncPhase("p" /* Phase.ASYNC_STEP_PAST */));
        assert.isTrue(isAsyncPhase("F" /* Phase.ASYNC_END */));
    });
    it('is able to determine if a phase is not an async phase', function () {
        assert.isFalse(isAsyncPhase("B" /* Phase.BEGIN */));
        assert.isFalse(isAsyncPhase("M" /* Phase.METADATA */));
        assert.isFalse(isAsyncPhase("N" /* Phase.OBJECT_CREATED */));
    });
    it('is able to determine if a phase is a flow phase', function () {
        assert.isTrue(isFlowPhase("s" /* Phase.FLOW_START */));
        assert.isTrue(isFlowPhase("t" /* Phase.FLOW_STEP */));
        assert.isTrue(isFlowPhase("f" /* Phase.FLOW_END */));
    });
    it('is able to determine if a phase is not a flow phase', function () {
        assert.isFalse(isFlowPhase("T" /* Phase.ASYNC_STEP_INTO */));
        assert.isFalse(isFlowPhase("b" /* Phase.ASYNC_NESTABLE_START */));
        assert.isFalse(isFlowPhase("B" /* Phase.BEGIN */));
    });
    it('is able to determine that an event is a synthetic user timing event', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'timings-track.json.gz');
        const timingEvent = traceParsedData.UserTimings.performanceMeasures[0];
        assert.isTrue(TraceEngine.Types.TraceEvents.isSyntheticUserTiming(timingEvent));
        const consoleEvent = traceParsedData.UserTimings.consoleTimings[0];
        assert.isFalse(TraceEngine.Types.TraceEvents.isSyntheticUserTiming(consoleEvent));
    });
    it('is able to determine that an event is a synthetic console event', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'timings-track.json.gz');
        const consoleEvent = traceParsedData.UserTimings.consoleTimings[0];
        assert.isTrue(TraceEngine.Types.TraceEvents.isSyntheticConsoleTiming(consoleEvent));
        const timingEvent = traceParsedData.UserTimings.performanceMeasures[0];
        assert.isFalse(TraceEngine.Types.TraceEvents.isSyntheticConsoleTiming(timingEvent));
    });
    it('is able to detemrine that an event is a synthetic network request event', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'lcp-images.json.gz');
        const networkEvent = traceParsedData.NetworkRequests.byTime[0];
        assert.isTrue(TraceEngine.Types.TraceEvents.isSyntheticNetworkRequestDetailsEvent(networkEvent));
        const otherEvent = traceParsedData.Renderer.allTraceEntries[0];
        assert.isFalse(TraceEngine.Types.TraceEvents.isSyntheticNetworkRequestDetailsEvent(otherEvent));
    });
    it('is able to determine that an event is a synthetic layout shift event', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'cls-single-frame.json.gz');
        const syntheticLayoutShift = traceParsedData.LayoutShifts.clusters[0].events[0];
        assert.isTrue(TraceEngine.Types.TraceEvents.isSyntheticLayoutShift(syntheticLayoutShift));
    });
});
//# sourceMappingURL=TraceEvents.test.js.map