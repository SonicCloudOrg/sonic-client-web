// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { TraceLoader } from '../../../testing/TraceLoader.js';
import * as TraceModel from '../trace.js';
async function parseAndFinalizeData(testContext, traceFile) {
    const traceEvents = await TraceLoader.rawEvents(testContext, traceFile);
    TraceModel.Handlers.ModelHandlers.Meta.reset();
    TraceModel.Handlers.ModelHandlers.Meta.initialize();
    for (const event of traceEvents) {
        TraceModel.Handlers.ModelHandlers.Meta.handleEvent(event);
        TraceModel.Handlers.ModelHandlers.UserInteractions.handleEvent(event);
    }
    await TraceModel.Handlers.ModelHandlers.Meta.finalize();
    await TraceModel.Handlers.ModelHandlers.UserInteractions.finalize();
    const data = {
        Meta: TraceModel.Handlers.ModelHandlers.Meta.data(),
        UserInteractions: TraceModel.Handlers.ModelHandlers.UserInteractions.data(),
    };
    return data;
}
describe('InteractionToNextPaint', function () {
    const test = (traceFile, longest, highPercentile) => {
        if (highPercentile === undefined) {
            highPercentile = longest;
        }
        it(`process ${traceFile}`, async () => {
            const data = await parseAndFinalizeData(this, traceFile);
            const context = {
                frameId: data.Meta.mainFrameId,
                navigationId: data.Meta.navigationsByNavigationId.keys().next().value,
            };
            const insight = TraceModel.Insights.InsightRunners.InteractionToNextPaint.generateInsight(data, context);
            assert.strictEqual(insight.longestInteractionEvent?.dur, longest);
            assert.strictEqual(insight.highPercentileInteractionEvent?.dur, highPercentile);
        });
    };
    test('lcp-images.json.gz', undefined);
    test('slow-interaction-keydown.json.gz', 163609);
    test('nested-interactions.json.gz', 23370);
    test('slow-interaction-button-click.json.gz', 139238);
});
//# sourceMappingURL=InteractionToNextPaint.test.js.map