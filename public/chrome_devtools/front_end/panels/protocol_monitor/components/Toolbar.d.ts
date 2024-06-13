import * as LitHtml from '../../../ui/lit-html/lit-html.js';
declare const LitElement: typeof LitHtml.LitElement;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-pm-toolbar': Toolbar;
    }
}
export declare class CopyCommandEvent extends Event {
    static readonly eventName = "copycommand";
    constructor();
}
export declare class SendCommandEvent extends Event {
    static readonly eventName = "commandsent";
    constructor();
}
export declare class Toolbar extends LitElement {
    #private;
    static styles: CSSStyleSheet[];
    render(): LitHtml.TemplateResult;
}
export {};
