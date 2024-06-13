// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Generates a JSON representation of an array of objects with the objects
 * printed one per line for improved readability (but not *too* verbose).
 */
export function* arrayOfObjectsJsonGenerator(arrayOfObjects) {
    const ITEMS_PER_ITERATION = 10_000;
    // Stringify and emit items separately to avoid a giant string in memory.
    yield '[\n';
    if (arrayOfObjects.length > 0) {
        const itemsIterator = arrayOfObjects[Symbol.iterator]();
        // Emit first item manually to avoid a trailing comma.
        const firstItem = itemsIterator.next().value;
        yield `  ${JSON.stringify(firstItem)}`;
        let itemsRemaining = ITEMS_PER_ITERATION;
        let itemsJSON = '';
        for (const item of itemsIterator) {
            itemsJSON += `,\n  ${JSON.stringify(item)}`;
            itemsRemaining--;
            if (itemsRemaining === 0) {
                yield itemsJSON;
                itemsRemaining = ITEMS_PER_ITERATION;
                itemsJSON = '';
            }
        }
        yield itemsJSON;
    }
    yield '\n]';
}
/**
 * Generates a JSON representation of traceData line-by-line for a nicer printed
 * version with one trace event per line.
 */
export function* traceJsonGenerator(traceEvents, metadata) {
    yield `{"metadata": ${JSON.stringify(metadata || {}, null, 2)}`;
    yield ',\n"traceEvents": ';
    yield* arrayOfObjectsJsonGenerator(traceEvents);
    yield '}\n';
}
/**
 * Generates a JSON representation of CPU profile.
 */
export function cpuprofileJsonGenerator(cpuprofile) {
    return JSON.stringify(cpuprofile);
}
//# sourceMappingURL=SaveFileFormatter.js.map