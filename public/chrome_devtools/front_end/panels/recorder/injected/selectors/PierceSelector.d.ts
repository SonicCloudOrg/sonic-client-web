import { type Selector } from './Selector.js';
/**
 * Computes the pierce CSS selector for a node.
 *
 * @param node - The node to compute.
 * @returns The computed pierce CSS selector.
 *
 * @internal
 */
export declare const computePierceSelector: (node: Node, attributes?: string[]) => string[] | undefined;
export declare const queryPierceSelectorAll: (selectors: Selector) => Element[];
