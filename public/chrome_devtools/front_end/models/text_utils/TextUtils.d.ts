import { type ContentDataOrError } from './ContentData.js';
import { SearchMatch } from './ContentProvider.js';
export declare const Utils: {
    isSpaceChar: (char: string) => boolean;
    lineIndent: (line: string) => string;
    splitStringByRegexes(text: string, regexes: RegExp[]): {
        value: string;
        position: number;
        regexIndex: number;
        captureGroups: Array<string | undefined>;
    }[];
};
export declare class FilterParser {
    private readonly keys;
    constructor(keys: string[]);
    static cloneFilter(filter: ParsedFilter): ParsedFilter;
    parse(query: string): ParsedFilter[];
}
export declare class BalancedJSONTokenizer {
    private readonly callback;
    private index;
    private balance;
    private buffer;
    private findMultiple;
    private closingDoubleQuoteRegex;
    private lastBalancedIndex?;
    constructor(callback: (arg0: string) => void, findMultiple?: boolean);
    write(chunk: string): boolean;
    private reportBalanced;
    remainder(): string;
}
/**
 * Detects the indentation used by a given text document, based on the _Comparing
 * lines_ approach suggested by Heather Arthur (and also found in Firefox DevTools).
 *
 * This implementation differs from the original proposal in that tab indentation
 * isn't detected by checking if at least 50% of the lines start with a tab, but
 * instead by comparing the number of lines that start with a tab to the frequency
 * of the other indentation patterns. This way we also detect small snippets with
 * long leading comments correctly, when tab indentation is used for the snippets
 * of code.
 *
 * @param lines The input document lines.
 * @return The indentation detected for the lines as string or `null` if it's inconclusive.
 *
 * @see https://heathermoor.medium.com/detecting-code-indentation-eff3ed0fb56b
 */
export declare const detectIndentation: (lines: Iterable<string>) => string | null;
/**
 * Heuristic to check whether a given text was likely minified. Intended to
 * be used for HTML, CSS, and JavaScript inputs.
 *
 * A text is considered to be the result of minification if the average
 * line length for the whole text is 80 characters or more.
 *
 * @param text The input text to check.
 * @returns
 */
export declare const isMinified: (text: string) => boolean;
/**
 * Small wrapper around {@link performSearchInContent} to reduce boilerplate when searching
 * in {@link ContentDataOrError}.
 *
 * @returns empty search matches if `contentData` is an error or not text content.
 */
export declare const performSearchInContentData: (contentData: ContentDataOrError, query: string, caseSensitive: boolean, isRegex: boolean) => SearchMatch[];
/**
 * @returns One {@link SearchMatch} per match. Multiple matches on the same line each
 * result in their own `SearchMatchExact` instance.
 */
export declare const performSearchInContent: (content: string, query: string, caseSensitive: boolean, isRegex: boolean) => SearchMatch[];
/**
 * Similar to {@link performSearchInContent} but doesn't search in a whole text but rather
 * finds the exact matches on a prelminiary search result (i.e. lines with known matches).
 * @param matches is deliberatedly typed as an object literal so we can pass the
 *                CDP search result type.
 */
export declare const performSearchInSearchMatches: (matches: {
    lineNumber: number;
    lineContent: string;
}[], query: string, caseSensitive: boolean, isRegex: boolean) => SearchMatch[];
export interface ParsedFilter {
    key?: string;
    text?: string | null;
    regex?: RegExp;
    negative: boolean;
}
