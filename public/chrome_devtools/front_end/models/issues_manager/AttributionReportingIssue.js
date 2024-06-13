// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Issue } from './Issue.js';
function getIssueCode(details) {
    switch (details.violationType) {
        case "PermissionPolicyDisabled" /* Protocol.Audits.AttributionReportingIssueType.PermissionPolicyDisabled */:
            return "AttributionReportingIssue::PermissionPolicyDisabled" /* IssueCode.PermissionPolicyDisabled */;
        case "UntrustworthyReportingOrigin" /* Protocol.Audits.AttributionReportingIssueType.UntrustworthyReportingOrigin */:
            return "AttributionReportingIssue::UntrustworthyReportingOrigin" /* IssueCode.UntrustworthyReportingOrigin */;
        case "InsecureContext" /* Protocol.Audits.AttributionReportingIssueType.InsecureContext */:
            return "AttributionReportingIssue::InsecureContext" /* IssueCode.InsecureContext */;
        case "InvalidHeader" /* Protocol.Audits.AttributionReportingIssueType.InvalidHeader */:
            return "AttributionReportingIssue::InvalidRegisterSourceHeader" /* IssueCode.InvalidRegisterSourceHeader */;
        case "InvalidRegisterTriggerHeader" /* Protocol.Audits.AttributionReportingIssueType.InvalidRegisterTriggerHeader */:
            return "AttributionReportingIssue::InvalidRegisterTriggerHeader" /* IssueCode.InvalidRegisterTriggerHeader */;
        case "SourceAndTriggerHeaders" /* Protocol.Audits.AttributionReportingIssueType.SourceAndTriggerHeaders */:
            return "AttributionReportingIssue::SourceAndTriggerHeaders" /* IssueCode.SourceAndTriggerHeaders */;
        case "SourceIgnored" /* Protocol.Audits.AttributionReportingIssueType.SourceIgnored */:
            return "AttributionReportingIssue::SourceIgnored" /* IssueCode.SourceIgnored */;
        case "TriggerIgnored" /* Protocol.Audits.AttributionReportingIssueType.TriggerIgnored */:
            return "AttributionReportingIssue::TriggerIgnored" /* IssueCode.TriggerIgnored */;
        case "OsSourceIgnored" /* Protocol.Audits.AttributionReportingIssueType.OsSourceIgnored */:
            return "AttributionReportingIssue::OsSourceIgnored" /* IssueCode.OsSourceIgnored */;
        case "OsTriggerIgnored" /* Protocol.Audits.AttributionReportingIssueType.OsTriggerIgnored */:
            return "AttributionReportingIssue::OsTriggerIgnored" /* IssueCode.OsTriggerIgnored */;
        case "InvalidRegisterOsSourceHeader" /* Protocol.Audits.AttributionReportingIssueType.InvalidRegisterOsSourceHeader */:
            return "AttributionReportingIssue::InvalidRegisterOsSourceHeader" /* IssueCode.InvalidRegisterOsSourceHeader */;
        case "InvalidRegisterOsTriggerHeader" /* Protocol.Audits.AttributionReportingIssueType.InvalidRegisterOsTriggerHeader */:
            return "AttributionReportingIssue::InvalidRegisterOsTriggerHeader" /* IssueCode.InvalidRegisterOsTriggerHeader */;
        case "WebAndOsHeaders" /* Protocol.Audits.AttributionReportingIssueType.WebAndOsHeaders */:
            return "AttributionReportingIssue::WebAndOsHeaders" /* IssueCode.WebAndOsHeaders */;
        case "NavigationRegistrationWithoutTransientUserActivation" /* Protocol.Audits.AttributionReportingIssueType.NavigationRegistrationWithoutTransientUserActivation */:
            return "AttributionReportingIssue::NavigationRegistrationWithoutTransientUserActivation" /* IssueCode.NavigationRegistrationWithoutTransientUserActivation */;
        default:
            return "AttributionReportingIssue::Unknown" /* IssueCode.Unknown */;
    }
}
const structuredHeaderLink = {
    link: 'https://tools.ietf.org/id/draft-ietf-httpbis-header-structure-15.html#rfc.section.4.2.2',
    linkTitle: 'Structured Headers RFC',
};
export class AttributionReportingIssue extends Issue {
    issueDetails;
    constructor(issueDetails, issuesModel) {
        super(getIssueCode(issueDetails), issuesModel);
        this.issueDetails = issueDetails;
    }
    getCategory() {
        return "AttributionReporting" /* IssueCategory.AttributionReporting */;
    }
    getHeaderValidatorLink(name) {
        const url = new URL('https://wicg.github.io/attribution-reporting-api/validate-headers');
        url.searchParams.set('header', name);
        if (this.issueDetails.invalidParameter) {
            url.searchParams.set('json', this.issueDetails.invalidParameter);
        }
        return {
            link: url.toString(),
            linkTitle: 'Header Validator',
        };
    }
    getDescription() {
        switch (this.code()) {
            case "AttributionReportingIssue::PermissionPolicyDisabled" /* IssueCode.PermissionPolicyDisabled */:
                return {
                    file: 'arPermissionPolicyDisabled.md',
                    links: [],
                };
            case "AttributionReportingIssue::UntrustworthyReportingOrigin" /* IssueCode.UntrustworthyReportingOrigin */:
                return {
                    file: 'arUntrustworthyReportingOrigin.md',
                    links: [],
                };
            case "AttributionReportingIssue::InsecureContext" /* IssueCode.InsecureContext */:
                return {
                    file: 'arInsecureContext.md',
                    links: [],
                };
            case "AttributionReportingIssue::InvalidRegisterSourceHeader" /* IssueCode.InvalidRegisterSourceHeader */:
                return {
                    file: 'arInvalidRegisterSourceHeader.md',
                    links: [this.getHeaderValidatorLink('source')],
                };
            case "AttributionReportingIssue::InvalidRegisterTriggerHeader" /* IssueCode.InvalidRegisterTriggerHeader */:
                return {
                    file: 'arInvalidRegisterTriggerHeader.md',
                    links: [this.getHeaderValidatorLink('trigger')],
                };
            case "AttributionReportingIssue::InvalidRegisterOsSourceHeader" /* IssueCode.InvalidRegisterOsSourceHeader */:
                return {
                    file: 'arInvalidRegisterOsSourceHeader.md',
                    links: [this.getHeaderValidatorLink('os-source')],
                };
            case "AttributionReportingIssue::InvalidRegisterOsTriggerHeader" /* IssueCode.InvalidRegisterOsTriggerHeader */:
                return {
                    file: 'arInvalidRegisterOsTriggerHeader.md',
                    links: [this.getHeaderValidatorLink('os-trigger')],
                };
            case "AttributionReportingIssue::SourceAndTriggerHeaders" /* IssueCode.SourceAndTriggerHeaders */:
                return {
                    file: 'arSourceAndTriggerHeaders.md',
                    links: [],
                };
            case "AttributionReportingIssue::WebAndOsHeaders" /* IssueCode.WebAndOsHeaders */:
                return {
                    file: 'arWebAndOsHeaders.md',
                    links: [],
                };
            case "AttributionReportingIssue::SourceIgnored" /* IssueCode.SourceIgnored */:
                return {
                    file: 'arSourceIgnored.md',
                    links: [structuredHeaderLink],
                };
            case "AttributionReportingIssue::TriggerIgnored" /* IssueCode.TriggerIgnored */:
                return {
                    file: 'arTriggerIgnored.md',
                    links: [structuredHeaderLink],
                };
            case "AttributionReportingIssue::OsSourceIgnored" /* IssueCode.OsSourceIgnored */:
                return {
                    file: 'arOsSourceIgnored.md',
                    links: [structuredHeaderLink],
                };
            case "AttributionReportingIssue::OsTriggerIgnored" /* IssueCode.OsTriggerIgnored */:
                return {
                    file: 'arOsTriggerIgnored.md',
                    links: [structuredHeaderLink],
                };
            case "AttributionReportingIssue::NavigationRegistrationWithoutTransientUserActivation" /* IssueCode.NavigationRegistrationWithoutTransientUserActivation */:
                return {
                    file: 'arNavigationRegistrationWithoutTransientUserActivation.md',
                    links: [],
                };
            case "AttributionReportingIssue::Unknown" /* IssueCode.Unknown */:
                return null;
        }
    }
    primaryKey() {
        return JSON.stringify(this.issueDetails);
    }
    getKind() {
        switch (this.code()) {
            case "AttributionReportingIssue::PermissionPolicyDisabled" /* IssueCode.PermissionPolicyDisabled */:
            case "AttributionReportingIssue::UntrustworthyReportingOrigin" /* IssueCode.UntrustworthyReportingOrigin */:
            case "AttributionReportingIssue::InsecureContext" /* IssueCode.InsecureContext */:
            case "AttributionReportingIssue::InvalidRegisterSourceHeader" /* IssueCode.InvalidRegisterSourceHeader */:
            case "AttributionReportingIssue::InvalidRegisterTriggerHeader" /* IssueCode.InvalidRegisterTriggerHeader */:
            case "AttributionReportingIssue::InvalidRegisterOsSourceHeader" /* IssueCode.InvalidRegisterOsSourceHeader */:
            case "AttributionReportingIssue::InvalidRegisterOsTriggerHeader" /* IssueCode.InvalidRegisterOsTriggerHeader */:
            case "AttributionReportingIssue::SourceAndTriggerHeaders" /* IssueCode.SourceAndTriggerHeaders */:
            case "AttributionReportingIssue::WebAndOsHeaders" /* IssueCode.WebAndOsHeaders */:
            case "AttributionReportingIssue::SourceIgnored" /* IssueCode.SourceIgnored */:
            case "AttributionReportingIssue::TriggerIgnored" /* IssueCode.TriggerIgnored */:
            case "AttributionReportingIssue::OsSourceIgnored" /* IssueCode.OsSourceIgnored */:
            case "AttributionReportingIssue::OsTriggerIgnored" /* IssueCode.OsTriggerIgnored */:
            case "AttributionReportingIssue::NavigationRegistrationWithoutTransientUserActivation" /* IssueCode.NavigationRegistrationWithoutTransientUserActivation */:
            case "AttributionReportingIssue::Unknown" /* IssueCode.Unknown */:
                return "PageError" /* IssueKind.PageError */;
        }
    }
    static fromInspectorIssue(issuesModel, inspectorIssue) {
        const { attributionReportingIssueDetails } = inspectorIssue.details;
        if (!attributionReportingIssueDetails) {
            console.warn('Attribution Reporting issue without details received.');
            return [];
        }
        return [new AttributionReportingIssue(attributionReportingIssueDetails, issuesModel)];
    }
}
//# sourceMappingURL=AttributionReportingIssue.js.map