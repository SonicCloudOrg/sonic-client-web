// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../core/common/common.js';
import * as Host from '../core/host/host.js';
import * as i18n from '../core/i18n/i18n.js';
import * as Root from '../core/root/root.js';
import * as SDK from '../core/sdk/sdk.js';
import * as Bindings from '../models/bindings/bindings.js';
import * as IssuesManager from '../models/issues_manager/issues_manager.js';
import * as Logs from '../models/logs/logs.js';
import * as Persistence from '../models/persistence/persistence.js';
import * as Workspace from '../models/workspace/workspace.js';
// Don't import UI at this stage because it will fail without
// the environment. Instead we do the import at the end of the
// initialization phase.
// eslint-disable-next-line @typescript-eslint/naming-convention
let UI;
let uniqueTargetId = 0;
export function createTarget({ id, name, type = SDK.Target.Type.Frame, parentTarget, subtype, url = 'http://example.com' } = {}) {
    if (!id) {
        if (!uniqueTargetId++) {
            id = 'test';
        }
        else {
            id = ('test' + uniqueTargetId);
        }
    }
    const targetManager = SDK.TargetManager.TargetManager.instance();
    return targetManager.createTarget(id, name ?? id, type, parentTarget ? parentTarget : null, /* sessionId=*/ parentTarget ? id : undefined, 
    /* suspended=*/ false, 
    /* connection=*/ undefined, { targetId: id, url, subtype });
}
function createSettingValue(category, settingName, defaultValue, settingType = "boolean" /* Common.Settings.SettingType.BOOLEAN */) {
    return { category, settingName, defaultValue, settingType };
}
export function stubNoopSettings() {
    sinon.stub(Common.Settings.Settings, 'instance').returns({
        createSetting: () => ({
            get: () => [],
            set: () => { },
            addChangeListener: () => { },
            removeChangeListener: () => { },
            setDisabled: () => { },
            setTitle: () => { },
            title: () => { },
            asRegExp: () => { },
            type: () => "boolean" /* Common.Settings.SettingType.BOOLEAN */,
            getAsArray: () => [],
        }),
        moduleSetting: () => ({
            get: () => [],
            set: () => { },
            addChangeListener: () => { },
            removeChangeListener: () => { },
            setDisabled: () => { },
            setTitle: () => { },
            title: () => { },
            asRegExp: () => { },
            type: () => "boolean" /* Common.Settings.SettingType.BOOLEAN */,
            getAsArray: () => [],
        }),
        createLocalSetting: () => ({
            get: () => [],
            set: () => { },
            addChangeListener: () => { },
            removeChangeListener: () => { },
            setDisabled: () => { },
            setTitle: () => { },
            title: () => { },
            asRegExp: () => { },
            type: () => "boolean" /* Common.Settings.SettingType.BOOLEAN */,
            getAsArray: () => [],
        }),
        getHostConfig: () => { },
    });
}
export function registerNoopActions(actionIds) {
    for (const actionId of actionIds) {
        UI.ActionRegistration.maybeRemoveActionExtension(actionId);
        UI.ActionRegistration.registerActionExtension({
            actionId,
            category: "" /* UI.ActionRegistration.ActionCategory.NONE */,
            title: () => 'mock',
        });
    }
    const actionRegistryInstance = UI.ActionRegistry.ActionRegistry.instance({ forceNew: true });
    UI.ShortcutRegistry.ShortcutRegistry.instance({ forceNew: true, actionRegistry: actionRegistryInstance });
}
const REGISTERED_EXPERIMENTS = [
    "capture-node-creation-stacks" /* Root.Runtime.ExperimentName.CAPTURE_NODE_CREATION_STACKS */,
    "protocol-monitor" /* Root.Runtime.ExperimentName.PROTOCOL_MONITOR */,
    'timeline-show-all-events',
    'timeline-v8-runtime-call-stats',
    'timeline-invalidation-tracking',
    "instrumentation-breakpoints" /* Root.Runtime.ExperimentName.INSTRUMENTATION_BREAKPOINTS */,
    'css-type-component-length-deprecate',
    "styles-pane-css-changes" /* Root.Runtime.ExperimentName.STYLES_PANE_CSS_CHANGES */,
    "header-overrides" /* Root.Runtime.ExperimentName.HEADER_OVERRIDES */,
    "highlight-errors-elements-panel" /* Root.Runtime.ExperimentName.HIGHLIGHT_ERRORS_ELEMENTS_PANEL */,
    "use-source-map-scopes" /* Root.Runtime.ExperimentName.USE_SOURCE_MAP_SCOPES */,
    'font-editor',
    "network-panel-filter-bar-redesign" /* Root.Runtime.ExperimentName.NETWORK_PANEL_FILTER_BAR_REDESIGN */,
    "sources-frame-indentation-markers-temporarily-disable" /* Root.Runtime.ExperimentName.INDENTATION_MARKERS_TEMP_DISABLE */,
    "autofill-view" /* Root.Runtime.ExperimentName.AUTOFILL_VIEW */,
    "perf-panel-annotations" /* Root.Runtime.ExperimentName.TIMELINE_ANNOTATIONS_OVERLAYS */,
    "timeline-rpp-sidebar" /* Root.Runtime.ExperimentName.TIMELINE_SIDEBAR */,
    "timeline-extensions" /* Root.Runtime.ExperimentName.TIMELINE_EXTENSIONS */,
    "timeline-debug-mode" /* Root.Runtime.ExperimentName.TIMELINE_DEBUG_MODE */,
    "timeline-observations" /* Root.Runtime.ExperimentName.TIMELINE_OBSERVATIONS */,
    "full-accessibility-tree" /* Root.Runtime.ExperimentName.FULL_ACCESSIBILITY_TREE */,
    "timeline-show-postmessage-events" /* Root.Runtime.ExperimentName.TIMELINE_SHOW_POST_MESSAGE_EVENTS */,
];
export async function initializeGlobalVars({ reset = true } = {}) {
    await initializeGlobalLocaleVars();
    // Create the appropriate settings needed to boot.
    const settings = [
        createSettingValue("ADORNER" /* Common.Settings.SettingCategory.ADORNER */, 'adorner-settings', [], "array" /* Common.Settings.SettingType.ARRAY */),
        createSettingValue("APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */, 'disable-paused-state-overlay', false),
        createSettingValue("APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */, 'sidebar-position', 'auto', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'custom-formatters', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'pause-on-exception-enabled', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'pause-on-caught-exception', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'pause-on-uncaught-exception', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'disable-async-stack-traces', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'breakpoints-active', true),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'java-script-disabled', false),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'skip-content-scripts', true),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'automatically-ignore-list-known-third-party-scripts', true),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'enable-ignore-listing', true),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'skip-stack-frames-pattern', '/node_modules/|/bower_components/', "regex" /* Common.Settings.SettingType.REGEX */),
        createSettingValue("DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */, 'navigator-group-by-folder', true),
        createSettingValue("ELEMENTS" /* Common.Settings.SettingCategory.ELEMENTS */, 'show-detailed-inspect-tooltip', true),
        createSettingValue("ELEMENTS" /* Common.Settings.SettingCategory.ELEMENTS */, 'show-html-comments', true),
        createSettingValue("ELEMENTS" /* Common.Settings.SettingCategory.ELEMENTS */, 'show-ua-shadow-dom', false),
        createSettingValue("NETWORK" /* Common.Settings.SettingCategory.NETWORK */, 'cache-disabled', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'avif-format-disabled', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-prefers-color-scheme', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-forced-colors', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-prefers-reduced-motion', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-prefers-contrast', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-prefers-reduced-data', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-prefers-reduced-transparency', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-css-media-feature-color-gamut', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulated-vision-deficiency', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'emulate-auto-dark-mode', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'local-fonts-disabled', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-paint-rects', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-layout-shift-regions', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-ad-highlights', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-debug-borders', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-fps-counter', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-scroll-bottleneck-rects', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'show-web-vitals', false),
        createSettingValue("RENDERING" /* Common.Settings.SettingCategory.RENDERING */, 'webp-format-disabled', false),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'allow-scroll-past-eof', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'css-source-maps-enabled', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'inline-variable-values', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'auto-pretty-print-minified', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'js-source-maps-enabled', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'show-whitespaces-in-editor', 'none'),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-autocompletion', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-auto-detect-indent', false),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-bracket-closing', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-bracket-matching', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-code-folding', true),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-indent', '    '),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'text-editor-tab-moves-focus', false),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'dom-word-wrap', true),
        createSettingValue("EMULATION" /* Common.Settings.SettingCategory.EMULATION */, 'emulation.touch', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("EMULATION" /* Common.Settings.SettingCategory.EMULATION */, 'emulation.idle-detection', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("GRID" /* Common.Settings.SettingCategory.GRID */, 'show-grid-line-labels', 'none', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("GRID" /* Common.Settings.SettingCategory.GRID */, 'extend-grid-lines', true),
        createSettingValue("GRID" /* Common.Settings.SettingCategory.GRID */, 'show-grid-areas', true),
        createSettingValue("GRID" /* Common.Settings.SettingCategory.GRID */, 'show-grid-track-sizes', true),
        createSettingValue("" /* Common.Settings.SettingCategory.NONE */, 'active-keybind-set', '', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("" /* Common.Settings.SettingCategory.NONE */, 'user-shortcuts', [], "array" /* Common.Settings.SettingType.ARRAY */),
        createSettingValue("APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */, 'help.show-release-note', true, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("NETWORK" /* Common.Settings.SettingCategory.NETWORK */, 'request-blocking-enabled', false),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'monitoring-xhr-enabled', false),
        createSettingValue("" /* Common.Settings.SettingCategory.NONE */, 'custom-network-conditions', [], "array" /* Common.Settings.SettingType.ARRAY */),
        createSettingValue("APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */, 'ui-theme', 'systemPreferred', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */, 'language', 'en-US', "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("PERSISTENCE" /* Common.Settings.SettingCategory.PERSISTENCE */, 'persistence-network-overrides-enabled', true, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("NETWORK" /* Common.Settings.SettingCategory.NETWORK */, 'network-log.preserve-log', true, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("NETWORK" /* Common.Settings.SettingCategory.NETWORK */, 'network-log.record-log', true, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("SOURCES" /* Common.Settings.SettingCategory.SOURCES */, 'network.enable-remote-file-loading', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'hide-network-messages', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'selected-context-filter-enabled', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-group-similar', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-shows-cors-errors', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-timestamps-enabled', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-insights-enabled', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-insights-onboarding-finished', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-history-autocomplete', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-autocomplete-on-enter', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'preserve-console-log', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-eager-eval', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-user-activation-eval', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */, 'console-trace-expand', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
        createSettingValue("PERFORMANCE" /* Common.Settings.SettingCategory.PERFORMANCE */, 'flamechart-mouse-wheel-action', false, "enum" /* Common.Settings.SettingType.ENUM */),
        createSettingValue("ELEMENTS" /* Common.Settings.SettingCategory.ELEMENTS */, 'show-css-property-documentation-on-hover', false, "boolean" /* Common.Settings.SettingType.BOOLEAN */),
    ];
    Common.Settings.registerSettingsForTest(settings, reset);
    // Instantiate the storage.
    const storage = new Common.Settings.SettingsStorage({}, Common.Settings.NOOP_STORAGE, 'test');
    Common.Settings.Settings.instance({ forceNew: reset, syncedStorage: storage, globalStorage: storage, localStorage: storage });
    Root.Runtime.experiments.clearForTest();
    for (const experimentName of REGISTERED_EXPERIMENTS) {
        Root.Runtime.experiments.register(experimentName, '');
    }
    // Dynamically import UI after the rest of the environment is set up, otherwise it will fail.
    UI = await import('../ui/legacy/legacy.js');
    UI.ZoomManager.ZoomManager.instance({ forceNew: true, win: window, frontendHost: Host.InspectorFrontendHost.InspectorFrontendHostInstance });
    // Initialize theme support and context menus.
    Common.Settings.Settings.instance().createSetting('uiTheme', 'systemPreferred');
    UI.UIUtils.initializeUIUtils(document);
}
export async function deinitializeGlobalVars() {
    // Remove the global SDK.
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const globalObject = globalThis;
    delete globalObject.SDK;
    delete globalObject.ls;
    for (const target of SDK.TargetManager.TargetManager.instance().targets()) {
        target.dispose('deinitializeGlobalVars');
    }
    // Remove instances.
    await deinitializeGlobalLocaleVars();
    Logs.NetworkLog.NetworkLog.removeInstance();
    SDK.TargetManager.TargetManager.removeInstance();
    Root.Runtime.Runtime.removeInstance();
    Common.Settings.Settings.removeInstance();
    Common.Revealer.RevealerRegistry.removeInstance();
    Common.Console.Console.removeInstance();
    Workspace.Workspace.WorkspaceImpl.removeInstance();
    Bindings.IgnoreListManager.IgnoreListManager.removeInstance();
    Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.removeInstance();
    Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.removeInstance();
    IssuesManager.IssuesManager.IssuesManager.removeInstance();
    Persistence.IsolatedFileSystemManager.IsolatedFileSystemManager.removeInstance();
    Common.Settings.resetSettings();
    // Protect against the dynamic import not having happened.
    if (UI) {
        UI.ZoomManager.ZoomManager.removeInstance();
        UI.ViewManager.ViewManager.removeInstance();
        UI.ViewManager.resetViewRegistration();
        UI.Context.Context.removeInstance();
        UI.InspectorView.InspectorView.removeInstance();
        UI.ActionRegistry.ActionRegistry.reset();
    }
    Root.Runtime.experiments.clearForTest();
}
export function describeWithEnvironment(title, fn, opts = {
    reset: true,
}) {
    return describe(title, function () {
        before(async () => await initializeGlobalVars(opts));
        fn.call(this);
        after(async () => await deinitializeGlobalVars());
    });
}
describeWithEnvironment.only = function (title, fn, opts = {
    reset: true,
}) {
    // eslint-disable-next-line mocha/no-exclusive-tests
    return describe.only(title, function () {
        before(async () => await initializeGlobalVars(opts));
        fn.call(this);
        after(async () => await deinitializeGlobalVars());
    });
};
export async function initializeGlobalLocaleVars() {
    // Expose the locale.
    i18n.DevToolsLocale.DevToolsLocale.instance({
        create: true,
        data: {
            navigatorLanguage: 'en-US',
            settingLanguage: 'en-US',
            lookupClosestDevToolsLocale: () => 'en-US',
        },
    });
    if (i18n.i18n.hasLocaleDataForTest('en-US')) {
        return;
    }
    // Load the strings from the resource file.
    try {
        await i18n.i18n.fetchAndRegisterLocaleData('en-US');
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.warn('EnvironmentHelper: Loading en-US locale failed', error.message);
    }
}
export function deinitializeGlobalLocaleVars() {
    i18n.DevToolsLocale.DevToolsLocale.removeInstance();
}
export function describeWithLocale(title, fn) {
    return describe(title, function () {
        before(async () => await initializeGlobalLocaleVars());
        fn.call(this);
        after(deinitializeGlobalLocaleVars);
    });
}
describeWithLocale.only = function (title, fn) {
    // eslint-disable-next-line mocha/no-exclusive-tests
    return describe.only(title, function () {
        before(async () => await initializeGlobalLocaleVars());
        fn.call(this);
        after(deinitializeGlobalLocaleVars);
    });
};
describeWithLocale.skip = function (title, fn) {
    // eslint-disable-next-line rulesdir/check_test_definitions
    return describe.skip(title, function () {
        fn.call(this);
    });
};
export function createFakeSetting(name, defaultValue) {
    const storage = new Common.Settings.SettingsStorage({}, Common.Settings.NOOP_STORAGE, 'test');
    return new Common.Settings.Setting(name, defaultValue, new Common.ObjectWrapper.ObjectWrapper(), storage);
}
export function enableFeatureForTest(feature) {
    Root.Runtime.experiments.enableForTest(feature);
}
export function setupActionRegistry() {
    before(function () {
        const actionRegistry = UI.ActionRegistry.ActionRegistry.instance();
        UI.ShortcutRegistry.ShortcutRegistry.instance({
            forceNew: true,
            actionRegistry,
        });
    });
    after(function () {
        if (UI) {
            UI.ShortcutRegistry.ShortcutRegistry.removeInstance();
            UI.ActionRegistry.ActionRegistry.removeInstance();
        }
    });
}
export function expectConsoleLogs(expectedLogs) {
    const { error, warn, log } = console;
    before(() => {
        if (expectedLogs.log) {
            // eslint-disable-next-line no-console
            console.log = (...data) => {
                if (!expectedLogs.log?.includes(data.join(' '))) {
                    log(...data);
                }
            };
        }
        if (expectedLogs.warn) {
            console.warn = (...data) => {
                if (!expectedLogs.warn?.includes(data.join(' '))) {
                    warn(...data);
                }
            };
        }
        if (expectedLogs.error) {
            console.error = (...data) => {
                if (!expectedLogs.error?.includes(data.join(' '))) {
                    error(...data);
                }
            };
        }
    });
    after(() => {
        if (expectedLogs.log) {
            // eslint-disable-next-line no-console
            console.log = log;
        }
        if (expectedLogs.warn) {
            console.warn = warn;
        }
        if (expectedLogs.error) {
            console.error = error;
        }
    });
}
//# sourceMappingURL=EnvironmentHelpers.js.map