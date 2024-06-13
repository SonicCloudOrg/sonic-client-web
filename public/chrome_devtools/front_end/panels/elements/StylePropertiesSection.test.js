// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as Elements from './elements.js';
describe('StylePropertiesSection', () => {
    it('contains specificity information', async () => {
        const specificity = { a: 0, b: 1, c: 0 };
        const selectorElement = Elements.StylePropertiesSection.StylePropertiesSection.renderSelectors([{ text: '.child', specificity }], [true], new WeakMap());
        assert.deepEqual(selectorElement.textContent, '.child');
        assert.deepEqual(Elements.StylePropertiesSection.StylePropertiesSection.getSpecificityStoredForNodeElement(selectorElement.firstChild), specificity);
    });
    it('renders selectors correctly', async () => {
        let selectorElement = Elements.StylePropertiesSection.StylePropertiesSection.renderSelectors([{ text: '.child', specificity: { a: 0, b: 2, c: 0 } }, { text: '.item', specificity: { a: 0, b: 2, c: 0 } }], [true], new WeakMap());
        assert.deepEqual(selectorElement.textContent, '.child, .item');
        selectorElement = Elements.StylePropertiesSection.StylePropertiesSection.renderSelectors([{ text: '.child', specificity: { a: 0, b: 2, c: 0 } }, { text: '& .item', specificity: { a: 0, b: 2, c: 0 } }], [true], new WeakMap());
        assert.deepEqual(selectorElement.textContent, '.child, & .item');
        selectorElement = Elements.StylePropertiesSection.StylePropertiesSection.renderSelectors([{ text: '&.child', specificity: { a: 0, b: 2, c: 0 } }, { text: '& .item', specificity: { a: 0, b: 2, c: 0 } }], [true], new WeakMap());
        assert.deepEqual(selectorElement.textContent, '&.child, & .item');
    });
});
function setUpStyles(cssModel, origin, styleSheetId, header, payload) {
    cssModel.styleSheetAdded({
        styleSheetId,
        frameId: '',
        sourceURL: '',
        origin,
        title: '',
        disabled: false,
        isInline: false,
        isMutable: false,
        isConstructed: false,
        startLine: 0,
        startColumn: 0,
        length: 0,
        endLine: 0,
        endColumn: 0,
        ...header,
    });
    return SDK.CSSMatchedStyles.CSSMatchedStyles.create({
        cssModel,
        node: sinon.createStubInstance(SDK.DOMModel.DOMNode),
        inlinePayload: null,
        attributesPayload: null,
        matchedPayload: [],
        pseudoPayload: [],
        inheritedPayload: [],
        inheritedPseudoPayload: [],
        animationsPayload: [],
        parentLayoutNodeId: undefined,
        positionFallbackRules: [],
        positionTryRules: [],
        propertyRules: [],
        cssPropertyRegistrations: [],
        fontPaletteValuesRule: undefined,
        ...payload,
    });
}
describeWithMockConnection('StylesPropertySection', () => {
    it('displays the proper sourceURL origin for constructed stylesheets', async () => {
        const cssModel = createTarget().model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const origin = "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
        const styleSheetId = '0';
        const range = { startLine: 0, endLine: 1, startColumn: 0, endColumn: 0 };
        const header = { sourceURL: 'constructed.css', isMutable: true, isConstructed: true, hasSourceURL: true, length: 1, ...range };
        const matchedPayload = [{
                rule: {
                    selectorList: { selectors: [{ text: 'div' }], text: 'div' },
                    origin,
                    styleSheetId,
                    style: { cssProperties: [{ name: 'color', value: 'red' }], shorthandEntries: [], range },
                },
                matchingSelectors: [0],
            }];
        const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, header, { matchedPayload });
        const rule = matchedStyles.nodeStyles()[0].parentRule;
        const linkifier = sinon.createStubInstance(Components.Linkifier.Linkifier);
        const originNode = Elements.StylePropertiesSection.StylePropertiesSection.createRuleOriginNode(matchedStyles, linkifier, rule);
        assert.strictEqual(originNode.textContent, '<style>');
        assert.isTrue(linkifier.linkifyCSSLocation.calledOnce);
        assert.strictEqual(linkifier.linkifyCSSLocation.args[0][0].styleSheetId, styleSheetId);
        assert.strictEqual(linkifier.linkifyCSSLocation.args[0][0].url, 'constructed.css');
    });
    it('displays the proper sourceMappingURL origin for constructed stylesheets', async () => {
        const cssModel = createTarget().model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const origin = "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
        const styleSheetId = '0';
        const range = { startLine: 0, endLine: 1, startColumn: 0, endColumn: 0 };
        const header = {
            sourceMapURL: 'http://example.com/constructed.css.map',
            isMutable: true,
            isConstructed: true,
            length: 1,
            ...range,
        };
        const matchedPayload = [{
                rule: {
                    selectorList: { selectors: [{ text: 'div' }], text: 'div' },
                    origin,
                    styleSheetId,
                    style: { cssProperties: [{ name: 'color', value: 'red' }], shorthandEntries: [], range },
                },
                matchingSelectors: [0],
            }];
        sinon.stub(SDK.PageResourceLoader.PageResourceLoader.instance(), 'loadResource').callsFake(url => Promise.resolve({
            content: url === header.sourceMapURL ? '{"sources": []}' : '',
        }));
        const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, header, { matchedPayload });
        const styleSheetHeader = cssModel.styleSheetHeaderForId(styleSheetId);
        assert.exists(styleSheetHeader);
        const sourceMap = await cssModel.sourceMapManager().sourceMapForClientPromise(styleSheetHeader);
        assert.exists(sourceMap);
        const rule = matchedStyles.nodeStyles()[0].parentRule;
        const linkifier = sinon.createStubInstance(Components.Linkifier.Linkifier);
        const originNode = Elements.StylePropertiesSection.StylePropertiesSection.createRuleOriginNode(matchedStyles, linkifier, rule);
        assert.strictEqual(originNode.textContent, 'constructed stylesheet');
        assert.isTrue(linkifier.linkifyCSSLocation.calledOnce);
        // Since we already asserted that a sourcemap exists for our header, it's sufficient to check that
        // linkifyCSSLocation has been called. Verifying that linkifyCSSLocation applies source mapping is out of scope
        // for this unit under test.
        assert.strictEqual(linkifier.linkifyCSSLocation.args[0][0].styleSheetId, styleSheetId);
        assert.strictEqual(linkifier.linkifyCSSLocation.args[0][0].url, '');
    });
    it('properly renders ancestor rules', async () => {
        Common.Settings.Settings.instance().moduleSetting('text-editor-indent').set('  ');
        const cssModel = createTarget().model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const stylesSidebarPane = Elements.StylesSidebarPane.StylesSidebarPane.instance({ forceNew: true });
        const origin = "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
        const styleSheetId = '0';
        const range = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 6 };
        {
            const matchedPayload = [{
                    rule: {
                        nestingSelectors: ['body', '& ul', 'div'],
                        ruleTypes: [
                            "StyleRule" /* Protocol.CSS.CSSRuleType.StyleRule */,
                            "StyleRule" /* Protocol.CSS.CSSRuleType.StyleRule */,
                            "StyleRule" /* Protocol.CSS.CSSRuleType.StyleRule */,
                        ],
                        selectorList: { selectors: [{ text: 'div' }], text: 'div' },
                        origin,
                        style: { cssProperties: [{ name: 'color', value: 'red' }], shorthandEntries: [] },
                    },
                    matchingSelectors: [0],
                }];
            const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, { ...range }, { matchedPayload });
            const declaration = matchedStyles.nodeStyles()[0];
            assert.exists(declaration);
            const section = new Elements.StylePropertiesSection.StylePropertiesSection(stylesSidebarPane, matchedStyles, declaration, 0, null, null);
            assert.strictEqual(section.element.textContent, 'div {  & ul {    body {      div {      }    }  }}');
        }
        {
            const matchedPayload = [{
                    rule: {
                        nestingSelectors: ['body', 'div'],
                        ruleTypes: [
                            "StyleRule" /* Protocol.CSS.CSSRuleType.StyleRule */,
                            "StyleRule" /* Protocol.CSS.CSSRuleType.StyleRule */,
                        ],
                        selectorList: { selectors: [], text: '' },
                        origin,
                        style: { cssProperties: [{ name: 'color', value: 'red' }], shorthandEntries: [] },
                    },
                    matchingSelectors: [0],
                }];
            const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, { ...range }, { matchedPayload });
            const declaration = matchedStyles.nodeStyles()[0];
            assert.exists(declaration);
            const section = new Elements.StylePropertiesSection.StylePropertiesSection(stylesSidebarPane, matchedStyles, declaration, 0, null, null);
            assert.strictEqual(section.element.textContent, 'div {  body {    }}');
        }
    });
    it('updates property rule property names', async () => {
        const cssModel = createTarget().model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const stylesSidebarPane = Elements.StylesSidebarPane.StylesSidebarPane.instance({ forceNew: true });
        const origin = "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
        const styleSheetId = '0';
        const range = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 6 };
        const propertyName = { text: '--prop', range };
        const propertyRuleStyle = {
            cssProperties: [
                { name: 'inherits', value: 'false' },
                { name: 'initial-value', value: 'red' },
                { name: 'syntax', value: '"<color>"' },
            ],
            shorthandEntries: [],
        };
        const propertyRules = [{
                propertyName,
                origin,
                style: propertyRuleStyle,
                styleSheetId,
            }];
        const matchedPayload = [{
                rule: {
                    selectorList: { selectors: [{ text: 'div' }], text: 'div' },
                    origin,
                    style: { cssProperties: [{ name: propertyName.text, value: 'red' }], shorthandEntries: [] },
                },
                matchingSelectors: [0],
            }];
        const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, { ...range }, { propertyRules, matchedPayload });
        function assertIsPropertyRule(rule) {
            assert.instanceOf(rule, SDK.CSSRule.CSSPropertyRule);
        }
        const declaration = matchedStyles.getRegisteredProperty(propertyName.text)?.style();
        assert.exists(declaration);
        const rule = declaration.parentRule;
        assertIsPropertyRule(rule);
        const section = new Elements.StylePropertiesSection.RegisteredPropertiesSection(stylesSidebarPane, matchedStyles, declaration, 0, propertyName.text, /* expandedByDefault=*/ true);
        const forceUpdateSpy = sinon.spy(stylesSidebarPane, 'forceUpdate');
        const setNameSpy = sinon.stub(cssModel, 'setPropertyRulePropertyName');
        setNameSpy.returns(Promise.resolve(true));
        await section.setHeaderText(rule, propertyName.text);
        assert.isTrue(forceUpdateSpy.calledAfter(setNameSpy));
        assert.isTrue(setNameSpy.calledOnceWithExactly(styleSheetId, sinon.match((r) => r.startLine === range.startLine &&
            r.startColumn === range.startColumn && r.endLine === range.endLine && r.endColumn === range.endColumn), propertyName.text));
    });
    it('renders braces correctly with a non-style-rule section', async () => {
        Common.Settings.Settings.instance().moduleSetting('text-editor-indent').set('  ');
        const cssModel = createTarget().model(SDK.CSSModel.CSSModel);
        assert.exists(cssModel);
        const stylesSidebarPane = Elements.StylesSidebarPane.StylesSidebarPane.instance({ forceNew: true });
        const origin = "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */;
        const styleSheetId = '0';
        const range = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 6 };
        const fontPaletteValuesRule = {
            styleSheetId,
            origin,
            style: {
                range,
                cssProperties: [],
                shorthandEntries: [],
            },
            fontPaletteName: {
                range,
                text: '--palette-name',
            },
        };
        const matchedStyles = await setUpStyles(cssModel, origin, styleSheetId, { ...range }, { fontPaletteValuesRule });
        const declaration = matchedStyles.fontPaletteValuesRule()?.style;
        assert.exists(declaration);
        const section = new Elements.StylePropertiesSection.FontPaletteValuesRuleSection(stylesSidebarPane, matchedStyles, declaration, 0);
        assert.strictEqual(section.element.textContent, '{}');
    });
});
//# sourceMappingURL=StylePropertiesSection.test.js.map