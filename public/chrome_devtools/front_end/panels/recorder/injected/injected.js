// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as RecordingClient from './RecordingClient.js';
import * as SelectorPicker from './SelectorPicker.js';
class DevToolsRecorder {
    #recordingClient;
    startRecording(bindings, options) {
        if (this.#recordingClient) {
            throw new Error('Recording client already started.');
        }
        if (this.#selectorPicker) {
            throw new Error('Selector picker is active.');
        }
        this.#recordingClient = new RecordingClient.RecordingClient(bindings, options);
        this.#recordingClient.start();
    }
    stopRecording() {
        if (!this.#recordingClient) {
            throw new Error('Recording client was not started.');
        }
        this.#recordingClient.stop();
        this.#recordingClient = undefined;
    }
    get recordingClientForTesting() {
        if (!this.#recordingClient) {
            throw new Error('Recording client was not started.');
        }
        return this.#recordingClient;
    }
    #selectorPicker;
    startSelectorPicker(bindings, customAttribute, debug) {
        if (this.#selectorPicker) {
            throw new Error('Selector picker already started.');
        }
        if (this.#recordingClient) {
            this.#recordingClient.stop();
        }
        this.#selectorPicker = new SelectorPicker.SelectorPicker(bindings, customAttribute, debug);
        this.#selectorPicker.start();
    }
    stopSelectorPicker() {
        if (!this.#selectorPicker) {
            throw new Error('Selector picker was not started.');
        }
        this.#selectorPicker.stop();
        this.#selectorPicker = undefined;
        if (this.#recordingClient) {
            this.#recordingClient.start();
        }
    }
}
if (!window.DevToolsRecorder) {
    window.DevToolsRecorder = new DevToolsRecorder();
}
//# sourceMappingURL=injected.js.map