interface BaseLinkSwatchRenderData {
    text: string;
    title: string;
    showTitle: boolean;
    isDefined: boolean;
    onLinkActivate: (linkText: string) => void;
}
declare class BaseLinkSwatch extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    protected onLinkActivate: (linkText: string, event: MouseEvent | KeyboardEvent) => void;
    connectedCallback(): void;
    set data(data: BaseLinkSwatchRenderData);
    get linkElement(): HTMLElement | undefined;
    private render;
}
interface CSSVarSwatchRenderData {
    variableName: string;
    computedValue: string | null;
    fromFallback: boolean;
    fallbackText: string | null;
    onLinkActivate: (linkText: string) => void;
}
export declare class CSSVarSwatch extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    constructor();
    set data(data: CSSVarSwatchRenderData);
    get link(): BaseLinkSwatch | undefined;
    protected render(data: CSSVarSwatchRenderData): void;
}
export interface LinkSwatchRenderData {
    isDefined: boolean;
    text: string;
    onLinkActivate: (linkText: string) => void;
    jslogContext: string;
}
export declare class LinkSwatch extends HTMLElement {
    static readonly litTagName: import("../../../lit-html/static.js").Static;
    protected readonly shadow: ShadowRoot;
    set data(data: LinkSwatchRenderData);
    protected render(data: LinkSwatchRenderData): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-base-link-swatch': BaseLinkSwatch;
        'devtools-link-swatch': LinkSwatch;
        'devtools-css-var-swatch': CSSVarSwatch;
    }
}
export {};
