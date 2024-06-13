import { type Selector } from './Selector.js';
export interface AccessibilityBindings {
    getAccessibleName(node: Node): string;
    getAccessibleRole(node: Node): string;
}
/**
 * Computes the ARIA selector for a node.
 *
 * @param node - The node to compute.
 * @returns The computed CSS selector.
 *
 * @internal
 */
export declare const computeARIASelector: (node: Node, bindings: AccessibilityBindings) => Selector | undefined;
