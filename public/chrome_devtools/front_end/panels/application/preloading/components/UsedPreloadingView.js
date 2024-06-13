// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import { assertNotNullOrUndefined } from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as IconButton from '../../../../ui/components/icon_button/icon_button.js';
import * as LegacyWrapper from '../../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import * as Coordinator from '../../../../ui/components/render_coordinator/render_coordinator.js';
import * as ReportView from '../../../../ui/components/report_view/report_view.js';
import * as UI from '../../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../../ui/visual_logging/visual_logging.js';
import * as PreloadingHelper from '../helper/helper.js';
import * as MismatchedPreloadingGrid from './MismatchedPreloadingGrid.js';
import * as PreloadingMismatchedHeadersGrid from './PreloadingMismatchedHeadersGrid.js';
import { prefetchFailureReason, prerenderFailureReason } from './PreloadingString.js';
import usedPreloadingStyles from './usedPreloadingView.css.js';
const UIStrings = {
    /**
     *@description Header for preloading status.
     */
    speculativeLoadingStatusForThisPage: 'Speculative loading status for this page',
    /**
     *@description Label for failure reason of preloeading
     */
    detailsFailureReason: 'Failure reason',
    /**
     *@description Message that tells this page was prerendered.
     */
    downgradedPrefetchUsed: 'The initiating page attempted to prerender this page\'s URL. The prerender failed, but the resulting response body was still used as a prefetch.',
    /**
     *@description Message that tells this page was prefetched.
     */
    prefetchUsed: 'This page was successfully prefetched.',
    /**
     *@description Message that tells this page was prerendered.
     */
    prerenderUsed: 'This page was successfully prerendered.',
    /**
     *@description Message that tells this page was prefetched.
     */
    prefetchFailed: 'The initiating page attempted to prefetch this page\'s URL, but the prefetch failed, so a full navigation was performed instead.',
    /**
     *@description Message that tells this page was prerendered.
     */
    prerenderFailed: 'The initiating page attempted to prerender this page\'s URL, but the prerender failed, so a full navigation was performed instead.',
    /**
     *@description Message that tells this page was not preloaded.
     */
    noPreloads: 'The initiating page did not attempt to speculatively load this page\'s URL.',
    /**
     *@description Header for current URL.
     */
    currentURL: 'Current URL',
    /**
     *@description Header for mismatched preloads.
     */
    preloadedURLs: 'URLs being speculatively loaded by the initiating page',
    /**
     *@description Header for summary.
     */
    speculationsInitiatedByThisPage: 'Speculations initiated by this page',
    /**
     *@description Link text to reveal rules.
     */
    viewAllRules: 'View all speculation rules',
    /**
     *@description Link text to reveal preloads.
     */
    viewAllSpeculations: 'View all speculations',
    /**
     *@description Link to learn more about Preloading
     */
    learnMore: 'Learn more: Speculative loading on developer.chrome.com',
    /**
     *@description Header for the table of mismatched network request header.
     */
    mismatchedHeadersDetail: 'Mismatched HTTP request headers',
    /**
     *@description Label for badge, indicating speculative load successfully used for this page.
     */
    badgeSuccess: 'Success',
    /**
     *@description Label for badge, indicating speculative load failed for this page.
     */
    badgeFailure: 'Failure',
    /**
     *@description Label for badge, indicating no speculative loads used for this page.
     */
    badgeNoSpeculativeLoads: 'No speculative loads',
    /**
     *@description Label for badge, indicating how many not triggered speculations there are.
     */
    badgeNotTriggeredWithCount: '{n, plural, =1 {# not triggered} other {# not triggered}}',
    /**
     *@description Label for badge, indicating how many in progress speculations there are.
     */
    badgeInProgressWithCount: '{n, plural, =1 {# in progress} other {# in progress}}',
    /**
     *@description Label for badge, indicating how many succeeded speculations there are.
     */
    badgeSuccessWithCount: '{n, plural, =1 {# success} other {# success}}',
    /**
     *@description Label for badge, indicating how many failed speculations there are.
     */
    badgeFailureWithCount: '{n, plural, =1 {# failure} other {# failures}}',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/preloading/components/UsedPreloadingView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
// TODO(kenoss): Rename this class and file once https://crrev.com/c/4933567 landed.
// This also shows summary of speculations initiated by this page.
export class UsedPreloadingView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    static litTagName = LitHtml.literal `devtools-resources-used-preloading-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #data = {
        pageURL: '',
        previousAttempts: [],
        currentAttempts: [],
    };
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [usedPreloadingStyles];
    }
    set data(data) {
        this.#data = data;
        void this.#render();
    }
    async #render() {
        await coordinator.write('UsedPreloadingView render', () => {
            LitHtml.render(this.#renderInternal(), this.#shadow, { host: this });
        });
    }
    #renderInternal() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.Report.litTagName}>
        ${this.#speculativeLoadingStatusForThisPageSections()}

        <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>

        ${this.#speculationsInitiatedByThisPageSummarySections()}

        <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>

        <${ReportView.ReportView.ReportSection.litTagName}>
          ${UI.XLink.XLink.create('https://developer.chrome.com/blog/prerender-pages/', i18nString(UIStrings.learnMore), 'link', undefined, 'learn-more')}
        </${ReportView.ReportView.ReportSection.litTagName}>
      </${ReportView.ReportView.Report.litTagName}>
    `;
        // clang-format on
    }
    #speculativeLoadingStatusForThisPageSections() {
        const pageURL = Common.ParsedURL.ParsedURL.urlWithoutHash(this.#data.pageURL);
        const forThisPage = this.#data.previousAttempts.filter(attempt => Common.ParsedURL.ParsedURL.urlWithoutHash(attempt.key.url) === pageURL);
        const prefetch = forThisPage.filter(attempt => attempt.key.action === "Prefetch" /* Protocol.Preload.SpeculationAction.Prefetch */)[0];
        const prerender = forThisPage.filter(attempt => attempt.key.action === "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */)[0];
        let kind = "NoPreloads" /* UsedKind.NoPreloads */;
        // Prerender -> prefetch downgrade case
        //
        // This code does not handle the case SpecRules designate these preloads rather than prerenderer automatically downgrade prerendering.
        // TODO(https://crbug.com/1410709): Improve this logic once automatic downgrade implemented.
        if (prerender?.status === "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */ &&
            prefetch?.status === "Success" /* SDK.PreloadingModel.PreloadingStatus.Success */) {
            kind = "DowngradedPrerenderToPrefetchAndUsed" /* UsedKind.DowngradedPrerenderToPrefetchAndUsed */;
        }
        else if (prefetch?.status === "Success" /* SDK.PreloadingModel.PreloadingStatus.Success */) {
            kind = "PrefetchUsed" /* UsedKind.PrefetchUsed */;
        }
        else if (prerender?.status === "Success" /* SDK.PreloadingModel.PreloadingStatus.Success */) {
            kind = "PrerenderUsed" /* UsedKind.PrerenderUsed */;
        }
        else if (prefetch?.status === "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */) {
            kind = "PrefetchFailed" /* UsedKind.PrefetchFailed */;
        }
        else if (prerender?.status === "Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */) {
            kind = "PrerenderFailed" /* UsedKind.PrerenderFailed */;
        }
        else {
            kind = "NoPreloads" /* UsedKind.NoPreloads */;
        }
        let badge;
        let basicMessage;
        switch (kind) {
            case "DowngradedPrerenderToPrefetchAndUsed" /* UsedKind.DowngradedPrerenderToPrefetchAndUsed */:
                badge = this.#badgeSuccess();
                basicMessage = LitHtml.html `${i18nString(UIStrings.downgradedPrefetchUsed)}`;
                break;
            case "PrefetchUsed" /* UsedKind.PrefetchUsed */:
                badge = this.#badgeSuccess();
                basicMessage = LitHtml.html `${i18nString(UIStrings.prefetchUsed)}`;
                break;
            case "PrerenderUsed" /* UsedKind.PrerenderUsed */:
                badge = this.#badgeSuccess();
                basicMessage = LitHtml.html `${i18nString(UIStrings.prerenderUsed)}`;
                break;
            case "PrefetchFailed" /* UsedKind.PrefetchFailed */:
                badge = this.#badgeFailure();
                basicMessage = LitHtml.html `${i18nString(UIStrings.prefetchFailed)}`;
                break;
            case "PrerenderFailed" /* UsedKind.PrerenderFailed */:
                badge = this.#badgeFailure();
                basicMessage = LitHtml.html `${i18nString(UIStrings.prerenderFailed)}`;
                break;
            case "NoPreloads" /* UsedKind.NoPreloads */:
                badge = this.#badgeNeutral(i18nString(UIStrings.badgeNoSpeculativeLoads));
                basicMessage = LitHtml.html `${i18nString(UIStrings.noPreloads)}`;
                break;
        }
        let maybeFailureReasonMessage;
        if (kind === "PrefetchFailed" /* UsedKind.PrefetchFailed */) {
            assertNotNullOrUndefined(prefetch);
            maybeFailureReasonMessage = prefetchFailureReason(prefetch);
        }
        else if (kind === "PrerenderFailed" /* UsedKind.PrerenderFailed */ || kind === "DowngradedPrerenderToPrefetchAndUsed" /* UsedKind.DowngradedPrerenderToPrefetchAndUsed */) {
            assertNotNullOrUndefined(prerender);
            maybeFailureReasonMessage = prerenderFailureReason(prerender);
        }
        let maybeFailureReason = LitHtml.nothing;
        if (maybeFailureReasonMessage !== undefined) {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            maybeFailureReason = LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.detailsFailureReason)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}>
        ${maybeFailureReasonMessage}
      </${ReportView.ReportView.ReportSection.litTagName}>
      `;
            // clang-format on
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.speculativeLoadingStatusForThisPage)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}>
        <div>
          <div class="status-badge-container">
            ${badge}
          </div>
          <div>
            ${basicMessage}
          </div>
        </div>
      </${ReportView.ReportView.ReportSection.litTagName}>

      ${maybeFailureReason}

      ${this.#maybeMismatchedSections(kind)}
      ${this.#maybeMismatchedHTTPHeadersSections()}
    `;
        // clang-format on
    }
    #maybeMismatchedSections(kind) {
        if (kind !== "NoPreloads" /* UsedKind.NoPreloads */ || this.#data.previousAttempts.length === 0) {
            return LitHtml.nothing;
        }
        const rows = this.#data.previousAttempts.map(attempt => {
            return {
                url: attempt.key.url,
                action: attempt.key.action,
                status: attempt.status,
            };
        });
        const data = {
            pageURL: this.#data.pageURL,
            rows,
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.currentURL)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}>
        ${UI.XLink.XLink.create(this.#data.pageURL, undefined, 'link', undefined, 'current-url')}
      </${ReportView.ReportView.ReportSection.litTagName}>

      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.preloadedURLs)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}
      jslog=${VisualLogging.section('preloaded-urls')}>
        <${MismatchedPreloadingGrid.MismatchedPreloadingGrid.litTagName}
          .data=${data}></${MismatchedPreloadingGrid.MismatchedPreloadingGrid.litTagName}>
      </${ReportView.ReportView.ReportSection.litTagName}>
    `;
        // clang-format on
    }
    #maybeMismatchedHTTPHeadersSections() {
        const attempt = this.#data.previousAttempts.find(attempt => attempt.action === "Prerender" /* Protocol.Preload.SpeculationAction.Prerender */ && attempt.mismatchedHeaders !== null);
        if (attempt === undefined) {
            return LitHtml.nothing;
        }
        if (attempt.key.url !== this.#data.pageURL) {
            // This place should never be reached since mismatched headers is reported only if the activation is attempted.
            // TODO(crbug.com/1456673): remove this check once DevTools support embedder-triggered prerender or prerender
            // supports non-vary-search.
            throw new Error('unreachable');
        }
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.mismatchedHeadersDetail)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}>
        <${PreloadingMismatchedHeadersGrid.PreloadingMismatchedHeadersGrid.litTagName}
          .data=${attempt}></${PreloadingMismatchedHeadersGrid.PreloadingMismatchedHeadersGrid.litTagName}>
      </${ReportView.ReportView.ReportSection.litTagName}>
    `;
        // clang-format on
    }
    #speculationsInitiatedByThisPageSummarySections() {
        const count = this.#data.currentAttempts.reduce((acc, attempt) => {
            acc.set(attempt.status, (acc.get(attempt.status) ?? 0) + 1);
            return acc;
        }, new Map());
        const notTriggeredCount = count.get("NotTriggered" /* SDK.PreloadingModel.PreloadingStatus.NotTriggered */) ?? 0;
        const readyCount = count.get("Ready" /* SDK.PreloadingModel.PreloadingStatus.Ready */) ?? 0;
        const failureCount = count.get("Failure" /* SDK.PreloadingModel.PreloadingStatus.Failure */) ?? 0;
        const inProgressCount = (count.get("Pending" /* SDK.PreloadingModel.PreloadingStatus.Pending */) ?? 0) +
            (count.get("Running" /* SDK.PreloadingModel.PreloadingStatus.Running */) ?? 0);
        const badges = [];
        if (this.#data.currentAttempts.length === 0) {
            badges.push(this.#badgeNeutral(i18nString(UIStrings.badgeNoSpeculativeLoads)));
        }
        if (notTriggeredCount > 0) {
            badges.push(this.#badgeNeutral(i18nString(UIStrings.badgeNotTriggeredWithCount, { n: notTriggeredCount })));
        }
        if (inProgressCount > 0) {
            badges.push(this.#badgeNeutral(i18nString(UIStrings.badgeInProgressWithCount, { n: inProgressCount })));
        }
        if (readyCount > 0) {
            badges.push(this.#badgeSuccess(readyCount));
        }
        if (failureCount > 0) {
            badges.push(this.#badgeFailure(failureCount));
        }
        const revealRuleSetView = () => {
            void Common.Revealer.reveal(new PreloadingHelper.PreloadingForward.RuleSetView(null));
        };
        const revealAttemptViewWithFilter = () => {
            void Common.Revealer.reveal(new PreloadingHelper.PreloadingForward.AttemptViewWithFilter(null));
        };
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <${ReportView.ReportView.ReportSectionHeader.litTagName}>${i18nString(UIStrings.speculationsInitiatedByThisPage)}</${ReportView.ReportView.ReportSectionHeader.litTagName}>
      <${ReportView.ReportView.ReportSection.litTagName}>
        <div>
          <div class="status-badge-container">
            ${badges}
          </div>

          <div class="reveal-links">
            <button class="link devtools-link" @click=${revealRuleSetView}
            jslog=${VisualLogging.action('view-all-rules').track({ click: true })}>
              ${i18nString(UIStrings.viewAllRules)}
            </button>
           ・
            <button class="link devtools-link" @click=${revealAttemptViewWithFilter}
            jslog=${VisualLogging.action('view-all-speculations').track({ click: true })}>
             ${i18nString(UIStrings.viewAllSpeculations)}
            </button>
          </div>
        </div>
      </${ReportView.ReportView.ReportSection.litTagName}>
    `;
        // clang-format on
    }
    #badgeSuccess(count) {
        let message;
        if (count === undefined) {
            message = i18nString(UIStrings.badgeSuccess);
        }
        else {
            message = i18nString(UIStrings.badgeSuccessWithCount, { n: count });
        }
        return this.#badge('status-badge status-badge-success', 'check-circle', message);
    }
    #badgeFailure(count) {
        let message;
        if (count === undefined) {
            message = i18nString(UIStrings.badgeFailure);
        }
        else {
            message = i18nString(UIStrings.badgeFailureWithCount, { n: count });
        }
        return this.#badge('status-badge status-badge-failure', 'cross-circle', message);
    }
    #badgeNeutral(message) {
        return this.#badge('status-badge status-badge-neutral', 'clear', message);
    }
    #badge(klass, iconName, message) {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        return LitHtml.html `
      <span class=${klass}>
        <${IconButton.Icon.Icon.litTagName} name=${iconName}></${IconButton.Icon.Icon.litTagName}>
        <span>
          ${message}
        </span>
      </span>
    `;
        // clang-format on
    }
}
customElements.define('devtools-resources-used-preloading-view', UsedPreloadingView);
//# sourceMappingURL=UsedPreloadingView.js.map