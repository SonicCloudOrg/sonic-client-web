import type * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { type MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare const enum IssueCode {
    UseErrorCrossOriginNoCorsRequest = "SharedDictionaryIssue::UseErrorCrossOriginNoCorsRequest",
    UseErrorDictionaryLoadFailure = "SharedDictionaryIssue::UseErrorDictionaryLoadFailure",
    UseErrorMatchingDictionaryNotUsed = "SharedDictionaryIssue::UseErrorMatchingDictionaryNotUsed",
    UseErrorUnexpectedContentDictionaryHeader = "SharedDictionaryIssue::UseErrorUnexpectedContentDictionaryHeader",
    WriteErrorCossOriginNoCorsRequest = "SharedDictionaryIssue::WriteErrorCossOriginNoCorsRequest",
    WriteErrorDisallowedBySettings = "SharedDictionaryIssue::WriteErrorDisallowedBySettings",
    WriteErrorExpiredResponse = "SharedDictionaryIssue::WriteErrorExpiredResponse",
    WriteErrorFeatureDisabled = "SharedDictionaryIssue::WriteErrorFeatureDisabled",
    WriteErrorInsufficientResources = "SharedDictionaryIssue::WriteErrorInsufficientResources",
    WriteErrorInvalidMatchField = "SharedDictionaryIssue::WriteErrorInvalidMatchField",
    WriteErrorInvalidStructuredHeader = "SharedDictionaryIssue::WriteErrorInvalidStructuredHeader",
    WriteErrorNavigationRequest = "SharedDictionaryIssue::WriteErrorNavigationRequest",
    WriteErrorNoMatchField = "SharedDictionaryIssue::WriteErrorNoMatchField",
    WriteErrorNonListMatchDestField = "SharedDictionaryIssue::WriteErrorNonListMatchDestField",
    WriteErrorNonSecureContext = "SharedDictionaryIssue::WriteErrorNonSecureContext",
    WriteErrorNonStringIdField = "SharedDictionaryIssue::WriteErrorNonStringIdField",
    WriteErrorNonStringInMatchDestList = "SharedDictionaryIssue::WriteErrorNonStringInMatchDestList",
    WriteErrorNonStringMatchField = "SharedDictionaryIssue::WriteErrorNonStringMatchField",
    WriteErrorNonTokenTypeField = "SharedDictionaryIssue::WriteErrorNonTokenTypeField",
    WriteErrorRequestAborted = "SharedDictionaryIssue::WriteErrorRequestAborted",
    WriteErrorShuttingDown = "SharedDictionaryIssue::WriteErrorShuttingDown",
    WriteErrorTooLongIdField = "SharedDictionaryIssue::WriteErrorTooLongIdField",
    WriteErrorUnsupportedType = "SharedDictionaryIssue::WriteErrorUnsupportedType",
    Unknown = "SharedDictionaryIssue::WriteErrorUnknown"
}
export declare class SharedDictionaryIssue extends Issue {
    #private;
    constructor(issueDetails: Protocol.Audits.SharedDictionaryIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel);
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getCategory(): IssueCategory;
    details(): Protocol.Audits.SharedDictionaryIssueDetails;
    getDescription(): MarkdownIssueDescription | null;
    primaryKey(): string;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): SharedDictionaryIssue[];
}
