/**
 * A scope in the authored source.
 */
export interface OriginalScope {
    start: Position;
    end: Position;
    kind: ScopeKind;
    name?: string;
    variables: string[];
    children: OriginalScope[];
}
/**
 * A range (can be a scope) in the generated JavaScript.
 */
export interface GeneratedRange {
    start: Position;
    end: Position;
    originalScope?: OriginalScope;
    /**
     * If this `GeneratedRange` is the result of inlining `originalScope`, then `callsite`
     * refers to where `originalScope` was called in the original ("authored") code.
     */
    callsite?: OriginalPosition;
    /**
     * Expressions that compute the values of the variables of this OriginalScope. The length
     * of `values` must match the length of `originalScope.variables`.
     *
     * For each variable this can either be a single expression (valid for the full `GeneratedRange`),
     * or an array of `BindingRange`s, e.g. if computing the value requires different expressions
     * throughout the range or if the variable is only available in parts of the `GeneratedRange`.
     *
     * `undefined` denotes that the value of a variable is unavailble in the whole range.
     * This can happen e.g. if the variable was optimized out and can't be recomputed.
     */
    values: (string | undefined | BindingRange[])[];
    children: GeneratedRange[];
}
export type ScopeKind = 'global' | 'class' | 'function' | 'block';
export interface BindingRange {
    value?: string;
    from: Position;
    to: Position;
}
export interface Position {
    line: number;
    column: number;
}
export interface OriginalPosition extends Position {
    sourceIndex: number;
}
interface OriginalScopeTree {
    readonly root: OriginalScope;
    readonly scopeForItemIndex: Map<number, OriginalScope>;
}
export declare function decodeOriginalScopes(encodedOriginalScopes: string[], names: string[]): OriginalScopeTree[];
export declare function decodeGeneratedRanges(encodedGeneratedRange: string, originalScopeTrees: OriginalScopeTree[], names: string[]): GeneratedRange;
export declare const enum EncodedGeneratedRangeFlag {
    HasDefinition = 1,
    HasCallsite = 2
}
export {};
