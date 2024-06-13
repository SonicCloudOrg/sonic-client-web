// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
const UIStrings = {
    /**
     *@description Category in the Summary view of the Performance panel to indicate time spent to load resources
     */
    loading: 'Loading',
    /**
     *@description Text in Timeline for the Experience title
     */
    experience: 'Experience',
    /**
     *@description Category in the Summary view of the Performance panel to indicate time spent in script execution
     */
    scripting: 'Scripting',
    /**
     *@description Category in the Summary view of the Performance panel to indicate time spent in rendering the web page
     */
    rendering: 'Rendering',
    /**
     *@description Category in the Summary view of the Performance panel to indicate time spent to visually represent the web page
     */
    painting: 'Painting',
    /**
     *@description Event category in the Performance panel for time spent in the GPU
     */
    gpu: 'GPU',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    async: 'Async',
    /**
     *@description Category in the Summary view of the Performance panel to indicate time spent in the rest of the system
     */
    system: 'System',
    /**
     *@description Category in the Summary view of the Performance panel to indicate idle time
     */
    idle: 'Idle',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    task: 'Task',
    /**
     *@description Text for other types of items
     */
    other: 'Other',
    /**
     *@description Text that refers to the animation of the web page
     */
    animation: 'Animation',
    /**
     *@description Text that refers to some events
     */
    event: 'Event',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    requestMainThreadFrame: 'Request Main Thread Frame',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    frameStart: 'Frame Start',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    onMessage: 'On Message',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    schedulePostMessage: 'Schedule postMessage',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    messaging: 'Messaging',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    frameStartMainThread: 'Frame Start (main thread)',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    drawFrame: 'Draw Frame',
    /**
     *@description Noun for an event in the Performance panel. This marks time
      spent in an operation that only happens when the profiler is active.
     */
    profilingOverhead: 'Profiling Overhead',
    /**
     *@description The process the browser uses to determine a target element for a
     *pointer event. Typically, this is determined by considering the pointer's
     *location and also the visual layout of elements on the screen.
     */
    hitTest: 'Hit Test',
    /**
     *@description Noun for an event in the Performance panel. The browser has decided
     *that the styles for some elements need to be recalculated and scheduled that
     *recalculation process at some time in the future.
     */
    scheduleStyleRecalculation: 'Schedule Style Recalculation',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    recalculateStyle: 'Recalculate Style',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    invalidateLayout: 'Invalidate Layout',
    /**
     *@description Noun for an event in the Performance panel. Layerize is a step
     *where we calculate which layers to create.
     */
    layerize: 'Layerize',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    layout: 'Layout',
    /**
     *@description Noun for an event in the Performance panel. Paint setup is a
     *step before the 'Paint' event. A paint event is when the browser draws pixels
     *to the screen. This step is the setup beforehand.
     */
    paintSetup: 'Paint Setup',
    /**
     *@description Noun for a paint event in the Performance panel, where an image
     *was being painted. A paint event is when the browser draws pixels to the
     *screen, in this case specifically for an image in a website.
     */
    paintImage: 'Paint Image',
    /**
     *@description Noun for an event in the Performance panel. Pre-paint is a
     *step before the 'Paint' event. A paint event is when the browser records the
     *instructions for drawing the page. This step is the setup beforehand.
     */
    prePaint: 'Pre-Paint',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    updateLayer: 'Update Layer',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    updateLayerTree: 'Update Layer Tree',
    /**
     *@description Noun for a paint event in the Performance panel. A paint event is when the browser draws pixels to the screen.
     */
    paint: 'Paint',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    rasterizePaint: 'Rasterize Paint',
    /**
     *@description The action to scroll
     */
    scroll: 'Scroll',
    /**
     *@description Noun for an event in the Performance panel. Commit is a step
     *where we send (also known as "commit") layers to the compositor thread. This
     *step follows the "Layerize" step which is what calculates which layers to
     *create.
     */
    commit: 'Commit',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    compositeLayers: 'Composite Layers',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    computeIntersections: 'Compute Intersections',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    parseHtml: 'Parse HTML',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    parseStylesheet: 'Parse Stylesheet',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    installTimer: 'Install Timer',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    removeTimer: 'Remove Timer',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    timerFired: 'Timer Fired',
    /**
     *@description Text for an event. Shown in the timeline in the Performance panel.
     * XHR refers to XmlHttpRequest, a Web API. This particular Web API has a property
     * named 'readyState' (https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/readyState). When
     * the 'readyState' property changes the text is shown.
     */
    xhrReadyStateChange: '`XHR` Ready State Change',
    /**
     * @description Text for an event. Shown in the timeline in the Perforamnce panel.
     * XHR refers to XmlHttpRequest, a Web API. (see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
     * The text is shown when a XmlHttpRequest load event happens on the inspected page.
     */
    xhrLoad: '`XHR` Load',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    compileScript: 'Compile Script',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    cacheScript: 'Cache Script Code',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    compileCode: 'Compile Code',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    optimizeCode: 'Optimize Code',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    evaluateScript: 'Evaluate Script',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    compileModule: 'Compile Module',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    cacheModule: 'Cache Module Code',
    /**
     * @description Text for an event. Shown in the timeline in the Perforamnce panel.
     * "Module" refers to JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
     * JavaScript modules are a way to organize JavaScript code.
     * "Evaluate" is the phase when the JavaScript code of a module is executed.
     */
    evaluateModule: 'Evaluate Module',
    /**
     *@description Noun indicating that a compile task (type: streaming) happened.
     */
    streamingCompileTask: 'Streaming Compile Task',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    waitingForNetwork: 'Waiting for Network',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    parseAndCompile: 'Parse and Compile',
    /**
     * @description Text in Timeline UIUtils of the Performance panel.
     * "Code Cache" refers to JavaScript bytecode cache: https://v8.dev/blog/code-caching-for-devs
     * "Deserialize" refers to the process of reading the code cache.
     */
    deserializeCodeCache: 'Deserialize Code Cache',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    streamingWasmResponse: 'Streaming Wasm Response',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    compiledWasmModule: 'Compiled Wasm Module',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    cachedWasmModule: 'Cached Wasm Module',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    wasmModuleCacheHit: 'Wasm Module Cache Hit',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    wasmModuleCacheInvalid: 'Wasm Module Cache Invalid',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    frameStartedLoading: 'Frame Started Loading',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    onloadEvent: 'Onload Event',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    domcontentloadedEvent: 'DOMContentLoaded Event',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    firstPaint: 'First Paint',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    firstContentfulPaint: 'First Contentful Paint',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    largestContentfulPaint: 'Largest Contentful Paint',
    /**
     *@description Text for timestamps of items
     */
    timestamp: 'Timestamp',
    /**
     *@description Noun for a 'time' event that happens in the Console (a tool in
     * DevTools). The user can trigger console time events from their code, and
     * they will show up in the Performance panel. Time events are used to measure
     * the duration of something, e.g. the user will emit two time events at the
     * start and end of some interesting task.
     */
    consoleTime: 'Console Time',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    userTiming: 'User Timing',
    /**
     * @description Name for an event shown in the Performance panel. When a network
     * request is about to be sent by the browser, the time is recorded and DevTools
     * is notified that a network request will be sent momentarily.
     */
    willSendRequest: 'Will Send Request',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    sendRequest: 'Send Request',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    receiveResponse: 'Receive Response',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    finishLoading: 'Finish Loading',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    receiveData: 'Receive Data',
    /**
     *@description Event category in the Performance panel for time spent to execute microtasks in JavaScript
     */
    runMicrotasks: 'Run Microtasks',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    functionCall: 'Function Call',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    gcEvent: 'GC Event',
    /**
     *@description Event category in the Performance panel for time spent to perform a full Garbage Collection pass
     */
    majorGc: 'Major GC',
    /**
     *@description Event category in the Performance panel for time spent to perform a quick Garbage Collection pass
     */
    minorGc: 'Minor GC',
    /**
     *@description Text for the request animation frame event
     */
    requestAnimationFrame: 'Request Animation Frame',
    /**
     *@description Text to cancel the animation frame
     */
    cancelAnimationFrame: 'Cancel Animation Frame',
    /**
     *@description Text for the event that an animation frame is fired
     */
    animationFrameFired: 'Animation Frame Fired',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    requestIdleCallback: 'Request Idle Callback',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    cancelIdleCallback: 'Cancel Idle Callback',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    fireIdleCallback: 'Fire Idle Callback',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    createWebsocket: 'Create WebSocket',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    sendWebsocketHandshake: 'Send WebSocket Handshake',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    receiveWebsocketHandshake: 'Receive WebSocket Handshake',
    /**
     *@description Text in Timeline Flame Chart Data Provider of the Performance panel
     */
    wsMessageReceived: 'Receive WebSocket Message',
    /**
     *@description Text in Timeline Flame Chart Data Provider of the Performance panel
     */
    wsMessageSent: 'Send WebSocket Message',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    destroyWebsocket: 'Destroy WebSocket',
    /**
     *@description Event category in the Performance panel for time spent in the embedder of the WebView
     */
    embedderCallback: 'Embedder Callback',
    /**
     *@description Event category in the Performance panel for time spent decoding an image
     */
    imageDecode: 'Image Decode',
    /**
     *@description Event category in the Performance panel for time spent to perform Garbage Collection for the Document Object Model
     */
    domGc: 'DOM GC',
    /**
     *@description Event category in the Performance panel for time spent to perform Garbage Collection for C++: https://chromium.googlesource.com/v8/v8/+/main/include/cppgc/README.md
     */
    cppGc: 'CPP GC',
    /**
     *@description Event category in the Performance panel for time spent to perform encryption
     */
    encrypt: 'Encrypt',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    encryptReply: 'Encrypt Reply',
    /**
     *@description Event category in the Performance panel for time spent to perform decryption
     */
    decrypt: 'Decrypt',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    decryptReply: 'Decrypt Reply',
    /**
     * @description Noun phrase meaning 'the browser was preparing the digest'.
     * Digest: https://developer.mozilla.org/en-US/docs/Glossary/Digest
     */
    digest: 'Digest',
    /**
     *@description Noun phrase meaning 'the browser was preparing the digest
     *reply'. Digest: https://developer.mozilla.org/en-US/docs/Glossary/Digest
     */
    digestReply: 'Digest Reply',
    /**
     *@description The 'sign' stage of a web crypto event. Shown when displaying what the website was doing at a particular point in time.
     */
    sign: 'Sign',
    /**
     * @description Noun phrase for an event of the Web Crypto API. The event is recorded when the signing process is concluded.
     * Signature: https://developer.mozilla.org/en-US/docs/Glossary/Signature/Security
     */
    signReply: 'Sign Reply',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    verify: 'Verify',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    verifyReply: 'Verify Reply',
    /**
     *@description Text in Timeline UIUtils of the Performance panel
     */
    asyncTask: 'Async Task',
    /**
     *@description Text in Timeline for Layout Shift records
     */
    layoutShift: 'Layout Shift',
    /**
     *@description Text in Timeline for an Event Timing record
     */
    eventTiming: 'Event Timing',
    /**
     *@description Event category in the Performance panel for JavaScript nodes in CPUProfile
     */
    jsFrame: 'JS Frame',
    /**
     *@description Text in UIDevtools Utils of the Performance panel
     */
    rasterizing: 'Rasterizing',
    /**
     *@description Text in UIDevtools Utils of the Performance panel
     */
    drawing: 'Drawing',
};
export var EventCategory;
(function (EventCategory) {
    EventCategory["DRAWING"] = "drawing";
    EventCategory["RASTERIZING"] = "rasterizing";
    EventCategory["LAYOUT"] = "layout";
    EventCategory["LOADING"] = "loading";
    EventCategory["EXPERIENCE"] = "experience";
    EventCategory["SCRIPTING"] = "scripting";
    EventCategory["MESSAGING"] = "messaging";
    EventCategory["RENDERING"] = "rendering";
    EventCategory["PAINTING"] = "painting";
    EventCategory["GPU"] = "gpu";
    EventCategory["ASYNC"] = "async";
    EventCategory["OTHER"] = "other";
    EventCategory["IDLE"] = "idle";
})(EventCategory || (EventCategory = {}));
let mainEventCategories;
const str_ = i18n.i18n.registerUIStrings('panels/timeline/EventUICategory.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineRecordStyle {
    title;
    category;
    hidden;
    constructor(title, category, hidden = false) {
        this.title = title;
        this.category = category;
        this.hidden = hidden;
    }
}
export class TimelineCategory {
    name;
    title;
    visible;
    childColor;
    colorInternal;
    hiddenInternal;
    constructor(name, title, visible, childColor, color) {
        this.name = name;
        this.title = title;
        this.visible = visible;
        this.childColor = childColor;
        this.colorInternal = color;
        this.hidden = false;
    }
    get hidden() {
        return Boolean(this.hiddenInternal);
    }
    get color() {
        return this.getComputedColorValue();
    }
    getCSSValue() {
        return `var(${this.colorInternal})`;
    }
    getComputedColorValue() {
        return ThemeSupport.ThemeSupport.instance().getComputedValue(this.colorInternal);
    }
    set hidden(hidden) {
        this.hiddenInternal = hidden;
    }
}
/**
 * This object defines the styles for the categories used in the
 * timeline (loading, rendering, scripting, etc.).
 */
