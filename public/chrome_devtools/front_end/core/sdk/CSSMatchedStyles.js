// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../platform/platform.js';
import { cssMetadata } from './CSSMetadata.js';
import * as PropertyParser from './CSSPropertyParser.js';
import { CSSFontPaletteValuesRule, CSSKeyframesRule, CSSPositionFallbackRule, CSSPositionTryRule, CSSPropertyRule, CSSStyleRule, } from './CSSRule.js';
import { CSSStyleDeclaration, Type } from './CSSStyleDeclaration.js';
function containsStyle(styles, query) {
    if (!query.styleSheetId || !query.range) {
        return false;
    }
    for (const style of styles) {
        if (query.styleSheetId === style.styleSheetId && style.range && query.range.equal(style.range)) {
            return true;
        }
    }
    return false;
}
function containsCustomProperties(style) {
    const properties = style.allProperties();
    return properties.some(property => cssMetadata().isCustomProperty(property.name));
}
function containsInherited(style) {
    const properties = style.allProperties();
    for (let i = 0; i < properties.length; ++i) {
        const property = properties[i];
        // Does this style contain non-overridden inherited property?
        if (property.activeInStyle() && cssMetadata().isPropertyInherited(property.name)) {
            return true;
        }
    }
    return false;
}
function cleanUserAgentPayload(payload) {
    for (const ruleMatch of payload) {
        cleanUserAgentSelectors(ruleMatch);
    }
    // Merge UA rules that are sequential and have similar selector/media.
    const cleanMatchedPayload = [];
    for (const ruleMatch of payload) {
        const lastMatch = cleanMatchedPayload[cleanMatchedPayload.length - 1];
        if (!lastMatch || ruleMatch.rule.origin !== 'user-agent' || lastMatch.rule.origin !== 'user-agent' ||
            ruleMatch.rule.selectorList.text !== lastMatch.rule.selectorList.text ||
            mediaText(ruleMatch) !== mediaText(lastMatch)) {
            cleanMatchedPayload.push(ruleMatch);
            continue;
        }
        mergeRule(ruleMatch, lastMatch);
    }
    return cleanMatchedPayload;
    function mergeRule(from, to) {
        const shorthands = new Map();
        const properties = new Map();
        for (const entry of to.rule.style.shorthandEntries) {
            shorthands.set(entry.name, entry.value);
        }
        for (const entry of to.rule.style.cssProperties) {
            properties.set(entry.name, entry.value);
        }
        for (const entry of from.rule.style.shorthandEntries) {
            shorthands.set(entry.name, entry.value);
        }
        for (const entry of from.rule.style.cssProperties) {
            properties.set(entry.name, entry.value);
        }
        to.rule.style.shorthandEntries = [...shorthands.entries()].map(([name, value]) => ({ name, value }));
        to.rule.style.cssProperties = [...properties.entries()].map(([name, value]) => ({ name, value }));
    }
    function mediaText(ruleMatch) {
        if (!ruleMatch.rule.media) {
            return null;
        }
        return ruleMatch.rule.media.map(media => media.text).join(', ');
    }
    function cleanUserAgentSelectors(ruleMatch) {
        const { matchingSelectors, rule } = ruleMatch;
        if (rule.origin !== 'user-agent' || !matchingSelectors.length) {
            return;
        }
        rule.selectorList.selectors = rule.selectorList.selectors.filter((item, i) => matchingSelectors.includes(i));
        rule.selectorList.text = rule.selectorList.selectors.map(item => item.text).join(', ');
        ruleMatch.matchingSelectors = matchingSelectors.map((item, i) => i);
    }
}
/**
 * Return a mapping of the highlight names in the specified RuleMatch to
 * the indices of selectors in that selector list with that highlight name.
 *
 * For example, consider the following ruleset:
 * span::highlight(foo), div, #mySpan::highlight(bar), .highlighted::highlight(foo) {
 *   color: blue;
 * }
 *
 * For a <span id="mySpan" class="highlighted"></span>, a RuleMatch for that span
 * would have matchingSelectors [0, 2, 3] indicating that the span
 * matches all of the highlight selectors.
 *
 * For that RuleMatch, this function would produce the following map:
 * {
 *  "foo": [0, 3],
 *  "bar": [2]
 * }
 *
 * @param ruleMatch
 * @returns A mapping of highlight names to lists of indices into the selector
 * list associated with ruleMatch. The indices correspond to the selectors in the rule
 * associated with the key's highlight name.
 */
