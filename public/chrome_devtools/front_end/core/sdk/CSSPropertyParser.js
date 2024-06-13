// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as CodeMirror from '../../third_party/codemirror.next/codemirror.next.js';
const globalValues = new Set(['inherit', 'initial', 'unset']);
const tagRegexp = /[\x20-\x7E]{4}/;
const numRegexp = /[+-]?(?:\d*\.)?\d+(?:[eE]\d+)?/;
const fontVariationSettingsRegexp = new RegExp(`(?:'(${tagRegexp.source})')|(?:"(${tagRegexp.source})")\\s+(${numRegexp.source})`);
/**
 * Extracts information about font variation settings assuming
 * value is valid according to the spec: https://drafts.csswg.org/css-fonts-4/#font-variation-settings-def
 */
export function parseFontVariationSettings(value) {
    if (globalValues.has(value.trim()) || value.trim() === 'normal') {
        return [];
    }
    const results = [];
    for (const setting of splitByComma(stripComments(value))) {
        const match = setting.match(fontVariationSettingsRegexp);
        if (match) {
            results.push({
                tag: match[1] || match[2],
                value: parseFloat(match[3]),
            });
        }
    }
    return results;
}
// "str" or 'str'
const fontFamilyRegexp = /^"(.+)"|'(.+)'$/;
/**
 * Extracts font families assuming the value is valid according to
 * the spec: https://drafts.csswg.org/css-fonts-4/#font-family-prop
 */
export function parseFontFamily(value) {
    if (globalValues.has(value.trim())) {
        return [];
    }
    const results = [];
    for (const family of splitByComma(stripComments(value))) {
        const match = family.match(fontFamilyRegexp);
        if (match) {
            // Either the 1st or 2nd group matches if the value is in quotes
            results.push(match[1] || match[2]);
        }
        else {
            // Value without without quotes.
            results.push(family);
        }
    }
    return results;
}
/**
 * Splits a list of values by comma and trims parts
 */
