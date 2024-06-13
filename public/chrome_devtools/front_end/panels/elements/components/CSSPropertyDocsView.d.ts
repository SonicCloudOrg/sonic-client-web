interface CSSProperty {
    name: string;
    description?: string;
    references?: Array<{
        name: string;
        url: string;
    }>;
}
export declare class CSSPropertyDocsView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(cssProperty: CSSProperty);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-css-property-docs-view': CSSPropertyDocsView;
    }
}
export {};
