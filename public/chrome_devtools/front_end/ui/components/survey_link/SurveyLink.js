// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as IconButton from '../icon_button/icon_button.js';
import surveyLinkStyles from './surveyLink.css.js';
const UIStrings = {
    /**
     *@description Text shown when the link to open a survey is clicked but the survey has not yet appeared
     */
    openingSurvey: 'Opening survey …',
    /**
     *@description Text displayed instead of the survey link after the survey link is clicked, if the survey was shown successfully
     */
    thankYouForYourFeedback: 'Thank you for your feedback',
    /**
     *@description Text displayed instead of the survey link after the survey link is clicked, if the survey was not shown successfully
     */
    anErrorOccurredWithTheSurvey: 'An error occurred with the survey',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/survey_link/SurveyLink.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// A link to a survey. The link is rendered aysnchronously because we need to first check if
// canShowSurvey succeeds.
export class SurveyLink extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-survey-link`;
    #shadow = this.attachShadow({ mode: 'open' });
    #trigger = '';
    #promptText = Common.UIString.LocalizedEmptyString;
    #canShowSurvey = () => { };
    #showSurvey = () => { };
    #state = "Checking" /* State.Checking */;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [surveyLinkStyles];
    }
    // Re-setting data will cause the state to go back to 'Checking' which hides the link.
    set data(data) {
        this.#trigger = data.trigger;
        this.#promptText = data.promptText;
        this.#canShowSurvey = data.canShowSurvey;
        this.#showSurvey = data.showSurvey;
        this.#checkSurvey();
    }
    #checkSurvey() {
        this.#state = "Checking" /* State.Checking */;
        this.#canShowSurvey(this.#trigger, ({ canShowSurvey }) => {
            if (!canShowSurvey) {
                this.#state = "DontShowLink" /* State.DontShowLink */;
            }
            else {
                this.#state = "ShowLink" /* State.ShowLink */;
            }
            this.#render();
        });
    }
    #sendSurvey() {
        this.#state = "Sending" /* State.Sending */;
        this.#render();
        this.#showSurvey(this.#trigger, ({ surveyShown }) => {
            if (!surveyShown) {
                this.#state = "Failed" /* State.Failed */;
            }
            else {
                this.#state = "SurveyShown" /* State.SurveyShown */;
            }
            this.#render();
        });
    }
    #render() {
        if (this.#state === "Checking" /* State.Checking */ || this.#state === "DontShowLink" /* State.DontShowLink */) {
            return;
        }
        let linkText = this.#promptText;
        if (this.#state === "Sending" /* State.Sending */) {
            linkText = i18nString(UIStrings.openingSurvey);
        }
        else if (this.#state === "SurveyShown" /* State.SurveyShown */) {
            linkText = i18nString(UIStrings.thankYouForYourFeedback);
        }
        else if (this.#state === "Failed" /* State.Failed */) {
            linkText = i18nString(UIStrings.anErrorOccurredWithTheSurvey);
        }
        let linkState = '';
        if (this.#state === "Sending" /* State.Sending */) {
            linkState = 'pending-link';
        }
        else if (this.#state === "Failed" /* State.Failed */ || this.#state === "SurveyShown" /* State.SurveyShown */) {
            linkState = 'disabled-link';
        }
        const ariaDisabled = this.#state !== "ShowLink" /* State.ShowLink */;
        // clang-format off
        // eslint-disable-next-line rulesdir/ban_style_tags_in_lit_html
        const output = LitHtml.html `
      <button class="link ${linkState}" tabindex=${ariaDisabled ? '-1' : '0'} .disabled=${ariaDisabled} aria-disabled=${ariaDisabled} @click=${this.#sendSurvey}>
        <${IconButton.Icon.Icon.litTagName} class="link-icon" .data=${{ iconName: 'review', color: 'var(--sys-color-primary)', width: 'var(--issue-link-icon-size, 16px)', height: 'var(--issue-link-icon-size, 16px)' }}></${IconButton.Icon.Icon.litTagName}><!--
      -->${linkText}
      </button>
    `;
        // clang-format on
        LitHtml.render(output, this.#shadow, { host: this });
    }
}
customElements.define('devtools-survey-link', SurveyLink);
//# sourceMappingURL=SurveyLink.js.map