export function splitByComma(value) {
    return value.split(',').map(part => part.trim());
}
export function stripComments(value) {
    return value.replaceAll(/(\/\*(?:.|\s)*?\*\/)/g, '');
}
const cssParser = CodeMirror.css.cssLanguage.parser;
function nodeText(node, text) {
    return nodeTextRange(node, node, text);
}
function nodeTextRange(from, to, text) {
    return text.substring(from.from, to.to);
}
export class SyntaxTree {
    propertyValue;
    rule;
    tree;
    trailingNodes;
    propertyName;
    constructor(propertyValue, rule, tree, propertyName, trailingNodes = []) {
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;
        this.rule = rule;
        this.tree = tree;
        this.trailingNodes = trailingNodes;
    }
    text(node) {
        if (node === null) {
            return '';
        }
        return nodeText(node ?? this.tree, this.rule);
    }
    textRange(from, to) {
        return nodeTextRange(from, to, this.rule);
    }
    subtree(node) {
        return new SyntaxTree(this.propertyValue, this.rule, node);
    }
}
export class TreeWalker {
    ast;
    constructor(ast) {
        this.ast = ast;
    }
    static walkExcludingSuccessors(propertyValue, ...args) {
        const instance = new this(propertyValue, ...args);
        if (propertyValue.tree.name === 'Declaration') {
            instance.iterateDeclaration(propertyValue.tree);
        }
        else {
            instance.iterateExcludingSuccessors(propertyValue.tree);
        }
        return instance;
    }
    static walk(propertyValue, ...args) {
        const instance = new this(propertyValue, ...args);
        if (propertyValue.tree.name === 'Declaration') {
            instance.iterateDeclaration(propertyValue.tree);
        }
        else {
            instance.iterate(propertyValue.tree);
        }
        return instance;
    }
    iterateDeclaration(tree) {
        if (tree.name !== 'Declaration') {
            return;
        }
        if (this.enter(tree)) {
            ASTUtils.declValue(tree)?.cursor().iterate(this.enter.bind(this), this.leave.bind(this));
        }
        this.leave(tree);
    }
    iterate(tree) {
        tree.cursor().iterate(this.enter.bind(this), this.leave.bind(this));
    }
    iterateExcludingSuccessors(tree) {
        // Customize the first step to avoid visiting siblings of `tree`
        if (this.enter(tree)) {
            tree.firstChild?.cursor().iterate(this.enter.bind(this), this.leave.bind(this));
        }
        this.leave(tree);
    }
    enter(_node) {
        return true;
    }
    leave(_node) {
    }
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function matcherBase(matchT) {
    class MatcherBase {
        matchType = matchT;
        accepts(_propertyName) {
            return true;
        }
        matches(_node, _matching) {
            return null;
        }
    }
    return MatcherBase;
}
export class BottomUpTreeMatching extends TreeWalker {
    #matchers = [];
    #matchedNodes = new Map();
    computedText;
    #key(node) {
        return `${node.from}:${node.to}`;
    }
    constructor(ast, matchers) {
        super(ast);
        this.computedText = new ComputedText(ast.rule.substring(ast.tree.from));
        this.#matchers.push(...matchers.filter(m => !ast.propertyName || m.accepts(ast.propertyName)));
        this.#matchers.push(new TextMatcher());
    }
    leave({ node }) {
        for (const matcher of this.#matchers) {
            const match = matcher.matches(node, this);
            if (match) {
                this.computedText.push(match, node.from - this.ast.tree.from);
                this.#matchedNodes.set(this.#key(node), match);
                break;
            }
        }
    }
    matchText(node) {
        const matchers = this.#matchers.splice(0);
        this.#matchers.push(new TextMatcher());
        this.iterateExcludingSuccessors(node);
        this.#matchers.push(...matchers);
    }
    getMatch(node) {
        return this.#matchedNodes.get(this.#key(node));
    }
    hasUnresolvedVars(node) {
        return this.hasUnresolvedVarsRange(node, node);
    }
    hasUnresolvedVarsRange(from, to) {
        return this.computedText.hasUnresolvedVars(from.from - this.ast.tree.from, to.to - this.ast.tree.from);
    }
    getComputedText(node, substitutions) {
        return this.getComputedTextRange(node, node, substitutions);
    }
    getComputedTextRange(from, to, substitutions) {
        return this.computedText.get(from.from - this.ast.tree.from, to.to - this.ast.tree.from, substitutions);
    }
}
class ComputedTextChunk {
    match;
    offset;
    #cachedComputedText = null;
    constructor(match, offset) {
        this.match = match;
        this.offset = offset;
    }
    get end() {
        return this.offset + this.length;
    }
    get length() {
        return this.match.text.length;
    }
    get computedText() {
        if (this.#cachedComputedText === null) {
            this.#cachedComputedText = this.match.computedText();
        }
        return this.#cachedComputedText;
    }
}
// This class constructs the "computed" text from the input property text, i.e., it will strip comments and substitute
// var() functions if possible. It's intended for use during the bottom-up tree matching process. The original text is
// not modified. Instead, computed text slices are produced on the fly. During bottom-up matching, the sequence of
// top-level comments and var() matches will be recorded. This produces an ordered sequence of text pieces that need to
// be substituted into the original text. When a computed text slice is requested, it is generated by piecing together
// original and computed slices as required.
export class ComputedText {
    #chunks = [];
    text;
    #sorted = true;
    constructor(text) {
        this.text = text;
    }
    clear() {
        this.#chunks.splice(0);
    }
    get chunkCount() {
        return this.#chunks.length;
    }
    #sortIfNecessary() {
        if (this.#sorted) {
            return;
        }
        // Sort intervals by offset, with longer intervals first if the offset is identical.
        this.#chunks.sort((a, b) => {
            if (a.offset < b.offset) {
                return -1;
            }
            if (b.offset < a.offset) {
                return 1;
            }
            if (a.end > b.end) {
                return -1;
            }
            if (a.end < b.end) {
                return 1;
            }
            return 0;
        });
        this.#sorted = true;
    }
    // Add another substitutable match. The match will either be appended to the list of existing matches or it will
    // be substituted for the last match(es) if it encompasses them.
    push(match, offset) {
        function hasComputedText(match) {
            return Boolean(match.computedText);
        }
        if (!hasComputedText(match) || offset < 0 || offset >= this.text.length) {
            return;
        }
        const chunk = new ComputedTextChunk(match, offset);
        if (chunk.end > this.text.length) {
            return;
        }
        this.#sorted = false;
        this.#chunks.push(chunk);
    }
    *#range(begin, end) {
        this.#sortIfNecessary();
        let i = this.#chunks.findIndex(c => c.offset >= begin);
        while (i >= 0 && i < this.#chunks.length && this.#chunks[i].end > begin && begin < end) {
            if (this.#chunks[i].end > end) {
                i++;
                continue;
            }
            yield this.#chunks[i];
            begin = this.#chunks[i].end;
            while (begin < end && i < this.#chunks.length && this.#chunks[i].offset < begin) {
                i++;
            }
        }
    }
    hasUnresolvedVars(begin, end) {
        for (const chunk of this.#range(begin, end)) {
            if (chunk.computedText === null) {
                return true;
            }
        }
        return false;
    }
    *#getPieces(begin, end) {
        for (const chunk of this.#range(begin, end)) {
            const piece = this.text.substring(begin, Math.min(chunk.offset, end));
            yield piece;
            if (end >= chunk.end) {
                yield chunk;
            }
            begin = chunk.end;
        }
        if (begin < end) {
            const piece = this.text.substring(begin, end);
            yield piece;
        }
    }
    // Get a slice of the computed text corresponding to the property text in the range [begin, end). The slice may not
    // start within a substitution chunk, e.g., it's invalid to request the computed text for the property value text
    // slice "1px var(--".
    get(begin, end, substitutions) {
        const pieces = [];
        const getText = (piece) => {
            if (typeof piece === 'string') {
                return piece;
            }
            const substitution = substitutions?.get(piece.match);
            if (substitution) {
                return getText(substitution);
            }
            return piece.computedText ?? piece.match.text;
        };
        for (const piece of this.#getPieces(begin, end)) {
            const text = getText(piece);
            if (text.length === 0) {
                continue;
            }
            if (pieces.length > 0 && requiresSpace(pieces[pieces.length - 1], text)) {
                pieces.push(' ');
            }
            pieces.push(text);
        }
        return pieces.join('');
    }
}
export function requiresSpace(a, b) {
    const tail = Array.isArray(a) ? a.findLast(node => node.textContent)?.textContent : a;
    const head = Array.isArray(b) ? b.find(node => node.textContent)?.textContent : b;
    const trailingChar = tail ? tail[tail.length - 1] : '';
    const leadingChar = head ? head[0] : '';
    const noSpaceAfter = ['', '(', '{', '}', ';', '['];
    const noSpaceBefore = ['', '(', ')', ',', ':', '*', '{', ';', ']'];
    return !/\s/.test(trailingChar) && !/\s/.test(leadingChar) && !noSpaceAfter.includes(trailingChar) &&
        !noSpaceBefore.includes(leadingChar);
}
export const CSSControlMap = (Map);
export var ASTUtils;
(function (ASTUtils) {
    function siblings(node) {
        const result = [];
        while (node) {
            result.push(node);
            node = node.nextSibling;
        }
        return result;
    }
    ASTUtils.siblings = siblings;
    function children(node) {
        return siblings(node?.firstChild ?? null);
    }
    ASTUtils.children = children;
    function declValue(node) {
        if (node.name !== 'Declaration') {
            return null;
        }
        return children(node).find(node => node.name === ':')?.nextSibling ?? null;
    }
    ASTUtils.declValue = declValue;
    function* stripComments(nodes) {
        for (const node of nodes) {
            if (node.type.name !== 'Comment') {
                yield node;
            }
        }
    }
    ASTUtils.stripComments = stripComments;
    function split(nodes) {
        const result = [];
        let current = [];
        for (const node of nodes) {
            if (node.name === ',') {
                result.push(current);
                current = [];
            }
            else {
                current.push(node);
            }
        }
        result.push(current);
        return result;
    }
    ASTUtils.split = split;
    function callArgs(node) {
        const args = children(node.getChild('ArgList'));
        const openParen = args.splice(0, 1)[0];
        const closingParen = args.pop();
        if (openParen?.name !== '(' || closingParen?.name !== ')') {
            return [];
        }
        return split(args);
    }
    ASTUtils.callArgs = callArgs;
})(ASTUtils || (ASTUtils = {}));
export class VariableMatch {
    text;
    node;
    name;
    fallback;
    matching;
    computedTextCallback;
    constructor(text, node, name, fallback, matching, computedTextCallback) {
        this.text = text;
        this.node = node;
        this.name = name;
        this.fallback = fallback;
        this.matching = matching;
        this.computedTextCallback = computedTextCallback;
    }
    computedText() {
        return this.computedTextCallback(this, this.matching);
    }
}
// clang-format off
export class VariableMatcher extends matcherBase(VariableMatch) {
    // clang-format on
    #computedTextCallback;
    constructor(computedTextCallback) {
        super();
        this.#computedTextCallback = computedTextCallback;
    }
    matches(node, matching) {
        const callee = node.getChild('Callee');
        const args = node.getChild('ArgList');
        if (node.name !== 'CallExpression' || !callee || (matching.ast.text(callee) !== 'var') || !args) {
            return null;
        }
        const [lparenNode, nameNode, ...fallbackOrRParenNodes] = ASTUtils.children(args);
        if (lparenNode?.name !== '(' || nameNode?.name !== 'VariableName') {
            return null;
        }
        if (fallbackOrRParenNodes.length <= 1 && fallbackOrRParenNodes[0]?.name !== ')') {
            return null;
        }
        let fallback = [];
        if (fallbackOrRParenNodes.length > 1) {
            if (fallbackOrRParenNodes.shift()?.name !== ',') {
                return null;
            }
            if (fallbackOrRParenNodes.pop()?.name !== ')') {
                return null;
            }
            fallback = fallbackOrRParenNodes;
            if (fallback.length === 0) {
                return null;
            }
            if (fallback.some(n => n.name === ',')) {
                return null;
            }
        }
        const varName = matching.ast.text(nameNode);
        if (!varName.startsWith('--')) {
            return null;
        }
        return new VariableMatch(matching.ast.text(node), node, varName, fallback, matching, this.#computedTextCallback);
    }
}
export class TextMatch {
    text;
    node;
    computedText;
    constructor(text, node) {
        this.text = text;
        this.node = node;
        if (node.name === 'Comment') {
            this.computedText = () => '';
        }
    }
    render() {
        return [document.createTextNode(this.text)];
    }
}
// clang-format off
class TextMatcher extends matcherBase(TextMatch) {
    // clang-format on
    accepts() {
        return true;
    }
    matches(node, matching) {
        if (!node.firstChild || node.name === 'NumberLiteral' /* may have a Unit child */) {
            // Leaf node, just emit text
            const text = matching.ast.text(node);
            if (text.length) {
                return new TextMatch(text, node);
            }
        }
        return null;
    }
}
function declaration(rule) {
    return cssParser.parse(rule).topNode.getChild('RuleSet')?.getChild('Block')?.getChild('Declaration') ?? null;
}
export function tokenizeDeclaration(propertyName, propertyValue) {
    const name = tokenizePropertyName(propertyName);
    if (!name) {
        return null;
    }
    const rule = `*{${name}: ${propertyValue};}`;
    const decl = declaration(rule);
    if (!decl || decl.type.isError) {
        return null;
    }
    const childNodes = ASTUtils.children(decl);
    if (childNodes.length < 3) {
        return null;
    }
    const [varName, colon, tree] = childNodes;
    if (!varName || varName.type.isError || !colon || colon.type.isError || !tree || tree.type.isError) {
        return null;
    }
    // It's possible that there are nodes following the declaration when there are comments or syntax errors. We want to
    // render any comments, so pick up any trailing nodes following the declaration excluding the final semicolon and
    // brace.
    const trailingNodes = ASTUtils.siblings(decl).slice(1);
    const [semicolon, brace] = trailingNodes.splice(trailingNodes.length - 2, 2);
    if (semicolon?.name !== ';' && brace?.name !== '}') {
        return null;
    }
    const ast = new SyntaxTree(propertyValue, rule, decl, name, trailingNodes);
    if (ast.text(varName) !== name || colon.name !== ':') {
        return null;
    }
    return ast;
}
export function tokenizePropertyName(name) {
    const rule = `*{${name}: inherit;}`;
    const decl = declaration(rule);
    if (!decl || decl.type.isError) {
        return null;
    }
    const propertyName = decl.getChild('PropertyName') ?? decl.getChild('VariableName');
    if (!propertyName) {
        return null;
    }
    return nodeText(propertyName, rule);
}
//# sourceMappingURL=CSSPropertyParser.js.map