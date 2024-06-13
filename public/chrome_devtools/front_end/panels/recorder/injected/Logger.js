// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const noop = () => void 0;
export class Logger {
    #log;
    #time;
    #timeEnd;
    constructor(level) {
        switch (level) {
            case 'silent':
                this.#log = noop;
                this.#time = noop;
                this.#timeEnd = noop;
                break;
            default:
                // eslint-disable-next-line no-console
                this.#log = console.log;
                this.#time = console.time;
                this.#timeEnd = console.timeEnd;
                break;
        }
    }
    log(...args) {
        this.#log(...args);
    }
    timed(label, action) {
        this.#time(label);
        const value = action();
        this.#timeEnd(label);
        return value;
    }
}
//# sourceMappingURL=Logger.js.map