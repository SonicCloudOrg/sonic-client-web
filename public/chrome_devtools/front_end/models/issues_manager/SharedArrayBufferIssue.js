// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue } from './Issue.js';
const UIStrings = {
    /**
     *@description Label for the link for SharedArrayBuffer Issues. The full text reads "Enabling `SharedArrayBuffer`"
     * and is the title of an article that describes how to enable a JavaScript feature called SharedArrayBuffer.
     */
    enablingSharedArrayBuffer: 'Enabling `SharedArrayBuffer`',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/SharedArrayBufferIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class SharedArrayBufferIssue extends Issue {
    #issueDetails;
    constructor(issueDetails, issuesModel) {
        const umaCode = ["SharedArrayBufferIssue" /* Protocol.Audits.InspectorIssueCode.SharedArrayBufferIssue */, issueDetails.type].join('::');
        super({ code: "SharedArrayBufferIssue" /* Protocol.Audits.InspectorIssueCode.SharedArrayBufferIssue */, umaCode }, issuesModel);
        this.#issueDetails = issueDetails;
    }
    getCategory() {
        return "Other" /* IssueCategory.Other */;
    }
    details() {
        return this.#issueDetails;
    }
    getDescription() {
        return {
            file: 'sharedArrayBuffer.md',
            links: [{
                    link: 'https://developer.chrome.com/blog/enabling-shared-array-buffer/',
                    linkTitle: i18nString(UIStrings.enablingSharedArrayBuffer),
                }],
        };
    }
    primaryKey() {
        return JSON.stringify(this.#issueDetails);
    }
    getKind() {
        if (this.#issueDetails.isWarning) {
            return "BreakingChange" /* IssueKind.BreakingChange */;
        }
        return "PageError" /* IssueKind.PageError */;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const sabIssueDetails = inspectorIssue.details.sharedArrayBufferIssueDetails;
        if (!sabIssueDetails) {
            console.warn('SAB transfer issue without details received.');
            return [];
        }
        return [new SharedArrayBufferIssue(sabIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=SharedArrayBufferIssue.js.map