import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as Models from '../models/models.js';
import { type DeepImmutable } from './util.js';
declare const LitElement: typeof LitHtml.LitElement;
declare const defaultValuesByAttribute: DeepImmutable<{
    selectors: string[][];
    offsetX: number;
    offsetY: number;
    target: string;
    frame: number[];
    assertedEvents: {
        type: string;
        url: string;
        title: string;
    }[];
    value: string;
    key: string;
    operator: string;
    count: number;
    expression: string;
    x: number;
    y: number;
    url: string;
    timeout: number;
    duration: number;
    deviceType: string;
    button: string;
    type: string;
    width: number;
    height: number;
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
    isLandscape: boolean;
    download: number;
    upload: number;
    latency: number;
    name: string;
    parameters: string;
    properties: string;
    attributes: {
        name: string;
        value: string;
    }[];
    visible: boolean;
}>;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-recorder-step-editor': StepEditor;
        'devtools-recorder-selector-picker-button': RecorderSelectorPickerButton;
    }
}
export declare class StepEditedEvent extends Event {
    static readonly eventName = "stepedited";
    data: Models.Schema.Step;
    constructor(step: Models.Schema.Step);
}
export interface EditorState {
    type: Models.Schema.StepType;
    target?: string;
    selectors?: string[][];
    frame?: number[];
    x?: number;
    y?: number;
    offsetX?: number;
    offsetY?: number;
    key?: string;
    expression?: string;
    value?: string;
    operator?: string;
    count?: number;
    assertedEvents?: Models.Schema.AssertedEvent[];
    url?: string;
    timeout?: number;
    button?: string;
    duration?: number;
    deviceType?: string;
    width?: number;
    height?: number;
    deviceScaleFactor?: number;
    isMobile?: boolean;
    hasTouch?: boolean;
    isLandscape?: boolean;
    download?: number;
    upload?: number;
    latency?: number;
    name?: string;
    parameters?: string;
    visible?: boolean;
    properties?: string;
    attributes?: Array<{
        name: string;
        value: string;
    }>;
}
export declare class EditorState {
    #private;
    static default(type: Models.Schema.StepType): Promise<DeepImmutable<EditorState>>;
    static defaultByAttribute<Attribute extends keyof typeof defaultValuesByAttribute>(state: DeepImmutable<EditorState>, attribute: Attribute): Promise<DeepImmutable<typeof defaultValuesByAttribute[Attribute]>>;
    static fromStep(step: DeepImmutable<Models.Schema.Step>): DeepImmutable<EditorState>;
    static toStep(state: DeepImmutable<EditorState>): Models.Schema.Step;
}
/**
 * @fires RequestSelectorAttributeEvent#requestselectorattribute
 * @fires SelectorPickedEvent#selectorpicked
 */
declare class RecorderSelectorPickerButton extends LitElement {
    #private;
    static styles: CSSStyleSheet[];
    disabled: boolean;
    constructor();
    disconnectedCallback(): void;
    protected render(): LitHtml.TemplateResult | undefined;
}
/**
 * @fires RequestSelectorAttributeEvent#requestselectorattribute
 * @fires StepEditedEvent#stepedited
 */
export declare class StepEditor extends LitElement {
    #private;
    static styles: CSSStyleSheet[];
    private state;
    private error;
    isTypeEditable: boolean;
    disabled: boolean;
    constructor();
    protected createRenderRoot(): HTMLElement | DocumentFragment;
    set step(step: DeepImmutable<Models.Schema.Step>);
    protected render(): LitHtml.TemplateResult;
}
export {};
