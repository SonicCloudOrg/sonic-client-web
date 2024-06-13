import '../../../ui/legacy/legacy.js';
export declare class CodeBlock extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set code(value: string);
    get code(): string;
    set codeLang(value: string);
    set timeout(value: number);
    set displayNotice(value: boolean);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-code-block': CodeBlock;
    }
}
