import * as Host from '../../../core/host/host.js';
import * as Marked from '../../../third_party/marked/marked.js';
import * as MarkdownView from '../../../ui/components/markdown_view/markdown_view.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import { type PromptBuilder, type Source } from '../PromptBuilder.js';
export declare class CloseEvent extends Event {
    static readonly eventName = "close";
    constructor();
}
type PublicPromptBuilder = Pick<PromptBuilder, 'buildPrompt' | 'getSearchQuery'>;
type PublicAidaClient = Pick<Host.AidaClient.AidaClient, 'fetch'>;
export declare class ConsoleInsight extends HTMLElement {
    #private;
    static create(promptBuilder: PublicPromptBuilder, aidaClient: PublicAidaClient): Promise<ConsoleInsight>;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(promptBuilder: PublicPromptBuilder, aidaClient: PublicAidaClient, syncInfo?: Host.InspectorFrontendHostAPI.SyncInformation);
    connectedCallback(): void;
}
declare class ConsoleInsightSourcesList extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    set sources(values: Source[]);
    set isPageReloadRecommended(isPageReloadRecommended: boolean);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-console-insight': ConsoleInsight;
        'devtools-console-insight-sources-list': ConsoleInsightSourcesList;
    }
}
export declare class MarkdownRenderer extends MarkdownView.MarkdownView.MarkdownLitRenderer {
    renderToken(token: Marked.Marked.Token): LitHtml.TemplateResult;
    templateForToken(token: Marked.Marked.Token): LitHtml.TemplateResult | null;
}
export {};
