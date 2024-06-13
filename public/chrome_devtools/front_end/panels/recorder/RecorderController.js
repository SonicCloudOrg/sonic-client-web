// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as PublicExtensions from '../../models/extensions/extensions.js';
import * as Emulation from '../../panels/emulation/emulation.js';
import * as Timeline from '../../panels/timeline/timeline.js';
import * as Tracing from '../../services/tracing/tracing.js';
import * as Buttons from '../../ui/components/buttons/buttons.js';
import * as Dialogs from '../../ui/components/dialogs/dialogs.js';
import * as ComponentHelpers from '../../ui/components/helpers/helpers.js';
import * as Menus from '../../ui/components/menus/menus.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import * as Components from './components/components.js';
import * as Converters from './converters/converters.js';
import * as Extensions from './extensions/extensions.js';
import * as Models from './models/models.js';
import recorderControllerStyles from './recorderController.css.js';
import * as Events from './RecorderEvents.js';
const { html, Decorators, LitElement } = LitHtml;
const { customElement, state } = Decorators;
const UIStrings = {
    /**
     * @description The title of the button that leads to a page for creating a new recording.
     */
    createRecording: 'Create a new recording',
    /**
     * @description The title of the button that allows importing a recording.
     */
    importRecording: 'Import recording',
    /**
     * @description The title of the button that deletes the recording
     */
    deleteRecording: 'Delete recording',
    /**
     * @description The title of the select if user has no saved recordings
     */
    noRecordings: 'No recordings',
    /**
     * @description The title of the select option for one or more recording
     * number followed by this text - `1 recording(s)` or `4 recording(s)`
     */
    numberOfRecordings: 'recording(s)',
    /**
     * @description The title of the button that continues the replay
     */
    continueReplay: 'Continue',
    /**
     * @description The title of the button that executes only one step in the replay
     */
    stepOverReplay: 'Execute one step',
    /**
     * @description The title of the button that opens a menu with various options of exporting a recording to file.
     */
    exportRecording: 'Export',
    /**
     * @description The title of shortcut for starting and stopping recording.
     */
    startStopRecording: 'Start/Stop recording',
    /**
     * @description The title of shortcut for replaying recording.
     */
    replayRecording: 'Replay recording',
    /**
     * @description The title of shortcut for copying a recording or selected step.
     */
    copyShortcut: 'Copy recording or selected step',
    /**
     * @description The title of shortcut for toggling code view.
     */
    toggleCode: 'Toggle code view',
    /**
     * @description The title of the menu group in the export menu of the Recorder
     * panel that is followed by the list of built-in export formats.
     */
    export: 'Export',
    /**
     * @description The title of the menu group in the export menu of the Recorder
     * panel that is followed by the list of export formats available via browser
     * extensions.
     */
    exportViaExtensions: 'Export via extensions',
    /**
     * @description The title of the menu option that leads to a page that lists
     * all browsers extensions available for Recorder.
     */
    getExtensions: 'Get extensions…',
    /**
     * @description The button label that leads to the feedback form for Recorder.
     */
    sendFeedback: 'Send feedback',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/RecorderController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const GET_EXTENSIONS_MENU_ITEM = 'get-extensions-link';
const GET_EXTENSIONS_URL = 'https://goo.gle/recorder-extension-list';
const CONVERTER_ID_TO_METRIC = {
    ["json" /* Models.ConverterIds.ConverterIds.JSON */]: 2 /* Host.UserMetrics.RecordingExported.ToJSON */,
    ["@puppeteer/replay" /* Models.ConverterIds.ConverterIds.Replay */]: 3 /* Host.UserMetrics.RecordingExported.ToPuppeteerReplay */,
    ["puppeteer" /* Models.ConverterIds.ConverterIds.Puppeteer */]: 1 /* Host.UserMetrics.RecordingExported.ToPuppeteer */,
    ["lighthouse" /* Models.ConverterIds.ConverterIds.Lighthouse */]: 5 /* Host.UserMetrics.RecordingExported.ToLighthouse */,
};
let RecorderController = class RecorderController extends LitElement {
    static styles = [recorderControllerStyles];
    #storage = Models.RecordingStorage.RecordingStorage.instance();
    #screenshotStorage = Models.ScreenshotStorage.ScreenshotStorage.instance();
    // TODO: we keep the functionality to allow/disallow replay but right now it's not used.
    // It can be used to decide if we allow replay on a certain target for example.
    #replayAllowed = true;
    #replayState = { isPlaying: false, isPausedOnBreakpoint: false };
    #fileSelector;
    #exportMenuButton;
    #stepBreakpointIndexes = new Set();
    #builtInConverters;
    #recorderSettings = new Models.RecorderSettings.RecorderSettings();
    #shortcutHelper = new Models.RecorderShortcutHelper.RecorderShortcutHelper();
    constructor() {
        super();
        this.isRecording = false;
        this.isToggling = false;
        this.exportMenuExpanded = false;
        this.currentPage = "StartPage" /* Pages.StartPage */;
        if (this.#storage.getRecordings().length) {
            this.#setCurrentPage("AllRecordingsPage" /* Pages.AllRecordingsPage */);
        }
        const textEditorIndent = Common.Settings.Settings.instance().moduleSetting('text-editor-indent').get();
        this.#builtInConverters = Object.freeze([
            new Converters.JSONConverter.JSONConverter(textEditorIndent),
            new Converters.PuppeteerReplayConverter.PuppeteerReplayConverter(textEditorIndent),
            new Converters.PuppeteerConverter.PuppeteerConverter(textEditorIndent),
            new Converters.LighthouseConverter.LighthouseConverter(textEditorIndent),
        ]);
        const extensionManager = Extensions.ExtensionManager.ExtensionManager.instance();
        this.#updateExtensions(extensionManager.extensions());
        extensionManager.addEventListener("extensionsUpdated" /* Extensions.ExtensionManager.Events.ExtensionsUpdated */, event => {
            this.#updateExtensions(event.data);
        });
        // used in e2e tests only.
        this.addEventListener('setrecording', (event) => this.#onSetRecording(event));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.currentRecordingSession) {
            void this.currentRecordingSession.stop();
        }
    }
    #updateExtensions(extensions) {
        this.extensionConverters =
            extensions.filter(extension => extension.getCapabilities().includes('export')).map((extension, idx) => {
                return new Converters.ExtensionConverter.ExtensionConverter(idx, extension);
            });
        this.replayExtensions = extensions.filter(extension => extension.getCapabilities().includes('replay'));
    }
    setIsRecordingStateForTesting(isRecording) {
        this.isRecording = isRecording;
    }
    setRecordingStateForTesting(state) {
        this.#replayState.isPlaying = state.isPlaying;
        this.#replayState.isPausedOnBreakpoint = state.isPausedOnBreakpoint;
    }
    setCurrentPageForTesting(page) {
        this.#setCurrentPage(page);
    }
    getCurrentPageForTesting() {
        return this.currentPage;
    }
    getCurrentRecordingForTesting() {
        return this.currentRecording;
    }
    getStepBreakpointIndexesForTesting() {
        return [...this.#stepBreakpointIndexes.values()];
    }
    /**
     * We should clear errors on every new action in the controller.
     * TODO: think how to make handle this centrally so that in no case
     * the error remains shown for longer than needed. Maybe a timer?
     */
    #clearError() {
        this.importError = undefined;
    }
    async #importFile(file) {
        const outputStream = new Common.StringOutputStream.StringOutputStream();
        const reader = new Bindings.FileUtils.ChunkedFileReader(file, 
        /* chunkSize */ 10000000);
        const success = await reader.read(outputStream);
        if (!success) {
            throw reader.error();
        }
        let flow;
        try {
            flow = Models.SchemaUtils.parse(JSON.parse(outputStream.data()));
        }
        catch (error) {
            this.importError = error;
            return;
        }
        this.#setCurrentRecording(await this.#storage.saveRecording(flow));
        this.#setCurrentPage("RecordingPage" /* Pages.RecordingPage */);
        this.#clearError();
    }
    setCurrentRecordingForTesting(recording) {
        this.#setCurrentRecording(recording);
    }
    getSectionsForTesting() {
        return this.sections;
    }
    #setCurrentRecording(recording, opts = {}) {
        const { keepBreakpoints = false, updateSession = false } = opts;
        this.recordingPlayer?.abort();
        this.currentStep = undefined;
        this.recordingError = undefined;
        this.lastReplayResult = undefined;
        this.recordingPlayer = undefined;
        this.#replayState.isPlaying = false;
        this.#replayState.isPausedOnBreakpoint = false;
        this.#stepBreakpointIndexes = keepBreakpoints ? this.#stepBreakpointIndexes : new Set();
        if (recording) {
            this.currentRecording = recording;
            this.sections = Models.Section.buildSections(recording.flow.steps);
            this.settings = this.#buildSettings(recording.flow);
            if (updateSession && this.currentRecordingSession) {
                this.currentRecordingSession.overwriteUserFlow(recording.flow);
            }
        }
        else {
            this.currentRecording = undefined;
            this.sections = undefined;
            this.settings = undefined;
        }
        this.#updateScreenshotsForSections();
    }
    #setCurrentPage(page) {
        if (page === this.currentPage) {
            return;
        }
        this.previousPage = this.currentPage;
        this.currentPage = page;
    }
    #buildSettings(flow) {
        const steps = flow.steps;
        const navigateStepIdx = steps.findIndex(step => step.type === 'navigate');
        const settings = { timeout: flow.timeout };
        for (let i = navigateStepIdx - 1; i >= 0; i--) {
            const step = steps[i];
            if (!settings.viewportSettings && step.type === 'setViewport') {
                settings.viewportSettings = step;
            }
            if (!settings.networkConditionsSettings && step.type === 'emulateNetworkConditions') {
                settings.networkConditionsSettings = { ...step };
                for (const preset of [SDK.NetworkManager.OfflineConditions, SDK.NetworkManager.Slow3GConditions,
                    SDK.NetworkManager.Slow4GConditions, SDK.NetworkManager.Fast4GConditions]) {
                    // Using i18nTitleKey as a title here because we only want to compare the parameters of the network conditions.
                    if (SDK.NetworkManager.networkConditionsEqual({ ...preset, title: preset.i18nTitleKey || '' }, { ...step, title: preset.i18nTitleKey || '' })) {
                        settings.networkConditionsSettings.title = preset.title instanceof Function ? preset.title() : preset.title;
                        settings.networkConditionsSettings.i18nTitleKey = preset.i18nTitleKey;
                    }
                }
            }
        }
        return settings;
    }
    #getMainTarget() {
        const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!target) {
            throw new Error('Missing main page target');
        }
        return target;
    }
    #getSectionFromStep(step) {
        if (!this.sections) {
            return null;
        }
        for (const section of this.sections) {
            if (section.steps.indexOf(step) !== -1) {
                return section;
            }
        }
        return null;
    }
    #updateScreenshotsForSections() {
        if (!this.sections || !this.currentRecording) {
            return;
        }
        const storageName = this.currentRecording.storageName;
        for (let i = 0; i < this.sections.length; i++) {
            const screenshot = this.#screenshotStorage.getScreenshotForSection(storageName, i);
            this.sections[i].screenshot = screenshot || undefined;
        }
        this.requestUpdate();
    }
    #onAbortReplay() {
        this.recordingPlayer?.abort();
    }
    async #onPlayViaExtension(extension) {
        if (!this.currentRecording || !this.#replayAllowed) {
            return;
        }
        const pluginManager = PublicExtensions.RecorderPluginManager.RecorderPluginManager.instance();
        const promise = pluginManager.once("showViewRequested" /* PublicExtensions.RecorderPluginManager.Events.ShowViewRequested */);
        extension.replay(this.currentRecording.flow);
        const descriptor = await promise;
        this.viewDescriptor = descriptor;
        Host.userMetrics.recordingReplayStarted(3 /* Host.UserMetrics.RecordingReplayStarted.ReplayViaExtension */);
    }
    async #onPlayRecording(event) {
        if (!this.currentRecording || !this.#replayAllowed) {
            return;
        }
        if (this.viewDescriptor) {
            this.viewDescriptor = undefined;
        }
        if (event.data.extension) {
            return this.#onPlayViaExtension(event.data.extension);
        }
        Host.userMetrics.recordingReplayStarted(event.data.targetPanel !== "chrome-recorder" /* Components.RecordingView.TargetPanel.Default */ ?
            2 /* Host.UserMetrics.RecordingReplayStarted.ReplayWithPerformanceTracing */ :
            1 /* Host.UserMetrics.RecordingReplayStarted.ReplayOnly */);
        this.#replayState.isPlaying = true;
        this.currentStep = undefined;
        this.recordingError = undefined;
        this.lastReplayResult = undefined;
        const currentRecording = this.currentRecording;
        this.#clearError();
        await this.#disableDeviceModeIfEnabled();
        this.recordingPlayer = new Models.RecordingPlayer.RecordingPlayer(this.currentRecording.flow, { speed: event.data.speed, breakpointIndexes: this.#stepBreakpointIndexes });
        const withPerformanceTrace = event.data.targetPanel === "timeline" /* Components.RecordingView.TargetPanel.PerformancePanel */;
        const sectionsWithScreenshot = new Set();
        this.recordingPlayer.addEventListener("Step" /* Models.RecordingPlayer.Events.Step */, async ({ data: { step, resolve } }) => {
            this.currentStep = step;
            const currentSection = this.#getSectionFromStep(step);
            if (this.sections && currentSection && !sectionsWithScreenshot.has(currentSection)) {
                sectionsWithScreenshot.add(currentSection);
                const currentSectionIndex = this.sections.indexOf(currentSection);
                const screenshot = await Models.ScreenshotUtils.takeScreenshot();
                currentSection.screenshot = screenshot;
                Models.ScreenshotStorage.ScreenshotStorage.instance().storeScreenshotForSection(currentRecording.storageName, currentSectionIndex, screenshot);
            }
            resolve();
        });
        this.recordingPlayer.addEventListener("Stop" /* Models.RecordingPlayer.Events.Stop */, () => {
            this.#replayState.isPausedOnBreakpoint = true;
            this.requestUpdate();
        });
        this.recordingPlayer.addEventListener("Continue" /* Models.RecordingPlayer.Events.Continue */, () => {
            this.#replayState.isPausedOnBreakpoint = false;
            this.requestUpdate();
        });
        this.recordingPlayer.addEventListener("Error" /* Models.RecordingPlayer.Events.Error */, ({ data: error }) => {
            this.recordingError = error;
            if (!withPerformanceTrace) {
                this.#replayState.isPlaying = false;
                this.recordingPlayer = undefined;
            }
            this.lastReplayResult = "Failure" /* Models.RecordingPlayer.ReplayResult.Failure */;
            const errorMessage = error.message.toLowerCase();
            if (errorMessage.startsWith('could not find element')) {
                Host.userMetrics.recordingReplayFinished(2 /* Host.UserMetrics.RecordingReplayFinished.TimeoutErrorSelectors */);
            }
            else if (errorMessage.startsWith('waiting for target failed')) {
                Host.userMetrics.recordingReplayFinished(3 /* Host.UserMetrics.RecordingReplayFinished.TimeoutErrorTarget */);
            }
            else {
                Host.userMetrics.recordingReplayFinished(4 /* Host.UserMetrics.RecordingReplayFinished.OtherError */);
            }
        });
        this.recordingPlayer.addEventListener("Done" /* Models.RecordingPlayer.Events.Done */, () => {
            if (!withPerformanceTrace) {
                this.#replayState.isPlaying = false;
                this.recordingPlayer = undefined;
            }
            this.lastReplayResult = "Success" /* Models.RecordingPlayer.ReplayResult.Success */;
            // Dispatch an event for e2e testing.
            this.dispatchEvent(new Events.ReplayFinishedEvent());
            Host.userMetrics.recordingReplayFinished(1 /* Host.UserMetrics.RecordingReplayFinished.Success */);
        });
        this.recordingPlayer.addEventListener("Abort" /* Models.RecordingPlayer.Events.Abort */, () => {
            this.currentStep = undefined;
            this.recordingError = undefined;
            this.lastReplayResult = undefined;
            this.#replayState.isPlaying = false;
        });
        let resolveWithEvents = (_events) => { };
        const eventsPromise = new Promise((resolve) => {
            resolveWithEvents = resolve;
        });
        let performanceTracing = null;
        switch (event.data?.targetPanel) {
            case "timeline" /* Components.RecordingView.TargetPanel.PerformancePanel */:
                performanceTracing = new Tracing.PerformanceTracing.PerformanceTracing(this.#getMainTarget(), {
                    tracingBufferUsage() { },
                    eventsRetrievalProgress() { },
                    tracingComplete(events) {
                        resolveWithEvents(events);
                    },
                });
                break;
        }
        if (performanceTracing) {
            await performanceTracing.start();
        }
        this.#setTouchEmulationAllowed(false);
        await this.recordingPlayer.play();
        this.#setTouchEmulationAllowed(true);
        if (performanceTracing) {
            await performanceTracing.stop();
            const events = await eventsPromise;
            this.#replayState.isPlaying = false;
            this.recordingPlayer = undefined;
            await UI.InspectorView.InspectorView.instance().showPanel(event.data?.targetPanel);
            switch (event.data?.targetPanel) {
                case "timeline" /* Components.RecordingView.TargetPanel.PerformancePanel */:
                    Timeline.TimelinePanel.TimelinePanel.instance().loadFromEvents(events);
                    break;
            }
        }
    }
    async #disableDeviceModeIfEnabled() {
        try {
            const deviceModeWrapper = Emulation.DeviceModeWrapper.DeviceModeWrapper.instance();
            if (deviceModeWrapper.isDeviceModeOn()) {
                deviceModeWrapper.toggleDeviceMode();
                const emulationModel = this.#getMainTarget().model(SDK.EmulationModel.EmulationModel);
                await emulationModel?.emulateDevice(null);
            }
        }
        catch {
            // in the hosted mode, when the DeviceMode toolbar is not supported,
            // Emulation.DeviceModeWrapper.DeviceModeWrapper.instance throws an exception.
        }
    }
    #setTouchEmulationAllowed(touchEmulationAllowed) {
        const emulationModel = this.#getMainTarget().model(SDK.EmulationModel.EmulationModel);
        emulationModel?.setTouchEmulationAllowed(touchEmulationAllowed);
    }
    async #onSetRecording(event) {
        const json = JSON.parse(event.detail);
        this.#setCurrentRecording(await this.#storage.saveRecording(Models.SchemaUtils.parse(json)));
        this.#setCurrentPage("RecordingPage" /* Pages.RecordingPage */);
        this.#clearError();
    }
    // Used by e2e tests to inspect the current recording.
    getUserFlow() {
        return this.currentRecording?.flow;
    }
    async #handleRecordingChanged(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        const recording = {
            ...this.currentRecording,
            flow: {
                ...this.currentRecording.flow,
                steps: this.currentRecording.flow.steps.map(step => step === event.currentStep ? event.newStep : step),
            },
        };
        this.#setCurrentRecording(await this.#storage.updateRecording(recording.storageName, recording.flow), { keepBreakpoints: true, updateSession: true });
    }
    async #handleStepAdded(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        const stepOrSection = event.stepOrSection;
        let step;
        let position = event.position;
        if ('steps' in stepOrSection) {
            // section
            const sectionIdx = this.sections?.indexOf(stepOrSection);
            if (sectionIdx === undefined || sectionIdx === -1) {
                throw new Error('There is no section to add a step to');
            }
            if (event.position === "after" /* Components.StepView.AddStepPosition.AFTER */) {
                if (this.sections?.[sectionIdx].steps.length) {
                    step = this.sections?.[sectionIdx].steps[0];
                    position = "before" /* Components.StepView.AddStepPosition.BEFORE */;
                }
                else {
                    step = this.sections?.[sectionIdx].causingStep;
                    position = "after" /* Components.StepView.AddStepPosition.AFTER */;
                }
            }
            else {
                if (sectionIdx <= 0) {
                    throw new Error('There is no section to add a step to');
                }
                const prevSection = this.sections?.[sectionIdx - 1];
                step = prevSection?.steps[prevSection.steps.length - 1];
                position = "after" /* Components.StepView.AddStepPosition.AFTER */;
            }
        }
        else {
            // step
            step = stepOrSection;
        }
        if (!step) {
            throw new Error('Anchor step is not found when adding a step');
        }
        const steps = this.currentRecording.flow.steps;
        const currentIndex = steps.indexOf(step);
        const indexToInsertAt = currentIndex + (position === "before" /* Components.StepView.AddStepPosition.BEFORE */ ? 0 : 1);
        steps.splice(indexToInsertAt, 0, { type: Models.Schema.StepType.WaitForElement, selectors: ['body'] });
        const recording = { ...this.currentRecording, flow: { ...this.currentRecording.flow, steps } };
        Host.userMetrics.recordingEdited(2 /* Host.UserMetrics.RecordingEdited.StepAdded */);
        this.#stepBreakpointIndexes = new Set([...this.#stepBreakpointIndexes.values()].map(breakpointIndex => {
            if (indexToInsertAt > breakpointIndex) {
                return breakpointIndex;
            }
            return breakpointIndex + 1;
        }));
        this.#setCurrentRecording(await this.#storage.updateRecording(recording.storageName, recording.flow), { keepBreakpoints: true, updateSession: true });
    }
    async #handleRecordingTitleChanged(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        const flow = { ...this.currentRecording.flow, title: event.title };
        this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, flow));
    }
    async #handleStepRemoved(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        const steps = this.currentRecording.flow.steps;
        const currentIndex = steps.indexOf(event.step);
        steps.splice(currentIndex, 1);
        const flow = { ...this.currentRecording.flow, steps };
        Host.userMetrics.recordingEdited(3 /* Host.UserMetrics.RecordingEdited.StepRemoved */);
        this.#stepBreakpointIndexes = new Set([...this.#stepBreakpointIndexes.values()]
            .map(breakpointIndex => {
            if (currentIndex > breakpointIndex) {
                return breakpointIndex;
            }
            if (currentIndex === breakpointIndex) {
                return -1;
            }
            return breakpointIndex - 1;
        })
            .filter(index => index >= 0));
        this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, flow), { keepBreakpoints: true, updateSession: true });
    }
    async #onNetworkConditionsChanged(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        const navigateIdx = this.currentRecording.flow.steps.findIndex(step => step.type === 'navigate');
        if (navigateIdx === -1) {
            throw new Error('Current recording does not have a navigate step');
        }
        const emulateNetworkConditionsIdx = this.currentRecording.flow.steps.findIndex((step, idx) => {
            if (idx >= navigateIdx) {
                return false;
            }
            return step.type === 'emulateNetworkConditions';
        });
        if (!event.data) {
            // Delete step if present.
            if (emulateNetworkConditionsIdx !== -1) {
                this.currentRecording.flow.steps.splice(emulateNetworkConditionsIdx, 1);
            }
        }
        else if (emulateNetworkConditionsIdx === -1) {
            // Insert at the first position.
            this.currentRecording.flow.steps.splice(0, 0, Models.SchemaUtils.createEmulateNetworkConditionsStep({ download: event.data.download, upload: event.data.upload, latency: event.data.latency }));
        }
        else {
            // Update existing step.
            const step = this.currentRecording.flow.steps[emulateNetworkConditionsIdx];
            step.download = event.data.download;
            step.upload = event.data.upload;
            step.latency = event.data.latency;
        }
        this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, this.currentRecording.flow));
    }
    async #onTimeoutChanged(event) {
        if (!this.currentRecording) {
            throw new Error('Current recording expected to be defined.');
        }
        this.currentRecording.flow.timeout = event.data;
        this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, this.currentRecording.flow));
    }
    async #onDeleteRecording(event) {
        event.stopPropagation();
        if (event instanceof Components.RecordingListView.DeleteRecordingEvent) {
            await this.#storage.deleteRecording(event.storageName);
            this.#screenshotStorage.deleteScreenshotsForRecording(event.storageName);
            this.requestUpdate();
        }
        else {
            if (!this.currentRecording) {
                return;
            }
            await this.#storage.deleteRecording(this.currentRecording.storageName);
            this.#screenshotStorage.deleteScreenshotsForRecording(this.currentRecording.storageName);
        }
        if ((await this.#storage.getRecordings()).length) {
            this.#setCurrentPage("AllRecordingsPage" /* Pages.AllRecordingsPage */);
        }
        else {
            this.#setCurrentPage("StartPage" /* Pages.StartPage */);
        }
        this.#setCurrentRecording(undefined);
        this.#clearError();
    }
    #onCreateNewRecording(event) {
        event?.stopPropagation();
        this.#setCurrentPage("CreateRecordingPage" /* Pages.CreateRecordingPage */);
        this.#clearError();
    }
    async #onRecordingStarted(event) {
        // Recording is not available in device mode.
        await this.#disableDeviceModeIfEnabled();
        // Setting up some variables to notify the user we are initializing a recording.
        this.isToggling = true;
        this.#clearError();
        // -- Recording logic starts here --
        Host.userMetrics.recordingToggled(1 /* Host.UserMetrics.RecordingToggled.RecordingStarted */);
        this.currentRecordingSession = new Models.RecordingSession.RecordingSession(this.#getMainTarget(), {
            title: event.name,
            selectorAttribute: event.selectorAttribute,
            selectorTypesToRecord: event.selectorTypesToRecord.length ? event.selectorTypesToRecord :
                Object.values(Models.Schema.SelectorType),
        });
        this.#setCurrentRecording(await this.#storage.saveRecording(this.currentRecordingSession.cloneUserFlow()));
        let previousSectionIndex = -1;
        let screenshotPromise;
        const takeScreenshot = async (currentRecording) => {
            if (!this.sections) {
                throw new Error('Could not find sections.');
            }
            const currentSectionIndex = this.sections.length - 1;
            const currentSection = this.sections[currentSectionIndex];
            if (screenshotPromise || previousSectionIndex === currentSectionIndex) {
                return;
            }
            screenshotPromise = Models.ScreenshotUtils.takeScreenshot();
            const screenshot = await screenshotPromise;
            screenshotPromise = undefined;
            currentSection.screenshot = screenshot;
            Models.ScreenshotStorage.ScreenshotStorage.instance().storeScreenshotForSection(currentRecording.storageName, currentSectionIndex, screenshot);
            previousSectionIndex = currentSectionIndex;
            this.#updateScreenshotsForSections();
        };
        this.currentRecordingSession.addEventListener("recordingupdated" /* Models.RecordingSession.Events.RecordingUpdated */, async ({ data }) => {
            if (!this.currentRecording) {
                throw new Error('No current recording found');
            }
            this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, data));
            const recordingView = this.shadowRoot?.querySelector('devtools-recording-view');
            recordingView?.scrollToBottom();
            await takeScreenshot(this.currentRecording);
        });
        this.currentRecordingSession.addEventListener("recordingstopped" /* Models.RecordingSession.Events.RecordingStopped */, async ({ data }) => {
            if (!this.currentRecording) {
                throw new Error('No current recording found');
            }
            Host.userMetrics.keyboardShortcutFired("chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */);
            this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, data));
            await this.#onRecordingFinished();
        });
        await this.currentRecordingSession.start();
        // -- Recording logic ends here --
        // Setting up some variables to notify the user we are finished initialization.
        this.isToggling = false;
        this.isRecording = true;
        this.#setCurrentPage("RecordingPage" /* Pages.RecordingPage */);
        // Dispatch an event for e2e testing.
        this.dispatchEvent(new Events.RecordingStateChangedEvent(this.currentRecording.flow));
    }
    async #onRecordingFinished() {
        if (!this.currentRecording || !this.currentRecordingSession) {
            throw new Error('Recording was never started');
        }
        // Setting up some variables to notify the user we are finalizing a recording.
        this.isToggling = true;
        this.#clearError();
        // -- Recording logic starts here --
        Host.userMetrics.recordingToggled(2 /* Host.UserMetrics.RecordingToggled.RecordingFinished */);
        await this.currentRecordingSession.stop();
        this.currentRecordingSession = undefined;
        // -- Recording logic ends here --
        // Setting up some variables to notify the user we are finished finalizing.
        this.isToggling = false;
        this.isRecording = false;
        // Dispatch an event for e2e testing.
        this.dispatchEvent(new Events.RecordingStateChangedEvent(this.currentRecording.flow));
    }
    async #onRecordingCancelled() {
        if (this.previousPage) {
            this.#setCurrentPage(this.previousPage);
        }
    }
    async #onRecordingSelected(event) {
        const storageName = event instanceof Components.RecordingListView.OpenRecordingEvent ||
            event instanceof Components.RecordingListView.PlayRecordingEvent ?
            event.storageName :
            event.target?.value;
        this.#setCurrentRecording(await this.#storage.getRecording(storageName));
        if (this.currentRecording) {
            this.#setCurrentPage("RecordingPage" /* Pages.RecordingPage */);
        }
        else if (storageName === "StartPage" /* Pages.StartPage */) {
            this.#setCurrentPage("StartPage" /* Pages.StartPage */);
        }
        else if (storageName === "AllRecordingsPage" /* Pages.AllRecordingsPage */) {
            this.#setCurrentPage("AllRecordingsPage" /* Pages.AllRecordingsPage */);
        }
    }
    async #onExportOptionSelected(event) {
        if (typeof event.itemValue !== 'string') {
            throw new Error('Invalid export option value');
        }
        if (event.itemValue === GET_EXTENSIONS_MENU_ITEM) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(GET_EXTENSIONS_URL);
            return;
        }
        if (!this.currentRecording) {
            throw new Error('No recording selected');
        }
        const id = event.itemValue;
        const byId = (converter) => converter.getId() === id;
        const converter = this.#builtInConverters.find(byId) || this.extensionConverters.find(byId);
        if (!converter) {
            throw new Error('No recording selected');
        }
        const [content] = await converter.stringify(this.currentRecording.flow);
        await this.#exportContent(converter.getFilename(this.currentRecording.flow), content);
        const builtInMetric = CONVERTER_ID_TO_METRIC[converter.getId()];
        if (builtInMetric) {
            Host.userMetrics.recordingExported(builtInMetric);
        }
        else if (converter.getId().startsWith(Converters.ExtensionConverter.EXTENSION_PREFIX)) {
            Host.userMetrics.recordingExported(4 /* Host.UserMetrics.RecordingExported.ToExtension */);
        }
        else {
            throw new Error('Could not find a metric for the export option with id = ' + id);
        }
    }
    async #exportContent(suggestedName, data) {
        try {
            const handle = await window.showSaveFilePicker({ suggestedName });
            const writable = await handle.createWritable();
            await writable.write(data);
            await writable.close();
        }
        catch (error) {
            // If the user aborts the action no need to report it, otherwise do.
            if (error.name === 'AbortError') {
                return;
            }
            throw error;
        }
    }
    async #handleAddAssertionEvent() {
        if (!this.currentRecordingSession || !this.currentRecording) {
            return;
        }
        const flow = this.currentRecordingSession.cloneUserFlow();
        flow.steps.push({ type: 'waitForElement', selectors: [['.cls']] });
        this.#setCurrentRecording(await this.#storage.updateRecording(this.currentRecording.storageName, flow), { keepBreakpoints: true, updateSession: true });
        Host.userMetrics.recordingAssertion(1 /* Host.UserMetrics.RecordingAssertion.AssertionAdded */);
        await this.updateComplete;
        this.renderRoot.querySelector('devtools-recording-view')
            ?.shadowRoot?.querySelector('.section:last-child devtools-step-view:last-of-type')
            ?.shadowRoot?.querySelector('.action')
            ?.click();
    }
    #onImportRecording(event) {
        event.stopPropagation();
        this.#clearError();
        this.#fileSelector = UI.UIUtils.createFileSelectorElement(this.#importFile.bind(this));
        this.#fileSelector.click();
    }
    async #onPlayRecordingByName(event) {
        await this.#onRecordingSelected(event);
        await this.#onPlayRecording(new Components.RecordingView.PlayRecordingEvent({ targetPanel: "chrome-recorder" /* Components.RecordingView.TargetPanel.Default */, speed: this.#recorderSettings.speed }));
    }
    #onAddBreakpoint = (event) => {
        this.#stepBreakpointIndexes.add(event.index);
        this.recordingPlayer?.updateBreakpointIndexes(this.#stepBreakpointIndexes);
        this.requestUpdate();
    };
    #onRemoveBreakpoint = (event) => {
        this.#stepBreakpointIndexes.delete(event.index);
        this.recordingPlayer?.updateBreakpointIndexes(this.#stepBreakpointIndexes);
        this.requestUpdate();
    };
    #onExtensionViewClosed() {
        this.viewDescriptor = undefined;
    }
    handleActions(actionId) {
        if (!this.isActionPossible(actionId)) {
            return;
        }
        switch (actionId) {
            case "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */:
                this.#onCreateNewRecording();
                return;
            case "chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */:
                if (this.currentPage !== "CreateRecordingPage" /* Pages.CreateRecordingPage */ && !this.isRecording) {
                    this.#shortcutHelper.handleShortcut(this.#onRecordingStarted.bind(this, new Components.CreateRecordingView.RecordingStartedEvent(this.#recorderSettings.defaultTitle, this.#recorderSettings.defaultSelectors, this.#recorderSettings.selectorAttribute)));
                }
                else if (this.currentPage === "CreateRecordingPage" /* Pages.CreateRecordingPage */) {
                    const view = this.renderRoot.querySelector('devtools-create-recording-view');
                    if (view) {
                        this.#shortcutHelper.handleShortcut(view.startRecording.bind(view));
                    }
                }
                else if (this.isRecording) {
                    void this.#onRecordingFinished();
                }
                return;
            case "chrome-recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */:
                void this.#onPlayRecording(new Components.RecordingView.PlayRecordingEvent({ targetPanel: "chrome-recorder" /* Components.RecordingView.TargetPanel.Default */, speed: this.#recorderSettings.speed }));
                return;
            case "chrome-recorder.toggle-code-view" /* Actions.RecorderActions.ToggleCodeView */: {
                const view = this.renderRoot.querySelector('devtools-recording-view');
                if (view) {
                    view.showCodeToggle();
                }
                return;
            }
        }
    }
    isActionPossible(actionId) {
        switch (actionId) {
            case "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */:
                return !this.isRecording && !this.#replayState.isPlaying;
            case "chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */:
                return !this.#replayState.isPlaying;
            case "chrome-recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */:
                return (this.currentPage === "RecordingPage" /* Pages.RecordingPage */ && !this.#replayState.isPlaying);
            case "chrome-recorder.toggle-code-view" /* Actions.RecorderActions.ToggleCodeView */:
                return this.currentPage === "RecordingPage" /* Pages.RecordingPage */;
            case "chrome-recorder.copy-recording-or-step" /* Actions.RecorderActions.CopyRecordingOrStep */:
                // This action is handled in the RecordingView
                // It relies on browser `copy` event.
                return false;
        }
    }
    #getShortcutsInfo() {
        const getBindingForAction = (action) => {
            const shortcuts = UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction(action);
            return shortcuts.map(shortcut => shortcut.title());
        };
        return [
            {
                title: i18nString(UIStrings.startStopRecording),
                bindings: getBindingForAction("chrome-recorder.start-recording" /* Actions.RecorderActions.StartRecording */),
            },
            {
                title: i18nString(UIStrings.replayRecording),
                bindings: getBindingForAction("chrome-recorder.replay-recording" /* Actions.RecorderActions.ReplayRecording */),
            },
            { title: i18nString(UIStrings.copyShortcut), bindings: [`${Host.Platform.isMac() ? '⌘ C' : 'Ctrl+C'}`] },
            { title: i18nString(UIStrings.toggleCode), bindings: getBindingForAction("chrome-recorder.toggle-code-view" /* Actions.RecorderActions.ToggleCodeView */) },
        ];
    }
    #renderCurrentPage() {
        switch (this.currentPage) {
            case "StartPage" /* Pages.StartPage */:
                return this.#renderStartPage();
            case "AllRecordingsPage" /* Pages.AllRecordingsPage */:
                return this.#renderAllRecordingsPage();
            case "RecordingPage" /* Pages.RecordingPage */:
                return this.#renderRecordingPage();
            case "CreateRecordingPage" /* Pages.CreateRecordingPage */:
                return this.#renderCreateRecordingPage();
        }
    }
    #renderAllRecordingsPage() {
        const recordings = this.#storage.getRecordings();
        // clang-format off
        return html `
      <${Components.RecordingListView.RecordingListView.litTagName}
        .recordings=${recordings.map(recording => ({
            storageName: recording.storageName,
            name: recording.flow.title,
        }))}
        .replayAllowed=${this.#replayAllowed}
        @createrecording=${this.#onCreateNewRecording}
        @deleterecording=${this.#onDeleteRecording}
        @openrecording=${this.#onRecordingSelected}
        @playrecording=${this.#onPlayRecordingByName}
        >
      </${Components.RecordingListView.RecordingListView.litTagName}>
    `;
        // clang-format on
    }
    #renderStartPage() {
        // clang-format off
        return html `
      <${Components.StartView.StartView.litTagName}
        @createrecording=${this.#onCreateNewRecording}
      ></${Components.StartView.StartView.litTagName}>
    `;
        // clang-format on
    }
    #renderRecordingPage() {
        // clang-format off
        return html `
      <${Components.RecordingView.RecordingView.litTagName}
        .data=${{
            recording: this.currentRecording?.flow,
            replayState: this.#replayState,
            isRecording: this.isRecording,
            recordingTogglingInProgress: this.isToggling,
            currentStep: this.currentStep,
            currentError: this.recordingError,
            sections: this.sections,
            settings: this.settings,
            recorderSettings: this.#recorderSettings,
            lastReplayResult: this.lastReplayResult,
            replayAllowed: this.#replayAllowed,
            breakpointIndexes: this.#stepBreakpointIndexes,
            builtInConverters: this.#builtInConverters,
            extensionConverters: this.extensionConverters,
            replayExtensions: this.replayExtensions,
            extensionDescriptor: this.viewDescriptor,
        }}
        @networkconditionschanged=${this.#onNetworkConditionsChanged}
        @timeoutchanged=${this.#onTimeoutChanged}
        @requestselectorattribute=${(event) => {
            event.send(this.currentRecording?.flow.selectorAttribute);
        }}
        @recordingfinished=${this.#onRecordingFinished}
        @stepchanged=${this.#handleRecordingChanged.bind(this)}
        @recordingtitlechanged=${this.#handleRecordingTitleChanged.bind(this)}
        @addstep=${this.#handleStepAdded.bind(this)}
        @removestep=${this.#handleStepRemoved.bind(this)}
        @addbreakpoint=${this.#onAddBreakpoint}
        @removebreakpoint=${this.#onRemoveBreakpoint}
        @playrecording=${this.#onPlayRecording}
        @abortreplay=${this.#onAbortReplay}
        @recorderextensionviewclosed=${this.#onExtensionViewClosed}
        @addassertion=${this.#handleAddAssertionEvent}
      ></${Components.RecordingView.RecordingView.litTagName}>
    `;
        // clang-format on
    }
    #renderCreateRecordingPage() {
        // clang-format off
        return html `
      <${Components.CreateRecordingView.CreateRecordingView.litTagName}
        .data=${{
            recorderSettings: this.#recorderSettings,
        }}
        @recordingstarted=${this.#onRecordingStarted}
        @recordingcancelled=${this.#onRecordingCancelled}
      ></${Components.CreateRecordingView.CreateRecordingView.litTagName}>
    `;
        // clang-format on
    }
    #getExportMenuButton = () => {
        if (!this.#exportMenuButton) {
            throw new Error('#exportMenuButton not found');
        }
        return this.#exportMenuButton;
    };
    #onExportRecording(event) {
        event.stopPropagation();
        this.#clearError();
        this.exportMenuExpanded = !this.exportMenuExpanded;
    }
    #onExportMenuClosed() {
        this.exportMenuExpanded = false;
    }
    render() {
        const recordings = this.#storage.getRecordings();
        const selectValue = this.currentRecording ? this.currentRecording.storageName : this.currentPage;
        // clang-format off
        const values = [
            recordings.length === 0
                ? {
                    value: "StartPage" /* Pages.StartPage */,
                    name: i18nString(UIStrings.noRecordings),
                    selected: selectValue === "StartPage" /* Pages.StartPage */,
                }
                : {
                    value: "AllRecordingsPage" /* Pages.AllRecordingsPage */,
                    name: `${recordings.length} ${i18nString(UIStrings.numberOfRecordings)}`,
                    selected: selectValue === "AllRecordingsPage" /* Pages.AllRecordingsPage */,
                },
            ...recordings.map(recording => ({
                value: recording.storageName,
                name: recording.flow.title,
                selected: selectValue === recording.storageName,
            })),
        ];
        return html `
        <div class="wrapper">
          <div class="header" jslog=${VisualLogging.toolbar()}>
            <${Buttons.Button.Button.litTagName}
              @click=${this.#onCreateNewRecording}
              .data=${{
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconName: 'plus',
            disabled: this.#replayState.isPlaying ||
                this.isRecording ||
                this.isToggling,
            title: Models.Tooltip.getTooltipForActions(i18nString(UIStrings.createRecording), "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */),
            jslogContext: "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */,
        }}
            ></${Buttons.Button.Button.litTagName}>
            <div class="separator"></div>
            <select
              .disabled=${recordings.length === 0 ||
            this.#replayState.isPlaying ||
            this.isRecording ||
            this.isToggling}
              @click=${(e) => e.stopPropagation()}
              @change=${this.#onRecordingSelected}
              jslog=${VisualLogging.dropDown('recordings').track({ change: true })}
            >
              ${LitHtml.Directives.repeat(values, item => item.value, item => {
            return html `<option .selected=${item.selected} value=${item.value}>${item.name}</option>`;
        })}
            </select>
            <div class="separator"></div>
            <${Buttons.Button.Button.litTagName}
              @click=${this.#onImportRecording}
              .data=${{
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconName: 'import',
            title: i18nString(UIStrings.importRecording),
            jslogContext: 'import-recording',
        }}
            ></${Buttons.Button.Button.litTagName}>
            <${Buttons.Button.Button.litTagName}
              id='origin'
              @click=${this.#onExportRecording}
              on-render=${ComponentHelpers.Directives.nodeRenderedCallback(node => {
            this.#exportMenuButton = node;
        })}
              .data=${{
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconName: 'download',
            title: i18nString(UIStrings.exportRecording),
            disabled: !this.currentRecording,
        }}
              jslog=${VisualLogging.dropDown('export-recording').track({ click: true })}
            ></${Buttons.Button.Button.litTagName}>
            <${Menus.Menu.Menu.litTagName}
              @menucloserequest=${this.#onExportMenuClosed}
              @menuitemselected=${this.#onExportOptionSelected}
              .origin=${this.#getExportMenuButton}
              .showDivider=${false}
              .showSelectedItem=${false}
              .showConnector=${false}
              .open=${this.exportMenuExpanded}
            >
              <${Menus.Menu.MenuGroup.litTagName} .name=${i18nString(UIStrings.export)}>
                ${LitHtml.Directives.repeat(this.#builtInConverters, converter => {
            return html `
                    <${Menus.Menu.MenuItem.litTagName} .value=${converter.getId()}
                      jslog=${VisualLogging.item(`converter-${converter.getFormatName()}`).track({ click: true })}>
                      ${converter.getFormatName()}
                    </${Menus.Menu.MenuItem.litTagName}>
                  `;
        })}
              </${Menus.Menu.MenuGroup.litTagName}>
              <${Menus.Menu.MenuGroup.litTagName} .name=${i18nString(UIStrings.exportViaExtensions)}>
                ${LitHtml.Directives.repeat(this.extensionConverters, converter => {
            return html `
                    <${Menus.Menu.MenuItem.litTagName} .value=${converter.getId()}
                      jslog=${VisualLogging.item(`converter-${converter.getFormatName()}`).track({ click: true })}>
                    ${converter.getFormatName()}
                    </${Menus.Menu.MenuItem.litTagName}>
                  `;
        })}
                <${Menus.Menu.MenuItem.litTagName} .value=${GET_EXTENSIONS_MENU_ITEM}>
                  ${i18nString(UIStrings.getExtensions)}
                </${Menus.Menu.MenuItem.litTagName}>
              </${Menus.Menu.MenuGroup.litTagName}>
            </${Menus.Menu.Menu.litTagName}>
            <${Buttons.Button.Button.litTagName}
              @click=${this.#onDeleteRecording}
              .data=${{
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconName: 'bin',
            disabled: !this.currentRecording ||
                this.#replayState.isPlaying ||
                this.isRecording ||
                this.isToggling,
            title: i18nString(UIStrings.deleteRecording),
            jslogContext: 'delete-recording',
        }}
            ></${Buttons.Button.Button.litTagName}>
            <div class="separator"></div>
            <${Buttons.Button.Button.litTagName}
              @click=${() => this.recordingPlayer?.continue()}
              .data=${{
            variant: "primary_toolbar" /* Buttons.Button.Variant.PRIMARY_TOOLBAR */,
            iconName: 'resume',
            disabled: !this.recordingPlayer ||
                !this.#replayState.isPausedOnBreakpoint,
            title: i18nString(UIStrings.continueReplay),
            jslogContext: 'continue-replay',
        }}
            ></${Buttons.Button.Button.litTagName}>
            <${Buttons.Button.Button.litTagName}
              @click=${() => this.recordingPlayer?.stepOver()}
              .data=${{
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconName: 'step-over',
            disabled: !this.recordingPlayer ||
                !this.#replayState.isPausedOnBreakpoint,
            title: i18nString(UIStrings.stepOverReplay),
            jslogContext: 'step-over',
        }}
            ></${Buttons.Button.Button.litTagName}>
            <div class="feedback">
              <x-link class="x-link" href=${Components.StartView.FEEDBACK_URL} jslog=${VisualLogging.link('feedback').track({ click: true })}>${i18nString(UIStrings.sendFeedback)}</x-link>
            </div>
            <div class="separator"></div>
            <${Dialogs.ShortcutDialog.ShortcutDialog.litTagName}
              .data=${{
            shortcuts: this.#getShortcutsInfo(),
        }} jslog=${VisualLogging.action('show-shortcuts').track({ click: true })}
            ></${Dialogs.ShortcutDialog.ShortcutDialog.litTagName}>
          </div>
          ${this.importError
            ? html `<div class='error'>Import error: ${this.importError.message}</div>`
            : ''}
          ${this.#renderCurrentPage()}
        </div>
      `;
        // clang-format on
    }
};
__decorate([
    state()
], RecorderController.prototype, "currentRecordingSession", void 0);
__decorate([
    state()
], RecorderController.prototype, "currentRecording", void 0);
__decorate([
    state()
], RecorderController.prototype, "currentStep", void 0);
__decorate([
    state()
], RecorderController.prototype, "recordingError", void 0);
__decorate([
    state()
], RecorderController.prototype, "isRecording", void 0);
__decorate([
    state()
], RecorderController.prototype, "isToggling", void 0);
__decorate([
    state()
], RecorderController.prototype, "recordingPlayer", void 0);
__decorate([
    state()
], RecorderController.prototype, "lastReplayResult", void 0);
__decorate([
    state()
], RecorderController.prototype, "currentPage", void 0);
__decorate([
    state()
], RecorderController.prototype, "previousPage", void 0);
__decorate([
    state()
], RecorderController.prototype, "sections", void 0);
__decorate([
    state()
], RecorderController.prototype, "settings", void 0);
__decorate([
    state()
], RecorderController.prototype, "importError", void 0);
__decorate([
    state()
], RecorderController.prototype, "exportMenuExpanded", void 0);
__decorate([
    state()
], RecorderController.prototype, "extensionConverters", void 0);
__decorate([
    state()
], RecorderController.prototype, "replayExtensions", void 0);
__decorate([
    state()
], RecorderController.prototype, "viewDescriptor", void 0);
RecorderController = __decorate([
    customElement('devtools-recorder-controller')
], RecorderController);
export { RecorderController };
//# sourceMappingURL=RecorderController.js.map