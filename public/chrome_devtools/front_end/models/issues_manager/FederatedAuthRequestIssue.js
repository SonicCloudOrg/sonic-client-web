// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue } from './Issue.js';
import { resolveLazyDescription, } from './MarkdownIssueDescription.js';
const UIStrings = {
    /**
     *@description Title for Client Hint specification url link
     */
    fedCm: 'Federated Credential Management API',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/FederatedAuthRequestIssue.ts', UIStrings);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
export class FederatedAuthRequestIssue extends Issue {
    #issueDetails;
    constructor(issueDetails, issuesModel) {
        super({
            code: "FederatedAuthRequestIssue" /* Protocol.Audits.InspectorIssueCode.FederatedAuthRequestIssue */,
            umaCode: [
                "FederatedAuthRequestIssue" /* Protocol.Audits.InspectorIssueCode.FederatedAuthRequestIssue */,
                issueDetails.federatedAuthRequestIssueReason,
            ].join('::'),
        }, issuesModel);
        this.#issueDetails = issueDetails;
    }
    getCategory() {
        return "Other" /* IssueCategory.Other */;
    }
    details() {
        return this.#issueDetails;
    }
    getDescription() {
        const description = issueDescriptions.get(this.#issueDetails.federatedAuthRequestIssueReason);
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
        const details = inspectorIssue.details.federatedAuthRequestIssueDetails;
        if (!details) {
            console.warn('Federated auth request issue without details received.');
            return [];
        }
        return [new FederatedAuthRequestIssue(details, issuesModel)];
    }
}
const issueDescriptions = new Map([
    [
        "TooManyRequests" /* Protocol.Audits.FederatedAuthRequestIssueReason.TooManyRequests */,
        {
            file: 'federatedAuthRequestTooManyRequests.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ConfigHttpNotFound" /* Protocol.Audits.FederatedAuthRequestIssueReason.ConfigHttpNotFound */,
        {
            file: 'federatedAuthRequestManifestHttpNotFound.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ConfigNoResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.ConfigNoResponse */,
        {
            file: 'federatedAuthRequestManifestNoResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ConfigInvalidResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.ConfigInvalidResponse */,
        {
            file: 'federatedAuthRequestManifestInvalidResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ClientMetadataHttpNotFound" /* Protocol.Audits.FederatedAuthRequestIssueReason.ClientMetadataHttpNotFound */,
        {
            file: 'federatedAuthRequestClientMetadataHttpNotFound.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ClientMetadataNoResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.ClientMetadataNoResponse */,
        {
            file: 'federatedAuthRequestClientMetadataNoResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ClientMetadataInvalidResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.ClientMetadataInvalidResponse */,
        {
            file: 'federatedAuthRequestClientMetadataInvalidResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ErrorFetchingSignin" /* Protocol.Audits.FederatedAuthRequestIssueReason.ErrorFetchingSignin */,
        {
            file: 'federatedAuthRequestErrorFetchingSignin.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "InvalidSigninResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.InvalidSigninResponse */,
        {
            file: 'federatedAuthRequestInvalidSigninResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "AccountsHttpNotFound" /* Protocol.Audits.FederatedAuthRequestIssueReason.AccountsHttpNotFound */,
        {
            file: 'federatedAuthRequestAccountsHttpNotFound.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "AccountsNoResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.AccountsNoResponse */,
        {
            file: 'federatedAuthRequestAccountsNoResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "AccountsInvalidResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.AccountsInvalidResponse */,
        {
            file: 'federatedAuthRequestAccountsInvalidResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "IdTokenHttpNotFound" /* Protocol.Audits.FederatedAuthRequestIssueReason.IdTokenHttpNotFound */,
        {
            file: 'federatedAuthRequestIdTokenHttpNotFound.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "IdTokenNoResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.IdTokenNoResponse */,
        {
            file: 'federatedAuthRequestIdTokenNoResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "IdTokenInvalidResponse" /* Protocol.Audits.FederatedAuthRequestIssueReason.IdTokenInvalidResponse */,
        {
            file: 'federatedAuthRequestIdTokenInvalidResponse.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "IdTokenInvalidRequest" /* Protocol.Audits.FederatedAuthRequestIssueReason.IdTokenInvalidRequest */,
        {
            file: 'federatedAuthRequestIdTokenInvalidRequest.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "ErrorIdToken" /* Protocol.Audits.FederatedAuthRequestIssueReason.ErrorIdToken */,
        {
            file: 'federatedAuthRequestErrorIdToken.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
    [
        "Canceled" /* Protocol.Audits.FederatedAuthRequestIssueReason.Canceled */,
        {
            file: 'federatedAuthRequestCanceled.md',
            links: [{
                    link: 'https://fedidcg.github.io/FedCM/',
                    linkTitle: i18nLazyString(UIStrings.fedCm),
                }],
        },
    ],
]);
//# sourceMappingURL=FederatedAuthRequestIssue.js.map