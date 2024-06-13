// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { TimelineEventOverviewCPUActivity, TimelineEventOverviewNetwork, TimelineEventOverviewResponsiveness, } from './TimelineEventOverview.js';
import timelineHistoryManagerStyles from './timelineHistoryManager.css.js';
const UIStrings = {
    /**
     *@description Screen reader label for the Timeline History dropdown button
     *@example {example.com #3} PH1
     *@example {Show recent timeline sessions} PH2
     */
    currentSessionSS: 'Current Session: {PH1}. {PH2}',
    /**
     *@description Text that shows there is no recording
     */
    noRecordings: '(no recordings)',
    /**
     *@description Text in Timeline History Manager of the Performance panel
     *@example {2s} PH1
     */
    sAgo: '({PH1} ago)',
    /**
     *@description Text in Timeline History Manager of the Performance panel
     */
    moments: 'moments',
    /**
     * @description Text in Timeline History Manager of the Performance panel.
     * Placeholder is a number and the 'm' is the short form for 'minutes'.
     * @example {2} PH1
     */
    sM: '{PH1} m',
    /**
     * @description Text in Timeline History Manager of the Performance panel.
     * Placeholder is a number and the 'h' is the short form for 'hours'.
     * @example {2} PH1
     */
    sH: '{PH1} h',
    /**
     *@description Text in Timeline History Manager of the Performance panel
     *@example {example.com} PH1
     *@example {2} PH2
     */
    sD: '{PH1} #{PH2}',
    /**
     *@description Accessible label for the timeline session selection menu
     */
    selectTimelineSession: 'Select Timeline Session',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineHistoryManager.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineHistoryManager {
    recordings;
    action;
    nextNumberByDomain;
    buttonInternal;
    allOverviews;
    totalHeight;
    enabled;
    lastActiveTraceIndex = null;
    #minimapComponent;
    constructor(minimapComponent) {
        this.recordings = [];
        this.#minimapComponent = minimapComponent;
        this.action = UI.ActionRegistry.ActionRegistry.instance().getAction('timeline.show-history');
        this.nextNumberByDomain = new Map();
        this.buttonInternal = new ToolbarButton(this.action);
        UI.ARIAUtils.markAsMenuButton(this.buttonInternal.element);
        this.clear();
        // Attempt to reuse the overviews coming from the panel's minimap
        // before creating new instances.
        this.allOverviews = [
            {
                constructor: traceParsedData => {
                    const responsivenessOverviewFromMinimap = this.#minimapComponent?.getControls().find(control => control instanceof TimelineEventOverviewResponsiveness);
                    return responsivenessOverviewFromMinimap || new TimelineEventOverviewResponsiveness(traceParsedData);
                },
                height: 3,
            },
            {
                constructor: traceParsedData => {
                    const cpuOverviewFromMinimap = this.#minimapComponent?.getControls().find(control => control instanceof TimelineEventOverviewCPUActivity);
                    if (cpuOverviewFromMinimap) {
                        return cpuOverviewFromMinimap;
                    }
                    return new TimelineEventOverviewCPUActivity(traceParsedData);
                },
                height: 20,
            },
            {
                constructor: traceParsedData => {
                    const networkOverviewFromMinimap = this.#minimapComponent?.getControls().find(control => control instanceof TimelineEventOverviewNetwork);
                    return networkOverviewFromMinimap || new TimelineEventOverviewNetwork(traceParsedData);
                },
                height: 8,
            },
        ];
        this.totalHeight = this.allOverviews.reduce((acc, entry) => acc + entry.height, 0);
        this.enabled = true;
    }
    addRecording(newInput) {
        const { traceParseDataIndex } = newInput.data;
        const filmStrip = newInput.filmStripForPreview;
        this.lastActiveTraceIndex = traceParseDataIndex;
        this.recordings.unshift({ traceParseDataIndex });
        // Order is important: this needs to happen first because lots of the
        // subsequent code depends on us storing the preview data into the map.
        this.#buildAndStorePreviewData(traceParseDataIndex, newInput.traceParsedData, filmStrip, newInput.startTime);
        const modelTitle = this.title(traceParseDataIndex);
        this.buttonInternal.setText(modelTitle);
        const buttonTitle = this.action.title();
        UI.ARIAUtils.setLabel(this.buttonInternal.element, i18nString(UIStrings.currentSessionSS, { PH1: modelTitle, PH2: buttonTitle }));
        this.updateState();
        if (this.recordings.length <= maxRecordings) {
            return;
        }
        const modelUsedMoreTimeAgo = this.recordings.reduce((a, b) => lastUsedTime(a.traceParseDataIndex) < lastUsedTime(b.traceParseDataIndex) ? a : b);
        this.recordings.splice(this.recordings.indexOf(modelUsedMoreTimeAgo), 1);
        function lastUsedTime(index) {
            const data = TimelineHistoryManager.dataForTraceIndex(index);
            if (!data) {
                throw new Error('Unable to find data for model');
            }
            return data.lastUsed;
        }
    }
    setEnabled(enabled) {
        this.enabled = enabled;
        this.updateState();
    }
    button() {
        return this.buttonInternal;
    }
    clear() {
        this.recordings = [];
        this.lastActiveTraceIndex = null;
        this.updateState();
        this.buttonInternal.setText(i18nString(UIStrings.noRecordings));
        this.nextNumberByDomain.clear();
    }
    async showHistoryDropDown() {
        if (this.recordings.length < 2 || !this.enabled) {
            return null;
        }
        // DropDown.show() function finishes when the dropdown menu is closed via selection or losing focus
        const activeTraceIndex = await DropDown.show(this.recordings.map(recording => recording.traceParseDataIndex), this.lastActiveTraceIndex, this.buttonInternal.element);
        if (activeTraceIndex === null) {
            return null;
        }
        const index = this.recordings.findIndex(recording => recording.traceParseDataIndex === activeTraceIndex);
        if (index < 0) {
            console.assert(false, 'selected recording not found');
            return null;
        }
        this.setCurrentModel(activeTraceIndex);
        return this.recordings[index];
    }
    cancelIfShowing() {
        DropDown.cancelIfShowing();
    }
    navigate(direction) {
        if (!this.enabled || this.lastActiveTraceIndex === null) {
            return null;
        }
        const index = this.recordings.findIndex(recording => recording.traceParseDataIndex === this.lastActiveTraceIndex);
        if (index < 0) {
            return null;
        }
        const newIndex = Platform.NumberUtilities.clamp(index + direction, 0, this.recordings.length - 1);
        const { traceParseDataIndex } = this.recordings[newIndex];
        this.setCurrentModel(traceParseDataIndex);
        return this.recordings[newIndex];
    }
    setCurrentModel(index) {
        const data = TimelineHistoryManager.dataForTraceIndex(index);
        if (!data) {
            throw new Error('Unable to find data for model');
        }
        data.lastUsed = Date.now();
        this.lastActiveTraceIndex = index;
        const modelTitle = this.title(index);
        const buttonTitle = this.action.title();
        this.buttonInternal.setText(modelTitle);
        UI.ARIAUtils.setLabel(this.buttonInternal.element, i18nString(UIStrings.currentSessionSS, { PH1: modelTitle, PH2: buttonTitle }));
    }
    updateState() {
        this.action.setEnabled(this.recordings.length > 1 && this.enabled);
    }
    static previewElement(traceDataIndex) {
        const data = TimelineHistoryManager.dataForTraceIndex(traceDataIndex);
        if (!data) {
            throw new Error('Unable to find data for model');
        }
        const startedAt = data.startTime;
        data.time.textContent =
            startedAt ? i18nString(UIStrings.sAgo, { PH1: TimelineHistoryManager.coarseAge(startedAt) }) : '';
        return data.preview;
    }
    static coarseAge(time) {
        const seconds = Math.round((Date.now() - time) / 1000);
        if (seconds < 50) {
            return i18nString(UIStrings.moments);
        }
        const minutes = Math.round(seconds / 60);
        if (minutes < 50) {
            return i18nString(UIStrings.sM, { PH1: minutes });
        }
        const hours = Math.round(minutes / 60);
        return i18nString(UIStrings.sH, { PH1: hours });
    }
    title(index) {
        const data = TimelineHistoryManager.dataForTraceIndex(index);
        if (!data) {
            throw new Error('Unable to find data for model');
        }
        return data.title;
    }
    #buildAndStorePreviewData(traceParseDataIndex, traceParsedData, filmStrip, startTime) {
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(traceParsedData.Meta.mainFrameURL);
        const domain = parsedURL ? parsedURL.host : '';
        const sequenceNumber = this.nextNumberByDomain.get(domain) || 1;
        const titleWithSequenceNumber = i18nString(UIStrings.sD, { PH1: domain, PH2: sequenceNumber });
        this.nextNumberByDomain.set(domain, sequenceNumber + 1);
        const timeElement = document.createElement('span');
        const preview = document.createElement('div');
        preview.classList.add('preview-item');
        preview.classList.add('vbox');
        preview.setAttribute('jslog', `${VisualLogging.dropDown('performance.history-item').track({ click: true })}`);
        const data = {
            preview,
            title: titleWithSequenceNumber,
            time: timeElement,
            lastUsed: Date.now(),
            startTime,
        };
        traceDataIndexToPerformancePreviewData.set(traceParseDataIndex, data);
        preview.appendChild(this.#buildTextDetails(traceParsedData, domain, timeElement));
        const screenshotAndOverview = preview.createChild('div', 'hbox');
        screenshotAndOverview.appendChild(this.#buildScreenshotThumbnail(filmStrip));
        screenshotAndOverview.appendChild(this.#buildOverview(traceParsedData));
        return data.preview;
    }
    #buildTextDetails(traceParsedData, title, timeElement) {
        const container = document.createElement('div');
        container.classList.add('text-details');
        container.classList.add('hbox');
        const nameSpan = container.createChild('span', 'name');
        nameSpan.textContent = title;
        UI.ARIAUtils.setLabel(nameSpan, title);
        const bounds = TraceEngine.Helpers.Timing.traceWindowMilliSeconds(traceParsedData.Meta.traceBounds);
        const duration = i18n.TimeUtilities.millisToString(bounds.range, false);
        const timeContainer = container.createChild('span', 'time');
        timeContainer.appendChild(document.createTextNode(duration));
        timeContainer.appendChild(timeElement);
        return container;
    }
    #buildScreenshotThumbnail(filmStrip) {
        const container = document.createElement('div');
        container.classList.add('screenshot-thumb');
        const thumbnailAspectRatio = 3 / 2;
        container.style.width = this.totalHeight * thumbnailAspectRatio + 'px';
        container.style.height = this.totalHeight + 'px';
        if (!filmStrip) {
            return container;
        }
        const lastFrame = filmStrip.frames.at(-1);
        if (!lastFrame) {
            return container;
        }
        void UI.UIUtils.loadImage(lastFrame.screenshotEvent.args.dataUri).then(img => {
            if (img) {
                container.appendChild(img);
            }
        });
        return container;
    }
    #buildOverview(traceParsedData) {
        const container = document.createElement('div');
        const dPR = window.devicePixelRatio;
        container.style.width = previewWidth + 'px';
        container.style.height = this.totalHeight + 'px';
        const canvas = container.createChild('canvas');
        canvas.width = dPR * previewWidth;
        canvas.height = dPR * this.totalHeight;
        const ctx = canvas.getContext('2d');
        let yOffset = 0;
        for (const overview of this.allOverviews) {
            const timelineOverviewComponent = overview.constructor(traceParsedData);
            timelineOverviewComponent.update();
            if (ctx) {
                ctx.drawImage(timelineOverviewComponent.context().canvas, 0, yOffset, dPR * previewWidth, overview.height * dPR);
            }
            yOffset += overview.height * dPR;
        }
        return container;
    }
    static dataForTraceIndex(index) {
        return traceDataIndexToPerformancePreviewData.get(index) || null;
    }
}
export const maxRecordings = 5;
export const previewWidth = 450;
// The reason we store a global map is because the Dropdown component needs to
// be able to read the preview data in order to show a preview in the dropdown.
const traceDataIndexToPerformancePreviewData = new Map();
export class DropDown {
    glassPane;
    listControl;
    focusRestorer;
    selectionDone;
    constructor(availableTraceDataIndexes) {
        this.glassPane = new UI.GlassPane.GlassPane();
        this.glassPane.setSizeBehavior("MeasureContent" /* UI.GlassPane.SizeBehavior.MeasureContent */);
        this.glassPane.setOutsideClickCallback(() => this.close(null));
        this.glassPane.setPointerEventsBehavior("BlockedByGlassPane" /* UI.GlassPane.PointerEventsBehavior.BlockedByGlassPane */);
        this.glassPane.setAnchorBehavior("PreferBottom" /* UI.GlassPane.AnchorBehavior.PreferBottom */);
        this.glassPane.element.addEventListener('blur', () => this.close(null));
        const shadowRoot = UI.UIUtils.createShadowRootWithCoreStyles(this.glassPane.contentElement, {
            cssFile: [timelineHistoryManagerStyles],
            delegatesFocus: undefined,
        });
        const contentElement = shadowRoot.createChild('div', 'drop-down');
        const listModel = new UI.ListModel.ListModel();
        this.listControl = new UI.ListControl.ListControl(listModel, this, UI.ListControl.ListMode.NonViewport);
        this.listControl.element.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        listModel.replaceAll(availableTraceDataIndexes);
        UI.ARIAUtils.markAsMenu(this.listControl.element);
        UI.ARIAUtils.setLabel(this.listControl.element, i18nString(UIStrings.selectTimelineSession));
        contentElement.appendChild(this.listControl.element);
        contentElement.addEventListener('keydown', this.onKeyDown.bind(this), false);
        contentElement.addEventListener('click', this.onClick.bind(this), false);
        this.focusRestorer = new UI.UIUtils.ElementFocusRestorer(this.listControl.element);
        this.selectionDone = null;
    }
    static show(availableTraceDataIndexes, activeTraceDataIndex, anchor) {
        if (DropDown.instance) {
            return Promise.resolve(null);
        }
        const instance = new DropDown(availableTraceDataIndexes);
        return instance.show(anchor, activeTraceDataIndex);
    }
    static cancelIfShowing() {
        if (!DropDown.instance) {
            return;
        }
        DropDown.instance.close(null);
    }
    show(anchor, activeTraceDataIndex) {
        DropDown.instance = this;
        this.glassPane.setContentAnchorBox(anchor.boxInWindow());
        this.glassPane.show(this.glassPane.contentElement.ownerDocument);
        this.listControl.element.focus();
        this.listControl.selectItem(activeTraceDataIndex);
        return new Promise(fulfill => {
            this.selectionDone = fulfill;
        });
    }
    onMouseMove(event) {
        const node = event.target.enclosingNodeOrSelfWithClass('preview-item');
        const listItem = node && this.listControl.itemForNode(node);
        if (listItem === null) {
            return;
        }
        this.listControl.selectItem(listItem);
    }
    onClick(event) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // @ts-expect-error
        if (!(event.target).enclosingNodeOrSelfWithClass('preview-item')) {
            return;
        }
        this.close(this.listControl.selectedItem());
    }
    onKeyDown(event) {
        switch (event.key) {
            case 'Tab':
            case 'Escape':
                this.close(null);
                break;
            case 'Enter':
                this.close(this.listControl.selectedItem());
                break;
            default:
                return;
        }
        event.consume(true);
    }
    close(traceIndex) {
        if (this.selectionDone) {
            this.selectionDone(traceIndex);
        }
        this.focusRestorer.restore();
        this.glassPane.hide();
        DropDown.instance = null;
    }
    createElementForItem(traceDataIndex) {
        const element = TimelineHistoryManager.previewElement(traceDataIndex);
        UI.ARIAUtils.markAsMenuItem(element);
        element.classList.remove('selected');
        return element;
    }
    heightForItem(_traceDataIndex) {
        console.assert(false, 'Should not be called');
        return 0;
    }
    isItemSelectable(_traceDataIndex) {
        return true;
    }
    selectedItemChanged(from, to, fromElement, toElement) {
        if (fromElement) {
            fromElement.classList.remove('selected');
        }
        if (toElement) {
            toElement.classList.add('selected');
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return false;
    }
    static instance = null;
}
export class ToolbarButton extends UI.Toolbar.ToolbarItem {
    contentElement;
    constructor(action) {
        const element = document.createElement('button');
        element.classList.add('history-dropdown-button');
        super(element);
        this.contentElement = this.element.createChild('span', 'content');
        this.element.addEventListener('click', () => void action.execute(), false);
        this.setEnabled(action.enabled());
        action.addEventListener("Enabled" /* UI.ActionRegistration.Events.Enabled */, event => this.setEnabled(event.data));
        this.setTitle(action.title());
    }
    setText(text) {
        this.contentElement.textContent = text;
    }
}
//# sourceMappingURL=TimelineHistoryManager.js.map