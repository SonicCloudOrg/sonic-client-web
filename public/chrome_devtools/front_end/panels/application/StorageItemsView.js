// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import * as ApplicationComponents from './components/components.js';
const UIStrings = {
    /**
     *@description Text to refresh the page
     */
    refresh: 'Refresh',
    /**
     *@description Text to clear everything
     */
    clearAll: 'Clear All',
    /**
     *@description Tooltip text that appears when hovering over the largeicon delete button in the Service Worker Cache Views of the Application panel
     */
    deleteSelected: 'Delete Selected',
    /**
     *@description Text that informs screen reader users that the storage table has been refreshed
     */
    refreshedStatus: 'Table refreshed',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/StorageItemsView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class StorageItemsView extends UI.Widget.VBox {
    filterRegex;
    refreshButton;
    mainToolbar;
    filterItem;
    deleteAllButton;
    deleteSelectedButton;
    metadataView = new ApplicationComponents.StorageMetadataView.StorageMetadataView();
    constructor(_title, _filterName) {
        super(false);
        this.filterRegex = null;
        this.refreshButton = this.addButton(i18nString(UIStrings.refresh), 'refresh', () => {
            this.refreshItems();
            UI.ARIAUtils.alert(i18nString(UIStrings.refreshedStatus));
        });
        this.refreshButton.element.setAttribute('jslog', `${VisualLogging.action('storage-items-view.refresh').track({ click: true })}`);
        this.mainToolbar = new UI.Toolbar.Toolbar('top-resources-toolbar', this.element);
        this.mainToolbar.element.setAttribute('jslog', `${VisualLogging.toolbar()}`);
        this.filterItem = new UI.Toolbar.ToolbarFilter(undefined, 0.4);
        this.filterItem.addEventListener("TextChanged" /* UI.Toolbar.ToolbarInput.Event.TextChanged */, this.filterChanged, this);
        const toolbarSeparator = new UI.Toolbar.ToolbarSeparator();
        this.deleteAllButton = this.addButton(i18nString(UIStrings.clearAll), 'clear', this.deleteAllItems);
        this.deleteSelectedButton = this.addButton(i18nString(UIStrings.deleteSelected), 'cross', this.deleteSelectedItem);
        this.deleteSelectedButton.element.setAttribute('jslog', `${VisualLogging.action('storage-items-view.delete-selected').track({ click: true })}`);
        this.deleteAllButton.element.id = 'storage-items-delete-all';
        this.deleteAllButton.element.setAttribute('jslog', `${VisualLogging.action('storage-items-view.clear-all').track({ click: true })}`);
        const toolbarItems = [this.refreshButton, this.filterItem, toolbarSeparator, this.deleteAllButton, this.deleteSelectedButton];
        for (const item of toolbarItems) {
            this.mainToolbar.appendToolbarItem(item);
        }
        this.contentElement.appendChild(this.metadataView);
    }
    setDeleteAllTitle(title) {
        this.deleteAllButton.setTitle(title);
    }
    setDeleteAllGlyph(glyph) {
        this.deleteAllButton.setGlyph(glyph);
    }
    appendToolbarItem(item) {
        this.mainToolbar.appendToolbarItem(item);
    }
    setStorageKey(storageKey) {
        this.metadataView.setStorageKey(storageKey);
    }
    addButton(label, glyph, callback) {
        const button = new UI.Toolbar.ToolbarButton(label, glyph);
        button.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, callback, this);
        return button;
    }
    filterChanged({ data: text }) {
        this.filterRegex = text ? new RegExp(Platform.StringUtilities.escapeForRegExp(text), 'i') : null;
        this.refreshItems();
    }
    filter(items, keyFunction) {
        if (this.filterRegex) {
            const regExp = this.filterRegex;
            return items.filter(item => regExp.test(keyFunction(item)));
        }
        return items;
    }
    hasFilter() {
        return Boolean(this.filterRegex);
    }
    wasShown() {
        this.refreshItems();
    }
    setCanDeleteAll(enabled) {
        this.deleteAllButton.setEnabled(enabled);
    }
    setCanDeleteSelected(enabled) {
        this.deleteSelectedButton.setEnabled(enabled);
    }
    setCanRefresh(enabled) {
        this.refreshButton.setEnabled(enabled);
    }
    setCanFilter(enabled) {
        this.filterItem.setEnabled(enabled);
    }
    deleteAllItems() {
    }
    deleteSelectedItem() {
    }
    refreshItems() {
    }
}
//# sourceMappingURL=StorageItemsView.js.map