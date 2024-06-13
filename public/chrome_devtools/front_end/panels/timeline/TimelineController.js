// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as TraceEngine from '../../models/trace/trace.js';
const UIStrings = {
    /**
     *@description Text in Timeline Controller of the Performance panel indicating that the Performance Panel cannot
     * record a performance trace because the type of target (where possible types are page, service worker and shared
     * worker) doesn't support it.
     */
    tracingNotSupported: 'Performance trace recording not supported for this type of target',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineController {
    primaryPageTarget;
    rootTarget;
    tracingManager;
    #collectedEvents = [];
    #recordingStartTime = null;
    client;
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tracingCompleteCallback;
    /**
     * We always need to profile against the DevTools root target, which is
     * the target that DevTools is attached to.
     *
     * In most cases, this will be the tab that DevTools is inspecting.
     * Now pre-rendering is active, tabs can have multiple pages - only one
     * of which the user is being shown. This is the "primary page" and hence
     * why in code we have "primaryPageTarget". When there's a prerendered
     * page in a background, tab target would have multiple subtargets, one
     * of them being primaryPageTarget.
     *
     * The problems with using primary page target for tracing are:
     * 1. Performance trace doesn't include information from the other pages on
     *    the tab which is probably not what the user wants as it does not
     *    reflect reality.
     * 2. Capturing trace never finishes after prerendering activation as
     *    we've started on one target and ending on another one, and
     *    tracingComplete event never gets processed.
     *
     * However, when we want to look at the URL of the current page, we need
     * to use the primaryPageTarget to ensure we get the URL of the tab and
     * the tab's page that is being shown to the user. This is because the tab
     * target (which is what rootTarget is) only exposes the Target and Tracing
     * domains. We need the Page target to navigate as it implements the Page
     * domain. That is why here we have to store both.
     **/
    constructor(rootTarget, primaryPageTarget, client) {
        this.primaryPageTarget = primaryPageTarget;
        this.rootTarget = rootTarget;
        // Ensure the tracing manager is the one for the Root Target, NOT the
        // primaryPageTarget, as that is the one we have to invoke tracing against.
        this.tracingManager = rootTarget.model(TraceEngine.TracingManager.TracingManager);
        this.client = client;
    }
    async dispose() {
        if (this.tracingManager) {
            await this.tracingManager.reset();
        }
    }
    async startRecording(options) {
        function disabledByDefault(category) {
            return 'disabled-by-default-' + category;
        }
        // The following categories are also used in other tools, but this panel
        // offers the possibility of turning them off (see below).
        // 'disabled-by-default-devtools.screenshot'
        //   └ default: on, option: captureFilmStrip
        // 'disabled-by-default-devtools.timeline.invalidationTracking'
        //   └ default: off, experiment: timelineInvalidationTracking
        // 'disabled-by-default-v8.cpu_profiler'
        //   └ default: on, option: enableJSSampling
        const categoriesArray = [
            Root.Runtime.experiments.isEnabled('timeline-show-all-events') ? '*' : '-*',
            TraceEngine.Types.TraceEvents.Categories.Console,
            TraceEngine.Types.TraceEvents.Categories.Loading,
            TraceEngine.Types.TraceEvents.Categories.UserTiming,
            'devtools.timeline',
            disabledByDefault('devtools.timeline'),
            disabledByDefault('devtools.timeline.frame'),
            disabledByDefault('devtools.timeline.stack'),
            disabledByDefault('v8.compile'),
            disabledByDefault('v8.cpu_profiler.hires'),
            disabledByDefault('lighthouse'),
            'v8.execute',
            'v8',
            'cppgc',
            'navigation,rail',
        ];
        if (Root.Runtime.experiments.isEnabled('timeline-v8-runtime-call-stats') && options.enableJSSampling) {
            categoriesArray.push(disabledByDefault('v8.runtime_stats_sampling'));
        }
        if (options.enableJSSampling) {
            categoriesArray.push(disabledByDefault('v8.cpu_profiler'));
        }
        if (Root.Runtime.experiments.isEnabled('timeline-invalidation-tracking')) {
            categoriesArray.push(disabledByDefault('devtools.timeline.invalidationTracking'));
        }
        if (options.capturePictures) {
            categoriesArray.push(disabledByDefault('devtools.timeline.layers'), disabledByDefault('devtools.timeline.picture'), disabledByDefault('blink.graphics_context_annotations'));
        }
        if (options.captureFilmStrip) {
            categoriesArray.push(disabledByDefault('devtools.screenshot'));
        }
        if (options.captureSelectorStats) {
            categoriesArray.push(disabledByDefault('blink.debug'));
        }
        if (Root.Runtime.experiments.isEnabled('timeline-enhanced-traces')) {
            categoriesArray.push(disabledByDefault('devtools.target-rundown'));
            categoriesArray.push(disabledByDefault('devtools.v8-source-rundown'));
        }
        if (Root.Runtime.experiments.isEnabled('timeline-compiled-sources')) {
            categoriesArray.push(disabledByDefault('devtools.v8-source-rundown-sources'));
        }
        this.#recordingStartTime = Date.now();
        const response = await this.startRecordingWithCategories(categoriesArray.join(','));
        if (response.getError()) {
            await this.waitForTracingToStop(false);
            await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
        }
        return response;
    }
    async stopRecording() {
        if (this.tracingManager) {
            this.tracingManager.stop();
        }
        this.client.loadingStarted();
        await this.waitForTracingToStop(true);
        await this.allSourcesFinished();
    }
    async waitForTracingToStop(awaitTracingCompleteCallback) {
        const tracingStoppedPromises = [];
        if (this.tracingManager && awaitTracingCompleteCallback) {
            tracingStoppedPromises.push(new Promise(resolve => {
                this.tracingCompleteCallback = resolve;
            }));
        }
        await Promise.all(tracingStoppedPromises);
    }
    async startRecordingWithCategories(categories) {
        if (!this.tracingManager) {
            throw new Error(i18nString(UIStrings.tracingNotSupported));
        }
        // There might be a significant delay in the beginning of timeline recording
        // caused by starting CPU profiler, that needs to traverse JS heap to collect
        // all the functions data.
        await SDK.TargetManager.TargetManager.instance().suspendAllTargets('performance-timeline');
        const response = await this.tracingManager.start(this, categories, '');
        await this.warmupJsProfiler();
        Extensions.ExtensionServer.ExtensionServer.instance().profilingStarted();
        return response;
    }
    // CPUProfiler::StartProfiling has a non-trivial cost and we'd prefer it not happen within an
    // interaction as that complicates debugging interaction latency.
    // To trigger the StartProfiling interrupt and get the warmup cost out of the way, we send a
    // very soft invocation to V8.https://crbug.com/1358602
    async warmupJsProfiler() {
        // primaryPageTarget has RuntimeModel whereas rootTarget (Tab) does not.
        const runtimeModel = this.primaryPageTarget.model(SDK.RuntimeModel.RuntimeModel);
        if (!runtimeModel) {
            return;
        }
        await runtimeModel.checkSideEffectSupport();
    }
    traceEventsCollected(events) {
        this.#collectedEvents.push(...events);
    }
    tracingComplete() {
        if (!this.tracingCompleteCallback) {
            return;
        }
        this.tracingCompleteCallback(undefined);
        this.tracingCompleteCallback = null;
    }
    async allSourcesFinished() {
        this.client.processingStarted();
        await this.finalizeTrace();
    }
    async finalizeTrace() {
        await SDK.TargetManager.TargetManager.instance().resumeAllTargets();
        Extensions.ExtensionServer.ExtensionServer.instance().profilingStopped();
        await this.client.loadingComplete(this.#collectedEvents, /* exclusiveFilter= */ null, /* isCpuProfile= */ false, this.#recordingStartTime, 
        /* metadata= */ null);
        this.client.loadingCompleteForTest();
    }
    tracingBufferUsage(usage) {
        this.client.recordingProgress(usage);
    }
    eventsRetrievalProgress(progress) {
        this.client.loadingProgress(progress);
    }
}
//# sourceMappingURL=TimelineController.js.map