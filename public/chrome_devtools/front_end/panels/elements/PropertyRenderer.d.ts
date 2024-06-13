import * as SDK from '../../core/sdk/sdk.js';
import type * as CodeMirror from '../../third_party/codemirror.next/codemirror.next.js';
import { type StringMatch, StringMatcher, type URLMatch, URLMatcher } from './PropertyMatchers.js';
export interface MatchRenderer<MatchT extends SDK.CSSPropertyParser.Match> {
    matcher(): SDK.CSSPropertyParser.Matcher<MatchT>;
    render(match: MatchT, context: RenderingContext): Node[];
}
export declare class RenderingContext {
    readonly ast: SDK.CSSPropertyParser.SyntaxTree;
    readonly renderers: Map<SDK.CSSPropertyParser.Constructor<SDK.CSSPropertyParser.Match>, MatchRenderer<SDK.CSSPropertyParser.Match>>;
    readonly matchedResult: SDK.CSSPropertyParser.BottomUpTreeMatching;
    readonly cssControls?: SDK.CSSPropertyParser.CSSControlMap | undefined;
    readonly options: {
        readonly: boolean;
    };
    constructor(ast: SDK.CSSPropertyParser.SyntaxTree, renderers: Map<SDK.CSSPropertyParser.Constructor<SDK.CSSPropertyParser.Match>, MatchRenderer<SDK.CSSPropertyParser.Match>>, matchedResult: SDK.CSSPropertyParser.BottomUpTreeMatching, cssControls?: SDK.CSSPropertyParser.CSSControlMap | undefined, options?: {
        readonly: boolean;
    });
    addControl(cssType: string, control: HTMLElement): void;
}
export declare class Renderer extends SDK.CSSPropertyParser.TreeWalker {
    #private;
    constructor(ast: SDK.CSSPropertyParser.SyntaxTree, renderers: Map<SDK.CSSPropertyParser.Constructor<SDK.CSSPropertyParser.Match>, MatchRenderer<SDK.CSSPropertyParser.Match>>, matchedResult: SDK.CSSPropertyParser.BottomUpTreeMatching, cssControls: SDK.CSSPropertyParser.CSSControlMap, options: {
        readonly: boolean;
    });
    static render(nodeOrNodes: CodeMirror.SyntaxNode | CodeMirror.SyntaxNode[], context: RenderingContext): {
        nodes: Node[];
        cssControls: SDK.CSSPropertyParser.CSSControlMap;
    };
    static renderInto(nodeOrNodes: CodeMirror.SyntaxNode | CodeMirror.SyntaxNode[], context: RenderingContext, parent: Node): {
        nodes: Node[];
        cssControls: SDK.CSSPropertyParser.CSSControlMap;
    };
    renderedMatchForTest(_nodes: Node[], _match: SDK.CSSPropertyParser.Match): void;
    protected enter({ node }: SDK.CSSPropertyParser.SyntaxNodeRef): boolean;
    static renderNameElement(name: string): HTMLElement;
    static renderValueElement(propertyName: string, propertyValue: string, renderers: MatchRenderer<SDK.CSSPropertyParser.Match>[]): HTMLElement;
}
export declare class URLRenderer implements MatchRenderer<URLMatch> {
    private readonly rule;
    private readonly node;
    constructor(rule: SDK.CSSRule.CSSRule | null, node: SDK.DOMModel.DOMNode | null);
    render(match: URLMatch): Node[];
    matcher(): URLMatcher;
}
export declare class StringRenderer implements MatchRenderer<StringMatch> {
    render(match: StringMatch): Node[];
    matcher(): StringMatcher;
}
