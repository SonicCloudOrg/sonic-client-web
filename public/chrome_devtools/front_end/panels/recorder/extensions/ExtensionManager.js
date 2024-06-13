// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Extensions from '../../../models/extensions/extensions.js';
let instance = null;
export class ExtensionManager extends Common.ObjectWrapper.ObjectWrapper {
    static instance() {
        if (!instance) {
            instance = new ExtensionManager();
        }
        return instance;
    }
    #views = new Map();
    constructor() {
        super();
        this.attach();
    }
    attach() {
        const pluginManager = Extensions.RecorderPluginManager.RecorderPluginManager.instance();
        pluginManager.addEventListener("pluginAdded" /* Extensions.RecorderPluginManager.Events.PluginAdded */, this.#handlePlugin);
        pluginManager.addEventListener("pluginRemoved" /* Extensions.RecorderPluginManager.Events.PluginRemoved */, this.#handlePlugin);
        pluginManager.addEventListener("viewRegistered" /* Extensions.RecorderPluginManager.Events.ViewRegistered */, this.#handleView);
        for (const descriptor of pluginManager.views()) {
            this.#handleView({ data: descriptor });
        }
    }
    detach() {
        const pluginManager = Extensions.RecorderPluginManager.RecorderPluginManager.instance();
        pluginManager.removeEventListener("pluginAdded" /* Extensions.RecorderPluginManager.Events.PluginAdded */, this.#handlePlugin);
        pluginManager.removeEventListener("pluginRemoved" /* Extensions.RecorderPluginManager.Events.PluginRemoved */, this.#handlePlugin);
        pluginManager.removeEventListener("viewRegistered" /* Extensions.RecorderPluginManager.Events.ViewRegistered */, this.#handleView);
        this.#views.clear();
    }
    extensions() {
        return Extensions.RecorderPluginManager.RecorderPluginManager.instance().plugins();
    }
    getView(descriptorId) {
        const view = this.#views.get(descriptorId);
        if (!view) {
            throw new Error('View not found');
        }
        return view;
    }
    #handlePlugin = () => {
        this.dispatchEventToListeners("extensionsUpdated" /* Events.ExtensionsUpdated */, this.extensions());
    };
    #handleView = (event) => {
        const descriptor = event.data;
        if (!this.#views.has(descriptor.id)) {
            this.#views.set(descriptor.id, new ExtensionIframe(descriptor));
        }
    };
}
class ExtensionIframe {
    #descriptor;
    #iframe;
    #isShowing = false;
    #isLoaded = false;
    constructor(descriptor) {
        this.#descriptor = descriptor;
        this.#iframe = document.createElement('iframe');
        this.#iframe.src = descriptor.pagePath;
        this.#iframe.onload = this.#onIframeLoad;
    }
    #onIframeLoad = () => {
        this.#isLoaded = true;
        if (this.#isShowing) {
            this.#descriptor.onShown();
        }
    };
    show() {
        if (this.#isShowing) {
            return;
        }
        this.#isShowing = true;
        if (this.#isLoaded) {
            this.#descriptor.onShown();
        }
    }
    hide() {
        if (!this.#isShowing) {
            return;
        }
        this.#isShowing = false;
        this.#isLoaded = false;
        this.#descriptor.onHidden();
    }
    frame() {
        return this.#iframe;
    }
}
//# sourceMappingURL=ExtensionManager.js.map