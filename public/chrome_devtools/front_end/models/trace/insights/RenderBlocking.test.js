// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TraceLoader } from '../../../testing/TraceLoader.js';
import * as TraceModel from '../trace.js';
async function parseAndFinalizeData(testContext, traceFile) {
    const traceEvents = await TraceLoader.rawEvents(testContext, traceFile);
    TraceModel.Handlers.ModelHandlers.Meta.reset();
    TraceModel.Handlers.ModelHandlers.NetworkRequests.reset();
    TraceModel.Handlers.ModelHandlers.PageLoadMetrics.reset();
    TraceModel.Handlers.ModelHandlers.Meta.initialize();
    TraceModel.Handlers.ModelHandlers.NetworkRequests.initialize();
    for (const event of traceEvents) {
        TraceModel.Handlers.ModelHandlers.Meta.handleEvent(event);
        TraceModel.Handlers.ModelHandlers.NetworkRequests.handleEvent(event);
        TraceModel.Handlers.ModelHandlers.PageLoadMetrics.handleEvent(event);
    }
    await TraceModel.Handlers.ModelHandlers.Meta.finalize();
    await TraceModel.Handlers.ModelHandlers.NetworkRequests.finalize();
    await TraceModel.Handlers.ModelHandlers.PageLoadMetrics.finalize();
    const data = {
        Meta: TraceModel.Handlers.ModelHandlers.Meta.data(),
        NetworkRequests: TraceModel.Handlers.ModelHandlers.NetworkRequests.data(),
        PageLoadMetrics: TraceModel.Handlers.ModelHandlers.PageLoadMetrics.data(),
    };
    return data;
}
describe('RenderBlockingRequests', function () {
    it('finds render blocking requests', async () => {
        const data = await parseAndFinalizeData(this, 'load-simple.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert.strictEqual(insight.renderBlockingRequests.length, 2);
        assert.deepEqual(insight.renderBlockingRequests.map(r => r.args.data.url), [
            'https://fonts.googleapis.com/css2?family=Orelega+One&display=swap',
            'http://localhost:8080/styles.css',
        ]);
    });
    it('returns a warning if navigation does not have a first paint event', async () => {
        const data = await parseAndFinalizeData(this, 'user-timings.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert.strictEqual(insight.renderBlockingRequests.length, 0);
        assert.strictEqual(insight.warnings?.length, 1);
        assert.strictEqual(insight.warnings?.[0], 'NO_FP');
    });
    it('considers only the navigation specified by the context', async () => {
        const data = await parseAndFinalizeData(this, 'multiple-navigations-render-blocking.json.gz');
        const navigations = Array.from(data.Meta.navigationsByNavigationId.values());
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: navigations[0].args.data?.navigationId || '',
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert(insight.renderBlockingRequests.length > 0, 'no render blocking requests found');
        assert(insight.renderBlockingRequests.every(r => r.args.data.syntheticData.sendStartTime > navigations[0].ts), 'a result is not contained by the nav bounds');
        assert(insight.renderBlockingRequests.every(r => r.args.data.syntheticData.finishTime < navigations[1].ts), 'a result is not contained by the nav bounds');
    });
    it('considers only the frame specified by the context', async () => {
        const data = await parseAndFinalizeData(this, 'render-blocking-in-iframe.json.gz');
        const navigations = Array.from(data.Meta.navigationsByNavigationId.values());
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: navigations[0].args.data?.navigationId || '',
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert(insight.renderBlockingRequests.length > 0, 'no render blocking requests found');
        assert(insight.renderBlockingRequests.every(r => r.args.data.frame === context.frameId), 'a result is not from the main frame');
    });
    it('ignores blocking request after first paint', async () => {
        const data = await parseAndFinalizeData(this, 'parser-blocking-after-paint.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert.strictEqual(insight.renderBlockingRequests.length, 0);
    });
    it('correctly handles body parser blocking requests', async () => {
        const data = await parseAndFinalizeData(this, 'render-blocking-body.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.RenderBlocking.generateInsight(data, context);
        assert.deepStrictEqual(insight.renderBlockingRequests.map(r => r.args.data.url), [
            'http://localhost:8080/render-blocking/style.css',
            'http://localhost:8080/render-blocking/script.js?beforeImage',
        ]);
    });
});
//# sourceMappingURL=RenderBlocking.test.js.map