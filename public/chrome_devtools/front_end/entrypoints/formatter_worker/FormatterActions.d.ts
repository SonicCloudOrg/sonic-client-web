export declare const enum FormatterActions {
    FORMAT = "format",
    PARSE_CSS = "parseCSS",
    JAVASCRIPT_SUBSTITUTE = "javaScriptSubstitute",
    JAVASCRIPT_SCOPE_TREE = "javaScriptScopeTree",
    EVALUATE_JAVASCRIPT_SUBSTRING = "evaluatableJavaScriptSubstring"
}
export declare const enum FormattableMediaTypes {
    APPLICATION_JAVASCRIPT = "application/javascript",
    APPLICATION_JSON = "application/json",
    APPLICATION_MANIFEST_JSON = "application/manifest+json",
    TEXT_CSS = "text/css",
    TEXT_HTML = "text/html",
    TEXT_JAVASCRIPT = "text/javascript"
}
export declare const FORMATTABLE_MEDIA_TYPES: string[];
export interface FormatMapping {
    original: number[];
    formatted: number[];
}
export interface FormatResult {
    content: string;
    mapping: FormatMapping;
}
export declare const enum DefinitionKind {
    None = 0,
    Let = 1,
    Var = 2,
    Fixed = 3
}
export interface ScopeTreeNode {
    variables: {
        name: string;
        kind: DefinitionKind;
        offsets: number[];
    }[];
    start: number;
    end: number;
    children: ScopeTreeNode[];
}
