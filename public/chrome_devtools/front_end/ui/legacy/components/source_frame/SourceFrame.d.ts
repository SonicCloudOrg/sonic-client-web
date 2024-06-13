import * as Common from '../../../../core/common/common.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import * as CodeMirror from '../../../../third_party/codemirror.next/codemirror.next.js';
import * as TextEditor from '../../../components/text_editor/text_editor.js';
import * as UI from '../../legacy.js';
export interface SourceFrameOptions {
    lineNumbers?: boolean;
    lineWrapping?: boolean;
}
export declare const enum Events {
    EditorUpdate = "EditorUpdate",
    EditorScroll = "EditorScroll"
}
export type EventTypes = {
    [Events.EditorUpdate]: CodeMirror.ViewUpdate;
    [Events.EditorScroll]: void;
};
type FormatFn = (lineNo: number, state: CodeMirror.EditorState) => string;
export declare const LINE_NUMBER_FORMATTER: CodeMirror.Facet<FormatFn, FormatFn>;
declare const SourceFrameImpl_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>;
    addEventListener<T extends keyof EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends keyof EventTypes>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof EventTypes>(eventType: Platform.TypeScriptUtilities.NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.View.SimpleView;
export declare class SourceFrameImpl extends SourceFrameImpl_base implements UI.SearchableView.Searchable, UI.SearchableView.Replaceable, Transformer {
    #private;
    private readonly options;
    private readonly lazyContent;
    private prettyInternal;
    private rawContent;
    private formattedMap;
    private readonly prettyToggle;
    private shouldAutoPrettyPrint;
    private readonly progressToolbarItem;
    private textEditorInternal;
    private baseDoc;
    private prettyBaseDoc;
    private displayedSelection;
    private searchConfig;
    private delayedFindSearchMatches;
    private currentSearchResultIndex;
    private searchResults;
    private searchRegex;
    private loadError;
    private muteChangeEventsForSetContent;
    private readonly sourcePosition;
    private searchableView;
    private editable;
    private positionToReveal;
    private lineToScrollTo;
    private selectionToSet;
    private loadedInternal;
    private contentRequested;
    private wasmDisassemblyInternal;
    contentSet: boolean;
    private selfXssWarningDisabledSetting;
    constructor(lazyContent: () => Promise<TextUtils.ContentProvider.DeferredContent>, options?: SourceFrameOptions);
    disposeView(): void;
    private placeholderEditorState;
    protected editorConfiguration(doc: string | CodeMirror.Text): CodeMirror.Extension;
    protected onBlur(): void;
    protected onFocus(): void;
    protected onPaste(): boolean;
    showSelfXssWarning(): Promise<void>;
    get wasmDisassembly(): TextUtils.WasmDisassembly.WasmDisassembly | null;
    editorLocationToUILocation(lineNumber: number, columnNumber: number): {
        lineNumber: number;
        columnNumber: number;
    };
    editorLocationToUILocation(lineNumber: number): {
        lineNumber: number;
        columnNumber: number | undefined;
    };
    uiLocationToEditorLocation(lineNumber: number, columnNumber?: number | undefined): {
        lineNumber: number;
        columnNumber: number;
    };
    setCanPrettyPrint(canPrettyPrint: boolean, autoPrettyPrint?: boolean): void;
    setEditable(editable: boolean): void;
    private setPretty;
    private getLineNumberFormatter;
    private updateLineNumberFormatter;
    private updatePrettyPrintState;
    private prettyToRawLocation;
    private rawToPrettyLocation;
    hasLoadError(): boolean;
    wasShown(): void;
    willHide(): void;
    toolbarItems(): Promise<UI.Toolbar.ToolbarItem[]>;
    get loaded(): boolean;
    get textEditor(): TextEditor.TextEditor.TextEditor;
    get pretty(): boolean;
    get contentType(): string;
    protected getContentType(): string;
    private ensureContentLoaded;
    protected setDeferredContent(deferredContentPromise: Promise<TextUtils.ContentProvider.DeferredContent>): Promise<void>;
    revealPosition(position: RevealPosition, shouldHighlight?: boolean): void;
    private innerRevealPositionIfNeeded;
    private clearPositionToReveal;
    scrollToLine(line: number): void;
    private innerScrollToLineIfNeeded;
    setSelection(textRange: TextUtils.TextRange.TextRange): void;
    private innerSetSelectionIfNeeded;
    private wasShownOrLoaded;
    onTextChanged(): void;
    isClean(): boolean;
    contentCommitted(): void;
    protected getLanguageSupport(content: string | CodeMirror.Text): Promise<CodeMirror.Extension>;
    updateLanguageMode(content: string): Promise<void>;
    setContent(content: string | CodeMirror.Text): Promise<void>;
    setSearchableView(view: UI.SearchableView.SearchableView | null): void;
    private doFindSearchMatches;
    performSearch(searchConfig: UI.SearchableView.SearchConfig, shouldJump: boolean, jumpBackwards?: boolean): void;
    private resetCurrentSearchResultIndex;
    private resetSearch;
    onSearchCanceled(): void;
    jumpToLastSearchResult(): void;
    private searchResultIndexForCurrentSelection;
    jumpToNextSearchResult(): void;
    jumpToPreviousSearchResult(): void;
    supportsCaseSensitiveSearch(): boolean;
    supportsRegexSearch(): boolean;
    jumpToSearchResult(index: number): void;
    replaceSelectionWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    replaceAllWith(searchConfig: UI.SearchableView.SearchConfig, replacement: string): void;
    private collectRegexMatches;
    canEditSource(): boolean;
    private updateSourcePosition;
    onContextMenu(event: MouseEvent): boolean;
    protected populateTextAreaContextMenu(_menu: UI.ContextMenu.ContextMenu, _lineNumber: number, _columnNumber: number): void;
    onLineGutterContextMenu(position: number, event: MouseEvent): boolean;
    protected populateLineGutterContextMenu(_menu: UI.ContextMenu.ContextMenu, _lineNumber: number): void;
    focus(): void;
}
export declare class SelfXssWarningDialog {
    static show(): Promise<boolean>;
}
export interface Transformer {
    editorLocationToUILocation(lineNumber: number, columnNumber: number): {
        lineNumber: number;
        columnNumber: number;
    };
    editorLocationToUILocation(lineNumber: number): {
        lineNumber: number;
        columnNumber: number | undefined;
    };
    uiLocationToEditorLocation(lineNumber: number, columnNumber?: number): {
        lineNumber: number;
        columnNumber: number;
    };
}
export declare const enum DecoratorType {
    PERFORMANCE = "performance",
    MEMORY = "memory",
    COVERAGE = "coverage"
}
export declare const addNonBreakableLines: CodeMirror.StateEffectType<readonly number[]>;
export declare function isBreakableLine(state: CodeMirror.EditorState, line: CodeMirror.Line): boolean;
/**
 * Reveal position can either be a single point or a range.
 *
 * A single point can either be specified as a line/column combo or as an absolute
 * editor offset.
 */
export type RevealPosition = number | {
    lineNumber: number;
    columnNumber?: number;
} | {
    from: {
        lineNumber: number;
        columnNumber: number;
    };
    to: {
        lineNumber: number;
        columnNumber: number;
    };
};
export {};