let categoryStyles;
/**
 * This map defines the styles for events shown in the panel. This
 * includes its color (which on the event's category, the label it's
 * displayed with and flag to know wether it's visible in the flamechart
 * or not).
 * The thread appenders use this map to determine if an event should be
 * shown in the flame chart. If an event is not in the map, then it
 * won't be shown, but it also won't be shown if it's marked as "hidden"
 * in its styles.
 *
 * The map is also used in other places, like the event's details view.
 */
let eventStylesMap;
export function getEventStyle(eventName) {
    return maybeInitSylesMap()[eventName];
}
export function stringIsEventCategory(it) {
    return Object.values(EventCategory).includes(it);
}
export function getCategoryStyles() {
    if (categoryStyles) {
        return categoryStyles;
    }
    categoryStyles = {
        loading: new TimelineCategory(EventCategory.LOADING, i18nString(UIStrings.loading), true, '--app-color-loading-children', '--app-color-loading'),
        experience: new TimelineCategory(EventCategory.EXPERIENCE, i18nString(UIStrings.experience), false, '--app-color-rendering-children', '--app-color-rendering'),
        messaging: new TimelineCategory(EventCategory.MESSAGING, i18nString(UIStrings.messaging), true, '--app-color-messaging-children', '--app-color-messaging'),
        scripting: new TimelineCategory(EventCategory.SCRIPTING, i18nString(UIStrings.scripting), true, '--app-color-scripting-children', '--app-color-scripting'),
        rendering: new TimelineCategory(EventCategory.RENDERING, i18nString(UIStrings.rendering), true, '--app-color-rendering-children', '--app-color-rendering'),
        painting: new TimelineCategory(EventCategory.PAINTING, i18nString(UIStrings.painting), true, '--app-color-painting-children', '--app-color-painting'),
        gpu: new TimelineCategory(EventCategory.GPU, i18nString(UIStrings.gpu), false, '--app-color-painting-children', '--app-color-painting'),
        async: new TimelineCategory(EventCategory.ASYNC, i18nString(UIStrings.async), false, '--app-color-async-children', '--app-color-async'),
        other: new TimelineCategory(EventCategory.OTHER, i18nString(UIStrings.system), false, '--app-color-system-children', '--app-color-system'),
        idle: new TimelineCategory(EventCategory.IDLE, i18nString(UIStrings.idle), false, '--app-color-idle-children', '--app-color-idle'),
        layout: new TimelineCategory(EventCategory.LAYOUT, i18nString(UIStrings.layout), false, '--app-color-loading-children', '--app-color-loading'),
        rasterizing: new TimelineCategory(EventCategory.RASTERIZING, i18nString(UIStrings.rasterizing), false, '--app-color-children', '--app-color-scripting'),
        drawing: new TimelineCategory(EventCategory.DRAWING, i18nString(UIStrings.drawing), false, '--app-color-rendering-children', '--app-color-rendering'),
    };
    return categoryStyles;
}
export function maybeInitSylesMap() {
    if (eventStylesMap) {
        return eventStylesMap;
    }
    const defaultCategoryStyles = getCategoryStyles();
    eventStylesMap = {
        ["RunTask" /* TraceEngine.Types.TraceEvents.KnownEventName.RunTask */]: new TimelineRecordStyle(i18nString(UIStrings.task), defaultCategoryStyles.other),
        ["ProfileCall" /* TraceEngine.Types.TraceEvents.KnownEventName.ProfileCall */]: new TimelineRecordStyle(i18nString(UIStrings.jsFrame), defaultCategoryStyles.scripting),
        ["JSSample" /* TraceEngine.Types.TraceEvents.KnownEventName.JSSample */]: new TimelineRecordStyle("JSSample" /* TraceEngine.Types.TraceEvents.KnownEventName.JSSample */, defaultCategoryStyles.scripting),
        ["Program" /* TraceEngine.Types.TraceEvents.KnownEventName.Program */]: new TimelineRecordStyle(i18nString(UIStrings.other), defaultCategoryStyles.other),
        ["CpuProfiler::StartProfiling" /* TraceEngine.Types.TraceEvents.KnownEventName.StartProfiling */]: new TimelineRecordStyle(i18nString(UIStrings.profilingOverhead), defaultCategoryStyles.other),
        ["Animation" /* TraceEngine.Types.TraceEvents.KnownEventName.Animation */]: new TimelineRecordStyle(i18nString(UIStrings.animation), defaultCategoryStyles.rendering),
        ["EventDispatch" /* TraceEngine.Types.TraceEvents.KnownEventName.EventDispatch */]: new TimelineRecordStyle(i18nString(UIStrings.event), defaultCategoryStyles.scripting),
        ["RequestMainThreadFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.RequestMainThreadFrame */]: new TimelineRecordStyle(i18nString(UIStrings.requestMainThreadFrame), defaultCategoryStyles.rendering, true),
        ["BeginFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.BeginFrame */]: new TimelineRecordStyle(i18nString(UIStrings.frameStart), defaultCategoryStyles.rendering, true),
        ["BeginMainThreadFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.BeginMainThreadFrame */]: new TimelineRecordStyle(i18nString(UIStrings.frameStartMainThread), defaultCategoryStyles.rendering, true),
        ["DrawFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.DrawFrame */]: new TimelineRecordStyle(i18nString(UIStrings.drawFrame), defaultCategoryStyles.rendering, true),
        ["HitTest" /* TraceEngine.Types.TraceEvents.KnownEventName.HitTest */]: new TimelineRecordStyle(i18nString(UIStrings.hitTest), defaultCategoryStyles.rendering),
        ["ScheduleStyleRecalculation" /* TraceEngine.Types.TraceEvents.KnownEventName.ScheduleStyleRecalculation */]: new TimelineRecordStyle(i18nString(UIStrings.scheduleStyleRecalculation), defaultCategoryStyles.rendering),
        ["UpdateLayoutTree" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayoutTree */]: new TimelineRecordStyle(i18nString(UIStrings.recalculateStyle), defaultCategoryStyles.rendering),
        ["InvalidateLayout" /* TraceEngine.Types.TraceEvents.KnownEventName.InvalidateLayout */]: new TimelineRecordStyle(i18nString(UIStrings.invalidateLayout), defaultCategoryStyles.rendering, true),
        ["Layerize" /* TraceEngine.Types.TraceEvents.KnownEventName.Layerize */]: new TimelineRecordStyle(i18nString(UIStrings.layerize), defaultCategoryStyles.rendering),
        ["Layout" /* TraceEngine.Types.TraceEvents.KnownEventName.Layout */]: new TimelineRecordStyle(i18nString(UIStrings.layout), defaultCategoryStyles.rendering),
        ["PaintSetup" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintSetup */]: new TimelineRecordStyle(i18nString(UIStrings.paintSetup), defaultCategoryStyles.painting),
        ["PaintImage" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintImage */]: new TimelineRecordStyle(i18nString(UIStrings.paintImage), defaultCategoryStyles.painting, true),
        ["UpdateLayer" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayer */]: new TimelineRecordStyle(i18nString(UIStrings.updateLayer), defaultCategoryStyles.painting, true),
        ["UpdateLayerTree" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayerTree */]: new TimelineRecordStyle(i18nString(UIStrings.updateLayerTree), defaultCategoryStyles.rendering),
        ["Paint" /* TraceEngine.Types.TraceEvents.KnownEventName.Paint */]: new TimelineRecordStyle(i18nString(UIStrings.paint), defaultCategoryStyles.painting),
        ["PrePaint" /* TraceEngine.Types.TraceEvents.KnownEventName.PrePaint */]: new TimelineRecordStyle(i18nString(UIStrings.prePaint), defaultCategoryStyles.rendering),
        ["RasterTask" /* TraceEngine.Types.TraceEvents.KnownEventName.RasterTask */]: new TimelineRecordStyle(i18nString(UIStrings.rasterizePaint), defaultCategoryStyles.painting),
        ["ScrollLayer" /* TraceEngine.Types.TraceEvents.KnownEventName.ScrollLayer */]: new TimelineRecordStyle(i18nString(UIStrings.scroll), defaultCategoryStyles.rendering),
        ["Commit" /* TraceEngine.Types.TraceEvents.KnownEventName.Commit */]: new TimelineRecordStyle(i18nString(UIStrings.commit), defaultCategoryStyles.painting),
        ["CompositeLayers" /* TraceEngine.Types.TraceEvents.KnownEventName.CompositeLayers */]: new TimelineRecordStyle(i18nString(UIStrings.compositeLayers), defaultCategoryStyles.painting),
        ["ComputeIntersections" /* TraceEngine.Types.TraceEvents.KnownEventName.ComputeIntersections */]: new TimelineRecordStyle(i18nString(UIStrings.computeIntersections), defaultCategoryStyles.rendering),
        ["ParseHTML" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseHTML */]: new TimelineRecordStyle(i18nString(UIStrings.parseHtml), defaultCategoryStyles.loading),
        ["ParseAuthorStyleSheet" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseAuthorStyleSheet */]: new TimelineRecordStyle(i18nString(UIStrings.parseStylesheet), defaultCategoryStyles.loading),
        ["TimerInstall" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerInstall */]: new TimelineRecordStyle(i18nString(UIStrings.installTimer), defaultCategoryStyles.scripting),
        ["TimerRemove" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerRemove */]: new TimelineRecordStyle(i18nString(UIStrings.removeTimer), defaultCategoryStyles.scripting),
        ["TimerFire" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerFire */]: new TimelineRecordStyle(i18nString(UIStrings.timerFired), defaultCategoryStyles.scripting),
        ["XHRReadyStateChange" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRReadyStateChange */]: new TimelineRecordStyle(i18nString(UIStrings.xhrReadyStateChange), defaultCategoryStyles.scripting),
        ["XHRLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRLoad */]: new TimelineRecordStyle(i18nString(UIStrings.xhrLoad), defaultCategoryStyles.scripting),
        ["v8.compile" /* TraceEngine.Types.TraceEvents.KnownEventName.Compile */]: new TimelineRecordStyle(i18nString(UIStrings.compileScript), defaultCategoryStyles.scripting),
        ["v8.produceCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheScript */]: new TimelineRecordStyle(i18nString(UIStrings.cacheScript), defaultCategoryStyles.scripting),
        ["V8.CompileCode" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileCode */]: new TimelineRecordStyle(i18nString(UIStrings.compileCode), defaultCategoryStyles.scripting),
        ["V8.OptimizeCode" /* TraceEngine.Types.TraceEvents.KnownEventName.OptimizeCode */]: new TimelineRecordStyle(i18nString(UIStrings.optimizeCode), defaultCategoryStyles.scripting),
        ["EvaluateScript" /* TraceEngine.Types.TraceEvents.KnownEventName.EvaluateScript */]: new TimelineRecordStyle(i18nString(UIStrings.evaluateScript), defaultCategoryStyles.scripting),
        ["V8.CompileModule" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileModule */]: new TimelineRecordStyle(i18nString(UIStrings.compileModule), defaultCategoryStyles.scripting),
        ["v8.produceModuleCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheModule */]: new TimelineRecordStyle(i18nString(UIStrings.cacheModule), defaultCategoryStyles.scripting),
        ["v8.evaluateModule" /* TraceEngine.Types.TraceEvents.KnownEventName.EvaluateModule */]: new TimelineRecordStyle(i18nString(UIStrings.evaluateModule), defaultCategoryStyles.scripting),
        ["v8.parseOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScript */]: new TimelineRecordStyle(i18nString(UIStrings.streamingCompileTask), defaultCategoryStyles.other),
        ["v8.parseOnBackgroundWaiting" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScriptWaiting */]: new TimelineRecordStyle(i18nString(UIStrings.waitingForNetwork), defaultCategoryStyles.idle),
        ["v8.parseOnBackgroundParsing" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScriptParsing */]: new TimelineRecordStyle(i18nString(UIStrings.parseAndCompile), defaultCategoryStyles.scripting),
        ["v8.deserializeOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.BackgroundDeserialize */]: new TimelineRecordStyle(i18nString(UIStrings.deserializeCodeCache), defaultCategoryStyles.scripting),
        ["V8.FinalizeDeserialization" /* TraceEngine.Types.TraceEvents.KnownEventName.FinalizeDeserialization */]: new TimelineRecordStyle(i18nString(UIStrings.profilingOverhead), defaultCategoryStyles.other),
        ["v8.wasm.streamFromResponseCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmStreamFromResponseCallback */]: new TimelineRecordStyle(i18nString(UIStrings.streamingWasmResponse), defaultCategoryStyles.scripting),
        ["v8.wasm.compiledModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCompiledModule */]: new TimelineRecordStyle(i18nString(UIStrings.compiledWasmModule), defaultCategoryStyles.scripting),
        ["v8.wasm.cachedModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCachedModule */]: new TimelineRecordStyle(i18nString(UIStrings.cachedWasmModule), defaultCategoryStyles.scripting),
        ["v8.wasm.moduleCacheHit" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheHit */]: new TimelineRecordStyle(i18nString(UIStrings.wasmModuleCacheHit), defaultCategoryStyles.scripting),
        ["v8.wasm.moduleCacheInvalid" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheInvalid */]: new TimelineRecordStyle(i18nString(UIStrings.wasmModuleCacheInvalid), defaultCategoryStyles.scripting),
        ["FrameStartedLoading" /* TraceEngine.Types.TraceEvents.KnownEventName.FrameStartedLoading */]: new TimelineRecordStyle(i18nString(UIStrings.frameStartedLoading), defaultCategoryStyles.loading, true),
        ["MarkLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLoad */]: new TimelineRecordStyle(i18nString(UIStrings.onloadEvent), defaultCategoryStyles.scripting, true),
        ["MarkDOMContent" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkDOMContent */]: new TimelineRecordStyle(i18nString(UIStrings.domcontentloadedEvent), defaultCategoryStyles.scripting, true),
        ["firstPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFirstPaint */]: new TimelineRecordStyle(i18nString(UIStrings.firstPaint), defaultCategoryStyles.painting, true),
        ["firstContentfulPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFCP */]: new TimelineRecordStyle(i18nString(UIStrings.firstContentfulPaint), defaultCategoryStyles.rendering, true),
        ["largestContentfulPaint::Candidate" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLCPCandidate */]: new TimelineRecordStyle(i18nString(UIStrings.largestContentfulPaint), defaultCategoryStyles.rendering, true),
        ["TimeStamp" /* TraceEngine.Types.TraceEvents.KnownEventName.TimeStamp */]: new TimelineRecordStyle(i18nString(UIStrings.timestamp), defaultCategoryStyles.scripting),
        ["ConsoleTime" /* TraceEngine.Types.TraceEvents.KnownEventName.ConsoleTime */]: new TimelineRecordStyle(i18nString(UIStrings.consoleTime), defaultCategoryStyles.scripting),
        ["UserTiming" /* TraceEngine.Types.TraceEvents.KnownEventName.UserTiming */]: new TimelineRecordStyle(i18nString(UIStrings.userTiming), defaultCategoryStyles.scripting),
        ["ResourceWillSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceWillSendRequest */]: new TimelineRecordStyle(i18nString(UIStrings.willSendRequest), defaultCategoryStyles.loading),
        ["ResourceSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceSendRequest */]: new TimelineRecordStyle(i18nString(UIStrings.sendRequest), defaultCategoryStyles.loading),
        ["ResourceReceiveResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceiveResponse */]: new TimelineRecordStyle(i18nString(UIStrings.receiveResponse), defaultCategoryStyles.loading),
        ["ResourceFinish" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceFinish */]: new TimelineRecordStyle(i18nString(UIStrings.finishLoading), defaultCategoryStyles.loading),
        ["ResourceReceivedData" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceivedData */]: new TimelineRecordStyle(i18nString(UIStrings.receiveData), defaultCategoryStyles.loading),
        ["RunMicrotasks" /* TraceEngine.Types.TraceEvents.KnownEventName.RunMicrotasks */]: new TimelineRecordStyle(i18nString(UIStrings.runMicrotasks), defaultCategoryStyles.scripting),
        ["FunctionCall" /* TraceEngine.Types.TraceEvents.KnownEventName.FunctionCall */]: new TimelineRecordStyle(i18nString(UIStrings.functionCall), defaultCategoryStyles.scripting),
        ["GCEvent" /* TraceEngine.Types.TraceEvents.KnownEventName.GC */]: new TimelineRecordStyle(i18nString(UIStrings.gcEvent), defaultCategoryStyles.scripting),
        ["MajorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MajorGC */]: new TimelineRecordStyle(i18nString(UIStrings.majorGc), defaultCategoryStyles.scripting),
        ["MinorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MinorGC */]: new TimelineRecordStyle(i18nString(UIStrings.minorGc), defaultCategoryStyles.scripting),
        ["CppGC.IncrementalSweep" /* TraceEngine.Types.TraceEvents.KnownEventName.CPPGCSweep */]: new TimelineRecordStyle(i18nString(UIStrings.cppGc), defaultCategoryStyles.scripting),
        ["RequestAnimationFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.RequestAnimationFrame */]: new TimelineRecordStyle(i18nString(UIStrings.requestAnimationFrame), defaultCategoryStyles.scripting),
        ["CancelAnimationFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.CancelAnimationFrame */]: new TimelineRecordStyle(i18nString(UIStrings.cancelAnimationFrame), defaultCategoryStyles.scripting),
        ["FireAnimationFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.FireAnimationFrame */]: new TimelineRecordStyle(i18nString(UIStrings.animationFrameFired), defaultCategoryStyles.scripting),
        ["RequestIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.RequestIdleCallback */]: new TimelineRecordStyle(i18nString(UIStrings.requestIdleCallback), defaultCategoryStyles.scripting),
        ["CancelIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.CancelIdleCallback */]: new TimelineRecordStyle(i18nString(UIStrings.cancelIdleCallback), defaultCategoryStyles.scripting),
        ["FireIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.FireIdleCallback */]: new TimelineRecordStyle(i18nString(UIStrings.fireIdleCallback), defaultCategoryStyles.scripting),
        ["WebSocketCreate" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketCreate */]: new TimelineRecordStyle(i18nString(UIStrings.createWebsocket), defaultCategoryStyles.scripting),
        ["WebSocketSendHandshakeRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSendHandshakeRequest */]: new TimelineRecordStyle(i18nString(UIStrings.sendWebsocketHandshake), defaultCategoryStyles.scripting),
        ["WebSocketReceiveHandshakeResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceiveHandshakeResponse */]: new TimelineRecordStyle(i18nString(UIStrings.receiveWebsocketHandshake), defaultCategoryStyles.scripting),
        ["WebSocketDestroy" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketDestroy */]: new TimelineRecordStyle(i18nString(UIStrings.destroyWebsocket), defaultCategoryStyles.scripting),
        ["WebSocketSend" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSend */]: new TimelineRecordStyle(i18nString(UIStrings.wsMessageSent), defaultCategoryStyles.scripting),
        ["WebSocketReceive" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceive */]: new TimelineRecordStyle(i18nString(UIStrings.wsMessageReceived), defaultCategoryStyles.scripting),
        ["EmbedderCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.EmbedderCallback */]: new TimelineRecordStyle(i18nString(UIStrings.embedderCallback), defaultCategoryStyles.scripting),
        ["Decode Image" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeImage */]: new TimelineRecordStyle(i18nString(UIStrings.imageDecode), defaultCategoryStyles.painting),
        ["GPUTask" /* TraceEngine.Types.TraceEvents.KnownEventName.GPUTask */]: new TimelineRecordStyle(i18nString(UIStrings.gpu), defaultCategoryStyles.gpu),
        ["BlinkGC.AtomicPhase" /* TraceEngine.Types.TraceEvents.KnownEventName.GCCollectGarbage */]: new TimelineRecordStyle(i18nString(UIStrings.domGc), defaultCategoryStyles.scripting),
        ["DoEncrypt" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoEncrypt */]: new TimelineRecordStyle(i18nString(UIStrings.encrypt), defaultCategoryStyles.scripting),
        ["DoEncryptReply" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoEncryptReply */]: new TimelineRecordStyle(i18nString(UIStrings.encryptReply), defaultCategoryStyles.scripting),
        ["DoDecrypt" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoDecrypt */]: new TimelineRecordStyle(i18nString(UIStrings.decrypt), defaultCategoryStyles.scripting),
        ["DoDecryptReply" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoDecryptReply */]: new TimelineRecordStyle(i18nString(UIStrings.decryptReply), defaultCategoryStyles.scripting),
        ["DoDigest" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoDigest */]: new TimelineRecordStyle(i18nString(UIStrings.digest), defaultCategoryStyles.scripting),
        ["DoDigestReply" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoDigestReply */]: new TimelineRecordStyle(i18nString(UIStrings.digestReply), defaultCategoryStyles.scripting),
        ["DoSign" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoSign */]: new TimelineRecordStyle(i18nString(UIStrings.sign), defaultCategoryStyles.scripting),
        ["DoSignReply" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoSignReply */]: new TimelineRecordStyle(i18nString(UIStrings.signReply), defaultCategoryStyles.scripting),
        ["DoVerify" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoVerify */]: new TimelineRecordStyle(i18nString(UIStrings.verify), defaultCategoryStyles.scripting),
        ["DoVerifyReply" /* TraceEngine.Types.TraceEvents.KnownEventName.CryptoDoVerifyReply */]: new TimelineRecordStyle(i18nString(UIStrings.verifyReply), defaultCategoryStyles.scripting),
        ["AsyncTask" /* TraceEngine.Types.TraceEvents.KnownEventName.AsyncTask */]: new TimelineRecordStyle(i18nString(UIStrings.asyncTask), defaultCategoryStyles.async),
        ["LayoutShift" /* TraceEngine.Types.TraceEvents.KnownEventName.LayoutShift */]: new TimelineRecordStyle(i18nString(UIStrings.layoutShift), defaultCategoryStyles.experience),
        ["EventTiming" /* TraceEngine.Types.TraceEvents.KnownEventName.EventTiming */]: new TimelineRecordStyle(i18nString(UIStrings.eventTiming), defaultCategoryStyles.experience),
        ["HandlePostMessage" /* TraceEngine.Types.TraceEvents.KnownEventName.HandlePostMessage */]: new TimelineRecordStyle(i18nString(UIStrings.onMessage), defaultCategoryStyles.messaging),
        ["SchedulePostMessage" /* TraceEngine.Types.TraceEvents.KnownEventName.SchedulePostMessage */]: new TimelineRecordStyle(i18nString(UIStrings.schedulePostMessage), defaultCategoryStyles.messaging),
    };
    return eventStylesMap;
}
export function setEventStylesMap(eventStyles) {
    eventStylesMap = eventStyles;
}
export function setCategories(cats) {
    categoryStyles = cats;
}
export function visibleTypes() {
    const eventStyles = maybeInitSylesMap();
    const result = [];
    for (const name in eventStyles) {
        // Typescript cannot infer that `name` is a key of eventStyles
        const nameAsKey = name;
        if (!eventStyles[nameAsKey]?.hidden) {
            result.push(name);
        }
    }
    return result;
}
export function getTimelineMainEventCategories() {
    if (mainEventCategories) {
        return mainEventCategories;
    }
    mainEventCategories = [
        EventCategory.IDLE,
        EventCategory.LOADING,
        EventCategory.PAINTING,
        EventCategory.RENDERING,
        EventCategory.SCRIPTING,
        EventCategory.OTHER,
    ];
    return mainEventCategories;
}
export function setTimelineMainEventCategories(categories) {
    mainEventCategories = categories;
}
//# sourceMappingURL=EventUICategory.js.map