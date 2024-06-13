// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue } from './Issue.js';
import { resolveLazyDescription, } from './MarkdownIssueDescription.js';
const UIStrings = {
    /**
     *@description Title for cross-origin portal post message error
     */
    crossOriginPortalPostMessage: 'Portals - Same-origin communication channels',
    /**
     *@description title for autofill documentation page
     */
    howDoesAutofillWorkPageTitle: 'How does autofill work?',
    /**
     *@description title for label form elements usage example page
     */
    labelFormlementsPageTitle: 'The label elements',
    /**
     *@description title for input form elements usage example page
     */
    inputFormElementPageTitle: 'The form input element',
    /**
     *@description title for autocomplete attribute documentation page.
     */
    autocompleteAttributePageTitle: 'HTML attribute: autocomplete',
    /**
     * @description title for CORB explainer.
     */
    corbExplainerPageTitle: 'CORB explainer',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/GenericIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class GenericIssue extends Issue {
    #issueDetails;
    constructor(issueDetails, issuesModel, issueId) {
        const issueCode = [
            "GenericIssue" /* Protocol.Audits.InspectorIssueCode.GenericIssue */,
            issueDetails.errorType,
        ].join('::');
        super(issueCode, issuesModel, issueId);
        this.#issueDetails = issueDetails;
    }
    requests() {
        if (this.#issueDetails.request) {
            return [this.#issueDetails.request];
        }
        return [];
    }
    getCategory() {
        return "Generic" /* IssueCategory.Generic */;
    }
    primaryKey() {
        const requestId = this.#issueDetails.request ? this.#issueDetails.request.requestId : 'no-request';
        return `${this.code()}-(${this.#issueDetails.frameId})-(${this.#issueDetails.violatingNodeId})-(${this.#issueDetails.violatingNodeAttribute})-(${requestId})`;
    }
    getDescription() {
        const description = issueDescriptions.get(this.#issueDetails.errorType);
        if (!description) {
            return null;
        }
        return resolveLazyDescription(description);
    }
    details() {
        return this.#issueDetails;
    }
    getKind() {
        return issueTypes.get(this.#issueDetails.errorType) || "Improvement" /* IssueKind.Improvement */;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const genericDetails = inspectorIssue.details.genericIssueDetails;
        if (!genericDetails) {
            console.warn('Generic issue without details received.');
            return [];
        }
        return [new GenericIssue(genericDetails, issuesModel, inspectorIssue.issueId)];
    }
}
export const genericCrossOriginPortalPostMessageError = {
    file: 'genericCrossOriginPortalPostMessageError.md',
    links: [{
            link: 'https://github.com/WICG/portals#same-origin-communication-channels',
            linkTitle: i18nLazyString(UIStrings.crossOriginPortalPostMessage),
        }],
};
export const genericFormLabelForNameError = {
    file: 'genericFormLabelForNameError.md',
    links: [{
            link: 'https://html.spec.whatwg.org/multipage/forms.html#attr-label-for',
            // Since the link points to a page with the same title, the 'HTML Standard'
            // string doesn't need to be translated.
            linkTitle: i18n.i18n.lockedLazyString('HTML Standard'),
        }],
};
export const genericFormInputWithNoLabelError = {
    file: 'genericFormInputWithNoLabelError.md',
    links: [],
};
export const genericFormAutocompleteAttributeEmptyError = {
    file: 'genericFormAutocompleteAttributeEmptyError.md',
    links: [],
};
export const genericFormDuplicateIdForInputError = {
    file: 'genericFormDuplicateIdForInputError.md',
    links: [{
            link: 'https://web.dev/learn/forms/autofill/#how-does-autofill-work',
            linkTitle: i18nLazyString(UIStrings.howDoesAutofillWorkPageTitle),
        }],
};
export const genericFormAriaLabelledByToNonExistingId = {
    file: 'genericFormAriaLabelledByToNonExistingId.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label',
            linkTitle: i18nLazyString(UIStrings.labelFormlementsPageTitle),
        }],
};
export const genericFormEmptyIdAndNameAttributesForInputError = {
    file: 'genericFormEmptyIdAndNameAttributesForInputError.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input',
            linkTitle: i18nLazyString(UIStrings.inputFormElementPageTitle),
        }],
};
export const genericFormInputAssignedAutocompleteValueToIdOrNameAttributeError = {
    file: 'genericFormInputAssignedAutocompleteValueToIdOrNameAttributeError.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values',
            linkTitle: i18nLazyString(UIStrings.autocompleteAttributePageTitle),
        }],
};
export const genericFormInputHasWrongButWellIntendedAutocompleteValue = {
    file: 'genericFormInputHasWrongButWellIntendedAutocompleteValueError.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete#values',
            linkTitle: i18nLazyString(UIStrings.autocompleteAttributePageTitle),
        }],
};
export const genericFormLabelForMatchesNonExistingIdError = {
    file: 'genericFormLabelForMatchesNonExistingIdError.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label',
            linkTitle: i18nLazyString(UIStrings.labelFormlementsPageTitle),
        }],
};
export const genericFormLabelHasNeitherForNorNestedInput = {
    file: 'genericFormLabelHasNeitherForNorNestedInput.md',
    links: [{
            link: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label',
            linkTitle: i18nLazyString(UIStrings.labelFormlementsPageTitle),
        }],
};
export const genericResponseWasBlockedbyORB = {
    file: 'genericResponseWasBlockedByORB.md',
    links: [{
            link: 'https://www.chromium.org/Home/chromium-security/corb-for-developers/',
            linkTitle: i18nLazyString(UIStrings.corbExplainerPageTitle),
        }],
};
const issueDescriptions = new Map([
    ["CrossOriginPortalPostMessageError" /* Protocol.Audits.GenericIssueErrorType.CrossOriginPortalPostMessageError */, genericCrossOriginPortalPostMessageError],
    ["FormLabelForNameError" /* Protocol.Audits.GenericIssueErrorType.FormLabelForNameError */, genericFormLabelForNameError],
    ["FormInputWithNoLabelError" /* Protocol.Audits.GenericIssueErrorType.FormInputWithNoLabelError */, genericFormInputWithNoLabelError],
    [
        "FormAutocompleteAttributeEmptyError" /* Protocol.Audits.GenericIssueErrorType.FormAutocompleteAttributeEmptyError */,
        genericFormAutocompleteAttributeEmptyError,
    ],
    ["FormDuplicateIdForInputError" /* Protocol.Audits.GenericIssueErrorType.FormDuplicateIdForInputError */, genericFormDuplicateIdForInputError],
    ["FormAriaLabelledByToNonExistingId" /* Protocol.Audits.GenericIssueErrorType.FormAriaLabelledByToNonExistingId */, genericFormAriaLabelledByToNonExistingId],
    [
        "FormEmptyIdAndNameAttributesForInputError" /* Protocol.Audits.GenericIssueErrorType.FormEmptyIdAndNameAttributesForInputError */,
        genericFormEmptyIdAndNameAttributesForInputError,
    ],
    [
        "FormInputAssignedAutocompleteValueToIdOrNameAttributeError" /* Protocol.Audits.GenericIssueErrorType.FormInputAssignedAutocompleteValueToIdOrNameAttributeError */,
        genericFormInputAssignedAutocompleteValueToIdOrNameAttributeError,
    ],
    [
        "FormLabelForMatchesNonExistingIdError" /* Protocol.Audits.GenericIssueErrorType.FormLabelForMatchesNonExistingIdError */,
        genericFormLabelForMatchesNonExistingIdError,
    ],
    [
        "FormLabelHasNeitherForNorNestedInput" /* Protocol.Audits.GenericIssueErrorType.FormLabelHasNeitherForNorNestedInput */,
        genericFormLabelHasNeitherForNorNestedInput,
    ],
    [
        "FormInputHasWrongButWellIntendedAutocompleteValueError" /* Protocol.Audits.GenericIssueErrorType.FormInputHasWrongButWellIntendedAutocompleteValueError */,
        genericFormInputHasWrongButWellIntendedAutocompleteValue,
    ],
    [
        "ResponseWasBlockedByORB" /* Protocol.Audits.GenericIssueErrorType.ResponseWasBlockedByORB */,
        genericResponseWasBlockedbyORB,
    ],
]);
const issueTypes = new Map([
    ["CrossOriginPortalPostMessageError" /* Protocol.Audits.GenericIssueErrorType.CrossOriginPortalPostMessageError */, "Improvement" /* IssueKind.Improvement */],
    ["FormLabelForNameError" /* Protocol.Audits.GenericIssueErrorType.FormLabelForNameError */, "PageError" /* IssueKind.PageError */],
    ["FormInputWithNoLabelError" /* Protocol.Audits.GenericIssueErrorType.FormInputWithNoLabelError */, "Improvement" /* IssueKind.Improvement */],
    ["FormAutocompleteAttributeEmptyError" /* Protocol.Audits.GenericIssueErrorType.FormAutocompleteAttributeEmptyError */, "PageError" /* IssueKind.PageError */],
    ["FormDuplicateIdForInputError" /* Protocol.Audits.GenericIssueErrorType.FormDuplicateIdForInputError */, "PageError" /* IssueKind.PageError */],
    ["FormAriaLabelledByToNonExistingId" /* Protocol.Audits.GenericIssueErrorType.FormAriaLabelledByToNonExistingId */, "Improvement" /* IssueKind.Improvement */],
    ["FormEmptyIdAndNameAttributesForInputError" /* Protocol.Audits.GenericIssueErrorType.FormEmptyIdAndNameAttributesForInputError */, "Improvement" /* IssueKind.Improvement */],
    [
        "FormInputAssignedAutocompleteValueToIdOrNameAttributeError" /* Protocol.Audits.GenericIssueErrorType.FormInputAssignedAutocompleteValueToIdOrNameAttributeError */,
        "Improvement" /* IssueKind.Improvement */,
    ],
    ["FormLabelForMatchesNonExistingIdError" /* Protocol.Audits.GenericIssueErrorType.FormLabelForMatchesNonExistingIdError */, "PageError" /* IssueKind.PageError */],
    ["FormLabelHasNeitherForNorNestedInput" /* Protocol.Audits.GenericIssueErrorType.FormLabelHasNeitherForNorNestedInput */, "Improvement" /* IssueKind.Improvement */],
    ["FormInputHasWrongButWellIntendedAutocompleteValueError" /* Protocol.Audits.GenericIssueErrorType.FormInputHasWrongButWellIntendedAutocompleteValueError */, "Improvement" /* IssueKind.Improvement */],
]);
//# sourceMappingURL=GenericIssue.js.map