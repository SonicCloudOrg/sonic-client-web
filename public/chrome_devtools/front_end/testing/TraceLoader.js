// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../models/trace/trace.js';
import * as ModificationsManager from '../services/modifications_manager/modifications_manager.js';
import * as TraceBounds from '../services/trace_bounds/trace_bounds.js';
// We maintain two caches:
// 1. The file contents JSON.parsed for a given trace file.
// 2. The trace engine models for a given file (used by the traceEngine function)
// Both the file contents and the model data are not expected to change during
// the lifetime of an instance of DevTools, so they are safe to cache and
// re-use across tests to avoid extra time spent loading and parsing the same
// inputs.
// In the future once the data layer migration is complete, we can hopefully
// simplify this into one method that loads the new engine and none of the old
// ones.
const fileContentsCache = new Map();
// The new engine cache is a map of maps of:
// trace file name => trace engine configuration => trace data
//
// The first map is a Map of string (which is the name of the trace file) to a
// new map, where the key is the trace engine configuration stringified.
// This ensures that we cache as much as we can, but if you load the same trace
// file with different trace engine configurations, we will not use the cache
// and will reparse. This is required as some of the settings and experiments
// change if events are kept and dropped.
const traceEngineCache = new Map();
/**
 * Loads trace files defined as fixtures in front_end/panels/timeline/fixtures/traces.
 *
 * Will automatically cache the results to save time processing the same trace
 * multiple times in a run of the test suite.
 **/
