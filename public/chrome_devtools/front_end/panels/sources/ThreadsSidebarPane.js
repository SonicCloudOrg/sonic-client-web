// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import threadsSidebarPaneStyles from './threadsSidebarPane.css.js';
const UIStrings = {
    /**
     *@description Text in Threads Sidebar Pane of the Sources panel
     */
    paused: 'paused',
};
const str_ = i18n.i18n.registerUIStrings('panels/sources/ThreadsSidebarPane.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ThreadsSidebarPane extends UI.Widget.VBox {
    items;
    list;
    selectedModel;
    constructor() {
        super(true);
        this.contentElement.setAttribute('jslog', `${VisualLogging.section('sources.threads')}`);
        this.items = new UI.ListModel.ListModel();
        this.list = new UI.ListControl.ListControl(this.items, this, UI.ListControl.ListMode.NonViewport);
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        this.selectedModel = currentTarget !== null ? currentTarget.model(SDK.DebuggerModel.DebuggerModel) : null;
        this.contentElement.appendChild(this.list.element);
        UI.Context.Context.instance().addFlavorChangeListener(SDK.Target.Target, this.targetFlavorChanged, this);
        SDK.TargetManager.TargetManager.instance().observeModels(SDK.DebuggerModel.DebuggerModel, this);
    }
    static shouldBeShown() {
        return SDK.TargetManager.TargetManager.instance().models(SDK.DebuggerModel.DebuggerModel).length >= 2;
    }
    createElementForItem(debuggerModel) {
        const element = document.createElement('div');
        element.classList.add('thread-item');
        const title = element.createChild('div', 'thread-item-title');
        const pausedState = element.createChild('div', 'thread-item-paused-state');
        const icon = new IconButton.Icon.Icon();
        icon.data = {
            iconName: 'large-arrow-right-filled',
            color: 'var(--icon-arrow-main-thread)',
            width: '14px',
            height: '14px',
        };
        icon.classList.add('selected-thread-icon');
        element.appendChild(icon);
        element.tabIndex = -1;
        self.onInvokeElement(element, event => {
            UI.Context.Context.instance().setFlavor(SDK.Target.Target, debuggerModel.target());
            event.consume(true);
        });
        const isSelected = UI.Context.Context.instance().flavor(SDK.Target.Target) === debuggerModel.target();
        element.classList.toggle('selected', isSelected);
        UI.ARIAUtils.setSelected(element, isSelected);
        function updateTitle() {
            const executionContext = debuggerModel.runtimeModel().defaultExecutionContext();
            title.textContent =
                executionContext && executionContext.label() ? executionContext.label() : debuggerModel.target().name();
        }
        function updatePausedState() {
            pausedState.textContent = debuggerModel.isPaused() ? i18nString(UIStrings.paused) : '';
        }
        function targetNameChanged(event) {
            const target = event.data;
            if (target === debuggerModel.target()) {
                updateTitle();
            }
        }
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerPaused, updatePausedState);
        debuggerModel.addEventListener(SDK.DebuggerModel.Events.DebuggerResumed, updatePausedState);
        debuggerModel.runtimeModel().addEventListener(SDK.RuntimeModel.Events.ExecutionContextChanged, updateTitle);
        SDK.TargetManager.TargetManager.instance().addEventListener("NameChanged" /* SDK.TargetManager.Events.NameChanged */, targetNameChanged);
        updatePausedState();
        updateTitle();
        return element;
    }
    heightForItem(_debuggerModel) {
        console.assert(false); // Should not be called.
        return 0;
    }
    isItemSelectable(_debuggerModel) {
        return true;
    }
    selectedItemChanged(_from, _to, fromElement, toElement) {
        const fromEle = fromElement;
        if (fromEle) {
            fromEle.tabIndex = -1;
        }
        const toEle = toElement;
        if (toEle) {
            this.setDefaultFocusedElement(toEle);
            toEle.tabIndex = 0;
            if (this.hasFocus()) {
                toEle.focus();
            }
        }
    }
    updateSelectedItemARIA(_fromElement, _toElement) {
        return false;
    }
    modelAdded(debuggerModel) {
        this.items.insert(this.items.length, debuggerModel);
        const currentTarget = UI.Context.Context.instance().flavor(SDK.Target.Target);
        if (currentTarget === debuggerModel.target()) {
            this.list.selectItem(debuggerModel);
        }
    }
    modelRemoved(debuggerModel) {
        this.items.remove(this.items.indexOf(debuggerModel));
    }
    targetFlavorChanged({ data: target }) {
        const hadFocus = this.hasFocus();
        const debuggerModel = target.model(SDK.DebuggerModel.DebuggerModel);
        this.list.selectItem(debuggerModel);
        if (debuggerModel) {
            this.list.refreshItem(debuggerModel);
        }
        if (this.selectedModel !== null) {
            this.list.refreshItem(this.selectedModel);
        }
        this.selectedModel = debuggerModel;
        if (hadFocus) {
            this.focus();
        }
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([threadsSidebarPaneStyles]);
    }
}
//# sourceMappingURL=ThreadsSidebarPane.js.map