/**
 * Represents a selector that pierces shadow roots. Each selector before the
 * last one is matches a shadow root for which we pierce through.
 */
export type DeepSelector = string[];
/**
 * Represents a selector.
 */
export type Selector = string | DeepSelector;
export declare class SelectorPart {
    value: string;
    optimized: boolean;
    constructor(value: string, optimized: boolean);
    toString(): string;
}
