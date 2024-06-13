import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { type MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare class CookieDeprecationMetadataIssue extends Issue {
    #private;
    constructor(issueDetails: Protocol.Audits.CookieDeprecationMetadataIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    getCategory(): IssueCategory;
    getDescription(): MarkdownIssueDescription;
    details(): Protocol.Audits.CookieDeprecationMetadataIssueDetails;
    getKind(): IssueKind;
    primaryKey(): string;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): CookieDeprecationMetadataIssue[];
}
