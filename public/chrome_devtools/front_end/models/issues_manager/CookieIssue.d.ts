import type * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import { Issue, IssueCategory, IssueKind } from './Issue.js';
import { type MarkdownIssueDescription } from './MarkdownIssueDescription.js';
export declare const enum CookieIssueSubCategory {
    GenericCookie = "GenericCookie",
    SameSiteCookie = "SameSiteCookie",
    ThirdPartyPhaseoutCookie = "ThirdPartyPhaseoutCookie"
}
export declare class CookieIssue extends Issue {
    #private;
    constructor(code: string, issueDetails: Protocol.Audits.CookieIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel, issueId: Protocol.Audits.IssueId | undefined);
    primaryKey(): string;
    /**
     * Returns an array of issues from a given CookieIssueDetails.
     */
    static createIssuesFromCookieIssueDetails(cookieIssueDetails: Protocol.Audits.CookieIssueDetails, issuesModel: SDK.IssuesModel.IssuesModel, issueId: Protocol.Audits.IssueId | undefined): CookieIssue[];
    /**
     * Calculates an issue code from a reason, an operation, and an array of warningReasons. All these together
     * can uniquely identify a specific cookie issue.
     * warningReasons is only needed for some CookieExclusionReason in order to determine if an issue should be raised.
     * It is not required if reason is a CookieWarningReason.
     *
     * The issue code will be mapped to a CookieIssueSubCategory enum for metric purpose.
     */
    static codeForCookieIssueDetails(reason: Protocol.Audits.CookieExclusionReason | Protocol.Audits.CookieWarningReason, warningReasons: Protocol.Audits.CookieWarningReason[], operation: Protocol.Audits.CookieOperation, cookieUrl?: Platform.DevToolsPath.UrlString): string | null;
    cookies(): Iterable<Protocol.Audits.AffectedCookie>;
    rawCookieLines(): Iterable<string>;
    requests(): Iterable<Protocol.Audits.AffectedRequest>;
    getCategory(): IssueCategory;
    getDescription(): MarkdownIssueDescription | null;
    isCausedByThirdParty(): boolean;
    getKind(): IssueKind;
    static fromInspectorIssue(issuesModel: SDK.IssuesModel.IssuesModel, inspectorIssue: Protocol.Audits.InspectorIssue): CookieIssue[];
    static getSubCategory(code: string): CookieIssueSubCategory;
    maybeCreateConsoleMessage(): SDK.ConsoleModel.ConsoleMessage | undefined;
}
/**
 * Exported for unit test.
 */
export declare function isCausedByThirdParty(outermostFrame: SDK.ResourceTreeModel.ResourceTreeFrame | null, cookieUrl?: string, siteForCookies?: string): boolean;
