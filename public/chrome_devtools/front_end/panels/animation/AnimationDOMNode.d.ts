import * as SDK from '../../core/sdk/sdk.js';
/**
 * Provides an extension over `SDK.DOMModel.DOMNode` that gives it additional
 * capabilities for animation debugging, mainly:
 * - getting a node's scroll information (scroll offsets and scroll range).
 * - updating a node's scroll offset.
 * - tracking the node's scroll offsets with event listeners.
 *
 * It works by running functions on the target page, see `SDK.DOMModel.DOMNode`s `callFunction` method
 * for more details on how a function is called on the target page.
 *
 * For listening to events on the target page and getting notified on the devtools frontend
 * side, we're adding a binding to the page `__devtools_report_scroll_position__` in a world `devtools_animation`
 * we've created. Then, we're setting scroll listeners of the `node` in the same world which calls the binding
 * itself with the scroll offsets.
 */
export declare class AnimationDOMNode {
    #private;
    static lastAddedListenerId: number;
    constructor(domNode: SDK.DOMModel.DOMNode);
    addScrollEventListener(onScroll: ({ scrollLeft, scrollTop }: {
        scrollLeft: number;
        scrollTop: number;
    }) => void): Promise<number | null>;
    removeScrollEventListener(id: number): Promise<void>;
    scrollTop(): Promise<number | null>;
    scrollLeft(): Promise<number | null>;
    setScrollTop(offset: number): Promise<void>;
    setScrollLeft(offset: number): Promise<void>;
    verticalScrollRange(): Promise<number | null>;
    horizontalScrollRange(): Promise<number | null>;
}
