import type * as SDK from '../../core/sdk/sdk.js';
import { type StylesSidebarPane } from './StylesSidebarPane.js';
export declare class StylePropertyHighlighter {
    private readonly styleSidebarPane;
    constructor(ssp: StylesSidebarPane);
    /**
     * Expand all shorthands, find the given property, scroll to it and highlight it.
     */
    highlightProperty(cssProperty: SDK.CSSProperty.CSSProperty): void;
    findAndHighlightSectionBlock(sectionBlockName: string): void;
    findAndHighlightSection(sectionName: string, blockName: string): void;
    /**
     * Find the first non-overridden property that matches the provided name, scroll to it and highlight it.
     */
    findAndHighlightPropertyName(propertyName: string, sectionName?: string, blockName?: string): boolean;
    /**
     * Traverse the styles pane tree, execute the provided callback for every tree element found, and
     * return the first tree element and corresponding section for which the callback returns a truthy value.
     */
    private findTreeElementAndSection;
    private findTreeElementFromSection;
    private scrollAndHighlightTreeElement;
}
