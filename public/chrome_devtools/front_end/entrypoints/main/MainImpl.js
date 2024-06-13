// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2006, 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2007 Matt Lilek (pewtermoose@gmail.com).
 * Copyright (C) 2009 Joseph Pecoraro
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as ProtocolClient from '../../core/protocol_client/protocol_client.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as AutofillManager from '../../models/autofill_manager/autofill_manager.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Breakpoints from '../../models/breakpoints/breakpoints.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as IssuesManager from '../../models/issues_manager/issues_manager.js';
import * as LiveMetrics from '../../models/live-metrics/live-metrics.js';
import * as Logs from '../../models/logs/logs.js';
import * as Persistence from '../../models/persistence/persistence.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as Snippets from '../../panels/snippets/snippets.js';
import * as Timeline from '../../panels/timeline/timeline.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { ExecutionContextSelector } from './ExecutionContextSelector.js';
import { SettingTracker } from './SettingTracker.js';
const UIStrings = {
    /**
     *@description Title of item in main
     */
    customizeAndControlDevtools: 'Customize and control DevTools',
    /**
     *@description Title element text content in Main
     */
    dockSide: 'Dock side',
    /**
     *@description Title element title in Main
     *@example {Ctrl+Shift+D} PH1
     */
    placementOfDevtoolsRelativeToThe: 'Placement of DevTools relative to the page. ({PH1} to restore last position)',
    /**
     *@description Text to undock the DevTools
     */
    undockIntoSeparateWindow: 'Undock into separate window',
    /**
     *@description Text to dock the DevTools to the bottom of the browser tab
     */
    dockToBottom: 'Dock to bottom',
    /**
     *@description Text to dock the DevTools to the right of the browser tab
     */
    dockToRight: 'Dock to right',
    /**
     *@description Text to dock the DevTools to the left of the browser tab
     */
    dockToLeft: 'Dock to left',
    /**
     *@description Text in Main
     */
    focusDebuggee: 'Focus page',
    /**
     *@description Text in Main
     */
    hideConsoleDrawer: 'Hide console drawer',
    /**
     *@description Text in Main
     */
    showConsoleDrawer: 'Show console drawer',
    /**
     *@description A context menu item in the Main
     */
    moreTools: 'More tools',
    /**
     *@description Text for the viewing the help options
     */
    help: 'Help',
    /**
     *@description Text describing how to navigate the dock side menu
     */
    dockSideNaviation: 'Use left and right arrow keys to navigate the options',
};
const str_ = i18n.i18n.registerUIStrings('entrypoints/main/MainImpl.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class MainImpl {
    #lateInitDonePromise;
    #readyForTestPromise;
    #resolveReadyForTestPromise;
    constructor() {
        MainImpl.instanceForTest = this;
        this.#readyForTestPromise = new Promise(resolve => {
            this.#resolveReadyForTestPromise = resolve;
        });
        void this.#loaded();
    }
    static time(label) {
        if (Host.InspectorFrontendHost.isUnderTest()) {
            return;
        }
        console.time(label);
    }
    static timeEnd(label) {
        if (Host.InspectorFrontendHost.isUnderTest()) {
            return;
        }
        console.timeEnd(label);
    }
    async #loaded() {
        console.timeStamp('Main._loaded');
        Root.Runtime.Runtime.setPlatform(Host.Platform.platform());
        const prefsPromise = new Promise(resolve => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.getPreferences(resolve);
        });
        const configPromise = new Promise(resolve => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.getHostConfig(resolve);
        });
        const [prefs, config] = await Promise.all([prefsPromise, configPromise]);
        console.timeStamp('Main._gotPreferences');
        this.#initializeGlobalsForLayoutTests();
        this.createSettings(prefs, config);
        await this.requestAndRegisterLocaleData();
        Host.userMetrics.syncSetting(Common.Settings.Settings.instance().moduleSetting('sync-preferences').get());
        if (Root.Runtime.Runtime.queryParam('veLogging')) {
            void VisualLogging.startLogging();
        }
        void this.#createAppUI();
    }
    #initializeGlobalsForLayoutTests() {
        // @ts-ignore e2e test global
        self.Extensions ||= {};
        // @ts-ignore e2e test global
        self.Host ||= {};
        // @ts-ignore e2e test global
        self.Host.userMetrics ||= Host.userMetrics;
        // @ts-ignore e2e test global
        self.Host.UserMetrics ||= Host.UserMetrics;
        // @ts-ignore e2e test global
        self.ProtocolClient ||= {};
        // @ts-ignore e2e test global
        self.ProtocolClient.test ||= ProtocolClient.InspectorBackend.test;
    }
    async requestAndRegisterLocaleData() {
        const settingLanguage = Common.Settings.Settings.instance().moduleSetting('language').get();
        const devToolsLocale = i18n.DevToolsLocale.DevToolsLocale.instance({
            create: true,
            data: {
                navigatorLanguage: navigator.language,
                settingLanguage,
                lookupClosestDevToolsLocale: i18n.i18n.lookupClosestSupportedDevToolsLocale,
            },
        });
        // Record the intended locale, regardless whether we are able to fetch it or not.
        Host.userMetrics.language(devToolsLocale.locale);
        if (devToolsLocale.locale !== 'en-US') {
            // Always load en-US locale data as a fallback. This is important, newly added
            // strings won't have a translation. If fetching en-US.json fails, something
            // is seriously wrong and the exception should bubble up.
            await i18n.i18n.fetchAndRegisterLocaleData('en-US');
        }
        try {
            await i18n.i18n.fetchAndRegisterLocaleData(devToolsLocale.locale);
        }
        catch (error) {
            console.warn(`Unable to fetch & register locale data for '${devToolsLocale.locale}', falling back to 'en-US'. Cause: `, error);
            // Loading the actual locale data failed, tell DevTools to use 'en-US'.
            devToolsLocale.forceFallbackLocale();
        }
    }
    createSettings(prefs, config) {
        this.#initializeExperiments();
        let storagePrefix = '';
        if (Host.Platform.isCustomDevtoolsFrontend()) {
            storagePrefix = '__custom__';
        }
        else if (!Root.Runtime.Runtime.queryParam('can_dock') && Boolean(Root.Runtime.Runtime.queryParam('debugFrontend')) &&
            !Host.InspectorFrontendHost.isUnderTest()) {
            storagePrefix = '__bundled__';
        }
        let localStorage;
        if (!Host.InspectorFrontendHost.isUnderTest() && window.localStorage) {
            const localbackingStore = {
                ...Common.Settings.NOOP_STORAGE,
                clear: () => window.localStorage.clear(),
            };
            localStorage = new Common.Settings.SettingsStorage(window.localStorage, localbackingStore, storagePrefix);
        }
        else {
            localStorage = new Common.Settings.SettingsStorage({}, Common.Settings.NOOP_STORAGE, storagePrefix);
        }
        const hostUnsyncedStorage = {
            register: (name) => Host.InspectorFrontendHost.InspectorFrontendHostInstance.registerPreference(name, { synced: false }),
            set: Host.InspectorFrontendHost.InspectorFrontendHostInstance.setPreference,
            get: (name) => {
                return new Promise(resolve => {
                    Host.InspectorFrontendHost.InspectorFrontendHostInstance.getPreference(name, resolve);
                });
            },
            remove: Host.InspectorFrontendHost.InspectorFrontendHostInstance.removePreference,
            clear: Host.InspectorFrontendHost.InspectorFrontendHostInstance.clearPreferences,
        };
        const hostSyncedStorage = {
            ...hostUnsyncedStorage,
            register: (name) => Host.InspectorFrontendHost.InspectorFrontendHostInstance.registerPreference(name, { synced: true }),
        };
        // `prefs` is retrieved via `getPreferences` host binding and contains both synced and unsynced settings.
        // As such, we use `prefs` to initialize both the synced and the global storage. This is fine as an individual
        // setting can't change storage buckets during a single DevTools session.
        const syncedStorage = new Common.Settings.SettingsStorage(prefs, hostSyncedStorage, storagePrefix);
        const globalStorage = new Common.Settings.SettingsStorage(prefs, hostUnsyncedStorage, storagePrefix);
        Common.Settings.Settings.instance({ forceNew: true, syncedStorage, globalStorage, localStorage, config });
        // Needs to be created after Settings are available.
        new SettingTracker();
        if (!Host.InspectorFrontendHost.isUnderTest()) {
            new Common.Settings.VersionController().updateVersion();
        }
    }
    #initializeExperiments() {
        Root.Runtime.experiments.register('apply-custom-stylesheet', 'Allow extensions to load custom stylesheets');
        Root.Runtime.experiments.register('capture-node-creation-stacks', 'Capture node creation stacks');
        Root.Runtime.experiments.register('live-heap-profile', 'Live heap profile', true);
        Root.Runtime.experiments.register('protocol-monitor', 'Protocol Monitor', undefined, 'https://developer.chrome.com/blog/new-in-devtools-92/#protocol-monitor');
        Root.Runtime.experiments.register('sampling-heap-profiler-timeline', 'Sampling heap profiler timeline', true);
        Root.Runtime.experiments.register('show-option-tp-expose-internals-in-heap-snapshot', 'Show option to expose internals in heap snapshots');
        Root.Runtime.experiments.register('heap-snapshot-treat-backing-store-as-containing-object', 'In heap snapshots, treat backing store size as part of the containing object');
        // Timeline
        Root.Runtime.experiments.register('timeline-invalidation-tracking', 'Performance panel: invalidation tracking', true);
        Root.Runtime.experiments.register('timeline-show-all-events', 'Performance panel: show all events', true);
        Root.Runtime.experiments.register('timeline-v8-runtime-call-stats', 'Performance panel: V8 runtime call stats', true);
        Root.Runtime.experiments.register('timeline-extensions', 'Performance panel: enable user timings based extensions', true);
        Root.Runtime.experiments.register('timeline-enhanced-traces', 'Performance panel: Enable collecting enhanced traces', true);
        Root.Runtime.experiments.register('timeline-compiled-sources', 'Performance panel: Enable collecting source text for compiled script', true);
        Root.Runtime.experiments.register("timeline-debug-mode" /* Root.Runtime.ExperimentName.TIMELINE_DEBUG_MODE */, 'Performance panel: Enable debug mode (trace event details, etc)', true);
        // Sources
        Root.Runtime.experiments.register("sources-frame-indentation-markers-temporarily-disable" /* Root.Runtime.ExperimentName.INDENTATION_MARKERS_TEMP_DISABLE */, 'Disable indentation markers temporarily', 
        /* unstable= */ false, 'https://developer.chrome.com/blog/new-in-devtools-121/#indentation', 'https://crbug.com/1479986');
        // Debugging
        Root.Runtime.experiments.register('instrumentation-breakpoints', 'Enable instrumentation breakpoints', true);
        Root.Runtime.experiments.register('use-source-map-scopes', 'Use scope information from source maps', true);
        // Advanced Perceptual Contrast Algorithm.
        Root.Runtime.experiments.register('apca', 'Enable new Advanced Perceptual Contrast Algorithm (APCA) replacing previous contrast ratio and AA/AAA guidelines', undefined, 'https://developer.chrome.com/blog/new-in-devtools-89/#apca');
        // Full Accessibility Tree
        Root.Runtime.experiments.register('full-accessibility-tree', 'Enable full accessibility tree view in the Elements panel', undefined, 'https://developer.chrome.com/blog/new-in-devtools-90/#accesibility-tree', 'https://g.co/devtools/a11y-tree-feedback');
        // Font Editor
        Root.Runtime.experiments.register('font-editor', 'Enable new font editor within the Styles tab', undefined, 'https://developer.chrome.com/blog/new-in-devtools-89/#font');
        // Contrast issues reported via the Issues panel.
        Root.Runtime.experiments.register('contrast-issues', 'Enable automatic contrast issue reporting via the Issues panel', undefined, 'https://developer.chrome.com/blog/new-in-devtools-90/#low-contrast');
        // New cookie features.
        Root.Runtime.experiments.register('experimental-cookie-features', 'Enable experimental cookie features');
        // CSS <length> authoring tool.
        Root.Runtime.experiments.register('css-type-component-length-deprecate', 'Deprecate CSS <length> authoring tool in the Styles tab', undefined, 'https://goo.gle/devtools-deprecate-length-tools', 'https://crbug.com/1522657');
        // Integrate CSS changes in the Styles pane.
        Root.Runtime.experiments.register("styles-pane-css-changes" /* Root.Runtime.ExperimentName.STYLES_PANE_CSS_CHANGES */, 'Sync CSS changes in the Styles tab');
        // Highlights a violating node or attribute by rendering a squiggly line under it and adding a tooltip linking to the issues panel.
        // Right now violating nodes are exclusively form fields that contain an HTML issue, for example, and <input /> whose id is duplicate inside the form.
        Root.Runtime.experiments.register("highlight-errors-elements-panel" /* Root.Runtime.ExperimentName.HIGHLIGHT_ERRORS_ELEMENTS_PANEL */, 'Highlights a violating node or attribute in the Elements panel DOM tree');
        // Change grouping of sources panel to use Authored/Deployed trees
        Root.Runtime.experiments.register("authored-deployed-grouping" /* Root.Runtime.ExperimentName.AUTHORED_DEPLOYED_GROUPING */, 'Group sources into authored and deployed trees', undefined, 'https://goo.gle/authored-deployed', 'https://goo.gle/authored-deployed-feedback');
        // Hide third party code (as determined by ignore lists or source maps)
        Root.Runtime.experiments.register("just-my-code" /* Root.Runtime.ExperimentName.JUST_MY_CODE */, 'Hide ignore-listed code in Sources tree view');
        // Highlight important DOM properties in the Object Properties viewer.
        Root.Runtime.experiments.register("important-dom-properties" /* Root.Runtime.ExperimentName.IMPORTANT_DOM_PROPERTIES */, 'Highlight important DOM properties in the Properties tab');
        Root.Runtime.experiments.register("preloading-status-panel" /* Root.Runtime.ExperimentName.PRELOADING_STATUS_PANEL */, 'Enable speculative loads panel in Application panel', true);
        Root.Runtime.experiments.register("outermost-target-selector" /* Root.Runtime.ExperimentName.OUTERMOST_TARGET_SELECTOR */, 'Enable background page selector (for prerendering)', false);
        Root.Runtime.experiments.register("network-panel-filter-bar-redesign" /* Root.Runtime.ExperimentName.NETWORK_PANEL_FILTER_BAR_REDESIGN */, 'Redesign of the filter bar in the Network panel', false, 'https://goo.gle/devtools-network-filter-redesign', 'https://crbug.com/1500573');
        Root.Runtime.experiments.register("autofill-view" /* Root.Runtime.ExperimentName.AUTOFILL_VIEW */, 'Autofill panel', false, 'https://goo.gle/devtools-autofill-panel', 'https://crbug.com/329106326');
        Root.Runtime.experiments.register("timeline-show-postmessage-events" /* Root.Runtime.ExperimentName.TIMELINE_SHOW_POST_MESSAGE_EVENTS */, 'Performance panel: show postMessage dispatch and handling flows');
        Root.Runtime.experiments.register("perf-panel-annotations" /* Root.Runtime.ExperimentName.TIMELINE_ANNOTATIONS_OVERLAYS */, 'Performance panel: enable annotations', true);
        Root.Runtime.experiments.register("timeline-rpp-sidebar" /* Root.Runtime.ExperimentName.TIMELINE_SIDEBAR */, 'Performance panel: enable sidebar', true);
        Root.Runtime.experiments.register("timeline-observations" /* Root.Runtime.ExperimentName.TIMELINE_OBSERVATIONS */, 'Performance panel: enable live metrics landing page');
        Root.Runtime.experiments.enableExperimentsByDefault([
            'css-type-component-length-deprecate',
            "outermost-target-selector" /* Root.Runtime.ExperimentName.OUTERMOST_TARGET_SELECTOR */,
            "preloading-status-panel" /* Root.Runtime.ExperimentName.PRELOADING_STATUS_PANEL */,
            "autofill-view" /* Root.Runtime.ExperimentName.AUTOFILL_VIEW */,
            ...(Root.Runtime.Runtime.queryParam('isChromeForTesting') ? ['protocol-monitor'] : []),
        ]);
        Root.Runtime.experiments.cleanUpStaleExperiments();
        const enabledExperiments = Root.Runtime.Runtime.queryParam('enabledExperiments');
        if (enabledExperiments) {
            Root.Runtime.experiments.setServerEnabledExperiments(enabledExperiments.split(';'));
        }
        Root.Runtime.experiments.enableExperimentsTransiently([]);
        if (Host.InspectorFrontendHost.isUnderTest()) {
            const testParam = Root.Runtime.Runtime.queryParam('test');
            if (testParam && testParam.includes('live-line-level-heap-profile.js')) {
                Root.Runtime.experiments.enableForTest('live-heap-profile');
            }
        }
        for (const experiment of Root.Runtime.experiments.allConfigurableExperiments()) {
            if (experiment.isEnabled()) {
                Host.userMetrics.experimentEnabledAtLaunch(experiment.name);
            }
            else {
                Host.userMetrics.experimentDisabledAtLaunch(experiment.name);
            }
        }
    }
    async #createAppUI() {
        MainImpl.time('Main._createAppUI');
        // Request filesystems early, we won't create connections until callback is fired. Things will happen in parallel.
        Persistence.IsolatedFileSystemManager.IsolatedFileSystemManager.instance();
        const defaultThemeSetting = 'systemPreferred';
        const themeSetting = Common.Settings.Settings.instance().createSetting('ui-theme', defaultThemeSetting);
        UI.UIUtils.initializeUIUtils(document);
        // Initialize theme support and apply it.
        if (!ThemeSupport.ThemeSupport.hasInstance()) {
            ThemeSupport.ThemeSupport.instance({ forceNew: true, setting: themeSetting });
        }
        UI.UIUtils.installComponentRootStyles(document.body);
        this.#addMainEventListeners(document);
        const canDock = Boolean(Root.Runtime.Runtime.queryParam('can_dock'));
        UI.ZoomManager.ZoomManager.instance({ forceNew: true, win: window, frontendHost: Host.InspectorFrontendHost.InspectorFrontendHostInstance });
        UI.ContextMenu.ContextMenu.initialize();
        UI.ContextMenu.ContextMenu.installHandler(document);
        // These instances need to be created early so they don't miss any events about requests/issues/etc.
        Logs.NetworkLog.NetworkLog.instance();
        SDK.FrameManager.FrameManager.instance();
        Logs.LogManager.LogManager.instance();
        IssuesManager.IssuesManager.IssuesManager.instance({
            forceNew: true,
            ensureFirst: true,
            showThirdPartyIssuesSetting: IssuesManager.Issue.getShowThirdPartyIssuesSetting(),
            hideIssueSetting: IssuesManager.IssuesManager.getHideIssueByCodeSetting(),
        });
        IssuesManager.ContrastCheckTrigger.ContrastCheckTrigger.instance();
        UI.DockController.DockController.instance({ forceNew: true, canDock });
        SDK.NetworkManager.MultitargetNetworkManager.instance({ forceNew: true });
        SDK.DOMDebuggerModel.DOMDebuggerManager.instance({ forceNew: true });
        SDK.TargetManager.TargetManager.instance().addEventListener("SuspendStateChanged" /* SDK.TargetManager.Events.SuspendStateChanged */, this.#onSuspendStateChanged.bind(this));
        Workspace.FileManager.FileManager.instance({ forceNew: true });
        Workspace.Workspace.WorkspaceImpl.instance();
        Bindings.NetworkProject.NetworkProjectManager.instance();
        const resourceMapping = new Bindings.ResourceMapping.ResourceMapping(SDK.TargetManager.TargetManager.instance(), Workspace.Workspace.WorkspaceImpl.instance());
        new Bindings.PresentationConsoleMessageHelper.PresentationConsoleMessageManager();
        Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance({
            forceNew: true,
            resourceMapping,
            targetManager: SDK.TargetManager.TargetManager.instance(),
        });
        Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance({
            forceNew: true,
            resourceMapping,
            targetManager: SDK.TargetManager.TargetManager.instance(),
        });
        SDK.TargetManager.TargetManager.instance().setScopeTarget(SDK.TargetManager.TargetManager.instance().primaryPageTarget());
        UI.Context.Context.instance().addFlavorChangeListener(SDK.Target.Target, ({ data }) => {
            const outermostTarget = data?.outermostTarget();
            SDK.TargetManager.TargetManager.instance().setScopeTarget(outermostTarget);
        });
        Breakpoints.BreakpointManager.BreakpointManager.instance({
            forceNew: true,
            workspace: Workspace.Workspace.WorkspaceImpl.instance(),
            targetManager: SDK.TargetManager.TargetManager.instance(),
            debuggerWorkspaceBinding: Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance(),
        });
        // @ts-ignore e2e test global
        self.Extensions.extensionServer = Extensions.ExtensionServer.ExtensionServer.instance({ forceNew: true });
        new Persistence.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding(Persistence.IsolatedFileSystemManager.IsolatedFileSystemManager.instance(), Workspace.Workspace.WorkspaceImpl.instance());
        Persistence.IsolatedFileSystemManager.IsolatedFileSystemManager.instance().addPlatformFileSystem('snippet://', new Snippets.ScriptSnippetFileSystem.SnippetFileSystem());
        Persistence.Persistence.PersistenceImpl.instance({
            forceNew: true,
            workspace: Workspace.Workspace.WorkspaceImpl.instance(),
            breakpointManager: Breakpoints.BreakpointManager.BreakpointManager.instance(),
        });
        Persistence.NetworkPersistenceManager.NetworkPersistenceManager.instance({ forceNew: true, workspace: Workspace.Workspace.WorkspaceImpl.instance() });
        new ExecutionContextSelector(SDK.TargetManager.TargetManager.instance(), UI.Context.Context.instance());
        Bindings.IgnoreListManager.IgnoreListManager.instance({
            forceNew: true,
            debuggerWorkspaceBinding: Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance(),
        });
        AutofillManager.AutofillManager.AutofillManager.instance();
        if (Root.Runtime.experiments.isEnabled("timeline-observations" /* Root.Runtime.ExperimentName.TIMELINE_OBSERVATIONS */)) {
            LiveMetrics.LiveMetrics.instance({ forceNew: true });
        }
        new PauseListener();
        const actionRegistryInstance = UI.ActionRegistry.ActionRegistry.instance({ forceNew: true });
        // Required for legacy a11y layout tests
        UI.ShortcutRegistry.ShortcutRegistry.instance({ forceNew: true, actionRegistry: actionRegistryInstance });
        this.#registerMessageSinkListener();
        MainImpl.timeEnd('Main._createAppUI');
        const appProvider = Common.AppProvider.getRegisteredAppProviders()[0];
        if (!appProvider) {
            throw new Error('Unable to boot DevTools, as the appprovider is missing');
        }
        await this.#showAppUI(await appProvider.loadAppProvider());
    }
    async #showAppUI(appProvider) {
        MainImpl.time('Main._showAppUI');
        const app = appProvider.createApp();
        // It is important to kick controller lifetime after apps are instantiated.
        UI.DockController.DockController.instance().initialize();
        ThemeSupport.ThemeSupport.instance().fetchColorsAndApplyHostTheme();
        app.presentUI(document);
        if (UI.ActionRegistry.ActionRegistry.instance().hasAction('elements.toggle-element-search')) {
            const toggleSearchNodeAction = UI.ActionRegistry.ActionRegistry.instance().getAction('elements.toggle-element-search');
            // TODO: we should not access actions from other modules.
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.EnterInspectElementMode, () => {
                void toggleSearchNodeAction.execute();
            }, this);
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(Host.InspectorFrontendHostAPI.Events.RevealSourceLine, this.#revealSourceLine, this);
        await UI.InspectorView.InspectorView.instance().createToolbars();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.loadCompleted();
        const value = Root.Runtime.Runtime.queryParam('loadTimelineFromURL');
        if (value !== null) {
            Timeline.TimelinePanel.LoadTimelineHandler.instance().handleQueryParam(value);
        }
        // Initialize ARIAUtils.alert Element
        UI.ARIAUtils.getOrCreateAlertElements();
        UI.DockController.DockController.instance().announceDockLocation();
        // Allow UI cycles to repaint prior to creating connection.
        window.setTimeout(this.#initializeTarget.bind(this), 0);
        MainImpl.timeEnd('Main._showAppUI');
    }
    async #initializeTarget() {
        MainImpl.time('Main._initializeTarget');
        // We rely on having the early initialization runnables registered in Common when an app loads its
        // modules, so that we don't have to exhaustively check the app DevTools is running as to
        // start the applicable runnables.
        for (const runnableInstanceFunction of Common.Runnable.earlyInitializationRunnables()) {
            await runnableInstanceFunction().run();
        }
        // Used for browser tests.
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.readyForTest();
        this.#resolveReadyForTestPromise();
        // Asynchronously run the extensions.
        window.setTimeout(this.#lateInitialization.bind(this), 100);
        MainImpl.timeEnd('Main._initializeTarget');
    }
    #lateInitialization() {
        MainImpl.time('Main._lateInitialization');
        Extensions.ExtensionServer.ExtensionServer.instance().initializeExtensions();
        const promises = Common.Runnable.lateInitializationRunnables().map(async (lateInitializationLoader) => {
            const runnable = await lateInitializationLoader();
            return runnable.run();
        });
        if (Root.Runtime.experiments.isEnabled('live-heap-profile')) {
            const setting = 'memory-live-heap-profile';
            if (Common.Settings.Settings.instance().moduleSetting(setting).get()) {
                promises.push(PerfUI.LiveHeapProfile.LiveHeapProfile.instance().run());
            }
            else {
                const changeListener = async (event) => {
                    if (!event.data) {
                        return;
                    }
                    Common.Settings.Settings.instance().moduleSetting(setting).removeChangeListener(changeListener);
                    void PerfUI.LiveHeapProfile.LiveHeapProfile.instance().run();
                };
                Common.Settings.Settings.instance().moduleSetting(setting).addChangeListener(changeListener);
            }
        }
        this.#lateInitDonePromise = Promise.all(promises).then(() => undefined);
        MainImpl.timeEnd('Main._lateInitialization');
    }
    lateInitDonePromiseForTest() {
        return this.#lateInitDonePromise;
    }
    readyForTest() {
        return this.#readyForTestPromise;
    }
    #registerMessageSinkListener() {
        Common.Console.Console.instance().addEventListener("messageAdded" /* Common.Console.Events.MessageAdded */, messageAdded);
        function messageAdded({ data: message }) {
            if (message.show) {
                Common.Console.Console.instance().show();
            }
        }
    }
    #revealSourceLine(event) {
        const { url, lineNumber, columnNumber } = event.data;
        const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(url);
        if (uiSourceCode) {
            void Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber, columnNumber));
            return;
        }
        function listener(event) {
            const uiSourceCode = event.data;
            if (uiSourceCode.url() === url) {
                void Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber, columnNumber));
                Workspace.Workspace.WorkspaceImpl.instance().removeEventListener(Workspace.Workspace.Events.UISourceCodeAdded, listener);
            }
        }
        Workspace.Workspace.WorkspaceImpl.instance().addEventListener(Workspace.Workspace.Events.UISourceCodeAdded, listener);
    }
    #postDocumentKeyDown(event) {
        if (!event.handled) {
            UI.ShortcutRegistry.ShortcutRegistry.instance().handleShortcut(event);
        }
    }
    #redispatchClipboardEvent(event) {
        const eventCopy = new CustomEvent('clipboard-' + event.type, { bubbles: true });
        // @ts-ignore Used in ElementsTreeOutline
        eventCopy['original'] = event;
        const document = event.target && event.target.ownerDocument;
        const target = document ? Platform.DOMUtilities.deepActiveElement(document) : null;
        if (target) {
            target.dispatchEvent(eventCopy);
        }
        if (eventCopy.handled) {
            event.preventDefault();
        }
    }
    #contextMenuEventFired(event) {
        if (event.handled || event.target.classList.contains('popup-glasspane')) {
            event.preventDefault();
        }
    }
    #addMainEventListeners(document) {
        document.addEventListener('keydown', this.#postDocumentKeyDown.bind(this), false);
        document.addEventListener('beforecopy', this.#redispatchClipboardEvent.bind(this), true);
        document.addEventListener('copy', this.#redispatchClipboardEvent.bind(this), false);
        document.addEventListener('cut', this.#redispatchClipboardEvent.bind(this), false);
        document.addEventListener('paste', this.#redispatchClipboardEvent.bind(this), false);
        document.addEventListener('contextmenu', this.#contextMenuEventFired.bind(this), true);
    }
    #onSuspendStateChanged() {
        const suspended = SDK.TargetManager.TargetManager.instance().allTargetsSuspended();
        UI.InspectorView.InspectorView.instance().onSuspendStateChanged(suspended);
    }
    static instanceForTest = null;
}
// @ts-ignore Exported for Tests.js
globalThis.Main = globalThis.Main || {};
// @ts-ignore Exported for Tests.js
globalThis.Main.Main = MainImpl;
export class ZoomActionDelegate {
    handleAction(_context, actionId) {
        if (Host.InspectorFrontendHost.InspectorFrontendHostInstance.isHostedMode()) {
            return false;
        }
        switch (actionId) {
            case 'main.zoom-in':
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.zoomIn();
                return true;
            case 'main.zoom-out':
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.zoomOut();
                return true;
            case 'main.zoom-reset':
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.resetZoom();
                return true;
        }
        return false;
    }
}
export class SearchActionDelegate {
    handleAction(_context, actionId) {
        let searchableView = UI.SearchableView.SearchableView.fromElement(Platform.DOMUtilities.deepActiveElement(document));
        if (!searchableView) {
            const currentPanel = UI.InspectorView.InspectorView.instance().currentPanelDeprecated();
            if (currentPanel && currentPanel.searchableView) {
                searchableView = currentPanel.searchableView();
            }
            if (!searchableView) {
                return false;
            }
        }
        switch (actionId) {
            case 'main.search-in-panel.find':
                return searchableView.handleFindShortcut();
            case 'main.search-in-panel.cancel':
                return searchableView.handleCancelSearchShortcut();
            case 'main.search-in-panel.find-next':
                return searchableView.handleFindNextShortcut();
            case 'main.search-in-panel.find-previous':
                return searchableView.handleFindPreviousShortcut();
        }
        return false;
    }
}
let mainMenuItemInstance;
export class MainMenuItem {
    #itemInternal;
    constructor() {
        this.#itemInternal = new UI.Toolbar.ToolbarMenuButton(this.#handleContextMenu.bind(this), /* isIconDropdown */ true, /* useSoftMenu */ true, 'main-menu');
        this.#itemInternal.setGlyph('dots-vertical');
        this.#itemInternal.element.classList.add('main-menu');
        this.#itemInternal.setTitle(i18nString(UIStrings.customizeAndControlDevtools));
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!mainMenuItemInstance || forceNew) {
            mainMenuItemInstance = new MainMenuItem();
        }
        return mainMenuItemInstance;
    }
    item() {
        return this.#itemInternal;
    }
    #handleContextMenu(contextMenu) {
        if (UI.DockController.DockController.instance().canDock()) {
            const dockItemElement = document.createElement('div');
            dockItemElement.classList.add('flex-centered');
            dockItemElement.classList.add('flex-auto');
            dockItemElement.classList.add('location-menu');
            dockItemElement.tabIndex = -1;
            UI.ARIAUtils.setLabel(dockItemElement, UIStrings.dockSide + UIStrings.dockSideNaviation);
            const titleElement = dockItemElement.createChild('span', 'dockside-title');
            titleElement.textContent = i18nString(UIStrings.dockSide);
            const toggleDockSideShorcuts = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction('main.toggle-dock');
            UI.Tooltip.Tooltip.install(titleElement, i18nString(UIStrings.placementOfDevtoolsRelativeToThe, { PH1: toggleDockSideShorcuts[0].title() }));
            dockItemElement.appendChild(titleElement);
            const dockItemToolbar = new UI.Toolbar.Toolbar('', dockItemElement);
            dockItemElement.setAttribute('jslog', `${VisualLogging.item('dock-side').track({ keydown: 'ArrowDown|ArrowLeft|ArrowRight' })}`);
            dockItemToolbar.makeBlueOnHover();
            const undock = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.undockIntoSeparateWindow), 'dock-window', undefined, 'undock');
            const bottom = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.dockToBottom), 'dock-bottom', undefined, 'dock-bottom');
            const right = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.dockToRight), 'dock-right', undefined, 'dock-right');
            const left = new UI.Toolbar.ToolbarToggle(i18nString(UIStrings.dockToLeft), 'dock-left', undefined, 'dock-left');
            undock.addEventListener("MouseDown" /* UI.Toolbar.ToolbarButton.Events.MouseDown */, event => event.data.consume());
            bottom.addEventListener("MouseDown" /* UI.Toolbar.ToolbarButton.Events.MouseDown */, event => event.data.consume());
            right.addEventListener("MouseDown" /* UI.Toolbar.ToolbarButton.Events.MouseDown */, event => event.data.consume());
            left.addEventListener("MouseDown" /* UI.Toolbar.ToolbarButton.Events.MouseDown */, event => event.data.consume());
            undock.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, setDockSide.bind(null, "undocked" /* UI.DockController.DockState.UNDOCKED */));
            bottom.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, setDockSide.bind(null, "bottom" /* UI.DockController.DockState.BOTTOM */));
            right.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, setDockSide.bind(null, "right" /* UI.DockController.DockState.RIGHT */));
            left.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, setDockSide.bind(null, "left" /* UI.DockController.DockState.LEFT */));
            undock.setToggled(UI.DockController.DockController.instance().dockSide() === "undocked" /* UI.DockController.DockState.UNDOCKED */);
            bottom.setToggled(UI.DockController.DockController.instance().dockSide() === "bottom" /* UI.DockController.DockState.BOTTOM */);
            right.setToggled(UI.DockController.DockController.instance().dockSide() === "right" /* UI.DockController.DockState.RIGHT */);
            left.setToggled(UI.DockController.DockController.instance().dockSide() === "left" /* UI.DockController.DockState.LEFT */);
            dockItemToolbar.appendToolbarItem(undock);
            dockItemToolbar.appendToolbarItem(left);
            dockItemToolbar.appendToolbarItem(bottom);
            dockItemToolbar.appendToolbarItem(right);
            dockItemElement.addEventListener('keydown', event => {
                let dir = 0;
                if (event.key === 'ArrowLeft') {
                    dir = -1;
                }
                else if (event.key === 'ArrowRight') {
                    dir = 1;
                }
                else if (event.key === 'ArrowDown') {
                    const contextMenuElement = dockItemElement.closest('.soft-context-menu');
                    contextMenuElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
                    return;
                }
                else {
                    return;
                }
                const buttons = [undock, left, bottom, right];
                let index = buttons.findIndex(button => button.element.hasFocus());
                index = Platform.NumberUtilities.clamp(index + dir, 0, buttons.length - 1);
                buttons[index].element.focus();
                event.consume(true);
            });
            contextMenu.headerSection().appendCustomItem(dockItemElement, 'dock-side');
        }
        const button = this.#itemInternal.element;
        function setDockSide(side) {
            void UI.DockController.DockController.instance().once("AfterDockSideChanged" /* UI.DockController.Events.AfterDockSideChanged */).then(() => {
                button.focus();
            });
            UI.DockController.DockController.instance().setDockSide(side);
            contextMenu.discard();
        }
        if (UI.DockController.DockController.instance().dockSide() === "undocked" /* UI.DockController.DockState.UNDOCKED */) {
            const mainTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
            if (mainTarget && mainTarget.type() === SDK.Target.Type.Frame) {
                contextMenu.defaultSection().appendAction('inspector-main.focus-debuggee', i18nString(UIStrings.focusDebuggee));
            }
        }
        contextMenu.defaultSection().appendAction('main.toggle-drawer', UI.InspectorView.InspectorView.instance().drawerVisible() ? i18nString(UIStrings.hideConsoleDrawer) :
            i18nString(UIStrings.showConsoleDrawer));
        contextMenu.appendItemsAtLocation('mainMenu');
        const moreTools = contextMenu.defaultSection().appendSubMenuItem(i18nString(UIStrings.moreTools), false, 'more-tools');
        const viewExtensions = UI.ViewManager.getRegisteredViewExtensions();
        viewExtensions.sort((extension1, extension2) => {
            const title1 = extension1.title();
            const title2 = extension2.title();
            return title1.localeCompare(title2);
        });
        for (const viewExtension of viewExtensions) {
            const location = viewExtension.location();
            const persistence = viewExtension.persistence();
            const title = viewExtension.title();
            const id = viewExtension.viewId();
            if (id === 'issues-pane') {
                moreTools.defaultSection().appendItem(title, () => {
                    Host.userMetrics.issuesPanelOpenedFrom(3 /* Host.UserMetrics.IssueOpener.HamburgerMenu */);
                    void UI.ViewManager.ViewManager.instance().showView('issues-pane', /* userGesture */ true);
                }, { jslogContext: id });
                continue;
            }
            if (persistence !== 'closeable') {
                continue;
            }
            if (location !== 'drawer-view' && location !== 'panel') {
                continue;
            }
            if (viewExtension.isPreviewFeature()) {
                const additionalElement = IconButton.Icon.create('experiment');
                moreTools.defaultSection().appendItem(title, () => {
                    void UI.ViewManager.ViewManager.instance().showView(id, true, false);
                }, { disabled: false, additionalElement, jslogContext: id });
                continue;
            }
            moreTools.defaultSection().appendItem(title, () => {
                void UI.ViewManager.ViewManager.instance().showView(id, true, false);
            }, { jslogContext: id });
        }
        const helpSubMenu = contextMenu.footerSection().appendSubMenuItem(i18nString(UIStrings.help), false, 'help');
        helpSubMenu.appendItemsAtLocation('mainMenuHelp');
    }
}
let settingsButtonProviderInstance;
export class SettingsButtonProvider {
    #settingsButton;
    constructor() {
        const settingsActionId = 'settings.show';
        this.#settingsButton =
            UI.Toolbar.Toolbar.createActionButtonForId(settingsActionId, { showLabel: false, userActionCode: undefined });
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!settingsButtonProviderInstance || forceNew) {
            settingsButtonProviderInstance = new SettingsButtonProvider();
        }
        return settingsButtonProviderInstance;
    }
    item() {
        return this.#settingsButton;
    }
}
export class PauseListener {
    constructor() {
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerPaused, this.#debuggerPaused, this);
    }
    #debuggerPaused(event) {
        SDK.TargetManager.TargetManager.instance().removeModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerPaused, this.#debuggerPaused, this);
        const debuggerModel = event.data;
        const debuggerPausedDetails = debuggerModel.debuggerPausedDetails();
        UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
        void Common.Revealer.reveal(debuggerPausedDetails);
    }
}
export function sendOverProtocol(method, params) {
    return new Promise((resolve, reject) => {
        const sendRawMessage = ProtocolClient.InspectorBackend.test.sendRawMessage;
        if (!sendRawMessage) {
            return reject('Unable to send message to test client');
        }
        sendRawMessage(method, params, (err, ...results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        });
    });
}
export class ReloadActionDelegate {
    handleAction(_context, actionId) {
        switch (actionId) {
            case 'main.debug-reload':
                Components.Reload.reload();
                return true;
        }
        return false;
    }
}
//# sourceMappingURL=MainImpl.js.map