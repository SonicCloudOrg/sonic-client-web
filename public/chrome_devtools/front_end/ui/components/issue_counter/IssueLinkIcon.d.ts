import type * as Protocol from '../../../generated/protocol.js';
import * as IssuesManager from '../../../models/issues_manager/issues_manager.js';
export interface IssueLinkIconData {
    issue?: IssuesManager.Issue.Issue | null;
    issueId?: Protocol.Audits.IssueId;
    issueResolver?: IssuesManager.IssueResolver.IssueResolver;
    additionalOnClickAction?: () => void;
    revealOverride?: (revealable: unknown, omitFocus?: boolean) => Promise<void>;
}
export declare const extractShortPath: (path: string) => string;
export declare class IssueLinkIcon extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    set data(data: IssueLinkIconData);
    connectedCallback(): void;
    get data(): IssueLinkIconData;
    handleClick(event: MouseEvent): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-issue-link-icon': IssueLinkIcon;
    }
}
