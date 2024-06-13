// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as PanelFeedback from '../../ui/components/panel_feedback/panel_feedback.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Components from './components/components.js';
const UIStrings = {
    /**
     * @description Text for an option to learn more about something
     */
    learnmore: 'Learn more',
    /**
     * @description Text in Timeline Panel of the Performance panel
     */
    wasd: 'WASD',
    /**
     * @description Text in Timeline Panel of the Performance panel
     * @example {record} PH1
     * @example {Ctrl + R} PH2
     */
    clickTheRecordButtonSOrHitSTo: 'Click the record button {PH1} or hit {PH2} to start a new recording.',
    /**
     * @description Text in Timeline Panel of the Performance panel
     * @example {reload button} PH1
     * @example {Ctrl + R} PH2
     */
    clickTheReloadButtonSOrHitSTo: 'Click the reload button {PH1} or hit {PH2} to record the page load.',
    /**
     * @description Text in Timeline Panel of the Performance panel
     * @example {Ctrl + U} PH1
     * @example {Learn more} PH2
     */
    afterRecordingSelectAnAreaOf: 'After recording, select an area of interest in the overview by dragging. Then, zoom and pan the timeline with the mousewheel or {PH1} keys. {PH2}',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineLandingPage.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class TimelineLandingPage extends UI.Widget.VBox {
    toggleRecordAction;
    #splitWidget;
    constructor(toggleRecordAction, options) {
        super();
        this.toggleRecordAction = toggleRecordAction;
        this.contentElement.classList.add('timeline-landing-page', 'fill');
        if (Root.Runtime.experiments.isEnabled("timeline-observations" /* Root.Runtime.ExperimentName.TIMELINE_OBSERVATIONS */)) {
            this.renderLandingPage();
        }
        else {
            this.renderLegacyLandingPage(options);
        }
    }
    onResize() {
        const useNarrowLayout = this.contentElement.offsetWidth < 500;
        if (useNarrowLayout) {
            this.#splitWidget?.setVertical(false);
        }
        else {
            this.#splitWidget?.setVertical(true);
        }
    }
    renderLandingPage() {
        const mainWidget = new UI.Widget.Widget();
        mainWidget.contentElement.append(new Components.LiveMetricsView.LiveMetricsView());
        const sidebarWidget = new UI.Widget.Widget();
        sidebarWidget.contentElement.append(new Components.LiveMetricsView.LiveMetricsNextSteps());
        this.#splitWidget = new UI.SplitWidget.SplitWidget(true, true);
        this.#splitWidget.setMainWidget(mainWidget);
        this.#splitWidget.setSidebarWidget(sidebarWidget);
        this.#splitWidget.show(this.contentElement);
    }
    renderLegacyLandingPage(options) {
        function encloseWithTag(tagName, contents) {
            const e = document.createElement(tagName);
            e.textContent = contents;
            return e;
        }
        const learnMoreNode = UI.XLink.XLink.create('https://developer.chrome.com/docs/devtools/evaluate-performance/', i18nString(UIStrings.learnmore), undefined, undefined, 'learn-more');
        const recordKey = encloseWithTag('b', UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction('timeline.toggle-recording')[0].title());
        const reloadKey = encloseWithTag('b', UI.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction('timeline.record-reload')[0].title());
        const navigateNode = encloseWithTag('b', i18nString(UIStrings.wasd));
        this.contentElement.classList.add('legacy');
        const centered = this.contentElement.createChild('div');
        const recordButton = UI.UIUtils.createInlineButton(UI.Toolbar.Toolbar.createActionButton(this.toggleRecordAction));
        const reloadButton = UI.UIUtils.createInlineButton(UI.Toolbar.Toolbar.createActionButtonForId('timeline.record-reload'));
        centered.createChild('p').appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.clickTheRecordButtonSOrHitSTo, { PH1: recordButton, PH2: recordKey }));
        centered.createChild('p').appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.clickTheReloadButtonSOrHitSTo, { PH1: reloadButton, PH2: reloadKey }));
        centered.createChild('p').appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.afterRecordingSelectAnAreaOf, { PH1: navigateNode, PH2: learnMoreNode }));
        if (options?.isNode) {
            const previewSection = new PanelFeedback.PanelFeedback.PanelFeedback();
            previewSection.data = {
                feedbackUrl: 'https://crbug.com/1354548',
                quickStartUrl: 'https://goo.gle/js-profiler-deprecation',
                quickStartLinkText: i18nString(UIStrings.learnmore),
            };
            centered.appendChild(previewSection);
            const feedbackButton = new PanelFeedback.FeedbackButton.FeedbackButton();
            feedbackButton.data = {
                feedbackUrl: 'https://crbug.com/1354548',
            };
            centered.appendChild(feedbackButton);
        }
    }
}
//# sourceMappingURL=TimelineLandingPage.js.map