// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
export class TracingManager extends SDK.SDKModel.SDKModel {
    #tracingAgent;
    #activeClient;
    #eventBufferSize;
    #eventsRetrieved;
    #finishing;
    constructor(target) {
        super(target);
        this.#tracingAgent = target.tracingAgent();
        target.registerTracingDispatcher(new TracingDispatcher(this));
        this.#activeClient = null;
        this.#eventBufferSize = 0;
        this.#eventsRetrieved = 0;
    }
    bufferUsage(usage, eventCount, percentFull) {
        this.#eventBufferSize = eventCount === undefined ? null : eventCount;
        if (this.#activeClient) {
            this.#activeClient.tracingBufferUsage(usage || percentFull || 0);
        }
    }
    eventsCollected(events) {
        if (!this.#activeClient) {
            return;
        }
        this.#activeClient.traceEventsCollected(events);
        this.#eventsRetrieved += events.length;
        if (!this.#eventBufferSize) {
            this.#activeClient.eventsRetrievalProgress(0);
            return;
        }
        if (this.#eventsRetrieved > this.#eventBufferSize) {
            this.#eventsRetrieved = this.#eventBufferSize;
        }
        this.#activeClient.eventsRetrievalProgress(this.#eventsRetrieved / this.#eventBufferSize);
    }
    tracingComplete() {
        this.#eventBufferSize = 0;
        this.#eventsRetrieved = 0;
        if (this.#activeClient) {
            this.#activeClient.tracingComplete();
            this.#activeClient = null;
        }
        this.#finishing = false;
    }
    async reset() {
        // If we have an active client, we should try to stop
        // it before resetting it, else we will leave the
        // backend in a broken state where it thinks we are in
        // the middle of tracing, but we think we are not.
        // Then, any subsequent attempts to record will fail
        // because the backend will not let us start a second
        // tracing session.
        if (this.#activeClient) {
            await this.#tracingAgent.invoke_end();
        }
        this.#eventBufferSize = 0;
        this.#eventsRetrieved = 0;
        this.#activeClient = null;
        this.#finishing = false;
    }
    // TODO(petermarshall): Use the traceConfig argument instead of deprecated
    // categories + options.
    async start(client, categoryFilter, options) {
        if (this.#activeClient) {
            throw new Error('Tracing is already started');
        }
        const bufferUsageReportingIntervalMs = 500;
        this.#activeClient = client;
        const args = {
            bufferUsageReportingInterval: bufferUsageReportingIntervalMs,
            categories: categoryFilter,
            options: options,
            transferMode: "ReportEvents" /* Protocol.Tracing.StartRequestTransferMode.ReportEvents */,
        };
        const response = await this.#tracingAgent.invoke_start(args);
        if (response.getError()) {
            this.#activeClient = null;
        }
        return response;
    }
    stop() {
        if (!this.#activeClient) {
            throw new Error('Tracing is not started');
        }
        if (this.#finishing) {
            throw new Error('Tracing is already being stopped');
        }
        this.#finishing = true;
        void this.#tracingAgent.invoke_end();
    }
}
class TracingDispatcher {
    #tracingManager;
    constructor(tracingManager) {
        this.#tracingManager = tracingManager;
    }
    bufferUsage({ value, eventCount, percentFull }) {
        this.#tracingManager.bufferUsage(value, eventCount, percentFull);
    }
    dataCollected({ value }) {
        this.#tracingManager.eventsCollected(value);
    }
    tracingComplete() {
        this.#tracingManager.tracingComplete();
    }
}
SDK.SDKModel.SDKModel.register(TracingManager, { capabilities: 128 /* SDK.Target.Capability.Tracing */, autostart: false });
//# sourceMappingURL=TracingManager.js.map