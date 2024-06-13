// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { Logger } from './Logger.js';
import { SelectorComputer } from './SelectorComputer.js';
import { getMouseEventOffsets, getClickableTargetFromEvent, haultImmediateEvent } from './util.js';
class SelectorPicker {
    #logger;
    #computer;
    constructor(bindings, customAttribute = '', debug = true) {
        this.#logger = new Logger(debug ? 'debug' : 'silent');
        this.#logger.log('Creating a SelectorPicker');
        this.#computer = new SelectorComputer(bindings, this.#logger, customAttribute);
    }
    #handleClickEvent = (event) => {
        haultImmediateEvent(event);
        const target = getClickableTargetFromEvent(event);
        window.captureSelectors(JSON.stringify({
            selectors: this.#computer.getSelectors(target),
            ...getMouseEventOffsets(event, target),
        }));
    };
    start = () => {
        this.#logger.log('Setting up selector listeners');
        window.addEventListener('click', this.#handleClickEvent, true);
        window.addEventListener('mousedown', haultImmediateEvent, true);
        window.addEventListener('mouseup', haultImmediateEvent, true);
    };
    stop = () => {
        this.#logger.log('Tearing down selector listeners');
        window.removeEventListener('click', this.#handleClickEvent, true);
        window.removeEventListener('mousedown', haultImmediateEvent, true);
        window.removeEventListener('mouseup', haultImmediateEvent, true);
    };
}
export { SelectorPicker };
//# sourceMappingURL=SelectorPicker.js.map