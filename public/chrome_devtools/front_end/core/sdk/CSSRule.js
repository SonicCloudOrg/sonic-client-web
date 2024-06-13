// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Platform from '../platform/platform.js';
import { CSSContainerQuery } from './CSSContainerQuery.js';
import { CSSLayer } from './CSSLayer.js';
import { CSSMedia } from './CSSMedia.js';
import { CSSScope } from './CSSScope.js';
import { CSSStyleDeclaration, Type } from './CSSStyleDeclaration.js';
import { CSSSupports } from './CSSSupports.js';
export class CSSRule {
    cssModelInternal;
    styleSheetId;
    sourceURL;
    origin;
    style;
    constructor(cssModel, payload) {
        this.cssModelInternal = cssModel;
        this.styleSheetId = payload.styleSheetId;
        if (this.styleSheetId) {
            const styleSheetHeader = this.getStyleSheetHeader(this.styleSheetId);
            this.sourceURL = styleSheetHeader.sourceURL;
        }
        this.origin = payload.origin;
        this.style = new CSSStyleDeclaration(this.cssModelInternal, this, payload.style, Type.Regular);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId) {
            return;
        }
        this.style.rebase(edit);
    }
    resourceURL() {
        if (!this.styleSheetId) {
            return Platform.DevToolsPath.EmptyUrlString;
        }
        const styleSheetHeader = this.getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.resourceURL();
    }
    isUserAgent() {
        return this.origin === "user-agent" /* Protocol.CSS.StyleSheetOrigin.UserAgent */;
    }
    isInjected() {
        return this.origin === "injected" /* Protocol.CSS.StyleSheetOrigin.Injected */;
    }
    isViaInspector() {
        return this.origin === "inspector" /* Protocol.CSS.StyleSheetOrigin.Inspector */;
    }
    isRegular() {
        return this.origin === "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
    }
    isKeyframeRule() {
        return false;
    }
    cssModel() {
        return this.cssModelInternal;
    }
    getStyleSheetHeader(styleSheetId) {
        const styleSheetHeader = this.cssModelInternal.styleSheetHeaderForId(styleSheetId);
        console.assert(styleSheetHeader !== null);
        return styleSheetHeader;
    }
}
class CSSValue {
    text;
    range;
    specificity;
    constructor(payload) {
        this.text = payload.text;
        if (payload.range) {
            this.range = TextUtils.TextRange.TextRange.fromObject(payload.range);
        }
        if (payload.specificity) {
            this.specificity = payload.specificity;
        }
    }
    rebase(edit) {
        if (!this.range) {
            return;
        }
        this.range = this.range.rebaseAfterTextEdit(edit.oldRange, edit.newRange);
    }
}
export class CSSStyleRule extends CSSRule {
    selectors;
    nestingSelectors;
    media;
    containerQueries;
    supports;
    scopes;
    layers;
    ruleTypes;
    wasUsed;
    constructor(cssModel, payload, wasUsed) {
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this.reinitializeSelectors(payload.selectorList);
        this.nestingSelectors = payload.nestingSelectors;
        this.media = payload.media ? CSSMedia.parseMediaArrayPayload(cssModel, payload.media) : [];
        this.containerQueries = payload.containerQueries ?
            CSSContainerQuery.parseContainerQueriesPayload(cssModel, payload.containerQueries) :
            [];
        this.scopes = payload.scopes ? CSSScope.parseScopesPayload(cssModel, payload.scopes) : [];
        this.supports = payload.supports ? CSSSupports.parseSupportsPayload(cssModel, payload.supports) : [];
        this.layers = payload.layers ? CSSLayer.parseLayerPayload(cssModel, payload.layers) : [];
        this.ruleTypes = payload.ruleTypes || [];
        this.wasUsed = wasUsed || false;
    }
    static createDummyRule(cssModel, selectorText) {
        const dummyPayload = {
            selectorList: {
                text: '',
                selectors: [{ text: selectorText, value: undefined }],
            },
            style: {
                styleSheetId: '0',
                range: new TextUtils.TextRange.TextRange(0, 0, 0, 0),
                shorthandEntries: [],
                cssProperties: [],
            },
            origin: "inspector" /* Protocol.CSS.StyleSheetOrigin.Inspector */,
        };
        return new CSSStyleRule(cssModel, dummyPayload);
    }
    reinitializeSelectors(selectorList) {
        this.selectors = [];
        for (let i = 0; i < selectorList.selectors.length; ++i) {
            this.selectors.push(new CSSValue(selectorList.selectors[i]));
        }
    }
    setSelectorText(newSelector) {
        const styleSheetId = this.styleSheetId;
        if (!styleSheetId) {
            throw 'No rule stylesheet id';
        }
        const range = this.selectorRange();
        if (!range) {
            throw 'Rule selector is not editable';
        }
        return this.cssModelInternal.setSelectorText(styleSheetId, range, newSelector);
    }
    selectorText() {
        return this.selectors.map(selector => selector.text).join(', ');
    }
    selectorRange() {
        // Nested group rules might not contain a selector.
        // https://www.w3.org/TR/css-nesting-1/#conditionals
        if (this.selectors.length === 0) {
            return null;
        }
        const firstRange = this.selectors[0].range;
        const lastRange = this.selectors[this.selectors.length - 1].range;
        if (!firstRange || !lastRange) {
            return null;
        }
        return new TextUtils.TextRange.TextRange(firstRange.startLine, firstRange.startColumn, lastRange.endLine, lastRange.endColumn);
    }
    lineNumberInSource(selectorIndex) {
        const selector = this.selectors[selectorIndex];
        if (!selector || !selector.range || !this.styleSheetId) {
            return 0;
        }
        const styleSheetHeader = this.getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.lineNumberInSource(selector.range.startLine);
    }
    columnNumberInSource(selectorIndex) {
        const selector = this.selectors[selectorIndex];
        if (!selector || !selector.range || !this.styleSheetId) {
            return undefined;
        }
        const styleSheetHeader = this.getStyleSheetHeader(this.styleSheetId);
        return styleSheetHeader.columnNumberInSource(selector.range.startLine, selector.range.startColumn);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId) {
            return;
        }
        const range = this.selectorRange();
        if (range && range.equal(edit.oldRange)) {
            this.reinitializeSelectors(edit.payload);
        }
        else {
            for (let i = 0; i < this.selectors.length; ++i) {
                this.selectors[i].rebase(edit);
            }
        }
        this.media.forEach(media => media.rebase(edit));
        this.containerQueries.forEach(cq => cq.rebase(edit));
        this.scopes.forEach(scope => scope.rebase(edit));
        this.supports.forEach(supports => supports.rebase(edit));
        super.rebase(edit);
    }
}
export class CSSPropertyRule extends CSSRule {
    #name;
    constructor(cssModel, payload) {
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this.#name = new CSSValue(payload.propertyName);
    }
    propertyName() {
        return this.#name;
    }
    initialValue() {
        return this.style.hasActiveProperty('initial-value') ? this.style.getPropertyValue('initial-value') : null;
    }
    syntax() {
        return this.style.getPropertyValue('syntax');
    }
    inherits() {
        return this.style.getPropertyValue('inherits') === 'true';
    }
    setPropertyName(newPropertyName) {
        const styleSheetId = this.styleSheetId;
        if (!styleSheetId) {
            throw new Error('No rule stylesheet id');
        }
        const range = this.#name.range;
        if (!range) {
            throw new Error('Property name is not editable');
        }
        return this.cssModelInternal.setPropertyRulePropertyName(styleSheetId, range, newPropertyName);
    }
}
export class CSSFontPaletteValuesRule extends CSSRule {
    #paletteName;
    constructor(cssModel, payload) {
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this.#paletteName = new CSSValue(payload.fontPaletteName);
    }
    name() {
        return this.#paletteName;
    }
}
export class CSSKeyframesRule {
    #animationName;
    #keyframesInternal;
    constructor(cssModel, payload) {
        this.#animationName = new CSSValue(payload.animationName);
        this.#keyframesInternal = payload.keyframes.map(keyframeRule => new CSSKeyframeRule(cssModel, keyframeRule));
    }
    name() {
        return this.#animationName;
    }
    keyframes() {
        return this.#keyframesInternal;
    }
}
export class CSSKeyframeRule extends CSSRule {
    #keyText;
    constructor(cssModel, payload) {
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this.reinitializeKey(payload.keyText);
    }
    key() {
        return this.#keyText;
    }
    reinitializeKey(payload) {
        this.#keyText = new CSSValue(payload);
    }
    rebase(edit) {
        if (this.styleSheetId !== edit.styleSheetId || !this.#keyText.range) {
            return;
        }
        if (edit.oldRange.equal(this.#keyText.range)) {
            this.reinitializeKey(edit.payload);
        }
        else {
            this.#keyText.rebase(edit);
        }
        super.rebase(edit);
    }
    isKeyframeRule() {
        return true;
    }
    setKeyText(newKeyText) {
        const styleSheetId = this.styleSheetId;
        if (!styleSheetId) {
            throw 'No rule stylesheet id';
        }
        const range = this.#keyText.range;
        if (!range) {
            throw 'Keyframe key is not editable';
        }
        return this.cssModelInternal.setKeyframeKey(styleSheetId, range, newKeyText);
    }
}
export class CSSPositionFallbackRule {
    #name;
    #tryRules;
    constructor(cssModel, payload) {
        this.#name = new CSSValue(payload.name);
        this.#tryRules = payload.tryRules.map(tryRule => new CSSRule(cssModel, { origin: tryRule.origin, style: tryRule.style, styleSheetId: tryRule.styleSheetId }));
    }
    name() {
        return this.#name;
    }
    tryRules() {
        return this.#tryRules;
    }
}
export class CSSPositionTryRule extends CSSRule {
    #name;
    constructor(cssModel, payload) {
        super(cssModel, { origin: payload.origin, style: payload.style, styleSheetId: payload.styleSheetId });
        this.#name = new CSSValue(payload.name);
    }
    name() {
        return this.#name;
    }
}
//# sourceMappingURL=CSSRule.js.map