import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type ComputedStyleChangedEvent } from './ComputedStyleModel.js';
import { ElementsSidebarPane } from './ElementsSidebarPane.js';
import { StylePropertiesSection } from './StylePropertiesSection.js';
import { type StylePropertyTreeElement } from './StylePropertyTreeElement.js';
export declare const REGISTERED_PROPERTY_SECTION_NAME = "@property";
declare const StylesSidebarPane_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof ElementsSidebarPane;
export declare class StylesSidebarPane extends StylesSidebarPane_base {
    #private;
    private currentToolbarPane;
    private animatedToolbarPane;
    private pendingWidget;
    private pendingWidgetToggle;
    private toolbar;
    private toolbarPaneElement;
    private lastFilterChange;
    private visibleSections;
    private noMatchesElement;
    private sectionsContainer;
    sectionByElement: WeakMap<Node, StylePropertiesSection>;
    private readonly swatchPopoverHelperInternal;
    readonly linkifier: Components.Linkifier.Linkifier;
    private readonly decorator;
    private lastRevealedProperty;
    private userOperation;
    isEditingStyle: boolean;
    private filterRegexInternal;
    private isActivePropertyHighlighted;
    private initialUpdateCompleted;
    hasMatchedStyles: boolean;
    private sectionBlocks;
    private idleCallbackManager;
    private needsForceUpdate;
    private readonly resizeThrottler;
    private scrollerElement?;
    private readonly boundOnScroll;
    private readonly imagePreviewPopover;
    activeCSSAngle: InlineEditor.CSSAngle.CSSAngle | null;
    static instance(opts?: {
        forceNew: boolean;
    }): StylesSidebarPane;
    constructor();
    addPopover(element: Node, popover: {
        contents: () => HTMLElement | undefined;
        jslogContext?: string;
    }): void;
    private onScroll;
    swatchPopoverHelper(): InlineEditor.SwatchPopoverHelper.SwatchPopoverHelper;
    setUserOperation(userOperation: boolean): void;
    createExclamationMark(property: SDK.CSSProperty.CSSProperty, title: HTMLElement | null): Element;
    static ignoreErrorsForProperty(property: SDK.CSSProperty.CSSProperty): boolean;
    static formatLeadingProperties(section: StylePropertiesSection): {
        allDeclarationText: string;
        ruleText: string;
    };
    revealProperty(cssProperty: SDK.CSSProperty.CSSProperty): void;
    jumpToProperty(propertyName: string, sectionName?: string, blockName?: string): boolean;
    jumpToSection(sectionName: string, blockName: string): void;
    jumpToSectionBlock(section: string): void;
    forceUpdate(): void;
    private sectionsContainerKeyDown;
    private sectionsContainerFocusChanged;
    resetFocus(): void;
    onAddButtonLongClick(event: Event): void;
    private onFilterChanged;
    refreshUpdate(editedSection: StylePropertiesSection, editedTreeElement?: StylePropertyTreeElement): void;
    doUpdate(): Promise<void>;
    private fetchComputedStylesFor;
    onResize(): void;
    private innerResize;
    private resetCache;
    private fetchMatchedCascade;
    setEditingStyle(editing: boolean, _treeElement?: StylePropertyTreeElement): void;
    setActiveProperty(treeElement: StylePropertyTreeElement | null): void;
    onCSSModelChanged(event: Common.EventTarget.EventTargetEvent<ComputedStyleChangedEvent>): void;
    refreshComputedStyles(): Promise<void>;
    focusedSectionIndex(): number;
    continueEditingElement(sectionIndex: number, propertyIndex: number): void;
    private innerRebuildUpdate;
    private nodeStylesUpdatedForTest;
    rebuildSectionsForMatchedStyleRulesForTest(matchedStyles: SDK.CSSMatchedStyles.CSSMatchedStyles, computedStyles: Map<string, string> | null, parentsComputedStyles: Map<string, string> | null): Promise<SectionBlock[]>;
    private rebuildSectionsForMatchedStyleRules;
    createNewRuleInViaInspectorStyleSheet(): Promise<void>;
    private createNewRuleInStyleSheet;
    addBlankSection(insertAfterSection: StylePropertiesSection, styleSheetId: Protocol.CSS.StyleSheetId, ruleLocation: TextUtils.TextRange.TextRange): void;
    removeSection(section: StylePropertiesSection): void;
    filterRegex(): RegExp | null;
    private updateFilter;
    wasShown(): void;
    willHide(): void;
    hideAllPopovers(): void;
    getSectionBlockByName(name: string): SectionBlock | undefined;
    allSections(): StylePropertiesSection[];
    trackURLForChanges(url: Platform.DevToolsPath.UrlString): Promise<void>;
    isPropertyChanged(property: SDK.CSSProperty.CSSProperty): boolean;
    updateChangeStatus(): void;
    private refreshChangedLines;
    getFormattedChanges(): Promise<string>;
    private clipboardCopy;
    private createStylesSidebarToolbar;
    showToolbarPane(widget: UI.Widget.Widget | null, toggle: UI.Toolbar.ToolbarToggle | null): void;
    appendToolbarItem(item: UI.Toolbar.ToolbarItem): void;
    private startToolbarPaneAnimation;
    private createRenderingShortcuts;
    private createCopyAllChangesButton;
}
export declare const enum Events {
    InitialUpdateCompleted = "InitialUpdateCompleted",
    StylesUpdateCompleted = "StylesUpdateCompleted"
}
export interface StylesUpdateCompletedEvent {
    hasMatchedStyles: boolean;
}
export type EventTypes = {
    [Events.InitialUpdateCompleted]: void;
    [Events.StylesUpdateCompleted]: StylesUpdateCompletedEvent;
};
export declare class SectionBlock {
    #private;
    private readonly titleElementInternal;
    sections: StylePropertiesSection[];
    constructor(titleElement: Element | null, expandable?: boolean, expandedByDefault?: boolean);
    expand(expand: boolean): void;
    static createPseudoTypeBlock(pseudoType: Protocol.DOM.PseudoType, pseudoArgument: string | null): SectionBlock;
    static createInheritedPseudoTypeBlock(pseudoType: Protocol.DOM.PseudoType, pseudoArgument: string | null, node: SDK.DOMModel.DOMNode): Promise<SectionBlock>;
    static createRegisteredPropertiesBlock(expandedByDefault: boolean): SectionBlock;
    static createKeyframesBlock(keyframesName: string): SectionBlock;
    static createFontPaletteValuesRuleBlock(name: string): SectionBlock;
    static createPositionFallbackBlock(positionFallbackName: string): SectionBlock;
    static createPositionTryBlock(positionTryName: string): SectionBlock;
    static createInheritedNodeBlock(node: SDK.DOMModel.DOMNode): Promise<SectionBlock>;
    static createLayerBlock(rule: SDK.CSSRule.CSSStyleRule): SectionBlock;
    updateFilter(): number;
    titleElement(): Element | null;
}
export declare class IdleCallbackManager {
    private discarded;
    private readonly promises;
    private readonly queue;
    constructor();
    discard(): void;
    schedule(fn: () => void): void;
    protected scheduleIdleCallback(timeout: number): void;
    awaitDone(): Promise<void[]>;
}
export declare function quoteFamilyName(familyName: string): string;
export declare class CSSPropertyPrompt extends UI.TextPrompt.TextPrompt {
    private readonly isColorAware;
    private readonly cssCompletions;
    private selectedNodeComputedStyles;
    private parentNodeComputedStyles;
    private treeElement;
    private isEditingName;
    private readonly cssVariables;
    constructor(treeElement: StylePropertyTreeElement, isEditingName: boolean);
    onKeyDown(event: Event): void;
    onMouseWheel(event: Event): void;
    tabKeyPressed(): boolean;
    private handleNameOrValueUpDown;
    private isValueSuggestion;
    private buildPropertyCompletions;
}
export declare function unescapeCssString(input: string): string;
export declare function escapeUrlAsCssComment(urlText: string): string;
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(_context: UI.Context.Context, actionId: string): boolean;
}
export declare class ButtonProvider implements UI.Toolbar.Provider {
    private readonly button;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ButtonProvider;
    private longClicked;
    item(): UI.Toolbar.ToolbarItem;
}
export {};
