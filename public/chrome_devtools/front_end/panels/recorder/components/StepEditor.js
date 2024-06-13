// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as Host from '../../../core/host/host.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as Platform from '../../../core/platform/platform.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as SuggestionInput from '../../../ui/components/suggestion_input/suggestion_input.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import * as Controllers from '../controllers/controllers.js';
import * as Models from '../models/models.js';
import * as Util from '../util/util.js';
import stepEditorStyles from './stepEditor.css.js';
import { ArrayAssignments, assert, deepFreeze, immutableDeepAssign, InsertAssignment, } from './util.js';
const { html, Decorators, Directives, LitElement } = LitHtml;
const { customElement, property, state } = Decorators;
const { live } = Directives;
const typeConverters = Object.freeze({
    string: (value) => value.trim(),
    number: (value) => {
        const number = parseFloat(value);
        if (Number.isNaN(number)) {
            return 0;
        }
        return number;
    },
    boolean: (value) => {
        if (value.toLowerCase() === 'true') {
            return true;
        }
        return false;
    },
});
const dataTypeByAttribute = Object.freeze({
    selectors: 'string',
    offsetX: 'number',
    offsetY: 'number',
    target: 'string',
    frame: 'number',
    assertedEvents: 'string',
    value: 'string',
    key: 'string',
    operator: 'string',
    count: 'number',
    expression: 'string',
    x: 'number',
    y: 'number',
    url: 'string',
    type: 'string',
    timeout: 'number',
    duration: 'number',
    button: 'string',
    deviceType: 'string',
    width: 'number',
    height: 'number',
    deviceScaleFactor: 'number',
    isMobile: 'boolean',
    hasTouch: 'boolean',
    isLandscape: 'boolean',
    download: 'number',
    upload: 'number',
    latency: 'number',
    name: 'string',
    parameters: 'string',
    visible: 'boolean',
    properties: 'string',
    attributes: 'string',
});
const defaultValuesByAttribute = deepFreeze({
    selectors: [['.cls']],
    offsetX: 1,
    offsetY: 1,
    target: 'main',
    frame: [0],
    assertedEvents: [
        { type: 'navigation', url: 'https://example.com', title: 'Title' },
    ],
    value: 'Value',
    key: 'Enter',
    operator: '>=',
    count: 1,
    expression: 'true',
    x: 0,
    y: 0,
    url: 'https://example.com',
    timeout: 5000,
    duration: 50,
    deviceType: 'mouse',
    button: 'primary',
    type: 'click',
    width: 800,
    height: 600,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
    isLandscape: true,
    download: 1000,
    upload: 1000,
    latency: 25,
    name: 'customParam',
    parameters: '{}',
    properties: '{}',
    attributes: [{ name: 'attribute', value: 'value' }],
    visible: true,
});
const attributesByType = deepFreeze({
    [Models.Schema.StepType.Click]: {
        required: ['selectors', 'offsetX', 'offsetY'],
        optional: [
            'assertedEvents',
            'button',
            'deviceType',
            'duration',
            'frame',
            'target',
            'timeout',
        ],
    },
    [Models.Schema.StepType.DoubleClick]: {
        required: ['offsetX', 'offsetY', 'selectors'],
        optional: [
            'assertedEvents',
            'button',
            'deviceType',
            'frame',
            'target',
            'timeout',
        ],
    },
    [Models.Schema.StepType.Hover]: {
        required: ['selectors'],
        optional: ['assertedEvents', 'frame', 'target', 'timeout'],
    },
    [Models.Schema.StepType.Change]: {
        required: ['selectors', 'value'],
        optional: ['assertedEvents', 'frame', 'target', 'timeout'],
    },
    [Models.Schema.StepType.KeyDown]: {
        required: ['key'],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.KeyUp]: {
        required: ['key'],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.Scroll]: {
        required: [],
        optional: ['assertedEvents', 'frame', 'target', 'timeout', 'x', 'y'],
    },
    [Models.Schema.StepType.Close]: {
        required: [],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.Navigate]: {
        required: ['url'],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.WaitForElement]: {
        required: ['selectors'],
        optional: [
            'assertedEvents',
            'attributes',
            'count',
            'frame',
            'operator',
            'properties',
            'target',
            'timeout',
            'visible',
        ],
    },
    [Models.Schema.StepType.WaitForExpression]: {
        required: ['expression'],
        optional: ['assertedEvents', 'frame', 'target', 'timeout'],
    },
    [Models.Schema.StepType.CustomStep]: {
        required: ['name', 'parameters'],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.EmulateNetworkConditions]: {
        required: ['download', 'latency', 'upload'],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
    [Models.Schema.StepType.SetViewport]: {
        required: [
            'deviceScaleFactor',
            'hasTouch',
            'height',
            'isLandscape',
            'isMobile',
            'width',
        ],
        optional: ['assertedEvents', 'target', 'timeout'],
    },
});
const UIStrings = {
    /**
     *@description The text that is disabled when the steps were not saved due to an error. The error message itself is always in English and not translated.
     *@example {Saving failed} error
     */
    notSaved: 'Not saved: {error}',
    /**
     *@description The button title that adds a new attribute to the form.
     *@example {timeout} attributeName
     */
    addAttribute: 'Add {attributeName}',
    /**
     *@description The title of a button that deletes an attribute from the form.
     */
    deleteRow: 'Delete row',
    /**
     *@description The title of a button that allows you to select an element on the page and update CSS/ARIA selectors.
     */
    selectorPicker: 'Select an element in the page to update selectors',
    /**
     *@description The title of a button that adds a new input field for the entry of the frame index. Frame index is the number of the frame within the page's frame tree.
     */
    addFrameIndex: 'Add frame index within the frame tree',
    /**
     *@description The title of a button that removes a frame index field from the form.
     */
    removeFrameIndex: 'Remove frame index',
    /**
     *@description The title of a button that adds a field to input a part of a selector in the editor form.
     */
    addSelectorPart: 'Add a selector part',
    /**
     *@description The title of a button that removes a field to input a part of a selector in the editor form.
     */
    removeSelectorPart: 'Remove a selector part',
    /**
     *@description The title of a button that adds a field to input a selector in the editor form.
     */
    addSelector: 'Add a selector',
    /**
     *@description The title of a button that removes a field to input a selector in the editor form.
     */
    removeSelector: 'Remove a selector',
    /**
     *@description The error message display when a user enters a type in the input not associates with any existing types.
     */
    unknownActionType: 'Unknown action type.',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/components/StepEditor.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class StepEditedEvent extends Event {
    static eventName = 'stepedited';
    data;
    constructor(step) {
        super(StepEditedEvent.eventName, { bubbles: true, composed: true });
        this.data = step;
    }
}
// Makes use of the fact that JSON values get their undefined values cleaned
// after stringification.
const cleanUndefineds = (value) => {
    return JSON.parse(JSON.stringify(value));
};
export class EditorState {
    static #puppeteer = new Util.SharedObject.SharedObject(() => Models.RecordingPlayer.RecordingPlayer.connectPuppeteer(), ({ browser }) => Models.RecordingPlayer.RecordingPlayer.disconnectPuppeteer(browser));
    static async default(type) {
        const state = { type };
        const attributes = attributesByType[state.type];
        let promise = Promise.resolve();
        for (const attribute of attributes.required) {
            promise = Promise.all([
                promise,
                (async () => Object.assign(state, {
                    [attribute]: await this.defaultByAttribute(state, attribute),
                }))(),
            ]);
        }
        await promise;
        return Object.freeze(state);
    }
    static async defaultByAttribute(_state, attribute) {
        return this.#puppeteer.run(puppeteer => {
            switch (attribute) {
                case 'assertedEvents': {
                    return immutableDeepAssign(defaultValuesByAttribute.assertedEvents, new ArrayAssignments({
                        0: {
                            url: puppeteer.page.url() || defaultValuesByAttribute.assertedEvents[0].url,
                        },
                    }));
                }
                case 'url': {
                    return puppeteer.page.url() || defaultValuesByAttribute.url;
                }
                case 'height': {
                    return (puppeteer.page.evaluate(() => visualViewport.height) ||
                        defaultValuesByAttribute.height);
                }
                case 'width': {
                    return (puppeteer.page.evaluate(() => visualViewport.width) ||
                        defaultValuesByAttribute.width);
                }
                default: {
                    return defaultValuesByAttribute[attribute];
                }
            }
        });
    }
    static fromStep(step) {
        const state = structuredClone(step);
        for (const key of ['parameters', 'properties']) {
            if (key in step && step[key] !== undefined) {
                state[key] = JSON.stringify(step[key]);
            }
        }
        if ('attributes' in step && step.attributes) {
            state.attributes = [];
            for (const [name, value] of Object.entries(step.attributes)) {
                state.attributes.push({ name, value });
            }
        }
        if ('selectors' in step) {
            state.selectors = step.selectors.map(selector => {
                if (typeof selector === 'string') {
                    return [selector];
                }
                return [...selector];
            });
        }
        return deepFreeze(state);
    }
    static toStep(state) {
        const step = structuredClone(state);
        for (const key of ['parameters', 'properties']) {
            const value = state[key];
            if (value) {
                Object.assign(step, { [key]: JSON.parse(value) });
            }
        }
        if (state.attributes) {
            if (state.attributes.length !== 0) {
                const attributes = {};
                for (const { name, value } of state.attributes) {
                    Object.assign(attributes, { [name]: value });
                }
                Object.assign(step, { attributes });
            }
            else if ('attributes' in step) {
                delete step.attributes;
            }
        }
        if (state.selectors) {
            const selectors = state.selectors.filter(selector => selector.length > 0).map(selector => {
                if (selector.length === 1) {
                    return selector[0];
                }
                return [...selector];
            });
            if (selectors.length !== 0) {
                Object.assign(step, { selectors });
            }
            else if ('selectors' in step) {
                // @ts-expect-error We want to trigger an error in the parsing phase.
                delete step.selectors;
            }
        }
        if (state.frame && state.frame.length === 0 && 'frame' in step) {
            delete step.frame;
        }
        return cleanUndefineds(Models.SchemaUtils.parseStep(step));
    }
}
/**
 * @fires RequestSelectorAttributeEvent#requestselectorattribute
 * @fires SelectorPickedEvent#selectorpicked
 */
