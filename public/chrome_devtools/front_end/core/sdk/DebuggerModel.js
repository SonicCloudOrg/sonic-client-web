// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as i18n from '../i18n/i18n.js';
import * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { ScopeRef } from './RemoteObject.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel } from './ResourceTreeModel.js';
import { RuntimeModel } from './RuntimeModel.js';
import { Script } from './Script.js';
import { SDKModel } from './SDKModel.js';
import { SourceMapManager } from './SourceMapManager.js';
import { Type } from './Target.js';
const UIStrings = {
    /**
     *@description Title of a section in the debugger showing local JavaScript variables.
     */
    local: 'Local',
    /**
     *@description Text that refers to closure as a programming term
     */
    closure: 'Closure',
    /**
     *@description Noun that represents a section or block of code in the Debugger Model. Shown in the Sources tab, while paused on a breakpoint.
     */
    block: 'Block',
    /**
     *@description Label for a group of JavaScript files
     */
    script: 'Script',
    /**
     *@description Title of a section in the debugger showing JavaScript variables from the a 'with'
     *block. Block here means section of code, 'with' refers to a JavaScript programming concept and
     *is a fixed term.
     */
    withBlock: '`With` block',
    /**
     *@description Title of a section in the debugger showing JavaScript variables from the a 'catch'
     *block. Block here means section of code, 'catch' refers to a JavaScript programming concept and
     *is a fixed term.
     */
    catchBlock: '`Catch` block',
    /**
     *@description Title of a section in the debugger showing JavaScript variables from the global scope.
     */
    global: 'Global',
    /**
     *@description Text for a JavaScript module, the programming concept
     */
    module: 'Module',
    /**
     *@description Text describing the expression scope in WebAssembly
     */
    expression: 'Expression',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/DebuggerModel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export function sortAndMergeRanges(locationRanges) {
    function compare(p1, p2) {
        return (p1.lineNumber - p2.lineNumber) || (p1.columnNumber - p2.columnNumber);
    }
    function overlap(r1, r2) {
        if (r1.scriptId !== r2.scriptId) {
            return false;
        }
        const n = compare(r1.start, r2.start);
        if (n < 0) {
            return compare(r1.end, r2.start) >= 0;
        }
        if (n > 0) {
            return compare(r1.start, r2.end) <= 0;
        }
        return true;
    }
    if (locationRanges.length === 0) {
        return [];
    }
    locationRanges.sort((r1, r2) => {
        if (r1.scriptId < r2.scriptId) {
            return -1;
        }
        if (r1.scriptId > r2.scriptId) {
            return 1;
        }
        return compare(r1.start, r2.start) || compare(r1.end, r2.end);
    });
    let prev = locationRanges[0];
    const merged = [];
    for (let i = 1; i < locationRanges.length; ++i) {
        const curr = locationRanges[i];
        if (overlap(prev, curr)) {
            if (compare(prev.end, curr.end) <= 0) {
                prev = { ...prev, end: curr.end };
            }
        }
        else {
            merged.push(prev);
            prev = curr;
        }
    }
    merged.push(prev);
    return merged;
}
export class DebuggerModel extends SDKModel {
    agent;
    runtimeModelInternal;
    #sourceMapManagerInternal;
    #debuggerPausedDetailsInternal;
    #scriptsInternal;
    #scriptsBySourceURL;
    #discardableScripts;
    continueToLocationCallback;
    #selectedCallFrameInternal;
    #debuggerEnabledInternal;
    #debuggerId;
    #skipAllPausesTimeout;
    #beforePausedCallback;
    #computeAutoStepRangesCallback;
    #expandCallFramesCallback;
    evaluateOnCallFrameCallback;
    #synchronizeBreakpointsCallback;
    // We need to be able to register listeners for individual breakpoints. As such, we dispatch
    // on breakpoint ids, which are not statically known. The event #payload will always be a `Location`.
    #breakpointResolvedEventTarget = new Common.ObjectWrapper.ObjectWrapper();
    // When stepping over with autostepping enabled, the context denotes the function to which autostepping is restricted
    // to by way of its functionLocation (as per Debugger.CallFrame).
    #autoSteppingContext;
    #isPausingInternal;
    constructor(target) {
        super(target);
        target.registerDebuggerDispatcher(new DebuggerDispatcher(this));
        this.agent = target.debuggerAgent();
        this.runtimeModelInternal = target.model(RuntimeModel);
        this.#sourceMapManagerInternal = new SourceMapManager(target);
        this.#debuggerPausedDetailsInternal = null;
        this.#scriptsInternal = new Map();
        this.#scriptsBySourceURL = new Map();
        this.#discardableScripts = [];
        this.continueToLocationCallback = null;
        this.#selectedCallFrameInternal = null;
        this.#debuggerEnabledInternal = false;
        this.#debuggerId = null;
        this.#skipAllPausesTimeout = 0;
        this.#beforePausedCallback = null;
        this.#computeAutoStepRangesCallback = null;
        this.#expandCallFramesCallback = null;
        this.evaluateOnCallFrameCallback = null;
        this.#synchronizeBreakpointsCallback = null;
        this.#autoSteppingContext = null;
        this.#isPausingInternal = false;
        Common.Settings.Settings.instance()
            .moduleSetting('pause-on-exception-enabled')
            .addChangeListener(this.pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('pause-on-caught-exception')
            .addChangeListener(this.pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('pause-on-uncaught-exception')
            .addChangeListener(this.pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('disable-async-stack-traces')
            .addChangeListener(this.asyncStackTracesStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('breakpoints-active')
            .addChangeListener(this.breakpointsActiveChanged, this);
        if (!target.suspended()) {
            void this.enableDebugger();
        }
        this.#sourceMapManagerInternal.setEnabled(Common.Settings.Settings.instance().moduleSetting('js-source-maps-enabled').get());
        Common.Settings.Settings.instance()
            .moduleSetting('js-source-maps-enabled')
            .addChangeListener(event => this.#sourceMapManagerInternal.setEnabled(event.data));
        const resourceTreeModel = target.model(ResourceTreeModel);
        if (resourceTreeModel) {
            resourceTreeModel.addEventListener(ResourceTreeModelEvents.FrameNavigated, this.onFrameNavigated, this);
        }
    }
    sourceMapManager() {
        return this.#sourceMapManagerInternal;
    }
    runtimeModel() {
        return this.runtimeModelInternal;
    }
    debuggerEnabled() {
        return Boolean(this.#debuggerEnabledInternal);
    }
    debuggerId() {
        return this.#debuggerId;
    }
    async enableDebugger() {
        if (this.#debuggerEnabledInternal) {
            return;
        }
        this.#debuggerEnabledInternal = true;
        // Set a limit for the total size of collected script sources retained by debugger.
        // 10MB for remote frontends, 100MB for others.
        const isRemoteFrontend = Root.Runtime.Runtime.queryParam('remoteFrontend') || Root.Runtime.Runtime.queryParam('ws');
        const maxScriptsCacheSize = isRemoteFrontend ? 10e6 : 100e6;
        const enablePromise = this.agent.invoke_enable({ maxScriptsCacheSize });
        let instrumentationPromise;
        if (Root.Runtime.experiments.isEnabled("instrumentation-breakpoints" /* Root.Runtime.ExperimentName.INSTRUMENTATION_BREAKPOINTS */)) {
            instrumentationPromise = this.agent.invoke_setInstrumentationBreakpoint({
                instrumentation: "beforeScriptExecution" /* Protocol.Debugger.SetInstrumentationBreakpointRequestInstrumentation.BeforeScriptExecution */,
            });
        }
        this.pauseOnExceptionStateChanged();
        void this.asyncStackTracesStateChanged();
        if (!Common.Settings.Settings.instance().moduleSetting('breakpoints-active').get()) {
            this.breakpointsActiveChanged();
        }
        this.dispatchEventToListeners(Events.DebuggerWasEnabled, this);
        const [enableResult] = await Promise.all([enablePromise, instrumentationPromise]);
        this.registerDebugger(enableResult);
    }
    async syncDebuggerId() {
        const isRemoteFrontend = Root.Runtime.Runtime.queryParam('remoteFrontend') || Root.Runtime.Runtime.queryParam('ws');
        const maxScriptsCacheSize = isRemoteFrontend ? 10e6 : 100e6;
        const enablePromise = this.agent.invoke_enable({ maxScriptsCacheSize });
        void enablePromise.then(this.registerDebugger.bind(this));
        return enablePromise;
    }
    onFrameNavigated() {
        if (DebuggerModel.shouldResyncDebuggerId) {
            return;
        }
        DebuggerModel.shouldResyncDebuggerId = true;
    }
    registerDebugger(response) {
        if (response.getError()) {
            return;
        }
        const { debuggerId } = response;
        debuggerIdToModel.set(debuggerId, this);
        this.#debuggerId = debuggerId;
        this.dispatchEventToListeners(Events.DebuggerIsReadyToPause, this);
    }
    isReadyToPause() {
        return Boolean(this.#debuggerId);
    }
    static async modelForDebuggerId(debuggerId) {
        if (DebuggerModel.shouldResyncDebuggerId) {
            await DebuggerModel.resyncDebuggerIdForModels();
            DebuggerModel.shouldResyncDebuggerId = false;
        }
        return debuggerIdToModel.get(debuggerId) || null;
    }
    static async resyncDebuggerIdForModels() {
        const dbgModels = debuggerIdToModel.values();
        for (const dbgModel of dbgModels) {
            if (dbgModel.debuggerEnabled()) {
                await dbgModel.syncDebuggerId();
            }
        }
    }
    async disableDebugger() {
        if (!this.#debuggerEnabledInternal) {
            return;
        }
        this.#debuggerEnabledInternal = false;
        await this.asyncStackTracesStateChanged();
        await this.agent.invoke_disable();
        this.#isPausingInternal = false;
        this.globalObjectCleared();
        this.dispatchEventToListeners(Events.DebuggerWasDisabled, this);
        if (typeof this.#debuggerId === 'string') {
            debuggerIdToModel.delete(this.#debuggerId);
        }
        this.#debuggerId = null;
    }
    skipAllPauses(skip) {
        if (this.#skipAllPausesTimeout) {
            clearTimeout(this.#skipAllPausesTimeout);
            this.#skipAllPausesTimeout = 0;
        }
        void this.agent.invoke_setSkipAllPauses({ skip });
    }
    skipAllPausesUntilReloadOrTimeout(timeout) {
        if (this.#skipAllPausesTimeout) {
            clearTimeout(this.#skipAllPausesTimeout);
        }
        void this.agent.invoke_setSkipAllPauses({ skip: true });
        // If reload happens before the timeout, the flag will be already unset and the timeout callback won't change anything.
        this.#skipAllPausesTimeout = window.setTimeout(this.skipAllPauses.bind(this, false), timeout);
    }
    pauseOnExceptionStateChanged() {
        const pauseOnCaughtEnabled = Common.Settings.Settings.instance().moduleSetting('pause-on-caught-exception').get();
        let state;
        const pauseOnUncaughtEnabled = Common.Settings.Settings.instance().moduleSetting('pause-on-uncaught-exception').get();
        if (pauseOnCaughtEnabled && pauseOnUncaughtEnabled) {
            state = "all" /* Protocol.Debugger.SetPauseOnExceptionsRequestState.All */;
        }
        else if (pauseOnCaughtEnabled) {
            state = "caught" /* Protocol.Debugger.SetPauseOnExceptionsRequestState.Caught */;
        }
        else if (pauseOnUncaughtEnabled) {
            state = "uncaught" /* Protocol.Debugger.SetPauseOnExceptionsRequestState.Uncaught */;
        }
        else {
            state = "none" /* Protocol.Debugger.SetPauseOnExceptionsRequestState.None */;
        }
        void this.agent.invoke_setPauseOnExceptions({ state });
    }
    asyncStackTracesStateChanged() {
        const maxAsyncStackChainDepth = 32;
        const enabled = !Common.Settings.Settings.instance().moduleSetting('disable-async-stack-traces').get() &&
            this.#debuggerEnabledInternal;
        const maxDepth = enabled ? maxAsyncStackChainDepth : 0;
        return this.agent.invoke_setAsyncCallStackDepth({ maxDepth });
    }
    breakpointsActiveChanged() {
        void this.agent.invoke_setBreakpointsActive({ active: Common.Settings.Settings.instance().moduleSetting('breakpoints-active').get() });
    }
    setComputeAutoStepRangesCallback(callback) {
        this.#computeAutoStepRangesCallback = callback;
    }
    async computeAutoStepSkipList(mode) {
        let ranges = [];
        if (this.#computeAutoStepRangesCallback && this.#debuggerPausedDetailsInternal &&
            this.#debuggerPausedDetailsInternal.callFrames.length > 0) {
            const [callFrame] = this.#debuggerPausedDetailsInternal.callFrames;
            ranges = await this.#computeAutoStepRangesCallback.call(null, mode, callFrame);
        }
        const skipList = ranges.map(({ start, end }) => ({
            scriptId: start.scriptId,
            start: { lineNumber: start.lineNumber, columnNumber: start.columnNumber },
            end: { lineNumber: end.lineNumber, columnNumber: end.columnNumber },
        }));
        return sortAndMergeRanges(skipList);
    }
    async stepInto() {
        const skipList = await this.computeAutoStepSkipList("StepInto" /* StepMode.StepInto */);
        void this.agent.invoke_stepInto({ breakOnAsyncCall: false, skipList });
    }
    async stepOver() {
        this.#autoSteppingContext = this.#debuggerPausedDetailsInternal?.callFrames[0]?.functionLocation() ?? null;
        const skipList = await this.computeAutoStepSkipList("StepOver" /* StepMode.StepOver */);
        void this.agent.invoke_stepOver({ skipList });
    }
    async stepOut() {
        const skipList = await this.computeAutoStepSkipList("StepOut" /* StepMode.StepOut */);
        if (skipList.length !== 0) {
            void this.agent.invoke_stepOver({ skipList });
        }
        else {
            void this.agent.invoke_stepOut();
        }
    }
    scheduleStepIntoAsync() {
        void this.computeAutoStepSkipList("StepInto" /* StepMode.StepInto */).then(skipList => {
            void this.agent.invoke_stepInto({ breakOnAsyncCall: true, skipList });
        });
    }
    resume() {
        void this.agent.invoke_resume({ terminateOnResume: false });
        this.#isPausingInternal = false;
    }
    pause() {
        this.#isPausingInternal = true;
        this.skipAllPauses(false);
        void this.agent.invoke_pause();
    }
    async setBreakpointByURL(url, lineNumber, columnNumber, condition) {
        // Convert file url to node-js path.
        let urlRegex;
        if (this.target().type() === Type.Node && Common.ParsedURL.schemeIs(url, 'file:')) {
            const platformPath = Common.ParsedURL.ParsedURL.urlToRawPathString(url, Host.Platform.isWin());
            urlRegex =
                `${Platform.StringUtilities.escapeForRegExp(platformPath)}|${Platform.StringUtilities.escapeForRegExp(url)}`;
            if (Host.Platform.isWin() && platformPath.match(/^.:\\/)) {
                // Match upper or lower case drive letter
                urlRegex = `[${platformPath[0].toUpperCase()}${platformPath[0].toLowerCase()}]` + urlRegex.substr(1);
            }
        }
        // Adjust column if needed.
        let minColumnNumber = 0;
        const scripts = this.#scriptsBySourceURL.get(url) || [];
        for (let i = 0, l = scripts.length; i < l; ++i) {
            const script = scripts[i];
            if (lineNumber === script.lineOffset) {
                minColumnNumber = minColumnNumber ? Math.min(minColumnNumber, script.columnOffset) : script.columnOffset;
            }
        }
        columnNumber = Math.max(columnNumber || 0, minColumnNumber);
        const response = await this.agent.invoke_setBreakpointByUrl({
            lineNumber: lineNumber,
            url: urlRegex ? undefined : url,
            urlRegex: urlRegex,
            columnNumber: columnNumber,
            condition: condition,
        });
        if (response.getError()) {
            return { locations: [], breakpointId: null };
        }
        let locations = [];
        if (response.locations) {
            locations = response.locations.map(payload => Location.fromPayload(this, payload));
        }
        return { locations, breakpointId: response.breakpointId };
    }
    async setBreakpointInAnonymousScript(scriptHash, lineNumber, columnNumber, condition) {
        const response = await this.agent.invoke_setBreakpointByUrl({ lineNumber: lineNumber, scriptHash: scriptHash, columnNumber: columnNumber, condition: condition });
        if (response.getError()) {
            return { locations: [], breakpointId: null };
        }
        let locations = [];
        if (response.locations) {
            locations = response.locations.map(payload => Location.fromPayload(this, payload));
        }
        return { locations, breakpointId: response.breakpointId };
    }
    async removeBreakpoint(breakpointId) {
        await this.agent.invoke_removeBreakpoint({ breakpointId });
    }
    async getPossibleBreakpoints(startLocation, endLocation, restrictToFunction) {
        const response = await this.agent.invoke_getPossibleBreakpoints({
            start: startLocation.payload(),
            end: endLocation ? endLocation.payload() : undefined,
            restrictToFunction: restrictToFunction,
        });
        if (response.getError() || !response.locations) {
            return [];
        }
        return response.locations.map(location => BreakLocation.fromPayload(this, location));
    }
    async fetchAsyncStackTrace(stackId) {
        const response = await this.agent.invoke_getStackTrace({ stackTraceId: stackId });
        return response.getError() ? null : response.stackTrace;
    }
    breakpointResolved(breakpointId, location) {
        this.#breakpointResolvedEventTarget.dispatchEventToListeners(breakpointId, Location.fromPayload(this, location));
    }
    globalObjectCleared() {
        this.resetDebuggerPausedDetails();
        this.reset();
        // TODO(dgozman): move clients to ExecutionContextDestroyed/ScriptCollected events.
        this.dispatchEventToListeners(Events.GlobalObjectCleared, this);
    }
    reset() {
        for (const script of this.#scriptsInternal.values()) {
            this.#sourceMapManagerInternal.detachSourceMap(script);
        }
        this.#scriptsInternal.clear();
        this.#scriptsBySourceURL.clear();
        this.#discardableScripts = [];
        this.#autoSteppingContext = null;
    }
    scripts() {
        return Array.from(this.#scriptsInternal.values());
    }
    scriptForId(scriptId) {
        return this.#scriptsInternal.get(scriptId) || null;
    }
    /**
     * Returns all `Script` objects with the same provided `sourceURL`. The
     * resulting array is sorted by time with the newest `Script` in the front.
     */
    scriptsForSourceURL(sourceURL) {
        return this.#scriptsBySourceURL.get(sourceURL) || [];
    }
    scriptsForExecutionContext(executionContext) {
        const result = [];
        for (const script of this.#scriptsInternal.values()) {
            if (script.executionContextId === executionContext.id) {
                result.push(script);
            }
        }
        return result;
    }
    get callFrames() {
        return this.#debuggerPausedDetailsInternal ? this.#debuggerPausedDetailsInternal.callFrames : null;
    }
    debuggerPausedDetails() {
        return this.#debuggerPausedDetailsInternal;
    }
    async setDebuggerPausedDetails(debuggerPausedDetails) {
        this.#isPausingInternal = false;
        this.#debuggerPausedDetailsInternal = debuggerPausedDetails;
        if (this.#beforePausedCallback) {
            if (!await this.#beforePausedCallback.call(null, debuggerPausedDetails, this.#autoSteppingContext)) {
                return false;
            }
        }
        // If we resolved a location in auto-stepping callback, reset the
        // auto-step-over context.
        this.#autoSteppingContext = null;
        this.dispatchEventToListeners(Events.DebuggerPaused, this);
        this.setSelectedCallFrame(debuggerPausedDetails.callFrames[0]);
        return true;
    }
    resetDebuggerPausedDetails() {
        this.#isPausingInternal = false;
        this.#debuggerPausedDetailsInternal = null;
        this.setSelectedCallFrame(null);
    }
    setBeforePausedCallback(callback) {
        this.#beforePausedCallback = callback;
    }
    setExpandCallFramesCallback(callback) {
        this.#expandCallFramesCallback = callback;
    }
    setEvaluateOnCallFrameCallback(callback) {
        this.evaluateOnCallFrameCallback = callback;
    }
    setSynchronizeBreakpointsCallback(callback) {
        this.#synchronizeBreakpointsCallback = callback;
    }
    async pausedScript(callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId) {
        if (reason === "instrumentation" /* Protocol.Debugger.PausedEventReason.Instrumentation */) {
            const script = this.scriptForId(auxData.scriptId);
            if (this.#synchronizeBreakpointsCallback && script) {
                await this.#synchronizeBreakpointsCallback(script);
            }
            this.resume();
            return;
        }
        const pausedDetails = new DebuggerPausedDetails(this, callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId);
        if (this.#expandCallFramesCallback) {
            pausedDetails.callFrames = await this.#expandCallFramesCallback.call(null, pausedDetails.callFrames);
        }
        if (this.continueToLocationCallback) {
            const callback = this.continueToLocationCallback;
            this.continueToLocationCallback = null;
            if (callback(pausedDetails)) {
                return;
            }
        }
        if (!await this.setDebuggerPausedDetails(pausedDetails)) {
            if (this.#autoSteppingContext) {
                void this.stepOver();
            }
            else {
                void this.stepInto();
            }
        }
        else {
            Common.EventTarget.fireEvent('DevTools.DebuggerPaused');
        }
    }
    resumedScript() {
        this.resetDebuggerPausedDetails();
        this.dispatchEventToListeners(Events.DebuggerResumed, this);
    }
    parsedScriptSource(scriptId, sourceURL, startLine, startColumn, endLine, endColumn, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    executionContextId, hash, executionContextAuxData, isLiveEdit, sourceMapURL, hasSourceURLComment, hasSyntaxError, length, isModule, originStackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName) {
        const knownScript = this.#scriptsInternal.get(scriptId);
        if (knownScript) {
            return knownScript;
        }
        let isContentScript = false;
        if (executionContextAuxData && ('isDefault' in executionContextAuxData)) {
            isContentScript = !executionContextAuxData['isDefault'];
        }
        const script = new Script(this, scriptId, sourceURL, startLine, startColumn, endLine, endColumn, executionContextId, hash, isContentScript, isLiveEdit, sourceMapURL, hasSourceURLComment, length, isModule, originStackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName);
        this.registerScript(script);
        this.dispatchEventToListeners(Events.ParsedScriptSource, script);
        if (script.sourceMapURL && !hasSyntaxError) {
            this.#sourceMapManagerInternal.attachSourceMap(script, script.sourceURL, script.sourceMapURL);
        }
        const isDiscardable = hasSyntaxError && script.isAnonymousScript();
        if (isDiscardable) {
            this.#discardableScripts.push(script);
            this.collectDiscardedScripts();
        }
        return script;
    }
    setSourceMapURL(script, newSourceMapURL) {
        // Detach any previous source map from the `script` first.
        this.#sourceMapManagerInternal.detachSourceMap(script);
        script.sourceMapURL = newSourceMapURL;
        this.#sourceMapManagerInternal.attachSourceMap(script, script.sourceURL, script.sourceMapURL);
    }
    async setDebugInfoURL(script, _externalURL) {
        if (this.#expandCallFramesCallback && this.#debuggerPausedDetailsInternal) {
            this.#debuggerPausedDetailsInternal.callFrames =
                await this.#expandCallFramesCallback.call(null, this.#debuggerPausedDetailsInternal.callFrames);
        }
        this.dispatchEventToListeners(Events.DebugInfoAttached, script);
    }
    executionContextDestroyed(executionContext) {
        for (const script of this.#scriptsInternal.values()) {
            if (script.executionContextId === executionContext.id) {
                this.#sourceMapManagerInternal.detachSourceMap(script);
            }
        }
    }
    registerScript(script) {
        this.#scriptsInternal.set(script.scriptId, script);
        if (script.isAnonymousScript()) {
            return;
        }
        let scripts = this.#scriptsBySourceURL.get(script.sourceURL);
        if (!scripts) {
            scripts = [];
            this.#scriptsBySourceURL.set(script.sourceURL, scripts);
        }
        // Newer scripts with the same URL should be preferred so we put them in
        // the front. Consuming code usually will iterate over the array and pick
        // the first script that works.
        scripts.unshift(script);
    }
    unregisterScript(script) {
        console.assert(script.isAnonymousScript());
        this.#scriptsInternal.delete(script.scriptId);
    }
    collectDiscardedScripts() {
        if (this.#discardableScripts.length < 1000) {
            return;
        }
        const scriptsToDiscard = this.#discardableScripts.splice(0, 100);
        for (const script of scriptsToDiscard) {
            this.unregisterScript(script);
            this.dispatchEventToListeners(Events.DiscardedAnonymousScriptSource, script);
        }
    }
    createRawLocation(script, lineNumber, columnNumber, inlineFrameIndex) {
        return this.createRawLocationByScriptId(script.scriptId, lineNumber, columnNumber, inlineFrameIndex);
    }
    createRawLocationByURL(sourceURL, lineNumber, columnNumber, inlineFrameIndex) {
        for (const script of this.#scriptsBySourceURL.get(sourceURL) || []) {
            if (script.lineOffset > lineNumber ||
                (script.lineOffset === lineNumber && columnNumber !== undefined && script.columnOffset > columnNumber)) {
                continue;
            }
            if (script.endLine < lineNumber ||
                (script.endLine === lineNumber && columnNumber !== undefined && script.endColumn <= columnNumber)) {
                continue;
            }
            return new Location(this, script.scriptId, lineNumber, columnNumber, inlineFrameIndex);
        }
        return null;
    }
    createRawLocationByScriptId(scriptId, lineNumber, columnNumber, inlineFrameIndex) {
        return new Location(this, scriptId, lineNumber, columnNumber, inlineFrameIndex);
    }
    createRawLocationsByStackTrace(stackTrace) {
        const rawLocations = [];
        for (let current = stackTrace; current; current = current.parent) {
            for (const { scriptId, lineNumber, columnNumber } of current.callFrames) {
                rawLocations.push(this.createRawLocationByScriptId(scriptId, lineNumber, columnNumber));
            }
        }
        return rawLocations;
    }
    isPaused() {
        return Boolean(this.debuggerPausedDetails());
    }
    isPausing() {
        return this.#isPausingInternal;
    }
    setSelectedCallFrame(callFrame) {
        if (this.#selectedCallFrameInternal === callFrame) {
            return;
        }
        this.#selectedCallFrameInternal = callFrame;
        this.dispatchEventToListeners(Events.CallFrameSelected, this);
    }
    selectedCallFrame() {
        return this.#selectedCallFrameInternal;
    }
    async evaluateOnSelectedCallFrame(options) {
        const callFrame = this.selectedCallFrame();
        if (!callFrame) {
            throw new Error('No call frame selected');
        }
        return callFrame.evaluate(options);
    }
    functionDetailsPromise(remoteObject) {
        return remoteObject.getAllProperties(false /* accessorPropertiesOnly */, false /* generatePreview */)
            .then(buildDetails.bind(this));
        function buildDetails(response) {
            if (!response) {
                return null;
            }
            let location = null;
            if (response.internalProperties) {
                for (const prop of response.internalProperties) {
                    if (prop.name === '[[FunctionLocation]]') {
                        location = prop.value;
                    }
                }
            }
            let functionName = null;
            if (response.properties) {
                for (const prop of response.properties) {
                    if (prop.name === 'name' && prop.value && prop.value.type === 'string') {
                        functionName = prop.value;
                    }
                }
            }
            let debuggerLocation = null;
            if (location) {
                debuggerLocation = this.createRawLocationByScriptId(location.value.scriptId, location.value.lineNumber, location.value.columnNumber);
            }
            return { location: debuggerLocation, functionName: functionName ? functionName.value : '' };
        }
    }
    async setVariableValue(scopeNumber, variableName, newValue, callFrameId) {
        const response = await this.agent.invoke_setVariableValue({ scopeNumber, variableName, newValue, callFrameId });
        const error = response.getError();
        return error;
    }
    addBreakpointListener(breakpointId, listener, thisObject) {
        this.#breakpointResolvedEventTarget.addEventListener(breakpointId, listener, thisObject);
    }
    removeBreakpointListener(breakpointId, listener, thisObject) {
        this.#breakpointResolvedEventTarget.removeEventListener(breakpointId, listener, thisObject);
    }
    async setBlackboxPatterns(patterns) {
        const response = await this.agent.invoke_setBlackboxPatterns({ patterns });
        const error = response.getError();
        return !error;
    }
    dispose() {
        this.#sourceMapManagerInternal.dispose();
        if (this.#debuggerId) {
            debuggerIdToModel.delete(this.#debuggerId);
        }
        Common.Settings.Settings.instance()
            .moduleSetting('pause-on-exception-enabled')
            .removeChangeListener(this.pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('pause-on-caught-exception')
            .removeChangeListener(this.pauseOnExceptionStateChanged, this);
        Common.Settings.Settings.instance()
            .moduleSetting('disable-async-stack-traces')
            .removeChangeListener(this.asyncStackTracesStateChanged, this);
    }
    async suspendModel() {
        await this.disableDebugger();
    }
    async resumeModel() {
        await this.enableDebugger();
    }
    static shouldResyncDebuggerId = false;
    getContinueToLocationCallback() {
        return this.continueToLocationCallback;
    }
    getEvaluateOnCallFrameCallback() {
        return this.evaluateOnCallFrameCallback;
    }
}
const debuggerIdToModel = new Map();
/**
 * Keep these in sync with WebCore::V8Debugger
 */
export var PauseOnExceptionsState;
(function (PauseOnExceptionsState) {
    PauseOnExceptionsState["DontPauseOnExceptions"] = "none";
    PauseOnExceptionsState["PauseOnAllExceptions"] = "all";
    PauseOnExceptionsState["PauseOnCaughtExceptions"] = "caught";
    PauseOnExceptionsState["PauseOnUncaughtExceptions"] = "uncaught";
})(PauseOnExceptionsState || (PauseOnExceptionsState = {}));
export var Events;
(function (Events) {
    Events["DebuggerWasEnabled"] = "DebuggerWasEnabled";
    Events["DebuggerWasDisabled"] = "DebuggerWasDisabled";
    Events["DebuggerPaused"] = "DebuggerPaused";
    Events["DebuggerResumed"] = "DebuggerResumed";
    Events["DebugInfoAttached"] = "DebugInfoAttached";
    Events["ParsedScriptSource"] = "ParsedScriptSource";
    Events["DiscardedAnonymousScriptSource"] = "DiscardedAnonymousScriptSource";
    Events["GlobalObjectCleared"] = "GlobalObjectCleared";
    Events["CallFrameSelected"] = "CallFrameSelected";
    Events["DebuggerIsReadyToPause"] = "DebuggerIsReadyToPause";
    Events["ScriptSourceWasEdited"] = "ScriptSourceWasEdited";
})(Events || (Events = {}));
class DebuggerDispatcher {
    #debuggerModel;
    constructor(debuggerModel) {
        this.#debuggerModel = debuggerModel;
    }
    paused({ callFrames, reason, data, hitBreakpoints, asyncStackTrace, asyncStackTraceId }) {
        if (!this.#debuggerModel.debuggerEnabled()) {
            return;
        }
        void this.#debuggerModel.pausedScript(callFrames, reason, data, hitBreakpoints || [], asyncStackTrace, asyncStackTraceId);
    }
    resumed() {
        if (!this.#debuggerModel.debuggerEnabled()) {
            return;
        }
        this.#debuggerModel.resumedScript();
    }
    scriptParsed({ scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, isLiveEdit, sourceMapURL, hasSourceURL, length, isModule, stackTrace, codeOffset, scriptLanguage, debugSymbols, embedderName, }) {
        if (!this.#debuggerModel.debuggerEnabled()) {
            return;
        }
        this.#debuggerModel.parsedScriptSource(scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, Boolean(isLiveEdit), sourceMapURL, Boolean(hasSourceURL), false, length || 0, isModule || null, stackTrace || null, codeOffset || null, scriptLanguage || null, debugSymbols || null, embedderName || null);
    }
    scriptFailedToParse({ scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, sourceMapURL, hasSourceURL, length, isModule, stackTrace, codeOffset, scriptLanguage, embedderName, }) {
        if (!this.#debuggerModel.debuggerEnabled()) {
            return;
        }
        this.#debuggerModel.parsedScriptSource(scriptId, url, startLine, startColumn, endLine, endColumn, executionContextId, hash, executionContextAuxData, false, sourceMapURL, Boolean(hasSourceURL), true, length || 0, isModule || null, stackTrace || null, codeOffset || null, scriptLanguage || null, null, embedderName || null);
    }
    breakpointResolved({ breakpointId, location }) {
        if (!this.#debuggerModel.debuggerEnabled()) {
            return;
        }
        this.#debuggerModel.breakpointResolved(breakpointId, location);
    }
}
export class Location {
    debuggerModel;
    scriptId;
    lineNumber;
    columnNumber;
    inlineFrameIndex;
    constructor(debuggerModel, scriptId, lineNumber, columnNumber, inlineFrameIndex) {
        this.debuggerModel = debuggerModel;
        this.scriptId = scriptId;
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber || 0;
        this.inlineFrameIndex = inlineFrameIndex || 0;
    }
    static fromPayload(debuggerModel, payload, inlineFrameIndex) {
        return new Location(debuggerModel, payload.scriptId, payload.lineNumber, payload.columnNumber, inlineFrameIndex);
    }
    payload() {
        return { scriptId: this.scriptId, lineNumber: this.lineNumber, columnNumber: this.columnNumber };
    }
    script() {
        return this.debuggerModel.scriptForId(this.scriptId);
    }
    continueToLocation(pausedCallback) {
        if (pausedCallback) {
            this.debuggerModel.continueToLocationCallback = this.paused.bind(this, pausedCallback);
        }
        void this.debuggerModel.agent.invoke_continueToLocation({
            location: this.payload(),
            targetCallFrames: "current" /* Protocol.Debugger.ContinueToLocationRequestTargetCallFrames.Current */,
        });
    }
    paused(pausedCallback, debuggerPausedDetails) {
        const location = debuggerPausedDetails.callFrames[0].location();
        if (location.scriptId === this.scriptId && location.lineNumber === this.lineNumber &&
            location.columnNumber === this.columnNumber) {
            pausedCallback();
            return true;
        }
        return false;
    }
    id() {
        return this.debuggerModel.target().id() + ':' + this.scriptId + ':' + this.lineNumber + ':' + this.columnNumber;
    }
}
export class BreakLocation extends Location {
    type;
    constructor(debuggerModel, scriptId, lineNumber, columnNumber, type) {
        super(debuggerModel, scriptId, lineNumber, columnNumber);
        if (type) {
            this.type = type;
        }
    }
    static fromPayload(debuggerModel, payload) {
        return new BreakLocation(debuggerModel, payload.scriptId, payload.lineNumber, payload.columnNumber, payload.type);
    }
}
export class CallFrame {
    debuggerModel;
    script;
    payload;
    #locationInternal;
    #scopeChainInternal;
    #localScopeInternal;
    inlineFrameIndex;
    functionName;
    #functionLocationInternal;
    #returnValueInternal;
    missingDebugInfoDetails;
    canBeRestarted;
    constructor(debuggerModel, script, payload, inlineFrameIndex, functionName) {
        this.debuggerModel = debuggerModel;
        this.script = script;
        this.payload = payload;
        this.#locationInternal = Location.fromPayload(debuggerModel, payload.location, inlineFrameIndex);
        this.#scopeChainInternal = [];
        this.#localScopeInternal = null;
        this.inlineFrameIndex = inlineFrameIndex || 0;
        this.functionName = functionName || payload.functionName;
        this.missingDebugInfoDetails = null;
        this.canBeRestarted = Boolean(payload.canBeRestarted);
        for (let i = 0; i < payload.scopeChain.length; ++i) {
            const scope = new Scope(this, i);
            this.#scopeChainInternal.push(scope);
            if (scope.type() === "local" /* Protocol.Debugger.ScopeType.Local */) {
                this.#localScopeInternal = scope;
            }
        }
        if (payload.functionLocation) {
            this.#functionLocationInternal = Location.fromPayload(debuggerModel, payload.functionLocation);
        }
        this.#returnValueInternal =
            payload.returnValue ? this.debuggerModel.runtimeModel().createRemoteObject(payload.returnValue) : null;
    }
    static fromPayloadArray(debuggerModel, callFrames) {
        const result = [];
        for (let i = 0; i < callFrames.length; ++i) {
            const callFrame = callFrames[i];
            const script = debuggerModel.scriptForId(callFrame.location.scriptId);
            if (script) {
                result.push(new CallFrame(debuggerModel, script, callFrame));
            }
        }
        return result;
    }
    createVirtualCallFrame(inlineFrameIndex, name) {
        return new CallFrame(this.debuggerModel, this.script, this.payload, inlineFrameIndex, name);
    }
    get id() {
        return this.payload.callFrameId;
    }
    scopeChain() {
        return this.#scopeChainInternal;
    }
    localScope() {
        return this.#localScopeInternal;
    }
    thisObject() {
        return this.payload.this ? this.debuggerModel.runtimeModel().createRemoteObject(this.payload.this) : null;
    }
    returnValue() {
        return this.#returnValueInternal;
    }
    async setReturnValue(expression) {
        if (!this.#returnValueInternal) {
            return null;
        }
        const evaluateResponse = await this.debuggerModel.agent.invoke_evaluateOnCallFrame({ callFrameId: this.id, expression: expression, silent: true, objectGroup: 'backtrace' });
        if (evaluateResponse.getError() || evaluateResponse.exceptionDetails) {
            return null;
        }
        const response = await this.debuggerModel.agent.invoke_setReturnValue({ newValue: evaluateResponse.result });
        if (response.getError()) {
            return null;
        }
        this.#returnValueInternal = this.debuggerModel.runtimeModel().createRemoteObject(evaluateResponse.result);
        return this.#returnValueInternal;
    }
    location() {
        return this.#locationInternal;
    }
    functionLocation() {
        return this.#functionLocationInternal || null;
    }
    async evaluate(options) {
        const debuggerModel = this.debuggerModel;
        const runtimeModel = debuggerModel.runtimeModel();
        // Assume backends either support both throwOnSideEffect and timeout options or neither.
        const needsTerminationOptions = Boolean(options.throwOnSideEffect) || options.timeout !== undefined;
        if (needsTerminationOptions &&
            (runtimeModel.hasSideEffectSupport() === false ||
                (runtimeModel.hasSideEffectSupport() === null && !await runtimeModel.checkSideEffectSupport()))) {
            return { error: 'Side-effect checks not supported by backend.' };
        }
        const evaluateOnCallFrameCallback = debuggerModel.getEvaluateOnCallFrameCallback();
        if (evaluateOnCallFrameCallback) {
            const result = await evaluateOnCallFrameCallback(this, options);
            if (result) {
                return result;
            }
        }
        const response = await this.debuggerModel.agent.invoke_evaluateOnCallFrame({
            callFrameId: this.id,
            expression: options.expression,
            objectGroup: options.objectGroup,
            includeCommandLineAPI: options.includeCommandLineAPI,
            silent: options.silent,
            returnByValue: options.returnByValue,
            generatePreview: options.generatePreview,
            throwOnSideEffect: options.throwOnSideEffect,
            timeout: options.timeout,
        });
        const error = response.getError();
        if (error) {
            return { error: error };
        }
        return { object: runtimeModel.createRemoteObject(response.result), exceptionDetails: response.exceptionDetails };
    }
    async restart() {
        console.assert(this.canBeRestarted, 'This frame can not be restarted.');
        // Note that even if `canBeRestarted` is true, the restart frame call can still fail.
        // The user can evaluate arbitrary code between pausing and restarting the frame that
        // could mess with the call stack.
        await this.debuggerModel.agent.invoke_restartFrame({ callFrameId: this.id, mode: "StepInto" /* Protocol.Debugger.RestartFrameRequestMode.StepInto */ });
    }
    getPayload() {
        return this.payload;
    }
}
export class Scope {
    #callFrameInternal;
    #payload;
    #typeInternal;
    #nameInternal;
    #ordinal;
    #locationRange;
    #objectInternal;
    constructor(callFrame, ordinal) {
        this.#callFrameInternal = callFrame;
        this.#payload = callFrame.getPayload().scopeChain[ordinal];
        this.#typeInternal = this.#payload.type;
        this.#nameInternal = this.#payload.name;
        this.#ordinal = ordinal;
        this.#objectInternal = null;
        const start = this.#payload.startLocation ? Location.fromPayload(callFrame.debuggerModel, this.#payload.startLocation) : null;
        const end = this.#payload.endLocation ? Location.fromPayload(callFrame.debuggerModel, this.#payload.endLocation) : null;
        if (start && end && start.scriptId === end.scriptId) {
            this.#locationRange = { start, end };
        }
        else {
            this.#locationRange = null;
        }
    }
    callFrame() {
        return this.#callFrameInternal;
    }
    type() {
        return this.#typeInternal;
    }
    typeName() {
        switch (this.#typeInternal) {
            case "local" /* Protocol.Debugger.ScopeType.Local */:
                return i18nString(UIStrings.local);
            case "closure" /* Protocol.Debugger.ScopeType.Closure */:
                return i18nString(UIStrings.closure);
            case "catch" /* Protocol.Debugger.ScopeType.Catch */:
                return i18nString(UIStrings.catchBlock);
            case "eval" /* Protocol.Debugger.ScopeType.Eval */:
                return i18n.i18n.lockedString('Eval');
            case "block" /* Protocol.Debugger.ScopeType.Block */:
                return i18nString(UIStrings.block);
            case "script" /* Protocol.Debugger.ScopeType.Script */:
                return i18nString(UIStrings.script);
            case "with" /* Protocol.Debugger.ScopeType.With */:
                return i18nString(UIStrings.withBlock);
            case "global" /* Protocol.Debugger.ScopeType.Global */:
                return i18nString(UIStrings.global);
            case "module" /* Protocol.Debugger.ScopeType.Module */:
                return i18nString(UIStrings.module);
            case "wasm-expression-stack" /* Protocol.Debugger.ScopeType.WasmExpressionStack */:
                return i18nString(UIStrings.expression);
        }
        return '';
    }
    name() {
        return this.#nameInternal;
    }
    range() {
        return this.#locationRange;
    }
    object() {
        if (this.#objectInternal) {
            return this.#objectInternal;
        }
        const runtimeModel = this.#callFrameInternal.debuggerModel.runtimeModel();
        const declarativeScope = this.#typeInternal !== "with" /* Protocol.Debugger.ScopeType.With */ &&
            this.#typeInternal !== "global" /* Protocol.Debugger.ScopeType.Global */;
        if (declarativeScope) {
            this.#objectInternal = runtimeModel.createScopeRemoteObject(this.#payload.object, new ScopeRef(this.#ordinal, this.#callFrameInternal.id));
        }
        else {
            this.#objectInternal = runtimeModel.createRemoteObject(this.#payload.object);
        }
        return this.#objectInternal;
    }
    description() {
        const declarativeScope = this.#typeInternal !== "with" /* Protocol.Debugger.ScopeType.With */ &&
            this.#typeInternal !== "global" /* Protocol.Debugger.ScopeType.Global */;
        return declarativeScope ? '' : (this.#payload.object.description || '');
    }
    icon() {
        return undefined;
    }
}
export class DebuggerPausedDetails {
    debuggerModel;
    callFrames;
    reason;
    auxData;
    breakpointIds;
    asyncStackTrace;
    asyncStackTraceId;
    constructor(debuggerModel, callFrames, reason, auxData, breakpointIds, asyncStackTrace, asyncStackTraceId) {
        this.debuggerModel = debuggerModel;
        this.callFrames = CallFrame.fromPayloadArray(debuggerModel, callFrames);
        this.reason = reason;
        this.auxData = auxData;
        this.breakpointIds = breakpointIds;
        if (asyncStackTrace) {
            this.asyncStackTrace = this.cleanRedundantFrames(asyncStackTrace);
        }
        this.asyncStackTraceId = asyncStackTraceId;
    }
    exception() {
        if (this.reason !== "exception" /* Protocol.Debugger.PausedEventReason.Exception */ &&
            this.reason !== "promiseRejection" /* Protocol.Debugger.PausedEventReason.PromiseRejection */) {
            return null;
        }
        return this.debuggerModel.runtimeModel().createRemoteObject(this.auxData);
    }
    cleanRedundantFrames(asyncStackTrace) {
        let stack = asyncStackTrace;
        let previous = null;
        while (stack) {
            if (previous && !stack.callFrames.length) {
                previous.parent = stack.parent;
            }
            else {
                previous = stack;
            }
            stack = stack.parent;
        }
        return asyncStackTrace;
    }
}
SDKModel.register(DebuggerModel, { capabilities: 4 /* Capability.JS */, autostart: true });
export const LOGPOINT_SOURCE_URL = 'debugger://logpoint';
export const COND_BREAKPOINT_SOURCE_URL = 'debugger://breakpoint';
//# sourceMappingURL=DebuggerModel.js.map