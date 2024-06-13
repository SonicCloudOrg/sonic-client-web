// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import glassPaneStyles from './glassPane.css.legacy.js';
import { deepElementFromEvent, measuredScrollbarWidth } from './UIUtils.js';
import { Widget } from './Widget.js';
export class GlassPane {
    widgetInternal;
    element;
    contentElement;
    arrowElement;
    onMouseDownBound;
    onClickOutsideCallback;
    maxSize;
    positionX;
    positionY;
    anchorBox;
    anchorBehavior;
    sizeBehavior;
    marginBehavior;
    #ignoreLeftMargin = false;
    constructor(jslog) {
        this.widgetInternal = new Widget(true);
        this.widgetInternal.markAsRoot();
        this.element = this.widgetInternal.element;
        this.contentElement = this.widgetInternal.contentElement;
        if (jslog) {
            this.contentElement.setAttribute('jslog', jslog);
        }
        this.arrowElement = document.createElement('span');
        this.arrowElement.classList.add('arrow', 'hidden');
        if (this.element.shadowRoot) {
            this.element.shadowRoot.appendChild(this.arrowElement);
        }
        this.registerRequiredCSS(glassPaneStyles);
        this.setPointerEventsBehavior("PierceGlassPane" /* PointerEventsBehavior.PierceGlassPane */);
        this.onMouseDownBound = this.onMouseDown.bind(this);
        this.onClickOutsideCallback = null;
        this.maxSize = null;
        this.positionX = null;
        this.positionY = null;
        this.anchorBox = null;
        this.anchorBehavior = "PreferTop" /* AnchorBehavior.PreferTop */;
        this.sizeBehavior = "SetExactSize" /* SizeBehavior.SetExactSize */;
        this.marginBehavior = "DefaultMargin" /* MarginBehavior.DefaultMargin */;
    }
    setJsLog(jslog) {
        this.contentElement.setAttribute('jslog', jslog);
    }
    isShowing() {
        return this.widgetInternal.isShowing();
    }
    registerRequiredCSS(cssFile) {
        this.widgetInternal.registerRequiredCSS(cssFile);
    }
    registerCSSFiles(cssFiles) {
        this.widgetInternal.registerCSSFiles(cssFiles);
    }
    setDefaultFocusedElement(element) {
        this.widgetInternal.setDefaultFocusedElement(element);
    }
    setDimmed(dimmed) {
        this.element.classList.toggle('dimmed-pane', dimmed);
    }
    setPointerEventsBehavior(pointerEventsBehavior) {
        this.element.classList.toggle('no-pointer-events', pointerEventsBehavior !== "BlockedByGlassPane" /* PointerEventsBehavior.BlockedByGlassPane */);
        this.contentElement.classList.toggle('no-pointer-events', pointerEventsBehavior === "PierceContents" /* PointerEventsBehavior.PierceContents */);
    }
    setOutsideClickCallback(callback) {
        this.onClickOutsideCallback = callback;
    }
    setMaxContentSize(size) {
        this.maxSize = size;
        this.positionContent();
    }
    setSizeBehavior(sizeBehavior) {
        this.sizeBehavior = sizeBehavior;
        this.positionContent();
    }
    setContentPosition(x, y) {
        this.positionX = x;
        this.positionY = y;
        this.positionContent();
    }
    setContentAnchorBox(anchorBox) {
        this.anchorBox = anchorBox;
        this.positionContent();
    }
    setAnchorBehavior(behavior) {
        this.anchorBehavior = behavior;
    }
    setMarginBehavior(behavior) {
        this.marginBehavior = behavior;
        this.arrowElement.classList.toggle('hidden', behavior !== "Arrow" /* MarginBehavior.Arrow */);
    }
    setIgnoreLeftMargin(ignore) {
        this.#ignoreLeftMargin = ignore;
    }
    show(document) {
        if (this.isShowing()) {
            return;
        }
        // TODO(crbug.com/1006759): Extract the magic number
        // Deliberately starts with 3000 to hide other z-indexed elements below.
        this.element.style.zIndex = `${3000 + 1000 * panes.size}`;
        this.element.setAttribute('data-devtools-glass-pane', '');
        document.body.addEventListener('mousedown', this.onMouseDownBound, true);
        document.body.addEventListener('pointerdown', this.onMouseDownBound, true);
        this.widgetInternal.show(document.body);
        panes.add(this);
        this.positionContent();
    }
    hide() {
        if (!this.isShowing()) {
            return;
        }
        panes.delete(this);
        this.element.ownerDocument.body.removeEventListener('mousedown', this.onMouseDownBound, true);
        this.element.ownerDocument.body.removeEventListener('pointerdown', this.onMouseDownBound, true);
        this.widgetInternal.detach();
    }
    onMouseDown(event) {
        if (!this.onClickOutsideCallback) {
            return;
        }
        const node = deepElementFromEvent(event);
        if (!node || this.contentElement.isSelfOrAncestor(node)) {
            return;
        }
        this.onClickOutsideCallback.call(null, event);
    }
    positionContent() {
        if (!this.isShowing()) {
            return;
        }
        const showArrow = this.marginBehavior === "Arrow" /* MarginBehavior.Arrow */;
        const gutterSize = showArrow ? 8 : (this.marginBehavior === "NoMargin" /* MarginBehavior.NoMargin */ ? 0 : 3);
        const scrollbarSize = measuredScrollbarWidth(this.element.ownerDocument);
        const arrowSize = 10;
        const container = (containers.get(this.element.ownerDocument));
        if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
            this.contentElement.positionAt(0, 0);
            this.contentElement.style.width = '';
            this.contentElement.style.maxWidth = '';
            this.contentElement.style.height = '';
            this.contentElement.style.maxHeight = '';
        }
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        let width = containerWidth - gutterSize * 2;
        let height = containerHeight - gutterSize * 2;
        let positionX = gutterSize;
        let positionY = gutterSize;
        if (this.maxSize) {
            width = Math.min(width, this.maxSize.width);
            height = Math.min(height, this.maxSize.height);
        }
        if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
            const measuredRect = this.contentElement.getBoundingClientRect();
            const widthOverflow = height < measuredRect.height ? scrollbarSize : 0;
            const heightOverflow = width < measuredRect.width ? scrollbarSize : 0;
            width = Math.min(width, measuredRect.width + widthOverflow);
            height = Math.min(height, measuredRect.height + heightOverflow);
        }
        if (this.anchorBox) {
            const anchorBox = this.anchorBox.relativeToElement(container);
            let behavior = this.anchorBehavior;
            this.arrowElement.classList.remove('arrow-none', 'arrow-top', 'arrow-bottom', 'arrow-left', 'arrow-right');
            if (behavior === "PreferTop" /* AnchorBehavior.PreferTop */ || behavior === "PreferBottom" /* AnchorBehavior.PreferBottom */) {
                const top = anchorBox.y - 2 * gutterSize;
                const bottom = containerHeight - anchorBox.y - anchorBox.height - 2 * gutterSize;
                if (behavior === "PreferTop" /* AnchorBehavior.PreferTop */ && top < height && bottom > top) {
                    behavior = "PreferBottom" /* AnchorBehavior.PreferBottom */;
                }
                if (behavior === "PreferBottom" /* AnchorBehavior.PreferBottom */ && bottom < height && top > bottom) {
                    behavior = "PreferTop" /* AnchorBehavior.PreferTop */;
                }
                let arrowY;
                let enoughHeight = true;
                if (behavior === "PreferTop" /* AnchorBehavior.PreferTop */) {
                    positionY = Math.max(gutterSize, anchorBox.y - height - gutterSize);
                    const spaceTop = anchorBox.y - positionY - gutterSize;
                    if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
                        if (height > spaceTop) {
                            this.arrowElement.classList.add('arrow-none');
                            enoughHeight = false;
                        }
                    }
                    else {
                        height = Math.min(height, spaceTop);
                    }
                    this.arrowElement.classList.add('arrow-bottom');
                    arrowY = anchorBox.y - gutterSize;
                }
                else {
                    positionY = anchorBox.y + anchorBox.height + gutterSize;
                    const spaceBottom = containerHeight - positionY - gutterSize;
                    if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
                        if (height > spaceBottom) {
                            this.arrowElement.classList.add('arrow-none');
                            positionY = containerHeight - gutterSize - height;
                            enoughHeight = false;
                        }
                    }
                    else {
                        height = Math.min(height, spaceBottom);
                    }
                    this.arrowElement.classList.add('arrow-top');
                    arrowY = anchorBox.y + anchorBox.height + gutterSize;
                }
                const naturalPositionX = Math.min(anchorBox.x, containerWidth - width - gutterSize);
                positionX = Math.max(gutterSize, naturalPositionX);
                if (this.#ignoreLeftMargin && gutterSize > naturalPositionX) {
                    positionX = 0;
                }
                if (!enoughHeight) {
                    positionX = Math.min(positionX + arrowSize, containerWidth - width - gutterSize);
                }
                else if (showArrow && positionX - arrowSize >= gutterSize) {
                    positionX -= arrowSize;
                }
                width = Math.min(width, containerWidth - positionX - gutterSize);
                if (2 * arrowSize >= width) {
                    this.arrowElement.classList.add('arrow-none');
                }
                else {
                    let arrowX = anchorBox.x + Math.min(50, Math.floor(anchorBox.width / 2));
                    arrowX = Platform.NumberUtilities.clamp(arrowX, positionX + arrowSize, positionX + width - arrowSize);
                    this.arrowElement.positionAt(arrowX, arrowY, container);
                }
            }
            else {
                const left = anchorBox.x - 2 * gutterSize;
                const right = containerWidth - anchorBox.x - anchorBox.width - 2 * gutterSize;
                if (behavior === "PreferLeft" /* AnchorBehavior.PreferLeft */ && left < width && right > left) {
                    behavior = "PreferRight" /* AnchorBehavior.PreferRight */;
                }
                if (behavior === "PreferRight" /* AnchorBehavior.PreferRight */ && right < width && left > right) {
                    behavior = "PreferLeft" /* AnchorBehavior.PreferLeft */;
                }
                let arrowX;
                let enoughWidth = true;
                if (behavior === "PreferLeft" /* AnchorBehavior.PreferLeft */) {
                    positionX = Math.max(gutterSize, anchorBox.x - width - gutterSize);
                    const spaceLeft = anchorBox.x - positionX - gutterSize;
                    if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
                        if (width > spaceLeft) {
                            this.arrowElement.classList.add('arrow-none');
                            enoughWidth = false;
                        }
                    }
                    else {
                        width = Math.min(width, spaceLeft);
                    }
                    this.arrowElement.classList.add('arrow-right');
                    arrowX = anchorBox.x - gutterSize;
                }
                else {
                    positionX = anchorBox.x + anchorBox.width + gutterSize;
                    const spaceRight = containerWidth - positionX - gutterSize;
                    if (this.sizeBehavior === "MeasureContent" /* SizeBehavior.MeasureContent */) {
                        if (width > spaceRight) {
                            this.arrowElement.classList.add('arrow-none');
                            positionX = containerWidth - gutterSize - width;
                            enoughWidth = false;
                        }
                    }
                    else {
                        width = Math.min(width, spaceRight);
                    }
                    this.arrowElement.classList.add('arrow-left');
                    arrowX = anchorBox.x + anchorBox.width + gutterSize;
                }
                positionY = Math.max(gutterSize, Math.min(anchorBox.y, containerHeight - height - gutterSize));
                if (!enoughWidth) {
                    positionY = Math.min(positionY + arrowSize, containerHeight - height - gutterSize);
                }
                else if (showArrow && positionY - arrowSize >= gutterSize) {
                    positionY -= arrowSize;
                }
                height = Math.min(height, containerHeight - positionY - gutterSize);
                if (2 * arrowSize >= height) {
                    this.arrowElement.classList.add('arrow-none');
                }
                else {
                    let arrowY = anchorBox.y + Math.min(50, Math.floor(anchorBox.height / 2));
                    arrowY = Platform.NumberUtilities.clamp(arrowY, positionY + arrowSize, positionY + height - arrowSize);
                    this.arrowElement.positionAt(arrowX, arrowY, container);
                }
            }
        }
        else {
            positionX = this.positionX !== null ? this.positionX : (containerWidth - width) / 2;
            positionY = this.positionY !== null ? this.positionY : (containerHeight - height) / 2;
            width = Math.min(width, containerWidth - positionX - gutterSize);
            height = Math.min(height, containerHeight - positionY - gutterSize);
            this.arrowElement.classList.add('arrow-none');
        }
        this.contentElement.style.width = width + 'px';
        if (this.sizeBehavior === "SetExactWidthMaxHeight" /* SizeBehavior.SetExactWidthMaxHeight */) {
            this.contentElement.style.maxHeight = height + 'px';
        }
        else {
            this.contentElement.style.height = height + 'px';
        }
        this.contentElement.positionAt(positionX, positionY, container);
        this.widgetInternal.doResize();
    }
    widget() {
        return this.widgetInternal;
    }
    static setContainer(element) {
        containers.set(element.ownerDocument, element);
        GlassPane.containerMoved(element);
    }
    static container(document) {
        return containers.get(document);
    }
    static containerMoved(element) {
        for (const pane of panes) {
            if (pane.isShowing() && pane.element.ownerDocument === element.ownerDocument) {
                pane.positionContent();
            }
        }
    }
}
const containers = new Map();
const panes = new Set();
// Exported for layout tests.
export const GlassPanePanes = panes;
//# sourceMappingURL=GlassPane.js.map