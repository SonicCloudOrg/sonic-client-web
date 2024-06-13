import * as Menus from '../../../ui/components/menus/menus.js';
import type * as Converters from '../converters/converters.js';
import * as Models from '../models/models.js';
import { type StepEditedEvent } from './StepEditor.js';
declare global {
    interface HTMLElementTagNameMap {
        'devtools-step-view': StepView;
    }
}
export declare const enum State {
    Default = "default",
    Success = "success",
    Current = "current",
    Outstanding = "outstanding",
    Error = "error",
    Stopped = "stopped"
}
export interface StepViewData {
    state: State;
    step?: Models.Schema.Step;
    section?: Models.Section.Section;
    error?: Error;
    hasBreakpoint: boolean;
    isEndOfGroup: boolean;
    isStartOfGroup: boolean;
    isFirstSection: boolean;
    isLastSection: boolean;
    stepIndex: number;
    sectionIndex: number;
    isRecording: boolean;
    isPlaying: boolean;
    removable: boolean;
    builtInConverters: Converters.Converter.Converter[];
    extensionConverters: Converters.Converter.Converter[];
    isSelected: boolean;
    recorderSettings?: Models.RecorderSettings.RecorderSettings;
}
export declare class CaptureSelectorsEvent extends Event {
    static readonly eventName = "captureselectors";
    data: Models.Schema.StepWithSelectors & Partial<Models.Schema.ClickAttributes>;
    constructor(step: Models.Schema.StepWithSelectors & Partial<Models.Schema.ClickAttributes>);
}
export declare class StopSelectorsCaptureEvent extends Event {
    static readonly eventName = "stopselectorscapture";
    constructor();
}
export declare class CopyStepEvent extends Event {
    static readonly eventName = "copystep";
    step: Models.Schema.Step;
    constructor(step: Models.Schema.Step);
}
export declare class StepChanged extends Event {
    static readonly eventName = "stepchanged";
    currentStep: Models.Schema.Step;
    newStep: Models.Schema.Step;
    constructor(currentStep: Models.Schema.Step, newStep: Models.Schema.Step);
}
export declare const enum AddStepPosition {
    BEFORE = "before",
    AFTER = "after"
}
export declare class AddStep extends Event {
    static readonly eventName = "addstep";
    position: AddStepPosition;
    stepOrSection: Models.Schema.Step | Models.Section.Section;
    constructor(stepOrSection: Models.Schema.Step | Models.Section.Section, position: AddStepPosition);
}
export declare class RemoveStep extends Event {
    static readonly eventName = "removestep";
    step: Models.Schema.Step;
    constructor(step: Models.Schema.Step);
}
export declare class AddBreakpointEvent extends Event {
    static readonly eventName = "addbreakpoint";
    index: number;
    constructor(index: number);
}
export declare class RemoveBreakpointEvent extends Event {
    static readonly eventName = "removebreakpoint";
    index: number;
    constructor(index: number);
}
type Action = {
    id: string;
    label: string;
    group: string;
    groupTitle: string;
    jslogContext?: string;
};
export interface ViewInput extends StepViewData {
    step?: Models.Schema.Step;
    section?: Models.Section.Section;
    state: State;
    error?: Error;
    showDetails: boolean;
    isEndOfGroup: boolean;
    isStartOfGroup: boolean;
    stepIndex: number;
    sectionIndex: number;
    isFirstSection: boolean;
    isLastSection: boolean;
    isRecording: boolean;
    isPlaying: boolean;
    isVisible: boolean;
    hasBreakpoint: boolean;
    removable: boolean;
    builtInConverters: Converters.Converter.Converter[];
    extensionConverters: Converters.Converter.Converter[];
    isSelected: boolean;
    recorderSettings?: Models.RecorderSettings.RecorderSettings;
    actions: Array<Action>;
    stepEdited: (event: StepEditedEvent) => void;
    onBreakpointClick: () => void;
    handleStepAction: (event: Menus.Menu.MenuItemSelectedEvent) => void;
    toggleShowDetails: () => void;
    onToggleShowDetailsKeydown: (event: Event) => void;
    onStepContextMenu: (event: MouseEvent) => void;
}
export type ViewOutput = unknown;
declare function viewFunction(input: ViewInput, _output: ViewOutput, target: HTMLElement | ShadowRoot): void;
export declare class StepView extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor(view?: typeof viewFunction);
    set data(data: StepViewData);
    get step(): Models.Schema.Step | undefined;
    get section(): Models.Section.Section | undefined;
    connectedCallback(): void;
    disconnectedCallback(): void;
}
export {};
