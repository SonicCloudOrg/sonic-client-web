// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
     *@description Title of the Recorder Panel
     */
    recorder: 'Recorder',
    /**
     *@description Title of the Recorder Panel
     */
    showRecorder: 'Show Recorder',
    /**
     *@description Title of start/stop recording action in command menu
     */
    startStopRecording: 'Start/Stop recording',
    /**
     *@description Title of create a new recording action in command menu
     */
    createRecording: 'Create a new recording',
    /**
     *@description Title of start a new recording action in command menu
     */
    replayRecording: 'Replay recording',
    /**
     * @description Title for toggling code action in command menu
     */
    toggleCode: 'Toggle code view',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/recorder-meta.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
let loadedRecorderModule;
async function loadRecorderModule() {
    if (!loadedRecorderModule) {
        loadedRecorderModule = await import('./recorder.js');
    }
    return loadedRecorderModule;
}
function maybeRetrieveContextTypes(getClassCallBack, actionId) {
    if (loadedRecorderModule === undefined) {
        return [];
    }
    if (actionId &&
        loadedRecorderModule.RecorderPanel.RecorderPanel.instance().isActionPossible(actionId)) {
        return getClassCallBack(loadedRecorderModule);
    }
    return [];
}
const viewId = 'chrome-recorder';
UI.ViewManager.defaultOptionsForTabs[viewId] = true;
UI.ViewManager.registerViewExtension({
    location: "panel" /* UI.ViewManager.ViewLocationValues.PANEL */,
    id: viewId,
    commandPrompt: i18nLazyString(UIStrings.showRecorder),
    title: i18nLazyString(UIStrings.recorder),
    order: 90,
    persistence: "closeable" /* UI.ViewManager.ViewPersistence.CLOSEABLE */,
    async loadView() {
        const Recorder = await loadRecorderModule();
        return Recorder.RecorderPanel.RecorderPanel.instance();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: "RECORDER" /* UI.ActionRegistration.ActionCategory.RECORDER */,
    actionId: "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */,
    title: i18nLazyString(UIStrings.createRecording),
    async loadActionDelegate() {
        const Recorder = await loadRecorderModule();
        return new Recorder.RecorderPanel.ActionDelegate();
    },
});
UI.ActionRegistration.registerActionExtension({
    category: "RECORDER" /* UI.ActionRegistration.ActionCategory.RECORDER */,
    actionId: "chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */,
    title: i18nLazyString(UIStrings.startStopRecording),
    contextTypes() {
        return maybeRetrieveContextTypes(Recorder => [Recorder.RecorderPanel.RecorderPanel], "chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */);
    },
    async loadActionDelegate() {
        const Recorder = await loadRecorderModule();
        return new Recorder.RecorderPanel.ActionDelegate();
    },
    bindings: [
        {
            shortcut: 'Ctrl+E',
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
        },
        { shortcut: 'Meta+E', platform: "mac" /* UI.ActionRegistration.Platforms.Mac */ },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: "RECORDER" /* UI.ActionRegistration.ActionCategory.RECORDER */,
    actionId: "chrome-recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */,
    title: i18nLazyString(UIStrings.replayRecording),
    contextTypes() {
        return maybeRetrieveContextTypes(Recorder => [Recorder.RecorderPanel.RecorderPanel], "chrome-recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */);
    },
    async loadActionDelegate() {
        const Recorder = await loadRecorderModule();
        return new Recorder.RecorderPanel.ActionDelegate();
    },
    bindings: [
        {
            shortcut: 'Ctrl+Enter',
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
        },
        { shortcut: 'Meta+Enter', platform: "mac" /* UI.ActionRegistration.Platforms.Mac */ },
    ],
});
UI.ActionRegistration.registerActionExtension({
    category: "RECORDER" /* UI.ActionRegistration.ActionCategory.RECORDER */,
    actionId: "chrome-recorder.toggle-code-view" /* Actions.RecorderActions.ToggleCodeView */,
    title: i18nLazyString(UIStrings.toggleCode),
    contextTypes() {
        return maybeRetrieveContextTypes(Recorder => [Recorder.RecorderPanel.RecorderPanel], "chrome-recorder.toggle-code-view" /* Actions.RecorderActions.ToggleCodeView */);
    },
    async loadActionDelegate() {
        const Recorder = await loadRecorderModule();
        return new Recorder.RecorderPanel.ActionDelegate();
    },
    bindings: [
        {
            shortcut: 'Ctrl+B',
            platform: "windows,linux" /* UI.ActionRegistration.Platforms.WindowsLinux */,
        },
        { shortcut: 'Meta+B', platform: "mac" /* UI.ActionRegistration.Platforms.Mac */ },
    ],
});
//# sourceMappingURL=recorder-meta.js.map