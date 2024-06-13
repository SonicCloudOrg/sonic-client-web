// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 * Copyright (C) 2011 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Breakpoints from '../../models/breakpoints/breakpoints.js';
import * as Extensions from '../../models/extensions/extensions.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as ObjectUI from '../../ui/legacy/components/object_ui/object_ui.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import * as Snippets from '../snippets/snippets.js';
import { CallStackSidebarPane } from './CallStackSidebarPane.js';
import { DebuggerPausedMessage } from './DebuggerPausedMessage.js';
import { NavigatorView } from './NavigatorView.js';
import sourcesPanelStyles from './sourcesPanel.css.js';
import { SourcesView } from './SourcesView.js';
import { ThreadsSidebarPane } from './ThreadsSidebarPane.js';
import { UISourceCodeFrame } from './UISourceCodeFrame.js';
const UIStrings = {
    /**
     *@description Text that appears when user drag and drop something (for example, a file) in Sources Panel of the Sources panel
     */
    dropWorkspaceFolderHere: 'Drop workspace folder here',
    /**
     *@description Text to show more options
     */
    moreOptions: 'More options',
    /**
     * @description Tooltip for the the navigator toggle in the Sources panel. Command to open/show the
     * sidebar containing the navigator tool.
     */
    showNavigator: 'Show navigator',
    /**
     * @description Tooltip for the the navigator toggle in the Sources panel. Command to close/hide
     * the sidebar containing the navigator tool.
     */
    hideNavigator: 'Hide navigator',
    /**
     * @description Screen reader announcement when the navigator sidebar is shown in the Sources panel.
     */
    navigatorShown: 'Navigator sidebar shown',
    /**
     * @description Screen reader announcement when the navigator sidebar is hidden in the Sources panel.
     */
    navigatorHidden: 'Navigator sidebar hidden',
    /**
     * @description Screen reader announcement when the navigator sidebar is shown in the Sources panel.
     */
    debuggerShown: 'Debugger sidebar shown',
    /**
     * @description Screen reader announcement when the navigator sidebar is hidden in the Sources panel.
     */
    debuggerHidden: 'Debugger sidebar hidden',
    /**
     * @description Tooltip for the the debugger toggle in the Sources panel. Command to open/show the
     * sidebar containing the debugger tool.
     */
    showDebugger: 'Show debugger',
    /**
     * @description Tooltip for the the debugger toggle in the Sources panel. Command to close/hide the
     * sidebar containing the debugger tool.
     */
    hideDebugger: 'Hide debugger',
    /**
     *@description Text in Sources Panel of the Sources panel
     */
    groupByFolder: 'Group by folder',
    /**
     *@description Text in Sources Panel of the Sources panel
     */
    groupByAuthored: 'Group by Authored/Deployed',
    /**
     *@description Text in Sources Panel of the Sources panel
     */
    hideIgnoreListed: 'Hide ignore-listed sources',
    /**
     *@description Tooltip text that appears when hovering over the largeicon play button in the Sources Panel of the Sources panel
     */
    resumeWithAllPausesBlockedForMs: 'Resume with all pauses blocked for 500 ms',
    /**
     *@description Tooltip text that appears when hovering over the largeicon terminate execution button in the Sources Panel of the Sources panel
     */
    terminateCurrentJavascriptCall: 'Terminate current JavaScript call',
    /**
     *@description Text in Sources Panel of the Sources panel
     */
    pauseOnCaughtExceptions: 'Pause on caught exceptions',
    /**
     *@description A context menu item in the Sources Panel of the Sources panel
     */
    revealInSidebar: 'Reveal in navigator sidebar',
    /**
     *@description A context menu item in the Sources Panel of the Sources panel when debugging JS code.
     * When clicked, the execution is resumed until it reaches the line specified by the right-click that
     * opened the context menu.
     */
    continueToHere: 'Continue to here',
    /**
     *@description A context menu item in the Console that stores selection as a temporary global variable
     */
    storeAsGlobalVariable: 'Store as global variable',
    /**
     *@description A context menu item in the Console, Sources, and Network panel
     *@example {string} PH1
     */
    copyS: 'Copy {PH1}',
    /**
     *@description A context menu item for strings in the Console, Sources, and Network panel.
     * When clicked, the raw contents of the string is copied to the clipboard.
     */
    copyStringContents: 'Copy string contents',
    /**
     *@description A context menu item for strings in the Console, Sources, and Network panel.
     * When clicked, the string is copied to the clipboard as a valid JavaScript literal.
     */
    copyStringAsJSLiteral: 'Copy string as JavaScript literal',
    /**
     *@description A context menu item for strings in the Console, Sources, and Network panel.
     * When clicked, the string is copied to the clipboard as a valid JSON literal.
     */
    copyStringAsJSONLiteral: 'Copy string as JSON literal',
    /**
     *@description A context menu item in the Sources Panel of the Sources panel
     */
    showFunctionDefinition: 'Show function definition',
    /**
     *@description Text in Sources Panel of the Sources panel
     */
    openInSourcesPanel: 'Open in Sources panel',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/SourcesPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const primitiveRemoteObjectTypes = new Set(['number', 'boolean', 'bigint', 'undefined']);
let sourcesPanelInstance;
export class SourcesPanel extends UI.Panel.Panel {
    workspace;
    togglePauseAction;
    stepOverAction;
    stepIntoAction;
    stepOutAction;
    stepAction;
    toggleBreakpointsActiveAction;
    debugToolbar;
    debugToolbarDrawer;
    debuggerPausedMessage;
    overlayLoggables;
    splitWidget;
    editorView;
    navigatorTabbedLocation;
    sourcesViewInternal;
    toggleNavigatorSidebarButton;
    toggleDebuggerSidebarButton;
    threadsSidebarPane;
    watchSidebarPane;
    callstackPane;
    liveLocationPool;
    lastModificationTime;
    pausedInternal;
    switchToPausedTargetTimeout;
    ignoreExecutionLineEvents;
    executionLineLocation;
    pauseOnExceptionButton;
    sidebarPaneStack;
    tabbedLocationHeader;
    extensionSidebarPanesContainer;
    sidebarPaneView;
    constructor() {
        super('sources');
        new UI.DropTarget.DropTarget(this.element, [UI.DropTarget.Type.Folder], i18nString(UIStrings.dropWorkspaceFolderHere), this.handleDrop.bind(this));
        this.workspace = Workspace.Workspace.WorkspaceImpl.instance();
        this.togglePauseAction = UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.toggle-pause');
        this.stepOverAction = UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.step-over');
        this.stepIntoAction = UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.step-into');
        this.stepOutAction = UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.step-out');
        this.stepAction = UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.step');
        this.toggleBreakpointsActiveAction =
            UI.ActionRegistry.ActionRegistry.instance().getAction('debugger.toggle-breakpoints-active');
        this.debugToolbar = this.createDebugToolbar();
        this.debugToolbarDrawer = this.createDebugToolbarDrawer();
        this.debuggerPausedMessage = new DebuggerPausedMessage();
        const initialDebugSidebarWidth = 225;
        this.splitWidget =
            new UI.SplitWidget.SplitWidget(true, true, 'sources-panel-split-view-state', initialDebugSidebarWidth);
        this.splitWidget.enableShowModeSaving();
        this.splitWidget.show(this.element);
        // Create scripts navigator
        const initialNavigatorWidth = 225;
        this.editorView =
            new UI.SplitWidget.SplitWidget(true, false, 'sources-panel-navigator-split-view-state', initialNavigatorWidth);
        this.editorView.enableShowModeSaving();
        this.splitWidget.setMainWidget(this.editorView);
        // Create navigator tabbed pane with toolbar.
        this.navigatorTabbedLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(this.revealNavigatorSidebar.bind(this), 'navigator-view', true, true);
        const tabbedPane = this.navigatorTabbedLocation.tabbedPane();
        tabbedPane.setMinimumSize(100, 25);
        tabbedPane.element.classList.add('navigator-tabbed-pane');
        tabbedPane.headerElement().setAttribute('jslog', `${VisualLogging.toolbar('navigator').track({ keydown: 'ArrowUp|ArrowLeft|ArrowDown|ArrowRight|Enter|Space' })}`);
        const navigatorMenuButton = new UI.Toolbar.ToolbarMenuButton(this.populateNavigatorMenu.bind(this), /* isIconDropdown */ true, /* useSoftMenu */ true, 'more-options');
        navigatorMenuButton.setGlyph('dots-vertical');
        navigatorMenuButton.setTitle(i18nString(UIStrings.moreOptions));
        tabbedPane.rightToolbar().appendToolbarItem(navigatorMenuButton);
        tabbedPane.addEventListener(UI.TabbedPane.Events.TabSelected, ({ data: { tabId } }) => Host.userMetrics.sourcesSidebarTabShown(tabId));
        if (UI.ViewManager.ViewManager.instance().hasViewsForLocation('run-view-sidebar')) {
            const navigatorSplitWidget = new UI.SplitWidget.SplitWidget(false, true, 'source-panel-navigator-sidebar-split-view-state');
            navigatorSplitWidget.setMainWidget(tabbedPane);
            const runViewTabbedPane = UI.ViewManager.ViewManager.instance()
                .createTabbedLocation(this.revealNavigatorSidebar.bind(this), 'run-view-sidebar')
                .tabbedPane();
            navigatorSplitWidget.setSidebarWidget(runViewTabbedPane);
            navigatorSplitWidget.installResizer(runViewTabbedPane.headerElement());
            this.editorView.setSidebarWidget(navigatorSplitWidget);
        }
        else {
            this.editorView.setSidebarWidget(tabbedPane);
        }
        this.sourcesViewInternal = new SourcesView();
        this.sourcesViewInternal.addEventListener("EditorSelected" /* Events.EditorSelected */, this.editorSelected.bind(this));
        this.toggleNavigatorSidebarButton = this.editorView.createShowHideSidebarButton(i18nString(UIStrings.showNavigator), i18nString(UIStrings.hideNavigator), i18nString(UIStrings.navigatorShown), i18nString(UIStrings.navigatorHidden), 'navigator');
        this.toggleDebuggerSidebarButton = this.splitWidget.createShowHideSidebarButton(i18nString(UIStrings.showDebugger), i18nString(UIStrings.hideDebugger), i18nString(UIStrings.debuggerShown), i18nString(UIStrings.debuggerHidden), 'debugger');
        this.editorView.setMainWidget(this.sourcesViewInternal);
        this.threadsSidebarPane = null;
        this.watchSidebarPane = UI.ViewManager.ViewManager.instance().view('sources.watch');
        this.callstackPane = CallStackSidebarPane.instance();
        Common.Settings.Settings.instance()
            .moduleSetting('sidebar-position')
            .addChangeListener(this.updateSidebarPosition.bind(this));
        this.updateSidebarPosition();
        void this.updateDebuggerButtonsAndStatus();
        this.liveLocationPool = new Bindings.LiveLocation.LiveLocationPool();
        this.setTarget(UI.Context.Context.instance().flavor(SDK.Target.Target));
        Common.Settings.Settings.instance()
            .moduleSetting('breakpoints-active')
            .addChangeListener(this.breakpointsActiveStateChanged, this);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.Target.Target, this.onCurrentTargetChanged, this);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DebuggerModel.CallFrame, this.callFrameChanged, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerWasEnabled, this.debuggerWasEnabled, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerPaused, this.debuggerPaused, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebugInfoAttached, this.debugInfoAttached, this);
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.DebuggerResumed, event => this.debuggerResumed(event.data));
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.DebuggerModel.DebuggerModel, SDK.DebuggerModel.Events.GlobalObjectCleared, event => this.debuggerResumed(event.data));
        Extensions.ExtensionServer.ExtensionServer.instance().addEventListener("SidebarPaneAdded" /* Extensions.ExtensionServer.Events.SidebarPaneAdded */, this.extensionSidebarPaneAdded, this);
        SDK.TargetManager.TargetManager.instance().observeTargets(this);
        this.lastModificationTime = -Infinity;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!sourcesPanelInstance || forceNew) {
            sourcesPanelInstance = new SourcesPanel();
        }
        return sourcesPanelInstance;
    }
    static updateResizerAndSidebarButtons(panel) {
        panel.sourcesViewInternal.leftToolbar().removeToolbarItems();
        panel.sourcesViewInternal.rightToolbar().removeToolbarItems();
        panel.sourcesViewInternal.bottomToolbar().removeToolbarItems();
        const isInWrapper = UI.Context.Context.instance().flavor(QuickSourceView) &&
            !UI.InspectorView.InspectorView.instance().isDrawerMinimized();
        if (panel.splitWidget.isVertical() || isInWrapper) {
            panel.splitWidget.uninstallResizer(panel.sourcesViewInternal.toolbarContainerElement());
        }
        else {
            panel.splitWidget.installResizer(panel.sourcesViewInternal.toolbarContainerElement());
        }
        if (!isInWrapper) {
            panel.sourcesViewInternal.leftToolbar().appendToolbarItem(panel.toggleNavigatorSidebarButton);
            if (panel.splitWidget.isVertical()) {
                panel.sourcesViewInternal.rightToolbar().appendToolbarItem(panel.toggleDebuggerSidebarButton);
            }
            else {
                panel.sourcesViewInternal.bottomToolbar().appendToolbarItem(panel.toggleDebuggerSidebarButton);
            }
        }
    }
    targetAdded(_target) {
        this.showThreadsIfNeeded();
    }
    targetRemoved(_target) {
    }
    showThreadsIfNeeded() {
        if (ThreadsSidebarPane.shouldBeShown() && !this.threadsSidebarPane) {
            this.threadsSidebarPane = UI.ViewManager.ViewManager.instance().view('sources.threads');
            if (this.sidebarPaneStack && this.threadsSidebarPane) {
                this.sidebarPaneStack.appendView(this.threadsSidebarPane, this.splitWidget.isVertical() ? this.watchSidebarPane : this.callstackPane);
            }
        }
    }
    setTarget(target) {
        if (!target) {
            return;
        }
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        if (!debuggerModel) {
            return;
        }
        if (debuggerModel.isPaused()) {
            this.showDebuggerPausedDetails(debuggerModel.debuggerPausedDetails());
        }
        else {
            this.pausedInternal = false;
            this.clearInterface();
            this.toggleDebuggerSidebarButton.setEnabled(true);
        }
    }
    onCurrentTargetChanged({ data: target }) {
        this.setTarget(target);
    }
    paused() {
        return this.pausedInternal || false;
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(SourcesPanel, this);
        this.registerCSSFiles([sourcesPanelStyles]);
        super.wasShown();
        if (UI.Context.Context.instance().flavor(QuickSourceView)) {
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(true);
            SourcesPanel.updateResizerAndSidebarButtons(this);
        }
        this.editorView.setMainWidget(this.sourcesViewInternal);
    }
    willHide() {
        super.willHide();
        UI.Context.Context.instance().setFlavor(SourcesPanel, null);
        const wrapperView = UI.Context.Context.instance().flavor(QuickSourceView);
        if (wrapperView) {
            wrapperView.showViewInWrapper();
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(false);
            SourcesPanel.updateResizerAndSidebarButtons(this);
        }
    }
    resolveLocation(locationName) {
        if (locationName === 'sources.sidebar-top' || locationName === 'sources.sidebar-bottom' ||
            locationName === 'sources.sidebar-tabs') {
            return this.sidebarPaneStack || null;
        }
        return this.navigatorTabbedLocation;
    }
    ensureSourcesViewVisible() {
        if (UI.Context.Context.instance().flavor(QuickSourceView)) {
            return true;
        }
        if (!UI.InspectorView.InspectorView.instance().canSelectPanel('sources')) {
            return false;
        }
        void UI.ViewManager.ViewManager.instance().showView('sources');
        return true;
    }
    onResize() {
        if (Common.Settings.Settings.instance().moduleSetting('sidebar-position').get() === 'auto') {
            this.element.window().requestAnimationFrame(this.updateSidebarPosition.bind(this));
        } // Do not force layout.
    }
    searchableView() {
        return this.sourcesViewInternal.searchableView();
    }
    toggleNavigatorSidebar() {
        this.editorView.toggleSidebar();
    }
    toggleDebuggerSidebar() {
        this.splitWidget.toggleSidebar();
    }
    debuggerPaused(event) {
        const debuggerModel = event.data;
        const details = debuggerModel.debuggerPausedDetails();
        if (!this.pausedInternal &&
            Common.Settings.Settings.instance().moduleSetting('auto-focus-on-debugger-paused-enabled').get()) {
            void this.setAsCurrentPanel();
        }
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) === debuggerModel.target()) {
            this.showDebuggerPausedDetails(details);
        }
        else if (!this.pausedInternal) {
            UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
        }
    }
    debugInfoAttached(event) {
        const { debuggerModel } = event.data;
        if (!debuggerModel.isPaused()) {
            return;
        }
        const details = debuggerModel.debuggerPausedDetails();
        if (details && UI.Context.Context.instance().flavor(SDK.Target.Target) === debuggerModel.target()) {
            this.showDebuggerPausedDetails(details);
        }
    }
    showDebuggerPausedDetails(details) {
        this.pausedInternal = true;
        void this.updateDebuggerButtonsAndStatus();
        UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.DebuggerPausedDetails, details);
        this.toggleDebuggerSidebarButton.setEnabled(false);
        this.revealDebuggerSidebar();
        window.focus();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
        if (!this.overlayLoggables &&
            !Common.Settings.Settings.instance().moduleSetting('disable-paused-state-overlay').get()) {
            this.overlayLoggables = { debuggerPausedMessage: {}, resumeButton: {}, stepOverButton: {} };
            VisualLogging.registerLoggable(this.overlayLoggables.debuggerPausedMessage, `${VisualLogging.dialog('debugger-paused')}`, null);
            VisualLogging.registerLoggable(this.overlayLoggables.resumeButton, `${VisualLogging.action('debugger.toggle-pause')}`, this.overlayLoggables.debuggerPausedMessage);
            VisualLogging.registerLoggable(this.overlayLoggables.stepOverButton, `${VisualLogging.action('debugger.step-over')}`, this.overlayLoggables.debuggerPausedMessage);
        }
    }
    maybeLogOverlayAction() {
        if (!this.overlayLoggables) {
            return;
        }
        const byOverlayButton = !document.hasFocus();
        // In the overlary we show two buttons: resume and step over. Both trigger
        // the Debugger.resumed event. The latter however will trigger
        // Debugger.paused shortly after, while the former won't. Here we guess
        // which one was clicked by checking if we are paused again after 0.5s.
        window.setTimeout(() => {
            if (!this.overlayLoggables) {
                return;
            }
            if (byOverlayButton) {
                const details = UI.Context.Context.instance().flavor(SDK.DebuggerModel.DebuggerPausedDetails);
                VisualLogging.logClick(this.pausedInternal && details?.reason === "step" /* Protocol.Debugger.PausedEventReason.Step */ ?
                    this.overlayLoggables.stepOverButton :
                    this.overlayLoggables.resumeButton, new MouseEvent('click'));
            }
            if (!this.pausedInternal) {
                VisualLogging.logResize(this.overlayLoggables.debuggerPausedMessage, new DOMRect(0, 0, 0, 0));
                this.overlayLoggables = undefined;
            }
        }, 500);
    }
    debuggerResumed(debuggerModel) {
        this.maybeLogOverlayAction();
        const target = debuggerModel.target();
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) !== target) {
            return;
        }
        this.pausedInternal = false;
        this.clearInterface();
        this.toggleDebuggerSidebarButton.setEnabled(true);
        this.switchToPausedTargetTimeout = window.setTimeout(this.switchToPausedTarget.bind(this, debuggerModel), 500);
    }
    debuggerWasEnabled(event) {
        const debuggerModel = event.data;
        if (UI.Context.Context.instance().flavor(SDK.Target.Target) !== debuggerModel.target()) {
            return;
        }
        void this.updateDebuggerButtonsAndStatus();
    }
    get visibleView() {
        return this.sourcesViewInternal.visibleView();
    }
    showUISourceCode(uiSourceCode, location, omitFocus) {
        if (omitFocus) {
            if (!this.isShowing() && !UI.Context.Context.instance().flavor(QuickSourceView)) {
                return;
            }
        }
        else {
            this.showEditor();
        }
        this.sourcesViewInternal.showSourceLocation(uiSourceCode, location, omitFocus);
    }
    showEditor() {
        if (UI.Context.Context.instance().flavor(QuickSourceView)) {
            return;
        }
        void this.setAsCurrentPanel();
    }
    showUILocation(uiLocation, omitFocus) {
        const { uiSourceCode, lineNumber, columnNumber } = uiLocation;
        this.showUISourceCode(uiSourceCode, { lineNumber, columnNumber }, omitFocus);
    }
    async revealInNavigator(uiSourceCode, skipReveal) {
        const viewManager = UI.ViewManager.ViewManager.instance();
        for (const view of viewManager.viewsForLocation("navigator-view" /* UI.ViewManager.ViewLocationValues.NAVIGATOR_VIEW */)) {
            const navigatorView = await view.widget();
            if (navigatorView instanceof NavigatorView && navigatorView.acceptProject(uiSourceCode.project())) {
                navigatorView.revealUISourceCode(uiSourceCode, true);
                this.navigatorTabbedLocation.tabbedPane().selectTab(view.viewId(), true);
                if (!skipReveal) {
                    this.editorView.showBoth(true);
                    navigatorView.focus();
                }
                break;
            }
        }
    }
    addExperimentMenuItem(menuSection, experiment, menuItem) {
        // menu handler
        function toggleExperiment() {
            const checked = Root.Runtime.experiments.isEnabled(experiment);
            Root.Runtime.experiments.setEnabled(experiment, !checked);
            Host.userMetrics.experimentChanged(experiment, checked);
            // Need to signal to the NavigatorView that grouping has changed. Unfortunately,
            // it can't listen to an experiment, and this class doesn't directly interact
            // with it, so we will convince it a different grouping setting changed. When we switch
            // from using an experiment to a setting, it will listen to that setting and we
            // won't need to do this.
            const groupByFolderSetting = Common.Settings.Settings.instance().moduleSetting('navigator-group-by-folder');
            groupByFolderSetting.set(groupByFolderSetting.get());
        }
        menuSection.appendCheckboxItem(menuItem, toggleExperiment, {
            checked: Root.Runtime.experiments.isEnabled(experiment),
            additionalElement: IconButton.Icon.create('experiment'),
            jslogContext: Platform.StringUtilities.toKebabCase(experiment),
        });
    }
    populateNavigatorMenu(contextMenu) {
        const groupByFolderSetting = Common.Settings.Settings.instance().moduleSetting('navigator-group-by-folder');
        contextMenu.appendItemsAtLocation('navigatorMenu');
        contextMenu.viewSection().appendCheckboxItem(i18nString(UIStrings.groupByFolder), () => groupByFolderSetting.set(!groupByFolderSetting.get()), { checked: groupByFolderSetting.get(), jslogContext: groupByFolderSetting.name });
        this.addExperimentMenuItem(contextMenu.viewSection(), "authored-deployed-grouping" /* Root.Runtime.ExperimentName.AUTHORED_DEPLOYED_GROUPING */, i18nString(UIStrings.groupByAuthored));
        this.addExperimentMenuItem(contextMenu.viewSection(), "just-my-code" /* Root.Runtime.ExperimentName.JUST_MY_CODE */, i18nString(UIStrings.hideIgnoreListed));
    }
    setIgnoreExecutionLineEvents(ignoreExecutionLineEvents) {
        this.ignoreExecutionLineEvents = ignoreExecutionLineEvents;
    }
    updateLastModificationTime() {
        this.lastModificationTime = window.performance.now();
    }
    async executionLineChanged(liveLocation) {
        const uiLocation = await liveLocation.uiLocation();
        if (liveLocation.isDisposed()) {
            return;
        }
        if (!uiLocation) {
            return;
        }
        if (window.performance.now() - this.lastModificationTime < lastModificationTimeout) {
            return;
        }
        this.sourcesViewInternal.showSourceLocation(uiLocation.uiSourceCode, uiLocation, undefined, true);
    }
    lastModificationTimeoutPassedForTest() {
        lastModificationTimeout = Number.MIN_VALUE;
    }
    updateLastModificationTimeForTest() {
        lastModificationTimeout = Number.MAX_VALUE;
    }
    async callFrameChanged() {
        const callFrame = UI.Context.Context.instance().flavor(SDK.DebuggerModel.CallFrame);
        if (!callFrame) {
            return;
        }
        if (this.executionLineLocation) {
            this.executionLineLocation.dispose();
        }
        this.executionLineLocation =
            await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().createCallFrameLiveLocation(callFrame.location(), this.executionLineChanged.bind(this), this.liveLocationPool);
    }
    async updateDebuggerButtonsAndStatus() {
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        const currentDebuggerModel = currentTarget ? currentTarget.model(SDK.DebuggerModel.DebuggerModel) : null;
        if (!currentDebuggerModel) {
            this.togglePauseAction.setEnabled(false);
            this.stepOverAction.setEnabled(false);
            this.stepIntoAction.setEnabled(false);
            this.stepOutAction.setEnabled(false);
            this.stepAction.setEnabled(false);
        }
        else if (this.pausedInternal) {
            this.togglePauseAction.setToggled(true);
            this.togglePauseAction.setEnabled(true);
            this.stepOverAction.setEnabled(true);
            this.stepIntoAction.setEnabled(true);
            this.stepOutAction.setEnabled(true);
            this.stepAction.setEnabled(true);
        }
        else {
            this.togglePauseAction.setToggled(false);
            this.togglePauseAction.setEnabled(!currentDebuggerModel.isPausing());
            this.stepOverAction.setEnabled(false);
            this.stepIntoAction.setEnabled(false);
            this.stepOutAction.setEnabled(false);
            this.stepAction.setEnabled(false);
        }
        const details = currentDebuggerModel ? currentDebuggerModel.debuggerPausedDetails() : null;
        await this.debuggerPausedMessage.render(details, Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance(), Breakpoints.BreakpointManager.BreakpointManager.instance());
        if (details) {
            this.updateDebuggerButtonsAndStatusForTest();
        }
    }
    updateDebuggerButtonsAndStatusForTest() {
    }
    clearInterface() {
        void this.updateDebuggerButtonsAndStatus();
        UI.Context.Context.instance().setFlavor(SDK.DebuggerModel.DebuggerPausedDetails, null);
        if (this.switchToPausedTargetTimeout) {
            clearTimeout(this.switchToPausedTargetTimeout);
        }
        this.liveLocationPool.disposeAll();
    }
    switchToPausedTarget(debuggerModel) {
        delete this.switchToPausedTargetTimeout;
        if (this.pausedInternal || debuggerModel.isPaused()) {
            return;
        }
        for (const debuggerModel of SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel)) {
            if (debuggerModel.isPaused()) {
                UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
                break;
            }
        }
    }
    runSnippet() {
        const uiSourceCode = this.sourcesViewInternal.currentUISourceCode();
        if (uiSourceCode) {
            void Snippets.ScriptSnippetFileSystem.evaluateScriptSnippet(uiSourceCode);
        }
    }
    editorSelected(event) {
        const uiSourceCode = event.data;
        if (this.editorView.mainWidget() &&
            Common.Settings.Settings.instance().moduleSetting('auto-reveal-in-navigator').get()) {
            void this.revealInNavigator(uiSourceCode, true);
        }
    }
    togglePause() {
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (!target) {
            return true;
        }
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        if (!debuggerModel) {
            return true;
        }
        if (this.pausedInternal) {
            this.pausedInternal = false;
            debuggerModel.resume();
        }
        else {
            // Make sure pauses didn't stick skipped.
            debuggerModel.pause();
        }
        this.clearInterface();
        return true;
    }
    prepareToResume() {
        if (!this.pausedInternal) {
            return null;
        }
        this.pausedInternal = false;
        this.clearInterface();
        const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
        return target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
    }
    longResume() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            debuggerModel.skipAllPausesUntilReloadOrTimeout(500);
            debuggerModel.resume();
        }
    }
    terminateExecution() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            void debuggerModel.runtimeModel().terminateExecution();
            debuggerModel.resume();
        }
    }
    stepOver() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            void debuggerModel.stepOver();
        }
        return true;
    }
    stepInto() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            void debuggerModel.stepInto();
        }
        return true;
    }
    stepIntoAsync() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            debuggerModel.scheduleStepIntoAsync();
        }
        return true;
    }
    stepOut() {
        const debuggerModel = this.prepareToResume();
        if (debuggerModel) {
            void debuggerModel.stepOut();
        }
        return true;
    }
    async continueToLocation(uiLocation) {
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        if (!executionContext) {
            return;
        }
        // Always use 0 column.
        const rawLocations = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().uiLocationToRawLocations(uiLocation.uiSourceCode, uiLocation.lineNumber, 0);
        const rawLocation = rawLocations.find(location => location.debuggerModel === executionContext.debuggerModel);
        if (rawLocation && this.prepareToResume()) {
            rawLocation.continueToLocation();
        }
    }
    toggleBreakpointsActive() {
        Common.Settings.Settings.instance()
            .moduleSetting('breakpoints-active')
            .set(!Common.Settings.Settings.instance().moduleSetting('breakpoints-active').get());
    }
    breakpointsActiveStateChanged() {
        const active = Common.Settings.Settings.instance().moduleSetting('breakpoints-active').get();
        this.toggleBreakpointsActiveAction.setToggled(!active);
        this.sourcesViewInternal.toggleBreakpointsActiveState(active);
    }
    createDebugToolbar() {
        const debugToolbar = new UI.Toolbar.Toolbar('scripts-debug-toolbar');
        debugToolbar.element.setAttribute('jslog', `${VisualLogging.toolbar('debug').track({ keydown: 'ArrowUp|ArrowLeft|ArrowDown|ArrowRight|Enter|Space' })}`);
        const longResumeButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.resumeWithAllPausesBlockedForMs), 'play');
        longResumeButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, this.longResume, this);
        const terminateExecutionButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.terminateCurrentJavascriptCall), 'stop');
        terminateExecutionButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, this.terminateExecution, this);
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createLongPressActionButton(this.togglePauseAction, [terminateExecutionButton, longResumeButton], []));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this.stepOverAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this.stepIntoAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this.stepOutAction));
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this.stepAction));
        debugToolbar.appendSeparator();
        debugToolbar.appendToolbarItem(UI.Toolbar.Toolbar.createActionButton(this.toggleBreakpointsActiveAction));
        return debugToolbar;
    }
    createDebugToolbarDrawer() {
        const debugToolbarDrawer = document.createElement('div');
        debugToolbarDrawer.classList.add('scripts-debug-toolbar-drawer');
        const label = i18nString(UIStrings.pauseOnCaughtExceptions);
        const setting = Common.Settings.Settings.instance().moduleSetting('pause-on-caught-exception');
        debugToolbarDrawer.appendChild(UI.SettingsUI.createSettingCheckbox(label, setting, true));
        return debugToolbarDrawer;
    }
    appendApplicableItems(event, contextMenu, target) {
        if (target instanceof Workspace.UISourceCode.UISourceCode) {
            this.appendUISourceCodeItems(event, contextMenu, target);
            return;
        }
        if (target instanceof UISourceCodeFrame) {
            this.appendUISourceCodeFrameItems(contextMenu, target);
            return;
        }
        if (target instanceof Workspace.UISourceCode.UILocation) {
            this.appendUILocationItems(contextMenu, target);
            return;
        }
        if (target instanceof SDK.RemoteObject.RemoteObject) {
            this.appendRemoteObjectItems(contextMenu, target);
            return;
        }
        this.appendNetworkRequestItems(contextMenu, target);
    }
    appendUISourceCodeItems(event, contextMenu, uiSourceCode) {
        if (!event.target) {
            return;
        }
        const eventTarget = event.target;
        if (!uiSourceCode.project().isServiceProject() &&
            !eventTarget.isSelfOrDescendant(this.navigatorTabbedLocation.widget().element) &&
            !(Root.Runtime.experiments.isEnabled("just-my-code" /* Root.Runtime.ExperimentName.JUST_MY_CODE */) &&
                Bindings.IgnoreListManager.IgnoreListManager.instance().isUserOrSourceMapIgnoreListedUISourceCode(uiSourceCode))) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.revealInSidebar), this.revealInNavigator.bind(this, uiSourceCode), {
                jslogContext: 'sources.reveal-in-navigator-sidebar',
            });
        }
        // Ignore list only works for JavaScript debugging.
        if (uiSourceCode.contentType().hasScripts() &&
            Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()
                .scriptsForUISourceCode(uiSourceCode)
                .every(script => script.isJavaScript())) {
            this.callstackPane.appendIgnoreListURLContextMenuItems(contextMenu, uiSourceCode);
        }
    }
    appendUISourceCodeFrameItems(contextMenu, target) {
        if (target.uiSourceCode().contentType().isFromSourceMap() || target.textEditor.state.selection.main.empty) {
            return;
        }
        contextMenu.debugSection().appendAction('debugger.evaluate-selection');
    }
    appendUILocationItems(contextMenu, uiLocation) {
        const uiSourceCode = uiLocation.uiSourceCode;
        if (!Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()
            .scriptsForUISourceCode(uiSourceCode)
            .every(script => script.isJavaScript())) {
            // Ignore List and 'Continue to here' currently only works for JavaScript debugging.
            return;
        }
        const contentType = uiSourceCode.contentType();
        if (contentType.hasScripts()) {
            const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
            const debuggerModel = target ? target.model(SDK.DebuggerModel.DebuggerModel) : null;
            if (debuggerModel && debuggerModel.isPaused()) {
                contextMenu.debugSection().appendItem(i18nString(UIStrings.continueToHere), this.continueToLocation.bind(this, uiLocation), { jslogContext: 'continue-to-here' });
            }
            this.callstackPane.appendIgnoreListURLContextMenuItems(contextMenu, uiSourceCode);
        }
    }
    appendRemoteObjectItems(contextMenu, remoteObject) {
        const indent = Common.Settings.Settings.instance().moduleSetting('text-editor-indent').get();
        const executionContext = UI.Context.Context.instance().flavor(SDK.RuntimeModel.ExecutionContext);
        function getObjectTitle() {
            if (remoteObject.type === 'wasm') {
                return remoteObject.subtype;
            }
            if (remoteObject.subtype === 'node') {
                return 'outerHTML';
            }
            return remoteObject.type;
        }
        const copyContextMenuTitle = getObjectTitle();
        contextMenu.debugSection().appendItem(i18nString(UIStrings.storeAsGlobalVariable), () => executionContext?.target()
            .model(SDK.ConsoleModel.ConsoleModel)
            ?.saveToTempVariable(executionContext, remoteObject), { jslogContext: 'store-as-global-variable' });
        const ctxMenuClipboardSection = contextMenu.clipboardSection();
        const inspectorFrontendHost = Host.InspectorFrontendHost.InspectorFrontendHostInstance;
        if (remoteObject.type === 'string') {
            ctxMenuClipboardSection.appendItem(i18nString(UIStrings.copyStringContents), () => {
                inspectorFrontendHost.copyText(remoteObject.value);
            }, { jslogContext: 'copy-string-contents' });
            ctxMenuClipboardSection.appendItem(i18nString(UIStrings.copyStringAsJSLiteral), () => {
                inspectorFrontendHost.copyText(Platform.StringUtilities.formatAsJSLiteral(remoteObject.value));
            }, { jslogContext: 'copy-string-as-js-literal' });
            ctxMenuClipboardSection.appendItem(i18nString(UIStrings.copyStringAsJSONLiteral), () => {
                inspectorFrontendHost.copyText(JSON.stringify(remoteObject.value));
            }, { jslogContext: 'copy-string-as-json-literal' });
        }
        // We are trying to copy a primitive value.
        else if (primitiveRemoteObjectTypes.has(remoteObject.type)) {
            ctxMenuClipboardSection.appendItem(i18nString(UIStrings.copyS, { PH1: String(copyContextMenuTitle) }), () => {
                inspectorFrontendHost.copyText(remoteObject.description);
            }, { jslogContext: 'copy-primitive' });
        }
        // We are trying to copy a remote object.
        else if (remoteObject.type === 'object') {
            const copyDecodedValueHandler = async () => {
                const result = await remoteObject.callFunctionJSON(toStringForClipboard, [{
                        value: {
                            subtype: remoteObject.subtype,
                            indent: indent,
                        },
                    }]);
                inspectorFrontendHost.copyText(result);
            };
            ctxMenuClipboardSection.appendItem(i18nString(UIStrings.copyS, { PH1: String(copyContextMenuTitle) }), copyDecodedValueHandler, { jslogContext: 'copy-object' });
        }
        else if (remoteObject.type === 'function') {
            contextMenu.debugSection().appendItem(i18nString(UIStrings.showFunctionDefinition), this.showFunctionDefinition.bind(this, remoteObject), { jslogContext: 'show-function-definition' });
        }
        function toStringForClipboard(data) {
            const subtype = data.subtype;
            const indent = data.indent;
            if (subtype === 'map') {
                if (this instanceof Map) {
                    const elements = Array.from(this.entries());
                    const literal = elements.length === 0 ? '' : JSON.stringify(elements, null, indent);
                    return `new Map(${literal})`;
                }
                return undefined;
            }
            if (subtype === 'set') {
                if (this instanceof Set) {
                    const values = Array.from(this.values());
                    const literal = values.length === 0 ? '' : JSON.stringify(values, null, indent);
                    return `new Set(${literal})`;
                }
                return undefined;
            }
            if (subtype === 'node') {
                return this instanceof Element ? this.outerHTML : undefined;
            }
            if (subtype && typeof this === 'undefined') {
                return String(subtype);
            }
            try {
                return JSON.stringify(this, null, indent);
            }
            catch (error) {
                return String(this);
            }
        }
    }
    appendNetworkRequestItems(contextMenu, request) {
        const uiSourceCode = this.workspace.uiSourceCodeForURL(request.url());
        if (!uiSourceCode) {
            return;
        }
        const openText = i18nString(UIStrings.openInSourcesPanel);
        const callback = this.showUILocation.bind(this, uiSourceCode.uiLocation(0, 0));
        contextMenu.revealSection().appendItem(openText, callback, { jslogContext: 'reveal-in-sources' });
    }
    showFunctionDefinition(remoteObject) {
        void SDK.RemoteObject.RemoteFunction.objectAsFunction(remoteObject)
            .targetFunction()
            .then(targetFunction => targetFunction.debuggerModel()
            .functionDetailsPromise(targetFunction)
            .then(this.didGetFunctionDetails.bind(this)));
    }
    async didGetFunctionDetails(response) {
        if (!response || !response.location) {
            return;
        }
        const uiLocation = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(response.location);
        if (uiLocation) {
            this.showUILocation(uiLocation);
        }
    }
    revealNavigatorSidebar() {
        void this.setAsCurrentPanel();
        this.editorView.showBoth(true);
    }
    revealDebuggerSidebar() {
        if (!Common.Settings.Settings.instance().moduleSetting('auto-focus-on-debugger-paused-enabled').get()) {
            return;
        }
        void this.setAsCurrentPanel();
        this.splitWidget.showBoth(true);
    }
    updateSidebarPosition() {
        let vertically;
        const position = Common.Settings.Settings.instance().moduleSetting('sidebar-position').get();
        if (position === 'right') {
            vertically = false;
        }
        else if (position === 'bottom') {
            vertically = true;
        }
        else {
            vertically = UI.InspectorView.InspectorView.instance().element.offsetWidth < 680;
        }
        if (this.sidebarPaneView && vertically === !this.splitWidget.isVertical()) {
            return;
        }
        if (this.sidebarPaneView && this.sidebarPaneView.shouldHideOnDetach()) {
            return;
        } // We can't reparent extension iframes.
        if (this.sidebarPaneView) {
            this.sidebarPaneView.detach();
        }
        this.splitWidget.setVertical(!vertically);
        this.splitWidget.element.classList.toggle('sources-split-view-vertical', vertically);
        SourcesPanel.updateResizerAndSidebarButtons(this);
        // Create vertical box with stack.
        const vbox = new UI.Widget.VBox();
        vbox.element.appendChild(this.debugToolbar.element);
        vbox.element.appendChild(this.debugToolbarDrawer);
        vbox.setMinimumAndPreferredSizes(minToolbarWidth, 25, minToolbarWidth, 100);
        this.sidebarPaneStack = UI.ViewManager.ViewManager.instance().createStackLocation(this.revealDebuggerSidebar.bind(this), undefined, 'debug');
        this.sidebarPaneStack.widget().element.classList.add('overflow-auto');
        this.sidebarPaneStack.widget().show(vbox.element);
        this.sidebarPaneStack.widget().element.appendChild(this.debuggerPausedMessage.element());
        this.sidebarPaneStack.appendApplicableItems('sources.sidebar-top');
        if (this.threadsSidebarPane) {
            this.sidebarPaneStack.appendView(this.threadsSidebarPane);
        }
        const jsBreakpoints = UI.ViewManager.ViewManager.instance().view('sources.js-breakpoints');
        const scopeChainView = UI.ViewManager.ViewManager.instance().view('sources.scope-chain');
        if (this.tabbedLocationHeader) {
            this.splitWidget.uninstallResizer(this.tabbedLocationHeader);
            this.tabbedLocationHeader = null;
        }
        if (!vertically) {
            // Populate the rest of the stack.
            this.sidebarPaneStack.appendView(this.watchSidebarPane);
            void this.sidebarPaneStack.showView(jsBreakpoints);
            void this.sidebarPaneStack.showView(scopeChainView);
            void this.sidebarPaneStack.showView(this.callstackPane);
            this.extensionSidebarPanesContainer = this.sidebarPaneStack;
            this.sidebarPaneView = vbox;
            this.splitWidget.uninstallResizer(this.debugToolbar.gripElementForResize());
        }
        else {
            const splitWidget = new UI.SplitWidget.SplitWidget(true, true, 'sources-panel-debugger-sidebar-split-view-state', 0.5);
            splitWidget.setMainWidget(vbox);
            // Populate the left stack.
            void this.sidebarPaneStack.showView(jsBreakpoints);
            void this.sidebarPaneStack.showView(this.callstackPane);
            const tabbedLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(this.revealDebuggerSidebar.bind(this));
            splitWidget.setSidebarWidget(tabbedLocation.tabbedPane());
            this.tabbedLocationHeader = tabbedLocation.tabbedPane().headerElement();
            this.splitWidget.installResizer(this.tabbedLocationHeader);
            this.splitWidget.installResizer(this.debugToolbar.gripElementForResize());
            tabbedLocation.appendView(scopeChainView);
            tabbedLocation.appendView(this.watchSidebarPane);
            tabbedLocation.appendApplicableItems('sources.sidebar-tabs');
            this.extensionSidebarPanesContainer = tabbedLocation;
            this.sidebarPaneView = splitWidget;
        }
        this.sidebarPaneStack.appendApplicableItems('sources.sidebar-bottom');
        const extensionSidebarPanes = Extensions.ExtensionServer.ExtensionServer.instance().sidebarPanes();
        for (let i = 0; i < extensionSidebarPanes.length; ++i) {
            this.addExtensionSidebarPane(extensionSidebarPanes[i]);
        }
        this.splitWidget.setSidebarWidget(this.sidebarPaneView);
    }
    setAsCurrentPanel() {
        return UI.ViewManager.ViewManager.instance().showView('sources');
    }
    extensionSidebarPaneAdded(event) {
        this.addExtensionSidebarPane(event.data);
    }
    addExtensionSidebarPane(pane) {
        if (pane.panelName() === this.name) {
            this.extensionSidebarPanesContainer.appendView(pane);
        }
    }
    sourcesView() {
        return this.sourcesViewInternal;
    }
    handleDrop(dataTransfer) {
        const items = dataTransfer.items;
        if (!items.length) {
            return;
        }
        const entry = items[0].webkitGetAsEntry();
        if (entry && entry.isDirectory) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.upgradeDraggedFileSystemPermissions(entry.filesystem);
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.WorkspaceDropFolder);
            void UI.ViewManager.ViewManager.instance().showView('navigator-files');
        }
    }
}
export let lastModificationTimeout = 200;
export const minToolbarWidth = 215;
export class UILocationRevealer {
    async reveal(uiLocation, omitFocus) {
        SourcesPanel.instance().showUILocation(uiLocation, omitFocus);
    }
}
export class UILocationRangeRevealer {
    static #instance;
    static instance(opts = { forceNew: false }) {
        if (!UILocationRangeRevealer.#instance || opts.forceNew) {
            UILocationRangeRevealer.#instance = new UILocationRangeRevealer();
        }
        return UILocationRangeRevealer.#instance;
    }
    async reveal(uiLocationRange, omitFocus) {
        const { uiSourceCode, range: { start: from, end: to } } = uiLocationRange;
        SourcesPanel.instance().showUISourceCode(uiSourceCode, { from, to }, omitFocus);
    }
}
export class DebuggerLocationRevealer {
    async reveal(rawLocation, omitFocus) {
        const uiLocation = await Bindings.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance().rawLocationToUILocation(rawLocation);
        if (uiLocation) {
            SourcesPanel.instance().showUILocation(uiLocation, omitFocus);
        }
    }
}
export class UISourceCodeRevealer {
    async reveal(uiSourceCode, omitFocus) {
        SourcesPanel.instance().showUISourceCode(uiSourceCode, undefined, omitFocus);
    }
}
export class DebuggerPausedDetailsRevealer {
    async reveal(_object) {
        if (Common.Settings.Settings.instance().moduleSetting('auto-focus-on-debugger-paused-enabled').get()) {
            return SourcesPanel.instance().setAsCurrentPanel();
        }
    }
}
export class RevealingActionDelegate {
    handleAction(context, actionId) {
        const panel = SourcesPanel.instance();
        if (!panel.ensureSourcesViewVisible()) {
            return false;
        }
        switch (actionId) {
            case 'debugger.toggle-pause': {
                // This action can be triggered both on the DevTools front-end itself,
                // or on the inspected target. If triggered on the DevTools front-end,
                // it will take care of resuming.
                //
                // If triggered on the target, NOT in hosted mode:
                //   * ..and the paused overlay is enabled:
                //       => do not take any action here, as the paused overlay will resume
                //   * ..and the paused overlay is disabled:
                //       => take care of the resume here
                // If triggered on the target in hosted mode:
                //   * ..and the paused overlay is enabled:
                //       => execution will not reach here, as shortcuts are not forwarded
                //          and the paused overlay will resume
                //   * ..and the paused overlay is disabled:
                //       => overlay will not take care of resume, and neither will
                //          DevTools as no shortcuts are forwarded from the target
                // Do not trigger a resume action, if: the shortcut was forwarded and the
                // paused overlay is enabled.
                const actionHandledInPausedOverlay = context.flavor(UI.ShortcutRegistry.ForwardedShortcut) &&
                    !Common.Settings.Settings.instance().moduleSetting('disable-paused-state-overlay').get();
                if (actionHandledInPausedOverlay) {
                    // Taken care of by inspector overlay: handled set to true to
                    // register user metric.
                    return true;
                }
                panel.togglePause();
                return true;
            }
        }
        return false;
    }
}
export class ActionDelegate {
    handleAction(context, actionId) {
        const panel = SourcesPanel.instance();
        switch (actionId) {
            case 'debugger.step-over': {
                panel.stepOver();
                return true;
            }
            case 'debugger.step-into': {
                panel.stepIntoAsync();
                return true;
            }
            case 'debugger.step': {
                panel.stepInto();
                return true;
            }
            case 'debugger.step-out': {
                panel.stepOut();
                return true;
            }
            case 'debugger.run-snippet': {
                panel.runSnippet();
                return true;
            }
            case 'debugger.toggle-breakpoints-active': {
                panel.toggleBreakpointsActive();
                return true;
            }
            case 'debugger.evaluate-selection': {
                const frame = context.flavor(UISourceCodeFrame);
                if (frame) {
                    const { state: editorState } = frame.textEditor;
                    let text = editorState.sliceDoc(editorState.selection.main.from, editorState.selection.main.to);
                    const executionContext = context.flavor(SDK.RuntimeModel.ExecutionContext);
                    const consoleModel = executionContext?.target().model(SDK.ConsoleModel.ConsoleModel);
                    if (executionContext && consoleModel) {
                        const message = consoleModel.addCommandMessage(executionContext, text);
                        text = ObjectUI.JavaScriptREPL.JavaScriptREPL.wrapObjectLiteral(text);
                        void consoleModel.evaluateCommandInConsole(executionContext, message, text, /* useCommandLineAPI */ true);
                    }
                }
                return true;
            }
            case 'sources.reveal-in-navigator-sidebar': {
                const uiSourceCode = panel.sourcesView().currentUISourceCode();
                if (uiSourceCode === null) {
                    return false;
                }
                void panel.revealInNavigator(uiSourceCode);
                return true;
            }
            case 'sources.toggle-navigator-sidebar': {
                panel.toggleNavigatorSidebar();
                return true;
            }
            case 'sources.toggle-debugger-sidebar': {
                panel.toggleDebuggerSidebar();
                return true;
            }
        }
        return false;
    }
}
export class QuickSourceView extends UI.Widget.VBox {
    view;
    constructor() {
        super();
        this.element.classList.add('sources-view-wrapper');
        this.element.setAttribute('jslog', `${VisualLogging.panel('sources.quick').track({ resize: true })}`);
        this.view = SourcesPanel.instance().sourcesView();
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(QuickSourceView, this);
        super.wasShown();
        if (!SourcesPanel.instance().isShowing()) {
            this.showViewInWrapper();
        }
        else {
            UI.InspectorView.InspectorView.instance().setDrawerMinimized(true);
        }
        SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance());
    }
    willHide() {
        UI.InspectorView.InspectorView.instance().setDrawerMinimized(false);
        queueMicrotask(() => {
            SourcesPanel.updateResizerAndSidebarButtons(SourcesPanel.instance());
        });
        super.willHide();
        UI.Context.Context.instance().setFlavor(QuickSourceView, null);
    }
    showViewInWrapper() {
        this.view.show(this.element);
    }
}
//# sourceMappingURL=SourcesPanel.js.map