let RecorderSelectorPickerButton = class RecorderSelectorPickerButton extends LitElement {
    static styles = [stepEditorStyles];
    #picker = new Controllers.SelectorPicker.SelectorPicker(this);
    constructor() {
        super();
        this.disabled = false;
    }
    #handleClickEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.#picker.toggle();
    };
    disconnectedCallback() {
        super.disconnectedCallback();
        void this.#picker.stop();
    }
    render() {
        if (this.disabled) {
            return;
        }
        return html `<devtools-button
      @click=${this.#handleClickEvent}
      .title=${i18nString(UIStrings.selectorPicker)}
      class="selector-picker"
      .size=${"SMALL" /* Buttons.Button.Size.SMALL */}
      .iconName=${'select-element'}
      .active=${this.#picker.active}
      .variant=${"icon" /* Buttons.Button.Variant.ICON */}
      jslog=${VisualLogging.toggle('selector-picker').track({
            click: true,
        })}
    ></devtools-button>`;
    }
};
__decorate([
    property()
], RecorderSelectorPickerButton.prototype, "disabled", void 0);
RecorderSelectorPickerButton = __decorate([
    customElement('devtools-recorder-selector-picker-button')
], RecorderSelectorPickerButton);
/**
 * @fires RequestSelectorAttributeEvent#requestselectorattribute
 * @fires StepEditedEvent#stepedited
 */
