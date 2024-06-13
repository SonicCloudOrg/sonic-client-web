import * as SDK from '../../core/sdk/sdk.js';
import { type Issue, type IssueCategory } from './Issue.js';
export type IssuesAssociatable = Readonly<SDK.NetworkRequest.NetworkRequest> | SDK.Cookie.Cookie | string;
/**
 * @throws In case obj has an unsupported type (i.e. not part of the IssuesAssociatble union).
 */
export declare function issuesAssociatedWith(issues: Issue[], obj: IssuesAssociatable): Issue[];
export declare function hasIssues(obj: IssuesAssociatable): boolean;
export declare function hasIssueOfCategory(obj: IssuesAssociatable, category: IssueCategory): boolean;
export declare function hasThirdPartyPhaseoutCookieIssue(obj: IssuesAssociatable): boolean;
export declare function hasThirdPartyPhaseoutCookieIssueForDomain(domain: string): boolean;
export declare function reveal(obj: IssuesAssociatable, category?: IssueCategory): Promise<void | undefined>;
