import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { type MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare const enum IssueCode {
    PermissionPolicyDisabled = "AttributionReportingIssue::PermissionPolicyDisabled",
    UntrustworthyReportingOrigin = "AttributionReportingIssue::UntrustworthyReportingOrigin",
    InsecureContext = "AttributionReportingIssue::InsecureContext",
    InvalidRegisterSourceHeader = "AttributionReportingIssue::InvalidRegisterSourceHeader",
    InvalidRegisterTriggerHeader = "AttributionReportingIssue::InvalidRegisterTriggerHeader",
    SourceAndTriggerHeaders = "AttributionReportingIssue::SourceAndTriggerHeaders",
    SourceIgnored = "AttributionReportingIssue::SourceIgnored",
    TriggerIgnored = "AttributionReportingIssue::TriggerIgnored",
    OsSourceIgnored = "AttributionReportingIssue::OsSourceIgnored",
    OsTriggerIgnored = "AttributionReportingIssue::OsTriggerIgnored",
    InvalidRegisterOsSourceHeader = "AttributionReportingIssue::InvalidRegisterOsSourceHeader",
    InvalidRegisterOsTriggerHeader = "AttributionReportingIssue::InvalidRegisterOsTriggerHeader",
    WebAndOsHeaders = "AttributionReportingIssue::WebAndOsHeaders",
    NavigationRegistrationWithoutTransientUserActivation = "AttributionReportingIssue::NavigationRegistrationWithoutTransientUserActivation",
    Unknown = "AttributionReportingIssue::Unknown"
}
export declare class AttributionReportingIssue extends Issue<IssueCode> {
    issueDetails: Readonly<Protocol.Audits.AttributionReportingIssueDetails>;
    constructor(issueDetails: Protocol.Audits.AttributionReportingIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    getHeaderValidatorLink(name: string): {
        link: string;
        linkTitle: string;
    };
    getDescription(): MarkdownIssueDescription | null;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): AttributionReportingIssue[];
}
