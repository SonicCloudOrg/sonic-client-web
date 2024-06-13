// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { DeveloperResourcesListView } from './DeveloperResourcesListView.js';
import developerResourcesViewStyles from './developerResourcesView.css.js';
const UIStrings = {
    /**
     *@description Placeholder for a search field in a toolbar
     */
    filterByText: 'Filter by URL and error',
    /**
     * @description Tooltip for a checkbox in the toolbar of the developer resources view. The
     * inspected target is the webpage that DevTools is debugging/inspecting/attached to.
     */
    loadHttpsDeveloperResources: 'Load `HTTP(S)` developer resources through the website you inspect, not through DevTools',
    /**
     * @description Text for a checkbox in the toolbar of the developer resources view. The target is
     * the webpage that DevTools is debugging/inspecting/attached to. This setting makes it so
     * developer resources are requested from the webpage itself, and not from the DevTools
     * application.
     */
    enableLoadingThroughTarget: 'Load through website',
    /**
     *@description Text for resources load status
     *@example {1} PH1
     *@example {1} PH2
     */
    resourcesCurrentlyLoading: '{PH1} resources, {PH2} currently loading',
    /**
     * @description Status text that appears to tell the developer how many resources were loaded in
     * total. Resources are files related to the webpage.
     */
    resources: '{n, plural, =1 {# resource} other {# resources}}',
};
const str_ = i18n.i18n.registerUIStrings('panels/developer_resources/DeveloperResourcesView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class DeveloperResourcesRevealer {
    async reveal(resourceInitiatorKey) {
        const loader = SDK.PageResourceLoader.PageResourceLoader.instance();
        const resource = loader.getResourcesLoaded().get(resourceInitiatorKey.key);
        if (resource) {
            await UI.ViewManager.ViewManager.instance().showView('developer-resources');
            const developerResourcesView = await UI.ViewManager.ViewManager.instance().view('developer-resources').widget();
            return developerResourcesView.select(resource);
        }
    }
}
export class DeveloperResourcesView extends UI.ThrottledWidget.ThrottledWidget {
    textFilterRegExp;
    filterInput;
    coverageResultsElement;
    listView;
    statusToolbarElement;
    statusMessageElement;
    loader;
    constructor() {
        super(true);
        this.element.setAttribute('jslog', `${VisualLogging.panel('developer-resources').track({ resize: true })}`);
        const toolbarContainer = this.contentElement.createChild('div', 'developer-resource-view-toolbar-container');
        toolbarContainer.setAttribute('jslog', `${VisualLogging.toolbar()}`);
        const toolbar = new UI.Toolbar.Toolbar('developer-resource-view-toolbar', toolbarContainer);
        this.textFilterRegExp = null;
        this.filterInput = new UI.Toolbar.ToolbarFilter(i18nString(UIStrings.filterByText), 1);
        this.filterInput.addEventListener("TextChanged" /* UI.Toolbar.ToolbarInput.Event.TextChanged */, this.onFilterChanged, this);
        toolbar.appendToolbarItem(this.filterInput);
        const loadThroughTarget = SDK.PageResourceLoader.getLoadThroughTargetSetting();
        const loadThroughTargetCheckbox = new UI.Toolbar.ToolbarSettingCheckbox(loadThroughTarget, i18nString(UIStrings.loadHttpsDeveloperResources), i18nString(UIStrings.enableLoadingThroughTarget));
        toolbar.appendToolbarItem(loadThroughTargetCheckbox);
        this.coverageResultsElement = this.contentElement.createChild('div', 'developer-resource-view-results');
        this.listView = new DeveloperResourcesListView(this.isVisible.bind(this));
        this.listView.show(this.coverageResultsElement);
        this.statusToolbarElement = this.contentElement.createChild('div', 'developer-resource-view-toolbar-summary');
        this.statusMessageElement = this.statusToolbarElement.createChild('div', 'developer-resource-view-message');
        this.loader = SDK.PageResourceLoader.PageResourceLoader.instance();
        this.loader.addEventListener("Update" /* SDK.PageResourceLoader.Events.Update */, this.update, this);
        this.update();
    }
    async doUpdate() {
        const selectedItem = this.listView.selectedItem();
        this.listView.reset();
        this.listView.update(this.loader.getScopedResourcesLoaded().values());
        if (selectedItem) {
            this.listView.select(selectedItem);
        }
        this.updateStats();
    }
    async select(resource) {
        await this.lastUpdatePromise;
        this.listView.select(resource);
    }
    async selectedItem() {
        await this.lastUpdatePromise;
        return this.listView.selectedItem();
    }
    updateStats() {
        const { loading, resources } = this.loader.getScopedNumberOfResources();
        if (loading > 0) {
            this.statusMessageElement.textContent =
                i18nString(UIStrings.resourcesCurrentlyLoading, { PH1: resources, PH2: loading });
        }
        else {
            this.statusMessageElement.textContent = i18nString(UIStrings.resources, { n: resources });
        }
    }
    isVisible(item) {
        return !this.textFilterRegExp || this.textFilterRegExp.test(item.url) ||
            this.textFilterRegExp.test(item.errorMessage || '');
    }
    onFilterChanged() {
        if (!this.listView) {
            return;
        }
        const text = this.filterInput.value();
        this.textFilterRegExp = text ? Platform.StringUtilities.createPlainTextSearchRegex(text, 'i') : null;
        this.listView.updateFilterAndHighlight(this.textFilterRegExp);
        this.updateStats();
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([developerResourcesViewStyles]);
    }
}
//# sourceMappingURL=DeveloperResourcesView.js.map