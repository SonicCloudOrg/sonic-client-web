import { type Selector } from './Selector.js';
/**
 * Computes the XPath for a node.
 *
 * @param node - The node to compute.
 * @param optimized - Whether to optimize the XPath for the node. Does not imply
 * the XPath is shorter; implies the XPath will be highly-scoped to the node.
 * @returns The computed XPath.
 *
 * @internal
 */
export declare const computeXPath: (node: Node, optimized?: boolean, attributes?: string[]) => Selector | undefined;
