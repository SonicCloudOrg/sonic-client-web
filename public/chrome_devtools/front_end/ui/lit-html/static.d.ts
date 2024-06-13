import type * as I18n from '../../third_party/i18n/i18n.js';
import * as Lit from '../../third_party/lit/lit.js';
export interface Static {
    value: unknown;
    $$static$$: true;
}
type TemplateValues = Static | unknown;
type FlattenedTemplateValues = {
    strings: TemplateStringsArray;
    valueMap: boolean[];
};
export declare function flattenTemplate(strings: TemplateStringsArray, ...values: TemplateValues[]): FlattenedTemplateValues;
export declare function html(strings: TemplateStringsArray, ...values: TemplateValues[]): Lit.TemplateResult;
export declare function literal(value: TemplateStringsArray): Static;
/**
 * @param placeholders placeholders must not contain localized strings or other localized templates as that is
 * incompatible with languages using a different sentence structure or ordering (e.g., RTL).
 */
export declare function i18nTemplate(registeredStrings: I18n.LocalizedStringSet.RegisteredFileStrings, stringId: string, placeholders: Record<string, Lit.TemplateResult | string>): Lit.TemplateResult;
export {};
