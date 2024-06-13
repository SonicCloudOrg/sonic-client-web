// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import { ViewManager } from './ViewManager.js';
import { VBox } from './Widget.js';
export class SimpleView extends VBox {
    #title;
    #viewId;
    constructor(title, isWebComponent, viewId) {
        super(isWebComponent);
        this.#title = title;
        if (viewId) {
            if (!Platform.StringUtilities.isExtendedKebabCase(viewId)) {
                throw new Error(`Invalid view ID '${viewId}'`);
            }
        }
        this.#viewId = viewId ?? Platform.StringUtilities.toKebabCase(title);
    }
    viewId() {
        return this.#viewId;
    }
    title() {
        return this.#title;
    }
    isCloseable() {
        return false;
    }
    isTransient() {
        return false;
    }
    toolbarItems() {
        return Promise.resolve([]);
    }
    widget() {
        return Promise.resolve(this);
    }
    revealView() {
        return ViewManager.instance().revealView(this);
    }
    disposeView() {
    }
    isPreviewFeature() {
        return false;
    }
    iconName() {
        return undefined;
    }
}
//# sourceMappingURL=View.js.map