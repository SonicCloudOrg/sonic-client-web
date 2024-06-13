// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as Dialogs from '../../../ui/components/dialogs/dialogs.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as Menus from '../../../ui/components/menus/menus.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import * as Models from '../models/models.js';
import selectButtonStyles from './selectButton.css.js';
export class SelectButtonClickEvent extends Event {
    value;
    static eventName = 'selectbuttonclick';
    constructor(value) {
        super(SelectButtonClickEvent.eventName, { bubbles: true, composed: true });
        this.value = value;
    }
}
export class SelectMenuSelectedEvent extends Event {
    value;
    static eventName = 'selectmenuselected';
    constructor(value) {
        super(SelectMenuSelectedEvent.eventName, { bubbles: true, composed: true });
        this.value = value;
    }
}
export class SelectButton extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-select-button`;
    #shadow = this.attachShadow({ mode: 'open' });
    #props = {
        disabled: false,
        value: '',
        items: [],
        buttonLabel: '',
        groups: [],
        variant: "primary" /* Variant.PRIMARY */,
    };
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [selectButtonStyles];
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    get disabled() {
        return this.#props.disabled;
    }
    set disabled(disabled) {
        this.#props.disabled = disabled;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    get items() {
        return this.#props.items;
    }
    set items(items) {
        this.#props.items = items;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    set buttonLabel(buttonLabel) {
        this.#props.buttonLabel = buttonLabel;
    }
    set groups(groups) {
        this.#props.groups = groups;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    get value() {
        return this.#props.value;
    }
    set value(value) {
        this.#props.value = value;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    get variant() {
        return this.#props.variant;
    }
    set variant(variant) {
        this.#props.variant = variant;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    set action(value) {
        this.#props.action = value;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    #handleClick(ev) {
        ev.stopPropagation();
        this.dispatchEvent(new SelectButtonClickEvent(this.#props.value));
    }
    #handleSelectMenuSelect(evt) {
        this.dispatchEvent(new SelectMenuSelectedEvent(evt.itemValue));
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    #renderSelectItem(item, selectedItem) {
        // clang-format off
        return LitHtml.html `
      <${Menus.Menu.MenuItem.litTagName} .value=${item.value} .selected=${item.value === selectedItem.value} jslog=${VisualLogging.item(Platform.StringUtilities.toKebabCase(item.value)).track({ click: true })}>
        ${item.label()}
      </${Menus.Menu.MenuItem.litTagName}>
    `;
        // clang-format on
    }
    #renderSelectGroup(group, selectedItem) {
        // clang-format off
        return LitHtml.html `
      <${Menus.Menu.MenuGroup.litTagName} .name=${group.name}>
        ${group.items.map(item => this.#renderSelectItem(item, selectedItem))}
      </${Menus.Menu.MenuGroup.litTagName}>
    `;
        // clang-format on
    }
    #getTitle(label) {
        return this.#props.action ? Models.Tooltip.getTooltipForActions(label, this.#props.action) : '';
    }
    #render = () => {
        const hasGroups = Boolean(this.#props.groups.length);
        const items = hasGroups ? this.#props.groups.flatMap(group => group.items) : this.#props.items;
        const selectedItem = items.find(item => item.value === this.#props.value) || items[0];
        if (!selectedItem) {
            return;
        }
        const classes = {
            primary: this.#props.variant === "primary" /* Variant.PRIMARY */,
            secondary: this.#props.variant === "outlined" /* Variant.OUTLINED */,
        };
        const buttonVariant = this.#props.variant === "outlined" /* Variant.OUTLINED */ ? "outlined" /* Buttons.Button.Variant.OUTLINED */ : "primary" /* Buttons.Button.Variant.PRIMARY */;
        const menuLabel = selectedItem.buttonLabel ? selectedItem.buttonLabel() : selectedItem.label();
        // clang-format off
        LitHtml.render(LitHtml.html `
      <div class="select-button" title=${this.#getTitle(menuLabel) || LitHtml.nothing}>
      <${Menus.SelectMenu.SelectMenu.litTagName}
          class=${LitHtml.Directives.classMap(classes)}
          @selectmenuselected=${this.#handleSelectMenuSelect}
          ?disabled=${this.#props.disabled}
          .showArrow=${true}
          .sideButton=${false}
          .showSelectedItem=${true}
          .disabled=${this.#props.disabled}
          .buttonTitle=${LitHtml.html `${menuLabel}`}
          .position=${"bottom" /* Dialogs.Dialog.DialogVerticalPosition.BOTTOM */}
          .horizontalAlignment=${"right" /* Dialogs.Dialog.DialogHorizontalAlignment.RIGHT */}
        >
          ${hasGroups
            ? this.#props.groups.map(group => this.#renderSelectGroup(group, selectedItem))
            : this.#props.items.map(item => this.#renderSelectItem(item, selectedItem))}
        </${Menus.SelectMenu.SelectMenu.litTagName}>
        ${selectedItem
            ? LitHtml.html `
        <${Buttons.Button.Button.litTagName}
            .disabled=${this.#props.disabled}
            .variant=${buttonVariant}
            .iconName=${selectedItem.buttonIconName}
            @click=${this.#handleClick}>
            ${this.#props.buttonLabel}
        </${Buttons.Button.Button.litTagName}>`
            : ''}
      </div>`, this.#shadow, { host: this });
        // clang-format on
    };
}
customElements.define('devtools-select-button', SelectButton);
//# sourceMappingURL=SelectButton.js.map