let StepEditor = class StepEditor extends LitElement {
    static styles = [stepEditorStyles];
    #renderedAttributes = new Set();
    constructor() {
        super();
        this.state = { type: Models.Schema.StepType.WaitForElement };
        this.isTypeEditable = true;
        this.disabled = false;
    }
    createRenderRoot() {
        const root = super.createRenderRoot();
        root.addEventListener('keydown', this.#handleKeyDownEvent);
        return root;
    }
    set step(step) {
        this.state = deepFreeze(EditorState.fromStep(step));
        this.error = undefined;
    }
    #commit(updatedState) {
        try {
            this.dispatchEvent(new StepEditedEvent(EditorState.toStep(updatedState)));
            // Note we don't need to update this variable since it will come from up
            // the tree, but processing up the tree is asynchronous implying we cannot
            // reliably know when the state will come back down. Since we need to
            // focus the DOM elements that may be created as a result of this new
            // state, we set it here for waiting on the updateComplete promise later.
            this.state = updatedState;
        }
        catch (error) {
            this.error = error.message;
        }
    }
    #handleSelectorPickedEvent = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.#commit(immutableDeepAssign(this.state, {
            target: event.data.target,
            frame: event.data.frame,
            selectors: event.data.selectors.map(selector => typeof selector === 'string' ? [selector] : selector),
            offsetX: event.data.offsetX,
            offsetY: event.data.offsetY,
        }));
    };
    #handleAddOrRemoveClick = (assignments, query, metric) => event => {
        event.preventDefault();
        event.stopPropagation();
        this.#commit(immutableDeepAssign(this.state, assignments));
        this.#ensureFocus(query);
        if (metric) {
            Host.userMetrics.recordingEdited(metric);
        }
    };
    #handleKeyDownEvent = (event) => {
        assert(event instanceof KeyboardEvent);
        if (event.target instanceof SuggestionInput.SuggestionInput.SuggestionInput && event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            const elements = this.renderRoot.querySelectorAll('devtools-suggestion-input');
            const element = [...elements].findIndex(value => value === event.target);
            if (element >= 0 && element + 1 < elements.length) {
                elements[element + 1].focus();
            }
            else {
                event.target.blur();
            }
        }
    };
    #handleInputBlur = (opts) => event => {
        assert(event.target instanceof SuggestionInput.SuggestionInput.SuggestionInput);
        if (event.target.disabled) {
            return;
        }
        const dataType = dataTypeByAttribute[opts.attribute];
        const value = typeConverters[dataType](event.target.value);
        const assignments = opts.from.bind(this)(value);
        if (!assignments) {
            return;
        }
        this.#commit(immutableDeepAssign(this.state, assignments));
        if (opts.metric) {
            Host.userMetrics.recordingEdited(opts.metric);
        }
    };
    #handleTypeInputBlur = async (event) => {
        assert(event.target instanceof SuggestionInput.SuggestionInput.SuggestionInput);
        if (event.target.disabled) {
            return;
        }
        const value = event.target.value;
        if (value === this.state.type) {
            return;
        }
        if (!Object.values(Models.Schema.StepType).includes(value)) {
            this.error = i18nString(UIStrings.unknownActionType);
            return;
        }
        this.#commit(await EditorState.default(value));
        Host.userMetrics.recordingEdited(9 /* Host.UserMetrics.RecordingEdited.TypeChanged */);
    };
    #handleAddRowClickEvent = async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const attribute = event.target.dataset.attribute;
        this.#commit(immutableDeepAssign(this.state, {
            [attribute]: await EditorState.defaultByAttribute(this.state, attribute),
        }));
        this.#ensureFocus(`[data-attribute=${attribute}].attribute devtools-suggestion-input`);
    };
    #renderInlineButton(opts) {
        if (this.disabled) {
            return;
        }
        return html `
      <devtools-button
        title=${opts.title}
        .size=${"SMALL" /* Buttons.Button.Size.SMALL */}
        .iconName=${opts.iconName}
        .variant=${"icon" /* Buttons.Button.Variant.ICON */}
        jslog=${VisualLogging.action(opts.class).track({
            click: true,
        })}
        class="inline-button ${opts.class}"
        @click=${opts.onClick}
      ></devtools-button>
    `;
    }
    #renderDeleteButton(attribute) {
        if (this.disabled) {
            return;
        }
        const attributes = attributesByType[this.state.type];
        const optional = [...attributes.optional].includes(attribute);
        if (!optional || this.disabled) {
            return;
        }
        // clang-format off
        return html `<devtools-button
      .size=${"SMALL" /* Buttons.Button.Size.SMALL */}
      .iconName=${'bin'}
      .variant=${"icon" /* Buttons.Button.Variant.ICON */}
      .title=${i18nString(UIStrings.deleteRow)}
      class="inline-button delete-row"
      data-attribute=${attribute}
      jslog=${VisualLogging.action('delete').track({ click: true })}
      @click=${(event) => {
            event.preventDefault();
            event.stopPropagation();
            this.#commit(immutableDeepAssign(this.state, { [attribute]: undefined }));
        }}
    ></devtools-button>`;
        // clang-format on
    }
    #renderTypeRow(editable) {
        this.#renderedAttributes.add('type');
        // clang-format off
        return html `<div class="row attribute" data-attribute="type" jslog=${VisualLogging.treeItem('type')}>
      <div>type<span class="separator">:</span></div>
      <devtools-suggestion-input
        .disabled=${!editable || this.disabled}
        .options=${Object.values(Models.Schema.StepType)}
        .placeholder=${defaultValuesByAttribute.type}
        .value=${live(this.state.type)}
        @blur=${this.#handleTypeInputBlur}
      ></devtools-suggestion-input>
    </div>`;
        // clang-format on
    }
    #renderRow(attribute) {
        this.#renderedAttributes.add(attribute);
        const attributeValue = this.state[attribute]?.toString();
        if (attributeValue === undefined) {
            return;
        }
        // clang-format off
        return html `<div class="row attribute" data-attribute=${attribute} jslog=${VisualLogging.treeItem(Platform.StringUtilities.toKebabCase(attribute))}>
      <div>${attribute}<span class="separator">:</span></div>
      <devtools-suggestion-input
        .disabled=${this.disabled}
        .placeholder=${defaultValuesByAttribute[attribute].toString()}
        .value=${live(attributeValue)}
        .mimeType=${(() => {
            switch (attribute) {
                case 'expression':
                    return 'text/javascript';
                case 'properties':
                    return 'application/json';
                default:
                    return '';
            }
        })()}
        @blur=${this.#handleInputBlur({
            attribute,
            from(value) {
                if (this.state[attribute] === undefined) {
                    return;
                }
                switch (attribute) {
                    case 'properties':
                        Host.userMetrics.recordingAssertion(2 /* Host.UserMetrics.RecordingAssertion.PropertyAssertionEdited */);
                        break;
                }
                return { [attribute]: value };
            },
            metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
        })}
      ></devtools-suggestion-input>
      ${this.#renderDeleteButton(attribute)}
    </div>`;
        // clang-format on
    }
    #renderFrameRow() {
        this.#renderedAttributes.add('frame');
        if (this.state.frame === undefined) {
            return;
        }
        // clang-format off
        return html `
      <div class="attribute" data-attribute="frame" jslog=${VisualLogging.treeItem('frame')}>
        <div class="row">
          <div>frame<span class="separator">:</span></div>
          ${this.#renderDeleteButton('frame')}
        </div>
        ${this.state.frame.map((frame, index, frames) => {
            return html `
            <div class="padded row">
              <devtools-suggestion-input
                .disabled=${this.disabled}
                .placeholder=${defaultValuesByAttribute.frame[0].toString()}
                .value=${live(frame.toString())}
                data-path=${`frame.${index}`}
                @blur=${this.#handleInputBlur({
                attribute: 'frame',
                from(value) {
                    if (this.state.frame?.[index] === undefined) {
                        return;
                    }
                    return {
                        frame: new ArrayAssignments({ [index]: value }),
                    };
                },
                metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
            })}
              ></devtools-suggestion-input>
              ${this.#renderInlineButton({
                class: 'add-frame',
                title: i18nString(UIStrings.addFrameIndex),
                iconName: 'plus',
                onClick: this.#handleAddOrRemoveClick({
                    frame: new ArrayAssignments({
                        [index + 1]: new InsertAssignment(defaultValuesByAttribute.frame[0]),
                    }),
                }, `devtools-suggestion-input[data-path="frame.${index + 1}"]`, 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */),
            })}
              ${this.#renderInlineButton({
                class: 'remove-frame',
                title: i18nString(UIStrings.removeFrameIndex),
                iconName: 'minus',
                onClick: this.#handleAddOrRemoveClick({
                    frame: new ArrayAssignments({ [index]: undefined }),
                }, `devtools-suggestion-input[data-path="frame.${Math.min(index, frames.length - 2)}"]`, 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */),
            })}
            </div>
          `;
        })}
      </div>
    `;
        // clang-format on
    }
    #renderSelectorsRow() {
        this.#renderedAttributes.add('selectors');
        if (this.state.selectors === undefined) {
            return;
        }
        // clang-format off
        return html `<div class="attribute" data-attribute="selectors" jslog=${VisualLogging.treeItem('selectors')}>
      <div class="row">
        <div>selectors<span class="separator">:</span></div>
        <devtools-recorder-selector-picker-button
          @selectorpicked=${this.#handleSelectorPickedEvent}
          .disabled=${this.disabled}
        ></devtools-recorder-selector-picker-button>
        ${this.#renderDeleteButton('selectors')}
      </div>
      ${this.state.selectors.map((selector, index, selectors) => {
            return html `<div class="padded row" data-selector-path=${index}>
            <div>selector #${index + 1}<span class="separator">:</span></div>
            ${this.#renderInlineButton({
                class: 'add-selector',
                title: i18nString(UIStrings.addSelector),
                iconName: 'plus',
                onClick: this.#handleAddOrRemoveClick({
                    selectors: new ArrayAssignments({
                        [index + 1]: new InsertAssignment(structuredClone(defaultValuesByAttribute.selectors[0])),
                    }),
                }, `devtools-suggestion-input[data-path="selectors.${index + 1}.0"]`, 4 /* Host.UserMetrics.RecordingEdited.SelectorAdded */),
            })}
            ${this.#renderInlineButton({
                class: 'remove-selector',
                title: i18nString(UIStrings.removeSelector),
                iconName: 'minus',
                onClick: this.#handleAddOrRemoveClick({ selectors: new ArrayAssignments({ [index]: undefined }) }, `devtools-suggestion-input[data-path="selectors.${Math.min(index, selectors.length - 2)}.0"]`, 5 /* Host.UserMetrics.RecordingEdited.SelectorRemoved */),
            })}
          </div>
          ${selector.map((part, partIndex, parts) => {
                return html `<div
              class="double padded row"
              data-selector-path="${index}.${partIndex}"
            >
              <devtools-suggestion-input
                .disabled=${this.disabled}
                .placeholder=${defaultValuesByAttribute.selectors[0][0]}
                .value=${live(part)}
                data-path=${`selectors.${index}.${partIndex}`}
                @blur=${this.#handleInputBlur({
                    attribute: 'selectors',
                    from(value) {
                        if (this.state.selectors?.[index]?.[partIndex] === undefined) {
                            return;
                        }
                        return {
                            selectors: new ArrayAssignments({
                                [index]: new ArrayAssignments({
                                    [partIndex]: value,
                                }),
                            }),
                        };
                    },
                    metric: 7 /* Host.UserMetrics.RecordingEdited.SelectorPartEdited */,
                })}
              ></devtools-suggestion-input>
              ${this.#renderInlineButton({
                    class: 'add-selector-part',
                    title: i18nString(UIStrings.addSelectorPart),
                    iconName: 'plus',
                    onClick: this.#handleAddOrRemoveClick({
                        selectors: new ArrayAssignments({
                            [index]: new ArrayAssignments({
                                [partIndex + 1]: new InsertAssignment(defaultValuesByAttribute.selectors[0][0]),
                            }),
                        }),
                    }, `devtools-suggestion-input[data-path="selectors.${index}.${partIndex + 1}"]`, 6 /* Host.UserMetrics.RecordingEdited.SelectorPartAdded */),
                })}
              ${this.#renderInlineButton({
                    class: 'remove-selector-part',
                    title: i18nString(UIStrings.removeSelectorPart),
                    iconName: 'minus',
                    onClick: this.#handleAddOrRemoveClick({
                        selectors: new ArrayAssignments({
                            [index]: new ArrayAssignments({
                                [partIndex]: undefined,
                            }),
                        }),
                    }, `devtools-suggestion-input[data-path="selectors.${index}.${Math.min(partIndex, parts.length - 2)}"]`, 8 /* Host.UserMetrics.RecordingEdited.SelectorPartRemoved */),
                })}
            </div>`;
            })}`;
        })}
    </div>`;
        // clang-format on
    }
    #renderAssertedEvents() {
        this.#renderedAttributes.add('assertedEvents');
        if (this.state.assertedEvents === undefined) {
            return;
        }
        // clang-format off
        return html `<div class="attribute" data-attribute="assertedEvents" jslog=${VisualLogging.treeItem('asserted-events')}>
      <div class="row">
        <div>asserted events<span class="separator">:</span></div>
        ${this.#renderDeleteButton('assertedEvents')}
      </div>
      ${this.state.assertedEvents.map((event, index) => {
            return html ` <div class="padded row" jslog=${VisualLogging.treeItem('event-type')}>
            <div>type<span class="separator">:</span></div>
            <div>${event.type}</div>
          </div>
          <div class="padded row" jslog=${VisualLogging.treeItem('event-title')}>
            <div>title<span class="separator">:</span></div>
            <devtools-suggestion-input
              .disabled=${this.disabled}
              .placeholder=${defaultValuesByAttribute.assertedEvents[0].title}
              .value=${live(event.title ?? '')}
              @blur=${this.#handleInputBlur({
                attribute: 'assertedEvents',
                from(value) {
                    if (this.state.assertedEvents?.[index]?.title === undefined) {
                        return;
                    }
                    return {
                        assertedEvents: new ArrayAssignments({
                            [index]: { title: value },
                        }),
                    };
                },
                metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
            })}
            ></devtools-suggestion-input>
          </div>
          <div class="padded row" jslog=${VisualLogging.treeItem('event-url')}>
            <div>url<span class="separator">:</span></div>
            <devtools-suggestion-input
              .disabled=${this.disabled}
              .placeholder=${defaultValuesByAttribute.assertedEvents[0].url}
              .value=${live(event.url ?? '')}
              @blur=${this.#handleInputBlur({
                attribute: 'url',
                from(value) {
                    if (this.state.assertedEvents?.[index]?.url === undefined) {
                        return;
                    }
                    return {
                        assertedEvents: new ArrayAssignments({
                            [index]: { url: value },
                        }),
                    };
                },
                metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
            })}
            ></devtools-suggestion-input>
          </div>`;
        })}
    </div> `;
        // clang-format on
    }
    #renderAttributesRow() {
        this.#renderedAttributes.add('attributes');
        if (this.state.attributes === undefined) {
            return;
        }
        // clang-format off
        return html `<div class="attribute" data-attribute="attributes" jslog=${VisualLogging.treeItem('attributes')}>
      <div class="row">
        <div>attributes<span class="separator">:</span></div>
        ${this.#renderDeleteButton('attributes')}
      </div>
      ${this.state.attributes.map(({ name, value }, index, attributes) => {
            return html `<div class="padded row" jslog=${VisualLogging.treeItem('attribute')}>
          <devtools-suggestion-input
            .disabled=${this.disabled}
            .placeholder=${defaultValuesByAttribute.attributes[0].name}
            .value=${live(name)}
            data-path=${`attributes.${index}.name`}
            jslog=${VisualLogging.key().track({ change: true })}
            @blur=${this.#handleInputBlur({
                attribute: 'attributes',
                from(name) {
                    if (this.state.attributes?.[index]?.name === undefined) {
                        return;
                    }
                    Host.userMetrics.recordingAssertion(3 /* Host.UserMetrics.RecordingAssertion.AttributeAssertionEdited */);
                    return {
                        attributes: new ArrayAssignments({ [index]: { name } }),
                    };
                },
                metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
            })}
          ></devtools-suggestion-input>
          <span class="separator">:</span>
          <devtools-suggestion-input
            .disabled=${this.disabled}
            .placeholder=${defaultValuesByAttribute.attributes[0].value}
            .value=${live(value)}
            data-path=${`attributes.${index}.value`}
            @blur=${this.#handleInputBlur({
                attribute: 'attributes',
                from(value) {
                    if (this.state.attributes?.[index]?.value === undefined) {
                        return;
                    }
                    Host.userMetrics.recordingAssertion(3 /* Host.UserMetrics.RecordingAssertion.AttributeAssertionEdited */);
                    return {
                        attributes: new ArrayAssignments({ [index]: { value } }),
                    };
                },
                metric: 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */,
            })}
          ></devtools-suggestion-input>
          ${this.#renderInlineButton({
                class: 'add-attribute-assertion',
                title: i18nString(UIStrings.addSelectorPart),
                iconName: 'plus',
                onClick: this.#handleAddOrRemoveClick({
                    attributes: new ArrayAssignments({
                        [index + 1]: new InsertAssignment((() => {
                            {
                                const names = new Set(attributes.map(({ name }) => name));
                                const defaultAttribute = defaultValuesByAttribute.attributes[0];
                                let name = defaultAttribute.name;
                                let i = 0;
                                while (names.has(name)) {
                                    ++i;
                                    name = `${defaultAttribute.name}-${i}`;
                                }
                                return { ...defaultAttribute, name };
                            }
                        })()),
                    }),
                }, `devtools-suggestion-input[data-path="attributes.${index + 1}.name"]`, 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */),
            })}
          ${this.#renderInlineButton({
                class: 'remove-attribute-assertion',
                title: i18nString(UIStrings.removeSelectorPart),
                iconName: 'minus',
                onClick: this.#handleAddOrRemoveClick({ attributes: new ArrayAssignments({ [index]: undefined }) }, `devtools-suggestion-input[data-path="attributes.${Math.min(index, attributes.length - 2)}.value"]`, 10 /* Host.UserMetrics.RecordingEdited.OtherEditing */),
            })}
        </div>`;
        })}
    </div>`;
        // clang-format on
    }
    #renderAddRowButtons() {
        const attributes = attributesByType[this.state.type];
        return [...attributes.optional].filter(attr => this.state[attr] === undefined).map(attr => {
            // clang-format off
            return html `<devtools-button
          .variant=${"outlined" /* Buttons.Button.Variant.OUTLINED */}
          class="add-row"
          data-attribute=${attr}
          jslog=${VisualLogging.action(`add-${Platform.StringUtilities.toKebabCase(attr)}`)}
          @click=${this.#handleAddRowClickEvent}
        >
          ${i18nString(UIStrings.addAttribute, {
                attributeName: attr,
            })}
        </devtools-button>`;
            // clang-format on
        });
    }
    #ensureFocus = (query) => {
        void this.updateComplete.then(() => {
            const node = this.renderRoot.querySelector(query);
            node?.focus();
        });
    };
    render() {
        this.#renderedAttributes = new Set();
        // clang-format off
        const result = html `
      <div class="wrapper" jslog=${VisualLogging.tree('step-editor')}>
        ${this.#renderTypeRow(this.isTypeEditable)} ${this.#renderRow('target')}
        ${this.#renderFrameRow()} ${this.#renderSelectorsRow()}
        ${this.#renderRow('deviceType')} ${this.#renderRow('button')}
        ${this.#renderRow('url')} ${this.#renderRow('x')}
        ${this.#renderRow('y')} ${this.#renderRow('offsetX')}
        ${this.#renderRow('offsetY')} ${this.#renderRow('value')}
        ${this.#renderRow('key')} ${this.#renderRow('operator')}
        ${this.#renderRow('count')} ${this.#renderRow('expression')}
        ${this.#renderRow('duration')} ${this.#renderAssertedEvents()}
        ${this.#renderRow('timeout')} ${this.#renderRow('width')}
        ${this.#renderRow('height')} ${this.#renderRow('deviceScaleFactor')}
        ${this.#renderRow('isMobile')} ${this.#renderRow('hasTouch')}
        ${this.#renderRow('isLandscape')} ${this.#renderRow('download')}
        ${this.#renderRow('upload')} ${this.#renderRow('latency')}
        ${this.#renderRow('name')} ${this.#renderRow('parameters')}
        ${this.#renderRow('visible')} ${this.#renderRow('properties')}
        ${this.#renderAttributesRow()}
        ${this.error
            ? html `
              <div class="error">
                ${i18nString(UIStrings.notSaved, {
                error: this.error,
            })}
              </div>
            `
            : undefined}
        ${!this.disabled
            ? html `<div
              class="row-buttons wrapped gap row regular-font no-margin"
            >
              ${this.#renderAddRowButtons()}
            </div>`
            : undefined}
      </div>
    `;
        // clang-format on
        for (const key of Object.keys(dataTypeByAttribute)) {
            if (!this.#renderedAttributes.has(key)) {
                throw new Error(`The editable attribute ${key} does not have UI`);
            }
        }
        return result;
    }
};
__decorate([
    state()
], StepEditor.prototype, "state", void 0);
__decorate([
    state()
], StepEditor.prototype, "error", void 0);
__decorate([
    property()
], StepEditor.prototype, "isTypeEditable", void 0);
__decorate([
    property()
], StepEditor.prototype, "disabled", void 0);
StepEditor = __decorate([
    customElement('devtools-recorder-step-editor')
], StepEditor);
export { StepEditor };
//# sourceMappingURL=StepEditor.js.map