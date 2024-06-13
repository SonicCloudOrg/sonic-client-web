import { SelectorPart, type Selector } from './Selector.js';
export interface QueryableNode extends Node {
    querySelectorAll(selectors: string): NodeListOf<Element>;
}
export declare const getSelectorPart: (node: Node, attributes?: string[]) => SelectorPart | undefined;
/**
 * This interface represents operations on an ordered range of indices of type
 * `I`. Implementations must have the following assumptions:
 *
 *  1. `self(self(i)) = self(i)`, i.e. `self` must be idempotent.
 *  2. `inc(i) > i`.
 *  3. `j >= i` implies `gte(valueOf(j), i)`, i.e. `gte` preserves the order of
 *     the range.
 *
 */
export interface RangeOps<I, V> {
    self?(index: I): I;
    inc(index: I): I;
    valueOf(index: I): V;
    gte(value: V, index: I): boolean;
}
/**
 * The goal of this function is to find the smallest index `i` that makes
 * `gte(valueOf(i), j)` true for all `j` in `[min, max)`. We do not use binary
 * search because
 *
 *  1. We expect the min-max to be concentrated towards the minimum (< 10
 *     iterations).
 *  2. We expect `valueOf` to be `O(n)`, so together with (1), the average will
 *     be around `O(n)` which is significantly faster than binary search in this
 *     case.
 */
export declare const findMinMax: <I, V>([min, max]: [I, I], fns: RangeOps<I, V>) => V;
export declare class SelectorRangeOps implements RangeOps<QueryableNode, string> {
    #private;
    constructor(attributes?: string[]);
    inc(node: Node): QueryableNode;
    valueOf(node: Node): string;
    gte(selector: string, node: QueryableNode): boolean;
}
/**
 * Computes the CSS selector for a node.
 *
 * @param node - The node to compute.
 * @returns The computed CSS selector.
 *
 * @internal
 */
export declare const computeCSSSelector: (node: Node, attributes?: string[]) => Selector | undefined;
export declare const queryCSSSelectorAll: (selectors: Selector) => Element[];
