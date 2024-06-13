// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
const UIStrings = {
    /**
     *@description Text in Timeline Loader of the Performance panel
     *@example {Unknown JSON format} PH1
     */
    malformedTimelineDataS: 'Malformed timeline data: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineLoader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
/**
 * This class handles loading traces from file and URL, and from the Lighthouse panel
 * It also handles loading cpuprofiles from file, url and console.profileEnd()
 *
 * Meanwhile, the normal trace recording flow bypasses TimelineLoader entirely,
 * as it's handled from TracingManager => TimelineController.
 */
export class TimelineLoader {
    client;
    canceledCallback;
    buffer;
    firstRawChunk;
    totalSize;
    filter;
    #traceIsCPUProfile;
    #collectedEvents = [];
    #metadata;
    #traceFinalizedCallbackForTest;
    #traceFinalizedPromiseForTest;
    constructor(client) {
        this.client = client;
        this.canceledCallback = null;
        this.buffer = '';
        this.firstRawChunk = true;
        this.filter = null;
        this.#traceIsCPUProfile = false;
        this.#metadata = null;
        this.#traceFinalizedPromiseForTest = new Promise(resolve => {
            this.#traceFinalizedCallbackForTest = resolve;
        });
    }
    static async loadFromFile(file, client) {
        const loader = new TimelineLoader(client);
        const fileReader = new Bindings.FileUtils.ChunkedFileReader(file);
        loader.canceledCallback = fileReader.cancel.bind(fileReader);
        loader.totalSize = file.size;
        // We'll resolve and return the loader instance before finalizing the trace.
        setTimeout(async () => {
            const success = await fileReader.read(loader);
            if (!success && fileReader.error()) {
                // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                loader.reportErrorAndCancelLoading(fileReader.error().message);
            }
        });
        return loader;
    }
    static loadFromEvents(events, client) {
        const loader = new TimelineLoader(client);
        window.setTimeout(async () => {
            void loader.addEvents(events);
        });
        return loader;
    }
    static loadFromCpuProfile(profile, client) {
        const loader = new TimelineLoader(client);
        loader.#traceIsCPUProfile = true;
        try {
            const events = TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.createFakeTraceFromCpuProfile(profile, TraceEngine.Types.TraceEvents.ThreadID(1));
            window.setTimeout(async () => {
                void loader.addEvents(events);
            });
        }
        catch (e) {
            console.error(e.stack);
        }
        return loader;
    }
    static async loadFromURL(url, client) {
        const loader = new TimelineLoader(client);
        const stream = new Common.StringOutputStream.StringOutputStream();
        await client.loadingStarted();
        const allowRemoteFilePaths = Common.Settings.Settings.instance().moduleSetting('network.enable-remote-file-loading').get();
        Host.ResourceLoader.loadAsStream(url, null, stream, finishedCallback, allowRemoteFilePaths);
        async function finishedCallback(success, _headers, errorDescription) {
            if (!success) {
                return loader.reportErrorAndCancelLoading(errorDescription.message);
            }
            const txt = stream.data();
            const trace = JSON.parse(txt);
            loader.#processParsedFile(trace);
            await loader.close();
        }
        return loader;
    }
    #processParsedFile(trace) {
        if ('traceEvents' in trace || Array.isArray(trace)) {
            // We know that this is NOT a raw CPU Profile because it has traceEvents
            // (either at the top level, or nested under the traceEvents key)
            const items = Array.isArray(trace) ? trace : trace.traceEvents;
            this.#collectEvents(items);
        }
        else if (trace.nodes) {
            // We know it's a raw Protocol CPU Profile.
            this.#parseCPUProfileFormatFromFile(trace);
            this.#traceIsCPUProfile = true;
        }
        else {
            this.reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineDataS));
            return;
        }
        if ('metadata' in trace) {
            this.#metadata = trace.metadata;
        }
    }
    async addEvents(events) {
        await this.client?.loadingStarted();
        /**
         * See the `eventsPerChunk` comment in `models/trace/types/Configuration.ts`.
         *
         * This value is different though. Why? `The addEvents()` work below is different
         * (and much faster!) than running `handleEvent()` on all handlers.
         */
        const eventsPerChunk = 150_000;
        for (let i = 0; i < events.length; i += eventsPerChunk) {
            const chunk = events.slice(i, i + eventsPerChunk);
            this.#collectEvents(chunk);
            await this.client?.loadingProgress((i + chunk.length) / events.length);
            await new Promise(r => window.setTimeout(r, 0)); // Yield event loop to paint.
        }
        void this.close();
    }
    async cancel() {
        if (this.client) {
            await this.client.loadingComplete(
            /* collectedEvents */ [], /* exclusiveFilter= */ null, /* isCpuProfile= */ false, 
            /* recordingStartTime= */ null, /* metadata= */ null);
            this.client = null;
        }
        if (this.canceledCallback) {
            this.canceledCallback();
        }
    }
    /**
     * As TimelineLoader implements `Common.StringOutputStream.OutputStream`, `write()` is called when a
     * Common.StringOutputStream.StringOutputStream instance has decoded a chunk. This path is only used
     * by `loadFromFile()`; it's NOT used by `loadFromEvents` or `loadFromURL`.
     */
    async write(chunk, endOfFile) {
        if (!this.client) {
            return Promise.resolve();
        }
        this.buffer += chunk;
        if (this.firstRawChunk) {
            await this.client.loadingStarted();
            // Ensure we paint the loading dialog before continuing
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            this.firstRawChunk = false;
        }
        else {
            let progress = undefined;
            progress = this.buffer.length / this.totalSize;
            // For compressed traces, we can't provide a definite progress percentage. So, just keep it moving.
            // For other traces, calculate a loaded part.
            progress = progress > 1 ? progress - Math.floor(progress) : progress;
            await this.client.loadingProgress(progress);
        }
        if (endOfFile) {
            let trace;
            try {
                trace = JSON.parse(this.buffer);
                this.#processParsedFile(trace);
                return Promise.resolve();
            }
            catch (e) {
                this.reportErrorAndCancelLoading(i18nString(UIStrings.malformedTimelineDataS, { PH1: e.toString() }));
                return;
            }
        }
    }
    reportErrorAndCancelLoading(message) {
        if (message) {
            Common.Console.Console.instance().error(message);
        }
        void this.cancel();
    }
    async close() {
        if (!this.client) {
            return;
        }
        await this.client.processingStarted();
        await this.finalizeTrace();
    }
    isCpuProfile() {
        return this.#traceIsCPUProfile;
    }
    async finalizeTrace() {
        await this.client
            .loadingComplete(this.#collectedEvents, this.filter, this.isCpuProfile(), /* recordingStartTime=*/ null, this.#metadata);
        this.#traceFinalizedCallbackForTest?.();
    }
    traceFinalizedForTest() {
        return this.#traceFinalizedPromiseForTest;
    }
    #parseCPUProfileFormatFromFile(parsedTrace) {
        const traceEvents = TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.createFakeTraceFromCpuProfile(parsedTrace, TraceEngine.Types.TraceEvents.ThreadID(1));
        this.#collectEvents(traceEvents);
    }
    #collectEvents(events) {
        this.#collectedEvents = this.#collectedEvents.concat(events);
    }
}
//# sourceMappingURL=TimelineLoader.js.map