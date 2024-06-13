/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Root from '../../core/root/root.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { PanelUtils } from '../utils/utils.js';
import * as PanelComponents from './components/components.js';
import settingsScreenStyles from './settingsScreen.css.js';
const UIStrings = {
    /**
     *@description Name of the Settings view
     */
    settings: 'Settings',
    /**
     *@description Text for keyboard shortcuts
     */
    shortcuts: 'Shortcuts',
    /**
     *@description Text in Settings Screen of the Settings
     */
    preferences: 'Preferences',
    /**
     *@description Text of button in Settings Screen of the Settings
     */
    restoreDefaultsAndReload: 'Restore defaults and reload',
    /**
     *@description Text in Settings Screen of the Settings
     */
    experiments: 'Experiments',
    /**
     *@description Message shown in the experiments panel to warn users about any possible unstable features.
     */
    theseExperimentsCouldBeUnstable: 'These experiments could be unstable or unreliable and may require you to restart DevTools.',
    /**
     *@description Message text content in Settings Screen of the Settings
     */
    theseExperimentsAreParticularly: 'These experiments are particularly unstable. Enable at your own risk.',
    /**
     *@description Warning text content in Settings Screen of the Settings
     */
    warning: 'WARNING:',
    /**
     *@description Message to display if a setting change requires a reload of DevTools
     */
    oneOrMoreSettingsHaveChanged: 'One or more settings have changed which requires a reload to take effect.',
    /**
     * @description Label for a filter text input that controls which experiments are shown.
     */
    filterExperimentsLabel: 'Filter',
    /**
     * @description Warning text shown when the user has entered text to filter the
     * list of experiments, but no experiments match the filter.
     */
    noResults: 'No experiments match the filter',
    /**
     *@description Text that is usually a hyperlink to more documentation
     */
    learnMore: 'Learn more',
    /**
     *@description Text that is usually a hyperlink to a feedback form
     */
    sendFeedback: 'Send feedback',
};
const str_ = i18n.i18n.registerUIStrings('panels/settings/SettingsScreen.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let settingsScreenInstance;
export class SettingsScreen extends UI.Widget.VBox {
    tabbedLocation;
    keybindsTab;
    reportTabOnReveal;
    constructor() {
        super(true);
        this.contentElement.classList.add('settings-window-main');
        this.contentElement.classList.add('vbox');
        const settingsLabelElement = document.createElement('div');
        settingsLabelElement.classList.add('settings-window-label-element');
        const settingsTitleElement = UI.UIUtils
            .createShadowRootWithCoreStyles(settingsLabelElement, { cssFile: [settingsScreenStyles], delegatesFocus: undefined })
            .createChild('div', 'settings-window-title');
        UI.ARIAUtils.markAsHeading(settingsTitleElement, 1);
        settingsTitleElement.textContent = i18nString(UIStrings.settings);
        this.tabbedLocation = UI.ViewManager.ViewManager.instance().createTabbedLocation(() => SettingsScreen.revealSettingsScreen(), 'settings-view');
        const tabbedPane = this.tabbedLocation.tabbedPane();
        tabbedPane.registerCSSFiles([settingsScreenStyles]);
        tabbedPane.headerElement().prepend(settingsLabelElement);
        tabbedPane.setShrinkableTabs(false);
        tabbedPane.makeVerticalTabLayout();
        const keyBindsView = UI.ViewManager.ViewManager.instance().view('keybinds');
        if (keyBindsView) {
            void keyBindsView.widget().then(widget => {
                this.keybindsTab = widget;
            });
        }
        tabbedPane.show(this.contentElement);
        tabbedPane.selectTab('preferences');
        tabbedPane.addEventListener(UI.TabbedPane.Events.TabInvoked, this.tabInvoked, this);
        this.reportTabOnReveal = false;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!settingsScreenInstance || forceNew) {
            settingsScreenInstance = new SettingsScreen();
        }
        return settingsScreenInstance;
    }
    static revealSettingsScreen() {
        const settingsScreen = SettingsScreen.instance();
        if (settingsScreen.isShowing()) {
            return settingsScreen;
        }
        settingsScreen.reportTabOnReveal = true;
        const dialog = new UI.Dialog.Dialog('settings');
        dialog.contentElement.tabIndex = -1;
        dialog.addCloseButton();
        dialog.setOutsideClickCallback(() => { });
        dialog.setPointerEventsBehavior("PierceGlassPane" /* UI.GlassPane.PointerEventsBehavior.PierceGlassPane */);
        dialog.setOutsideTabIndexBehavior("PreserveMainViewTabIndex" /* UI.Dialog.OutsideTabIndexBehavior.PreserveMainViewTabIndex */);
        settingsScreen.show(dialog.contentElement);
        dialog.setEscapeKeyCallback(settingsScreen.onEscapeKeyPressed.bind(settingsScreen));
        dialog.setMarginBehavior("NoMargin" /* UI.GlassPane.MarginBehavior.NoMargin */);
        // UI.Dialog extends GlassPane and overrides the `show` method with a wider
        // accepted type. However, TypeScript uses the supertype declaration to
        // determine the full type, which requires a `!Document`.
        // @ts-ignore
        dialog.show();
        return settingsScreen;
    }
    static async showSettingsScreen(options = { name: undefined, focusTabHeader: undefined }) {
        const { name, focusTabHeader } = options;
        const settingsScreen = SettingsScreen.revealSettingsScreen();
        settingsScreen.selectTab(name || 'preferences');
        const tabbedPane = settingsScreen.tabbedLocation.tabbedPane();
        await tabbedPane.waitForTabElementUpdate();
        if (focusTabHeader) {
            tabbedPane.focusSelectedTabHeader();
        }
        else {
            tabbedPane.focus();
        }
    }
    resolveLocation(_locationName) {
        return this.tabbedLocation;
    }
    selectTab(name) {
        this.tabbedLocation.tabbedPane().selectTab(name, /* userGesture */ true);
    }
    tabInvoked(event) {
        const eventData = event.data;
        if (!eventData.isUserGesture) {
            return;
        }
        const prevTabId = eventData.prevTabId;
        const tabId = eventData.tabId;
        if (!this.reportTabOnReveal && prevTabId && prevTabId === tabId) {
            return;
        }
        this.reportTabOnReveal = false;
        this.reportSettingsPanelShown(tabId);
    }
    reportSettingsPanelShown(tabId) {
        if (tabId === i18nString(UIStrings.shortcuts)) {
            Host.userMetrics.settingsPanelShown('shortcuts');
            return;
        }
        Host.userMetrics.settingsPanelShown(tabId);
    }
    onEscapeKeyPressed(event) {
        if (this.tabbedLocation.tabbedPane().selectedTabId === 'keybinds' && this.keybindsTab) {
            this.keybindsTab.onEscapeKeyPressed(event);
        }
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([settingsScreenStyles]);
    }
}
class SettingsTab extends UI.Widget.VBox {
    containerElement;
    constructor(name, id) {
        super();
        this.element.classList.add('settings-tab-container');
        if (id) {
            this.element.id = id;
        }
        const header = this.element.createChild('header');
        UI.UIUtils.createTextChild(header.createChild('h1'), name);
        this.containerElement = this.element.createChild('div', 'settings-container-wrapper')
            .createChild('div', 'settings-tab settings-content settings-container');
    }
    appendSection(name) {
        const block = this.containerElement.createChild('div', 'settings-block');
        if (name) {
            UI.ARIAUtils.markAsGroup(block);
            const title = block.createChild('div', 'settings-section-title');
            title.textContent = name;
            UI.ARIAUtils.markAsHeading(title, 2);
            UI.ARIAUtils.setLabel(block, name);
        }
        return block;
    }
}
export class GenericSettingsTab extends SettingsTab {
    syncSection = new PanelComponents.SyncSection.SyncSection();
    settingToControl = new Map();
    constructor() {
        super(i18nString(UIStrings.preferences), 'preferences-tab-content');
        this.element.setAttribute('jslog', `${VisualLogging.pane('preferences')}`);
        // GRID, MOBILE, EMULATION, and RENDERING are intentionally excluded from this list.
        const explicitSectionOrder = [
            "" /* Common.Settings.SettingCategory.NONE */,
            "APPEARANCE" /* Common.Settings.SettingCategory.APPEARANCE */,
            "SOURCES" /* Common.Settings.SettingCategory.SOURCES */,
            "ELEMENTS" /* Common.Settings.SettingCategory.ELEMENTS */,
            "NETWORK" /* Common.Settings.SettingCategory.NETWORK */,
            "PERFORMANCE" /* Common.Settings.SettingCategory.PERFORMANCE */,
            "MEMORY" /* Common.Settings.SettingCategory.MEMORY */,
            "CONSOLE" /* Common.Settings.SettingCategory.CONSOLE */,
            "EXTENSIONS" /* Common.Settings.SettingCategory.EXTENSIONS */,
            "PERSISTENCE" /* Common.Settings.SettingCategory.PERSISTENCE */,
            "DEBUGGER" /* Common.Settings.SettingCategory.DEBUGGER */,
            "GLOBAL" /* Common.Settings.SettingCategory.GLOBAL */,
            "SYNC" /* Common.Settings.SettingCategory.SYNC */,
        ];
        // Some settings define their initial ordering.
        const preRegisteredSettings = Common.Settings.Settings.instance().getRegisteredSettings().sort((firstSetting, secondSetting) => {
            if (firstSetting.order && secondSetting.order) {
                return (firstSetting.order - secondSetting.order);
            }
            if (firstSetting.order) {
                return -1;
            }
            if (secondSetting.order) {
                return 1;
            }
            return 0;
        });
        for (const sectionCategory of explicitSectionOrder) {
            const settingsForSection = preRegisteredSettings.filter(setting => setting.category === sectionCategory && GenericSettingsTab.isSettingVisible(setting));
            this.createSectionElement(sectionCategory, settingsForSection);
        }
        const restoreAndReloadButton = UI.UIUtils.createTextButton(i18nString(UIStrings.restoreDefaultsAndReload), restoreAndReload, { jslogContext: 'settings.restore-defaults-and-reload' });
        this.appendSection().appendChild(restoreAndReloadButton);
        function restoreAndReload() {
            Common.Settings.Settings.instance().clearAll();
            Components.Reload.reload();
        }
    }
    static isSettingVisible(setting) {
        return Boolean(setting.title?.()) && Boolean(setting.category);
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(GenericSettingsTab, this);
        super.wasShown();
        this.updateSyncSection();
    }
    willHide() {
        super.willHide();
        UI.Context.Context.instance().setFlavor(GenericSettingsTab, null);
    }
    updateSyncSection() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.getSyncInformation(syncInfo => {
            this.syncSection.data = {
                syncInfo,
                syncSetting: Common.Settings.moduleSetting('sync-preferences'),
            };
        });
    }
    createExtensionSection(settings) {
        const sectionName = "EXTENSIONS" /* Common.Settings.SettingCategory.EXTENSIONS */;
        const settingUI = Components.Linkifier.LinkHandlerSettingUI.instance();
        const element = settingUI.settingElement();
        if (element) {
            const sectionElement = this.createStandardSectionElement(sectionName, settings);
            sectionElement.appendChild(element);
        }
    }
    createSectionElement(category, settings) {
        // Always create the EXTENSIONS section and append the link handling control.
        if (category === "EXTENSIONS" /* Common.Settings.SettingCategory.EXTENSIONS */) {
            this.createExtensionSection(settings);
        }
        else if (category === "SYNC" /* Common.Settings.SettingCategory.SYNC */ && settings.length > 0) {
            this.containerElement.appendChild(this.syncSection);
        }
        else if (settings.length > 0) {
            this.createStandardSectionElement(category, settings);
        }
    }
    createStandardSectionElement(category, settings) {
        const uiSectionName = Common.Settings.getLocalizedSettingsCategory(category);
        const sectionElement = this.appendSection(uiSectionName);
        for (const settingRegistration of settings) {
            const setting = Common.Settings.Settings.instance().moduleSetting(settingRegistration.settingName);
            const settingControl = UI.SettingsUI.createControlForSetting(setting);
            if (settingControl) {
                this.settingToControl.set(setting, settingControl);
                sectionElement.appendChild(settingControl);
            }
        }
        return sectionElement;
    }
    highlightObject(setting) {
        if (setting instanceof Common.Settings.Setting) {
            const element = this.settingToControl.get(setting);
            if (element) {
                PanelUtils.highlightElement(element);
            }
        }
    }
}
export class ExperimentsSettingsTab extends SettingsTab {
    #experimentsSection;
    #unstableExperimentsSection;
    #inputElement;
    experimentToControl = new Map();
    constructor() {
        super(i18nString(UIStrings.experiments), 'experiments-tab-content');
        const filterSection = this.appendSection();
        filterSection.classList.add('experiments-filter');
        this.element.setAttribute('jslog', `${VisualLogging.pane('experiments')}`);
        const labelElement = filterSection.createChild('label');
        labelElement.textContent = i18nString(UIStrings.filterExperimentsLabel);
        this.#inputElement = UI.UIUtils.createInput('', 'text', 'experiments-filter');
        UI.ARIAUtils.bindLabelToControl(labelElement, this.#inputElement);
        filterSection.appendChild(this.#inputElement);
        this.#inputElement.addEventListener('input', () => this.renderExperiments(this.#inputElement.value.toLowerCase()), false);
        this.setDefaultFocusedElement(this.#inputElement);
        this.setFilter('');
    }
    renderExperiments(filterText) {
        this.experimentToControl.clear();
        if (this.#experimentsSection) {
            this.#experimentsSection.remove();
        }
        if (this.#unstableExperimentsSection) {
            this.#unstableExperimentsSection.remove();
        }
        const experiments = Root.Runtime.experiments.allConfigurableExperiments().sort();
        const unstableExperiments = experiments.filter(e => e.unstable && e.title.toLowerCase().includes(filterText));
        const stableExperiments = experiments.filter(e => !e.unstable && e.title.toLowerCase().includes(filterText));
        if (stableExperiments.length) {
            this.#experimentsSection = this.appendSection();
            const warningMessage = i18nString(UIStrings.theseExperimentsCouldBeUnstable);
            this.#experimentsSection.appendChild(this.createExperimentsWarningSubsection(warningMessage));
            for (const experiment of stableExperiments) {
                this.#experimentsSection.appendChild(this.createExperimentCheckbox(experiment));
            }
        }
        if (unstableExperiments.length) {
            this.#unstableExperimentsSection = this.appendSection();
            const warningMessage = i18nString(UIStrings.theseExperimentsAreParticularly);
            this.#unstableExperimentsSection.appendChild(this.createExperimentsWarningSubsection(warningMessage));
            for (const experiment of unstableExperiments) {
                this.#unstableExperimentsSection.appendChild(this.createExperimentCheckbox(experiment));
            }
        }
        if (!stableExperiments.length && !unstableExperiments.length) {
            this.#experimentsSection = this.appendSection();
            const warning = this.#experimentsSection.createChild('span');
            warning.textContent = i18nString(UIStrings.noResults);
            UI.ARIAUtils.alert(warning.textContent);
        }
    }
    createExperimentsWarningSubsection(warningMessage) {
        const subsection = document.createElement('div');
        const warning = subsection.createChild('span', 'settings-experiments-warning-subsection-warning');
        warning.textContent = i18nString(UIStrings.warning);
        UI.UIUtils.createTextChild(subsection, ' ');
        const message = subsection.createChild('span', 'settings-experiments-warning-subsection-message');
        message.textContent = warningMessage;
        return subsection;
    }
    createExperimentCheckbox(experiment) {
        const label = UI.UIUtils.CheckboxLabel.create(experiment.title, experiment.isEnabled(), undefined, experiment.name);
        label.classList.add('experiment-label');
        const input = label.checkboxElement;
        input.name = experiment.name;
        function listener() {
            experiment.setEnabled(input.checked);
            Host.userMetrics.experimentChanged(experiment.name, experiment.isEnabled());
            UI.InspectorView.InspectorView.instance().displayReloadRequiredWarning(i18nString(UIStrings.oneOrMoreSettingsHaveChanged));
        }
        input.addEventListener('click', listener, false);
        const p = document.createElement('p');
        this.experimentToControl.set(experiment, p);
        p.classList.add('settings-experiment');
        if (experiment.unstable && !experiment.isEnabled()) {
            p.classList.add('settings-experiment-unstable');
        }
        p.appendChild(label);
        if (experiment.docLink) {
            const link = UI.XLink.XLink.create(experiment.docLink, undefined, undefined, undefined, `${experiment.name}-documentation`);
            link.textContent = '';
            link.setAttribute('aria-label', i18nString(UIStrings.learnMore));
            const linkIcon = new IconButton.Icon.Icon();
            linkIcon.data = { iconName: 'help', color: 'var(--icon-default)', width: '16px', height: '16px' };
            linkIcon.classList.add('link-icon');
            link.prepend(linkIcon);
            p.appendChild(link);
        }
        if (experiment.feedbackLink) {
            const link = UI.XLink.XLink.create(experiment.feedbackLink, undefined, undefined, undefined, `${experiment.name}-feedback`);
            link.textContent = i18nString(UIStrings.sendFeedback);
            link.classList.add('feedback-link');
            p.appendChild(link);
        }
        return p;
    }
    highlightObject(experiment) {
        if (experiment instanceof Root.Runtime.Experiment) {
            const element = this.experimentToControl.get(experiment);
            if (element) {
                PanelUtils.highlightElement(element);
            }
        }
    }
    setFilter(filterText) {
        this.#inputElement.value = filterText;
        this.#inputElement.dispatchEvent(new Event('input', { 'bubbles': true, 'cancelable': true }));
    }
    wasShown() {
        UI.Context.Context.instance().setFlavor(ExperimentsSettingsTab, this);
        super.wasShown();
    }
    willHide() {
        super.willHide();
        UI.Context.Context.instance().setFlavor(ExperimentsSettingsTab, null);
    }
}
export class ActionDelegate {
    handleAction(context, actionId) {
        switch (actionId) {
            case 'settings.show':
                void SettingsScreen.showSettingsScreen({ focusTabHeader: true });
                return true;
            case 'settings.documentation':
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(UI.UIUtils.addReferrerToURL('https://developer.chrome.com/docs/devtools/'));
                return true;
            case 'settings.shortcuts':
                void SettingsScreen.showSettingsScreen({ name: 'keybinds', focusTabHeader: true });
                return true;
        }
        return false;
    }
}
export class Revealer {
    async reveal(object) {
        const context = UI.Context.Context.instance();
        if (object instanceof Root.Runtime.Experiment) {
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
            await SettingsScreen.showSettingsScreen({ name: 'experiments' });
            const experimentsSettingsTab = context.flavor(ExperimentsSettingsTab);
            if (experimentsSettingsTab !== null) {
                experimentsSettingsTab.highlightObject(object);
            }
            return;
        }
        for (const settingRegistration of Common.Settings.Settings.instance().getRegisteredSettings()) {
            if (!GenericSettingsTab.isSettingVisible(settingRegistration)) {
                continue;
            }
            if (settingRegistration.settingName === object.name) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
                await SettingsScreen.showSettingsScreen();
                const genericSettingsTab = context.flavor(GenericSettingsTab);
                if (genericSettingsTab !== null) {
                    genericSettingsTab.highlightObject(object);
                }
                return;
            }
        }
        // Reveal settings views
        for (const view of UI.ViewManager.getRegisteredViewExtensions()) {
            const id = view.viewId();
            const location = view.location();
            if (location !== "settings-view" /* UI.ViewManager.ViewLocationValues.SETTINGS_VIEW */) {
                continue;
            }
            const settings = view.settings();
            if (settings && settings.indexOf(object.name) !== -1) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();
                await SettingsScreen.showSettingsScreen({ name: id });
                const widget = await view.widget();
                if (widget instanceof SettingsTab) {
                    widget.highlightObject(object);
                }
                return;
            }
        }
    }
}
//# sourceMappingURL=SettingsScreen.js.map