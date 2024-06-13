// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as Marked from '../../../third_party/marked/marked.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as Input from '../../../ui/components/input/input.js';
import * as MarkdownView from '../../../ui/components/markdown_view/markdown_view.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import { SourceType } from '../PromptBuilder.js';
import styles from './consoleInsight.css.js';
import listStyles from './consoleInsightSourcesList.css.js';
// Note: privacy and legal notices are not localized so far.
const UIStrings = {
    /**
     * @description The title of the insight source "Console message".
     */
    consoleMessage: 'Console message',
    /**
     * @description The title of the insight source "Stacktrace".
     */
    stackTrace: 'Stacktrace',
    /**
     * @description The title of the insight source "Network request".
     */
    networkRequest: 'Network request',
    /**
     * @description The title of the insight source "Related code".
     */
    relatedCode: 'Related code',
    /**
     * @description The title that is shown while the insight is being generated.
     */
    generating: 'Generating explanation…',
    /**
     * @description The header that indicates that the content shown is a console
     * insight.
     */
    insight: 'Explanation',
    /**
     * @description The title of the a button that closes the insight pane.
     */
    closeInsight: 'Close explanation',
    /**
     * @description The title of the list of source data that was used to generate the insight.
     */
    inputData: 'Data used to understand this message',
    /**
     * @description The title of the button that allows submitting positive
     * feedback about the console insight.
     */
    thumbsUp: 'Thumbs up',
    /**
     * @description The title of the button that allows submitting negative
     * feedback about the console insight.
     */
    thumbsDown: 'Thumbs down',
    /**
     * @description The title of the button that opens a page to report a legal
     * issue with the console insight.
     */
    report: 'Report legal issue',
    /**
     * @description The text of the header inside the console insight pane when there was an error generating an insight.
     */
    error: 'DevTools has encountered an error',
    /**
     * @description The message shown when an error has been encountered.
     */
    errorBody: 'Something went wrong. Try again.',
    /**
     * @description Label for screenreaders that is added to the end of the link
     * title to indicate that the link will be opened in a new tab.
     */
    opensInNewTab: '(opens in a new tab)',
    /**
     * @description The title of a link that allows the user to learn more about
     * the feature.
     */
    learnMore: 'Learn more',
    /**
     * @description The title of the message when the console insight is not available for some reason.
     */
    notAvailable: 'This feature is not available',
    /**
     * @description The error message when the user is not logged in into Chrome.
     */
    notLoggedIn: 'This feature is only available when you sign into Chrome with your Google account.',
    /**
     * @description The error message when the user is not logged in into Chrome.
     */
    syncIsOff: 'This feature requires you to turn on Chrome sync.',
    /**
     * @description The title of the button that opens Chrome settings.
     */
    updateSettings: 'Update Settings',
    /**
     * @description The header shown when the internet connection is not
     * available.
     */
    offlineHeader: 'DevTools can’t reach the internet',
    /**
     * @description Message shown when the user is offline.
     */
    offline: 'Check your internet connection and try again.',
    /**
     * @description The message shown if the user is not logged in.
     */
    signInToUse: 'Sign in to use this feature',
    /**
     * @description The title of the button that cancels a console insight flow.
     */
    cancel: 'Cancel',
    /**
     * @description The title of the button that disables the Console insight (this) feature.
     */
    disableFeature: 'Disable this feature',
    /**
     * @description The title of the button that goes to the next page.
     */
    next: 'Next',
    /**
     * @description The title of the button that goes back to the previous page.
     */
    back: 'Back',
    /**
     * @description The title of the button that lets the user to continue
     * with using the feature.
     */
    continue: 'Continue',
    /**
     * @description The title of the button that searches for the console
     * insight using a search engine instead of using console insights.
     */
    search: 'Use search instead',
    /**
     * @description Shown to the user when the network request data is not
     * available and a page reload might populate it.
     */
    reloadRecommendation: 'Reload the page to capture related network request data for this message in order to create a better insight.',
};
const str_ = i18n.i18n.registerUIStrings('panels/explain/components/ConsoleInsight.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const { render, html, Directives } = LitHtml;
export class CloseEvent extends Event {
    static eventName = 'close';
    constructor() {
        super(CloseEvent.eventName, { composed: true, bubbles: true });
    }
}
function localizeType(sourceType) {
    switch (sourceType) {
        case SourceType.MESSAGE:
            return i18nString(UIStrings.consoleMessage);
        case SourceType.STACKTRACE:
            return i18nString(UIStrings.stackTrace);
        case SourceType.NETWORK_REQUEST:
            return i18nString(UIStrings.networkRequest);
        case SourceType.RELATED_CODE:
            return i18nString(UIStrings.relatedCode);
    }
}
const TERMS_OF_SERVICE_URL = 'https://policies.google.com/terms';
const PRIVACY_POLICY_URL = 'https://policies.google.com/privacy';
const CODE_SNIPPET_WARNING_URL = 'https://support.google.com/legal/answer/13505487';
const LEARNMORE_URL = 'https://goo.gle/devtools-console-messages-ai';
const REPORT_URL = 'https://support.google.com/legal/troubleshooter/1114905?hl=en#ts=1115658%2C13380504';
const CHROME_SETTINGS_URL = 'chrome://settings';
export class ConsoleInsight extends HTMLElement {
    static async create(promptBuilder, aidaClient) {
        const syncData = await new Promise(resolve => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.getSyncInformation(syncInfo => {
                resolve(syncInfo);
            });
        });
        return new ConsoleInsight(promptBuilder, aidaClient, syncData);
    }
    static litTagName = LitHtml.literal `devtools-console-insight`;
    #shadow = this.attachShadow({ mode: 'open' });
    #promptBuilder;
    #aidaClient;
    #renderer = new MarkdownRenderer();
    // Main state.
    #state;
    // Rating sub-form state.
    #selectedRating;
    constructor(promptBuilder, aidaClient, syncInfo) {
        super();
        this.#promptBuilder = promptBuilder;
        this.#aidaClient = aidaClient;
        this.#state = {
            type: "not-logged-in" /* State.NOT_LOGGED_IN */,
        };
        if (syncInfo?.accountEmail && syncInfo.isSyncActive) {
            this.#state = {
                type: "loading" /* State.LOADING */,
                consentReminderConfirmed: false,
                consentOnboardingFinished: this.#getOnboardingCompletedSetting().get(),
            };
        }
        else if (!syncInfo?.accountEmail) {
            this.#state = {
                type: "not-logged-in" /* State.NOT_LOGGED_IN */,
            };
        }
        else if (!syncInfo?.isSyncActive) {
            this.#state = {
                type: "sync-is-off" /* State.SYNC_IS_OFF */,
            };
        }
        if (!navigator.onLine) {
            this.#state = {
                type: "offline" /* State.OFFLINE */,
            };
        }
        this.#render();
        // Stop keyboard event propagation to avoid Console acting on the events
        // inside the insight component.
        this.addEventListener('keydown', e => {
            e.stopPropagation();
        });
        this.addEventListener('keyup', e => {
            e.stopPropagation();
        });
        this.addEventListener('keypress', e => {
            e.stopPropagation();
        });
        this.addEventListener('click', e => {
            e.stopPropagation();
        });
        this.focus();
        // Measure the height of the element after an animation. `--actual-height` can
        // be used as the `from` value for the subsequent animation.
        this.addEventListener('animationend', () => {
            this.style.setProperty('--actual-height', `${this.offsetHeight}px`);
        });
    }
    #getOnboardingCompletedSetting() {
        return Common.Settings.Settings.instance().createLocalSetting('console-insights-onboarding-finished', false);
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [styles, Input.checkboxStyles];
        this.classList.add('opening');
        void this.#generateInsightIfNeeded();
    }
    #transitionTo(newState) {
        const previousState = this.#state;
        this.#state = newState;
        if (newState.type !== previousState.type && previousState.type === "loading" /* State.LOADING */) {
            this.classList.add('loaded');
        }
        this.#render();
        if (newState.type !== previousState.type) {
            this.#focusHeader();
        }
    }
    async #generateInsightIfNeeded() {
        if (this.#state.type !== "loading" /* State.LOADING */) {
            return;
        }
        if (!this.#state.consentOnboardingFinished) {
            this.#transitionTo({
                type: "consent-onboarding" /* State.CONSENT_ONBOARDING */,
                page: "private" /* ConsentOnboardingPage.PAGE1 */,
            });
            return;
        }
        if (!this.#state.consentReminderConfirmed) {
            const { sources, isPageReloadRecommended } = await this.#promptBuilder.buildPrompt();
            this.#transitionTo({
                type: "consent-reminder" /* State.CONSENT_REMINDER */,
                sources,
                isPageReloadRecommended,
            });
            return;
        }
    }
    #onClose() {
        this.dispatchEvent(new CloseEvent());
        this.classList.add('closing');
    }
    #onRating(event) {
        if (this.#state.type !== "insight" /* State.INSIGHT */) {
            throw new Error('Unexpected state');
        }
        // If it was rated, do not record again.
        if (this.#selectedRating !== undefined) {
            return;
        }
        this.#selectedRating = event.target.dataset.rating === 'true';
        this.#render();
        if (this.#selectedRating) {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightRatedPositive);
        }
        else {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightRatedNegative);
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.registerAidaClientEvent(JSON.stringify({
            client: 'CHROME_DEVTOOLS',
            event_time: new Date().toISOString(),
            corresponding_aida_rpc_global_id: this.#state.metadata?.rpcGlobalId,
            do_conversation_client_event: {
                user_feedback: {
                    sentiment: this.#selectedRating ? 'POSITIVE' : 'NEGATIVE',
                },
            },
        }));
    }
    #onReport() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(REPORT_URL);
    }
    #onSearch() {
        const query = this.#promptBuilder.getSearchQuery();
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openSearchResultsInNewTab(query);
    }
    async #onConsentReminderConfirmed() {
        this.#transitionTo({
            type: "loading" /* State.LOADING */,
            consentReminderConfirmed: true,
            consentOnboardingFinished: this.#getOnboardingCompletedSetting().get(),
        });
        try {
            for await (const { sources, isPageReloadRecommended, explanation, metadata } of this.#getInsight()) {
                const tokens = this.#validateMarkdown(explanation);
                const valid = tokens !== false;
                this.#transitionTo({
                    type: "insight" /* State.INSIGHT */,
                    tokens: valid ? tokens : [],
                    validMarkdown: valid,
                    explanation,
                    sources,
                    metadata,
                    isPageReloadRecommended,
                });
            }
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightGenerated);
        }
        catch (err) {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErrored);
            this.#transitionTo({
                type: "error" /* State.ERROR */,
                error: err.message,
            });
        }
    }
    /**
     * Validates the markdown by trying to render it.
     */
    #validateMarkdown(text) {
        try {
            const tokens = Marked.Marked.lexer(text);
            for (const token of tokens) {
                this.#renderer.renderToken(token);
            }
            return tokens;
        }
        catch {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredMarkdown);
            return false;
        }
    }
    async *#getInsight() {
        const { prompt, sources, isPageReloadRecommended } = await this.#promptBuilder.buildPrompt();
        try {
            for await (const response of this.#aidaClient.fetch(Host.AidaClient.AidaClient.buildConsoleInsightsRequest(prompt))) {
                yield { sources, isPageReloadRecommended, ...response };
            }
        }
        catch (err) {
            if (err.message === 'Server responded: permission denied') {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredPermissionDenied);
            }
            else if (err.message.startsWith('Cannot send request:')) {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredCannotSend);
            }
            else if (err.message.startsWith('Request failed:')) {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredRequestFailed);
            }
            else if (err.message.startsWith('Cannot parse chunk:')) {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredCannotParseChunk);
            }
            else if (err.message === 'Unknown chunk result') {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredUnknownChunk);
            }
            else if (err.message.startsWith('Server responded:')) {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredApi);
            }
            else {
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.InsightErroredOther);
            }
            throw err;
        }
    }
    #onGoToSettings() {
        const rootTarget = SDK.TargetManager.TargetManager.instance().rootTarget();
        if (rootTarget === null) {
            return;
        }
        const url = CHROME_SETTINGS_URL;
        void rootTarget.targetAgent().invoke_createTarget({ url }).then(result => {
            if (result.getError()) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(url);
            }
        });
    }
    #onDisableFeature() {
        try {
            Common.Settings.moduleSetting('console-insights-enabled').set(false);
        }
        finally {
            this.#onClose();
            UI.InspectorView.InspectorView.instance().displayReloadRequiredWarning('Reload for the change to apply.');
        }
    }
    #goToNextPage() {
        this.#transitionTo({
            type: "consent-onboarding" /* State.CONSENT_ONBOARDING */,
            page: "legal" /* ConsentOnboardingPage.PAGE2 */,
        });
    }
    #focusHeader() {
        this.#shadow.querySelector('header h2')?.focus();
    }
    #termsChecked() {
        const checkbox = this.#shadow.querySelector('.terms');
        if (!checkbox?.checked) {
            return false;
        }
        return true;
    }
    #onConsentOnboardingConfirmed() {
        if (!this.#termsChecked()) {
            return;
        }
        this.#getOnboardingCompletedSetting().set(true);
        this.#transitionTo({
            type: "loading" /* State.LOADING */,
            consentReminderConfirmed: false,
            consentOnboardingFinished: this.#getOnboardingCompletedSetting().get(),
        });
        void this.#generateInsightIfNeeded();
    }
    #goToPrevPage() {
        this.#transitionTo({
            type: "consent-onboarding" /* State.CONSENT_ONBOARDING */,
            page: "private" /* ConsentOnboardingPage.PAGE1 */,
        });
    }
    #renderCancelButton() {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      class="cancel-button"
      @click=${this.#onClose}
      .data=${{
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
            jslogContext: 'cancel',
        }}
    >
      ${i18nString(UIStrings.cancel)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderDisableFeatureButton() {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      @click=${this.#onDisableFeature}
      class="disable-button"
      .data=${{
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
            jslogContext: 'disable',
        }}
    >
      ${i18nString(UIStrings.disableFeature)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderNextButton() {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      class="next-button"
      @click=${this.#goToNextPage}
      .data=${{
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            jslogContext: 'next',
        }}
    >
      ${i18nString(UIStrings.next)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderBackButton() {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      @click=${this.#goToPrevPage}
      .data=${{
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
            jslogContext: 'back',
        }}
    >
      ${i18nString(UIStrings.back)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderContinueButton(handler, disabled = false) {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      @click=${handler}
      class="continue-button"
      .data=${{
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            disabled,
            jslogContext: 'continue',
        }}
    >
      ${i18nString(UIStrings.continue)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderSearchButton() {
        // clang-format off
        return html `<${Buttons.Button.Button.litTagName}
      @click=${this.#onSearch}
      class="search-button"
      .data=${{
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
            jslogContext: 'search',
        }}
    >
      ${i18nString(UIStrings.search)}
    </${Buttons.Button.Button.litTagName}>`;
        // clang-format on
    }
    #renderLearnMoreAboutInsights() {
        // clang-format off
        return html `<x-link href=${LEARNMORE_URL} class="link" jslog=${VisualLogging.link('learn-more').track({ click: true })}>
      ${i18nString(UIStrings.learnMore)}
    </x-link>`;
        // clang-format on
    }
    #onTermsChange() {
        this.#render();
    }
    #renderMain() {
        const jslog = `${VisualLogging.section(this.#state.type).track({ resize: true })}`;
        const disallowLogging = Common.Settings.Settings.instance().getHostConfig()?.devToolsConsoleInsights.disallowLogging === true;
        // clang-format off
        switch (this.#state.type) {
            case "loading" /* State.LOADING */:
                return html `<main jslog=${jslog}>
            <div role="presentation" class="loader" style="clip-path: url('#clipPath');">
              <svg width="100%" height="64">
                <clipPath id="clipPath">
                  <rect x="0" y="0" width="100%" height="16" rx="8"></rect>
                  <rect x="0" y="24" width="100%" height="16" rx="8"></rect>
                  <rect x="0" y="48" width="100%" height="16" rx="8"></rect>
                </clipPath>
              </svg>
            </div>
          </main>`;
            case "insight" /* State.INSIGHT */:
                return html `
        <main jslog=${jslog}>
          ${this.#state.validMarkdown ? html `<${MarkdownView.MarkdownView.MarkdownView.litTagName}
              .data=${{ tokens: this.#state.tokens, renderer: this.#renderer }}>
            </${MarkdownView.MarkdownView.MarkdownView.litTagName}>` : this.#state.explanation}
          <details style="--list-height: ${(this.#state.sources.length + (this.#state.isPageReloadRecommended ? 1 : 0)) * 20}px;" jslog=${VisualLogging.expand('sources').track({ click: true })}>
            <summary>${i18nString(UIStrings.inputData)}</summary>
            <${ConsoleInsightSourcesList.litTagName} .sources=${this.#state.sources} .isPageReloadRecommended=${this.#state.isPageReloadRecommended}>
            </${ConsoleInsightSourcesList.litTagName}>
          </details>
          <div class="buttons">
            ${this.#renderSearchButton()}
          </div>
        </main>`;
            case "error" /* State.ERROR */:
                return html `
        <main jslog=${jslog}>
          <div class="error">${i18nString(UIStrings.errorBody)}</div>
        </main>`;
            case "consent-reminder" /* State.CONSENT_REMINDER */:
                return html `
          <main jslog=${jslog}>
            <p>The following data will be sent to Google to understand the context for the console message.
            ${disallowLogging ? '' : 'Human reviewers may process this information for quality purposes. Don’t submit sensitive information.'}
            Read Google’s <x-link href=${TERMS_OF_SERVICE_URL} class="link" jslog=${VisualLogging.link('terms-of-service').track({ click: true })}>Terms of Service</x-link>.</p>
            <${ConsoleInsightSourcesList.litTagName} .sources=${this.#state.sources} .isPageReloadRecommended=${this.#state.isPageReloadRecommended}>
            </${ConsoleInsightSourcesList.litTagName}>
          </main>
        `;
            case "consent-onboarding" /* State.CONSENT_ONBOARDING */:
                switch (this.#state.page) {
                    case "private" /* ConsentOnboardingPage.PAGE1 */:
                        return html `<main jslog=${jslog}>
              <p>This notice and our <x-link href=${PRIVACY_POLICY_URL} class="link" jslog=${VisualLogging.link('privacy-notice').track({ click: true })}>privacy notice</x-link> describe how Chrome DevTools handles your data. Please read them carefully.</p>

              <p>Chrome DevTools uses the console message, associated stack trace, related source code, and the associated network headers as input data. When you use "Understand this message", Google collects this input data, generated output, related feature usage information, and your feedback. Google uses this data to provide, improve, and develop Google products and services and machine learning technologies, including Google's enterprise products such as Google Cloud.</p>

              <p>To help with quality and improve our products, human reviewers may read, annotate, and process the above-mentioned input data, generated output, related feature usage information, and your feedback. <strong>Please do not include sensitive (e.g., confidential) or personal information that can be used to identify you or others in your prompts or feedback.</strong> Your data will be stored in a way where Google cannot tell who provided it and can no longer fulfill any deletion requests and will be retained for up to 18 months. We may refrain from collecting data to improve our product if your Google account is managed by an organization and depending on your region.</p>
            </main>`;
                    case "legal" /* ConsentOnboardingPage.PAGE2 */:
                        return html `<main jslog=${jslog}>
            <p>As you try "Understand this message", here are key things to know:

            <ul>
              <li>Chrome DevTools uses console message, associated stack trace, related source code, and the associated network headers to provide answers.</li>
              <li>Chrome DevTools uses experimental technology, and may generate inaccurate or offensive information that doesn't represent Google's views. Voting on the responses will help make this feature better.</li>
              <li>This feature is an experimental feature and subject to future changes.</li>
              <li><strong><x-link class="link" href=${CODE_SNIPPET_WARNING_URL} jslog=${VisualLogging.link('use-code-with-caution').track({ click: true })}>Use generated code snippets with caution</x-link>.</strong></li>
            </ul>
            </p>

            <p>
            <label>
              <input class="terms" @change=${this.#onTermsChange} type="checkbox" jslog=${VisualLogging.toggle('terms-of-service-accepted')}>
              <span>I accept my use of "Understand this message" is subject to the <x-link href=${TERMS_OF_SERVICE_URL} class="link" jslog=${VisualLogging.link('terms-of-service').track({ click: true })}>Google Terms of Service</x-link>.</span>
            </label>
            </p>
            </main>`;
                }
            case "not-logged-in" /* State.NOT_LOGGED_IN */:
                return html `
          <main jslog=${jslog}>
            <div class="error">${i18nString(UIStrings.notLoggedIn)}</div>
          </main>`;
            case "sync-is-off" /* State.SYNC_IS_OFF */:
                return html `
          <main jslog=${jslog}>
            <div class="error">${i18nString(UIStrings.syncIsOff)}</div>
          </main>`;
            case "offline" /* State.OFFLINE */:
                return html `
          <main jslog=${jslog}>
            <div class="error">${i18nString(UIStrings.offline)}</div>
          </main>`;
        }
        // clang-format on
    }
    #renderFooter() {
        const showThumbsUpDownButtons = Common.Settings.Settings.instance().getHostConfig()?.devToolsConsoleInsights.disallowLogging !== true;
        // clang-format off
        const disclaimer = LitHtml.html `<span>
              This feature may display inaccurate or offensive information that doesn't represent Google's views.
              <x-link href=${LEARNMORE_URL} class="link" jslog=${VisualLogging.link('learn-more').track({ click: true })}>${i18nString(UIStrings.learnMore)}</x-link>
            </span>`;
        switch (this.#state.type) {
            case "loading" /* State.LOADING */:
                return LitHtml.nothing;
            case "error" /* State.ERROR */:
            case "offline" /* State.OFFLINE */:
                return html `<footer jslog=${VisualLogging.section('footer')}>
          <div class="disclaimer">
            ${disclaimer}
          </div>
        </footer>`;
            case "not-logged-in" /* State.NOT_LOGGED_IN */:
            case "sync-is-off" /* State.SYNC_IS_OFF */:
                return html `<footer jslog=${VisualLogging.section('footer')}>
        <div class="filler"></div>
        <div>
          <${Buttons.Button.Button.litTagName}
            @click=${this.#onGoToSettings}
            .data=${{
                    variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
                    jslogContext: 'update-settings',
                }}
          >
            ${UIStrings.updateSettings}
          </${Buttons.Button.Button.litTagName}>
        </div>
      </footer>`;
            case "consent-reminder" /* State.CONSENT_REMINDER */:
                return html `<footer jslog=${VisualLogging.section('footer')}>
          <div class="disclaimer">
            ${disclaimer}
          </div>
          <div class="filler"></div>
          <div class="buttons">
            ${this.#renderCancelButton()}
            ${this.#renderContinueButton(this.#onConsentReminderConfirmed)}
          </div>
        </footer>`;
            case "consent-onboarding" /* State.CONSENT_ONBOARDING */:
                switch (this.#state.page) {
                    case "private" /* ConsentOnboardingPage.PAGE1 */:
                        return html `<footer jslog=${VisualLogging.section('footer')}>
                <div class="disclaimer">
                  ${this.#renderLearnMoreAboutInsights()}
                </div>
                <div class="filler"></div>
                <div class="buttons">
                    ${this.#renderCancelButton()}
                    ${this.#renderDisableFeatureButton()}
                    ${this.#renderNextButton()}
                  </div>
              </footer>`;
                    case "legal" /* ConsentOnboardingPage.PAGE2 */:
                        return html `<footer jslog=${VisualLogging.section('footer')}>
            <div class="disclaimer">
              ${this.#renderLearnMoreAboutInsights()}
            </div>
            <div class="filler"></div>
            <div class="buttons">
                ${this.#renderBackButton()}
                ${this.#renderDisableFeatureButton()}
                ${this.#renderContinueButton(this.#onConsentOnboardingConfirmed, !this.#termsChecked())}
              </div>
          </footer>`;
                }
            case "insight" /* State.INSIGHT */:
                return html `<footer jslog=${VisualLogging.section('footer')}>
        <div class="disclaimer">
          ${disclaimer}
        </div>
        <div class="filler"></div>
        <div class="rating">
          ${showThumbsUpDownButtons ? html `
            <${Buttons.Button.Button.litTagName}
              data-rating=${'true'}
              .data=${{
                    variant: "icon" /* Buttons.Button.Variant.ICON */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'thumb-up',
                    active: this.#selectedRating !== undefined && this.#selectedRating,
                    title: i18nString(UIStrings.thumbsUp),
                    jslogContext: 'thumbs-up',
                }}
              @click=${this.#onRating}
            ></${Buttons.Button.Button.litTagName}>
            <${Buttons.Button.Button.litTagName}
              data-rating=${'false'}
              .data=${{
                    variant: "icon" /* Buttons.Button.Variant.ICON */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'thumb-down',
                    active: this.#selectedRating !== undefined && !this.#selectedRating,
                    title: i18nString(UIStrings.thumbsDown),
                    jslogContext: 'thumbs-down',
                }}
              @click=${this.#onRating}
            ></${Buttons.Button.Button.litTagName}>
          ` : LitHtml.nothing}
          <${Buttons.Button.Button.litTagName}
            .data=${{
                    variant: "icon" /* Buttons.Button.Variant.ICON */,
                    size: "SMALL" /* Buttons.Button.Size.SMALL */,
                    iconName: 'report',
                    title: i18nString(UIStrings.report),
                    jslogContext: 'report',
                }}
            @click=${this.#onReport}
          ></${Buttons.Button.Button.litTagName}>
        </div>

      </footer>`;
        }
        // clang-format on
    }
    #getHeader() {
        switch (this.#state.type) {
            case "not-logged-in" /* State.NOT_LOGGED_IN */:
                return i18nString(UIStrings.signInToUse);
            case "sync-is-off" /* State.SYNC_IS_OFF */:
                return i18nString(UIStrings.notAvailable);
            case "offline" /* State.OFFLINE */:
                return i18nString(UIStrings.offlineHeader);
            case "loading" /* State.LOADING */:
                return i18nString(UIStrings.generating);
            case "insight" /* State.INSIGHT */:
                return i18nString(UIStrings.insight);
            case "error" /* State.ERROR */:
                return i18nString(UIStrings.error);
            case "consent-reminder" /* State.CONSENT_REMINDER */:
                return i18nString(UIStrings.inputData);
            case "consent-onboarding" /* State.CONSENT_ONBOARDING */:
                switch (this.#state.page) {
                    case "private" /* ConsentOnboardingPage.PAGE1 */:
                        return 'Privacy notice';
                    case "legal" /* ConsentOnboardingPage.PAGE2 */:
                        return 'Legal notice';
                }
        }
    }
    #render() {
        // clang-format off
        render(html `
      <div class="wrapper" jslog=${VisualLogging.pane('console-insights').track({ resize: true })}>
        <header>
          <div class="filler">
            <h2 tabindex="-1">
              ${this.#getHeader()}
            </h2>
          </div>
          <div>
            <${Buttons.Button.Button.litTagName}
              .data=${{
            variant: "icon" /* Buttons.Button.Variant.ICON */,
            size: "SMALL" /* Buttons.Button.Size.SMALL */,
            iconName: 'cross',
            title: i18nString(UIStrings.closeInsight),
        }}
              jslog=${VisualLogging.close().track({ click: true })}
              @click=${this.#onClose}
            ></${Buttons.Button.Button.litTagName}>
          </div>
        </header>
        ${this.#renderMain()}
        ${this.#renderFooter()}
      </div>
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
    }
}
class ConsoleInsightSourcesList extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-console-insight-sources-list`;
    #shadow = this.attachShadow({ mode: 'open' });
    #sources = [];
    #isPageReloadRecommended = false;
    constructor() {
        super();
        this.#shadow.adoptedStyleSheets = [listStyles, Input.checkboxStyles];
    }
    #render() {
        // clang-format off
        render(html `
      <ul>
        ${Directives.repeat(this.#sources, item => item.value, item => {
            return html `<li><x-link class="link" title="${localizeType(item.type)} ${i18nString(UIStrings.opensInNewTab)}" href="data:text/plain,${encodeURIComponent(item.value)}" jslog=${VisualLogging.link('source-' + item.type).track({ click: true })}>
            <${IconButton.Icon.Icon.litTagName} name="open-externally"></${IconButton.Icon.Icon.litTagName}>
            ${localizeType(item.type)}
          </x-link></li>`;
        })}
        ${this.#isPageReloadRecommended ? LitHtml.html `<li class="source-disclaimer">
          <${IconButton.Icon.Icon.litTagName} name="warning"></${IconButton.Icon.Icon.litTagName}>
          ${i18nString(UIStrings.reloadRecommendation)}</li>` : LitHtml.nothing}
      </ul>
    `, this.#shadow, {
            host: this,
        });
        // clang-format on
    }
    set sources(values) {
        this.#sources = values;
        this.#render();
    }
    set isPageReloadRecommended(isPageReloadRecommended) {
        this.#isPageReloadRecommended = isPageReloadRecommended;
        this.#render();
    }
}
customElements.define('devtools-console-insight', ConsoleInsight);
customElements.define('devtools-console-insight-sources-list', ConsoleInsightSourcesList);
export class MarkdownRenderer extends MarkdownView.MarkdownView.MarkdownLitRenderer {
    renderToken(token) {
        const template = this.templateForToken(token);
        if (template === null) {
            return LitHtml.html `${token.raw}`;
        }
        return template;
    }
    templateForToken(token) {
        switch (token.type) {
            case 'heading':
                return html `<strong>${this.renderText(token)}</strong>`;
            case 'link':
            case 'image':
                return LitHtml.html `${UI.XLink.XLink.create(token.href, token.text, undefined, undefined, 'link-in-explanation')}`;
            case 'code':
                return LitHtml.html `<${MarkdownView.CodeBlock.CodeBlock.litTagName}
          .code=${this.unescape(token.text)}
          .codeLang=${token.lang}
          .displayNotice=${true}>
        </${MarkdownView.CodeBlock.CodeBlock.litTagName}>`;
        }
        return super.templateForToken(token);
    }
}
//# sourceMappingURL=ConsoleInsight.js.map