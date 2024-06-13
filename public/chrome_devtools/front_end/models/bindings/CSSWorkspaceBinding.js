// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import { LiveLocationWithPool, } from './LiveLocation.js';
import { SASSSourceMapping } from './SASSSourceMapping.js';
import { StylesSourceMapping } from './StylesSourceMapping.js';
let cssWorkspaceBindingInstance;
export class CSSWorkspaceBinding {
    #resourceMapping;
    #modelToInfo;
    #liveLocationPromises;
    constructor(resourceMapping, targetManager) {
        this.#resourceMapping = resourceMapping;
        this.#modelToInfo = new Map();
        targetManager.observeModels(SDK.CSSModel.CSSModel, this);
        this.#liveLocationPromises = new Set();
    }
    static instance(opts = { forceNew: null, resourceMapping: null, targetManager: null }) {
        const { forceNew, resourceMapping, targetManager } = opts;
        if (!cssWorkspaceBindingInstance || forceNew) {
            if (!resourceMapping || !targetManager) {
                throw new Error(`Unable to create CSSWorkspaceBinding: resourceMapping and targetManager must be provided: ${new Error().stack}`);
            }
            cssWorkspaceBindingInstance = new CSSWorkspaceBinding(resourceMapping, targetManager);
        }
        return cssWorkspaceBindingInstance;
    }
    static removeInstance() {
        cssWorkspaceBindingInstance = undefined;
    }
    get modelToInfo() {
        return this.#modelToInfo;
    }
    getCSSModelInfo(cssModel) {
        return this.#modelToInfo.get(cssModel);
    }
    modelAdded(cssModel) {
        this.#modelToInfo.set(cssModel, new ModelInfo(cssModel, this.#resourceMapping));
    }
    modelRemoved(cssModel) {
        this.getCSSModelInfo(cssModel).dispose();
        this.#modelToInfo.delete(cssModel);
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
    async updateLocations(header) {
        const updatePromise = this.getCSSModelInfo(header.cssModel()).updateLocations(header);
        this.recordLiveLocationChange(updatePromise);
        await updatePromise;
    }
    createLiveLocation(rawLocation, updateDelegate, locationPool) {
        const locationPromise = this.getCSSModelInfo(rawLocation.cssModel()).createLiveLocation(rawLocation, updateDelegate, locationPool);
        this.recordLiveLocationChange(locationPromise);
        return locationPromise;
    }
    propertyRawLocation(cssProperty, forName) {
        const style = cssProperty.ownerStyle;
        if (!style || style.type !== SDK.CSSStyleDeclaration.Type.Regular || !style.styleSheetId) {
            return null;
        }
        const header = style.cssModel().styleSheetHeaderForId(style.styleSheetId);
        if (!header) {
            return null;
        }
        const range = forName ? cssProperty.nameRange() : cssProperty.valueRange();
        if (!range) {
            return null;
        }
        const lineNumber = range.startLine;
        const columnNumber = range.startColumn;
        return new SDK.CSSModel.CSSLocation(header, header.lineNumberInSource(lineNumber), header.columnNumberInSource(lineNumber, columnNumber));
    }
    propertyUILocation(cssProperty, forName) {
        const rawLocation = this.propertyRawLocation(cssProperty, forName);
        if (!rawLocation) {
            return null;
        }
        return this.rawLocationToUILocation(rawLocation);
    }
    rawLocationToUILocation(rawLocation) {
        return this.getCSSModelInfo(rawLocation.cssModel()).rawLocationToUILocation(rawLocation);
    }
    uiLocationToRawLocations(uiLocation) {
        const rawLocations = [];
        for (const modelInfo of this.#modelToInfo.values()) {
            rawLocations.push(...modelInfo.uiLocationToRawLocations(uiLocation));
        }
        return rawLocations;
    }
}
export class ModelInfo {
    #eventListeners;
    #resourceMapping;
    #stylesSourceMapping;
    #sassSourceMapping;
    #locations;
    #unboundLocations;
    constructor(cssModel, resourceMapping) {
        this.#eventListeners = [
            cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetAdded, event => {
                void this.styleSheetAdded(event);
            }, this),
            cssModel.addEventListener(SDK.CSSModel.Events.StyleSheetRemoved, event => {
                void this.styleSheetRemoved(event);
            }, this),
        ];
        this.#resourceMapping = resourceMapping;
        this.#stylesSourceMapping = new StylesSourceMapping(cssModel, resourceMapping.workspace);
        const sourceMapManager = cssModel.sourceMapManager();
        this.#sassSourceMapping = new SASSSourceMapping(cssModel.target(), sourceMapManager, resourceMapping.workspace);
        this.#locations = new Platform.MapUtilities.Multimap();
        this.#unboundLocations = new Platform.MapUtilities.Multimap();
    }
    get locations() {
        return this.#locations;
    }
    async createLiveLocation(rawLocation, updateDelegate, locationPool) {
        const location = new LiveLocation(rawLocation, this, updateDelegate, locationPool);
        const header = rawLocation.header();
        if (header) {
            location.setHeader(header);
            this.#locations.set(header, location);
            await location.update();
        }
        else {
            this.#unboundLocations.set(rawLocation.url, location);
        }
        return location;
    }
    disposeLocation(location) {
        const header = location.header();
        if (header) {
            this.#locations.delete(header, location);
        }
        else {
            this.#unboundLocations.delete(location.url, location);
        }
    }
    updateLocations(header) {
        const promises = [];
        for (const location of this.#locations.get(header)) {
            promises.push(location.update());
        }
        return Promise.all(promises);
    }
    async styleSheetAdded(event) {
        const header = event.data;
        if (!header.sourceURL) {
            return;
        }
        const promises = [];
        for (const location of this.#unboundLocations.get(header.sourceURL)) {
            location.setHeader(header);
            this.#locations.set(header, location);
            promises.push(location.update());
        }
        await Promise.all(promises);
        this.#unboundLocations.deleteAll(header.sourceURL);
    }
    async styleSheetRemoved(event) {
        const header = event.data;
        const promises = [];
        for (const location of this.#locations.get(header)) {
            location.setHeader(header);
            this.#unboundLocations.set(location.url, location);
            promises.push(location.update());
        }
        await Promise.all(promises);
        this.#locations.deleteAll(header);
    }
    addSourceMap(sourceUrl, sourceMapUrl) {
        this.#stylesSourceMapping.addSourceMap(sourceUrl, sourceMapUrl);
    }
    rawLocationToUILocation(rawLocation) {
        let uiLocation = null;
        uiLocation = uiLocation || this.#sassSourceMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this.#stylesSourceMapping.rawLocationToUILocation(rawLocation);
        uiLocation = uiLocation || this.#resourceMapping.cssLocationToUILocation(rawLocation);
        return uiLocation;
    }
    uiLocationToRawLocations(uiLocation) {
        let rawLocations = this.#sassSourceMapping.uiLocationToRawLocations(uiLocation);
        if (rawLocations.length) {
            return rawLocations;
        }
        rawLocations = this.#stylesSourceMapping.uiLocationToRawLocations(uiLocation);
        if (rawLocations.length) {
            return rawLocations;
        }
        return this.#resourceMapping.uiLocationToCSSLocations(uiLocation);
    }
    dispose() {
        Common.EventTarget.removeEventListeners(this.#eventListeners);
        this.#stylesSourceMapping.dispose();
        this.#sassSourceMapping.dispose();
    }
}
export class LiveLocation extends LiveLocationWithPool {
    url;
    #lineNumber;
    #columnNumber;
    #info;
    headerInternal;
    constructor(rawLocation, info, updateDelegate, locationPool) {
        super(updateDelegate, locationPool);
        this.url = rawLocation.url;
        this.#lineNumber = rawLocation.lineNumber;
        this.#columnNumber = rawLocation.columnNumber;
        this.#info = info;
        this.headerInternal = null;
    }
    header() {
        return this.headerInternal;
    }
    setHeader(header) {
        this.headerInternal = header;
    }
    async uiLocation() {
        if (!this.headerInternal) {
            return null;
        }
        const rawLocation = new SDK.CSSModel.CSSLocation(this.headerInternal, this.#lineNumber, this.#columnNumber);
        return CSSWorkspaceBinding.instance().rawLocationToUILocation(rawLocation);
    }
    dispose() {
        super.dispose();
        this.#info.disposeLocation(this);
    }
    async isIgnoreListed() {
        return false;
    }
}
//# sourceMappingURL=CSSWorkspaceBinding.js.map