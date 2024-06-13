// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import playerMessagesViewStyles from './playerMessagesView.css.js';
const UIStrings = {
    /**
     *@description A context menu item in the Console View of the Console panel
     */
    default: 'Default',
    /**
     *@description Text in Network Throttling Selector of the Network panel
     */
    custom: 'Custom',
    /**
     *@description Text for everything
     */
    all: 'All',
    /**
     *@description Text for errors
     */
    error: 'Error',
    /**
     *@description Text to indicate an item is a warning
     */
    warning: 'Warning',
    /**
     *@description Sdk console message message level info of level Labels in Console View of the Console panel
     */
    info: 'Info',
    /**
     *@description Debug log level
     */
    debug: 'Debug',
    /**
     *@description Label for selecting between the set of log levels to show.
     */
    logLevel: 'Log level:',
    /**
     *@description Default text for user-text-entry for searching log messages.
     */
    filterByLogMessages: 'Filter by log messages',
    /**
     *@description The label for the group name that this error belongs to.
     */
    errorGroupLabel: 'Error Group:',
    /**
     *@description The label for the numeric code associated with this error.
     */
    errorCodeLabel: 'Error Code:',
    /**
     *@description The label for extra data associated with an error.
     */
    errorDataLabel: 'Data:',
    /**
     *@description The label for the stacktrace associated with the error.
     */
    errorStackLabel: 'Stacktrace:',
    /**
     *@description The label for a root cause error associated with this error.
     */
    errorCauseLabel: 'Caused by:',
};
const str_ = i18n.i18n.registerUIStrings('panels/media/PlayerMessagesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class MessageLevelSelector {
    items;
    view;
    itemMap;
    hiddenLevels;
    bitFieldValue;
    savedBitFieldValue;
    defaultTitleInternal;
    customTitle;
    allTitle;
    elementsForItems;
    constructor(items, view) {
        this.items = items;
        this.view = view;
        this.itemMap = new Map();
        this.hiddenLevels = [];
        this.bitFieldValue = 7 /* MessageLevelBitfield.Default */;
        this.savedBitFieldValue = 7 /* MessageLevelBitfield.Default */;
        this.defaultTitleInternal = i18nString(UIStrings.default);
        this.customTitle = i18nString(UIStrings.custom);
        this.allTitle = i18nString(UIStrings.all);
        this.elementsForItems = new WeakMap();
    }
    defaultTitle() {
        return this.defaultTitleInternal;
    }
    setDefault(dropdown) {
        dropdown.selectItem(this.items.at(0));
    }
    populate() {
        this.items.insert(this.items.length, {
            title: this.defaultTitleInternal,
            overwrite: true,
            stringValue: '',
            value: 7 /* MessageLevelBitfield.Default */,
            selectable: undefined,
        });
        this.items.insert(this.items.length, {
            title: this.allTitle,
            overwrite: true,
            stringValue: '',
            value: 15 /* MessageLevelBitfield.All */,
            selectable: undefined,
        });
        this.items.insert(this.items.length, {
            title: i18nString(UIStrings.error),
            overwrite: false,
            stringValue: 'error',
            value: 1 /* MessageLevelBitfield.Error */,
            selectable: undefined,
        });
        this.items.insert(this.items.length, {
            title: i18nString(UIStrings.warning),
            overwrite: false,
            stringValue: 'warning',
            value: 2 /* MessageLevelBitfield.Warning */,
            selectable: undefined,
        });
        this.items.insert(this.items.length, {
            title: i18nString(UIStrings.info),
            overwrite: false,
            stringValue: 'info',
            value: 4 /* MessageLevelBitfield.Info */,
            selectable: undefined,
        });
        this.items.insert(this.items.length, {
            title: i18nString(UIStrings.debug),
            overwrite: false,
            stringValue: 'debug',
            value: 8 /* MessageLevelBitfield.Debug */,
            selectable: undefined,
        });
    }
    updateCheckMarks() {
        this.hiddenLevels = [];
        for (const [key, item] of this.itemMap) {
            if (!item.overwrite) {
                const elementForItem = this.elementsForItems.get(item);
                if (elementForItem && elementForItem.firstChild) {
                    elementForItem.firstChild.remove();
                }
                if (elementForItem && key & this.bitFieldValue) {
                    UI.UIUtils.createTextChild(elementForItem.createChild('div'), '✓');
                }
                else {
                    this.hiddenLevels.push(item.stringValue);
                }
            }
        }
    }
    titleFor(item) {
        // This would make a lot more sense to have in |itemSelected|, but this
        // method gets called first.
        if (item.overwrite) {
            this.bitFieldValue = item.value;
        }
        else {
            this.bitFieldValue ^= item.value;
        }
        if (this.bitFieldValue === 7 /* MessageLevelBitfield.Default */) {
            return this.defaultTitleInternal;
        }
        if (this.bitFieldValue === 15 /* MessageLevelBitfield.All */) {
            return this.allTitle;
        }
        const potentialMatch = this.itemMap.get(this.bitFieldValue);
        if (potentialMatch) {
            return potentialMatch.title;
        }
        return this.customTitle;
    }
    createElementForItem(item) {
        const element = document.createElement('div');
        const shadowRoot = UI.UIUtils.createShadowRootWithCoreStyles(element, { cssFile: [playerMessagesViewStyles], delegatesFocus: undefined });
        const container = shadowRoot.createChild('div', 'media-messages-level-dropdown-element');
        const checkBox = container.createChild('div', 'media-messages-level-dropdown-checkbox');
        const text = container.createChild('span', 'media-messages-level-dropdown-text');
        UI.UIUtils.createTextChild(text, item.title);
        this.elementsForItems.set(item, checkBox);
        this.itemMap.set(item.value, item);
        this.updateCheckMarks();
        this.view.regenerateMessageDisplayCss(this.hiddenLevels);
        return element;
    }
    isItemSelectable(_item) {
        return true;
    }
    itemSelected(_item) {
        this.updateCheckMarks();
        this.view.regenerateMessageDisplayCss(this.hiddenLevels);
    }
    highlightedItemChanged(_from, _to, _fromElement, _toElement) {
    }
}
export class PlayerMessagesView extends UI.Widget.VBox {
    headerPanel;
    bodyPanel;
    messageLevelSelector;
    constructor() {
        super();
        this.element.setAttribute('jslog', `${VisualLogging.pane('messages')}`);
        this.headerPanel = this.contentElement.createChild('div', 'media-messages-header');
        this.bodyPanel = this.contentElement.createChild('div', 'media-messages-body');
        this.buildToolbar();
    }
    buildToolbar() {
        const toolbar = new UI.Toolbar.Toolbar('media-messages-toolbar', this.headerPanel);
        toolbar.appendText(i18nString(UIStrings.logLevel));
        toolbar.appendToolbarItem(this.createDropdown());
        toolbar.appendSeparator();
        toolbar.appendToolbarItem(this.createFilterInput());
    }
    createDropdown() {
        const items = new UI.ListModel.ListModel();
        this.messageLevelSelector = new MessageLevelSelector(items, this);
        const dropDown = new UI.SoftDropDown.SoftDropDown(items, this.messageLevelSelector, 'log-level');
        dropDown.setRowHeight(18);
        this.messageLevelSelector.populate();
        this.messageLevelSelector.setDefault(dropDown);
        const dropDownItem = new UI.Toolbar.ToolbarItem(dropDown.element);
        dropDownItem.element.classList.add('toolbar-has-dropdown');
        dropDownItem.setEnabled(true);
        dropDownItem.setTitle(this.messageLevelSelector.defaultTitle());
        UI.ARIAUtils.setLabel(dropDownItem.element, `${i18nString(UIStrings.logLevel)} ${this.messageLevelSelector.defaultTitle()}`);
        return dropDownItem;
    }
    createFilterInput() {
        const filterInput = new UI.Toolbar.ToolbarFilter(i18nString(UIStrings.filterByLogMessages), 1, 1);
        filterInput.addEventListener("TextChanged" /* UI.Toolbar.ToolbarInput.Event.TextChanged */, (data) => {
            this.filterByString(data);
        }, this);
        return filterInput;
    }
    regenerateMessageDisplayCss(hiddenLevels) {
        const messages = this.bodyPanel.getElementsByClassName('media-messages-message-container');
        for (const message of messages) {
            if (this.matchesHiddenLevels(message, hiddenLevels)) {
                message.classList.add('media-messages-message-unselected');
            }
            else {
                message.classList.remove('media-messages-message-unselected');
            }
        }
    }
    matchesHiddenLevels(element, hiddenLevels) {
        for (const level of hiddenLevels) {
            if (element.classList.contains('media-message-' + level)) {
                return true;
            }
        }
        return false;
    }
    filterByString(userStringData) {
        const userString = userStringData.data;
        const messages = this.bodyPanel.getElementsByClassName('media-messages-message-container');
        for (const message of messages) {
            if (userString === '') {
                message.classList.remove('media-messages-message-filtered');
            }
            else if (message.textContent && message.textContent.includes(userString)) {
                message.classList.remove('media-messages-message-filtered');
            }
            else {
                message.classList.add('media-messages-message-filtered');
            }
        }
    }
    addMessage(message) {
        const container = this.bodyPanel.createChild('div', 'media-messages-message-container media-message-' + message.level);
        UI.UIUtils.createTextChild(container, message.message);
    }
    errorToDiv(error) {
        const entry = UI.Fragment.Fragment.build `
    <div class="status-error-box">
    <div class="status-error-field-labeled">
      <span class="status-error-field-label" $="status-error-group"></span>
      <span>${error.errorType}</span>
    </div>
    <div class="status-error-field-labeled">
      <span class="status-error-field-label" $="status-error-code"></span>
      <span>${error.code}</span>
    </div>
    <div class="status-error-field-labeled" $="status-error-data">
    </div>
    <div class="status-error-field-labeled" $="status-error-stack">
    </div>
    <div class="status-error-field-labeled" $="status-error-cause">
    </div>
    `;
        entry.$('status-error-group').textContent = i18nString(UIStrings.errorGroupLabel);
        entry.$('status-error-code').textContent = i18nString(UIStrings.errorCodeLabel);
        if (Object.keys(error.data).length !== 0) {
            const label = entry.$('status-error-data').createChild('span', 'status-error-field-label');
            UI.UIUtils.createTextChild(label, i18nString(UIStrings.errorDataLabel));
            const dataContent = entry.$('status-error-data').createChild('div');
            for (const [key, value] of Object.entries(error.data)) {
                const datumContent = dataContent.createChild('div');
                UI.UIUtils.createTextChild(datumContent, `${key}: ${value}`);
            }
        }
        if (error.stack.length !== 0) {
            const label = entry.$('status-error-stack').createChild('span', 'status-error-field-label');
            UI.UIUtils.createTextChild(label, i18nString(UIStrings.errorStackLabel));
            const stackContent = entry.$('status-error-stack').createChild('div');
            for (const stackEntry of error.stack) {
                const frameBox = stackContent.createChild('div');
                UI.UIUtils.createTextChild(frameBox, `${stackEntry.file}:${stackEntry.line}`);
            }
        }
        if (error.cause.length !== 0) {
            const label = entry.$('status-error-cause').createChild('span', 'status-error-field-label');
            UI.UIUtils.createTextChild(label, i18nString(UIStrings.errorCauseLabel));
            entry.$('status-error-cause').appendChild(this.errorToDiv(error.cause[0]));
        }
        return entry.element();
    }
    addError(error) {
        const container = this.bodyPanel.createChild('div', 'media-messages-message-container media-message-error');
        container.appendChild(this.errorToDiv(error));
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([playerMessagesViewStyles]);
    }
}
//# sourceMappingURL=PlayerMessagesView.js.map