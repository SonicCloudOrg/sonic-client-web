// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * @fileoverview This file implements the current state of the "Scopes" proposal
 * for the source map spec.
 *
 * See https://github.com/tc39/source-map-rfc/blob/main/proposals/scopes.md.
 *
 * The proposal is still being worked on so we expect the implementation details
 * in this file to change frequently.
 */
import { TokenIterator } from './SourceMap.js';
export function decodeOriginalScopes(encodedOriginalScopes, names) {
    return encodedOriginalScopes.map(scope => decodeOriginalScope(scope, names));
}
function decodeOriginalScope(encodedOriginalScope, names) {
    const scopeForItemIndex = new Map();
    const scopeStack = [];
    let line = 0;
    for (const [index, item] of decodeOriginalScopeItems(encodedOriginalScope)) {
        line += item.line;
        const { column } = item;
        if (isStart(item)) {
            const kind = decodeKind(item.kind);
            const name = resolveName(item.name, names);
            const variables = item.variables.map(idx => names[idx]);
            const scope = { start: { line, column }, end: { line, column }, kind, name, variables, children: [] };
            scopeStack.push(scope);
            scopeForItemIndex.set(index, scope);
        }
        else {
            const scope = scopeStack.pop();
            if (!scope) {
                throw new Error('Scope items not nested properly: encountered "end" item without "start" item');
            }
            scope.end = { line, column };
            if (scopeStack.length === 0) {
                // We are done. There might be more top-level scopes but we only allow one.
                return { root: scope, scopeForItemIndex };
            }
            scopeStack[scopeStack.length - 1].children.push(scope);
        }
    }
    throw new Error('Malformed original scope encoding');
}
function isStart(item) {
    return 'kind' in item;
}
function* decodeOriginalScopeItems(encodedOriginalScope) {
    const iter = new TokenIterator(encodedOriginalScope);
    let prevColumn = 0;
    let itemCount = 0;
    while (iter.hasNext()) {
        if (iter.peek() === ',') {
            iter.next(); // Consume ','.
        }
        const [line, column] = [iter.nextVLQ(), iter.nextVLQ()];
        if (line === 0 && column < prevColumn) {
            throw new Error('Malformed original scope encoding: start/end items must be ordered w.r.t. source positions');
        }
        prevColumn = column;
        if (!iter.hasNext() || iter.peek() === ',') {
            yield [itemCount++, { line, column }];
            continue;
        }
        const startItem = {
            line,
            column,
            kind: iter.nextVLQ(),
            flags: iter.nextVLQ(),
            variables: [],
        };
        if (startItem.flags & 0x1) {
            startItem.name = iter.nextVLQ();
        }
        if (startItem.flags & 0x2) {
            while (iter.hasNext() && iter.peek() !== ',') {
                startItem.variables.push(iter.nextVLQ());
            }
        }
        yield [itemCount++, startItem];
    }
}
export function decodeGeneratedRanges(encodedGeneratedRange, originalScopeTrees, names) {
    const rangeStack = [];
    const rangeToStartItem = new Map();
    for (const item of decodeGeneratedRangeItems(encodedGeneratedRange)) {
        if (isRangeStart(item)) {
            // TODO(crbug.com/40277685): Decode callsite and bindings.
            const range = {
                start: { line: item.line, column: item.column },
                end: { line: item.line, column: item.column },
                values: [],
                children: [],
            };
            if (item.definition) {
                const { scopeIdx, sourceIdx } = item.definition;
                if (!originalScopeTrees[sourceIdx]) {
                    throw new Error('Invalid source index!');
                }
                const originalScope = originalScopeTrees[sourceIdx].scopeForItemIndex.get(scopeIdx);
                if (!originalScope) {
                    throw new Error('Invalid original scope index!');
                }
                range.originalScope = originalScope;
            }
            if (item.callsite) {
                const { sourceIdx, line, column } = item.callsite;
                if (!originalScopeTrees[sourceIdx]) {
                    throw new Error('Invalid source index!');
                }
                range.callsite = {
                    sourceIndex: sourceIdx,
                    line,
                    column,
                };
            }
            rangeToStartItem.set(range, item);
            rangeStack.push(range);
        }
        else {
            const range = rangeStack.pop();
            if (!range) {
                throw new Error('Range items not nested properly: encountered "end" item without "start" item');
            }
            range.end = { line: item.line, column: item.column };
            resolveBindings(range, names, rangeToStartItem.get(range)?.bindings);
            if (rangeStack.length === 0) {
                // We are done. There might be more top-level scopes but we only allow one.
                return range;
            }
            rangeStack[rangeStack.length - 1].children.push(range);
        }
    }
    throw new Error('Malformed generated range encoding');
}
function resolveBindings(range, names, bindingsForAllVars) {
    if (bindingsForAllVars === undefined) {
        return;
    }
    range.values = bindingsForAllVars.map(bindings => {
        if (bindings.length === 1) {
            return resolveName(bindings[0].nameIdx, names);
        }
        const bindingRanges = bindings.map(binding => ({
            from: { line: binding.line, column: binding.column },
            to: { line: binding.line, column: binding.column },
            value: resolveName(binding.nameIdx, names),
        }));
        for (let i = 1; i < bindingRanges.length; ++i) {
            bindingRanges[i - 1].to = { ...bindingRanges[i].from };
        }
        bindingRanges[bindingRanges.length - 1].to = { ...range.end };
        return bindingRanges;
    });
}
function isRangeStart(item) {
    return 'flags' in item;
}
function* decodeGeneratedRangeItems(encodedGeneratedRange) {
    const iter = new TokenIterator(encodedGeneratedRange);
    let line = 0;
    // The state are the fields of the last produced item, tracked because many
    // are relative to the preceeding item.
    const state = {
        line: 0,
        column: 0,
        defSourceIdx: 0,
        defScopeIdx: 0,
        callsiteSourceIdx: 0,
        callsiteLine: 0,
        callsiteColumn: 0,
    };
    while (iter.hasNext()) {
        if (iter.peek() === ';') {
            iter.next(); // Consume ';'.
            ++line;
            continue;
        }
        else if (iter.peek() === ',') {
            iter.next(); // Consume ','.
            continue;
        }
        state.column = iter.nextVLQ() + (line === state.line ? state.column : 0);
        state.line = line;
        if (iter.peekVLQ() === null) {
            yield { line, column: state.column };
            continue;
        }
        const startItem = {
            line,
            column: state.column,
            flags: iter.nextVLQ(),
            bindings: [],
        };
        if (startItem.flags & 1 /* EncodedGeneratedRangeFlag.HasDefinition */) {
            const sourceIdx = iter.nextVLQ();
            const scopeIdx = iter.nextVLQ();
            state.defScopeIdx = scopeIdx + (sourceIdx === 0 ? state.defScopeIdx : 0);
            state.defSourceIdx += sourceIdx;
            startItem.definition = {
                sourceIdx: state.defSourceIdx,
                scopeIdx: state.defScopeIdx,
            };
        }
        if (startItem.flags & 2 /* EncodedGeneratedRangeFlag.HasCallsite */) {
            const sourceIdx = iter.nextVLQ();
            const line = iter.nextVLQ();
            const column = iter.nextVLQ();
            state.callsiteColumn = column + (line === 0 && sourceIdx === 0 ? state.callsiteColumn : 0);
            state.callsiteLine = line + (sourceIdx === 0 ? state.callsiteLine : 0);
            state.callsiteSourceIdx += sourceIdx;
            startItem.callsite = {
                sourceIdx: state.callsiteSourceIdx,
                line: state.callsiteLine,
                column: state.callsiteColumn,
            };
        }
        while (iter.hasNext() && iter.peek() !== ';' && iter.peek() !== ',') {
            const value = iter.nextVLQ();
            const bindings = [{ line: startItem.line, column: startItem.column, nameIdx: value }];
            startItem.bindings.push(bindings);
            const nextVlq = iter.peekVLQ();
            if (nextVlq === null || nextVlq >= -1) {
                // Variable is available under the same expression in the whole range, or it's unavailable in the whole range.
                continue;
            }
            // Variable is available under different expressions in this range or unavailable in parts of this range.
            const rangeCount = -iter.nextVLQ();
            for (let i = 0; i < rangeCount - 1; ++i) {
                // line, column, valueOffset
                const line = iter.nextVLQ();
                const column = iter.nextVLQ();
                const nameIdx = iter.nextVLQ();
                const lastLine = bindings.at(-1)?.line ?? 0; // Only to make TS happy. `bindings` has one entry guaranteed.
                const lastColumn = bindings.at(-1)?.column ?? 0; // Only to make TS happy. `bindings` has one entry guaranteed.
                bindings.push({
                    line: line + lastLine,
                    column: column + (line === 0 ? lastColumn : 0),
                    nameIdx,
                });
            }
        }
        yield startItem;
    }
}
function resolveName(idx, names) {
    if (idx === undefined || idx < 0) {
        return undefined;
    }
    return names[idx];
}
function decodeKind(kind) {
    switch (kind) {
        case 0x1:
            return 'global';
        case 0x2:
            return 'function';
        case 0x3:
            return 'class';
        case 0x4:
            return 'block';
        default:
            throw new Error(`Unknown scope kind ${kind}`);
    }
}
//# sourceMappingURL=SourceMapScopes.js.map