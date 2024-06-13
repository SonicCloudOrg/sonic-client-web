import * as SDK from '../../core/sdk/sdk.js';
import type * as CodeMirror from '../../third_party/codemirror.next/codemirror.next.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type Hint } from './CSSRuleValidator.js';
import { type AnchorFunctionMatch, AnchorFunctionMatcher, AngleMatch, AngleMatcher, type BezierMatch, BezierMatcher, ColorMatch, ColorMatcher, ColorMixMatch, ColorMixMatcher, type FontMatch, FontMatcher, type GridTemplateMatch, GridTemplateMatcher, type LengthMatch, LengthMatcher, type LightDarkColorMatch, LightDarkColorMatcher, type LinearGradientMatch, type LinkableNameMatch, LinkableNameMatcher, type PositionAnchorMatch, PositionAnchorMatcher, type ShadowMatch, ShadowMatcher, ShadowType } from './PropertyMatchers.js';
import { type MatchRenderer, RenderingContext } from './PropertyRenderer.js';
import { type StylePropertiesSection } from './StylePropertiesSection.js';
import { StylesSidebarPane } from './StylesSidebarPane.js';
export declare const activeHints: WeakMap<Element, Hint>;
interface StylePropertyTreeElementParams {
    stylesPane: StylesSidebarPane;
    section: StylePropertiesSection;
    matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles;
    property: SDK.CSSProperty.CSSProperty;
    isShorthand: boolean;
    inherited: boolean;
    overloaded: boolean;
    newProperty: boolean;
}
export declare class VariableRenderer implements MatchRenderer<SDK.CSSPropertyParser.VariableMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement, style: SDK.CSSStyleDeclaration.CSSStyleDeclaration);
    matcher(): SDK.CSSPropertyParser.VariableMatcher;
    resolveVariable(match: SDK.CSSPropertyParser.VariableMatch): SDK.CSSMatchedStyles.CSSVariableValue | null;
    fallbackValue(match: SDK.CSSPropertyParser.VariableMatch): string | null;
    computedText(match: SDK.CSSPropertyParser.VariableMatch): string | null;
    render(match: SDK.CSSPropertyParser.VariableMatch, context: RenderingContext): Node[];
}
export declare class LinearGradientRenderer implements MatchRenderer<LinearGradientMatch> {
    matcher(): SDK.CSSPropertyParser.Matcher<LinearGradientMatch>;
    render(match: LinearGradientMatch, context: RenderingContext): Node[];
}
export declare class ColorRenderer implements MatchRenderer<ColorMatch> {
    #private;
    private readonly treeElement;
    constructor(treeElement: StylePropertyTreeElement);
    matcher(): ColorMatcher;
    render(match: ColorMatch, context: RenderingContext): Node[];
    renderColorSwatch(text: string, valueChild?: Node): InlineEditor.ColorSwatch.ColorSwatch;
}
export declare class LightDarkColorRenderer implements MatchRenderer<LightDarkColorMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    matcher(): LightDarkColorMatcher;
    render(match: LightDarkColorMatch, context: RenderingContext): Node[];
    applyColorScheme(match: LightDarkColorMatch, context: RenderingContext, colorSwatch: InlineEditor.ColorSwatch.ColorSwatch, light: HTMLSpanElement, dark: HTMLSpanElement): Promise<void>;
}
export declare class ColorMixRenderer implements MatchRenderer<ColorMixMatch> {
    #private;
    constructor(pane: StylesSidebarPane);
    render(match: ColorMixMatch, context: RenderingContext): Node[];
    matcher(): ColorMixMatcher;
}
export declare class AngleRenderer implements MatchRenderer<AngleMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    render(match: AngleMatch, context: RenderingContext): Node[];
    matcher(): AngleMatcher;
}
export declare class LinkableNameRenderer implements MatchRenderer<LinkableNameMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    render(match: LinkableNameMatch): Node[];
    matcher(): LinkableNameMatcher;
}
export declare class BezierRenderer implements MatchRenderer<BezierMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    render(match: BezierMatch): Node[];
    renderSwatch(match: BezierMatch): Node;
    matcher(): BezierMatcher;
}
export declare const enum ShadowPropertyType {
    X = "x",
    Y = "y",
    Spread = "spread",
    Blur = "blur",
    Inset = "inset",
    Color = "color"
}
type ShadowProperty = {
    value: string | CodeMirror.SyntaxNode;
    source: CodeMirror.SyntaxNode | null;
    expansionContext: RenderingContext | null;
    propertyType: ShadowPropertyType;
};
export declare class ShadowModel implements InlineEditor.CSSShadowEditor.CSSShadowModel {
    #private;
    constructor(shadowType: ShadowType, properties: ShadowProperty[], context: RenderingContext);
    isBoxShadow(): boolean;
    inset(): boolean;
    offsetX(): InlineEditor.CSSShadowEditor.CSSLength;
    offsetY(): InlineEditor.CSSShadowEditor.CSSLength;
    blurRadius(): InlineEditor.CSSShadowEditor.CSSLength;
    spreadRadius(): InlineEditor.CSSShadowEditor.CSSLength;
    setInset(inset: boolean): void;
    setOffsetX(value: InlineEditor.CSSShadowEditor.CSSLength): void;
    setOffsetY(value: InlineEditor.CSSShadowEditor.CSSLength): void;
    setBlurRadius(value: InlineEditor.CSSShadowEditor.CSSLength): void;
    setSpreadRadius(value: InlineEditor.CSSShadowEditor.CSSLength): void;
    renderContents(parent: HTMLElement): void;
}
export declare class ShadowRenderer implements MatchRenderer<ShadowMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    shadowModel(shadow: CodeMirror.SyntaxNode[], shadowType: ShadowType, context: RenderingContext): null | ShadowModel;
    render(match: ShadowMatch, context: RenderingContext): Node[];
    matcher(): ShadowMatcher;
}
export declare class FontRenderer implements MatchRenderer<FontMatch> {
    readonly treeElement: StylePropertyTreeElement;
    constructor(treeElement: StylePropertyTreeElement);
    render(match: FontMatch): Node[];
    matcher(): FontMatcher;
}
export declare class GridTemplateRenderer implements MatchRenderer<GridTemplateMatch> {
    render(match: GridTemplateMatch, context: RenderingContext): Node[];
    matcher(): GridTemplateMatcher;
}
export declare class LengthRenderer implements MatchRenderer<LengthMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    render(match: LengthMatch, _context: RenderingContext): Node[];
    matcher(): LengthMatcher;
}
export declare class AnchorFunctionRenderer implements MatchRenderer<AnchorFunctionMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    anchorDecoratedForTest(): void;
    render(match: AnchorFunctionMatch, context: RenderingContext): Node[];
    matcher(): AnchorFunctionMatcher;
}
export declare class PositionAnchorRenderer implements MatchRenderer<PositionAnchorMatch> {
    #private;
    constructor(treeElement: StylePropertyTreeElement);
    anchorDecoratedForTest(): void;
    render(match: PositionAnchorMatch): Node[];
    matcher(): PositionAnchorMatcher;
}
export declare class StylePropertyTreeElement extends UI.TreeOutline.TreeElement {
    #private;
    private readonly style;
    private matchedStylesInternal;
    property: SDK.CSSProperty.CSSProperty;
    private readonly inheritedInternal;
    private overloadedInternal;
    private parentPaneInternal;
    isShorthand: boolean;
    private readonly applyStyleThrottler;
    private newProperty;
    private expandedDueToFilter;
    valueElement: HTMLElement | null;
    nameElement: HTMLElement | null;
    private expandElement;
    private originalPropertyText;
    private hasBeenEditedIncrementally;
    private prompt;
    private lastComputedValue;
    private computedStyles;
    private parentsComputedStyles;
    private contextForTest;
    constructor({ stylesPane, section, matchedStyles, property, isShorthand, inherited, overloaded, newProperty }: StylePropertyTreeElementParams);
    matchedStyles(): SDK.CSSMatchedStyles.CSSMatchedStyles;
    editable(): boolean;
    inherited(): boolean;
    overloaded(): boolean;
    setOverloaded(x: boolean): void;
    setComputedStyles(computedStyles: Map<string, string> | null): void;
    getComputedStyle(property: string): string | null;
    setParentsComputedStyles(parentsComputedStyles: Map<string, string> | null): void;
    get name(): string;
    get value(): string;
    updateFilter(): boolean;
    renderedPropertyText(): string;
    private updateState;
    node(): SDK.DOMModel.DOMNode | null;
    parentPane(): StylesSidebarPane;
    section(): StylePropertiesSection;
    private updatePane;
    private toggleDisabled;
    private isPropertyChanged;
    onpopulate(): Promise<void>;
    onattach(): void;
    onexpand(): void;
    oncollapse(): void;
    private updateExpandElement;
    getVariablePopoverContents(variableName: string, computedValue: string | null): HTMLElement | undefined;
    updateTitleIfComputedValueChanged(): void;
    updateTitle(): void;
    private innerUpdateTitle;
    updateAuthoringHint(): void;
    private mouseUp;
    private handleContextMenuEvent;
    private handleCopyContextMenuEvent;
    createCopyContextMenu(event: Event): UI.ContextMenu.ContextMenu;
    private viewComputedValue;
    private copyCssDeclarationAsJs;
    private copyAllCssDeclarationAsJs;
    private navigateToSource;
    startEditingValue(): void;
    startEditingName(): void;
    private editingNameValueKeyDown;
    private editingNameValueKeyPress;
    private applyFreeFlowStyleTextEdit;
    kickFreeFlowStyleEditForTest(): Promise<void>;
    editingEnded(context: Context): void;
    editingCancelled(element: Element | null, context: Context): void;
    private applyOriginalStyle;
    private findSibling;
    private editingCommitted;
    private removePrompt;
    styleTextAppliedForTest(): void;
    applyStyleText(styleText: string, majorChange: boolean, property?: SDK.CSSProperty.CSSProperty | null): Promise<void>;
    private innerApplyStyleText;
    ondblclick(): boolean;
    isEventWithinDisclosureTriangle(event: Event): boolean;
}
export interface Context {
    expanded: boolean;
    hasChildren: boolean;
    isEditingName: boolean;
    originalProperty?: SDK.CSSProperty.CSSProperty;
    originalName?: string;
    originalValue?: string;
    previousContent: string;
}
export {};
