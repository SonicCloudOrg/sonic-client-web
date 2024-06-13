import * as CodeMirror from '../../third_party/codemirror.next/codemirror.next.js';
/**
 * Extracts information about font variation settings assuming
 * value is valid according to the spec: https://drafts.csswg.org/css-fonts-4/#font-variation-settings-def
 */
export declare function parseFontVariationSettings(value: string): {
    tag: string;
    value: number;
}[];
/**
 * Extracts font families assuming the value is valid according to
 * the spec: https://drafts.csswg.org/css-fonts-4/#font-family-prop
 */
export declare function parseFontFamily(value: string): string[];
/**
 * Splits a list of values by comma and trims parts
 */
export declare function splitByComma(value: string): string[];
export declare function stripComments(value: string): string;
export declare class SyntaxTree {
    readonly propertyValue: string;
    readonly rule: string;
    readonly tree: CodeMirror.SyntaxNode;
    readonly trailingNodes: CodeMirror.SyntaxNode[];
    readonly propertyName: string | undefined;
    constructor(propertyValue: string, rule: string, tree: CodeMirror.SyntaxNode, propertyName?: string, trailingNodes?: CodeMirror.SyntaxNode[]);
    text(node?: CodeMirror.SyntaxNode | null): string;
    textRange(from: CodeMirror.SyntaxNode, to: CodeMirror.SyntaxNode): string;
    subtree(node: CodeMirror.SyntaxNode): SyntaxTree;
}
export interface SyntaxNodeRef {
    node: CodeMirror.SyntaxNode;
}
export declare abstract class TreeWalker {
    readonly ast: SyntaxTree;
    constructor(ast: SyntaxTree);
    static walkExcludingSuccessors<T extends TreeWalker, ArgTs extends unknown[]>(this: {
        new (ast: SyntaxTree, ...args: ArgTs): T;
    }, propertyValue: SyntaxTree, ...args: ArgTs): T;
    static walk<T extends TreeWalker, ArgTs extends unknown[]>(this: {
        new (ast: SyntaxTree, ...args: ArgTs): T;
    }, propertyValue: SyntaxTree, ...args: ArgTs): T;
    iterateDeclaration(tree: CodeMirror.SyntaxNode): void;
    protected iterate(tree: CodeMirror.SyntaxNode): void;
    protected iterateExcludingSuccessors(tree: CodeMirror.SyntaxNode): void;
    protected enter(_node: SyntaxNodeRef): boolean;
    protected leave(_node: SyntaxNodeRef): void;
}
export interface Match {
    readonly text: string;
    readonly node: CodeMirror.SyntaxNode;
    computedText?(): string | null;
}
export type Constructor<T = any> = (abstract new (...args: any[]) => T) | (new (...args: any[]) => T);
export interface Matcher<MatchT extends Match> {
    readonly matchType: Constructor<MatchT>;
    accepts(propertyName: string): boolean;
    matches(node: CodeMirror.SyntaxNode, matching: BottomUpTreeMatching): Match | null;
}
export declare function matcherBase<MatchT extends Match>(matchT: Constructor<MatchT>): {
    new (): {
        matchType: Constructor<MatchT>;
        accepts(_propertyName: string): boolean;
        matches(_node: CodeMirror.SyntaxNode, _matching: BottomUpTreeMatching): Match | null;
    };
};
export declare class BottomUpTreeMatching extends TreeWalker {
    #private;
    readonly computedText: ComputedText;
    constructor(ast: SyntaxTree, matchers: Matcher<Match>[]);
    protected leave({ node }: SyntaxNodeRef): void;
    matchText(node: CodeMirror.SyntaxNode): void;
    getMatch(node: CodeMirror.SyntaxNode): Match | undefined;
    hasUnresolvedVars(node: CodeMirror.SyntaxNode): boolean;
    hasUnresolvedVarsRange(from: CodeMirror.SyntaxNode, to: CodeMirror.SyntaxNode): boolean;
    getComputedText(node: CodeMirror.SyntaxNode, substitutions?: Map<Match, string>): string;
    getComputedTextRange(from: CodeMirror.SyntaxNode, to: CodeMirror.SyntaxNode, substitutions?: Map<Match, string>): string;
}
export declare class ComputedText {
    #private;
    readonly text: string;
    constructor(text: string);
    clear(): void;
    get chunkCount(): number;
    push(match: Match, offset: number): void;
    hasUnresolvedVars(begin: number, end: number): boolean;
    get(begin: number, end: number, substitutions?: Map<Match, string>): string;
}
export declare function requiresSpace(a: string, b: string): boolean;
export declare function requiresSpace(a: Node[], b: Node[]): boolean;
export declare const CSSControlMap: {
    new (entries?: readonly (readonly [string, HTMLElement[]])[] | null | undefined): Map<string, HTMLElement[]>;
    new (iterable?: Iterable<readonly [string, HTMLElement[]]> | null | undefined): Map<string, HTMLElement[]>;
    readonly prototype: Map<any, any>;
    groupBy<K, T>(items: Iterable<T>, keySelector: (item: T, index: number) => K): Map<K, T[]>;
    readonly [Symbol.species]: MapConstructor;
};
export type CSSControlMap = Map<string, HTMLElement[]>;
export declare namespace ASTUtils {
    function siblings(node: CodeMirror.SyntaxNode | null): CodeMirror.SyntaxNode[];
    function children(node: CodeMirror.SyntaxNode | null): CodeMirror.SyntaxNode[];
    function declValue(node: CodeMirror.SyntaxNode): CodeMirror.SyntaxNode | null;
    function stripComments(nodes: CodeMirror.SyntaxNode[]): Generator<CodeMirror.SyntaxNode>;
    function split(nodes: CodeMirror.SyntaxNode[]): CodeMirror.SyntaxNode[][];
    function callArgs(node: CodeMirror.SyntaxNode): CodeMirror.SyntaxNode[][];
}
export declare class VariableMatch implements Match {
    readonly text: string;
    readonly node: CodeMirror.SyntaxNode;
    readonly name: string;
    readonly fallback: CodeMirror.SyntaxNode[];
    readonly matching: BottomUpTreeMatching;
    readonly computedTextCallback: (match: VariableMatch, matching: BottomUpTreeMatching) => string | null;
    constructor(text: string, node: CodeMirror.SyntaxNode, name: string, fallback: CodeMirror.SyntaxNode[], matching: BottomUpTreeMatching, computedTextCallback: (match: VariableMatch, matching: BottomUpTreeMatching) => string | null);
    computedText(): string | null;
}
declare const VariableMatcher_base: {
    new (): {
        matchType: Constructor<VariableMatch>;
        accepts(_propertyName: string): boolean;
        matches(_node: CodeMirror.SyntaxNode, _matching: BottomUpTreeMatching): Match | null;
    };
};
export declare class VariableMatcher extends VariableMatcher_base {
    #private;
    constructor(computedTextCallback: (match: VariableMatch, matching: BottomUpTreeMatching) => string | null);
    matches(node: CodeMirror.SyntaxNode, matching: BottomUpTreeMatching): Match | null;
}
export declare class TextMatch implements Match {
    readonly text: string;
    readonly node: CodeMirror.SyntaxNode;
    computedText?: () => string;
    constructor(text: string, node: CodeMirror.SyntaxNode);
    render(): Node[];
}
export declare function tokenizeDeclaration(propertyName: string, propertyValue: string): SyntaxTree | null;
export declare function tokenizePropertyName(name: string): string | null;
export {};
