// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../workspace/workspace.js';
const UIStrings = {
    /**
     *@description Text to stop preventing the debugger from stepping into library code
     */
    removeFromIgnoreList: 'Remove from ignore list',
    /**
     *@description Text for scripts that should not be stepped into when debugging
     */
    addScriptToIgnoreList: 'Add script to ignore list',
    /**
     *@description Text for directories whose scripts should not be stepped into when debugging
     */
    addDirectoryToIgnoreList: 'Add directory to ignore list',
    /**
     *@description A context menu item in the Call Stack Sidebar Pane of the Sources panel
     */
    addAllContentScriptsToIgnoreList: 'Add all extension scripts to ignore list',
    /**
     *@description A context menu item in the Call Stack Sidebar Pane of the Sources panel
     */
    addAllThirdPartyScriptsToIgnoreList: 'Add all third-party scripts to ignore list',
};
const str_ = i18n.i18n.registerUIStrings('models/bindings/IgnoreListManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let ignoreListManagerInstance;
export class IgnoreListManager {
    #debuggerWorkspaceBinding;
    #listeners;
    #isIgnoreListedURLCache;
    constructor(debuggerWorkspaceBinding) {
        this.#debuggerWorkspaceBinding = debuggerWorkspaceBinding;
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, this.clearCacheIfNeeded.bind(this), this);
        Common.Settings.Settings.instance()
            .moduleSetting('skip-stack-frames-pattern')
            .addChangeListener(this.patternChanged.bind(this));
        Common.Settings.Settings.instance()
            .moduleSetting('skip-content-scripts')
            .addChangeListener(this.patternChanged.bind(this));
        Common.Settings.Settings.instance()
            .moduleSetting('automatically-ignore-list-known-third-party-scripts')
            .addChangeListener(this.patternChanged.bind(this));
        Common.Settings.Settings.instance()
            .moduleSetting('enable-ignore-listing')
            .addChangeListener(this.patternChanged.bind(this));
        this.#listeners = new Set();
        this.#isIgnoreListedURLCache = new Map();
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel, this);
    }
    static instance(opts = { forceNew: null, debuggerWorkspaceBinding: null }) {
        const { forceNew, debuggerWorkspaceBinding } = opts;
        if (!ignoreListManagerInstance || forceNew) {
            if (!debuggerWorkspaceBinding) {
                throw new Error(`Unable to create settings: debuggerWorkspaceBinding must be provided: ${new Error().stack}`);
            }
            ignoreListManagerInstance = new IgnoreListManager(debuggerWorkspaceBinding);
        }
        return ignoreListManagerInstance;
    }
    static removeInstance() {
        ignoreListManagerInstance = undefined;
    }
    addChangeListener(listener) {
        this.#listeners.add(listener);
    }
    removeChangeListener(listener) {
        this.#listeners.delete(listener);
    }
    modelAdded(debuggerModel) {
        void this.setIgnoreListPatterns(debuggerModel);
        const sourceMapManager = debuggerModel.sourceMapManager();
        sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapAttached, this.sourceMapAttached, this);
        sourceMapManager.addEventListener(SDK.SourceMapManager.Events.SourceMapDetached, this.sourceMapDetached, this);
    }
    modelRemoved(debuggerModel) {
        this.clearCacheIfNeeded();
        const sourceMapManager = debuggerModel.sourceMapManager();
        sourceMapManager.removeEventListener(SDK.SourceMapManager.Events.SourceMapAttached, this.sourceMapAttached, this);
        sourceMapManager.removeEventListener(SDK.SourceMapManager.Events.SourceMapDetached, this.sourceMapDetached, this);
    }
    clearCacheIfNeeded() {
        if (this.#isIgnoreListedURLCache.size > 1024) {
            this.#isIgnoreListedURLCache.clear();
        }
    }
    getSkipStackFramesPatternSetting() {
        return Common.Settings.Settings.instance().moduleSetting('skip-stack-frames-pattern');
    }
    setIgnoreListPatterns(debuggerModel) {
        const regexPatterns = this.enableIgnoreListing ? this.getSkipStackFramesPatternSetting().getAsArray() : [];
        const patterns = [];
        for (const item of regexPatterns) {
            if (!item.disabled && item.pattern) {
                patterns.push(item.pattern);
            }
        }
        return debuggerModel.setBlackboxPatterns(patterns);
    }
    getGeneralRulesForUISourceCode(uiSourceCode) {
        const projectType = uiSourceCode.project().type();
        const isContentScript = projectType === Workspace.Workspace.projectTypes.ContentScripts;
        const isKnownThirdParty = uiSourceCode.isKnownThirdParty();
        return { isContentScript, isKnownThirdParty };
    }
    isUserOrSourceMapIgnoreListedUISourceCode(uiSourceCode) {
        if (uiSourceCode.isUnconditionallyIgnoreListed()) {
            return true;
        }
        const url = this.uiSourceCodeURL(uiSourceCode);
        return this.isUserIgnoreListedURL(url, this.getGeneralRulesForUISourceCode(uiSourceCode));
    }
    isUserIgnoreListedURL(url, options) {
        if (!this.enableIgnoreListing) {
            return false;
        }
        if (options?.isContentScript && this.skipContentScripts) {
            return true;
        }
        if (options?.isKnownThirdParty && this.automaticallyIgnoreListKnownThirdPartyScripts) {
            return true;
        }
        if (!url) {
            return false;
        }
        if (this.#isIgnoreListedURLCache.has(url)) {
            return Boolean(this.#isIgnoreListedURLCache.get(url));
        }
        const regex = this.getSkipStackFramesPatternSetting().asRegExp();
        const isIgnoreListed = (regex && regex.test(url)) || false;
        this.#isIgnoreListedURLCache.set(url, isIgnoreListed);
        return isIgnoreListed;
    }
    sourceMapAttached(event) {
        const script = event.data.client;
        const sourceMap = event.data.sourceMap;
        void this.updateScriptRanges(script, sourceMap);
    }
    sourceMapDetached(event) {
        const script = event.data.client;
        void this.updateScriptRanges(script, undefined);
    }
    async updateScriptRanges(script, sourceMap) {
        let hasIgnoreListedMappings = false;
        if (!IgnoreListManager.instance().isUserIgnoreListedURL(script.sourceURL, { isContentScript: script.isContentScript() })) {
            hasIgnoreListedMappings =
                sourceMap?.sourceURLs().some(url => this.isUserIgnoreListedURL(url, { isKnownThirdParty: sourceMap.hasIgnoreListHint(url) })) ??
                    false;
        }
        if (!hasIgnoreListedMappings) {
            if (scriptToRange.get(script) && await script.setBlackboxedRanges([])) {
                scriptToRange.delete(script);
            }
            await this.#debuggerWorkspaceBinding.updateLocations(script);
            return;
        }
        if (!sourceMap) {
            return;
        }
        const newRanges = sourceMap
            .findRanges(srcURL => this.isUserIgnoreListedURL(srcURL, { isKnownThirdParty: sourceMap.hasIgnoreListHint(srcURL) }), { isStartMatching: true })
            .flatMap(range => [range.start, range.end]);
        const oldRanges = scriptToRange.get(script) || [];
        if (!isEqual(oldRanges, newRanges) && await script.setBlackboxedRanges(newRanges)) {
            scriptToRange.set(script, newRanges);
        }
        void this.#debuggerWorkspaceBinding.updateLocations(script);
        function isEqual(rangesA, rangesB) {
            if (rangesA.length !== rangesB.length) {
                return false;
            }
            for (let i = 0; i < rangesA.length; ++i) {
                if (rangesA[i].lineNumber !== rangesB[i].lineNumber || rangesA[i].columnNumber !== rangesB[i].columnNumber) {
                    return false;
                }
            }
            return true;
        }
    }
    uiSourceCodeURL(uiSourceCode) {
        return uiSourceCode.project().type() === Workspace.Workspace.projectTypes.Debugger ? null : uiSourceCode.url();
    }
    canIgnoreListUISourceCode(uiSourceCode) {
        const url = this.uiSourceCodeURL(uiSourceCode);
        return url ? Boolean(this.urlToRegExpString(url)) : false;
    }
    ignoreListUISourceCode(uiSourceCode) {
        const url = this.uiSourceCodeURL(uiSourceCode);
        if (url) {
            this.ignoreListURL(url);
        }
    }
    unIgnoreListUISourceCode(uiSourceCode) {
        this.unIgnoreListURL(this.uiSourceCodeURL(uiSourceCode), this.getGeneralRulesForUISourceCode(uiSourceCode));
    }
    get enableIgnoreListing() {
        return Common.Settings.Settings.instance().moduleSetting('enable-ignore-listing').get();
    }
    set enableIgnoreListing(value) {
        Common.Settings.Settings.instance().moduleSetting('enable-ignore-listing').set(value);
    }
    get skipContentScripts() {
        return this.enableIgnoreListing && Common.Settings.Settings.instance().moduleSetting('skip-content-scripts').get();
    }
    get automaticallyIgnoreListKnownThirdPartyScripts() {
        return this.enableIgnoreListing &&
            Common.Settings.Settings.instance().moduleSetting('automatically-ignore-list-known-third-party-scripts').get();
    }
    ignoreListContentScripts() {
        if (!this.enableIgnoreListing) {
            this.enableIgnoreListing = true;
        }
        Common.Settings.Settings.instance().moduleSetting('skip-content-scripts').set(true);
    }
    unIgnoreListContentScripts() {
        Common.Settings.Settings.instance().moduleSetting('skip-content-scripts').set(false);
    }
    ignoreListThirdParty() {
        if (!this.enableIgnoreListing) {
            this.enableIgnoreListing = true;
        }
        Common.Settings.Settings.instance().moduleSetting('automatically-ignore-list-known-third-party-scripts').set(true);
    }
    unIgnoreListThirdParty() {
        Common.Settings.Settings.instance().moduleSetting('automatically-ignore-list-known-third-party-scripts').set(false);
    }
    ignoreListURL(url) {
        const regexValue = this.urlToRegExpString(url);
        if (!regexValue) {
            return;
        }
        this.ignoreListRegex(regexValue, url);
    }
    ignoreListRegex(regexValue, disabledForUrl) {
        const regexPatterns = this.getSkipStackFramesPatternSetting().getAsArray();
        let found = false;
        for (let i = 0; i < regexPatterns.length; ++i) {
            const item = regexPatterns[i];
            if (item.pattern === regexValue || (disabledForUrl && item.disabledForUrl === disabledForUrl)) {
                item.disabled = false;
                item.disabledForUrl = undefined;
                found = true;
            }
        }
        if (!found) {
            regexPatterns.push({ pattern: regexValue, disabled: false });
        }
        if (!this.enableIgnoreListing) {
            this.enableIgnoreListing = true;
        }
        this.getSkipStackFramesPatternSetting().setAsArray(regexPatterns);
    }
    unIgnoreListURL(url, options) {
        if (options?.isContentScript) {
            this.unIgnoreListContentScripts();
        }
        if (options?.isKnownThirdParty) {
            this.unIgnoreListThirdParty();
        }
        if (!url) {
            return;
        }
        let regexPatterns = this.getSkipStackFramesPatternSetting().getAsArray();
        const regexValue = IgnoreListManager.instance().urlToRegExpString(url);
        if (!regexValue) {
            return;
        }
        regexPatterns = regexPatterns.filter(function (item) {
            return item.pattern !== regexValue;
        });
        for (let i = 0; i < regexPatterns.length; ++i) {
            const item = regexPatterns[i];
            if (item.disabled) {
                continue;
            }
            try {
                const regex = new RegExp(item.pattern);
                if (regex.test(url)) {
                    item.disabled = true;
                    item.disabledForUrl = url;
                }
            }
            catch (e) {
            }
        }
        this.getSkipStackFramesPatternSetting().setAsArray(regexPatterns);
    }
    removeIgnoreListPattern(regexValue) {
        let regexPatterns = this.getSkipStackFramesPatternSetting().getAsArray();
        regexPatterns = regexPatterns.filter(function (item) {
            return item.pattern !== regexValue;
        });
        this.getSkipStackFramesPatternSetting().setAsArray(regexPatterns);
    }
    ignoreListHasPattern(regexValue, enabledOnly) {
        const regexPatterns = this.getSkipStackFramesPatternSetting().getAsArray();
        return regexPatterns.some(item => !(enabledOnly && item.disabled) && item.pattern === regexValue);
    }
    async patternChanged() {
        this.#isIgnoreListedURLCache.clear();
        const promises = [];
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            promises.push(this.setIgnoreListPatterns(debuggerModel));
            const sourceMapManager = debuggerModel.sourceMapManager();
            for (const script of debuggerModel.scripts()) {
                promises.push(this.updateScriptRanges(script, sourceMapManager.sourceMapForClient(script)));
            }
        }
        await Promise.all(promises);
        const listeners = Array.from(this.#listeners);
        for (const listener of listeners) {
            listener();
        }
        this.patternChangeFinishedForTests();
    }
    patternChangeFinishedForTests() {
        // This method is sniffed in tests.
    }
    urlToRegExpString(url) {
        const parsedURL = new Common.ParsedURL.ParsedURL(url);
        if (parsedURL.isAboutBlank() || parsedURL.isDataURL()) {
            return '';
        }
        if (!parsedURL.isValid) {
            return '^' + Platform.StringUtilities.escapeForRegExp(url) + '$';
        }
        let name = parsedURL.lastPathComponent;
        if (name) {
            name = '/' + name;
        }
        else if (parsedURL.folderPathComponents) {
            name = parsedURL.folderPathComponents + '/';
        }
        if (!name) {
            name = parsedURL.host;
        }
        if (!name) {
            return '';
        }
        const scheme = parsedURL.scheme;
        let prefix = '';
        if (scheme && scheme !== 'http' && scheme !== 'https') {
            prefix = '^' + scheme + '://';
            if (scheme === 'chrome-extension') {
                prefix += parsedURL.host + '\\b';
            }
            prefix += '.*';
        }
        return prefix + Platform.StringUtilities.escapeForRegExp(name) + (url.endsWith(name) ? '$' : '\\b');
    }
    getIgnoreListURLContextMenuItems(uiSourceCode) {
        if (uiSourceCode.project().type() === Workspace.Workspace.projectTypes.FileSystem) {
            return [];
        }
        const menuItems = [];
        const canIgnoreList = this.canIgnoreListUISourceCode(uiSourceCode);
        const isIgnoreListed = this.isUserOrSourceMapIgnoreListedUISourceCode(uiSourceCode);
        const { isContentScript, isKnownThirdParty } = this.getGeneralRulesForUISourceCode(uiSourceCode);
        if (isIgnoreListed) {
            if (canIgnoreList || isContentScript || isKnownThirdParty) {
                menuItems.push({
                    text: i18nString(UIStrings.removeFromIgnoreList),
                    callback: this.unIgnoreListUISourceCode.bind(this, uiSourceCode),
                    jslogContext: 'remove-script-from-ignorelist',
                });
            }
        }
        else {
            if (canIgnoreList) {
                menuItems.push({
                    text: i18nString(UIStrings.addScriptToIgnoreList),
                    callback: this.ignoreListUISourceCode.bind(this, uiSourceCode),
                    jslogContext: 'add-script-to-ignorelist',
                });
            }
            menuItems.push(...this.getIgnoreListGeneralContextMenuItems({ isContentScript, isKnownThirdParty }));
        }
        return menuItems;
    }
    getIgnoreListGeneralContextMenuItems(options) {
        const menuItems = [];
        if (options?.isContentScript) {
            menuItems.push({
                text: i18nString(UIStrings.addAllContentScriptsToIgnoreList),
                callback: this.ignoreListContentScripts.bind(this),
                jslogContext: 'add-content-scripts-to-ignorelist',
            });
        }
        if (options?.isKnownThirdParty) {
            menuItems.push({
                text: i18nString(UIStrings.addAllThirdPartyScriptsToIgnoreList),
                callback: this.ignoreListThirdParty.bind(this),
                jslogContext: 'add-3p-scripts-to-ignorelist',
            });
        }
        return menuItems;
    }
    getIgnoreListFolderContextMenuItems(url, options) {
        const menuItems = [];
        const regexValue = '^' + Platform.StringUtilities.escapeForRegExp(url) + '/';
        if (this.ignoreListHasPattern(regexValue, true)) {
            menuItems.push({
                text: i18nString(UIStrings.removeFromIgnoreList),
                callback: this.removeIgnoreListPattern.bind(this, regexValue),
                jslogContext: 'remove-from-ignore-list',
            });
        }
        else if (this.isUserIgnoreListedURL(url, options)) {
            // This specific url isn't on the ignore list, but there are rules that match it.
            menuItems.push({
                text: i18nString(UIStrings.removeFromIgnoreList),
                callback: this.unIgnoreListURL.bind(this, url, options),
                jslogContext: 'remove-from-ignore-list',
            });
        }
        else if (!options?.isCurrentlyIgnoreListed) {
            // Provide options to add to ignore list, unless folder currently displays
            // as entirely ignored.
            menuItems.push({
                text: i18nString(UIStrings.addDirectoryToIgnoreList),
                callback: this.ignoreListRegex.bind(this, regexValue),
                jslogContext: 'add-directory-to-ignore-list',
            });
            menuItems.push(...this.getIgnoreListGeneralContextMenuItems(options));
        }
        return menuItems;
    }
}
const scriptToRange = new WeakMap();
//# sourceMappingURL=IgnoreListManager.js.map