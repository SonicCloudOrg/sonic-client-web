// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class MonotonicArray {
    #values = new WeakMap();
    #nextId = 1;
    getOrInsert = (node) => {
        const value = this.#values.get(node);
        if (value !== undefined) {
            return value;
        }
        this.#values.set(node, this.#nextId);
        this.#nextId++;
        return this.#nextId - 1;
    };
}
//# sourceMappingURL=MonotonicArray.js.map