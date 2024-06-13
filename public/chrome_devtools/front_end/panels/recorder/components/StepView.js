// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* Some view input callbacks might be handled outside of LitHtml and we
   bind all of them upfront. We disable the lit_html_host_this since we
   do not define any host for LitHtml.render and the rule is not happy
   about it. */
/* eslint-disable rulesdir/lit_html_host_this */
import * as i18n from '../../../core/i18n/i18n.js';
import * as Platform from '../../../core/platform/platform.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as Menus from '../../../ui/components/menus/menus.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import * as Models from '../models/models.js';
import stepViewStyles from './stepView.css.js';
import { TimelineSection, } from './TimelineSection.js';
const UIStrings = {
    /**
     *@description Title for the step type that configures the viewport
     */
    setViewportClickTitle: 'Set viewport',
    /**
     *@description Title for the customStep step type
     */
    customStepTitle: 'Custom step',
    /**
     *@description Title for the click step type
     */
    clickStepTitle: 'Click',
    /**
     *@description Title for the double click step type
     */
    doubleClickStepTitle: 'Double click',
    /**
     *@description Title for the hover step type
     */
    hoverStepTitle: 'Hover',
    /**
     *@description Title for the emulateNetworkConditions step type
     */
    emulateNetworkConditionsStepTitle: 'Emulate network conditions',
    /**
     *@description Title for the change step type
     */
    changeStepTitle: 'Change',
    /**
     *@description Title for the close step type
     */
    closeStepTitle: 'Close',
    /**
     *@description Title for the scroll step type
     */
    scrollStepTitle: 'Scroll',
    /**
     *@description Title for the key up step type. `up` refers to the state of the keyboard key: it's released, i.e., up. It does not refer to the down arrow key specifically.
     */
    keyUpStepTitle: 'Key up',
    /**
     *@description Title for the navigate step type
     */
    navigateStepTitle: 'Navigate',
    /**
     *@description Title for the key down step type. `down` refers to the state of the keyboard key: it's pressed, i.e., down. It does not refer to the down arrow key specifically.
     */
    keyDownStepTitle: 'Key down',
    /**
     *@description Title for the waitForElement step type
     */
    waitForElementStepTitle: 'Wait for element',
    /**
     *@description Title for the waitForExpression step type
     */
    waitForExpressionStepTitle: 'Wait for expression',
    /**
     *@description Title for elements with role button
     */
    elementRoleButton: 'Button',
    /**
     *@description Title for elements with role input
     */
    elementRoleInput: 'Input',
    /**
     *@description Default title for elements without a specific role
     */
    elementRoleFallback: 'Element',
    /**
     *@description The title of the button in the step's context menu that adds a new step before the current one.
     */
    addStepBefore: 'Add step before',
    /**
     *@description The title of the button in the step's context menu that adds a new step after the current one.
     */
    addStepAfter: 'Add step after',
    /**
     *@description The title of the button in the step's context menu that removes the step.
     */
    removeStep: 'Remove step',
    /**
     *@description The title of the button that open the step's context menu.
     */
    openStepActions: 'Open step actions',
    /**
     *@description The title of the button in the step's context menu that adds a breakpoint.
     */
    addBreakpoint: 'Add breakpoint',
    /**
     *@description The title of the button in the step's context menu that removes a breakpoint.
     */
    removeBreakpoint: 'Remove breakpoint',
    /**
     * @description A menu item item in the context menu that expands another menu which list all
     * the formats the user can copy the recording as.
     */
    copyAs: 'Copy as',
    /**
     * @description The title of the menu group that holds actions on recording steps.
     */
    stepManagement: 'Manage steps',
    /**
     * @description The title of the menu group that holds actions related to breakpoints.
     */
    breakpoints: 'Breakpoints',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/components/StepView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CaptureSelectorsEvent extends Event {
    static eventName = 'captureselectors';
    data;
    constructor(step) {
        super(CaptureSelectorsEvent.eventName, { bubbles: true, composed: true });
        this.data = step;
    }
}
export class StopSelectorsCaptureEvent extends Event {
    static eventName = 'stopselectorscapture';
    constructor() {
        super(StopSelectorsCaptureEvent.eventName, {
            bubbles: true,
            composed: true,
        });
    }
}
export class CopyStepEvent extends Event {
    static eventName = 'copystep';
    step;
    constructor(step) {
        super(CopyStepEvent.eventName, { bubbles: true, composed: true });
        this.step = step;
    }
}
export class StepChanged extends Event {
    static eventName = 'stepchanged';
    currentStep;
    newStep;
    constructor(currentStep, newStep) {
        super(StepChanged.eventName, { bubbles: true, composed: true });
        this.currentStep = currentStep;
        this.newStep = newStep;
    }
}
export class AddStep extends Event {
    static eventName = 'addstep';
    position;
    stepOrSection;
    constructor(stepOrSection, position) {
        super(AddStep.eventName, { bubbles: true, composed: true });
        this.stepOrSection = stepOrSection;
        this.position = position;
    }
}
export class RemoveStep extends Event {
    static eventName = 'removestep';
    step;
    constructor(step) {
        super(RemoveStep.eventName, { bubbles: true, composed: true });
        this.step = step;
    }
}
export class AddBreakpointEvent extends Event {
    static eventName = 'addbreakpoint';
    index;
    constructor(index) {
        super(AddBreakpointEvent.eventName, { bubbles: true, composed: true });
        this.index = index;
    }
}
export class RemoveBreakpointEvent extends Event {
    static eventName = 'removebreakpoint';
    index;
    constructor(index) {
        super(RemoveBreakpointEvent.eventName, { bubbles: true, composed: true });
        this.index = index;
    }
}
const COPY_ACTION_PREFIX = 'copy-step-as-';
function getStepTypeTitle(input) {
    if (input.section) {
        return input.section.title ? input.section.title : LitHtml.html `<span class="fallback">(No Title)</span>`;
    }
    if (!input.step) {
        throw new Error('Missing both step and section');
    }
    switch (input.step.type) {
        case Models.Schema.StepType.CustomStep:
            return i18nString(UIStrings.customStepTitle);
        case Models.Schema.StepType.SetViewport:
            return i18nString(UIStrings.setViewportClickTitle);
        case Models.Schema.StepType.Click:
            return i18nString(UIStrings.clickStepTitle);
        case Models.Schema.StepType.DoubleClick:
            return i18nString(UIStrings.doubleClickStepTitle);
        case Models.Schema.StepType.Hover:
            return i18nString(UIStrings.hoverStepTitle);
        case Models.Schema.StepType.EmulateNetworkConditions:
            return i18nString(UIStrings.emulateNetworkConditionsStepTitle);
        case Models.Schema.StepType.Change:
            return i18nString(UIStrings.changeStepTitle);
        case Models.Schema.StepType.Close:
            return i18nString(UIStrings.closeStepTitle);
        case Models.Schema.StepType.Scroll:
            return i18nString(UIStrings.scrollStepTitle);
        case Models.Schema.StepType.KeyUp:
            return i18nString(UIStrings.keyUpStepTitle);
        case Models.Schema.StepType.KeyDown:
            return i18nString(UIStrings.keyDownStepTitle);
        case Models.Schema.StepType.WaitForElement:
            return i18nString(UIStrings.waitForElementStepTitle);
        case Models.Schema.StepType.WaitForExpression:
            return i18nString(UIStrings.waitForExpressionStepTitle);
        case Models.Schema.StepType.Navigate:
            return i18nString(UIStrings.navigateStepTitle);
    }
}
function getElementRoleTitle(role) {
    switch (role) {
        case 'button':
            return i18nString(UIStrings.elementRoleButton);
        case 'input':
            return i18nString(UIStrings.elementRoleInput);
        default:
            return i18nString(UIStrings.elementRoleFallback);
    }
}
function getSelectorPreview(step) {
    if (!step || !('selectors' in step)) {
        return '';
    }
    const ariaSelector = step.selectors.flat().find(selector => selector.startsWith('aria/'));
    if (!ariaSelector) {
        return '';
    }
    const m = ariaSelector.match(/^aria\/(.+?)(\[role="(.+)"\])?$/);
    if (!m) {
        return '';
    }
    return `${getElementRoleTitle(m[3])} "${m[1]}"`;
}
function getSectionPreview(section) {
    if (!section) {
        return '';
    }
    return section.url;
}
function renderStepActions(input) {
    // clang-format off
    return LitHtml.html `
    <${Buttons.Button.Button.litTagName}
      class="step-actions"
      title=${i18nString(UIStrings.openStepActions)}
      aria-label=${i18nString(UIStrings.openStepActions)}
      @click=${input.onStepContextMenu}
      @keydown=${(event) => {
        event.stopPropagation();
    }}
      jslog=${VisualLogging.dropDown('step-actions').track({ click: true })}
      .data=${{
        variant: "icon" /* Buttons.Button.Variant.ICON */,
        iconName: 'dots-vertical',
        title: i18nString(UIStrings.openStepActions),
    }}
    ></${Buttons.Button.Button.litTagName}>
  `;
    // clang-format on
}
function viewFunction(input, _output, target) {
    if (!input.step && !input.section) {
        return;
    }
    const stepClasses = {
        step: true,
        expanded: input.showDetails,
        'is-success': input.state === "success" /* State.Success */,
        'is-current': input.state === "current" /* State.Current */,
        'is-outstanding': input.state === "outstanding" /* State.Outstanding */,
        'is-error': input.state === "error" /* State.Error */,
        'is-stopped': input.state === "stopped" /* State.Stopped */,
        'is-start-of-group': input.isStartOfGroup,
        'is-first-section': input.isFirstSection,
        'has-breakpoint': input.hasBreakpoint,
    };
    const isExpandable = Boolean(input.step);
    const mainTitle = getStepTypeTitle({
        step: input.step,
        section: input.section,
    });
    const subtitle = input.step ? getSelectorPreview() : getSectionPreview();
    // clang-format off
    LitHtml.render(LitHtml.html `
    <${TimelineSection.litTagName} .data=${{
        isFirstSection: input.isFirstSection,
        isLastSection: input.isLastSection,
        isStartOfGroup: input.isStartOfGroup,
        isEndOfGroup: input.isEndOfGroup,
        isSelected: input.isSelected,
    }} @contextmenu=${input.onStepContextMenu} data-step-index=${input.stepIndex} data-section-index=${input.sectionIndex} class=${LitHtml.Directives.classMap(stepClasses)}>
      <svg slot="icon" width="24" height="24" height="100%" class="icon">
        <circle class="circle-icon"/>
        <g class="error-icon">
          <path d="M1.5 1.5L6.5 6.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M1.5 6.5L6.5 1.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <path @click=${input.onBreakpointClick} jslog=${VisualLogging.action('breakpoint').track({ click: true })} class="breakpoint-icon" d="M2.5 5.5H17.7098L21.4241 12L17.7098 18.5H2.5V5.5Z"/>
      </svg>
      <div class="summary">
        <div class="title-container ${isExpandable ? 'action' : ''}"
          @click=${isExpandable && input.toggleShowDetails}
          @keydown=${isExpandable && input.onToggleShowDetailsKeydown}
          tabindex="0"
          jslog=${VisualLogging.sectionHeader().track({ click: true })}
          aria-role=${isExpandable ? 'button' : ''}
          aria-label=${isExpandable ? 'Show details for step' : ''}
        >
          ${isExpandable
        ? LitHtml.html `<${IconButton.Icon.Icon.litTagName}
                  class="chevron"
                  jslog=${VisualLogging.expand().track({ click: true })}
                  name="triangle-down">
                </${IconButton.Icon.Icon.litTagName}>`
        : ''}
          <div class="title">
            <div class="main-title" title=${mainTitle}>${mainTitle}</div>
            <div class="subtitle" title=${subtitle}>${subtitle}</div>
          </div>
        </div>
        <div class="filler"></div>
        ${renderStepActions(input)}
      </div>
      <div class="details">
        ${input.step &&
        LitHtml.html `<devtools-recorder-step-editor
          class=${input.isSelected ? 'is-selected' : ''}
          .step=${input.step}
          .disabled=${input.isPlaying}
          @stepedited=${input.stepEdited}>
        </devtools-recorder-step-editor>`}
        ${input.section?.causingStep &&
        LitHtml.html `<devtools-recorder-step-editor
          .step=${input.section.causingStep}
          .isTypeEditable=${false}
          .disabled=${input.isPlaying}
          @stepedited=${input.stepEdited}>
        </devtools-recorder-step-editor>`}
      </div>
      ${input.error &&
        LitHtml.html `
        <div class="error" role="alert">
          ${input.error.message}
        </div>
      `}
    </${TimelineSection.litTagName}>
  `, target);
    // clang-format on
}
export class StepView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-step-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #observer = new IntersectionObserver(result => {
        this.#viewInput.isVisible = result[0].isIntersecting;
    });
    #viewInput = {
        state: "default" /* State.Default */,
        showDetails: false,
        isEndOfGroup: false,
        isStartOfGroup: false,
        stepIndex: 0,
        sectionIndex: 0,
        isFirstSection: false,
        isLastSection: false,
        isRecording: false,
        isPlaying: false,
        isVisible: false,
        hasBreakpoint: false,
        removable: true,
        builtInConverters: [],
        extensionConverters: [],
        isSelected: false,
        recorderSettings: undefined,
        actions: [],
        stepEdited: this.#stepEdited.bind(this),
        onBreakpointClick: this.#onBreakpointClick.bind(this),
        handleStepAction: this.#handleStepAction.bind(this),
        toggleShowDetails: this.#toggleShowDetails.bind(this),
        onToggleShowDetailsKeydown: this.#onToggleShowDetailsKeydown.bind(this),
        onStepContextMenu: this.#onStepContextMenu.bind(this),
    };
    #view = viewFunction;
    constructor(view) {
        super();
        if (view) {
            this.#view = view;
        }
        this.setAttribute('jslog', `${VisualLogging.section('step-view')}`);
    }
    set data(data) {
        const prevState = this.#viewInput.state;
        this.#viewInput.step = data.step;
        this.#viewInput.section = data.section;
        this.#viewInput.state = data.state;
        this.#viewInput.error = data.error;
        this.#viewInput.isEndOfGroup = data.isEndOfGroup;
        this.#viewInput.isStartOfGroup = data.isStartOfGroup;
        this.#viewInput.stepIndex = data.stepIndex;
        this.#viewInput.sectionIndex = data.sectionIndex;
        this.#viewInput.isFirstSection = data.isFirstSection;
        this.#viewInput.isLastSection = data.isLastSection;
        this.#viewInput.isRecording = data.isRecording;
        this.#viewInput.isPlaying = data.isPlaying;
        this.#viewInput.hasBreakpoint = data.hasBreakpoint;
        this.#viewInput.removable = data.removable;
        this.#viewInput.builtInConverters = data.builtInConverters;
        this.#viewInput.extensionConverters = data.extensionConverters;
        this.#viewInput.isSelected = data.isSelected;
        this.#viewInput.recorderSettings = data.recorderSettings;
        this.#viewInput.actions = this.#getActions();
        this.#render();
        if (this.#viewInput.state !== prevState && this.#viewInput.state === 'current' && !this.#viewInput.isVisible) {
            this.scrollIntoView();
        }
    }
    get step() {
        return this.#viewInput.step;
    }
    get section() {
        return this.#viewInput.section;
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [stepViewStyles];
        this.#observer.observe(this);
        this.#render();
    }
    disconnectedCallback() {
        this.#observer.unobserve(this);
    }
    #toggleShowDetails() {
        this.#viewInput.showDetails = !this.#viewInput.showDetails;
        this.#render();
    }
    #onToggleShowDetailsKeydown(event) {
        const keyboardEvent = event;
        if (keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ') {
            this.#toggleShowDetails();
            event.stopPropagation();
            event.preventDefault();
        }
    }
    #stepEdited(event) {
        const step = this.#viewInput.step || this.#viewInput.section?.causingStep;
        if (!step) {
            throw new Error('Expected step.');
        }
        this.dispatchEvent(new StepChanged(step, event.data));
    }
    #handleStepAction(event) {
        switch (event.itemValue) {
            case 'add-step-before': {
                const stepOrSection = this.#viewInput.step || this.#viewInput.section;
                if (!stepOrSection) {
                    throw new Error('Expected step or section.');
                }
                this.dispatchEvent(new AddStep(stepOrSection, "before" /* AddStepPosition.BEFORE */));
                break;
            }
            case 'add-step-after': {
                const stepOrSection = this.#viewInput.step || this.#viewInput.section;
                if (!stepOrSection) {
                    throw new Error('Expected step or section.');
                }
                this.dispatchEvent(new AddStep(stepOrSection, "after" /* AddStepPosition.AFTER */));
                break;
            }
            case 'remove-step': {
                const causingStep = this.#viewInput.section?.causingStep;
                if (!this.#viewInput.step && !causingStep) {
                    throw new Error('Expected step.');
                }
                this.dispatchEvent(new RemoveStep(this.#viewInput.step || causingStep));
                break;
            }
            case 'add-breakpoint': {
                if (!this.#viewInput.step) {
                    throw new Error('Expected step');
                }
                this.dispatchEvent(new AddBreakpointEvent(this.#viewInput.stepIndex));
                break;
            }
            case 'remove-breakpoint': {
                if (!this.#viewInput.step) {
                    throw new Error('Expected step');
                }
                this.dispatchEvent(new RemoveBreakpointEvent(this.#viewInput.stepIndex));
                break;
            }
            default: {
                const actionId = event.itemValue;
                if (!actionId.startsWith(COPY_ACTION_PREFIX)) {
                    throw new Error('Unknown step action.');
                }
                const copyStep = this.#viewInput.step || this.#viewInput.section?.causingStep;
                if (!copyStep) {
                    throw new Error('Step not found.');
                }
                const converterId = actionId.substring(COPY_ACTION_PREFIX.length);
                if (this.#viewInput.recorderSettings) {
                    this.#viewInput.recorderSettings.preferredCopyFormat = converterId;
                }
                this.dispatchEvent(new CopyStepEvent(structuredClone(copyStep)));
            }
        }
    }
    #onBreakpointClick() {
        if (this.#viewInput.hasBreakpoint) {
            this.dispatchEvent(new RemoveBreakpointEvent(this.#viewInput.stepIndex));
        }
        else {
            this.dispatchEvent(new AddBreakpointEvent(this.#viewInput.stepIndex));
        }
        this.#render();
    }
    #getActions = () => {
        const actions = [];
        if (!this.#viewInput.isPlaying) {
            if (this.#viewInput.step) {
                actions.push({
                    id: 'add-step-before',
                    label: i18nString(UIStrings.addStepBefore),
                    group: 'stepManagement',
                    groupTitle: i18nString(UIStrings.stepManagement),
                });
            }
            actions.push({
                id: 'add-step-after',
                label: i18nString(UIStrings.addStepAfter),
                group: 'stepManagement',
                groupTitle: i18nString(UIStrings.stepManagement),
            });
            if (this.#viewInput.removable) {
                actions.push({
                    id: 'remove-step',
                    group: 'stepManagement',
                    groupTitle: i18nString(UIStrings.stepManagement),
                    label: i18nString(UIStrings.removeStep),
                });
            }
        }
        if (this.#viewInput.step && !this.#viewInput.isRecording) {
            if (this.#viewInput.hasBreakpoint) {
                actions.push({
                    id: 'remove-breakpoint',
                    label: i18nString(UIStrings.removeBreakpoint),
                    group: 'breakPointManagement',
                    groupTitle: i18nString(UIStrings.breakpoints),
                });
            }
            else {
                actions.push({
                    id: 'add-breakpoint',
                    label: i18nString(UIStrings.addBreakpoint),
                    group: 'breakPointManagement',
                    groupTitle: i18nString(UIStrings.breakpoints),
                });
            }
        }
        if (this.#viewInput.step) {
            for (const converter of this.#viewInput.builtInConverters || []) {
                actions.push({
                    id: COPY_ACTION_PREFIX + Platform.StringUtilities.toKebabCase(converter.getId()),
                    label: converter.getFormatName(),
                    group: 'copy',
                    groupTitle: i18nString(UIStrings.copyAs),
                });
            }
            for (const converter of this.#viewInput.extensionConverters || []) {
                actions.push({
                    id: COPY_ACTION_PREFIX + Platform.StringUtilities.toKebabCase(converter.getId()),
                    label: converter.getFormatName(),
                    group: 'copy',
                    groupTitle: i18nString(UIStrings.copyAs),
                    jslogContext: COPY_ACTION_PREFIX + 'extension',
                });
            }
        }
        return actions;
    };
    #onStepContextMenu(event) {
        const buttonElement = event.target instanceof Buttons.Button.Button ? event.target : undefined;
        const menu = new UI.ContextMenu.ContextMenu(event, {
            x: buttonElement?.getBoundingClientRect().left,
            y: buttonElement?.getBoundingClientRect().bottom,
        });
        const actions = this.#getActions();
        const copyActions = actions.filter(item => item.id.startsWith(COPY_ACTION_PREFIX));
        const otherActions = actions.filter(item => !item.id.startsWith(COPY_ACTION_PREFIX));
        for (const item of otherActions) {
            const section = menu.section(item.group);
            section.appendItem(item.label, () => {
                this.#handleStepAction(new Menus.Menu.MenuItemSelectedEvent(item.id));
            }, { jslogContext: item.id });
        }
        const preferredCopyAction = copyActions.find(item => item.id === COPY_ACTION_PREFIX + this.#viewInput.recorderSettings?.preferredCopyFormat);
        if (preferredCopyAction) {
            menu.section('copy').appendItem(preferredCopyAction.label, () => {
                this.#handleStepAction(new Menus.Menu.MenuItemSelectedEvent(preferredCopyAction.id));
            }, { jslogContext: preferredCopyAction.id });
        }
        if (copyActions.length) {
            const copyAs = menu.section('copy').appendSubMenuItem(i18nString(UIStrings.copyAs), false, 'copy');
            for (const item of copyActions) {
                if (item === preferredCopyAction) {
                    continue;
                }
                copyAs.section(item.group).appendItem(item.label, () => {
                    this.#handleStepAction(new Menus.Menu.MenuItemSelectedEvent(item.id));
                }, { jslogContext: item.id });
            }
        }
        void menu.show();
    }
    #render() {
        const output = {};
        this.#view(this.#viewInput, output, this.#shadow);
    }
}
customElements.define('devtools-step-view', StepView);
//# sourceMappingURL=StepView.js.map