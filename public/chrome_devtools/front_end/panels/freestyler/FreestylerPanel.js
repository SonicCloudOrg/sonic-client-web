// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LitHtml from '../../ui/lit-html/lit-html.js';
import { ChatMessageEntity, FreestylerChatUi, } from './components/FreestylerChatUi.js';
import { FreestylerAgent } from './FreestylerAgent.js';
import freestylerPanelStyles from './freestylerPanel.css.js';
const UIStrings = {
    /**
     *@description Freestyler UI text for clearing messages.
     */
    clearMessages: 'Clear messages',
    /**
     *@description Freestyler UI text for sending feedback.
     */
    sendFeedback: 'Send feedback',
};
const str_ = i18n.i18n.registerUIStrings('panels/freestyler/FreestylerPanel.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// TODO(ergunsh): Use the WidgetElement instead of separately creating the toolbar.
function createToolbar(target, { onClearClick }) {
    const toolbarContainer = target.createChild('div', 'freestyler-toolbar-container');
    const leftToolbar = new UI.Toolbar.Toolbar('', toolbarContainer);
    const rightToolbar = new UI.Toolbar.Toolbar('freestyler-right-toolbar', toolbarContainer);
    const clearButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.clearMessages), 'clear', undefined, 'freestyler.clear');
    clearButton.addEventListener("Click" /* UI.Toolbar.ToolbarButton.Events.Click */, onClearClick);
    leftToolbar.appendToolbarItem(clearButton);
    rightToolbar.appendSeparator();
    const feedbackButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.sendFeedback), 'bug', undefined, 'freestyler.feedback');
    const helpButton = new UI.Toolbar.ToolbarButton(i18nString(UIStrings.sendFeedback), 'help', undefined, 'freestyler.help');
    rightToolbar.appendToolbarItem(feedbackButton);
    rightToolbar.appendToolbarItem(helpButton);
}
function defaultView(input, output, target) {
    // clang-format off
    LitHtml.render(LitHtml.html `
    <${FreestylerChatUi.litTagName} .props=${input} >
    </${FreestylerChatUi.litTagName}>
  `, target, { host: input }); // eslint-disable-line rulesdir/lit_html_host_this
    // clang-format on
}
let freestylerPanelInstance;
export class FreestylerPanel extends UI.Panel.Panel {
    view;
    static panelName = 'freestyler';
    #toggleSearchElementAction;
    #selectedNode;
    #contentContainer;
    #aidaClient;
    #agent;
    #viewProps;
    constructor(view = defaultView) {
        super(FreestylerPanel.panelName);
        this.view = view;
        createToolbar(this.contentElement, { onClearClick: this.#handleClearClick.bind(this) });
        this.#toggleSearchElementAction =
            UI.ActionRegistry.ActionRegistry.instance().getAction('elements.toggle-element-search');
        this.#aidaClient = new Host.AidaClient.AidaClient();
        this.#contentContainer = this.contentElement.createChild('div', 'freestyler-chat-ui-container');
        this.#agent = new FreestylerAgent({ aidaClient: this.#aidaClient });
        this.#selectedNode = UI.Context.Context.instance().flavor(SDK.DOMModel.DOMNode);
        this.#viewProps = {
            state: "chat-view" /* FreestylerChatUiState.CHAT_VIEW */,
            messages: [],
            inspectElementToggled: this.#toggleSearchElementAction.toggled(),
            selectedNode: this.#selectedNode,
            onTextSubmit: this.#handleTextSubmit.bind(this),
            onInspectElementClick: this.#handleSelectElementClick.bind(this),
            onAcceptPrivacyNotice: this.#handleAcceptPrivacyNotice.bind(this),
        };
        this.#toggleSearchElementAction.addEventListener("Toggled" /* UI.ActionRegistration.Events.Toggled */, ev => {
            this.#viewProps.inspectElementToggled = ev.data;
            this.doUpdate();
        });
        UI.Context.Context.instance().addFlavorChangeListener(SDK.DOMModel.DOMNode, ev => {
            this.#viewProps.selectedNode = ev.data;
            this.doUpdate();
        });
        this.doUpdate();
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!freestylerPanelInstance || forceNew) {
            freestylerPanelInstance = new FreestylerPanel();
        }
        return freestylerPanelInstance;
    }
    wasShown() {
        this.registerCSSFiles([freestylerPanelStyles]);
    }
    doUpdate() {
        this.view(this.#viewProps, this, this.#contentContainer);
    }
    #handleSelectElementClick() {
        void this.#toggleSearchElementAction.execute();
    }
    handleAction(actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context': {
                // TODO(340805362): Add UMA
                this.#handleClearClick();
                break;
            }
            case 'freestyler.style-tab-context': {
                // TODO(340805362): Add UMA
                this.#handleClearClick();
                break;
            }
        }
    }
    // TODO(ergunsh): Handle cancelling agent run.
    #handleClearClick() {
        this.#viewProps.messages = [];
        this.#viewProps.state = "chat-view" /* FreestylerChatUiState.CHAT_VIEW */;
        this.doUpdate();
    }
    async #handleTextSubmit(text) {
        this.#viewProps.messages.push({
            entity: ChatMessageEntity.USER,
            text,
        });
        this.#viewProps.state = "chat-view-loading" /* FreestylerChatUiState.CHAT_VIEW_LOADING */;
        this.doUpdate();
        const systemMessage = {
            entity: ChatMessageEntity.MODEL,
            text: '',
        };
        this.#viewProps.messages.push(systemMessage);
        await this.#agent.run(text, (step, output) => {
            if (this.#viewProps.state === "chat-view-loading" /* FreestylerChatUiState.CHAT_VIEW_LOADING */) {
                this.#viewProps.state = "chat-view" /* FreestylerChatUiState.CHAT_VIEW */;
            }
            // TODO(ergunsh): Better visualize.
            systemMessage.text += `\n${output}`;
            this.doUpdate();
        });
    }
    #handleAcceptPrivacyNotice() {
        this.#viewProps.state = "chat-view" /* FreestylerChatUiState.CHAT_VIEW */;
        this.doUpdate();
    }
}
export class ActionDelegate {
    handleAction(_context, actionId) {
        switch (actionId) {
            case 'freestyler.element-panel-context':
            case 'freestyler.style-tab-context': {
                void (async () => {
                    const view = UI.ViewManager.ViewManager.instance().view(FreestylerPanel.panelName);
                    if (view) {
                        await UI.ViewManager.ViewManager.instance().showView(FreestylerPanel.panelName);
                        const widget = (await view.widget());
                        widget.handleAction(actionId);
                    }
                })();
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=FreestylerPanel.js.map