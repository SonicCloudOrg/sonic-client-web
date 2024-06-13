import type * as Marked from '../../../third_party/marked/marked.js';
import * as LitHtml from '../../lit-html/lit-html.js';
export interface MarkdownViewData {
    tokens: Marked.Marked.Token[];
    renderer?: MarkdownLitRenderer;
}
export declare class MarkdownView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: MarkdownViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-markdown-view': MarkdownView;
    }
}
/**
 * Default renderer is used for the IssuesPanel and allows only well-known images and links to be embedded.
 */
export declare class MarkdownLitRenderer {
    renderChildTokens(token: Marked.Marked.Token): LitHtml.TemplateResult[];
    /**
     * Unescape will get rid of the escaping done by Marked to avoid double escaping due to escaping it also with Lit-html.
     * Table taken from: front_end/third_party/marked/package/src/helpers.js
     */
    unescape(text: string): string;
    renderText(token: Marked.Marked.Token): LitHtml.TemplateResult;
    renderHeading(heading: Marked.Marked.Tokens.Heading): LitHtml.TemplateResult;
    renderCodeBlock(token: Marked.Marked.Tokens.Code): LitHtml.TemplateResult;
    templateForToken(token: Marked.Marked.Token): LitHtml.TemplateResult | null;
    renderToken(token: Marked.Marked.Token): LitHtml.TemplateResult;
}
