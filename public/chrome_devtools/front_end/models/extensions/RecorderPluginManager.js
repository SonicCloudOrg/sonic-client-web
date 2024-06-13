// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
let instance = null;
export class RecorderPluginManager extends Common.ObjectWrapper.ObjectWrapper {
    #plugins = new Set();
    #views = new Map();
    static instance() {
        if (!instance) {
            instance = new RecorderPluginManager();
        }
        return instance;
    }
    addPlugin(plugin) {
        this.#plugins.add(plugin);
        this.dispatchEventToListeners("pluginAdded" /* Events.PluginAdded */, plugin);
    }
    removePlugin(plugin) {
        this.#plugins.delete(plugin);
        this.dispatchEventToListeners("pluginRemoved" /* Events.PluginRemoved */, plugin);
    }
    plugins() {
        return Array.from(this.#plugins.values());
    }
    registerView(descriptor) {
        this.#views.set(descriptor.id, descriptor);
        this.dispatchEventToListeners("viewRegistered" /* Events.ViewRegistered */, descriptor);
    }
    views() {
        return Array.from(this.#views.values());
    }
    getViewDescriptor(id) {
        return this.#views.get(id);
    }
    showView(id) {
        const descriptor = this.#views.get(id);
        if (!descriptor) {
            throw new Error(`View with id ${id} is not found.`);
        }
        this.dispatchEventToListeners("showViewRequested" /* Events.ShowViewRequested */, descriptor);
    }
}
//# sourceMappingURL=RecorderPluginManager.js.map