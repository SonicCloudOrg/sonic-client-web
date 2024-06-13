// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
import { CompilerScriptMapping } from './CompilerScriptMapping.js';
import { DebuggerLanguagePluginManager } from './DebuggerLanguagePlugins.js';
import { DefaultScriptMapping } from './DefaultScriptMapping.js';
import { IgnoreListManager } from './IgnoreListManager.js';
import { LiveLocationWithPool } from './LiveLocation.js';
import { NetworkProject } from './NetworkProject.js';
import { ResourceScriptMapping } from './ResourceScriptMapping.js';
let debuggerWorkspaceBindingInstance;
export class DebuggerWorkspaceBinding {
    resourceMapping;
    #sourceMappings;
    #debuggerModelToData;
    #liveLocationPromises;
    pluginManager;
    constructor(resourceMapping, targetManager) {
        this.resourceMapping = resourceMapping;
        this.#sourceMappings = [];
        this.#debuggerModelToData = new Map();
        targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, this.globalObjectCleared, this);
        targetManager.addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerResumed, this.debuggerResumed, this);
        targetManager.observeModels(SDK.DebuggerModel.DebuggerModel, this);
        this.#liveLocationPromises = new Set();
        this.pluginManager = new DebuggerLanguagePluginManager(targetManager, resourceMapping.workspace, this);
    }
    static instance(opts = { forceNew: null, resourceMapping: null, targetManager: null }) {
        const { forceNew, resourceMapping, targetManager } = opts;
        if (!debuggerWorkspaceBindingInstance || forceNew) {
            if (!resourceMapping || !targetManager) {
                throw new Error(`Unable to create DebuggerWorkspaceBinding: resourceMapping and targetManager must be provided: ${new Error().stack}`);
            }
            debuggerWorkspaceBindingInstance = new DebuggerWorkspaceBinding(resourceMapping, targetManager);
        }
        return debuggerWorkspaceBindingInstance;
    }
    static removeInstance() {
        debuggerWorkspaceBindingInstance = undefined;
    }
    addSourceMapping(sourceMapping) {
        this.#sourceMappings.push(sourceMapping);
    }
    removeSourceMapping(sourceMapping) {
        const index = this.#sourceMappings.indexOf(sourceMapping);
        if (index !== -1) {
            this.#sourceMappings.splice(index, 1);
        }
    }
    async computeAutoStepRanges(mode, callFrame) {
        function contained(location, range) {
            const { start, end } = range;
            if (start.scriptId !== location.scriptId) {
                return false;
            }
            if (location.lineNumber < start.lineNumber || location.lineNumber > end.lineNumber) {
                return false;
            }
            if (location.lineNumber === start.lineNumber && location.columnNumber < start.columnNumber) {
                return false;
            }
            if (location.lineNumber === end.lineNumber && location.columnNumber >= end.columnNumber) {
                return false;
            }
            return true;
        }
        const rawLocation = callFrame.location();
        if (!rawLocation) {
            return [];
        }
        const pluginManager = this.pluginManager;
        let ranges = [];
        if (mode === "StepOut" /* SDK.DebuggerModel.StepMode.StepOut */) {
            // Step out of inline function.
            return await pluginManager.getInlinedFunctionRanges(rawLocation);
        }
        const uiLocation = await pluginManager.rawLocationToUILocation(rawLocation);
        if (uiLocation) {
            ranges = await pluginManager.uiLocationToRawLocationRanges(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber) ||
                [];
            // TODO(bmeurer): Remove the {rawLocation} from the {ranges}?
            ranges = ranges.filter(range => contained(rawLocation, range));
            if (mode === "StepOver" /* SDK.DebuggerModel.StepMode.StepOver */) {
                // Step over an inlined function.
                ranges = ranges.concat(await pluginManager.getInlinedCalleesRanges(rawLocation));
            }
            return ranges;
        }
        const compilerMapping = this.#debuggerModelToData.get(rawLocation.debuggerModel)?.compilerMapping;
        if (!compilerMapping) {
            return [];
        }
        ranges = compilerMapping.getLocationRangesForSameSourceLocation(rawLocation);
        ranges = ranges.filter(range => contained(rawLocation, range));
        return ranges;
    }
    modelAdded(debuggerModel) {
        debuggerModel.setBeforePausedCallback(this.shouldPause.bind(this));
        this.#debuggerModelToData.set(debuggerModel, new ModelData(debuggerModel, this));
        debuggerModel.setComputeAutoStepRangesCallback(this.computeAutoStepRanges.bind(this));
    }
    modelRemoved(debuggerModel) {
        debuggerModel.setComputeAutoStepRangesCallback(null);
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        if (modelData) {
            modelData.dispose();
            this.#debuggerModelToData.delete(debuggerModel);
        }
    }
    /**
     * The promise returned by this function is resolved once all *currently*
     * pending LiveLocations are processed.
     */
    async pendingLiveLocationChangesPromise() {
        await Promise.all(this.#liveLocationPromises);
    }
    recordLiveLocationChange(promise) {
        void promise.then(() => {
            this.#liveLocationPromises.delete(promise);
        });
        this.#liveLocationPromises.add(promise);
    }
    async updateLocations(script) {
        const modelData = this.#debuggerModelToData.get(script.debuggerModel);
        if (modelData) {
            const updatePromise = modelData.updateLocations(script);
            this.recordLiveLocationChange(updatePromise);
            await updatePromise;
        }
    }
    async createLiveLocation(rawLocation, updateDelegate, locationPool) {
        const modelData = this.#debuggerModelToData.get(rawLocation.debuggerModel);
        if (!modelData) {
            return null;
        }
        const liveLocationPromise = modelData.createLiveLocation(rawLocation, updateDelegate, locationPool);
        this.recordLiveLocationChange(liveLocationPromise);
        return liveLocationPromise;
    }
    async createStackTraceTopFrameLiveLocation(rawLocations, updateDelegate, locationPool) {
        console.assert(rawLocations.length > 0);
        const locationPromise = StackTraceTopFrameLocation.createStackTraceTopFrameLocation(rawLocations, this, updateDelegate, locationPool);
        this.recordLiveLocationChange(locationPromise);
        return locationPromise;
    }
    async createCallFrameLiveLocation(location, updateDelegate, locationPool) {
        const script = location.script();
        if (!script) {
            return null;
        }
        const debuggerModel = location.debuggerModel;
        const liveLocationPromise = this.createLiveLocation(location, updateDelegate, locationPool);
        this.recordLiveLocationChange(liveLocationPromise);
        const liveLocation = await liveLocationPromise;
        if (!liveLocation) {
            return null;
        }
        this.registerCallFrameLiveLocation(debuggerModel, liveLocation);
        return liveLocation;
    }
    async rawLocationToUILocation(rawLocation) {
        for (const sourceMapping of this.#sourceMappings) {
            const uiLocation = sourceMapping.rawLocationToUILocation(rawLocation);
            if (uiLocation) {
                return uiLocation;
            }
        }
        const uiLocation = await this.pluginManager.rawLocationToUILocation(rawLocation);
        if (uiLocation) {
            return uiLocation;
        }
        const modelData = this.#debuggerModelToData.get(rawLocation.debuggerModel);
        return modelData ? modelData.rawLocationToUILocation(rawLocation) : null;
    }
    uiSourceCodeForSourceMapSourceURL(debuggerModel, url, isContentScript) {
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        if (!modelData) {
            return null;
        }
        return modelData.compilerMapping.uiSourceCodeForURL(url, isContentScript);
    }
    async uiSourceCodeForSourceMapSourceURLPromise(debuggerModel, url, isContentScript) {
        const uiSourceCode = this.uiSourceCodeForSourceMapSourceURL(debuggerModel, url, isContentScript);
        return uiSourceCode || this.waitForUISourceCodeAdded(url, debuggerModel.target());
    }
    async uiSourceCodeForDebuggerLanguagePluginSourceURLPromise(debuggerModel, url) {
        const uiSourceCode = this.pluginManager.uiSourceCodeForURL(debuggerModel, url);
        return uiSourceCode || this.waitForUISourceCodeAdded(url, debuggerModel.target());
    }
    uiSourceCodeForScript(script) {
        const modelData = this.#debuggerModelToData.get(script.debuggerModel);
        if (!modelData) {
            return null;
        }
        return modelData.uiSourceCodeForScript(script);
    }
    waitForUISourceCodeAdded(url, target) {
        return new Promise(resolve => {
            const workspace = Workspace.Workspace.WorkspaceImpl.instance();
            const descriptor = workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, event => {
                const uiSourceCode = event.data;
                if (uiSourceCode.url() === url && NetworkProject.targetForUISourceCode(uiSourceCode) === target) {
                    workspace.removeEventListener(Workspace.Workspace.Events.UISourceCodeAdded, descriptor.listener);
                    resolve(uiSourceCode);
                }
            });
        });
    }
    async uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber) {
        for (const sourceMapping of this.#sourceMappings) {
            const locations = sourceMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
            if (locations.length) {
                return locations;
            }
        }
        const locations = await this.pluginManager.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        if (locations) {
            return locations;
        }
        for (const modelData of this.#debuggerModelToData.values()) {
            const locations = modelData.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
            if (locations.length) {
                return locations;
            }
        }
        return [];
    }
    /**
     * Computes all the raw location ranges that intersect with the {@link textRange} in the given
     * {@link uiSourceCode}. The reverse mappings of the returned ranges must not be fully contained
     * with the {@link textRange} and it's the responsibility of the caller to appropriately filter or
     * clamp if desired.
     *
     * It's important to note that for a contiguous range in the {@link uiSourceCode} there can be a
     * variety of non-contiguous raw location ranges that intersect with the {@link textRange}. A
     * simple example is that of an HTML document with multiple inline `<script>`s in the same line,
     * so just asking for the raw locations in this single line will return a set of location ranges
     * in different scripts.
     *
     * This method returns an empty array if this {@link uiSourceCode} is not provided by any of the
     * mappings for this instance.
     *
     * @param uiSourceCode the {@link UISourceCode} to which the {@link textRange} belongs.
     * @param textRange the text range in terms of the UI.
     * @returns the list of raw location ranges that intersect with the text range or `[]` if
     *          the {@link uiSourceCode} does not belong to this instance.
     */
    async uiLocationRangeToRawLocationRanges(uiSourceCode, textRange) {
        for (const sourceMapping of this.#sourceMappings) {
            const ranges = sourceMapping.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
            if (ranges) {
                return ranges;
            }
        }
        const ranges = await this.pluginManager.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
        if (ranges) {
            return ranges;
        }
        for (const modelData of this.#debuggerModelToData.values()) {
            const ranges = modelData.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
            if (ranges) {
                return ranges;
            }
        }
        return [];
    }
    uiLocationToRawLocationsForUnformattedJavaScript(uiSourceCode, lineNumber, columnNumber) {
        console.assert(uiSourceCode.contentType().isScript());
        const locations = [];
        for (const modelData of this.#debuggerModelToData.values()) {
            locations.push(...modelData.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber));
        }
        return locations;
    }
    async normalizeUILocation(uiLocation) {
        const rawLocations = await this.uiLocationToRawLocations(uiLocation.uiSourceCode, uiLocation.lineNumber, uiLocation.columnNumber);
        for (const location of rawLocations) {
            const uiLocationCandidate = await this.rawLocationToUILocation(location);
            if (uiLocationCandidate) {
                return uiLocationCandidate;
            }
        }
        return uiLocation;
    }
    /**
     * Computes the set of lines in the {@link uiSourceCode} that map to scripts by either looking at
     * the debug info (if any) or checking for inline scripts within documents. If this set cannot be
     * computed or all the lines in the {@link uiSourceCode} correspond to lines in a script, `null`
     * is returned here.
     *
     * @param uiSourceCode the source entity.
     * @returns a set of known mapped lines for {@link uiSourceCode} or `null` if it's impossible to
     *          determine the set or the {@link uiSourceCode} does not map to or include any scripts.
     */
    async getMappedLines(uiSourceCode) {
        for (const modelData of this.#debuggerModelToData.values()) {
            const mappedLines = modelData.getMappedLines(uiSourceCode);
            if (mappedLines !== null) {
                return mappedLines;
            }
        }
        return await this.pluginManager.getMappedLines(uiSourceCode);
    }
    scriptFile(uiSourceCode, debuggerModel) {
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        return modelData ? modelData.getResourceScriptMapping().scriptFile(uiSourceCode) : null;
    }
    scriptsForUISourceCode(uiSourceCode) {
        const scripts = new Set();
        this.pluginManager.scriptsForUISourceCode(uiSourceCode).forEach(script => scripts.add(script));
        for (const modelData of this.#debuggerModelToData.values()) {
            const resourceScriptFile = modelData.getResourceScriptMapping().scriptFile(uiSourceCode);
            if (resourceScriptFile && resourceScriptFile.script) {
                scripts.add(resourceScriptFile.script);
            }
            modelData.compilerMapping.scriptsForUISourceCode(uiSourceCode).forEach(script => scripts.add(script));
        }
        return [...scripts];
    }
    supportsConditionalBreakpoints(uiSourceCode) {
        const scripts = this.pluginManager.scriptsForUISourceCode(uiSourceCode);
        return scripts.every(script => script.isJavaScript());
    }
    globalObjectCleared(event) {
        this.reset(event.data);
    }
    reset(debuggerModel) {
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        if (!modelData) {
            return;
        }
        for (const location of modelData.callFrameLocations.values()) {
            this.removeLiveLocation(location);
        }
        modelData.callFrameLocations.clear();
    }
    resetForTest(target) {
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        if (modelData) {
            modelData.getResourceScriptMapping().resetForTest();
        }
    }
    registerCallFrameLiveLocation(debuggerModel, location) {
        const modelData = this.#debuggerModelToData.get(debuggerModel);
        if (modelData) {
            const locations = modelData.callFrameLocations;
            locations.add(location);
        }
    }
    removeLiveLocation(location) {
        const modelData = this.#debuggerModelToData.get(location.rawLocation.debuggerModel);
        if (modelData) {
            modelData.disposeLocation(location);
        }
    }
    debuggerResumed(event) {
        this.reset(event.data);
    }
    async shouldPause(debuggerPausedDetails, autoSteppingContext) {
        // This function returns false if the debugger should continue stepping
        const { callFrames: [frame] } = debuggerPausedDetails;
        if (!frame) {
            return false;
        }
        const functionLocation = frame.functionLocation();
        if (!autoSteppingContext || debuggerPausedDetails.reason !== "step" /* Protocol.Debugger.PausedEventReason.Step */ ||
            !functionLocation || !frame.script.isWasm() || !Common.Settings.moduleSetting('wasm-auto-stepping').get() ||
            !this.pluginManager.hasPluginForScript(frame.script)) {
            return true;
        }
        const uiLocation = await this.pluginManager.rawLocationToUILocation(frame.location());
        if (uiLocation) {
            return true;
        }
        return autoSteppingContext.script() !== functionLocation.script() ||
            autoSteppingContext.columnNumber !== functionLocation.columnNumber ||
            autoSteppingContext.lineNumber !== functionLocation.lineNumber;
    }
}
class ModelData {
    #debuggerModel;
    #debuggerWorkspaceBinding;
    callFrameLocations;
    #defaultMapping;
    #resourceMapping;
    #resourceScriptMapping;
    compilerMapping;
    #locations;
    constructor(debuggerModel, debuggerWorkspaceBinding) {
        this.#debuggerModel = debuggerModel;
        this.#debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        this.callFrameLocations = new Set();
        const { workspace } = debuggerWorkspaceBinding.resourceMapping;
        this.#defaultMapping = new DefaultScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this.#resourceMapping = debuggerWorkspaceBinding.resourceMapping;
        this.#resourceScriptMapping = new ResourceScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this.compilerMapping = new CompilerScriptMapping(debuggerModel, workspace, debuggerWorkspaceBinding);
        this.#locations = new Platform.MapUtilities.Multimap();
    }
    async createLiveLocation(rawLocation, updateDelegate, locationPool) {
        console.assert(rawLocation.scriptId !== '');
        const scriptId = rawLocation.scriptId;
        const location = new Location(scriptId, rawLocation, this.#debuggerWorkspaceBinding, updateDelegate, locationPool);
        this.#locations.set(scriptId, location);
        await location.update();
        return location;
    }
    disposeLocation(location) {
        this.#locations.delete(location.scriptId, location);
    }
    async updateLocations(script) {
        const promises = [];
        for (const location of this.#locations.get(script.scriptId)) {
            promises.push(location.update());
        }
        await Promise.all(promises);
    }
    rawLocationToUILocation(rawLocation) {
        let uiLocation = this.compilerMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this.#resourceScriptMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this.#resourceMapping.jsLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this.#defaultMapping.rawLocationToUILocation(rawLocation);
        return uiLocation;
    }
    uiSourceCodeForScript(script) {
        let uiSourceCode = null;
        uiSourceCode = uiSourceCode || this.#resourceScriptMapping.uiSourceCodeForScript(script);
        uiSourceCode = uiSourceCode || this.#resourceMapping.uiSourceCodeForScript(script);
        uiSourceCode = uiSourceCode || this.#defaultMapping.uiSourceCodeForScript(script);
        return uiSourceCode;
    }
    uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber = 0) {
        // TODO(crbug.com/1153123): Revisit the `#columnNumber = 0` and also preserve `undefined` for source maps?
        let locations = this.compilerMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            this.#resourceScriptMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            this.#resourceMapping.uiLocationToJSLocations(uiSourceCode, lineNumber, columnNumber);
        locations = locations.length ?
            locations :
            this.#defaultMapping.uiLocationToRawLocations(uiSourceCode, lineNumber, columnNumber);
        return locations;
    }
    uiLocationRangeToRawLocationRanges(uiSourceCode, textRange) {
        let ranges = this.compilerMapping.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
        ranges ??= this.#resourceScriptMapping.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
        ranges ??= this.#resourceMapping.uiLocationRangeToJSLocationRanges(uiSourceCode, textRange);
        ranges ??= this.#defaultMapping.uiLocationRangeToRawLocationRanges(uiSourceCode, textRange);
        return ranges;
    }
    getMappedLines(uiSourceCode) {
        const mappedLines = this.compilerMapping.getMappedLines(uiSourceCode);
        // TODO(crbug.com/1411431): The scripts from the ResourceMapping appear over time,
        // and there's currently no way to inform the UI to update.
        // mappedLines = mappedLines ?? this.#resourceMapping.getMappedLines(uiSourceCode);
        return mappedLines;
    }
    dispose() {
        this.#debuggerModel.setBeforePausedCallback(null);
        this.compilerMapping.dispose();
        this.#resourceScriptMapping.dispose();
        this.#defaultMapping.dispose();
    }
    getResourceScriptMapping() {
        return this.#resourceScriptMapping;
    }
}
export class Location extends LiveLocationWithPool {
    scriptId;
    rawLocation;
    #binding;
    constructor(scriptId, rawLocation, binding, updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this.scriptId = scriptId;
        this.rawLocation = rawLocation;
        this.#binding = binding;
    }
    async uiLocation() {
        const debuggerModelLocation = this.rawLocation;
        return this.#binding.rawLocationToUILocation(debuggerModelLocation);
    }
    dispose() {
        super.dispose();
        this.#binding.removeLiveLocation(this);
    }
    async isIgnoreListed() {
        const uiLocation = await this.uiLocation();
        if (!uiLocation) {
            return false;
        }
        return IgnoreListManager.instance().isUserOrSourceMapIgnoreListedUISourceCode(uiLocation.uiSourceCode);
    }
}
class StackTraceTopFrameLocation extends LiveLocationWithPool {
    #updateScheduled;
    #current;
    #locations;
    constructor(updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this.#updateScheduled = true;
        this.#current = null;
        this.#locations = null;
    }
    static async createStackTraceTopFrameLocation(rawLocations, binding, updateDelegate, locationPool) {
        const location = new StackTraceTopFrameLocation(updateDelegate, locationPool);
        const locationsPromises = rawLocations.map(rawLocation => binding.createLiveLocation(rawLocation, location.scheduleUpdate.bind(location), locationPool));
        location.#locations = (await Promise.all(locationsPromises)).filter(l => Boolean(l));
        await location.updateLocation();
        return location;
    }
    async uiLocation() {
        return this.#current ? this.#current.uiLocation() : null;
    }
    async isIgnoreListed() {
        return this.#current ? this.#current.isIgnoreListed() : false;
    }
    dispose() {
        super.dispose();
        if (this.#locations) {
            for (const location of this.#locations) {
                location.dispose();
            }
        }
        this.#locations = null;
        this.#current = null;
    }
    async scheduleUpdate() {
        if (this.#updateScheduled) {
            return;
        }
        this.#updateScheduled = true;
        queueMicrotask(() => {
            void this.updateLocation();
        });
    }
    async updateLocation() {
        this.#updateScheduled = false;
        if (!this.#locations || this.#locations.length === 0) {
            return;
        }
        this.#current = this.#locations[0];
        for (const location of this.#locations) {
            if (!(await location.isIgnoreListed())) {
                this.#current = location;
                break;
            }
        }
        void this.update();
    }
}
//# sourceMappingURL=DebuggerWorkspaceBinding.js.map