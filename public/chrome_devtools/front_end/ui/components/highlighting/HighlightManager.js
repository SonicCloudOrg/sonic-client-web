// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import highlightingStyles from './highlighting.css.js';
export class RangeWalker {
    root;
    #offset = 0;
    #treeWalker;
    #eof;
    constructor(root) {
        this.root = root;
        this.#treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        this.#eof = !this.#treeWalker.firstChild();
    }
    #next() {
        this.#offset += this.#treeWalker.currentNode.textContent?.length ?? 0;
        this.#eof = !this.#treeWalker.nextNode();
        return !this.#eof;
    }
    #goToPosition(offset) {
        if (offset < this.#offset || this.#eof) {
            return null;
        }
        // `>` here implies that, except for the first range, start offsets are left-leaning, i.e., when the offset falls
        // between two text nodes, the preceding one is returned. This doesn't matter for Range semantics, but isn't
        // intuitive wrt. the usual understanding of intervals. Making start offsets right-leaning but end offsets
        // left-leaning would incur an unwarranted amount of complexity.
        while (offset > this.#offset + (this.#treeWalker.currentNode.textContent?.length ?? 0)) {
            if (!this.#next()) {
                return null;
            }
        }
        return this.#treeWalker.currentNode;
    }
    nextRange(start, length) {
        if (length <= 0 || this.#eof) {
            return null;
        }
        const startNode = this.#goToPosition(start);
        if (!startNode) {
            return null;
        }
        const offsetInStartNode = start - this.#offset;
        const endNode = this.#goToPosition(start + length);
        if (!endNode) {
            return null;
        }
        const offsetInEndNode = start + length - this.#offset;
        const range = new Range();
        range.setStart(startNode, offsetInStartNode);
        range.setEnd(endNode, offsetInEndNode);
        return range;
    }
}
export const HIGHLIGHT_REGISTRY = 'search-highlight';
let highlightManagerInstance;
export class HighlightManager {
    #highlights = new Highlight();
    constructor() {
        document.adoptedStyleSheets.push(highlightingStyles);
        CSS.highlights.set(HIGHLIGHT_REGISTRY, this.#highlights);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!highlightManagerInstance || forceNew) {
            highlightManagerInstance = new HighlightManager();
        }
        return highlightManagerInstance;
    }
    addHighlights(ranges) {
        ranges.forEach(this.addHighlight.bind(this));
    }
    removeHighlights(ranges) {
        ranges.forEach(this.removeHighlight.bind(this));
    }
    addHighlight(range) {
        this.#highlights.add(range);
    }
    removeHighlight(range) {
        this.#highlights.delete(range);
    }
    highlightOrderedTextRanges(root, sourceRanges) {
        const rangeWalker = new RangeWalker(root);
        const ranges = sourceRanges.map(range => rangeWalker.nextRange(range.offset, range.length))
            .filter((r) => r !== null && !r.collapsed);
        this.addHighlights(ranges);
        return ranges;
    }
}
//# sourceMappingURL=HighlightManager.js.map