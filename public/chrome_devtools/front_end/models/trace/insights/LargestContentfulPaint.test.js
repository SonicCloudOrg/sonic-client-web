// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TraceLoader } from '../../../testing/TraceLoader.js';
import * as TraceModel from '../trace.js';
import * as Types from '../types/types.js';
async function setupTraceData(testContext, traceFile) {
    const { NetworkRequests, LargestImagePaint, Meta, PageLoadMetrics } = await TraceLoader.traceEngine(testContext, traceFile);
    const data = {
        NetworkRequests,
        LargestImagePaint,
        Meta,
        PageLoadMetrics,
    };
    return data;
}
describe('LargestContentfulPaint', function () {
    it('text lcp phases', async () => {
        const data = await setupTraceData(this, 'lcp-web-font.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.LargestContentfulPaint.generateInsight(data, context);
        assert.strictEqual(insight.lcpMs, 106.482);
        const wantTtfb = Types.Timing.MilliSeconds(6.115);
        const wantRenderDelay = Types.Timing.MilliSeconds(100.367);
        assert.deepEqual(insight.phases, { ttfb: wantTtfb, renderDelay: wantRenderDelay });
    });
    it('image lcp phases', async () => {
        const data = await setupTraceData(this, 'lcp-images.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const insight = TraceModel.Insights.InsightRunners.LargestContentfulPaint.generateInsight(data, context);
        assert.strictEqual(insight.lcpMs, 109.623);
        if (!insight.phases) {
            throw new Error('No LCP phases');
        }
        const phases = {
            ttfb: insight.phases.ttfb?.toFixed(2),
            loadTime: insight.phases.loadTime?.toFixed(2),
            loadDelay: insight.phases.loadDelay?.toFixed(2),
            renderDelay: insight.phases.renderDelay?.toFixed(2),
        };
        assert.deepEqual(phases, { ttfb: '6.94', loadTime: '12.09', loadDelay: '33.74', renderDelay: '56.85' });
    });
    it('image lcp attributes', async () => {
        const data = await setupTraceData(this, 'lcp-images.json.gz');
        const context = {
            frameId: data.Meta.mainFrameId,
            navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
        };
        const { shouldIncreasePriorityHint, shouldPreloadImage, shouldRemoveLazyLoading } = TraceModel.Insights.InsightRunners.LargestContentfulPaint.generateInsight(data, context);
        assert.strictEqual(shouldRemoveLazyLoading, false);
        assert.strictEqual(shouldPreloadImage, true);
        assert.strictEqual(shouldIncreasePriorityHint, true);
    });
    describe('warnings', function () {
        it('no lcp', async () => {
            const data = await setupTraceData(this, 'user-timings.json.gz');
            const context = {
                frameId: data.Meta.mainFrameId,
                navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
            };
            const insight = TraceModel.Insights.InsightRunners.LargestContentfulPaint.generateInsight(data, context);
            assert.strictEqual(insight.lcpMs, undefined);
            assert.strictEqual(insight.phases, undefined);
            assert.strictEqual(insight.warnings?.[0], 'NO_LCP');
        });
        it('no main document url', async () => {
            const data = await setupTraceData(this, 'about-blank-first.json.gz');
            const context = {
                frameId: data.Meta.mainFrameId,
                navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
            };
            const insight = TraceModel.Insights.InsightRunners.LargestContentfulPaint.generateInsight(data, context);
            assert.strictEqual(insight.lcpMs, 204.909);
            assert.strictEqual(insight.phases, undefined);
            assert.strictEqual(insight.warnings?.[0], 'NO_DOCUMENT_REQUEST');
        });
    });
});
//# sourceMappingURL=LargestContentfulPaint.test.js.map