// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import * as Dialogs from '../dialogs/dialogs.js';
import menuStyles from './menu.css.js';
import menuGroupStyles from './menuGroup.css.js';
import menuItemStyles from './menuItem.css.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
const selectedItemCheckmark = new URL('../../../Images/checkmark.svg', import.meta.url).toString();
export class Menu extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-menu`;
    #shadow = this.attachShadow({ mode: 'open' });
    #renderBound = this.#render.bind(this);
    #dialog = null;
    #itemIsFocused = false;
    #props = {
        origin: null,
        open: false,
        position: "auto" /* Dialogs.Dialog.DialogVerticalPosition.AUTO */,
        showConnector: false,
        showDivider: false,
        showSelectedItem: true,
        horizontalAlignment: "auto" /* Dialogs.Dialog.DialogHorizontalAlignment.AUTO */,
        getConnectorCustomXPosition: null,
    };
    get origin() {
        return this.#props.origin;
    }
    set origin(origin) {
        this.#props.origin = origin;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get open() {
        return this.#props.open;
    }
    set open(open) {
        if (open === this.open) {
            return;
        }
        this.#props.open = open;
        this.toggleAttribute('has-open-dialog', this.open);
        void this.#getDialog().setDialogVisible(this.open);
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get position() {
        return this.#props.position;
    }
    set position(position) {
        this.#props.position = position;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get showConnector() {
        return this.#props.showConnector;
    }
    set showConnector(showConnector) {
        this.#props.showConnector = showConnector;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get showDivider() {
        return this.#props.showDivider;
    }
    set showDivider(showDivider) {
        this.#props.showDivider = showDivider;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get showSelectedItem() {
        return this.#props.showSelectedItem;
    }
    set showSelectedItem(showSelectedItem) {
        this.#props.showSelectedItem = showSelectedItem;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get horizontalAlignment() {
        return this.#props.horizontalAlignment;
    }
    set horizontalAlignment(horizontalAlignment) {
        this.#props.horizontalAlignment = horizontalAlignment;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get getConnectorCustomXPosition() {
        return this.#props.getConnectorCustomXPosition;
    }
    set getConnectorCustomXPosition(connectorXPosition) {
        this.#props.getConnectorCustomXPosition = connectorXPosition;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [menuStyles];
        void coordinator.write(() => {
            this.style.setProperty('--selected-item-check', `url(${selectedItemCheckmark})`);
            this.style.setProperty('--menu-checkmark-width', this.#props.showSelectedItem ? '26px' : '0px');
            this.style.setProperty('--menu-checkmark-height', this.#props.showSelectedItem ? '12px' : '0px');
            const dividerLine = this.showDivider ? '1px var(--divider-line) solid' : 'none';
            this.style.setProperty('--override-divider-line', dividerLine);
        });
    }
    #getDialog() {
        if (!this.#dialog) {
            throw new Error('Dialog not found');
        }
        return this.#dialog;
    }
    async #dialogDeployed() {
        await coordinator.write(() => {
            this.setAttribute('has-open-dialog', 'has-open-dialog');
            // Focus the container so tha twe can capture key events.
            const container = this.#shadow.querySelector('#container');
            if (!(container instanceof HTMLElement)) {
                return;
            }
            container.focus();
        });
    }
    #focusFirstItem() {
        this.#getFirstItem().focus();
    }
    #getFirstItem() {
        const defaultSlot = this.#shadow.querySelector('slot');
        const items = defaultSlot?.assignedElements();
        let firstItem = items[0];
        if (firstItem instanceof HTMLSlotElement) {
            firstItem = firstItem?.assignedElements()[0];
        }
        if (firstItem instanceof MenuGroup) {
            const groupDefaultSlot = firstItem.shadowRoot?.querySelector('slot');
            firstItem = groupDefaultSlot?.assignedElements()[0];
        }
        if (firstItem instanceof HTMLElement) {
            return firstItem;
        }
        throw new Error('First item not found');
    }
    #handleItemClick(evt) {
        const path = evt.composedPath();
        evt.stopPropagation();
        // If the clicked item is an input element, do not follow the default behaviour.
        if (path.find(element => element instanceof HTMLInputElement)) {
            return;
        }
        const item = evt.composedPath().find(element => element instanceof MenuItem);
        // Compare against MenuItem again to narrow the item's type.
        if (!(item instanceof MenuItem)) {
            return;
        }
        this.#updateSelectedValue(item);
    }
    #handleDialogKeyDown(evt) {
        const key = evt.key;
        evt.stopImmediatePropagation();
        let item = evt.target;
        const path = evt.composedPath();
        const shouldFocusFirstItem = key === "ArrowDown" /* Platform.KeyboardUtilities.ArrowKey.DOWN */ || key === "ArrowRight" /* Platform.KeyboardUtilities.ArrowKey.RIGHT */;
        if (!this.#itemIsFocused && shouldFocusFirstItem) {
            this.#focusFirstItem();
            this.#itemIsFocused = true;
            return;
        }
        if (!this.#itemIsFocused && key === "ArrowUp" /* Platform.KeyboardUtilities.ArrowKey.UP */) {
            this.#focusLastItem();
            this.#itemIsFocused = true;
            return;
        }
        // The focused item could be nested inside the MenuItem, hence
        // find the MenuItem item inside the event's composed path.
        if (!(item instanceof MenuItem)) {
            item = path.find(element => element instanceof MenuItem);
            // Compare against MenuItem again to narrow the item's type.
            if (!(item instanceof MenuItem)) {
                return;
            }
        }
        if (Platform.KeyboardUtilities.keyIsArrowKey(key)) {
            this.#handleArrowKeyNavigation(key, item);
        }
        else if (key === 'Home') {
            this.#handleHomeKeyDown(item);
        }
        else if (key === 'End') {
            this.#focusLastItem();
        }
        else if (key === 'Enter' || evt.code === 'Space') {
            this.#updateSelectedValue(item);
        }
        else if (key === 'Escape') {
            evt.preventDefault();
            this.#closeDialog();
        }
    }
    #updateSelectedValue(item) {
        if (item.value === '') {
            return;
        }
        this.dispatchEvent(new MenuItemSelectedEvent(item.value));
        if (item.preventMenuCloseOnSelection) {
            return;
        }
        this.#closeDialog();
    }
    #handleArrowKeyNavigation(key, currentItem) {
        let nextSibling = currentItem;
        if (key === "ArrowDown" /* Platform.KeyboardUtilities.ArrowKey.DOWN */) {
            nextSibling = currentItem.nextElementSibling;
            // Handle last item in a group and navigating down:
            if (nextSibling === null && currentItem.parentElement instanceof MenuGroup) {
                nextSibling = this.#firstItemInNextGroup(currentItem);
            }
        }
        else if (key === "ArrowUp" /* Platform.KeyboardUtilities.ArrowKey.UP */) {
            nextSibling = currentItem.previousElementSibling;
            // Handle first item in a group and navigating up:
            if (nextSibling === null && currentItem.parentElement instanceof MenuGroup) {
                nextSibling = this.#lastItemInPreviousGroup(currentItem);
            }
        }
        if (nextSibling instanceof MenuItem) {
            nextSibling.focus();
        }
    }
    #firstItemInNextGroup(currentItem) {
        const parentElement = currentItem.parentElement;
        if (!(parentElement instanceof MenuGroup)) {
            return null;
        }
        const parentNextSibling = parentElement.nextElementSibling;
        if (parentNextSibling instanceof MenuItem) {
            return parentNextSibling;
        }
        if (!(parentNextSibling instanceof MenuGroup)) {
            return null;
        }
        for (const child of parentNextSibling.children) {
            if (child instanceof MenuItem) {
                return child;
            }
        }
        return null;
    }
    #lastItemInPreviousGroup(currentItem) {
        const parentElement = currentItem.parentElement;
        if (!(parentElement instanceof MenuGroup)) {
            return null;
        }
        const parentPreviousSibling = parentElement.previousElementSibling;
        if (parentPreviousSibling instanceof MenuItem) {
            return parentPreviousSibling;
        }
        if (!(parentPreviousSibling instanceof MenuGroup)) {
            return null;
        }
        if (parentPreviousSibling.lastElementChild instanceof MenuItem) {
            return parentPreviousSibling.lastElementChild;
        }
        return null;
    }
    #handleHomeKeyDown(currentItem) {
        let topMenuPart = currentItem;
        if (currentItem.parentElement instanceof MenuGroup) {
            topMenuPart = currentItem.parentElement;
        }
        while (topMenuPart?.previousElementSibling) {
            topMenuPart = topMenuPart?.previousElementSibling;
        }
        if (topMenuPart instanceof MenuItem) {
            topMenuPart.focus();
            return;
        }
        for (const child of topMenuPart.children) {
            if (child instanceof MenuItem) {
                child.focus();
                return;
            }
        }
    }
    #focusLastItem() {
        const currentItem = this.#getFirstItem();
        let lastMenuPart = currentItem;
        if (currentItem.parentElement instanceof MenuGroup) {
            lastMenuPart = currentItem.parentElement;
        }
        while (lastMenuPart?.nextElementSibling) {
            lastMenuPart = lastMenuPart?.nextElementSibling;
        }
        if (lastMenuPart instanceof MenuItem) {
            lastMenuPart.focus();
            return;
        }
        if (lastMenuPart instanceof MenuGroup && lastMenuPart.lastElementChild instanceof MenuItem) {
            lastMenuPart.lastElementChild.focus();
        }
    }
    #closeDialog(evt) {
        if (evt) {
            evt.stopImmediatePropagation();
        }
        this.dispatchEvent(new MenuCloseRequest());
        void this.#getDialog().setDialogVisible(false);
        this.#itemIsFocused = false;
    }
    async #render() {
        if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
            throw new Error('Menu render was not scheduled');
        }
        // clang-format off
        LitHtml.render(LitHtml.html `
      <${Dialogs.Dialog.Dialog.litTagName}
        @clickoutsidedialog=${this.#closeDialog}
        @forceddialogclose=${this.#closeDialog}
        .position=${this.position}
        .showConnector=${this.showConnector}
        .origin=${this.origin}
        .dialogShownCallback=${this.#dialogDeployed.bind(this)}
        .horizontalAlignment=${this.horizontalAlignment}
        .getConnectorCustomXPosition=${this.getConnectorCustomXPosition}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback((domNode) => {
            this.#dialog = domNode;
        })}
        >
        <span id="container" role="menu" tabIndex="0" @keydown=${this.#handleDialogKeyDown} jslog=${VisualLogging.menu().track({ resize: true, keydown: 'Escape' })}>
          <slot @click=${this.#handleItemClick}>
          </slot>
        </span>
      </${Dialogs.Dialog.Dialog.litTagName}>
    `, this.#shadow, { host: this });
        // clang-format on
    }
}
export class MenuItem extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-menu-item`;
    #shadow = this.attachShadow({ mode: 'open' });
    #renderBound = this.#render.bind(this);
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [menuItemStyles];
        this.tabIndex = 0;
        this.setAttribute('role', 'menuitem');
    }
    #props = {
        value: '',
        preventMenuCloseOnSelection: false,
        selected: false,
    };
    get preventMenuCloseOnSelection() {
        return this.#props.preventMenuCloseOnSelection;
    }
    set preventMenuCloseOnSelection(preventMenuCloseOnSelection) {
        this.#props.preventMenuCloseOnSelection = preventMenuCloseOnSelection;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get value() {
        return this.#props.value;
    }
    set value(value) {
        this.#props.value = value;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    get selected() {
        return this.#props.selected;
    }
    set selected(selected) {
        this.#props.selected = selected;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    async #render() {
        if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
            throw new Error('MenuItem render was not scheduled');
        }
        // clang-format off
        LitHtml.render(LitHtml.html `
      <span class=${LitHtml.Directives.classMap({
            'menu-item': true,
            'is-selected-item': this.selected,
            'prevents-close': this.preventMenuCloseOnSelection,
        })}
      >
        <slot></slot>
      </span>
    `, this.#shadow, { host: this });
        // clang-format on
    }
}
export class MenuGroup extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-menu-group`;
    #shadow = this.attachShadow({ mode: 'open' });
    #renderBound = this.#render.bind(this);
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [menuGroupStyles];
    }
    #props = {
        name: null,
    };
    get name() {
        return this.#props.name;
    }
    set name(name) {
        this.#props.name = name;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    async #render() {
        if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
            throw new Error('MenuGroup render was not scheduled');
        }
        // clang-format off
        LitHtml.render(LitHtml.html `
      <span class="menu-group">
        <span class="menu-group-label">${this.name}</span>
        <slot></slot>
      </span>
    `, this.#shadow, { host: this });
        // clang-format on
    }
}
customElements.define('devtools-menu', Menu);
customElements.define('devtools-menu-item', MenuItem);
customElements.define('devtools-menu-group', MenuGroup);
export class MenuItemSelectedEvent extends Event {
    itemValue;
    static eventName = 'menuitemselected';
    constructor(itemValue) {
        super(MenuItemSelectedEvent.eventName, { bubbles: true, composed: true });
        this.itemValue = itemValue;
    }
}
export class MenuCloseRequest extends Event {
    static eventName = 'menucloserequest';
    constructor() {
        super(MenuCloseRequest.eventName, { bubbles: true, composed: true });
    }
}
//# sourceMappingURL=Menu.js.map