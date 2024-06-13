// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceBounds from '../../../services/trace_bounds/trace_bounds.js';
export function flattenBreadcrumbs(initialBreadcrumb) {
    const allBreadcrumbs = [initialBreadcrumb];
    let breadcrumbsIter = initialBreadcrumb;
    while (breadcrumbsIter.child !== null) {
        const iterChild = breadcrumbsIter.child;
        if (iterChild !== null) {
            allBreadcrumbs.push(iterChild);
            breadcrumbsIter = iterChild;
        }
    }
    return allBreadcrumbs;
}
export class Breadcrumbs {
    initialBreadcrumb;
    lastBreadcrumb;
    constructor(initialTraceWindow) {
        this.initialBreadcrumb = {
            window: initialTraceWindow,
            child: null,
        };
        this.lastBreadcrumb = this.initialBreadcrumb;
    }
    add(newBreadcrumbTraceWindow) {
        if (this.isTraceWindowWithinTraceWindow(newBreadcrumbTraceWindow, this.lastBreadcrumb.window)) {
            const newBreadcrumb = {
                window: newBreadcrumbTraceWindow,
                child: null,
            };
            // To add a new Breadcrumb to the Breadcrumbs Linked List, set the child of last breadcrumb
            // to the new breadcrumb and update the last Breadcrumb
            this.lastBreadcrumb.child = newBreadcrumb;
            this.setLastBreadcrumb(newBreadcrumb);
        }
        else {
            throw new Error('Can not add a breadcrumb that is equal to or is outside of the parent breadcrumb TimeWindow');
        }
    }
    // Breadcumb should be within the bounds of the parent and can not have both start and end be equal to the parent
    isTraceWindowWithinTraceWindow(child, parent) {
        return (child.min >= parent.min && child.max <= parent.max) &&
            !(child.min === parent.min && child.max === parent.max);
    }
    // Used to set an initial breadcrumbs from modifications loaded from a file
    setInitialBreadcrumbFromLoadedModifications(initialBreadcrumb) {
        this.initialBreadcrumb = initialBreadcrumb;
        // Make last breadcrumb active
        let lastBreadcrumb = initialBreadcrumb;
        while (lastBreadcrumb.child !== null) {
            lastBreadcrumb = lastBreadcrumb.child;
        }
        this.setLastBreadcrumb(lastBreadcrumb);
    }
    setLastBreadcrumb(lastBreadcrumb) {
        // When we assign a new active breadcrumb, both the minimap bounds and the visible
        // window get set to that breadcrumb's window.
        this.lastBreadcrumb = lastBreadcrumb;
        this.lastBreadcrumb.child = null;
        TraceBounds.TraceBounds.BoundsManager.instance().setMiniMapBounds(lastBreadcrumb.window);
        TraceBounds.TraceBounds.BoundsManager.instance().setTimelineVisibleWindow(lastBreadcrumb.window);
    }
}
//# sourceMappingURL=Breadcrumbs.js.map