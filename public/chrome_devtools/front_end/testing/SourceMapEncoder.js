// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../core/sdk/sdk.js';
const base64Digits = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function encodeVlq(n) {
    // Set the sign bit as the least significant bit.
    n = n >= 0 ? 2 * n : 1 - 2 * n;
    // Encode into a base64 run.
    let result = '';
    while (true) {
        // Extract the lowest 5 bits and remove them from the number.
        const digit = n & 0x1f;
        n >>= 5;
        // Is there anything more left to encode?
        if (n === 0) {
            // We are done encoding, finish the run.
            result += base64Digits[digit];
            break;
        }
        else {
            // There is still more encode, so add the digit and the continuation bit.
            result += base64Digits[0x20 + digit];
        }
    }
    return result;
}
export function encodeVlqList(list) {
    return list.map(encodeVlq).join('');
}
// Encode array mappings of the form "compiledLine:compiledColumn => srcFile:srcLine:srcColumn@name"
// as a source map.
export function encodeSourceMap(textMap, sourceRoot) {
    let mappings = '';
    const sources = [];
    const names = [];
    let sourcesContent;
    const state = {
        line: -1,
        column: 0,
        srcFile: 0,
        srcLine: 0,
        srcColumn: 0,
        srcName: 0,
    };
    for (const mapping of textMap) {
        let match = mapping.match(/^(\d+):(\d+)(?:\s*=>\s*([^:]+):(\d+):(\d+)(?:@(\S+))?)?$/);
        if (!match) {
            match = mapping.match(/^([^:]+):\s*(.+)$/);
            if (!match) {
                throw new Error(`Cannot parse mapping "${mapping}"`);
            }
            (sourcesContent = sourcesContent ?? [])[getOrAddString(sources, match[1])] = match[2];
            continue;
        }
        const lastState = Object.assign({}, state);
        state.line = Number(match[1]);
        state.column = Number(match[2]);
        const hasSource = match[3] !== undefined;
        const hasName = hasSource && (match[6] !== undefined);
        if (hasSource) {
            state.srcFile = getOrAddString(sources, match[3]);
            state.srcLine = Number(match[4]);
            state.srcColumn = Number(match[5]);
            if (hasName) {
                state.srcName = getOrAddString(names, match[6]);
            }
        }
        if (state.line < lastState.line) {
            throw 'Line numbers must be increasing';
        }
        const isNewLine = state.line !== lastState.line;
        if (isNewLine) {
            // Fixup for the first line mapping.
            if (lastState.line === -1) {
                lastState.line = 0;
            }
            // Insert semicolons for all the new lines.
            mappings += ';'.repeat(state.line - lastState.line);
            // Reset the compiled code column counter.
            lastState.column = 0;
        }
        else {
            mappings += ',';
        }
        // Encode the mapping and add it to the list of mappings.
        const toEncode = [state.column - lastState.column];
        if (hasSource) {
            toEncode.push(state.srcFile - lastState.srcFile, state.srcLine - lastState.srcLine, state.srcColumn - lastState.srcColumn);
            if (hasName) {
                toEncode.push(state.srcName - lastState.srcName);
            }
        }
        mappings += encodeVlqList(toEncode);
    }
    const sourceMapV3 = { version: 3, mappings, sources, names };
    if (sourceRoot !== undefined) {
        sourceMapV3.sourceRoot = sourceRoot;
    }
    if (sourcesContent !== undefined) {
        for (let i = 0; i < sources.length; ++i) {
            if (typeof sourcesContent[i] !== 'string') {
                sourcesContent[i] = null;
            }
        }
        sourceMapV3.sourcesContent = sourcesContent;
    }
    return sourceMapV3;
    function getOrAddString(array, s) {
        const index = array.indexOf(s);
        if (index >= 0) {
            return index;
        }
        array.push(s);
        return array.length - 1;
    }
}
export class OriginalScopeBuilder {
    #encodedScope = '';
    #lastLine = 0;
    start(line, column, kind, name, variables) {
        if (this.#encodedScope !== '') {
            this.#encodedScope += ',';
        }
        const lineDiff = line - this.#lastLine;
        this.#lastLine = line;
        const flags = (name !== undefined ? 0x1 : 0x0) | (variables !== undefined ? 0x2 : 0x0);
        this.#encodedScope += encodeVlqList([lineDiff, column, this.#encodeKind(kind), flags]);
        if (name !== undefined) {
            this.#encodedScope += encodeVlq(name);
        }
        if (variables !== undefined) {
            this.#encodedScope += encodeVlqList(variables);
        }
        return this;
    }
    end(line, column) {
        if (this.#encodedScope !== '') {
            this.#encodedScope += ',';
        }
        const lineDiff = line - this.#lastLine;
        this.#lastLine = line;
        this.#encodedScope += encodeVlqList([lineDiff, column]);
        return this;
    }
    build() {
        const result = this.#encodedScope;
        this.#lastLine = 0;
        this.#encodedScope = '';
        return result;
    }
    #encodeKind(kind) {
        switch (kind) {
            case 'global':
                return 0x01;
            case 'function':
                return 0x02;
            case 'class':
                return 0x03;
            case 'block':
                return 0x04;
        }
    }
}
export class GeneratedRangeBuilder {
    #encodedRange = '';
    #state = {
        line: 0,
        column: 0,
        defSourceIdx: 0,
        defScopeIdx: 0,
        callsiteSourceIdx: 0,
        callsiteLine: 0,
        callsiteColumn: 0,
    };
    start(line, column, options) {
        this.#emitLineSeparator(line);
        this.#emitItemSepratorIfRequired();
        const emittedColumn = column - (this.#state.line === line ? this.#state.column : 0);
        this.#encodedRange += encodeVlq(emittedColumn);
        this.#state.line = line;
        this.#state.column = column;
        let flags = 0;
        if (options?.definition) {
            flags |= 1 /* SDK.SourceMapScopes.EncodedGeneratedRangeFlag.HasDefinition */;
        }
        if (options?.callsite) {
            flags |= 2 /* SDK.SourceMapScopes.EncodedGeneratedRangeFlag.HasCallsite */;
        }
        this.#encodedRange += encodeVlq(flags);
        if (options?.definition) {
            const { sourceIdx, scopeIdx } = options.definition;
            this.#encodedRange += encodeVlq(sourceIdx - this.#state.defSourceIdx);
            const emittedScopeIdx = scopeIdx - (this.#state.defSourceIdx === sourceIdx ? this.#state.defScopeIdx : 0);
            this.#encodedRange += encodeVlq(emittedScopeIdx);
            this.#state.defSourceIdx = sourceIdx;
            this.#state.defScopeIdx = scopeIdx;
        }
        if (options?.callsite) {
            const { sourceIdx, line, column } = options.callsite;
            this.#encodedRange += encodeVlq(sourceIdx - this.#state.callsiteSourceIdx);
            const emittedLine = line - (this.#state.callsiteSourceIdx === sourceIdx ? this.#state.callsiteLine : 0);
            this.#encodedRange += encodeVlq(emittedLine);
            const emittedColumn = column - (this.#state.callsiteLine === line ? this.#state.callsiteColumn : 0);
            this.#encodedRange += encodeVlq(emittedColumn);
            this.#state.callsiteSourceIdx = sourceIdx;
            this.#state.callsiteLine = line;
            this.#state.callsiteColumn = column;
        }
        for (const bindings of options?.bindings ?? []) {
            if (typeof bindings === 'number') {
                this.#encodedRange += encodeVlq(bindings);
                continue;
            }
            this.#encodedRange += encodeVlq(bindings[0].nameIdx);
            this.#encodedRange += encodeVlq(-bindings.length);
            if (bindings[0].line !== line || bindings[0].column !== column) {
                throw new Error('First binding line/column must match the range start line/column');
            }
            for (let i = 1; i < bindings.length; ++i) {
                const { line, column, nameIdx } = bindings[i];
                const emittedLine = line - bindings[i - 1].line;
                const emittedColumn = column - (line === bindings[i - 1].line ? bindings[i - 1].column : 0);
                this.#encodedRange += encodeVlq(emittedLine);
                this.#encodedRange += encodeVlq(emittedColumn);
                this.#encodedRange += encodeVlq(nameIdx);
            }
        }
        return this;
    }
    end(line, column) {
        this.#emitLineSeparator(line);
        this.#emitItemSepratorIfRequired();
        const emittedColumn = column - (this.#state.line === line ? this.#state.column : 0);
        this.#encodedRange += encodeVlq(emittedColumn);
        this.#state.line = line;
        this.#state.column = column;
        return this;
    }
    #emitLineSeparator(line) {
        for (let i = this.#state.line; i < line; ++i) {
            this.#encodedRange += ';';
        }
    }
    #emitItemSepratorIfRequired() {
        if (this.#encodedRange !== '' && this.#encodedRange[this.#encodedRange.length - 1] !== ';') {
            this.#encodedRange += ',';
        }
    }
    build() {
        const result = this.#encodedRange;
        this.#state = {
            line: 0,
            column: 0,
            defSourceIdx: 0,
            defScopeIdx: 0,
            callsiteSourceIdx: 0,
            callsiteLine: 0,
            callsiteColumn: 0,
        };
        this.#encodedRange = '';
        return result;
    }
}
//# sourceMappingURL=SourceMapEncoder.js.map