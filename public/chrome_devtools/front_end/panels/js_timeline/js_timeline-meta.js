// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
     *@description Text for the performance of something
     */
    performance: 'Performance',
    /**
     *@description Command for showing the 'Performance' tool
     */
    showPerformance: 'Show Performance',
    /**
     *@description Title of an action in the timeline tool to show history
     */
    showRecentTimelineSessions: 'Show recent timeline sessions',
    /**
     *@description Text to record a series of actions for analysis
     */
    record: 'Record',
    /**
     *@description Text of an item that stops the running task
     */
    stop: 'Stop',
    /**
     *@description Title of an action in the timeline tool to record reload
     */
    startProfilingAndReloadPage: 'Start profiling and reload page',
};
const str_ = i18n.i18n.registerUIStrings('panels/js_timeline/js_timeline-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedTimelineModule;
async function loadTimelineModule() {
    if (!loadedTimelineModule) {
        loadedTimelineModule = await import('../timeline/timeline.js');
    }
    return loadedTimelineModule;
}
function maybeRetrieveTimelineContextTypes(getClassCallBack) {
    if (loadedTimelineModule === undefined) {
        return [];
    }
    return getClassCallBack(loadedTimelineModule);
}
UI.ViewManager.registerViewExtension({
    location: "panel" /* UI.ViewManager.ViewLocationValues.PANEL */,
    id: 'timeline',
    title: i18nLazyString(UIStrings.performance),
    commandPrompt: i18nLazyString(UIStrings.showPerformance),
    order: 66,
    hasToolbar: false,
    isPreviewFeature: true,
    async loadView() {
        const Timeline = await loadTimelineModule();
        return Timeline.TimelinePanel.TimelinePanel.instance({ forceNew: null, isNode: true });
    },
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'timeline.show-history',
    async loadActionDelegate() {
        const Timeline = await loadTimelineModule();
        return new Timeline.TimelinePanel.ActionDelegate();
    },
    category: "PERFORMANCE" /* UI.ActionRegistration.ActionCategory.PERFORMANCE */,
    title: i18nLazyString(UIStrings.showRecentTimelineSessions),
    contextTypes() {
        return maybeRetrieveTimelineContextTypes(Timeline => [Timeline.TimelinePanel.TimelinePanel]);
    },
    bindings: [
        {
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
            shortcut: 'Ctrl+H',
        },
        {
            platform: "mac" /* UI.ActionRegistration.Platforms.Mac */,
            shortcut: 'Meta+Y',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'timeline.toggle-recording',
    category: "PERFORMANCE" /* UI.ActionRegistration.ActionCategory.PERFORMANCE */,
    iconClass: "record-start" /* UI.ActionRegistration.IconClass.START_RECORDING */,
    toggleable: true,
    toggledIconClass: "record-stop" /* UI.ActionRegistration.IconClass.STOP_RECORDING */,
    toggleWithRedColor: true,
    contextTypes() {
        return maybeRetrieveTimelineContextTypes(Timeline => [Timeline.TimelinePanel.TimelinePanel]);
    },
    async loadActionDelegate() {
        const Timeline = await loadTimelineModule();
        return new Timeline.TimelinePanel.ActionDelegate();
    },
    options: [
        {
            value: true,
            title: i18nLazyString(UIStrings.record),
        },
        {
            value: false,
            title: i18nLazyString(UIStrings.stop),
        },
    ],
    bindings: [
        {
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
            shortcut: 'Ctrl+E',
        },
        {
            platform: "mac" /* UI.ActionRegistration.Platforms.Mac */,
            shortcut: 'Meta+E',
        },
    ],
});
UI.ActionRegistration.registerActionExtension({
    actionId: 'timeline.record-reload',
    iconClass: "refresh" /* UI.ActionRegistration.IconClass.REFRESH */,
    contextTypes() {
        return maybeRetrieveTimelineContextTypes(Timeline => [Timeline.TimelinePanel.TimelinePanel]);
    },
    category: "PERFORMANCE" /* UI.ActionRegistration.ActionCategory.PERFORMANCE */,
    title: i18nLazyString(UIStrings.startProfilingAndReloadPage),
    async loadActionDelegate() {
        const Timeline = await loadTimelineModule();
        return new Timeline.TimelinePanel.ActionDelegate();
    },
    bindings: [
        {
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
            shortcut: 'Ctrl+Shift+E',
        },
        {
            platform: "mac" /* UI.ActionRegistration.Platforms.Mac */,
            shortcut: 'Meta+Shift+E',
        },
    ],
});
//# sourceMappingURL=js_timeline-meta.js.map