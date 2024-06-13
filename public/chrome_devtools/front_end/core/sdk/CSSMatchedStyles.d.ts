import * as Protocol from '../../generated/protocol.js';
import { type CSSModel } from './CSSModel.js';
import { type CSSProperty } from './CSSProperty.js';
import { CSSFontPaletteValuesRule, CSSKeyframesRule, CSSPositionFallbackRule, CSSPositionTryRule, CSSPropertyRule, CSSStyleRule } from './CSSRule.js';
import { CSSStyleDeclaration } from './CSSStyleDeclaration.js';
import { type DOMNode } from './DOMModel.js';
export interface CSSMatchedStylesPayload {
    cssModel: CSSModel;
    node: DOMNode;
    inlinePayload: Protocol.CSS.CSSStyle | null;
    attributesPayload: Protocol.CSS.CSSStyle | null;
    matchedPayload: Protocol.CSS.RuleMatch[];
    pseudoPayload: Protocol.CSS.PseudoElementMatches[];
    inheritedPayload: Protocol.CSS.InheritedStyleEntry[];
    inheritedPseudoPayload: Protocol.CSS.InheritedPseudoElementMatches[];
    animationsPayload: Protocol.CSS.CSSKeyframesRule[];
    parentLayoutNodeId: Protocol.DOM.NodeId | undefined;
    positionFallbackRules: Protocol.CSS.CSSPositionFallbackRule[];
    positionTryRules: Protocol.CSS.CSSPositionTryRule[];
    propertyRules: Protocol.CSS.CSSPropertyRule[];
    cssPropertyRegistrations: Protocol.CSS.CSSPropertyRegistration[];
    fontPaletteValuesRule: Protocol.CSS.CSSFontPaletteValuesRule | undefined;
}
export declare class CSSRegisteredProperty {
    #private;
    constructor(cssModel: CSSModel, registration: CSSPropertyRule | Protocol.CSS.CSSPropertyRegistration);
    isAtProperty(): boolean;
    propertyName(): string;
    initialValue(): string | null;
    inherits(): boolean;
    syntax(): string;
    style(): CSSStyleDeclaration;
}
export declare class CSSMatchedStyles {
    #private;
    static create(payload: CSSMatchedStylesPayload): Promise<CSSMatchedStyles>;
    private constructor();
    private init;
    private buildMainCascade;
    /**
     * Pseudo rule matches received via the inspector protocol are grouped by pseudo type.
     * For custom highlight pseudos, we need to instead group the rule matches by highlight
     * name in order to produce separate cascades for each highlight name. This is necessary
     * so that styles of ::highlight(foo) are not shown as overriding styles of ::highlight(bar).
     *
     * This helper function takes a list of rule matches and generates separate NodeCascades
     * for each custom highlight name that was matched.
     */
    private buildSplitCustomHighlightCascades;
    private buildPseudoCascades;
    private addMatchingSelectors;
    node(): DOMNode;
    cssModel(): CSSModel;
    hasMatchingSelectors(rule: CSSStyleRule): boolean;
    getParentLayoutNodeId(): Protocol.DOM.NodeId | undefined;
    getMatchingSelectors(rule: CSSStyleRule): number[];
    recomputeMatchingSelectors(rule: CSSStyleRule): Promise<void>;
    addNewRule(rule: CSSStyleRule, node: DOMNode): Promise<void>;
    private setSelectorMatches;
    nodeStyles(): CSSStyleDeclaration[];
    registeredProperties(): CSSRegisteredProperty[];
    getRegisteredProperty(name: string): CSSRegisteredProperty | undefined;
    fontPaletteValuesRule(): CSSFontPaletteValuesRule | undefined;
    keyframes(): CSSKeyframesRule[];
    positionFallbackRules(): CSSPositionFallbackRule[];
    positionTryRules(): CSSPositionTryRule[];
    pseudoStyles(pseudoType: Protocol.DOM.PseudoType): CSSStyleDeclaration[];
    pseudoTypes(): Set<Protocol.DOM.PseudoType>;
    customHighlightPseudoStyles(highlightName: string): CSSStyleDeclaration[];
    customHighlightPseudoNames(): Set<string>;
    nodeForStyle(style: CSSStyleDeclaration): DOMNode | null;
    availableCSSVariables(style: CSSStyleDeclaration): string[];
    computeCSSVariable(style: CSSStyleDeclaration, variableName: string): CSSVariableValue | null;
    isInherited(style: CSSStyleDeclaration): boolean;
    propertyState(property: CSSProperty): PropertyState | null;
    resetActiveProperties(): void;
}
export interface CSSVariableValue {
    value: string;
    declaration: CSSProperty | CSSRegisteredProperty;
}
export declare const enum PropertyState {
    Active = "Active",
    Overloaded = "Overloaded"
}
