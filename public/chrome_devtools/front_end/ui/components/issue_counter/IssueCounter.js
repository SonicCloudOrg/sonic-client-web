// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as IssuesManager from '../../../models/issues_manager/issues_manager.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import issueCounterStyles from './issueCounter.css.js';
const UIStrings = {
    /**
     *@description Label for link to Issues tab, specifying how many issues there are.
     */
    pageErrors: '{issueCount, plural, =1 {# page error} other {# page errors}}',
    /**
     *@description Label for link to Issues tab, specifying how many issues there are.
     */
    breakingChanges: '{issueCount, plural, =1 {# breaking change} other {# breaking changes}}',
    /**
     *@description Label for link to Issues tab, specifying how many issues there are.
     */
    possibleImprovements: '{issueCount, plural, =1 {# possible improvement} other {# possible improvements}}',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/issue_counter/IssueCounter.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export function getIssueKindIconData(issueKind) {
    switch (issueKind) {
        case "PageError" /* IssuesManager.Issue.IssueKind.PageError */:
            return { iconName: 'issue-cross-filled', color: 'var(--icon-error)', width: '20px', height: '20px' };
        case "BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */:
            return { iconName: 'issue-exclamation-filled', color: 'var(--icon-warning)', width: '20px', height: '20px' };
        case "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */:
            return { iconName: 'issue-text-filled', color: 'var(--icon-info)', width: '20px', height: '20px' };
    }
}
function toIconGroup({ iconName, color, width, height }, sizeOverride) {
    if (sizeOverride) {
        return { iconName, iconColor: color, iconWidth: sizeOverride, iconHeight: sizeOverride };
    }
    return { iconName, iconColor: color, iconWidth: width, iconHeight: height };
}
// @ts-ignore Remove this comment once Intl.ListFormat is in type defs.
const listFormat = new Intl.ListFormat(navigator.language, { type: 'unit', style: 'short' });
export function getIssueCountsEnumeration(issuesManager, omitEmpty = true) {
    const counts = [
        issuesManager.numberOfIssues("PageError" /* IssuesManager.Issue.IssueKind.PageError */),
        issuesManager.numberOfIssues("BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */),
        issuesManager.numberOfIssues("Improvement" /* IssuesManager.Issue.IssueKind.Improvement */),
    ];
    const phrases = [
        i18nString(UIStrings.pageErrors, { issueCount: counts[0] }),
        i18nString(UIStrings.breakingChanges, { issueCount: counts[1] }),
        i18nString(UIStrings.possibleImprovements, { issueCount: counts[2] }),
    ];
    return listFormat.format(phrases.filter((_, i) => omitEmpty ? counts[i] > 0 : true));
}
export class IssueCounter extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-issue-counter`;
    #shadow = this.attachShadow({ mode: 'open' });
    #clickHandler = undefined;
    #tooltipCallback = undefined;
    #leadingText = '';
    #throttler;
    #counts = [0, 0, 0];
    #displayMode = "OmitEmpty" /* DisplayMode.OmitEmpty */;
    #issuesManager = undefined;
    #accessibleName = undefined;
    #throttlerTimeout;
    #compact = false;
    scheduleUpdate() {
        if (this.#throttler) {
            void this.#throttler.schedule(async () => this.#render());
        }
        else {
            this.#render();
        }
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [issueCounterStyles];
    }
    set data(data) {
        this.#clickHandler = data.clickHandler;
        this.#leadingText = data.leadingText ?? '';
        this.#tooltipCallback = data.tooltipCallback;
        this.#displayMode = data.displayMode ?? "OmitEmpty" /* DisplayMode.OmitEmpty */;
        this.#accessibleName = data.accessibleName;
        this.#throttlerTimeout = data.throttlerTimeout;
        this.#compact = Boolean(data.compact);
        if (this.#issuesManager !== data.issuesManager) {
            this.#issuesManager?.removeEventListener("IssuesCountUpdated" /* IssuesManager.IssuesManager.Events.IssuesCountUpdated */, this.scheduleUpdate, this);
            this.#issuesManager = data.issuesManager;
            this.#issuesManager.addEventListener("IssuesCountUpdated" /* IssuesManager.IssuesManager.Events.IssuesCountUpdated */, this.scheduleUpdate, this);
        }
        if (data.throttlerTimeout !== 0) {
            this.#throttler = new Common.Throttler.Throttler(data.throttlerTimeout ?? 100);
        }
        else {
            this.#throttler = undefined;
        }
        this.scheduleUpdate();
    }
    get data() {
        return {
            clickHandler: this.#clickHandler,
            leadingText: this.#leadingText,
            tooltipCallback: this.#tooltipCallback,
            displayMode: this.#displayMode,
            accessibleName: this.#accessibleName,
            throttlerTimeout: this.#throttlerTimeout,
            compact: this.#compact,
            issuesManager: this.#issuesManager,
        };
    }
    #render() {
        if (!this.#issuesManager) {
            return;
        }
        this.#counts = [
            this.#issuesManager.numberOfIssues("PageError" /* IssuesManager.Issue.IssueKind.PageError */),
            this.#issuesManager.numberOfIssues("BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */),
            this.#issuesManager.numberOfIssues("Improvement" /* IssuesManager.Issue.IssueKind.Improvement */),
        ];
        const importance = [
            "PageError" /* IssuesManager.Issue.IssueKind.PageError */,
            "BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */,
            "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */,
        ];
        const mostImportant = importance[this.#counts.findIndex(x => x > 0) ?? 2];
        const countToString = (kind, count) => {
            switch (this.#displayMode) {
                case "OmitEmpty" /* DisplayMode.OmitEmpty */:
                    return count > 0 ? `${count}` : undefined;
                case "ShowAlways" /* DisplayMode.ShowAlways */:
                    return `${count}`;
                case "OnlyMostImportant" /* DisplayMode.OnlyMostImportant */:
                    return kind === mostImportant ? `${count}` : undefined;
            }
        };
        const iconSize = '2ex';
        const data = {
            groups: [
                {
                    ...toIconGroup(getIssueKindIconData("PageError" /* IssuesManager.Issue.IssueKind.PageError */), iconSize),
                    text: countToString("PageError" /* IssuesManager.Issue.IssueKind.PageError */, this.#counts[0]),
                },
                {
                    ...toIconGroup(getIssueKindIconData("BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */), iconSize),
                    text: countToString("BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */, this.#counts[1]),
                },
                {
                    ...toIconGroup(getIssueKindIconData("Improvement" /* IssuesManager.Issue.IssueKind.Improvement */), iconSize),
                    text: countToString("Improvement" /* IssuesManager.Issue.IssueKind.Improvement */, this.#counts[2]),
                },
            ],
            clickHandler: this.#clickHandler,
            leadingText: this.#leadingText,
            accessibleName: this.#accessibleName,
            compact: this.#compact,
        };
        LitHtml.render(LitHtml.html `
        <icon-button .data=${data} .accessibleName=${this.#accessibleName}></icon-button>
        `, this.#shadow, { host: this });
        this.#tooltipCallback?.();
    }
}
customElements.define('devtools-issue-counter', IssueCounter);
//# sourceMappingURL=IssueCounter.js.map