// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import { Issue } from './Issue.js';
const UIStrings = {
    /**
     *@description Label for the link for CORS private network issues
     */
    corsPrivateNetworkAccess: 'Private Network Access',
    /**
     *@description Label for the link for CORS network issues
     */
    CORS: 'Cross-Origin Resource Sharing (`CORS`)',
};
const str_ = i18n.i18n.registerUIStrings('models/issues_manager/CorsIssue.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function getIssueCode(details) {
    switch (details.corsErrorStatus.corsError) {
        case "InvalidAllowMethodsPreflightResponse" /* Protocol.Network.CorsError.InvalidAllowMethodsPreflightResponse */:
        case "InvalidAllowHeadersPreflightResponse" /* Protocol.Network.CorsError.InvalidAllowHeadersPreflightResponse */:
        case "PreflightMissingAllowOriginHeader" /* Protocol.Network.CorsError.PreflightMissingAllowOriginHeader */:
        case "PreflightMultipleAllowOriginValues" /* Protocol.Network.CorsError.PreflightMultipleAllowOriginValues */:
        case "PreflightInvalidAllowOriginValue" /* Protocol.Network.CorsError.PreflightInvalidAllowOriginValue */:
        case "MissingAllowOriginHeader" /* Protocol.Network.CorsError.MissingAllowOriginHeader */:
        case "MultipleAllowOriginValues" /* Protocol.Network.CorsError.MultipleAllowOriginValues */:
        case "InvalidAllowOriginValue" /* Protocol.Network.CorsError.InvalidAllowOriginValue */:
            return "CorsIssue::InvalidHeaders" /* IssueCode.InvalidHeaderValues */;
        case "PreflightWildcardOriginNotAllowed" /* Protocol.Network.CorsError.PreflightWildcardOriginNotAllowed */:
        case "WildcardOriginNotAllowed" /* Protocol.Network.CorsError.WildcardOriginNotAllowed */:
            return "CorsIssue::WildcardOriginWithCredentials" /* IssueCode.WildcardOriginNotAllowed */;
        case "PreflightInvalidStatus" /* Protocol.Network.CorsError.PreflightInvalidStatus */:
        case "PreflightDisallowedRedirect" /* Protocol.Network.CorsError.PreflightDisallowedRedirect */:
        case "InvalidResponse" /* Protocol.Network.CorsError.InvalidResponse */:
            return "CorsIssue::PreflightResponseInvalid" /* IssueCode.PreflightResponseInvalid */;
        case "AllowOriginMismatch" /* Protocol.Network.CorsError.AllowOriginMismatch */:
        case "PreflightAllowOriginMismatch" /* Protocol.Network.CorsError.PreflightAllowOriginMismatch */:
            return "CorsIssue::OriginMismatch" /* IssueCode.OriginMismatch */;
        case "InvalidAllowCredentials" /* Protocol.Network.CorsError.InvalidAllowCredentials */:
        case "PreflightInvalidAllowCredentials" /* Protocol.Network.CorsError.PreflightInvalidAllowCredentials */:
            return "CorsIssue::AllowCredentialsRequired" /* IssueCode.AllowCredentialsRequired */;
        case "MethodDisallowedByPreflightResponse" /* Protocol.Network.CorsError.MethodDisallowedByPreflightResponse */:
            return "CorsIssue::MethodDisallowedByPreflightResponse" /* IssueCode.MethodDisallowedByPreflightResponse */;
        case "HeaderDisallowedByPreflightResponse" /* Protocol.Network.CorsError.HeaderDisallowedByPreflightResponse */:
            return "CorsIssue::HeaderDisallowedByPreflightResponse" /* IssueCode.HeaderDisallowedByPreflightResponse */;
        case "RedirectContainsCredentials" /* Protocol.Network.CorsError.RedirectContainsCredentials */:
            return "CorsIssue::RedirectContainsCredentials" /* IssueCode.RedirectContainsCredentials */;
        case "DisallowedByMode" /* Protocol.Network.CorsError.DisallowedByMode */:
            return "CorsIssue::DisallowedByMode" /* IssueCode.DisallowedByMode */;
        case "CorsDisabledScheme" /* Protocol.Network.CorsError.CorsDisabledScheme */:
            return "CorsIssue::CorsDisabledScheme" /* IssueCode.CorsDisabledScheme */;
        case "PreflightMissingAllowExternal" /* Protocol.Network.CorsError.PreflightMissingAllowExternal */:
            return "CorsIssue::PreflightMissingAllowExternal" /* IssueCode.PreflightMissingAllowExternal */;
        case "PreflightInvalidAllowExternal" /* Protocol.Network.CorsError.PreflightInvalidAllowExternal */:
            return "CorsIssue::PreflightInvalidAllowExternal" /* IssueCode.PreflightInvalidAllowExternal */;
        case "InsecurePrivateNetwork" /* Protocol.Network.CorsError.InsecurePrivateNetwork */:
            return "CorsIssue::InsecurePrivateNetwork" /* IssueCode.InsecurePrivateNetwork */;
        case "NoCorsRedirectModeNotFollow" /* Protocol.Network.CorsError.NoCorsRedirectModeNotFollow */:
            return "CorsIssue::NoCorsRedirectModeNotFollow" /* IssueCode.NoCorsRedirectModeNotFollow */;
        case "InvalidPrivateNetworkAccess" /* Protocol.Network.CorsError.InvalidPrivateNetworkAccess */:
            return "CorsIssue::InvalidPrivateNetworkAccess" /* IssueCode.InvalidPrivateNetworkAccess */;
        case "UnexpectedPrivateNetworkAccess" /* Protocol.Network.CorsError.UnexpectedPrivateNetworkAccess */:
            return "CorsIssue::UnexpectedPrivateNetworkAccess" /* IssueCode.UnexpectedPrivateNetworkAccess */;
        case "PreflightMissingAllowPrivateNetwork" /* Protocol.Network.CorsError.PreflightMissingAllowPrivateNetwork */:
        case "PreflightInvalidAllowPrivateNetwork" /* Protocol.Network.CorsError.PreflightInvalidAllowPrivateNetwork */:
            return "CorsIssue::PreflightAllowPrivateNetworkError" /* IssueCode.PreflightAllowPrivateNetworkError */;
        case "PreflightMissingPrivateNetworkAccessId" /* Protocol.Network.CorsError.PreflightMissingPrivateNetworkAccessId */:
            return "CorsIssue::PreflightMissingPrivateNetworkAccessId" /* IssueCode.PreflightMissingPrivateNetworkAccessId */;
        case "PreflightMissingPrivateNetworkAccessName" /* Protocol.Network.CorsError.PreflightMissingPrivateNetworkAccessName */:
            return "CorsIssue::PreflightMissingPrivateNetworkAccessName" /* IssueCode.PreflightMissingPrivateNetworkAccessName */;
        case "PrivateNetworkAccessPermissionUnavailable" /* Protocol.Network.CorsError.PrivateNetworkAccessPermissionUnavailable */:
            return "CorsIssue::PrivateNetworkAccessPermissionUnavailable" /* IssueCode.PrivateNetworkAccessPermissionUnavailable */;
        case "PrivateNetworkAccessPermissionDenied" /* Protocol.Network.CorsError.PrivateNetworkAccessPermissionDenied */:
            return "CorsIssue::PrivateNetworkAccessPermissionDenied" /* IssueCode.PrivateNetworkAccessPermissionDenied */;
    }
}
export class CorsIssue extends Issue {
    #issueDetails;
    constructor(issueDetails, issuesModel, issueId) {
        super(getIssueCode(issueDetails), issuesModel, issueId);
        this.#issueDetails = issueDetails;
    }
    getCategory() {
        return "Cors" /* IssueCategory.Cors */;
    }
    details() {
        return this.#issueDetails;
    }
    getDescription() {
        switch (getIssueCode(this.#issueDetails)) {
            case "CorsIssue::InsecurePrivateNetwork" /* IssueCode.InsecurePrivateNetwork */:
                return {
                    file: 'corsInsecurePrivateNetwork.md',
                    links: [{
                            link: 'https://developer.chrome.com/blog/private-network-access-update',
                            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess),
                        }],
                };
            case "CorsIssue::PreflightAllowPrivateNetworkError" /* IssueCode.PreflightAllowPrivateNetworkError */:
                return {
                    file: 'corsPreflightAllowPrivateNetworkError.md',
                    links: [{
                            link: 'https://developer.chrome.com/blog/private-network-access-update',
                            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess),
                        }],
                };
            case "CorsIssue::InvalidHeaders" /* IssueCode.InvalidHeaderValues */:
                return {
                    file: 'corsInvalidHeaderValues.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::WildcardOriginWithCredentials" /* IssueCode.WildcardOriginNotAllowed */:
                return {
                    file: 'corsWildcardOriginNotAllowed.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::PreflightResponseInvalid" /* IssueCode.PreflightResponseInvalid */:
                return {
                    file: 'corsPreflightResponseInvalid.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::OriginMismatch" /* IssueCode.OriginMismatch */:
                return {
                    file: 'corsOriginMismatch.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::AllowCredentialsRequired" /* IssueCode.AllowCredentialsRequired */:
                return {
                    file: 'corsAllowCredentialsRequired.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::MethodDisallowedByPreflightResponse" /* IssueCode.MethodDisallowedByPreflightResponse */:
                return {
                    file: 'corsMethodDisallowedByPreflightResponse.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::HeaderDisallowedByPreflightResponse" /* IssueCode.HeaderDisallowedByPreflightResponse */:
                return {
                    file: 'corsHeaderDisallowedByPreflightResponse.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::RedirectContainsCredentials" /* IssueCode.RedirectContainsCredentials */:
                return {
                    file: 'corsRedirectContainsCredentials.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::DisallowedByMode" /* IssueCode.DisallowedByMode */:
                return {
                    file: 'corsDisallowedByMode.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::CorsDisabledScheme" /* IssueCode.CorsDisabledScheme */:
                return {
                    file: 'corsDisabledScheme.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            case "CorsIssue::NoCorsRedirectModeNotFollow" /* IssueCode.NoCorsRedirectModeNotFollow */:
                return {
                    file: 'corsNoCorsRedirectModeNotFollow.md',
                    links: [{
                            link: 'https://web.dev/cross-origin-resource-sharing',
                            linkTitle: i18nString(UIStrings.CORS),
                        }],
                };
            // TODO(1462857): Change the link after we have a blog post for PNA
            // permission prompt.
            case "CorsIssue::PreflightMissingPrivateNetworkAccessId" /* IssueCode.PreflightMissingPrivateNetworkAccessId */:
            case "CorsIssue::PreflightMissingPrivateNetworkAccessName" /* IssueCode.PreflightMissingPrivateNetworkAccessName */:
                return {
                    file: 'corsPrivateNetworkPermissionDenied.md',
                    links: [{
                            link: 'https://developer.chrome.com/blog/private-network-access-update',
                            linkTitle: i18nString(UIStrings.corsPrivateNetworkAccess),
                        }],
                };
            case "CorsIssue::PreflightMissingAllowExternal" /* IssueCode.PreflightMissingAllowExternal */:
            case "CorsIssue::PreflightInvalidAllowExternal" /* IssueCode.PreflightInvalidAllowExternal */:
            case "CorsIssue::InvalidPrivateNetworkAccess" /* IssueCode.InvalidPrivateNetworkAccess */:
            case "CorsIssue::UnexpectedPrivateNetworkAccess" /* IssueCode.UnexpectedPrivateNetworkAccess */:
            case "CorsIssue::PrivateNetworkAccessPermissionUnavailable" /* IssueCode.PrivateNetworkAccessPermissionUnavailable */:
            case "CorsIssue::PrivateNetworkAccessPermissionDenied" /* IssueCode.PrivateNetworkAccessPermissionDenied */:
                return null;
        }
    }
    primaryKey() {
        return JSON.stringify(this.#issueDetails);
    }
    getKind() {
        if (this.#issueDetails.isWarning &&
            (this.#issueDetails.corsErrorStatus.corsError === "InsecurePrivateNetwork" /* Protocol.Network.CorsError.InsecurePrivateNetwork */ ||
                this.#issueDetails.corsErrorStatus.corsError ===
                    "PreflightMissingAllowPrivateNetwork" /* Protocol.Network.CorsError.PreflightMissingAllowPrivateNetwork */ ||
                this.#issueDetails.corsErrorStatus.corsError ===
                    "PreflightInvalidAllowPrivateNetwork" /* Protocol.Network.CorsError.PreflightInvalidAllowPrivateNetwork */)) {
            return "BreakingChange" /* IssueKind.BreakingChange */;
        }
        return "PageError" /* IssueKind.PageError */;
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const corsIssueDetails = inspectorIssue.details.corsIssueDetails;
        if (!corsIssueDetails) {
            console.warn('Cors issue without details received.');
            return [];
        }
        return [new CorsIssue(corsIssueDetails, issuesModel, inspectorIssue.issueId)];
    }
}
//# sourceMappingURL=CorsIssue.js.map