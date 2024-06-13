/**
 * `document.activeElement` will not enter shadow roots to find the element
 * that has focus; use this method if you need to traverse through any shadow
 * roots to find the actual, specific focused element.
 */
export declare function deepActiveElement(doc: Document): Element | null;
export declare function getEnclosingShadowRootForNode(node: Node): Node | null;
export declare function rangeOfWord(rootNode: Node, offset: number, stopCharacters: string, stayWithinNode: Node, direction?: string): Range;
