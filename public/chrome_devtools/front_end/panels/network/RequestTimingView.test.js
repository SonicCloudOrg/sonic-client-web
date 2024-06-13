// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as RequestTimingView from './RequestTimingView.js';
function createNetworkRequest(matchedSource, actualSource) {
    const request = SDK.NetworkRequest.NetworkRequest.create('requestId', 'http://devtools-frontend.test', '', null, null, null);
    request.mimeType = 'application/wasm';
    request.finished = true;
    const timingInfo = {
        requestTime: 500,
        proxyStart: 0,
        proxyEnd: 0,
        dnsStart: 0,
        dnsEnd: 0,
        connectStart: 0,
        connectEnd: 0,
        sslStart: 0,
        sslEnd: 0,
        workerReady: 400,
        workerStart: 500,
        workerRouterEvaluationStart: -200,
        workerFetchStart: 600,
        workerRespondWithSettled: 700,
        sendStart: 800,
        sendEnd: 900,
        pushStart: 0,
        pushEnd: 0,
        receiveHeadersStart: 1000,
        receiveHeadersEnd: 0,
    };
    if (matchedSource === "cache" /* Protocol.Network.ServiceWorkerRouterSource.Cache */) {
        timingInfo.workerCacheLookupStart = -100;
    }
    request.timing = timingInfo;
    request.serviceWorkerRouterInfo = {
        ruleIdMatched: 1,
        matchedSourceType: matchedSource,
        actualSourceType: actualSource,
    };
    return request;
}
describe('ResourceTimingView', () => {
    it('RequestTimeRanges has router evaluation field with SW router source as network', async () => {
        const request = createNetworkRequest("network" /* Protocol.Network.ServiceWorkerRouterSource.Network */, "network" /* Protocol.Network.ServiceWorkerRouterSource.Network */);
        const timingInfo = request.timing;
        const timeRanges = RequestTimingView.RequestTimingView.calculateRequestTimeRanges(request, 100);
        const routerEvaluationTime = timingInfo.workerRouterEvaluationStart;
        const sendStart = timingInfo.sendStart;
        const routerEvaluation = timeRanges.find(timeRange => timeRange.name === "serviceworker-routerevaluation" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerRouterEvaluation */);
        assert.isTrue(Boolean(routerEvaluation), 'worker router evaluation exists');
        assert.strictEqual(routerEvaluation?.start, timingInfo.requestTime + routerEvaluationTime / 1000);
        assert.strictEqual(routerEvaluation?.end, timingInfo.requestTime + sendStart / 1000);
        const cacheLookup = timeRanges.find(timeRange => timeRange.name === "serviceworker-cachelookup" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerCacheLookup */);
        assert.isFalse(Boolean(cacheLookup), 'worker cache lookup does not exist');
    });
    it('RequestTimeRanges has router evaluation field with SW router source as fetch-event', async () => {
        const request = createNetworkRequest("fetch-event" /* Protocol.Network.ServiceWorkerRouterSource.FetchEvent */, "fetch-event" /* Protocol.Network.ServiceWorkerRouterSource.FetchEvent */);
        const timingInfo = request.timing;
        const timeRanges = RequestTimingView.RequestTimingView.calculateRequestTimeRanges(request, 100);
        const routerEvaluationTime = timingInfo.workerRouterEvaluationStart;
        const workerStart = timingInfo.workerStart;
        const routerEvaluation = timeRanges.find(timeRange => timeRange.name === "serviceworker-routerevaluation" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerRouterEvaluation */);
        assert.isTrue(Boolean(routerEvaluation), 'worker router evaluation exists');
        assert.strictEqual(routerEvaluation?.start, timingInfo.requestTime + routerEvaluationTime / 1000);
        assert.strictEqual(routerEvaluation?.end, timingInfo.requestTime + workerStart / 1000);
        const cacheLookup = timeRanges.find(timeRange => timeRange.name === "serviceworker-cachelookup" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerCacheLookup */);
        assert.isFalse(Boolean(cacheLookup), 'worker cache lookup does not exist');
    });
    it('RequestTimeRanges has router evaluation field with SW router source as cache hit', async () => {
        const request = createNetworkRequest("cache" /* Protocol.Network.ServiceWorkerRouterSource.Cache */, "cache" /* Protocol.Network.ServiceWorkerRouterSource.Cache */);
        const timingInfo = request.timing;
        const timeRanges = RequestTimingView.RequestTimingView.calculateRequestTimeRanges(request, 100);
        const routerEvaluationTime = timingInfo.workerRouterEvaluationStart;
        const cacheLookupStart = timingInfo.workerCacheLookupStart;
        const routerEvaluation = timeRanges.find(timeRange => timeRange.name === "serviceworker-routerevaluation" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerRouterEvaluation */);
        assert.isTrue(Boolean(routerEvaluation), 'worker router evaluation exists');
        assert.strictEqual(routerEvaluation?.start, timingInfo.requestTime + routerEvaluationTime / 1000);
        assert.strictEqual(routerEvaluation?.end, timingInfo.requestTime + cacheLookupStart / 1000);
        const cacheLookup = timeRanges.find(timeRange => timeRange.name === "serviceworker-cachelookup" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerCacheLookup */);
        assert.isTrue(Boolean(cacheLookup), 'worker cache lookup does not exist');
        assert.strictEqual(cacheLookup?.start, timingInfo.requestTime + cacheLookupStart / 1000);
        assert.strictEqual(cacheLookup?.end, timingInfo.requestTime + timingInfo.receiveHeadersStart / 1000);
    });
    it('RequestTimeRanges has router evaluation field with SW router source as cache miss', async () => {
        const request = createNetworkRequest("cache" /* Protocol.Network.ServiceWorkerRouterSource.Cache */, "network" /* Protocol.Network.ServiceWorkerRouterSource.Network */);
        const timingInfo = request.timing;
        const timeRanges = RequestTimingView.RequestTimingView.calculateRequestTimeRanges(request, 100);
        const routerEvaluationTime = timingInfo.workerRouterEvaluationStart;
        const cacheLookupStart = timingInfo.workerCacheLookupStart;
        const routerEvaluation = timeRanges.find(timeRange => timeRange.name === "serviceworker-routerevaluation" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerRouterEvaluation */);
        assert.isTrue(Boolean(routerEvaluation), 'worker router evaluation exists');
        assert.strictEqual(routerEvaluation?.start, timingInfo.requestTime + routerEvaluationTime / 1000);
        assert.strictEqual(routerEvaluation?.end, timingInfo.requestTime + cacheLookupStart / 1000);
        const cacheLookup = timeRanges.find(timeRange => timeRange.name === "serviceworker-cachelookup" /* RequestTimingView.RequestTimeRangeNames.ServiceWorkerCacheLookup */);
        assert.isTrue(Boolean(cacheLookup), 'worker cache lookup does not exist');
        assert.strictEqual(cacheLookup?.start, timingInfo.requestTime + cacheLookupStart / 1000);
        assert.strictEqual(cacheLookup?.end, timingInfo.requestTime + timingInfo.sendStart / 1000);
    });
});
//# sourceMappingURL=RequestTimingView.test.js.map