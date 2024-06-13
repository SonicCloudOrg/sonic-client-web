import type * as TextUtils from '../../../models/text_utils/text_utils.js';
export declare class RangeWalker {
    #private;
    readonly root: Node;
    constructor(root: Node);
    nextRange(start: number, length: number): Range | null;
}
export declare const HIGHLIGHT_REGISTRY = "search-highlight";
export declare class HighlightManager {
    #private;
    constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): HighlightManager;
    addHighlights(ranges: Range[]): void;
    removeHighlights(ranges: Range[]): void;
    addHighlight(range: Range): void;
    removeHighlight(range: Range): void;
    highlightOrderedTextRanges(root: Node, sourceRanges: TextUtils.TextRange.SourceRange[]): Range[];
}
