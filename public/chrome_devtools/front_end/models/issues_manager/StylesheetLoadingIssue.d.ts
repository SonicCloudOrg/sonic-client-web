import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { type MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare const lateImportStylesheetLoadingCode: string;
export declare class StylesheetLoadingIssue extends Issue {
    #private;
    constructor(issueDetails: Protocol.Audits.StylesheetLoadingIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    sources(): Array<Protocol.Audits.SourceCodeLocation>;
    requests(): Array<Protocol.Audits.AffectedRequest>;
    details(): Protocol.Audits.StylesheetLoadingIssueDetails;
    primaryKey(): string;
    getDescription(): MarkdownIssueDescription;
    getCategory(): IssueCategory;
    getKind(): IssueKind;
    static fromInspectorIssue(issueModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): StylesheetLoadingIssue[];
}