function customHighlightNamesToMatchingSelectorIndices(ruleMatch) {
    const highlightNamesToMatchingSelectors = new Map();
    for (let i = 0; i < ruleMatch.matchingSelectors.length; i++) {
        const matchingSelectorIndex = ruleMatch.matchingSelectors[i];
        const selectorText = ruleMatch.rule.selectorList.selectors[matchingSelectorIndex].text;
        const highlightNameMatch = selectorText.match(/::highlight\((.*)\)/);
        if (highlightNameMatch) {
            const highlightName = highlightNameMatch[1];
            const selectorsForName = highlightNamesToMatchingSelectors.get(highlightName);
            if (selectorsForName) {
                selectorsForName.push(matchingSelectorIndex);
            }
            else {
                highlightNamesToMatchingSelectors.set(highlightName, [matchingSelectorIndex]);
            }
        }
    }
    return highlightNamesToMatchingSelectors;
}
function queryMatches(style) {
    if (!style.parentRule) {
        return true;
    }
    const parentRule = style.parentRule;
    const queries = [...parentRule.media, ...parentRule.containerQueries, ...parentRule.supports, ...parentRule.scopes];
    for (const query of queries) {
        if (!query.active()) {
            return false;
        }
    }
    return true;
}
export class CSSRegisteredProperty {
    #registration;
    #cssModel;
    #style;
    constructor(cssModel, registration) {
        this.#cssModel = cssModel;
        this.#registration = registration;
    }
    isAtProperty() {
        return this.#registration instanceof CSSPropertyRule;
    }
    propertyName() {
        return this.#registration instanceof CSSPropertyRule ? this.#registration.propertyName().text :
            this.#registration.propertyName;
    }
    initialValue() {
        return this.#registration instanceof CSSPropertyRule ? this.#registration.initialValue() :
            this.#registration.initialValue?.text ?? null;
    }
    inherits() {
        return this.#registration instanceof CSSPropertyRule ? this.#registration.inherits() : this.#registration.inherits;
    }
    syntax() {
        return this.#registration instanceof CSSPropertyRule ? this.#registration.syntax() :
            `"${this.#registration.syntax}"`;
    }
    #asCSSProperties() {
        if (this.#registration instanceof CSSPropertyRule) {
            return [];
        }
        const { inherits, initialValue, syntax } = this.#registration;
        const properties = [
            { name: 'inherits', value: `${inherits}` },
            { name: 'syntax', value: `"${syntax}"` },
        ];
        if (initialValue !== undefined) {
            properties.push({ name: 'initial-value', value: initialValue.text });
        }
        return properties;
    }
    style() {
        if (!this.#style) {
            this.#style = this.#registration instanceof CSSPropertyRule ?
                this.#registration.style :
                new CSSStyleDeclaration(this.#cssModel, null, { cssProperties: this.#asCSSProperties(), shorthandEntries: [] }, Type.Pseudo);
        }
        return this.#style;
    }
}
export class CSSMatchedStyles {
    #cssModelInternal;
    #nodeInternal;
    #addedStyles;
    #matchingSelectors;
    #keyframesInternal;
    #registeredProperties;
    #registeredPropertyMap = new Map();
    #nodeForStyleInternal;
    #inheritedStyles;
    #styleToDOMCascade;
    #parentLayoutNodeId;
    #positionFallbackRules;
    #positionTryRules;
    #mainDOMCascade;
    #pseudoDOMCascades;
    #customHighlightPseudoDOMCascades;
    #fontPaletteValuesRule;
    static async create(payload) {
        const cssMatchedStyles = new CSSMatchedStyles(payload);
        await cssMatchedStyles.init(payload);
        return cssMatchedStyles;
    }
    constructor({ cssModel, node, animationsPayload, parentLayoutNodeId, positionFallbackRules, positionTryRules, propertyRules, cssPropertyRegistrations, fontPaletteValuesRule, }) {
        this.#cssModelInternal = cssModel;
        this.#nodeInternal = node;
        this.#addedStyles = new Map();
        this.#matchingSelectors = new Map();
        this.#registeredProperties = [
            ...propertyRules.map(rule => new CSSPropertyRule(cssModel, rule)),
            ...cssPropertyRegistrations,
        ].map(r => new CSSRegisteredProperty(cssModel, r));
        this.#keyframesInternal = [];
        if (animationsPayload) {
            this.#keyframesInternal = animationsPayload.map(rule => new CSSKeyframesRule(cssModel, rule));
        }
        this.#positionFallbackRules = positionFallbackRules.map(rule => new CSSPositionFallbackRule(cssModel, rule));
        this.#positionTryRules = positionTryRules.map(rule => new CSSPositionTryRule(cssModel, rule));
        this.#parentLayoutNodeId = parentLayoutNodeId;
        this.#fontPaletteValuesRule =
            fontPaletteValuesRule ? new CSSFontPaletteValuesRule(cssModel, fontPaletteValuesRule) : undefined;
        this.#nodeForStyleInternal = new Map();
        this.#inheritedStyles = new Set();
        this.#styleToDOMCascade = new Map();
        this.#registeredPropertyMap = new Map();
    }
    async init({ matchedPayload, inheritedPayload, inlinePayload, attributesPayload, pseudoPayload, inheritedPseudoPayload, }) {
        matchedPayload = cleanUserAgentPayload(matchedPayload);
        for (const inheritedResult of inheritedPayload) {
            inheritedResult.matchedCSSRules = cleanUserAgentPayload(inheritedResult.matchedCSSRules);
        }
        this.#mainDOMCascade =
            await this.buildMainCascade(inlinePayload, attributesPayload, matchedPayload, inheritedPayload);
        [this.#pseudoDOMCascades, this.#customHighlightPseudoDOMCascades] =
            this.buildPseudoCascades(pseudoPayload, inheritedPseudoPayload);
        for (const domCascade of Array.from(this.#customHighlightPseudoDOMCascades.values())
            .concat(Array.from(this.#pseudoDOMCascades.values()))
            .concat(this.#mainDOMCascade)) {
            for (const style of domCascade.styles()) {
                this.#styleToDOMCascade.set(style, domCascade);
            }
        }
        for (const prop of this.#registeredProperties) {
            this.#registeredPropertyMap.set(prop.propertyName(), prop);
        }
    }
    async buildMainCascade(inlinePayload, attributesPayload, matchedPayload, inheritedPayload) {
        const nodeCascades = [];
        const nodeStyles = [];
        function addAttributesStyle() {
            if (!attributesPayload) {
                return;
            }
            const style = new CSSStyleDeclaration(this.#cssModelInternal, null, attributesPayload, Type.Attributes);
            this.#nodeForStyleInternal.set(style, this.#nodeInternal);
            nodeStyles.push(style);
        }
        // Inline style has the greatest specificity.
        if (inlinePayload && this.#nodeInternal.nodeType() === Node.ELEMENT_NODE) {
            const style = new CSSStyleDeclaration(this.#cssModelInternal, null, inlinePayload, Type.Inline);
            this.#nodeForStyleInternal.set(style, this.#nodeInternal);
            nodeStyles.push(style);
        }
        // Add rules in reverse order to match the cascade order.
        let addedAttributesStyle;
        for (let i = matchedPayload.length - 1; i >= 0; --i) {
            const rule = new CSSStyleRule(this.#cssModelInternal, matchedPayload[i].rule);
            if ((rule.isInjected() || rule.isUserAgent()) && !addedAttributesStyle) {
                // Show element's Style Attributes after all author rules.
                addedAttributesStyle = true;
                addAttributesStyle.call(this);
            }
            this.#nodeForStyleInternal.set(rule.style, this.#nodeInternal);
            nodeStyles.push(rule.style);
            this.addMatchingSelectors(this.#nodeInternal, rule, matchedPayload[i].matchingSelectors);
        }
        if (!addedAttributesStyle) {
            addAttributesStyle.call(this);
        }
        nodeCascades.push(new NodeCascade(this, nodeStyles, false /* #isInherited */));
        // Walk the node structure and identify styles with inherited properties.
        let parentNode = this.#nodeInternal.parentNode;
        const traverseParentInFlatTree = async (node) => {
            if (node.hasAssignedSlot()) {
                return await node.assignedSlot?.deferredNode.resolvePromise() ?? null;
            }
            return node.parentNode;
        };
        for (let i = 0; parentNode && inheritedPayload && i < inheritedPayload.length; ++i) {
            const inheritedStyles = [];
            const entryPayload = inheritedPayload[i];
            const inheritedInlineStyle = entryPayload.inlineStyle ?
                new CSSStyleDeclaration(this.#cssModelInternal, null, entryPayload.inlineStyle, Type.Inline) :
                null;
            if (inheritedInlineStyle && containsInherited(inheritedInlineStyle)) {
                this.#nodeForStyleInternal.set(inheritedInlineStyle, parentNode);
                inheritedStyles.push(inheritedInlineStyle);
                this.#inheritedStyles.add(inheritedInlineStyle);
            }
            const inheritedMatchedCSSRules = entryPayload.matchedCSSRules || [];
            for (let j = inheritedMatchedCSSRules.length - 1; j >= 0; --j) {
                const inheritedRule = new CSSStyleRule(this.#cssModelInternal, inheritedMatchedCSSRules[j].rule);
                this.addMatchingSelectors(parentNode, inheritedRule, inheritedMatchedCSSRules[j].matchingSelectors);
                if (!containsInherited(inheritedRule.style)) {
                    continue;
                }
                if (!containsCustomProperties(inheritedRule.style)) {
                    if (containsStyle(nodeStyles, inheritedRule.style) ||
                        containsStyle(this.#inheritedStyles, inheritedRule.style)) {
                        continue;
                    }
                }
                this.#nodeForStyleInternal.set(inheritedRule.style, parentNode);
                inheritedStyles.push(inheritedRule.style);
                this.#inheritedStyles.add(inheritedRule.style);
            }
            parentNode = await traverseParentInFlatTree(parentNode);
            nodeCascades.push(new NodeCascade(this, inheritedStyles, true /* #isInherited */));
        }
        return new DOMInheritanceCascade(nodeCascades, this.#registeredProperties);
    }
    /**
     * Pseudo rule matches received via the inspector protocol are grouped by pseudo type.
     * For custom highlight pseudos, we need to instead group the rule matches by highlight
     * name in order to produce separate cascades for each highlight name. This is necessary
     * so that styles of ::highlight(foo) are not shown as overriding styles of ::highlight(bar).
     *
     * This helper function takes a list of rule matches and generates separate NodeCascades
     * for each custom highlight name that was matched.
     */
    buildSplitCustomHighlightCascades(rules, node, isInherited, pseudoCascades) {
        const splitHighlightRules = new Map();
        for (let j = rules.length - 1; j >= 0; --j) {
            const highlightNamesToMatchingSelectorIndices = customHighlightNamesToMatchingSelectorIndices(rules[j]);
            for (const [highlightName, matchingSelectors] of highlightNamesToMatchingSelectorIndices) {
                const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[j].rule);
                this.#nodeForStyleInternal.set(pseudoRule.style, node);
                if (isInherited) {
                    this.#inheritedStyles.add(pseudoRule.style);
                }
                this.addMatchingSelectors(node, pseudoRule, matchingSelectors);
                const ruleListForHighlightName = splitHighlightRules.get(highlightName);
                if (ruleListForHighlightName) {
                    ruleListForHighlightName.push(pseudoRule.style);
                }
                else {
                    splitHighlightRules.set(highlightName, [pseudoRule.style]);
                }
            }
        }
        for (const [highlightName, highlightStyles] of splitHighlightRules) {
            const nodeCascade = new NodeCascade(this, highlightStyles, isInherited, true /* #isHighlightPseudoCascade*/);
            const cascadeListForHighlightName = pseudoCascades.get(highlightName);
            if (cascadeListForHighlightName) {
                cascadeListForHighlightName.push(nodeCascade);
            }
            else {
                pseudoCascades.set(highlightName, [nodeCascade]);
            }
        }
    }
    buildPseudoCascades(pseudoPayload, inheritedPseudoPayload) {
        const pseudoInheritanceCascades = new Map();
        const customHighlightPseudoInheritanceCascades = new Map();
        if (!pseudoPayload) {
            return [pseudoInheritanceCascades, customHighlightPseudoInheritanceCascades];
        }
        const pseudoCascades = new Map();
        const customHighlightPseudoCascades = new Map();
        for (let i = 0; i < pseudoPayload.length; ++i) {
            const entryPayload = pseudoPayload[i];
            // PseudoElement nodes are not created unless "content" css property is set.
            const pseudoElement = this.#nodeInternal.pseudoElements().get(entryPayload.pseudoType)?.at(-1) || null;
            const pseudoStyles = [];
            const rules = entryPayload.matches || [];
            if (entryPayload.pseudoType === "highlight" /* Protocol.DOM.PseudoType.Highlight */) {
                this.buildSplitCustomHighlightCascades(rules, this.#nodeInternal, false /* #isInherited */, customHighlightPseudoCascades);
            }
            else {
                for (let j = rules.length - 1; j >= 0; --j) {
                    const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[j].rule);
                    pseudoStyles.push(pseudoRule.style);
                    const nodeForStyle = cssMetadata().isHighlightPseudoType(entryPayload.pseudoType) ? this.#nodeInternal : pseudoElement;
                    this.#nodeForStyleInternal.set(pseudoRule.style, nodeForStyle);
                    if (nodeForStyle) {
                        this.addMatchingSelectors(nodeForStyle, pseudoRule, rules[j].matchingSelectors);
                    }
                }
                const isHighlightPseudoCascade = cssMetadata().isHighlightPseudoType(entryPayload.pseudoType);
                const nodeCascade = new NodeCascade(this, pseudoStyles, false /* #isInherited */, isHighlightPseudoCascade /* #isHighlightPseudoCascade*/);
                pseudoCascades.set(entryPayload.pseudoType, [nodeCascade]);
            }
        }
        if (inheritedPseudoPayload) {
            let parentNode = this.#nodeInternal.parentNode;
            for (let i = 0; parentNode && i < inheritedPseudoPayload.length; ++i) {
                const inheritedPseudoMatches = inheritedPseudoPayload[i].pseudoElements;
                for (let j = 0; j < inheritedPseudoMatches.length; ++j) {
                    const inheritedEntryPayload = inheritedPseudoMatches[j];
                    const rules = inheritedEntryPayload.matches || [];
                    if (inheritedEntryPayload.pseudoType === "highlight" /* Protocol.DOM.PseudoType.Highlight */) {
                        this.buildSplitCustomHighlightCascades(rules, parentNode, true /* #isInherited */, customHighlightPseudoCascades);
                    }
                    else {
                        const pseudoStyles = [];
                        for (let k = rules.length - 1; k >= 0; --k) {
                            const pseudoRule = new CSSStyleRule(this.#cssModelInternal, rules[k].rule);
                            pseudoStyles.push(pseudoRule.style);
                            this.#nodeForStyleInternal.set(pseudoRule.style, parentNode);
                            this.#inheritedStyles.add(pseudoRule.style);
                            this.addMatchingSelectors(parentNode, pseudoRule, rules[k].matchingSelectors);
                        }
                        const isHighlightPseudoCascade = cssMetadata().isHighlightPseudoType(inheritedEntryPayload.pseudoType);
                        const nodeCascade = new NodeCascade(this, pseudoStyles, true /* #isInherited */, isHighlightPseudoCascade /* #isHighlightPseudoCascade*/);
                        const cascadeListForPseudoType = pseudoCascades.get(inheritedEntryPayload.pseudoType);
                        if (cascadeListForPseudoType) {
                            cascadeListForPseudoType.push(nodeCascade);
                        }
                        else {
                            pseudoCascades.set(inheritedEntryPayload.pseudoType, [nodeCascade]);
                        }
                    }
                }
                parentNode = parentNode.parentNode;
            }
        }
        // Now that we've built the arrays of NodeCascades for each pseudo type, convert them into
        // DOMInheritanceCascades.
        for (const [pseudoType, nodeCascade] of pseudoCascades.entries()) {
            pseudoInheritanceCascades.set(pseudoType, new DOMInheritanceCascade(nodeCascade, this.#registeredProperties));
        }
        for (const [highlightName, nodeCascade] of customHighlightPseudoCascades.entries()) {
            customHighlightPseudoInheritanceCascades.set(highlightName, new DOMInheritanceCascade(nodeCascade, this.#registeredProperties));
        }
        return [pseudoInheritanceCascades, customHighlightPseudoInheritanceCascades];
    }
    addMatchingSelectors(node, rule, matchingSelectorIndices) {
        for (const matchingSelectorIndex of matchingSelectorIndices) {
            const selector = rule.selectors[matchingSelectorIndex];
            if (selector) {
                this.setSelectorMatches(node, selector.text, true);
            }
        }
    }
    node() {
        return this.#nodeInternal;
    }
    cssModel() {
        return this.#cssModelInternal;
    }
    hasMatchingSelectors(rule) {
        return (rule.selectors.length === 0 || this.getMatchingSelectors(rule).length > 0) && queryMatches(rule.style);
    }
    getParentLayoutNodeId() {
        return this.#parentLayoutNodeId;
    }
    getMatchingSelectors(rule) {
        const node = this.nodeForStyle(rule.style);
        if (!node || typeof node.id !== 'number') {
            return [];
        }
        const map = this.#matchingSelectors.get(node.id);
        if (!map) {
            return [];
        }
        const result = [];
        for (let i = 0; i < rule.selectors.length; ++i) {
            if (map.get(rule.selectors[i].text)) {
                result.push(i);
            }
        }
        return result;
    }
    async recomputeMatchingSelectors(rule) {
        const node = this.nodeForStyle(rule.style);
        if (!node) {
            return;
        }
        const promises = [];
        for (const selector of rule.selectors) {
            promises.push(querySelector.call(this, node, selector.text));
        }
        await Promise.all(promises);
        async function querySelector(node, selectorText) {
            const ownerDocument = node.ownerDocument;
            if (!ownerDocument) {
                return;
            }
            // We assume that "matching" property does not ever change during the
            // MatchedStyleResult's lifetime.
            if (typeof node.id === 'number') {
                const map = this.#matchingSelectors.get(node.id);
                if (map && map.has(selectorText)) {
                    return;
                }
            }
            if (typeof ownerDocument.id !== 'number') {
                return;
            }
            const matchingNodeIds = await this.#nodeInternal.domModel().querySelectorAll(ownerDocument.id, selectorText);
            if (matchingNodeIds) {
                if (typeof node.id === 'number') {
                    this.setSelectorMatches(node, selectorText, matchingNodeIds.indexOf(node.id) !== -1);
                }
                else {
                    this.setSelectorMatches(node, selectorText, false);
                }
            }
        }
    }
    addNewRule(rule, node) {
        this.#addedStyles.set(rule.style, node);
        return this.recomputeMatchingSelectors(rule);
    }
    setSelectorMatches(node, selectorText, value) {
        if (typeof node.id !== 'number') {
            return;
        }
        let map = this.#matchingSelectors.get(node.id);
        if (!map) {
            map = new Map();
            this.#matchingSelectors.set(node.id, map);
        }
        map.set(selectorText, value);
    }
    nodeStyles() {
        Platform.assertNotNullOrUndefined(this.#mainDOMCascade);
        return this.#mainDOMCascade.styles();
    }
    registeredProperties() {
        return this.#registeredProperties;
    }
    getRegisteredProperty(name) {
        return this.#registeredPropertyMap.get(name);
    }
    fontPaletteValuesRule() {
        return this.#fontPaletteValuesRule;
    }
    keyframes() {
        return this.#keyframesInternal;
    }
    positionFallbackRules() {
        return this.#positionFallbackRules;
    }
    positionTryRules() {
        return this.#positionTryRules;
    }
    pseudoStyles(pseudoType) {
        Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
        const domCascade = this.#pseudoDOMCascades.get(pseudoType);
        return domCascade ? domCascade.styles() : [];
    }
    pseudoTypes() {
        Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
        return new Set(this.#pseudoDOMCascades.keys());
    }
    customHighlightPseudoStyles(highlightName) {
        Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
        const domCascade = this.#customHighlightPseudoDOMCascades.get(highlightName);
        return domCascade ? domCascade.styles() : [];
    }
    customHighlightPseudoNames() {
        Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
        return new Set(this.#customHighlightPseudoDOMCascades.keys());
    }
    nodeForStyle(style) {
        return this.#addedStyles.get(style) || this.#nodeForStyleInternal.get(style) || null;
    }
    availableCSSVariables(style) {
        const domCascade = this.#styleToDOMCascade.get(style) || null;
        return domCascade ? domCascade.findAvailableCSSVariables(style) : [];
    }
    computeCSSVariable(style, variableName) {
        const domCascade = this.#styleToDOMCascade.get(style) || null;
        return domCascade ? domCascade.computeCSSVariable(style, variableName) : null;
    }
    isInherited(style) {
        return this.#inheritedStyles.has(style);
    }
    propertyState(property) {
        const domCascade = this.#styleToDOMCascade.get(property.ownerStyle);
        return domCascade ? domCascade.propertyState(property) : null;
    }
    resetActiveProperties() {
        Platform.assertNotNullOrUndefined(this.#mainDOMCascade);
        Platform.assertNotNullOrUndefined(this.#pseudoDOMCascades);
        Platform.assertNotNullOrUndefined(this.#customHighlightPseudoDOMCascades);
        this.#mainDOMCascade.reset();
        for (const domCascade of this.#pseudoDOMCascades.values()) {
            domCascade.reset();
        }
        for (const domCascade of this.#customHighlightPseudoDOMCascades.values()) {
            domCascade.reset();
        }
    }
}
class NodeCascade {
    #matchedStyles;
    styles;
    #isInherited;
    #isHighlightPseudoCascade;
    propertiesState;
    activeProperties;
    constructor(matchedStyles, styles, isInherited, isHighlightPseudoCascade = false) {
        this.#matchedStyles = matchedStyles;
        this.styles = styles;
        this.#isInherited = isInherited;
        this.#isHighlightPseudoCascade = isHighlightPseudoCascade;
        this.propertiesState = new Map();
        this.activeProperties = new Map();
    }
    computeActiveProperties() {
        this.propertiesState.clear();
        this.activeProperties.clear();
        for (let i = this.styles.length - 1; i >= 0; i--) {
            const style = this.styles[i];
            const rule = style.parentRule;
            // Compute cascade for CSSStyleRules only.
            if (rule && !(rule instanceof CSSStyleRule)) {
                continue;
            }
            if (rule && !this.#matchedStyles.hasMatchingSelectors(rule)) {
                continue;
            }
            for (const property of style.allProperties()) {
                // Do not pick non-inherited properties from inherited styles.
                const metadata = cssMetadata();
                // All properties are inherited for highlight pseudos.
                if (this.#isInherited && !this.#isHighlightPseudoCascade && !metadata.isPropertyInherited(property.name)) {
                    continue;
                }
                // When a property does not have a range in an otherwise ranged CSSStyleDeclaration,
                // we consider it as a non-leading property (see computeLeadingProperties()), and most
                // of them are computed longhands. We exclude these from activeProperties calculation,
                // and use parsed longhands instead (see below).
                if (style.range && !property.range) {
                    continue;
                }
                if (!property.activeInStyle()) {
                    this.propertiesState.set(property, "Overloaded" /* PropertyState.Overloaded */);
                    continue;
                }
                // If the custom property was registered with `inherits: false;`, inherited properties are invalid.
                if (this.#isInherited) {
                    const registration = this.#matchedStyles.getRegisteredProperty(property.name);
                    if (registration && !registration.inherits()) {
                        this.propertiesState.set(property, "Overloaded" /* PropertyState.Overloaded */);
                        continue;
                    }
                }
                const canonicalName = metadata.canonicalPropertyName(property.name);
                this.updatePropertyState(property, canonicalName);
                for (const longhand of property.getLonghandProperties()) {
                    if (metadata.isCSSPropertyName(longhand.name)) {
                        this.updatePropertyState(longhand, longhand.name);
                    }
                }
            }
        }
    }
    updatePropertyState(propertyWithHigherSpecificity, canonicalName) {
        const activeProperty = this.activeProperties.get(canonicalName);
        if (activeProperty?.important && !propertyWithHigherSpecificity.important) {
            this.propertiesState.set(propertyWithHigherSpecificity, "Overloaded" /* PropertyState.Overloaded */);
            return;
        }
        if (activeProperty) {
            this.propertiesState.set(activeProperty, "Overloaded" /* PropertyState.Overloaded */);
        }
        this.propertiesState.set(propertyWithHigherSpecificity, "Active" /* PropertyState.Active */);
        this.activeProperties.set(canonicalName, propertyWithHigherSpecificity);
    }
}
class DOMInheritanceCascade {
    #nodeCascades;
    #propertiesState;
    #availableCSSVariables;
    #computedCSSVariables;
    #initialized;
    #styleToNodeCascade;
    #registeredProperties;
    constructor(nodeCascades, registeredProperties) {
        this.#nodeCascades = nodeCascades;
        this.#propertiesState = new Map();
        this.#availableCSSVariables = new Map();
        this.#computedCSSVariables = new Map();
        this.#initialized = false;
        this.#registeredProperties = registeredProperties;
        this.#styleToNodeCascade = new Map();
        for (const nodeCascade of nodeCascades) {
            for (const style of nodeCascade.styles) {
                this.#styleToNodeCascade.set(style, nodeCascade);
            }
        }
    }
    findAvailableCSSVariables(style) {
        const nodeCascade = this.#styleToNodeCascade.get(style);
        if (!nodeCascade) {
            return [];
        }
        this.ensureInitialized();
        const availableCSSVariables = this.#availableCSSVariables.get(nodeCascade);
        if (!availableCSSVariables) {
            return [];
        }
        return Array.from(availableCSSVariables.keys());
    }
    computeCSSVariable(style, variableName) {
        const nodeCascade = this.#styleToNodeCascade.get(style);
        if (!nodeCascade) {
            return null;
        }
        this.ensureInitialized();
        const availableCSSVariables = this.#availableCSSVariables.get(nodeCascade);
        const computedCSSVariables = this.#computedCSSVariables.get(nodeCascade);
        if (!availableCSSVariables || !computedCSSVariables) {
            return null;
        }
        return this.innerComputeCSSVariable(availableCSSVariables, computedCSSVariables, variableName);
    }
    innerComputeCSSVariable(availableCSSVariables, computedCSSVariables, variableName) {
        if (!availableCSSVariables.has(variableName)) {
            return null;
        }
        if (computedCSSVariables.has(variableName)) {
            return computedCSSVariables.get(variableName) || null;
        }
        // Set dummy value to avoid infinite recursion.
        computedCSSVariables.set(variableName, null);
        const definedValue = availableCSSVariables.get(variableName);
        if (definedValue === undefined || definedValue === null) {
            return null;
        }
        const ast = PropertyParser.tokenizeDeclaration(`--${variableName}`, definedValue.value);
        if (!ast) {
            return null;
        }
        const matching = PropertyParser.BottomUpTreeMatching.walk(ast, [new PropertyParser.VariableMatcher((match) => {
                const parentStyle = 'ownerStyle' in definedValue.declaration ? definedValue.declaration.ownerStyle :
                    definedValue.declaration.style();
                const cssVariableValue = this.computeCSSVariable(parentStyle, match.name);
                // Variable reference is resolved, so return it.
                if (cssVariableValue?.value) {
                    return cssVariableValue?.value;
                }
                // Variable reference is not resolved, use the fallback.
                if (match.fallback.length === 0 ||
                    match.matching.hasUnresolvedVarsRange(match.fallback[0], match.fallback[match.fallback.length - 1])) {
                    return null;
                }
                return match.matching.getComputedTextRange(match.fallback[0], match.fallback[match.fallback.length - 1]);
            })]);
        const decl = PropertyParser.ASTUtils.siblings(PropertyParser.ASTUtils.declValue(matching.ast.tree));
        if (matching.hasUnresolvedVarsRange(decl[0], decl[decl.length - 1])) {
            return null;
        }
        const computedText = matching.getComputedTextRange(decl[0], decl[decl.length - 1]);
        const cssVariableValue = { value: computedText, declaration: definedValue.declaration };
        computedCSSVariables.set(variableName, cssVariableValue);
        return cssVariableValue;
    }
    styles() {
        return Array.from(this.#styleToNodeCascade.keys());
    }
    propertyState(property) {
        this.ensureInitialized();
        return this.#propertiesState.get(property) || null;
    }
    reset() {
        this.#initialized = false;
        this.#propertiesState.clear();
        this.#availableCSSVariables.clear();
        this.#computedCSSVariables.clear();
    }
    ensureInitialized() {
        if (this.#initialized) {
            return;
        }
        this.#initialized = true;
        const activeProperties = new Map();
        for (const nodeCascade of this.#nodeCascades) {
            nodeCascade.computeActiveProperties();
            for (const [property, state] of nodeCascade.propertiesState) {
                if (state === "Overloaded" /* PropertyState.Overloaded */) {
                    this.#propertiesState.set(property, "Overloaded" /* PropertyState.Overloaded */);
                    continue;
                }
                const canonicalName = cssMetadata().canonicalPropertyName(property.name);
                if (activeProperties.has(canonicalName)) {
                    this.#propertiesState.set(property, "Overloaded" /* PropertyState.Overloaded */);
                    continue;
                }
                activeProperties.set(canonicalName, property);
                this.#propertiesState.set(property, "Active" /* PropertyState.Active */);
            }
        }
        // If every longhand of the shorthand is not active, then the shorthand is not active too.
        for (const [canonicalName, shorthandProperty] of activeProperties) {
            const shorthandStyle = shorthandProperty.ownerStyle;
            const longhands = shorthandProperty.getLonghandProperties();
            if (!longhands.length) {
                continue;
            }
            let hasActiveLonghands = false;
            for (const longhand of longhands) {
                const longhandCanonicalName = cssMetadata().canonicalPropertyName(longhand.name);
                const longhandActiveProperty = activeProperties.get(longhandCanonicalName);
                if (!longhandActiveProperty) {
                    continue;
                }
                if (longhandActiveProperty.ownerStyle === shorthandStyle) {
                    hasActiveLonghands = true;
                    break;
                }
            }
            if (hasActiveLonghands) {
                continue;
            }
            activeProperties.delete(canonicalName);
            this.#propertiesState.set(shorthandProperty, "Overloaded" /* PropertyState.Overloaded */);
        }
        // Work inheritance chain backwards to compute visible CSS Variables.
        const accumulatedCSSVariables = new Map();
        for (const rule of this.#registeredProperties) {
            const initialValue = rule.initialValue();
            accumulatedCSSVariables.set(rule.propertyName(), initialValue ? { value: initialValue, declaration: rule } : null);
        }
        for (let i = this.#nodeCascades.length - 1; i >= 0; --i) {
            const nodeCascade = this.#nodeCascades[i];
            const variableNames = [];
            for (const entry of nodeCascade.activeProperties.entries()) {
                const propertyName = entry[0];
                const property = entry[1];
                if (propertyName.startsWith('--')) {
                    accumulatedCSSVariables.set(propertyName, { value: property.value, declaration: property });
                    variableNames.push(propertyName);
                }
            }
            const availableCSSVariablesMap = new Map(accumulatedCSSVariables);
            const computedVariablesMap = new Map();
            this.#availableCSSVariables.set(nodeCascade, availableCSSVariablesMap);
            this.#computedCSSVariables.set(nodeCascade, computedVariablesMap);
            for (const variableName of variableNames) {
                const prevValue = accumulatedCSSVariables.get(variableName);
                accumulatedCSSVariables.delete(variableName);
                const computedValue = this.innerComputeCSSVariable(availableCSSVariablesMap, computedVariablesMap, variableName);
                if (prevValue && computedValue?.value === prevValue.value) {
                    computedValue.declaration = prevValue.declaration;
                }
                accumulatedCSSVariables.set(variableName, computedValue);
            }
        }
    }
}
//# sourceMappingURL=CSSMatchedStyles.js.map