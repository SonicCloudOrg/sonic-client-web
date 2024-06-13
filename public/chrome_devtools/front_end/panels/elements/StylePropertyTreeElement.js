// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as ColorPicker from '../../ui/legacy/components/color_picker/color_picker.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { BezierPopoverIcon, ColorSwatchPopoverIcon, ShadowSwatchPopoverHelper, } from './ColorSwatchPopoverIcon.js';
import * as ElementsComponents from './components/components.js';
import { cssRuleValidatorsMap } from './CSSRuleValidator.js';
import { ElementsPanel } from './ElementsPanel.js';
import { AnchorFunctionMatcher, AngleMatch, AngleMatcher, BezierMatcher, ColorMatch, ColorMatcher, ColorMixMatch, ColorMixMatcher, FontMatcher, GridTemplateMatcher, LengthMatcher, LightDarkColorMatcher, LinearGradientMatcher, LinkableNameMatcher, PositionAnchorMatcher, ShadowMatcher, } from './PropertyMatchers.js';
import { Renderer, RenderingContext, StringRenderer, URLRenderer } from './PropertyRenderer.js';
import { StyleEditorWidget } from './StyleEditorWidget.js';
import { getCssDeclarationAsJavascriptProperty } from './StylePropertyUtils.js';
import { CSSPropertyPrompt, REGISTERED_PROPERTY_SECTION_NAME, StylesSidebarPane, } from './StylesSidebarPane.js';
const ASTUtils = SDK.CSSPropertyParser.ASTUtils;
const FlexboxEditor = ElementsComponents.StylePropertyEditor.FlexboxEditor;
const GridEditor = ElementsComponents.StylePropertyEditor.GridEditor;
export const activeHints = new WeakMap();
const UIStrings = {
    /**
     *@description Text in Color Swatch Popover Icon of the Elements panel
     */
    shiftClickToChangeColorFormat: 'Shift + Click to change color format.',
    /**
     *@description Swatch icon element title in Color Swatch Popover Icon of the Elements panel
     *@example {Shift + Click to change color format.} PH1
     */
    openColorPickerS: 'Open color picker. {PH1}',
    /**
     *@description Context menu item for style property in edit mode
     */
    togglePropertyAndContinueEditing: 'Toggle property and continue editing',
    /**
     *@description Context menu item for style property in edit mode
     */
    revealInSourcesPanel: 'Reveal in Sources panel',
    /**
     *@description A context menu item in Styles panel to copy CSS declaration
     */
    copyDeclaration: 'Copy declaration',
    /**
     *@description A context menu item in Styles panel to copy CSS property
     */
    copyProperty: 'Copy property',
    /**
     *@description A context menu item in the Watch Expressions Sidebar Pane of the Sources panel and Network pane request.
     */
    copyValue: 'Copy value',
    /**
     *@description A context menu item in Styles panel to copy CSS rule
     */
    copyRule: 'Copy rule',
    /**
     *@description A context menu item in Styles panel to copy all CSS declarations
     */
    copyAllDeclarations: 'Copy all declarations',
    /**
     *@description  A context menu item in Styles panel to copy all the CSS changes
     */
    copyAllCSSChanges: 'Copy all CSS changes',
    /**
     *@description A context menu item in Styles panel to view the computed CSS property value.
     */
    viewComputedValue: 'View computed value',
    /**
     * @description Title of the button that opens the flexbox editor in the Styles panel.
     */
    flexboxEditorButton: 'Open `flexbox` editor',
    /**
     * @description Title of the button that opens the CSS Grid editor in the Styles panel.
     */
    gridEditorButton: 'Open `grid` editor',
    /**
     *@description A context menu item in Styles panel to copy CSS declaration as JavaScript property.
     */
    copyCssDeclarationAsJs: 'Copy declaration as JS',
    /**
     *@description A context menu item in Styles panel to copy all declarations of CSS rule as JavaScript properties.
     */
    copyAllCssDeclarationsAsJs: 'Copy all declarations as JS',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/StylePropertyTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const parentMap = new WeakMap();
export class VariableRenderer {
    #treeElement;
    #style;
    constructor(treeElement, style) {
        this.#treeElement = treeElement;
        this.#style = style;
    }
    matcher() {
        return new SDK.CSSPropertyParser.VariableMatcher(this.computedText.bind(this));
    }
    resolveVariable(match) {
        return this.#matchedStyles.computeCSSVariable(this.#style, match.name);
    }
    fallbackValue(match) {
        if (match.fallback.length === 0 ||
            match.matching.hasUnresolvedVarsRange(match.fallback[0], match.fallback[match.fallback.length - 1])) {
            return null;
        }
        return match.matching.getComputedTextRange(match.fallback[0], match.fallback[match.fallback.length - 1]);
    }
    // clang-format off
    computedText(match) {
        return this.resolveVariable(match)?.value ?? this.fallbackValue(match);
    }
    // clang-format on
    render(match, context) {
        const renderedFallback = match.fallback.length > 0 ? Renderer.render(match.fallback, context) : undefined;
        const { declaration, value: variableValue } = this.resolveVariable(match) ?? {};
        const fromFallback = !variableValue;
        const computedValue = variableValue ?? this.fallbackValue(match);
        const varSwatch = new InlineEditor.LinkSwatch.CSSVarSwatch();
        varSwatch.data = {
            computedValue,
            variableName: match.name,
            fromFallback,
            fallbackText: match.fallback.map(n => context.ast.text(n)).join(' '),
            onLinkActivate: name => this.#handleVarDefinitionActivate(declaration ?? name),
        };
        if (renderedFallback?.nodes.length) {
            // When slotting someting into the fallback slot, also emit text children so that .textContent produces the
            // correct var value.
            varSwatch.appendChild(document.createTextNode(`var(${match.name}`));
            const span = varSwatch.appendChild(document.createElement('span'));
            span.appendChild(document.createTextNode(', '));
            span.slot = 'fallback';
            renderedFallback.nodes.forEach(n => span.appendChild(n));
            varSwatch.appendChild(document.createTextNode(')'));
        }
        else {
            UI.UIUtils.createTextChild(varSwatch, match.text);
        }
        if (varSwatch.link) {
            this.#pane.addPopover(varSwatch.link, {
                contents: () => this.#treeElement.getVariablePopoverContents(match.name, variableValue ?? null),
                jslogContext: 'elements.css-var',
            });
        }
        if (!computedValue || !Common.Color.parse(computedValue)) {
            return [varSwatch];
        }
        const colorSwatch = new ColorRenderer(this.#treeElement).renderColorSwatch(computedValue, varSwatch);
        context.addControl('color', colorSwatch);
        return [colorSwatch];
    }
    get #pane() {
        return this.#treeElement.parentPane();
    }
    get #matchedStyles() {
        return this.#treeElement.matchedStyles();
    }
    #handleVarDefinitionActivate(variable) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.CustomPropertyLinkClicked);
        Host.userMetrics.swatchActivated(0 /* Host.UserMetrics.SwatchType.VarLink */);
        if (variable instanceof SDK.CSSProperty.CSSProperty) {
            this.#pane.revealProperty(variable);
        }
        else if (variable instanceof SDK.CSSMatchedStyles.CSSRegisteredProperty) {
            this.#pane.jumpToProperty('initial-value', variable.propertyName(), REGISTERED_PROPERTY_SECTION_NAME);
        }
        else {
            this.#pane.jumpToProperty(variable) ||
                this.#pane.jumpToProperty('initial-value', variable, REGISTERED_PROPERTY_SECTION_NAME);
        }
    }
}
export class LinearGradientRenderer {
    matcher() {
        return new LinearGradientMatcher();
    }
    render(match, context) {
        const children = ASTUtils.children(match.node);
        const { nodes, cssControls } = Renderer.render(children, context);
        const angles = cssControls.get('angle');
        const angle = angles?.length === 1 ? angles[0] : null;
        if (angle instanceof InlineEditor.CSSAngle.CSSAngle) {
            angle.updateProperty(context.matchedResult.getComputedText(match.node));
            const args = ASTUtils.callArgs(match.node);
            const angleNode = args[0]?.find(node => context.matchedResult.getMatch(node) instanceof AngleMatch);
            const angleMatch = angleNode && context.matchedResult.getMatch(angleNode);
            if (angleMatch) {
                angle.addEventListener(InlineEditor.InlineEditorUtils.ValueChangedEvent.eventName, ev => {
                    angle.updateProperty(context.matchedResult.getComputedText(match.node, new Map([[angleMatch, ev.data.value]])));
                });
            }
        }
        return nodes;
    }
}
export class ColorRenderer {
    treeElement;
    constructor(treeElement) {
        this.treeElement = treeElement;
    }
    matcher() {
        return new ColorMatcher();
    }
    #getValueChild(match, context) {
        const valueChild = document.createElement('span');
        if (match.node.name === 'ColorLiteral' ||
            (match.node.name === 'ValueName' && Common.Color.Nicknames.has(match.text))) {
            valueChild.appendChild(document.createTextNode(match.text));
            return { valueChild };
        }
        const { cssControls } = Renderer.renderInto(ASTUtils.children(match.node), context, valueChild);
        return { valueChild, cssControls };
    }
    render(match, context) {
        const { valueChild, cssControls } = this.#getValueChild(match, context);
        let color = context.matchedResult.getComputedText(match.node);
        if (match.node.name === 'CallExpression' && color.match(/^[^)]*\(\W*from\W+/) &&
            !context.matchedResult.hasUnresolvedVars(match.node) && CSS.supports('color', color)) {
            const fakeSpan = document.body.appendChild(document.createElement('span'));
            fakeSpan.style.backgroundColor = color;
            color = window.getComputedStyle(fakeSpan).backgroundColor?.toString() || color;
            fakeSpan.remove();
        }
        const swatch = this.renderColorSwatch(color, valueChild);
        context.addControl('color', swatch);
        if (cssControls && match.node.name === 'CallExpression' &&
            context.ast.text(match.node.getChild('Callee')).match(/^(hsla?|hwba?)/)) {
            const [angle] = cssControls.get('angle') ?? [];
            if (angle instanceof InlineEditor.CSSAngle.CSSAngle) {
                angle.updateProperty(swatch.getColor()?.asString() ?? '');
                angle.addEventListener(InlineEditor.InlineEditorUtils.ValueChangedEvent.eventName, ev => {
                    const hue = Common.Color.parseHueNumeric(ev.data.value);
                    const color = swatch.getColor();
                    if (!hue || !color) {
                        return;
                    }
                    if (color.is("hsl" /* Common.Color.Format.HSL */) || color.is("hsla" /* Common.Color.Format.HSLA */)) {
                        swatch.renderColor(new Common.Color.HSL(hue, color.s, color.l, color.alpha));
                    }
                    else if (color.is("hwb" /* Common.Color.Format.HWB */) || color.is("hwba" /* Common.Color.Format.HWBA */)) {
                        swatch.renderColor(new Common.Color.HWB(hue, color.w, color.b, color.alpha));
                    }
                    angle.updateProperty(swatch.getColor()?.asString() ?? '');
                });
            }
        }
        return [swatch];
    }
    renderColorSwatch(text, valueChild) {
        const editable = this.treeElement.editable();
        const shiftClickMessage = i18nString(UIStrings.shiftClickToChangeColorFormat);
        const tooltip = editable ? i18nString(UIStrings.openColorPickerS, { PH1: shiftClickMessage }) : '';
        const swatch = new InlineEditor.ColorSwatch.ColorSwatch();
        swatch.setReadonly(!editable);
        swatch.renderColor(text, editable, tooltip);
        if (!valueChild) {
            valueChild = swatch.createChild('span');
            const color = swatch.getColor();
            valueChild.textContent =
                color ? (color.getAuthoredText() ?? color.asString(swatch.getFormat() ?? undefined)) : text;
        }
        swatch.appendChild(valueChild);
        const onColorChanged = (event) => {
            const { data } = event;
            swatch.firstElementChild && swatch.firstElementChild.remove();
            swatch.createChild('span').textContent = data.text;
            void this.treeElement.applyStyleText(this.treeElement.renderedPropertyText(), false);
        };
        swatch.addEventListener(InlineEditor.ColorSwatch.ClickEvent.eventName, () => {
            Host.userMetrics.swatchActivated(2 /* Host.UserMetrics.SwatchType.Color */);
        });
        swatch.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, onColorChanged);
        if (editable) {
            const swatchIcon = new ColorSwatchPopoverIcon(this.treeElement, this.treeElement.parentPane().swatchPopoverHelper(), swatch);
            swatchIcon.addEventListener("colorchanged" /* ColorSwatchPopoverIconEvents.ColorChanged */, ev => {
                // TODO(crbug.com/1402233): Is it really okay to dispatch an event from `Swatch` here?
                // This needs consideration as current structure feels a bit different:
                // There are: ColorSwatch, ColorSwatchPopoverIcon, and Spectrum
                // * Our entry into the Spectrum is `ColorSwatch` and `ColorSwatch` is able to
                // update the color too. (its format at least, don't know the difference)
                // * ColorSwatchPopoverIcon is a helper to show/hide the Spectrum popover
                // * Spectrum is the color picker
                //
                // My idea is: merge `ColorSwatch` and `ColorSwatchPopoverIcon`
                // and emit `ColorChanged` event whenever color is changed.
                // Until then, this is a hack to kind of emulate the behavior described above
                // `swatch` is dispatching its own ColorChangedEvent with the changed
                // color text whenever the color changes.
                swatch.dispatchEvent(new InlineEditor.ColorSwatch.ColorChangedEvent(ev.data));
            });
            void this.#addColorContrastInfo(swatchIcon);
        }
        return swatch;
    }
    async #addColorContrastInfo(swatchIcon) {
        const cssModel = this.treeElement.parentPane().cssModel();
        const node = this.treeElement.node();
        if (this.treeElement.property.name !== 'color' || !cssModel || !node || typeof node.id === 'undefined') {
            return;
        }
        const contrastInfo = new ColorPicker.ContrastInfo.ContrastInfo(await cssModel.getBackgroundColors(node.id));
        swatchIcon.setContrastInfo(contrastInfo);
    }
}
export class LightDarkColorRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    matcher() {
        return new LightDarkColorMatcher();
    }
    render(match, context) {
        const content = document.createElement('span');
        content.appendChild(document.createTextNode('light-dark('));
        const light = content.appendChild(document.createElement('span'));
        content.appendChild(document.createTextNode(', '));
        const dark = content.appendChild(document.createElement('span'));
        content.appendChild(document.createTextNode(')'));
        Renderer.renderInto(match.light, context, light);
        Renderer.renderInto(match.dark, context, dark);
        if (context.matchedResult.hasUnresolvedVars(match.node)) {
            return [content];
        }
        const colorSwatch = new ColorRenderer(this.#treeElement).renderColorSwatch(match.text, content);
        context.addControl('color', colorSwatch);
        void this.applyColorScheme(match, context, colorSwatch, light, dark);
        return [colorSwatch];
    }
    async applyColorScheme(match, context, colorSwatch, light, dark) {
        const activeColor = await this.#activeColor(match);
        if (!activeColor) {
            return;
        }
        const inactiveColor = (activeColor === match.light) ? dark : light;
        const colorText = context.matchedResult.getComputedTextRange(activeColor[0], activeColor[activeColor.length - 1]);
        const color = colorText && Common.Color.parse(colorText);
        inactiveColor.style.textDecoration = 'line-through';
        if (color) {
            colorSwatch.renderColor(color);
        }
    }
    // Returns the syntax node group corresponding the active color scheme:
    // If the element has color-scheme set to light or dark, return the respective group.
    // If the element has color-scheme set to both light and dark, we check the prefers-color-scheme media query.
    async #activeColor(match) {
        const activeColorSchemes = this.#treeElement.getComputedStyle('color-scheme')?.split(' ') ?? [];
        const hasLight = activeColorSchemes.includes("light" /* SDK.CSSModel.ColorScheme.Light */);
        const hasDark = activeColorSchemes.includes("dark" /* SDK.CSSModel.ColorScheme.Dark */);
        if (!hasDark && !hasLight) {
            return match.light;
        }
        if (!hasLight) {
            return match.dark;
        }
        if (!hasDark) {
            return match.light;
        }
        switch (await this.#treeElement.parentPane().cssModel()?.colorScheme()) {
            case "dark" /* SDK.CSSModel.ColorScheme.Dark */:
                return match.dark;
            case "light" /* SDK.CSSModel.ColorScheme.Light */:
                return match.light;
            default:
                return undefined;
        }
    }
}
export class ColorMixRenderer {
    #pane;
    constructor(pane) {
        this.#pane = pane;
    }
    render(match, context) {
        const hookUpColorArg = (node, onChange) => {
            if (node instanceof InlineEditor.ColorMixSwatch.ColorMixSwatch ||
                node instanceof InlineEditor.ColorSwatch.ColorSwatch) {
                if (node instanceof InlineEditor.ColorSwatch.ColorSwatch) {
                    node.addEventListener(InlineEditor.ColorSwatch.ColorChangedEvent.eventName, ev => onChange(ev.data.text));
                }
                else {
                    node.addEventListener("colorChanged" /* InlineEditor.ColorMixSwatch.Events.ColorChanged */, ev => onChange(ev.data.text));
                }
                const color = node.getText();
                if (color) {
                    onChange(color);
                    return true;
                }
            }
            return false;
        };
        const contentChild = document.createElement('span');
        contentChild.appendChild(document.createTextNode('color-mix('));
        Renderer.renderInto(match.space, context, contentChild);
        contentChild.appendChild(document.createTextNode(', '));
        const color1 = Renderer.renderInto(match.color1, context, contentChild).cssControls.get('color') ?? [];
        contentChild.appendChild(document.createTextNode(', '));
        const color2 = Renderer.renderInto(match.color2, context, contentChild).cssControls.get('color') ?? [];
        contentChild.appendChild(document.createTextNode(')'));
        if (context.matchedResult.hasUnresolvedVars(match.node) || color1.length !== 1 || color2.length !== 1) {
            return [contentChild];
        }
        const swatch = new InlineEditor.ColorMixSwatch.ColorMixSwatch();
        if (!hookUpColorArg(color1[0], text => swatch.setFirstColor(text)) ||
            !hookUpColorArg(color2[0], text => swatch.setSecondColor(text))) {
            return [contentChild];
        }
        const space = match.space.map(space => context.matchedResult.getComputedText(space)).join(' ');
        const color1Text = match.color1.map(color => context.matchedResult.getComputedText(color)).join(' ');
        const color2Text = match.color2.map(color => context.matchedResult.getComputedText(color)).join(' ');
        swatch.appendChild(contentChild);
        swatch.setColorMixText(`color-mix(${space}, ${color1Text}, ${color2Text})`);
        swatch.setRegisterPopoverCallback(swatch => {
            if (swatch.icon) {
                this.#pane.addPopover(swatch.icon, {
                    contents: () => {
                        const color = swatch.mixedColor();
                        if (!color) {
                            return undefined;
                        }
                        const span = document.createElement('span');
                        span.style.padding = '11px 7px';
                        const rgb = color.as("hex" /* Common.Color.Format.HEX */);
                        const text = rgb.isGamutClipped() ? color.asString() : rgb.asString();
                        if (!text) {
                            return undefined;
                        }
                        span.appendChild(document.createTextNode(text));
                        return span;
                    },
                    jslogContext: 'elements.css-color-mix',
                });
            }
        });
        context.addControl('color', swatch);
        return [swatch];
    }
    matcher() {
        return new ColorMixMatcher();
    }
}
export class AngleRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    render(match, context) {
        const angleText = match.text;
        if (!this.#treeElement.editable()) {
            return [document.createTextNode(angleText)];
        }
        const cssAngle = new InlineEditor.CSSAngle.CSSAngle();
        cssAngle.setAttribute('jslog', `${VisualLogging.showStyleEditor().track({ click: true }).context('css-angle')}`);
        const valueElement = document.createElement('span');
        valueElement.textContent = angleText;
        cssAngle.data = {
            angleText,
            containingPane: this.#treeElement.parentPane().element.enclosingNodeOrSelfWithClass('style-panes-wrapper'),
        };
        cssAngle.append(valueElement);
        cssAngle.addEventListener('popovertoggled', ({ data }) => {
            const section = this.#treeElement.section();
            if (!section) {
                return;
            }
            if (data.open) {
                this.#treeElement.parentPane().hideAllPopovers();
                this.#treeElement.parentPane().activeCSSAngle = cssAngle;
                Host.userMetrics.swatchActivated(7 /* Host.UserMetrics.SwatchType.Angle */);
            }
            section.element.classList.toggle('has-open-popover', data.open);
            this.#treeElement.parentPane().setEditingStyle(data.open);
            // Commit the value as a major change after the angle popover is closed.
            if (!data.open) {
                void this.#treeElement.applyStyleText(this.#treeElement.renderedPropertyText(), true);
            }
        });
        cssAngle.addEventListener('valuechanged', async ({ data }) => {
            valueElement.textContent = data.value;
            await this.#treeElement.applyStyleText(this.#treeElement.renderedPropertyText(), false);
        });
        cssAngle.addEventListener('unitchanged', ({ data }) => {
            valueElement.textContent = data.value;
        });
        context.addControl('angle', cssAngle);
        return [cssAngle];
    }
    matcher() {
        return new AngleMatcher();
    }
}
export class LinkableNameRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    #getLinkData(match) {
        switch (match.properyName) {
            case "animation" /* LinkableNameProperties.Animation */:
            case "animation-name" /* LinkableNameProperties.AnimationName */:
                return {
                    jslogContext: 'css-animation-name',
                    metric: 1 /* Host.UserMetrics.SwatchType.AnimationNameLink */,
                    ruleBlock: '@keyframes',
                    isDefined: Boolean(this.#treeElement.matchedStyles().keyframes().find(kf => kf.name().text === match.text)),
                };
            case "font-palette" /* LinkableNameProperties.FontPalette */:
                return {
                    jslogContext: 'css-font-palette',
                    metric: null,
                    ruleBlock: '@font-palette-values',
                    isDefined: this.#treeElement.matchedStyles().fontPaletteValuesRule()?.name().text === match.text,
                };
            case "position-fallback" /* LinkableNameProperties.PositionFallback */:
                return {
                    jslogContext: 'css-position-fallback',
                    metric: 9 /* Host.UserMetrics.SwatchType.PositionFallbackLink */,
                    ruleBlock: '@position-fallback',
                    isDefined: Boolean(this.#treeElement.matchedStyles().positionFallbackRules().find(pf => pf.name().text === match.text)),
                };
            case "position-try" /* LinkableNameProperties.PositionTry */:
            case "position-try-options" /* LinkableNameProperties.PositionTryOptions */:
                return {
                    jslogContext: 'css-position-try',
                    metric: 10 /* Host.UserMetrics.SwatchType.PositionTryLink */,
                    ruleBlock: '@position-try',
                    isDefined: Boolean(this.#treeElement.matchedStyles().positionTryRules().find(pt => pt.name().text === match.text)),
                };
        }
    }
    render(match) {
        const swatch = new InlineEditor.LinkSwatch.LinkSwatch();
        UI.UIUtils.createTextChild(swatch, match.text);
        const { metric, jslogContext, ruleBlock, isDefined } = this.#getLinkData(match);
        swatch.data = {
            text: match.text,
            isDefined,
            onLinkActivate: () => {
                metric && Host.userMetrics.swatchActivated(metric);
                this.#treeElement.parentPane().jumpToSectionBlock(`${ruleBlock} ${match.text}`);
            },
            jslogContext,
        };
        return [swatch];
    }
    matcher() {
        return new LinkableNameMatcher();
    }
}
export class BezierRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    render(match) {
        return [this.renderSwatch(match)];
    }
    renderSwatch(match) {
        if (!this.#treeElement.editable()) {
            return document.createTextNode(match.text);
        }
        const swatchPopoverHelper = this.#treeElement.parentPane().swatchPopoverHelper();
        const swatch = InlineEditor.Swatches.BezierSwatch.create();
        swatch.iconElement().addEventListener('click', () => {
            Host.userMetrics.swatchActivated(3 /* Host.UserMetrics.SwatchType.AnimationTiming */);
        });
        swatch.setBezierText(match.text);
        new BezierPopoverIcon({ treeElement: this.#treeElement, swatchPopoverHelper, swatch });
        return swatch;
    }
    matcher() {
        return new BezierMatcher();
    }
}
// The shadow model is an abstraction over the various shadow properties on the one hand and the order they were defined
// in on the other, so that modifications through the shadow editor can retain the property order in the authored text.
// The model also looks through var()s by keeping a mapping between individual properties and any var()s they are coming
// from, replacing the var() functions as needed with concrete values when edited.
export class ShadowModel {
    #properties;
    #shadowType;
    #context;
    constructor(shadowType, properties, context) {
        this.#shadowType = shadowType;
        this.#properties = properties;
        this.#context = context;
    }
    isBoxShadow() {
        return this.#shadowType === "boxShadow" /* ShadowType.BoxShadow */;
    }
    inset() {
        return Boolean(this.#properties.find(property => property.propertyType === "inset" /* ShadowPropertyType.Inset */));
    }
    #length(lengthType) {
        return this.#properties.find((property) => property.propertyType === lengthType)
            ?.length ??
            InlineEditor.CSSShadowEditor.CSSLength.zero();
    }
    offsetX() {
        return this.#length("x" /* ShadowPropertyType.X */);
    }
    offsetY() {
        return this.#length("y" /* ShadowPropertyType.Y */);
    }
    blurRadius() {
        return this.#length("blur" /* ShadowPropertyType.Blur */);
    }
    spreadRadius() {
        return this.#length("spread" /* ShadowPropertyType.Spread */);
    }
    #needsExpansion(property) {
        return Boolean(property.expansionContext && property.source);
    }
    #expandPropertyIfNeeded(property) {
        if (this.#needsExpansion(property)) {
            // Rendering prefers `source` if present. It's sufficient to clear it in order to switch rendering to render the
            // individual properties directly.
            const source = property.source;
            this.#properties.filter(property => property.source === source).forEach(property => {
                property.source = null;
            });
        }
    }
    #expandOrGetProperty(propertyType) {
        const index = this.#properties.findIndex(property => property.propertyType === propertyType);
        const property = index >= 0 ? this.#properties[index] : undefined;
        property && this.#expandPropertyIfNeeded(property);
        return { property, index };
    }
    setInset(inset) {
        if (!this.isBoxShadow()) {
            return;
        }
        const { property, index } = this.#expandOrGetProperty("inset" /* ShadowPropertyType.Inset */);
        if (property) {
            // For `inset`, remove the entry if value is false, otherwise don't touch it.
            if (!inset) {
                this.#properties.splice(index, 1);
            }
        }
        else {
            this.#properties.unshift({ value: 'inset', source: null, expansionContext: null, propertyType: "inset" /* ShadowPropertyType.Inset */ });
        }
    }
    #setLength(value, propertyType) {
        const { property } = this.#expandOrGetProperty(propertyType);
        if (property) {
            property.value = value.asCSSText();
            property.length = value;
            property.source = null;
        }
        else {
            // Lengths are ordered X, Y, Blur, Spread, with the latter two being optional. When inserting an optional property
            // we need to insert it after Y or after Blur, depending on what's being inserted and which properties are
            // present.
            const insertionIdx = 1 +
                this.#properties.findLastIndex(property => property.propertyType === "y" /* ShadowPropertyType.Y */ ||
                    (propertyType === "spread" /* ShadowPropertyType.Spread */ && property.propertyType === "blur" /* ShadowPropertyType.Blur */));
            if (insertionIdx > 0 && insertionIdx < this.#properties.length &&
                this.#needsExpansion(this.#properties[insertionIdx]) &&
                this.#properties[insertionIdx - 1].source === this.#properties[insertionIdx].source) {
                // This prevents the edge case where insertion after the last length would break up a group of values that
                // require expansion.
                this.#expandPropertyIfNeeded(this.#properties[insertionIdx]);
            }
            this.#properties.splice(insertionIdx, 0, { value: value.asCSSText(), length: value, source: null, expansionContext: null, propertyType });
        }
    }
    setOffsetX(value) {
        this.#setLength(value, "x" /* ShadowPropertyType.X */);
    }
    setOffsetY(value) {
        this.#setLength(value, "y" /* ShadowPropertyType.Y */);
    }
    setBlurRadius(value) {
        this.#setLength(value, "blur" /* ShadowPropertyType.Blur */);
    }
    setSpreadRadius(value) {
        if (this.isBoxShadow()) {
            this.#setLength(value, "spread" /* ShadowPropertyType.Spread */);
        }
    }
    renderContents(parent) {
        parent.removeChildren();
        const span = parent.createChild('span');
        let previousSource = null;
        for (const property of this.#properties) {
            if (!property.source || property.source !== previousSource) {
                if (property !== this.#properties[0]) {
                    span.append(' ');
                }
                // If `source` is present on the property that means it came from a var() and we'll use that to render.
                if (property.source) {
                    span.append(...Renderer.render(property.source, this.#context).nodes);
                }
                else if (typeof property.value === 'string') {
                    span.append(property.value);
                }
                else {
                    span.append(...Renderer.render(property.value, property.expansionContext ?? this.#context).nodes);
                }
            }
            previousSource = property.source;
        }
    }
}
export class ShadowRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    shadowModel(shadow, shadowType, context) {
        const properties = [];
        const missingLengths = ["spread" /* ShadowPropertyType.Spread */, "blur" /* ShadowPropertyType.Blur */, "y" /* ShadowPropertyType.Y */, "x" /* ShadowPropertyType.X */];
        let stillAcceptsLengths = true;
        // We're parsing the individual shadow properties into an array here retaining the ordering. This also looks through
        // var() functions by re-parsing the variable values on the fly. For properties coming from a var() we're keeping
        // track of their origin to allow for adhoc expansion when one of those properties is edited.
        const queue = shadow.map(value => ({ value, source: value, match: context.matchedResult.getMatch(value), expansionContext: null }));
        for (let item = queue.shift(); item; item = queue.shift()) {
            const { value, source, match, expansionContext } = item;
            const text = (expansionContext ?? context).ast.text(value);
            if (value.name === 'NumberLiteral') {
                if (!stillAcceptsLengths) {
                    return null;
                }
                const propertyType = missingLengths.pop();
                if (propertyType === undefined ||
                    (propertyType === "spread" /* ShadowPropertyType.Spread */ && shadowType === "textShadow" /* ShadowType.TextShadow */)) {
                    return null;
                }
                const length = InlineEditor.CSSShadowEditor.CSSLength.parse(text);
                if (!length) {
                    return null;
                }
                properties.push({ value, source, length, propertyType, expansionContext });
            }
            else if (match instanceof SDK.CSSPropertyParser.VariableMatch) {
                // This doesn't come from any computed text, so we can rely on context here
                const computedValue = context.matchedResult.getComputedText(value);
                const computedValueAst = SDK.CSSPropertyParser.tokenizeDeclaration('--property', computedValue);
                if (!computedValueAst) {
                    return null;
                }
                const matches = SDK.CSSPropertyParser.BottomUpTreeMatching.walkExcludingSuccessors(computedValueAst, [new ColorMatcher()]);
                if (matches.hasUnresolvedVars(matches.ast.tree)) {
                    return null;
                }
                queue.unshift(...ASTUtils.siblings(ASTUtils.declValue(matches.ast.tree))
                    .map(matchedNode => ({
                    value: matchedNode,
                    source: value,
                    match: matches.getMatch(matchedNode),
                    expansionContext: new RenderingContext(computedValueAst, context.renderers, matches),
                })));
            }
            else {
                // The length properties must come in one block, so if there were any lengths before, followed by a non-length
                // property, we will not allow any future lengths.
                stillAcceptsLengths = missingLengths.length === 4;
                if (value.name === 'ValueName' && text.toLowerCase() === 'inset') {
                    if (shadowType === "textShadow" /* ShadowType.TextShadow */ ||
                        properties.find(({ propertyType }) => propertyType === "inset" /* ShadowPropertyType.Inset */)) {
                        return null;
                    }
                    properties.push({ value, source, propertyType: "inset" /* ShadowPropertyType.Inset */, expansionContext });
                }
                else if (match instanceof ColorMatch || match instanceof ColorMixMatch) {
                    if (properties.find(({ propertyType }) => propertyType === "color" /* ShadowPropertyType.Color */)) {
                        return null;
                    }
                    properties.push({ value, source, propertyType: "color" /* ShadowPropertyType.Color */, expansionContext });
                }
                else if (value.name !== 'Comment' && value.name !== 'Important') {
                    return null;
                }
            }
        }
        if (missingLengths.length > 2) {
            // X and Y are mandatory
            return null;
        }
        return new ShadowModel(shadowType, properties, context);
    }
    render(match, context) {
        const shadows = ASTUtils.split(ASTUtils.siblings(ASTUtils.declValue(match.node)));
        const result = [];
        for (const shadow of shadows) {
            const model = this.shadowModel(shadow, match.shadowType, context);
            const isImportant = shadow.find(node => node.name === 'Important');
            if (shadow !== shadows[0]) {
                result.push(document.createTextNode(', '));
            }
            if (!model) {
                const { nodes } = Renderer.render(shadow, context);
                result.push(...nodes);
                continue;
            }
            const swatch = new InlineEditor.Swatches.CSSShadowSwatch(model);
            swatch.setAttribute('jslog', `${VisualLogging.showStyleEditor('css-shadow').track({ click: true })}`);
            swatch.iconElement().addEventListener('click', () => {
                Host.userMetrics.swatchActivated(4 /* Host.UserMetrics.SwatchType.Shadow */);
            });
            model.renderContents(swatch);
            const popoverHelper = new ShadowSwatchPopoverHelper(this.#treeElement, this.#treeElement.parentPane().swatchPopoverHelper(), swatch);
            popoverHelper.addEventListener("shadowChanged" /* ShadowEvents.ShadowChanged */, () => {
                model.renderContents(swatch);
                void this.#treeElement.applyStyleText(this.#treeElement.renderedPropertyText(), false);
            });
            result.push(swatch);
            if (isImportant) {
                result.push(...[document.createTextNode(' '), ...Renderer.render(isImportant, context).nodes]);
            }
        }
        return result;
    }
    matcher() {
        return new ShadowMatcher();
    }
}
export class FontRenderer {
    treeElement;
    constructor(treeElement) {
        this.treeElement = treeElement;
    }
    render(match) {
        this.treeElement.section().registerFontProperty(this.treeElement);
        return [document.createTextNode(match.text)];
    }
    matcher() {
        return new FontMatcher();
    }
}
export class GridTemplateRenderer {
    render(match, context) {
        if (match.lines.length <= 1) {
            return Renderer.render(ASTUtils.siblings(ASTUtils.declValue(match.node)), context).nodes;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('text-editor-indent').get();
        const container = document.createDocumentFragment();
        for (const line of match.lines) {
            const value = Renderer.render(line, context);
            const lineBreak = UI.Fragment.html `<br /><span class='styles-clipboard-only'>${indent.repeat(2)}</span>`;
            container.append(lineBreak, ...value.nodes);
        }
        return [container];
    }
    matcher() {
        return new GridTemplateMatcher();
    }
}
export class LengthRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    render(match, _context) {
        const lengthText = match.text;
        if (!this.#treeElement.editable()) {
            return [document.createTextNode(lengthText)];
        }
        const cssLength = new InlineEditor.CSSLength.CSSLength();
        const valueElement = document.createElement('span');
        valueElement.textContent = lengthText;
        cssLength.data = {
            lengthText,
            overloaded: this.#treeElement.overloaded(),
        };
        cssLength.append(valueElement);
        const onValueChanged = (event) => {
            const { data } = event;
            valueElement.textContent = data.value;
            this.#treeElement.parentPane().setEditingStyle(true);
            void this.#treeElement.applyStyleText(this.#treeElement.renderedPropertyText(), false);
        };
        const onDraggingFinished = () => {
            this.#treeElement.parentPane().setEditingStyle(false);
        };
        cssLength.addEventListener('valuechanged', onValueChanged);
        cssLength.addEventListener('draggingfinished', onDraggingFinished);
        return [cssLength];
    }
    matcher() {
        return new LengthMatcher();
    }
}
async function decorateAnchorForAnchorLink(container, treeElement, options) {
    const anchorNode = await treeElement.node()?.getAnchorBySpecifier(options.identifier) ?? undefined;
    const link = new ElementsComponents.AnchorFunctionLinkSwatch.AnchorFunctionLinkSwatch({
        identifier: options.identifier,
        anchorNode: anchorNode,
        needsSpace: options.needsSpace,
        onLinkActivate: () => {
            if (!anchorNode) {
                return;
            }
            void Common.Revealer.reveal(anchorNode, false);
        },
        onMouseEnter: () => {
            anchorNode?.highlight();
        },
        onMouseLeave: () => {
            SDK.OverlayModel.OverlayModel.hideDOMNodeHighlight();
        },
    });
    container.removeChildren();
    container.appendChild(link);
}
export class AnchorFunctionRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    anchorDecoratedForTest() {
    }
    async #decorateAnchor(container, identifier) {
        await decorateAnchorForAnchorLink(container, this.#treeElement, {
            identifier,
            needsSpace: true,
        });
        this.anchorDecoratedForTest();
    }
    render(match, context) {
        const content = document.createElement('span');
        content.appendChild(document.createTextNode(`${match.functionName}(`));
        const firstArgText = match.matching.ast.text(match.args[0]);
        const hasDashedIdentifier = firstArgText.startsWith('--');
        const linkContainer = document.createElement('span');
        if (hasDashedIdentifier) {
            linkContainer.textContent = `${firstArgText} `;
        }
        content.appendChild(linkContainer);
        const remainingArgsContainer = content.appendChild(document.createElement('span'));
        if (hasDashedIdentifier) {
            Renderer.renderInto(match.args.slice(1), context, remainingArgsContainer);
        }
        else {
            Renderer.renderInto(match.args, context, remainingArgsContainer);
        }
        void this.#decorateAnchor(linkContainer, hasDashedIdentifier ? firstArgText : undefined);
        content.appendChild(document.createTextNode(')'));
        return [content];
    }
    matcher() {
        return new AnchorFunctionMatcher();
    }
}
export class PositionAnchorRenderer {
    #treeElement;
    constructor(treeElement) {
        this.#treeElement = treeElement;
    }
    anchorDecoratedForTest() {
    }
    render(match) {
        const content = document.createElement('span');
        content.appendChild(document.createTextNode(match.text));
        void decorateAnchorForAnchorLink(content, this.#treeElement, {
            identifier: match.text,
            needsSpace: false,
        }).then(() => this.anchorDecoratedForTest());
        return [content];
    }
    matcher() {
        return new PositionAnchorMatcher();
    }
}
export class StylePropertyTreeElement extends UI.TreeOutline.TreeElement {
    style;
    matchedStylesInternal;
    property;
    inheritedInternal;
    overloadedInternal;
    parentPaneInternal;
    #parentSection;
    isShorthand;
    applyStyleThrottler;
    newProperty;
    expandedDueToFilter;
    valueElement;
    nameElement;
    expandElement;
    originalPropertyText;
    hasBeenEditedIncrementally;
    prompt;
    lastComputedValue;
    computedStyles = null;
    parentsComputedStyles = null;
    contextForTest;
    #propertyTextFromSource;
    constructor({ stylesPane, section, matchedStyles, property, isShorthand, inherited, overloaded, newProperty }) {
        // Pass an empty title, the title gets made later in onattach.
        const jslogContext = property.name.startsWith('--') ? 'custom-property' : property.name;
        super('', isShorthand, jslogContext);
        this.style = property.ownerStyle;
        this.matchedStylesInternal = matchedStyles;
        this.property = property;
        this.inheritedInternal = inherited;
        this.overloadedInternal = overloaded;
        this.selectable = false;
        this.parentPaneInternal = stylesPane;
        this.#parentSection = section;
        this.isShorthand = isShorthand;
        this.applyStyleThrottler = new Common.Throttler.Throttler(0);
        this.newProperty = newProperty;
        if (this.newProperty) {
            this.listItemElement.textContent = '';
        }
        this.expandedDueToFilter = false;
        this.valueElement = null;
        this.nameElement = null;
        this.expandElement = null;
        this.originalPropertyText = '';
        this.hasBeenEditedIncrementally = false;
        this.prompt = null;
        this.lastComputedValue = null;
        this.#propertyTextFromSource = property.propertyText || '';
    }
    matchedStyles() {
        return this.matchedStylesInternal;
    }
    editable() {
        const isLonghandInsideShorthand = this.parent instanceof StylePropertyTreeElement && this.parent.isShorthand;
        const hasSourceData = Boolean(this.style.styleSheetId && this.style.range);
        return !isLonghandInsideShorthand && hasSourceData;
    }
    inherited() {
        return this.inheritedInternal;
    }
    overloaded() {
        return this.overloadedInternal;
    }
    setOverloaded(x) {
        if (x === this.overloadedInternal) {
            return;
        }
        this.overloadedInternal = x;
        this.updateState();
    }
    setComputedStyles(computedStyles) {
        this.computedStyles = computedStyles;
    }
    getComputedStyle(property) {
        return this.computedStyles?.get(property) ?? null;
    }
    setParentsComputedStyles(parentsComputedStyles) {
        this.parentsComputedStyles = parentsComputedStyles;
    }
    get name() {
        return this.property.name;
    }
    get value() {
        return this.property.value;
    }
    updateFilter() {
        const regex = this.parentPaneInternal.filterRegex();
        const matches = regex !== null && (regex.test(this.property.name) || regex.test(this.property.value));
        this.listItemElement.classList.toggle('filter-match', matches);
        void this.onpopulate();
        let hasMatchingChildren = false;
        for (let i = 0; i < this.childCount(); ++i) {
            const child = this.childAt(i);
            if (!child || (child && !child.updateFilter())) {
                continue;
            }
            hasMatchingChildren = true;
        }
        if (!regex) {
            if (this.expandedDueToFilter) {
                this.collapse();
            }
            this.expandedDueToFilter = false;
        }
        else if (hasMatchingChildren && !this.expanded) {
            this.expand();
            this.expandedDueToFilter = true;
        }
        else if (!hasMatchingChildren && this.expanded && this.expandedDueToFilter) {
            this.collapse();
            this.expandedDueToFilter = false;
        }
        return matches;
    }
    renderedPropertyText() {
        if (!this.nameElement || !this.valueElement) {
            return '';
        }
        return this.nameElement.textContent + ': ' + this.valueElement.textContent;
    }
    updateState() {
        if (!this.listItemElement) {
            return;
        }
        if (this.style.isPropertyImplicit(this.name)) {
            this.listItemElement.classList.add('implicit');
        }
        else {
            this.listItemElement.classList.remove('implicit');
        }
        const hasIgnorableError = !this.property.parsedOk && StylesSidebarPane.ignoreErrorsForProperty(this.property);
        if (hasIgnorableError) {
            this.listItemElement.classList.add('has-ignorable-error');
        }
        else {
            this.listItemElement.classList.remove('has-ignorable-error');
        }
        if (this.inherited()) {
            this.listItemElement.classList.add('inherited');
        }
        else {
            this.listItemElement.classList.remove('inherited');
        }
        if (this.overloaded()) {
            this.listItemElement.classList.add('overloaded');
        }
        else {
            this.listItemElement.classList.remove('overloaded');
        }
        if (this.property.disabled) {
            this.listItemElement.classList.add('disabled');
        }
        else {
            this.listItemElement.classList.remove('disabled');
        }
        this.listItemElement.classList.toggle('changed', this.isPropertyChanged(this.property));
    }
    node() {
        return this.parentPaneInternal.node();
    }
    parentPane() {
        return this.parentPaneInternal;
    }
    section() {
        return this.#parentSection;
    }
    updatePane() {
        this.#parentSection.refreshUpdate(this);
    }
    async toggleDisabled(disabled) {
        const oldStyleRange = this.style.range;
        if (!oldStyleRange) {
            return;
        }
        this.parentPaneInternal.setUserOperation(true);
        const success = await this.property.setDisabled(disabled);
        this.parentPaneInternal.setUserOperation(false);
        if (!success) {
            return;
        }
        this.matchedStylesInternal.resetActiveProperties();
        this.updatePane();
        this.styleTextAppliedForTest();
    }
    isPropertyChanged(property) {
        if (!Root.Runtime.experiments.isEnabled("styles-pane-css-changes" /* Root.Runtime.ExperimentName.STYLES_PANE_CSS_CHANGES */)) {
            return false;
        }
        // Check local cache first, then check against diffs from the workspace.
        return this.#propertyTextFromSource !== property.propertyText || this.parentPane().isPropertyChanged(property);
    }
    async onpopulate() {
        // Only populate once and if this property is a shorthand.
        if (this.childCount() || !this.isShorthand) {
            return;
        }
        const longhandProperties = this.property.getLonghandProperties();
        const leadingProperties = this.style.leadingProperties();
        for (const property of longhandProperties) {
            const name = property.name;
            let inherited = false;
            let overloaded = false;
            inherited = this.#parentSection.isPropertyInherited(name);
            overloaded = this.matchedStylesInternal.propertyState(property) === "Overloaded" /* SDK.CSSMatchedStyles.PropertyState.Overloaded */;
            const leadingProperty = leadingProperties.find(property => property.name === name && property.activeInStyle());
            if (leadingProperty) {
                overloaded = true;
            }
            const item = new StylePropertyTreeElement({
                stylesPane: this.parentPaneInternal,
                section: this.#parentSection,
                matchedStyles: this.matchedStylesInternal,
                property,
                isShorthand: false,
                inherited,
                overloaded,
                newProperty: false,
            });
            item.setComputedStyles(this.computedStyles);
            item.setParentsComputedStyles(this.parentsComputedStyles);
            this.appendChild(item);
        }
    }
    onattach() {
        this.updateTitle();
        this.listItemElement.addEventListener('mousedown', event => {
            if (event.button === 0) {
                parentMap.set(this.parentPaneInternal, this);
            }
        }, false);
        this.listItemElement.addEventListener('mouseup', this.mouseUp.bind(this));
        this.listItemElement.addEventListener('click', event => {
            if (!event.target) {
                return;
            }
            const node = event.target;
            if (!node.hasSelection() && event.target !== this.listItemElement) {
                event.consume(true);
            }
        });
        // Copy context menu.
        this.listItemElement.addEventListener('contextmenu', this.handleCopyContextMenuEvent.bind(this));
    }
    onexpand() {
        this.updateExpandElement();
    }
    oncollapse() {
        this.updateExpandElement();
    }
    updateExpandElement() {
        if (!this.expandElement) {
            return;
        }
        if (this.expanded) {
            this.expandElement.name = 'triangle-down';
        }
        else {
            this.expandElement.name = 'triangle-right';
        }
    }
    #getRegisteredPropertyDetails(variableName) {
        const registration = this.matchedStyles().getRegisteredProperty(variableName);
        const goToDefinition = () => this.parentPaneInternal.jumpToSection(variableName, REGISTERED_PROPERTY_SECTION_NAME);
        return registration ? { registration, goToDefinition } : undefined;
    }
    getVariablePopoverContents(variableName, computedValue) {
        return new ElementsComponents.CSSVariableValueView.CSSVariableValueView({
            variableName,
            value: computedValue ?? undefined,
            details: this.#getRegisteredPropertyDetails(variableName),
        });
    }
    // Resolves a CSS expression to its computed value with `var()` calls updated.
    // Still returns the string even when a `var()` call is not resolved.
    #computeCSSExpression(style, text) {
        const ast = SDK.CSSPropertyParser.tokenizeDeclaration('--unused', text);
        if (!ast) {
            return null;
        }
        const matching = SDK.CSSPropertyParser.BottomUpTreeMatching.walk(ast, [new SDK.CSSPropertyParser.VariableMatcher((match) => {
                const variableValue = this.matchedStylesInternal.computeCSSVariable(style, match.name)?.value;
                if (variableValue !== undefined) {
                    return variableValue;
                }
                if (match.fallback.length === 0 ||
                    match.matching.hasUnresolvedVarsRange(match.fallback[0], match.fallback[match.fallback.length - 1])) {
                    return null;
                }
                return match.matching.getComputedTextRange(match.fallback[0], match.fallback[match.fallback.length - 1]);
            })]);
        const decl = SDK.CSSPropertyParser.ASTUtils.siblings(SDK.CSSPropertyParser.ASTUtils.declValue(matching.ast.tree));
        return matching.getComputedTextRange(decl[0], decl[decl.length - 1]);
    }
    updateTitleIfComputedValueChanged() {
        const computedValue = this.#computeCSSExpression(this.property.ownerStyle, this.property.value);
        if (computedValue === this.lastComputedValue) {
            return;
        }
        this.lastComputedValue = computedValue;
        this.innerUpdateTitle();
    }
    updateTitle() {
        this.lastComputedValue = this.#computeCSSExpression(this.property.ownerStyle, this.property.value);
        this.innerUpdateTitle();
    }
    innerUpdateTitle() {
        this.updateState();
        if (this.isExpandable()) {
            this.expandElement = IconButton.Icon.create('triangle-right', 'expand-icon');
            this.expandElement.setAttribute('jslog', `${VisualLogging.expand().track({ click: true })}`);
        }
        const renderers = this.property.parsedOk ?
            [
                new VariableRenderer(this, this.style),
                new ColorRenderer(this),
                new ColorMixRenderer(this.parentPaneInternal),
                new URLRenderer(this.style.parentRule, this.node()),
                new AngleRenderer(this),
                new LinkableNameRenderer(this),
                new BezierRenderer(this),
                new StringRenderer(),
                new ShadowRenderer(this),
                new FontRenderer(this),
                new LightDarkColorRenderer(this),
                new GridTemplateRenderer(),
                new LinearGradientRenderer(),
                new AnchorFunctionRenderer(this),
                new PositionAnchorRenderer(this),
            ] :
            [];
        if (!Root.Runtime.experiments.isEnabled('css-type-component-length-deprecate') && this.property.parsedOk) {
            renderers.push(new LengthRenderer(this));
        }
        this.listItemElement.removeChildren();
        this.valueElement = Renderer.renderValueElement(this.name, this.value, renderers);
        this.nameElement = Renderer.renderNameElement(this.name);
        if (this.property.name.startsWith('--') && this.nameElement) {
            this.parentPaneInternal.addPopover(this.nameElement, {
                contents: () => this.getVariablePopoverContents(this.property.name, this.matchedStylesInternal.computeCSSVariable(this.style, this.property.name)?.value ?? null),
                jslogContext: 'elements.css-var',
            });
        }
        if (!this.treeOutline) {
            return;
        }
        const indent = Common.Settings.Settings.instance().moduleSetting('text-editor-indent').get();
        UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), indent.repeat(this.section().nestingLevel + 1) + (this.property.disabled ? '/* ' : ''));
        if (this.nameElement) {
            this.listItemElement.appendChild(this.nameElement);
        }
        if (this.valueElement) {
            const lineBreakValue = this.valueElement.firstElementChild && this.valueElement.firstElementChild.tagName === 'BR';
            const separator = lineBreakValue ? ':' : ': ';
            this.listItemElement.createChild('span', 'styles-name-value-separator').textContent = separator;
            if (this.expandElement) {
                this.listItemElement.appendChild(this.expandElement);
            }
            this.listItemElement.appendChild(this.valueElement);
            const semicolon = this.listItemElement.createChild('span', 'styles-semicolon');
            semicolon.textContent = ';';
            semicolon.onmouseup = this.mouseUp.bind(this);
            if (this.property.disabled) {
                UI.UIUtils.createTextChild(this.listItemElement.createChild('span', 'styles-clipboard-only'), ' */');
            }
        }
        if (this.valueElement && this.#parentSection.editable && this.property.name === 'display') {
            const propertyValue = this.property.trimmedValueWithoutImportant();
            const isFlex = propertyValue === 'flex' || propertyValue === 'inline-flex';
            const isGrid = propertyValue === 'grid' || propertyValue === 'inline-grid';
            if (isFlex || isGrid) {
                const key = `${this.#parentSection.getSectionIdx()}_${this.#parentSection.nextEditorTriggerButtonIdx}`;
                const button = StyleEditorWidget.createTriggerButton(this.parentPaneInternal, this.#parentSection, isFlex ? FlexboxEditor : GridEditor, isFlex ? i18nString(UIStrings.flexboxEditorButton) : i18nString(UIStrings.gridEditorButton), key);
                button.setAttribute('jslog', `${VisualLogging.showStyleEditor().track({ click: true }).context(isFlex ? 'flex' : 'grid')}`);
                this.#parentSection.nextEditorTriggerButtonIdx++;
                button.addEventListener('click', () => {
                    Host.userMetrics.swatchActivated(isFlex ? 6 /* Host.UserMetrics.SwatchType.Flex */ : 5 /* Host.UserMetrics.SwatchType.Grid */);
                });
                this.listItemElement.appendChild(button);
                const helper = this.parentPaneInternal.swatchPopoverHelper();
                if (helper.isShowing(StyleEditorWidget.instance()) && StyleEditorWidget.instance().getTriggerKey() === key) {
                    helper.setAnchorElement(button);
                }
            }
        }
        if (this.property.parsedOk) {
            this.updateAuthoringHint();
        }
        else {
            // Avoid having longhands under an invalid shorthand.
            this.listItemElement.classList.add('not-parsed-ok');
            const registrationDetails = this.#getRegisteredPropertyDetails(this.property.name);
            const tooltip = registrationDetails ?
                new ElementsComponents.CSSVariableValueView.CSSVariableParserError(registrationDetails) :
                null;
            // Add a separate exclamation mark IMG element with a tooltip.
            this.listItemElement.insertBefore(this.parentPaneInternal.createExclamationMark(this.property, tooltip), this.listItemElement.firstChild);
            // When the property is valid but the property value is invalid,
            // add line-through only to the property value.
            const invalidPropertyValue = SDK.CSSMetadata.cssMetadata().isCSSPropertyName(this.property.name);
            if (invalidPropertyValue) {
                this.listItemElement.classList.add('invalid-property-value');
            }
        }
        if (!this.property.activeInStyle()) {
            this.listItemElement.classList.add('inactive');
        }
        this.updateFilter();
        if (this.property.parsedOk && this.parent && this.parent.root) {
            const enabledCheckboxElement = document.createElement('input');
            enabledCheckboxElement.className = 'enabled-button';
            enabledCheckboxElement.type = 'checkbox';
            enabledCheckboxElement.checked = !this.property.disabled;
            enabledCheckboxElement.setAttribute('jslog', `${VisualLogging.toggle().track({ click: true })}`);
            enabledCheckboxElement.addEventListener('mousedown', event => event.consume(), false);
            enabledCheckboxElement.addEventListener('click', event => {
                void this.toggleDisabled(!this.property.disabled);
                event.consume();
            }, false);
            if (this.nameElement && this.valueElement) {
                UI.ARIAUtils.setLabel(enabledCheckboxElement, `${this.nameElement.textContent} ${this.valueElement.textContent}`);
            }
            const copyIcon = IconButton.Icon.create('copy', 'copy');
            UI.Tooltip.Tooltip.install(copyIcon, i18nString(UIStrings.copyDeclaration));
            copyIcon.addEventListener('click', () => {
                const propertyText = `${this.property.name}: ${this.property.value};`;
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(propertyText);
                Host.userMetrics.styleTextCopied(1 /* Host.UserMetrics.StyleTextCopied.DeclarationViaChangedLine */);
            });
            this.listItemElement.append(copyIcon);
            this.listItemElement.insertBefore(enabledCheckboxElement, this.listItemElement.firstChild);
        }
    }
    updateAuthoringHint() {
        this.listItemElement.classList.remove('inactive-property');
        const existingElement = this.listItemElement.querySelector('.hint');
        if (existingElement) {
            activeHints.delete(existingElement);
            existingElement?.closest('.hint-wrapper')?.remove();
        }
        const propertyName = this.property.name;
        if (!cssRuleValidatorsMap.has(propertyName)) {
            return;
        }
        // Different rules apply to SVG nodes altogether. We currently don't have SVG-specific hints.
        if (this.node()?.isSVGNode()) {
            return;
        }
        const cssModel = this.parentPaneInternal.cssModel();
        const fontFaces = cssModel?.fontFaces() || [];
        const localName = this.node()?.localName();
        for (const validator of cssRuleValidatorsMap.get(propertyName) || []) {
            const hint = validator.getHint(propertyName, this.computedStyles || undefined, this.parentsComputedStyles || undefined, localName?.toLowerCase(), fontFaces);
            if (hint) {
                Host.userMetrics.cssHintShown(validator.getMetricType());
                const wrapper = document.createElement('span');
                wrapper.classList.add('hint-wrapper');
                const hintIcon = new IconButton.Icon.Icon();
                hintIcon.data = { iconName: 'info', color: 'var(--icon-default)', width: '14px', height: '14px' };
                hintIcon.classList.add('hint');
                wrapper.append(hintIcon);
                activeHints.set(hintIcon, hint);
                this.listItemElement.append(wrapper);
                this.listItemElement.classList.add('inactive-property');
                break;
            }
        }
    }
    mouseUp(event) {
        const activeTreeElement = parentMap.get(this.parentPaneInternal);
        parentMap.delete(this.parentPaneInternal);
        if (!activeTreeElement) {
            return;
        }
        if (this.listItemElement.hasSelection()) {
            return;
        }
        if (UI.UIUtils.isBeingEdited(event.target)) {
            return;
        }
        if (event.composedPath()[0] instanceof HTMLButtonElement) {
            return;
        }
        event.consume(true);
        if (event.target === this.listItemElement) {
            return;
        }
        let selectedElement = event.target;
        if (UI.KeyboardShortcut.KeyboardShortcut.eventHasCtrlEquivalentKey(event) && this.#parentSection.navigable) {
            this.navigateToSource(selectedElement);
            return;
        }
        if (this.expandElement && selectedElement === this.expandElement) {
            return;
        }
        if (!this.#parentSection.editable) {
            return;
        }
        selectedElement = selectedElement.enclosingNodeOrSelfWithClass('webkit-css-property') ||
            selectedElement.enclosingNodeOrSelfWithClass('value') ||
            selectedElement.enclosingNodeOrSelfWithClass('styles-semicolon');
        if (!selectedElement || selectedElement === this.nameElement) {
            VisualLogging.logClick(this.nameElement, event);
            this.startEditingName();
        }
        else {
            VisualLogging.logClick(this.valueElement, event);
            this.startEditingValue();
        }
    }
    handleContextMenuEvent(context, event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        if (this.property.parsedOk && this.parent && this.parent.root) {
            const sectionIndex = this.parentPaneInternal.focusedSectionIndex();
            contextMenu.defaultSection().appendCheckboxItem(i18nString(UIStrings.togglePropertyAndContinueEditing), async () => {
                if (this.treeOutline) {
                    const propertyIndex = this.treeOutline.rootElement().indexOfChild(this);
                    // order matters here: this.editingCancelled may invalidate this.treeOutline.
                    this.editingCancelled(null, context);
                    await this.toggleDisabled(!this.property.disabled);
                    event.consume();
                    this.parentPaneInternal.continueEditingElement(sectionIndex, propertyIndex);
                }
            }, { checked: !this.property.disabled, jslogContext: 'toggle-property-and-continue-editing' });
        }
        const revealCallback = this.navigateToSource.bind(this);
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.revealInSourcesPanel), revealCallback, { jslogContext: 'reveal-in-sources-panel' });
        void contextMenu.show();
    }
    handleCopyContextMenuEvent(event) {
        const target = event.target;
        if (!target) {
            return;
        }
        const contextMenu = this.createCopyContextMenu(event);
        void contextMenu.show();
    }
    createCopyContextMenu(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyDeclaration), () => {
            const propertyText = `${this.property.name}: ${this.property.value};`;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(propertyText);
            Host.userMetrics.styleTextCopied(3 /* Host.UserMetrics.StyleTextCopied.DeclarationViaContextMenu */);
        }, { jslogContext: 'copy-declaration' });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyProperty), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.name);
            Host.userMetrics.styleTextCopied(4 /* Host.UserMetrics.StyleTextCopied.PropertyViaContextMenu */);
        }, { jslogContext: 'copy-property' });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyValue), () => {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(this.property.value);
            Host.userMetrics.styleTextCopied(5 /* Host.UserMetrics.StyleTextCopied.ValueViaContextMenu */);
        }, { jslogContext: 'copy-value' });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyRule), () => {
            const ruleText = StylesSidebarPane.formatLeadingProperties(this.#parentSection).ruleText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(ruleText);
            Host.userMetrics.styleTextCopied(7 /* Host.UserMetrics.StyleTextCopied.RuleViaContextMenu */);
        }, { jslogContext: 'copy-rule' });
        contextMenu.headerSection().appendItem(i18nString(UIStrings.copyCssDeclarationAsJs), this.copyCssDeclarationAsJs.bind(this), { jslogContext: 'copy-css-declaration-as-js' });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyAllDeclarations), () => {
            const allDeclarationText = StylesSidebarPane.formatLeadingProperties(this.#parentSection).allDeclarationText;
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allDeclarationText);
            Host.userMetrics.styleTextCopied(8 /* Host.UserMetrics.StyleTextCopied.AllDeclarationsViaContextMenu */);
        }, { jslogContext: 'copy-all-declarations' });
        contextMenu.clipboardSection().appendItem(i18nString(UIStrings.copyAllCssDeclarationsAsJs), this.copyAllCssDeclarationAsJs.bind(this), { jslogContext: 'copy-all-css-declarations-as-js' });
        // TODO(changhaohan): conditionally add this item only when there are changes to copy
        contextMenu.defaultSection().appendItem(i18nString(UIStrings.copyAllCSSChanges), async () => {
            const allChanges = await this.parentPane().getFormattedChanges();
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(allChanges);
            Host.userMetrics.styleTextCopied(2 /* Host.UserMetrics.StyleTextCopied.AllChangesViaStylesPane */);
        }, { jslogContext: 'copy-all-css-changes' });
        contextMenu.footerSection().appendItem(i18nString(UIStrings.viewComputedValue), () => {
            void this.viewComputedValue();
        }, { jslogContext: 'view-computed-value' });
        return contextMenu;
    }
    async viewComputedValue() {
        const computedStyleWidget = ElementsPanel.instance().getComputedStyleWidget();
        if (!computedStyleWidget.isShowing()) {
            await UI.ViewManager.ViewManager.instance().showView('Computed');
        }
        let propertyNamePattern = '';
        if (this.isShorthand) {
            propertyNamePattern = '^' + this.property.name + '-';
        }
        else {
            propertyNamePattern = '^' + this.property.name + '$';
        }
        const regex = new RegExp(propertyNamePattern, 'i');
        await computedStyleWidget.filterComputedStyles(regex);
        computedStyleWidget.input.setValue(this.property.name);
        computedStyleWidget.input.element.focus();
    }
    copyCssDeclarationAsJs() {
        const cssDeclarationValue = getCssDeclarationAsJavascriptProperty(this.property);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssDeclarationValue);
        Host.userMetrics.styleTextCopied(6 /* Host.UserMetrics.StyleTextCopied.DeclarationAsJSViaContextMenu */);
    }
    copyAllCssDeclarationAsJs() {
        const leadingProperties = this.#parentSection.style().leadingProperties();
        const cssDeclarationsAsJsProperties = leadingProperties.filter(property => !property.disabled).map(getCssDeclarationAsJavascriptProperty);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.copyText(cssDeclarationsAsJsProperties.join(',\n'));
        Host.userMetrics.styleTextCopied(9 /* Host.UserMetrics.StyleTextCopied.AllDeclarationsAsJSViaContextMenu */);
    }
    navigateToSource(element, omitFocus) {
        if (!this.#parentSection.navigable) {
            return;
        }
        const propertyNameClicked = element === this.nameElement;
        const uiLocation = Bindings.CSSWorkspaceBinding.CSSWorkspaceBinding.instance().propertyUILocation(this.property, propertyNameClicked);
        if (uiLocation) {
            void Common.Revealer.reveal(uiLocation, omitFocus);
        }
    }
    startEditingValue() {
        const context = {
            expanded: this.expanded,
            hasChildren: this.isExpandable(),
            isEditingName: false,
            originalProperty: this.property,
            previousContent: this.value,
        };
        // Grid definitions are often multiline. Instead of showing the authored text reformat it a little bit nicer.
        if (SDK.CSSMetadata.cssMetadata().isGridAreaDefiningProperty(this.name)) {
            const splitResult = TextUtils.TextUtils.Utils.splitStringByRegexes(this.value, [SDK.CSSMetadata.GridAreaRowRegex]);
            context.previousContent = splitResult.map(result => result.value.trim()).join('\n');
        }
        this.#startEditing(context);
    }
    startEditingName() {
        const context = {
            expanded: this.expanded,
            hasChildren: this.isExpandable(),
            isEditingName: true,
            originalProperty: this.property,
            previousContent: this.name.split('\n').map(l => l.trim()).join('\n'),
        };
        this.#startEditing(context);
    }
    #startEditing(context) {
        this.contextForTest = context;
        // FIXME: we don't allow editing of longhand properties under a shorthand right now.
        if (this.parent instanceof StylePropertyTreeElement && this.parent.isShorthand) {
            return;
        }
        const selectedElement = context.isEditingName ? this.nameElement : this.valueElement;
        if (!selectedElement) {
            return;
        }
        if (UI.UIUtils.isBeingEdited(selectedElement)) {
            return;
        }
        // Lie about our children to prevent expanding on double click and to collapse shorthands.
        this.setExpandable(false);
        selectedElement.parentElement?.classList.add('child-editing');
        selectedElement.textContent = context.previousContent; // remove color swatch and the like
        function pasteHandler(context, event) {
            const clipboardEvent = event;
            const clipboardData = clipboardEvent.clipboardData;
            if (!clipboardData) {
                return;
            }
            const data = clipboardData.getData('Text');
            if (!data) {
                return;
            }
            const colonIdx = data.indexOf(':');
            if (colonIdx < 0) {
                return;
            }
            const name = data.substring(0, colonIdx).trim();
            const value = data.substring(colonIdx + 1).trim();
            event.preventDefault();
            if (typeof context.originalName === 'undefined') {
                if (this.nameElement) {
                    context.originalName = this.nameElement.textContent || '';
                }
                if (this.valueElement) {
                    context.originalValue = this.valueElement.textContent || '';
                }
            }
            this.property.name = name;
            this.property.value = value;
            if (this.nameElement) {
                this.nameElement.textContent = name;
                this.nameElement.normalize();
            }
            if (this.valueElement) {
                this.valueElement.textContent = value;
                this.valueElement.normalize();
            }
            const target = event.target;
            void this.editingCommitted(target.textContent || '', context, 'forward');
        }
        function blurListener(context, event) {
            const target = event.target;
            let text = target.textContent;
            if (!context.isEditingName) {
                text = this.value || text;
            }
            void this.editingCommitted(text || '', context, '');
        }
        this.originalPropertyText = this.property.propertyText || '';
        this.parentPaneInternal.setEditingStyle(true, this);
        selectedElement.parentElement?.scrollIntoViewIfNeeded(false);
        this.prompt = new CSSPropertyPrompt(this, context.isEditingName);
        this.prompt.setAutocompletionTimeout(0);
        this.prompt.addEventListener("TextChanged" /* UI.TextPrompt.Events.TextChanged */, () => {
            void this.applyFreeFlowStyleTextEdit(context);
        });
        const invalidString = this.property.getInvalidStringForInvalidProperty();
        if (invalidString) {
            UI.ARIAUtils.alert(invalidString);
        }
        const proxyElement = this.prompt.attachAndStartEditing(selectedElement, blurListener.bind(this, context));
        this.navigateToSource(selectedElement, true);
        proxyElement.addEventListener('keydown', this.editingNameValueKeyDown.bind(this, context), false);
        proxyElement.addEventListener('keypress', this.editingNameValueKeyPress.bind(this, context), false);
        if (context.isEditingName) {
            proxyElement.addEventListener('paste', pasteHandler.bind(this, context), false);
            proxyElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this, context), false);
        }
        selectedElement.getComponentSelection()?.selectAllChildren(selectedElement);
    }
    editingNameValueKeyDown(context, event) {
        if (event.handled) {
            return;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        let result;
        if ((keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) ||
            (context.isEditingName && keyboardEvent.key === ' ')) {
            result = 'forward';
        }
        else if (keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Esc.code ||
            keyboardEvent.key === Platform.KeyboardUtilities.ESCAPE_KEY) {
            result = 'cancel';
        }
        else if (!context.isEditingName && this.newProperty &&
            keyboardEvent.keyCode === UI.KeyboardShortcut.Keys.Backspace.code) {
            // For a new property, when Backspace is pressed at the beginning of new property value, move back to the property name.
            const selection = target.getComponentSelection();
            if (selection && selection.isCollapsed && !selection.focusOffset) {
                event.preventDefault();
                result = 'backward';
            }
        }
        else if (keyboardEvent.key === 'Tab') {
            result = keyboardEvent.shiftKey ? 'backward' : 'forward';
            event.preventDefault();
        }
        if (result) {
            switch (result) {
                case 'cancel':
                    this.editingCancelled(null, context);
                    break;
                case 'forward':
                case 'backward':
                    void this.editingCommitted(target.textContent || '', context, result);
                    break;
            }
            event.consume();
            return;
        }
    }
    editingNameValueKeyPress(context, event) {
        function shouldCommitValueSemicolon(text, cursorPosition) {
            // FIXME: should this account for semicolons inside comments?
            let openQuote = '';
            for (let i = 0; i < cursorPosition; ++i) {
                const ch = text[i];
                if (ch === '\\' && openQuote !== '') {
                    ++i;
                } // skip next character inside string
                else if (!openQuote && (ch === '"' || ch === '\'')) {
                    openQuote = ch;
                }
                else if (openQuote === ch) {
                    openQuote = '';
                }
            }
            return !openQuote;
        }
        const keyboardEvent = event;
        const target = keyboardEvent.target;
        const keyChar = String.fromCharCode(keyboardEvent.charCode);
        const selectionLeftOffset = this.#selectionLeftOffset(target);
        const isFieldInputTerminated = (context.isEditingName ? keyChar === ':' :
            keyChar === ';' && selectionLeftOffset !== null &&
                shouldCommitValueSemicolon(target.textContent || '', selectionLeftOffset));
        if (isFieldInputTerminated) {
            // Enter or colon (for name)/semicolon outside of string (for value).
            event.consume(true);
            void this.editingCommitted(target.textContent || '', context, 'forward');
            return;
        }
    }
    /** @returns Selection offset relative to `element` */
    #selectionLeftOffset(element) {
        const selection = element.getComponentSelection();
        if (!selection?.containsNode(element, true)) {
            return null;
        }
        let leftOffset = selection.anchorOffset;
        let node = selection.anchorNode;
        while (node !== element) {
            while (node?.previousSibling) {
                node = node.previousSibling;
                leftOffset += node.textContent?.length ?? 0;
            }
            node = node?.parentNodeOrShadowHost() ?? null;
        }
        return leftOffset;
    }
    async applyFreeFlowStyleTextEdit(context) {
        if (!this.prompt || !this.parentPaneInternal.node()) {
            return;
        }
        const enteredText = this.prompt.text();
        if (context.isEditingName && enteredText.includes(':')) {
            void this.editingCommitted(enteredText, context, 'forward');
            return;
        }
        const valueText = this.prompt.textWithCurrentSuggestion();
        if (valueText.includes(';')) {
            return;
        }
        // Prevent destructive side-effects during live-edit. crbug.com/433889
        const parentNode = this.parentPaneInternal.node();
        if (parentNode) {
            const isPseudo = Boolean(parentNode.pseudoType());
            if (isPseudo) {
                if (this.name.toLowerCase() === 'content') {
                    return;
                }
                const lowerValueText = valueText.trim().toLowerCase();
                if (lowerValueText.startsWith('content:') || lowerValueText === 'display: none') {
                    return;
                }
            }
        }
        if (context.isEditingName) {
            if (valueText.includes(':')) {
                await this.applyStyleText(valueText, false);
            }
            else if (this.hasBeenEditedIncrementally) {
                await this.applyOriginalStyle(context);
            }
        }
        else {
            if (this.nameElement) {
                await this.applyStyleText(`${this.nameElement.textContent}: ${valueText}`, false);
            }
        }
    }
    kickFreeFlowStyleEditForTest() {
        const context = this.contextForTest;
        return this.applyFreeFlowStyleTextEdit(context);
    }
    editingEnded(context) {
        this.setExpandable(context.hasChildren);
        if (context.expanded) {
            this.expand();
        }
        const editedElement = context.isEditingName ? this.nameElement : this.valueElement;
        // The proxyElement has been deleted, no need to remove listener.
        if (editedElement && editedElement.parentElement) {
            editedElement.parentElement.classList.remove('child-editing');
        }
        this.parentPaneInternal.setEditingStyle(false);
    }
    editingCancelled(element, context) {
        this.removePrompt();
        if (this.hasBeenEditedIncrementally) {
            void this.applyOriginalStyle(context);
        }
        else if (this.newProperty && this.treeOutline) {
            this.treeOutline.removeChild(this);
        }
        this.updateTitle();
        // This should happen last, as it clears the info necessary to restore the property value after [Page]Up/Down changes.
        this.editingEnded(context);
    }
    async applyOriginalStyle(context) {
        await this.applyStyleText(this.originalPropertyText, false, context.originalProperty);
    }
    findSibling(moveDirection) {
        let target = this;
        do {
            const sibling = moveDirection === 'forward' ? target.nextSibling : target.previousSibling;
            target = sibling instanceof StylePropertyTreeElement ? sibling : null;
        } while (target && target.inherited());
        return target;
    }
    async editingCommitted(userInput, context, moveDirection) {
        this.removePrompt();
        this.editingEnded(context);
        const isEditingName = context.isEditingName;
        // If the underlying property has been ripped out, always assume that the value having been entered was
        // a name-value pair and attempt to process it via the SDK.
        if (!this.nameElement || !this.valueElement) {
            return;
        }
        const nameElementValue = this.nameElement.textContent || '';
        const nameValueEntered = (isEditingName && nameElementValue.includes(':')) || !this.property;
        // Determine where to move to before making changes
        let createNewProperty = false;
        let moveToSelector = false;
        const isDataPasted = typeof context.originalName !== 'undefined';
        const isDirtyViaPaste = isDataPasted &&
            (this.nameElement.textContent !== context.originalName ||
                this.valueElement.textContent !== context.originalValue);
        const isPropertySplitPaste = isDataPasted && isEditingName && this.valueElement.textContent !== context.originalValue;
        let moveTo = this;
        const moveToOther = (isEditingName !== (moveDirection === 'forward'));
        const abandonNewProperty = this.newProperty && !userInput && (moveToOther || isEditingName);
        if (moveDirection === 'forward' && (!isEditingName || isPropertySplitPaste) ||
            moveDirection === 'backward' && isEditingName) {
            moveTo = moveTo.findSibling(moveDirection);
            if (!moveTo) {
                if (moveDirection === 'forward' && (!this.newProperty || userInput)) {
                    createNewProperty = true;
                }
                else if (moveDirection === 'backward') {
                    moveToSelector = true;
                }
            }
        }
        // Make the Changes and trigger the moveToNextCallback after updating.
        let moveToIndex = -1;
        if (moveTo !== null && this.treeOutline) {
            moveToIndex = this.treeOutline.rootElement().indexOfChild(moveTo);
        }
        const blankInput = Platform.StringUtilities.isWhitespace(userInput);
        const shouldCommitNewProperty = this.newProperty &&
            (isPropertySplitPaste || moveToOther || (!moveDirection && !isEditingName) || (isEditingName && blankInput) ||
                nameValueEntered);
        if (((userInput !== context.previousContent || isDirtyViaPaste) && !this.newProperty) || shouldCommitNewProperty) {
            let propertyText;
            if (nameValueEntered) {
                propertyText = this.nameElement.textContent;
            }
            else if (blankInput ||
                (this.newProperty && Platform.StringUtilities.isWhitespace(this.valueElement.textContent || ''))) {
                propertyText = '';
            }
            else {
                if (isEditingName) {
                    propertyText = userInput + ': ' + this.property.value;
                }
                else {
                    propertyText = this.property.name + ': ' + userInput;
                }
            }
            await this.applyStyleText(propertyText || '', true);
            moveToNextCallback.call(this, this.newProperty, !blankInput, this.#parentSection);
        }
        else {
            if (isEditingName) {
                this.property.name = userInput;
            }
            else {
                this.property.value = userInput;
            }
            if (!isDataPasted && !this.newProperty) {
                this.updateTitle();
            }
            moveToNextCallback.call(this, this.newProperty, false, this.#parentSection);
        }
        /**
         * The Callback to start editing the next/previous property/selector.
         */
        function moveToNextCallback(alreadyNew, valueChanged, section) {
            if (!moveDirection) {
                this.parentPaneInternal.resetFocus();
                return;
            }
            // User just tabbed through without changes.
            if (moveTo && moveTo.parent) {
                if (isEditingName) {
                    moveTo.startEditingValue();
                }
                else {
                    moveTo.startEditingName();
                }
                return;
            }
            // User has made a change then tabbed, wiping all the original treeElements.
            // Recalculate the new treeElement for the same property we were going to edit next.
            if (moveTo && !moveTo.parent) {
                const rootElement = section.propertiesTreeOutline.rootElement();
                if (moveDirection === 'forward' && blankInput && !isEditingName) {
                    --moveToIndex;
                }
                if (moveToIndex >= rootElement.childCount() && !this.newProperty) {
                    createNewProperty = true;
                }
                else {
                    const treeElement = (moveToIndex >= 0 ? rootElement.childAt(moveToIndex) : null);
                    if (treeElement) {
                        if (alreadyNew && blankInput) {
                            if (moveDirection === 'forward') {
                                treeElement.startEditingName();
                            }
                            else {
                                treeElement.startEditingValue();
                            }
                        }
                        else if (!isEditingName || isPropertySplitPaste) {
                            treeElement.startEditingName();
                        }
                        else {
                            treeElement.startEditingValue();
                        }
                        return;
                    }
                    if (!alreadyNew) {
                        moveToSelector = true;
                    }
                }
            }
            // Create a new attribute in this section (or move to next editable selector if possible).
            if (createNewProperty) {
                if (alreadyNew && !valueChanged && (isEditingName !== (moveDirection === 'backward'))) {
                    return;
                }
                section.addNewBlankProperty().startEditingName();
                return;
            }
            if (abandonNewProperty) {
                moveTo = this.findSibling(moveDirection);
                const sectionToEdit = (moveTo || moveDirection === 'backward') ? section : section.nextEditableSibling();
                if (sectionToEdit) {
                    if (sectionToEdit.style().parentRule) {
                        sectionToEdit.startEditingSelector();
                    }
                    else {
                        sectionToEdit.moveEditorFromSelector(moveDirection);
                    }
                }
                return;
            }
            if (moveToSelector) {
                if (section.style().parentRule) {
                    section.startEditingSelector();
                }
                else {
                    section.moveEditorFromSelector(moveDirection);
                }
            }
        }
    }
    removePrompt() {
        // BUG 53242. This cannot go into editingEnded(), as it should always happen first for any editing outcome.
        if (this.prompt) {
            this.prompt.detach();
            this.prompt = null;
        }
    }
    styleTextAppliedForTest() {
    }
    applyStyleText(styleText, majorChange, property) {
        return this.applyStyleThrottler.schedule(this.innerApplyStyleText.bind(this, styleText, majorChange, property));
    }
    async innerApplyStyleText(styleText, majorChange, property) {
        // this.property might have been nulled at the end of the last innerApplyStyleText
        if (!this.treeOutline || !this.property) {
            return;
        }
        const oldStyleRange = this.style.range;
        if (!oldStyleRange) {
            return;
        }
        const hasBeenEditedIncrementally = this.hasBeenEditedIncrementally;
        styleText = styleText.replace(/[\xA0\t]/g, ' ').trim(); // Replace &nbsp; with whitespace.
        if (!styleText.length && majorChange && this.newProperty && !hasBeenEditedIncrementally) {
            // The user deleted everything and never applied a new property value via Up/Down scrolling/live editing, so remove the tree element and update.
            this.parent && this.parent.removeChild(this);
            return;
        }
        const currentNode = this.parentPaneInternal.node();
        this.parentPaneInternal.setUserOperation(true);
        styleText += Platform.StringUtilities.findUnclosedCssQuote(styleText);
        styleText += ')'.repeat(Platform.StringUtilities.countUnmatchedLeftParentheses(styleText));
        // Append a ";" if the new text does not end in ";".
        // FIXME: this does not handle trailing comments.
        if (styleText.length && !/;\s*$/.test(styleText)) {
            styleText += ';';
        }
        const overwriteProperty = !this.newProperty || hasBeenEditedIncrementally;
        let success = await this.property.setText(styleText, majorChange, overwriteProperty);
        // Revert to the original text if applying the new text failed
        if (hasBeenEditedIncrementally && majorChange && !success) {
            majorChange = false;
            success = await this.property.setText(this.originalPropertyText, majorChange, overwriteProperty);
        }
        this.parentPaneInternal.setUserOperation(false);
        // TODO: using this.property.index to access its containing StyleDeclaration's property will result in
        // off-by-1 errors when the containing StyleDeclaration's respective property has already been deleted.
        // These referencing logic needs to be updated to be more robust.
        const updatedProperty = property || this.style.propertyAt(this.property.index);
        const isPropertyWithinBounds = this.property.index < this.style.allProperties().length;
        if (!success || (!updatedProperty && isPropertyWithinBounds)) {
            if (majorChange) {
                // It did not apply, cancel editing.
                if (this.newProperty) {
                    this.treeOutline.removeChild(this);
                }
                else {
                    this.updateTitle();
                }
            }
            this.styleTextAppliedForTest();
            return;
        }
        if (updatedProperty) {
            this.listItemElement.classList.toggle('changed', this.isPropertyChanged(updatedProperty));
            this.parentPane().updateChangeStatus();
        }
        this.matchedStylesInternal.resetActiveProperties();
        this.hasBeenEditedIncrementally = true;
        // null check for updatedProperty before setting this.property as the code never expects this.property to be undefined or null.
        // This occurs when deleting the last index of a StylePropertiesSection as this.style._allProperties array gets updated
        // before we index it when setting the value for updatedProperty
        const deleteProperty = majorChange && !styleText.length;
        if (deleteProperty) {
            this.#parentSection.resetToolbars();
        }
        else if (!deleteProperty && updatedProperty) {
            this.property = updatedProperty;
        }
        if (currentNode === this.node()) {
            this.updatePane();
        }
        this.styleTextAppliedForTest();
    }
    ondblclick() {
        return true; // handled
    }
    isEventWithinDisclosureTriangle(event) {
        return event.target === this.expandElement;
    }
}
//# sourceMappingURL=StylePropertyTreeElement.js.map