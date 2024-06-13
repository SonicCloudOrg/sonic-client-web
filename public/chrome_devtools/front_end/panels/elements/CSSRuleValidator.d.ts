import * as Host from '../../core/host/host.js';
import * as SDK from '../../core/sdk/sdk.js';
export declare const enum HintType {
    INACTIVE_PROPERTY = "ruleValidation",
    DEPRECATED_PROPERTY = "deprecatedProperty"
}
export declare class Hint {
    #private;
    constructor(hintMessage: string, possibleFixMessage: string | null, learnMoreLink?: string);
    getMessage(): string;
    getPossibleFixMessage(): string | null;
    getLearnMoreLink(): string | undefined;
}
export declare abstract class CSSRuleValidator {
    #private;
    getMetricType(): Host.UserMetrics.CSSHintType;
    constructor(affectedProperties: string[]);
    getApplicableProperties(): string[];
    abstract getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>, nodeName?: string, fontFaces?: Array<SDK.CSSFontFace.CSSFontFace>): Hint | undefined;
}
export declare class AlignContentValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(_propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class FlexItemValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>): Hint | undefined;
}
export declare class FlexContainerValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class GridContainerValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class GridItemValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>): Hint | undefined;
}
export declare class FlexOrGridItemValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>): Hint | undefined;
}
export declare class FlexGridValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>): Hint | undefined;
}
export declare class MulticolFlexGridValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class PaddingValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class PositionValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>): Hint | undefined;
}
export declare class ZIndexValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>): Hint | undefined;
}
/**
 * Validates if CSS width/height are having an effect on an element.
 * See "Applies to" in https://www.w3.org/TR/css-sizing-3/#propdef-width.
 * See "Applies to" in https://www.w3.org/TR/css-sizing-3/#propdef-height.
 */
export declare class SizingValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>, nodeName?: string): Hint | undefined;
}
/**
 * Checks that font variation settings are applicable to the actual font.
 */
export declare class FontVariationSettingsValidator extends CSSRuleValidator {
    constructor();
    getMetricType(): Host.UserMetrics.CSSHintType;
    getHint(propertyName: string, computedStyles?: Map<string, string>, parentComputedStyles?: Map<string, string>, nodeName?: string, fontFaces?: Array<SDK.CSSFontFace.CSSFontFace>): Hint | undefined;
}
export declare const cssRuleValidatorsMap: Map<string, CSSRuleValidator[]>;