export class TraceLoader {
    /**
     * Parsing some trace files easily takes up more than our default Mocha timeout
     * which is 2seconds. So for most tests that include parsing a trace, we have to
     * increase the timeout. We use this function to ensure we set a consistent
     * timeout across all trace model tests.
     * The context might be null when we only render a component example.
     **/
    static setTestTimeout(context) {
        if (!context || context.timeout() >= 10_000) {
            return;
        }
        context?.timeout(10_000);
    }
    /**
     * Loads a trace file into memory and returns its contents after
     * JSON.parse-ing them
     *
     **/
    static async fixtureContents(context, name) {
        TraceLoader.setTestTimeout(context);
        const cached = fileContentsCache.get(name);
        if (cached) {
            return cached;
        }
        // Required URLs differ across the component server and the unit tests, so try both.
        const urlForTest = new URL(`../front_end/panels/timeline/fixtures/traces/${name}`, window.location.origin);
        const urlForComponentExample = new URL(`../front_end/panels/timeline/fixtures/traces/${name}`, window.location.origin);
        if (window.location.pathname.includes('ui/components/docs') ||
            window.location.pathname.includes('ui\\components\\docs')) {
            const contents = await loadTraceFileFromURL(urlForComponentExample);
            fileContentsCache.set(name, contents);
            return contents;
        }
        const contents = await loadTraceFileFromURL(urlForTest);
        fileContentsCache.set(name, contents);
        return contents;
    }
    /**
     * Load an array of raw events from the trace file.
     * Will default to typing those events using the types from TraceEngine, but
     * can be overriden by passing the legacy EventPayload type as the generic.
     **/
    static async rawEvents(context, name) {
        const contents = await TraceLoader.fixtureContents(context, name);
        const events = 'traceEvents' in contents ? contents.traceEvents : contents;
        TraceEngine.Helpers.SyntheticEvents.SyntheticEventsManager.initSyntheticEventsManagerForTrace(events);
        return events;
    }
    /**
     * Load an array of raw events from the trace file.
     * Will default to typing those events using the types from TraceEngine, but
     * can be overriden by passing the legacy EventPayload type as the generic.
     **/
    static async rawCPUProfile(context, name) {
        const contents = await TraceLoader.fixtureContents(context, name);
        return contents;
    }
    /**
     * Executes only the new trace engine on the fixture and returns the resulting parsed data.
     *
     * @param context The Mocha test context. |allModelsFromFile| function easily
     * takes up more than our default Mocha timeout, which is 2s. So we have to
     * increase this test's timeout. It might be null when we only render a
     * component example.
     *
     * @param file The name of the trace file to be loaded.
     * The trace file should be in ../panels/timeline/fixtures/traces folder.
     *
     * @param options Additional trace options.
     * @param options.initTraceBounds (defaults to `true`) after the trace is
     * loaded, the TraceBounds manager will automatically be initialised using
     * the bounds from the trace.
     *
     * @param config The config the new trace engine should run with. Optional,
     * will fall back to the Default config if not provided.
     */
    static async traceEngine(context, name, options = {
        initTraceBounds: true,
    }, config = TraceEngine.Types.Configuration.defaults()) {
        // Force the TraceBounds to be reset to empty. This ensures that in
        // tests where we are using the new engine data we don't accidentally
        // rely on the fact that a previous test has set the BoundsManager.
        TraceBounds.TraceBounds.BoundsManager.instance({ forceNew: true });
        const configCacheKey = TraceEngine.Types.Configuration.configToCacheKey(config);
        const fromCache = traceEngineCache.get(name)?.get(configCacheKey);
        if (fromCache) {
            ModificationsManager.ModificationsManager.ModificationsManager.initAndActivateModificationsManager(fromCache.model, 0);
            if (options.initTraceBounds) {
                TraceLoader.initTraceBoundsManager(fromCache.traceParsedData);
            }
            return fromCache.traceParsedData;
        }
        const fileContents = await TraceLoader.fixtureContents(context, name);
        const traceEngineData = await TraceLoader.executeTraceEngineOnFileContents(fileContents, /* emulate fresh recording */ false, config);
        const cacheByName = traceEngineCache.get(name) ||
            new Map();
        cacheByName.set(configCacheKey, traceEngineData);
        traceEngineCache.set(name, cacheByName);
        ModificationsManager.ModificationsManager.ModificationsManager.initAndActivateModificationsManager(traceEngineData.model, 0);
        if (options.initTraceBounds) {
            TraceLoader.initTraceBoundsManager(traceEngineData.traceParsedData);
        }
        return traceEngineData.traceParsedData;
    }
    /**
     * Initialise the BoundsManager with the bounds from a trace.
     * This isn't always required, but some of our code - particularly at the UI
     * level - rely on this being set. This is always set in the actual panel, but
     * parsing a trace in a test does not automatically set it.
     **/
    static initTraceBoundsManager(data) {
        TraceBounds.TraceBounds.BoundsManager
            .instance({
            forceNew: true,
        })
            .resetWithNewBounds(data.Meta.traceBounds);
    }
    static async executeTraceEngineOnFileContents(contents, emulateFreshRecording = false, traceEngineConfig) {
        const events = 'traceEvents' in contents ? contents.traceEvents : contents;
        const metadata = 'metadata' in contents ? contents.metadata : {};
        return new Promise((resolve, reject) => {
            const model = TraceEngine.TraceModel.Model.createWithAllHandlers(traceEngineConfig);
            model.addEventListener(TraceEngine.TraceModel.ModelUpdateEvent.eventName, (event) => {
                const { data } = event;
                // When we receive the final update from the model, update the recording
                // state back to waiting.
                if (TraceEngine.TraceModel.isModelUpdateDataComplete(data)) {
                    const metadata = model.metadata(0);
                    const traceParsedData = model.traceParsedData(0);
                    if (metadata && traceParsedData) {
                        resolve({
                            model,
                            metadata,
                            traceParsedData,
                        });
                    }
                    else {
                        reject(new Error('Unable to load trace'));
                    }
                }
            });
            void model.parse(events, { metadata, isFreshRecording: emulateFreshRecording }).catch(e => console.error(e));
        });
    }
}
// Below this point are private methods used in the TraceLoader class. These
// are purposefully not exported, you should use one of the static methods
// defined above.
async function loadTraceFileFromURL(url) {
    const response = await fetch(url);
    if (response.status !== 200) {
        throw new Error(`Unable to load ${url}`);
    }
    const contentType = response.headers.get('content-type');
    const isGzipEncoded = contentType !== null && contentType.includes('gzip');
    let buffer = await response.arrayBuffer();
    if (isGzipEncoded) {
        buffer = await decodeGzipBuffer(buffer);
    }
    const decoder = new TextDecoder('utf-8');
    const contents = JSON.parse(decoder.decode(buffer));
    return contents;
}
function codec(buffer, codecStream) {
    const { readable, writable } = new TransformStream();
    const codecReadable = readable.pipeThrough(codecStream);
    const writer = writable.getWriter();
    void writer.write(buffer);
    void writer.close();
    // Wrap in a response for convenience.
    const response = new Response(codecReadable);
    return response.arrayBuffer();
}
function decodeGzipBuffer(buffer) {
    return codec(buffer, new DecompressionStream('gzip'));
}
//# sourceMappingURL=TraceLoader.js.map