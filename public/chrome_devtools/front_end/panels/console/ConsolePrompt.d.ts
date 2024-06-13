import * as Common from '../../core/common/common.js';
import * as TextEditor from '../../ui/components/text_editor/text_editor.js';
import * as UI from '../../ui/legacy/legacy.js';
declare const ConsolePrompt_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<EventTypes>; /**
     *@description Warning shown to users when pasting text into the DevTools console.
     *@example {allow pasting} PH1
     */
    addEventListener<T extends Events.TextChanged>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<EventTypes, T>;
    once<T_1 extends Events.TextChanged>(eventType: T_1): Promise<EventTypes[T_1]>;
    removeEventListener<T_2 extends Events.TextChanged>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void; /**
     *@description Text a user needs to type in order to confirm that they are aware of the danger of pasting code into the DevTools console.
     */
    hasEventListeners(eventType: Events.TextChanged): boolean;
    dispatchEventToListeners<T_3 extends Events.TextChanged>(eventType: import("../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<EventTypes, T_3>): void;
}) & typeof UI.Widget.Widget;
export declare class ConsolePrompt extends ConsolePrompt_base {
    #private;
    private addCompletionsFromHistory;
    private historyInternal;
    private initialText;
    private editor;
    private readonly eagerPreviewElement;
    private textChangeThrottler;
    private readonly formatter;
    private requestPreviewBound;
    private requestPreviewCurrent;
    private readonly innerPreviewElement;
    private readonly promptIcon;
    private readonly iconThrottler;
    private readonly eagerEvalSetting;
    private previewRequestForTest;
    private highlightingNode;
    constructor();
    private eagerSettingChanged;
    belowEditorElement(): Element;
    private onTextChanged;
    private requestPreview;
    wasShown(): void;
    willHide(): void;
    history(): TextEditor.AutocompleteHistory.AutocompleteHistory;
    clearAutocomplete(): void;
    private isCaretAtEndOfPrompt;
    moveCaretToEndOfPrompt(): void;
    clear(): void;
    text(): string;
    setAddCompletionsFromHistory(value: boolean): void;
    private editorKeymap;
    private enterWillEvaluate;
    showSelfXssWarning(): void;
    private handleEnter;
    private updatePromptIcon;
    private appendCommand;
    private evaluateCommandInConsole;
    private substituteNames;
    private editorUpdate;
    focus(): void;
    private editorSetForTest;
}
export declare const enum Events {
    TextChanged = "TextChanged"
}
export type EventTypes = {
    [Events.TextChanged]: void;
};
export {};
