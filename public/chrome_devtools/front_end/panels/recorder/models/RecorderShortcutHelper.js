// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as UI from '../../../ui/legacy/legacy.js';
export class RecorderShortcutHelper {
    #abortController;
    #timeoutId = null;
    #timeout;
    constructor(timeout = 200) {
        this.#timeout = timeout;
        this.#abortController = new AbortController();
    }
    #cleanInternals() {
        this.#abortController.abort();
        if (this.#timeoutId) {
            clearTimeout(this.#timeoutId);
        }
        this.#abortController = new AbortController();
    }
    #handleCallback(callback) {
        this.#cleanInternals();
        void callback();
    }
    handleShortcut(callback) {
        this.#cleanInternals();
        document.addEventListener('keyup', event => {
            if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event)) {
                this.#handleCallback(callback);
            }
        }, { signal: this.#abortController.signal });
        this.#timeoutId = setTimeout(() => this.#handleCallback(callback), this.#timeout);
    }
}
//# sourceMappingURL=RecorderShortcutHelper.js.map