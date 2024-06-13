// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue } from './Issue.js';
import { resolveLazyDescription, } from './MarkdownIssueDescription.js';
const UIStrings = {
    /**
     *@description Title for Compression Dictionary Transport specification url link
     */
    compressionDictionaryTransport: 'Compression Dictionary Transport',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/SharedDictionaryIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
function getIssueCode(details) {
    switch (details.sharedDictionaryError) {
        case "UseErrorCrossOriginNoCorsRequest" /* Protocol.Audits.SharedDictionaryError.UseErrorCrossOriginNoCorsRequest */:
            return "SharedDictionaryIssue::UseErrorCrossOriginNoCorsRequest" /* IssueCode.UseErrorCrossOriginNoCorsRequest */;
        case "UseErrorDictionaryLoadFailure" /* Protocol.Audits.SharedDictionaryError.UseErrorDictionaryLoadFailure */:
            return "SharedDictionaryIssue::UseErrorDictionaryLoadFailure" /* IssueCode.UseErrorDictionaryLoadFailure */;
        case "UseErrorMatchingDictionaryNotUsed" /* Protocol.Audits.SharedDictionaryError.UseErrorMatchingDictionaryNotUsed */:
            return "SharedDictionaryIssue::UseErrorMatchingDictionaryNotUsed" /* IssueCode.UseErrorMatchingDictionaryNotUsed */;
        case "UseErrorUnexpectedContentDictionaryHeader" /* Protocol.Audits.SharedDictionaryError.UseErrorUnexpectedContentDictionaryHeader */:
            return "SharedDictionaryIssue::UseErrorUnexpectedContentDictionaryHeader" /* IssueCode.UseErrorUnexpectedContentDictionaryHeader */;
        case "WriteErrorCossOriginNoCorsRequest" /* Protocol.Audits.SharedDictionaryError.WriteErrorCossOriginNoCorsRequest */:
            return "SharedDictionaryIssue::WriteErrorCossOriginNoCorsRequest" /* IssueCode.WriteErrorCossOriginNoCorsRequest */;
        case "WriteErrorDisallowedBySettings" /* Protocol.Audits.SharedDictionaryError.WriteErrorDisallowedBySettings */:
            return "SharedDictionaryIssue::WriteErrorDisallowedBySettings" /* IssueCode.WriteErrorDisallowedBySettings */;
        case "WriteErrorExpiredResponse" /* Protocol.Audits.SharedDictionaryError.WriteErrorExpiredResponse */:
            return "SharedDictionaryIssue::WriteErrorExpiredResponse" /* IssueCode.WriteErrorExpiredResponse */;
        case "WriteErrorFeatureDisabled" /* Protocol.Audits.SharedDictionaryError.WriteErrorFeatureDisabled */:
            return "SharedDictionaryIssue::WriteErrorFeatureDisabled" /* IssueCode.WriteErrorFeatureDisabled */;
        case "WriteErrorInsufficientResources" /* Protocol.Audits.SharedDictionaryError.WriteErrorInsufficientResources */:
            return "SharedDictionaryIssue::WriteErrorInsufficientResources" /* IssueCode.WriteErrorInsufficientResources */;
        case "WriteErrorInvalidMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorInvalidMatchField */:
            return "SharedDictionaryIssue::WriteErrorInvalidMatchField" /* IssueCode.WriteErrorInvalidMatchField */;
        case "WriteErrorInvalidStructuredHeader" /* Protocol.Audits.SharedDictionaryError.WriteErrorInvalidStructuredHeader */:
            return "SharedDictionaryIssue::WriteErrorInvalidStructuredHeader" /* IssueCode.WriteErrorInvalidStructuredHeader */;
        case "WriteErrorNavigationRequest" /* Protocol.Audits.SharedDictionaryError.WriteErrorNavigationRequest */:
            return "SharedDictionaryIssue::WriteErrorNavigationRequest" /* IssueCode.WriteErrorNavigationRequest */;
        case "WriteErrorNoMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNoMatchField */:
            return "SharedDictionaryIssue::WriteErrorNoMatchField" /* IssueCode.WriteErrorNoMatchField */;
        case "WriteErrorNonListMatchDestField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonListMatchDestField */:
            return "SharedDictionaryIssue::WriteErrorNonListMatchDestField" /* IssueCode.WriteErrorNonListMatchDestField */;
        case "WriteErrorNonSecureContext" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonSecureContext */:
            return "SharedDictionaryIssue::WriteErrorNonSecureContext" /* IssueCode.WriteErrorNonSecureContext */;
        case "WriteErrorNonStringIdField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringIdField */:
            return "SharedDictionaryIssue::WriteErrorNonStringIdField" /* IssueCode.WriteErrorNonStringIdField */;
        case "WriteErrorNonStringInMatchDestList" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringInMatchDestList */:
            return "SharedDictionaryIssue::WriteErrorNonStringInMatchDestList" /* IssueCode.WriteErrorNonStringInMatchDestList */;
        case "WriteErrorNonStringMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringMatchField */:
            return "SharedDictionaryIssue::WriteErrorNonStringMatchField" /* IssueCode.WriteErrorNonStringMatchField */;
        case "WriteErrorNonTokenTypeField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonTokenTypeField */:
            return "SharedDictionaryIssue::WriteErrorNonTokenTypeField" /* IssueCode.WriteErrorNonTokenTypeField */;
        case "WriteErrorRequestAborted" /* Protocol.Audits.SharedDictionaryError.WriteErrorRequestAborted */:
            return "SharedDictionaryIssue::WriteErrorRequestAborted" /* IssueCode.WriteErrorRequestAborted */;
        case "WriteErrorShuttingDown" /* Protocol.Audits.SharedDictionaryError.WriteErrorShuttingDown */:
            return "SharedDictionaryIssue::WriteErrorShuttingDown" /* IssueCode.WriteErrorShuttingDown */;
        case "WriteErrorTooLongIdField" /* Protocol.Audits.SharedDictionaryError.WriteErrorTooLongIdField */:
            return "SharedDictionaryIssue::WriteErrorTooLongIdField" /* IssueCode.WriteErrorTooLongIdField */;
        case "WriteErrorUnsupportedType" /* Protocol.Audits.SharedDictionaryError.WriteErrorUnsupportedType */:
            return "SharedDictionaryIssue::WriteErrorUnsupportedType" /* IssueCode.WriteErrorUnsupportedType */;
        default:
            return "SharedDictionaryIssue::WriteErrorUnknown" /* IssueCode.Unknown */;
    }
}
export class SharedDictionaryIssue extends Issue {
    #issueDetails;
    constructor(issueDetails, issuesModel) {
        super({
            code: getIssueCode(issueDetails),
            umaCode: [
                "SharedDictionaryIssue" /* Protocol.Audits.InspectorIssueCode.SharedDictionaryIssue */,
                issueDetails.sharedDictionaryError,
            ].join('::'),
        }, issuesModel);
        this.#issueDetails = issueDetails;
    }
    requests() {
        if (this.#issueDetails.request) {
            return [this.#issueDetails.request];
        }
        return [];
    }
    getCategory() {
        return "Other" /* IssueCategory.Other */;
    }
    details() {
        return this.#issueDetails;
    }
    getDescription() {
        const description = issueDescriptions.get(this.#issueDetails.sharedDictionaryError);
        if (!description) {
            return null;
        }
        return resolveLazyDescription(description);
    }
    primaryKey() {
        return JSON.stringify(this.#issueDetails);
    }
    getKind() {
        return "PageError" /* IssueKind.PageError */;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const details = inspectorIssue.details.sharedDictionaryIssueDetails;
        if (!details) {
            console.warn('Shared Dictionary issue without details received.');
            return [];
        }
        return [new SharedDictionaryIssue(details, issuesModel)];
    }
}
const specLinks = [{
        link: 'https://datatracker.ietf.org/doc/draft-ietf-httpbis-compression-dictionary/',
        linkTitle: i18nLazyString(UIStrings.compressionDictionaryTransport),
    }];
const issueDescriptions = new Map([
    [
        "UseErrorCrossOriginNoCorsRequest" /* Protocol.Audits.SharedDictionaryError.UseErrorCrossOriginNoCorsRequest */,
        {
            file: 'sharedDictionaryUseErrorCrossOriginNoCorsRequest.md',
            links: specLinks,
        },
    ],
    [
        "UseErrorDictionaryLoadFailure" /* Protocol.Audits.SharedDictionaryError.UseErrorDictionaryLoadFailure */,
        {
            file: 'sharedDictionaryUseErrorDictionaryLoadFailure.md',
            links: specLinks,
        },
    ],
    [
        "UseErrorMatchingDictionaryNotUsed" /* Protocol.Audits.SharedDictionaryError.UseErrorMatchingDictionaryNotUsed */,
        {
            file: 'sharedDictionaryUseErrorMatchingDictionaryNotUsed.md',
            links: specLinks,
        },
    ],
    [
        "UseErrorUnexpectedContentDictionaryHeader" /* Protocol.Audits.SharedDictionaryError.UseErrorUnexpectedContentDictionaryHeader */,
        {
            file: 'sharedDictionaryUseErrorUnexpectedContentDictionaryHeader.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorCossOriginNoCorsRequest" /* Protocol.Audits.SharedDictionaryError.WriteErrorCossOriginNoCorsRequest */,
        {
            file: 'sharedDictionaryWriteErrorCossOriginNoCorsRequest.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorDisallowedBySettings" /* Protocol.Audits.SharedDictionaryError.WriteErrorDisallowedBySettings */,
        {
            file: 'sharedDictionaryWriteErrorDisallowedBySettings.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorExpiredResponse" /* Protocol.Audits.SharedDictionaryError.WriteErrorExpiredResponse */,
        {
            file: 'sharedDictionaryWriteErrorExpiredResponse.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorFeatureDisabled" /* Protocol.Audits.SharedDictionaryError.WriteErrorFeatureDisabled */,
        {
            file: 'sharedDictionaryWriteErrorFeatureDisabled.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorInsufficientResources" /* Protocol.Audits.SharedDictionaryError.WriteErrorInsufficientResources */,
        {
            file: 'sharedDictionaryWriteErrorInsufficientResources.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorInvalidMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorInvalidMatchField */,
        {
            file: 'sharedDictionaryWriteErrorInvalidMatchField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorInvalidStructuredHeader" /* Protocol.Audits.SharedDictionaryError.WriteErrorInvalidStructuredHeader */,
        {
            file: 'sharedDictionaryWriteErrorInvalidStructuredHeader.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNavigationRequest" /* Protocol.Audits.SharedDictionaryError.WriteErrorNavigationRequest */,
        {
            file: 'sharedDictionaryWriteErrorNavigationRequest.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNoMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNoMatchField */,
        {
            file: 'sharedDictionaryWriteErrorNoMatchField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonListMatchDestField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonListMatchDestField */,
        {
            file: 'sharedDictionaryWriteErrorNonListMatchDestField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonSecureContext" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonSecureContext */,
        {
            file: 'sharedDictionaryWriteErrorNonSecureContext.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonStringIdField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringIdField */,
        {
            file: 'sharedDictionaryWriteErrorNonStringIdField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonStringInMatchDestList" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringInMatchDestList */,
        {
            file: 'sharedDictionaryWriteErrorNonStringInMatchDestList.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonStringMatchField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonStringMatchField */,
        {
            file: 'sharedDictionaryWriteErrorNonStringMatchField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorNonTokenTypeField" /* Protocol.Audits.SharedDictionaryError.WriteErrorNonTokenTypeField */,
        {
            file: 'sharedDictionaryWriteErrorNonTokenTypeField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorRequestAborted" /* Protocol.Audits.SharedDictionaryError.WriteErrorRequestAborted */,
        {
            file: 'sharedDictionaryWriteErrorRequestAborted.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorShuttingDown" /* Protocol.Audits.SharedDictionaryError.WriteErrorShuttingDown */,
        {
            file: 'sharedDictionaryWriteErrorShuttingDown.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorTooLongIdField" /* Protocol.Audits.SharedDictionaryError.WriteErrorTooLongIdField */,
        {
            file: 'sharedDictionaryWriteErrorTooLongIdField.md',
            links: specLinks,
        },
    ],
    [
        "WriteErrorUnsupportedType" /* Protocol.Audits.SharedDictionaryError.WriteErrorUnsupportedType */,
        {
            file: 'sharedDictionaryWriteErrorUnsupportedType.md',
            links: specLinks,
        },
    ],
]);
//# sourceMappingURL=SharedDictionaryIssue.js.map