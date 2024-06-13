/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as Platform from '../../core/platform/platform.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { alert } from './ARIAUtils.js';
import { ToolbarButton } from './Toolbar.js';
const UIStrings = {
    /**
     *@description Text to close something
     */
    close: 'Close',
    /**
     *@description Text to dock the DevTools to the right of the browser tab
     */
    dockToRight: 'Dock to right',
    /**
     *@description Text to dock the DevTools to the bottom of the browser tab
     */
    dockToBottom: 'Dock to bottom',
    /**
     *@description Text to dock the DevTools to the left of the browser tab
     */
    dockToLeft: 'Dock to left',
    /**
     *@description Text to undock the DevTools
     */
    undockIntoSeparateWindow: 'Undock into separate window',
    /**
     *@description Text announced when the DevTools are undocked
     */
    devtoolsUndocked: 'DevTools is undocked',
    /**
     *@description Text announced when the DevTools are docked to the left, right, or bottom of the browser tab
     *@example {bottom} PH1
     */
    devToolsDockedTo: 'DevTools is docked to {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/DockController.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let dockControllerInstance;
export class DockController extends Common.ObjectWrapper.ObjectWrapper {
    canDockInternal;
    closeButton;
    currentDockStateSetting;
    lastDockStateSetting;
    dockSideInternal = undefined;
    titles;
    savedFocus;
    constructor(canDock) {
        super();
        this.canDockInternal = canDock;
        this.closeButton = new ToolbarButton(i18nString(UIStrings.close), 'cross');
        this.closeButton.element.setAttribute('jslog', `${VisualLogging.close().track({ click: true })}`);
        this.closeButton.element.classList.add('close-devtools');
        this.closeButton.addEventListener("Click" /* ToolbarButton.Events.Click */, Host.InspectorFrontendHost.InspectorFrontendHostInstance.closeWindow.bind(Host.InspectorFrontendHost.InspectorFrontendHostInstance));
        this.currentDockStateSetting = Common.Settings.Settings.instance().moduleSetting('currentDockState');
        this.lastDockStateSetting = Common.Settings.Settings.instance().createSetting('last-dock-state', "bottom" /* DockState.BOTTOM */);
        if (!canDock) {
            this.dockSideInternal = "undocked" /* DockState.UNDOCKED */;
            this.closeButton.setVisible(false);
            return;
        }
        this.currentDockStateSetting.addChangeListener(this.dockSideChanged, this);
        if (states.indexOf(this.currentDockStateSetting.get()) === -1) {
            this.currentDockStateSetting.set("right" /* DockState.RIGHT */);
        }
        if (states.indexOf(this.lastDockStateSetting.get()) === -1) {
            this.currentDockStateSetting.set("bottom" /* DockState.BOTTOM */);
        }
    }
    static instance(opts = { forceNew: null, canDock: false }) {
        const { forceNew, canDock } = opts;
        if (!dockControllerInstance || forceNew) {
            dockControllerInstance = new DockController(canDock);
        }
        return dockControllerInstance;
    }
    initialize() {
        if (!this.canDockInternal) {
            return;
        }
        this.titles = [
            i18nString(UIStrings.dockToRight),
            i18nString(UIStrings.dockToBottom),
            i18nString(UIStrings.dockToLeft),
            i18nString(UIStrings.undockIntoSeparateWindow),
        ];
        this.dockSideChanged();
    }
    dockSideChanged() {
        this.setDockSide(this.currentDockStateSetting.get());
        setTimeout(this.announceDockLocation.bind(this), 2000);
    }
    dockSide() {
        return this.dockSideInternal;
    }
    canDock() {
        return this.canDockInternal;
    }
    isVertical() {
        return this.dockSideInternal === "right" /* DockState.RIGHT */ || this.dockSideInternal === "left" /* DockState.LEFT */;
    }
    setDockSide(dockSide) {
        if (states.indexOf(dockSide) === -1) {
            // If the side is invalid, default to a valid one
            dockSide = states[0];
        }
        if (this.dockSideInternal === dockSide) {
            return;
        }
        if (this.dockSideInternal !== undefined) {
            document.body.classList.remove(this.dockSideInternal);
        }
        document.body.classList.add(dockSide);
        if (this.dockSideInternal) {
            this.lastDockStateSetting.set(this.dockSideInternal);
        }
        this.savedFocus = Platform.DOMUtilities.deepActiveElement(document);
        const eventData = { from: this.dockSideInternal, to: dockSide };
        this.dispatchEventToListeners("BeforeDockSideChanged" /* Events.BeforeDockSideChanged */, eventData);
        console.timeStamp('DockController.setIsDocked');
        this.dockSideInternal = dockSide;
        this.currentDockStateSetting.set(dockSide);
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.setIsDocked(dockSide !== "undocked" /* DockState.UNDOCKED */, this.setIsDockedResponse.bind(this, eventData));
        this.closeButton.setVisible(this.dockSideInternal !== "undocked" /* DockState.UNDOCKED */);
        this.dispatchEventToListeners("DockSideChanged" /* Events.DockSideChanged */, eventData);
    }
    setIsDockedResponse(eventData) {
        this.dispatchEventToListeners("AfterDockSideChanged" /* Events.AfterDockSideChanged */, eventData);
        if (this.savedFocus) {
            this.savedFocus.focus();
            this.savedFocus = null;
        }
    }
    toggleDockSide() {
        if (this.lastDockStateSetting.get() === this.currentDockStateSetting.get()) {
            const index = states.indexOf(this.currentDockStateSetting.get()) || 0;
            this.lastDockStateSetting.set(states[(index + 1) % states.length]);
        }
        this.setDockSide(this.lastDockStateSetting.get());
    }
    announceDockLocation() {
        if (this.dockSideInternal === "undocked" /* DockState.UNDOCKED */) {
            alert(i18nString(UIStrings.devtoolsUndocked));
        }
        else {
            alert(i18nString(UIStrings.devToolsDockedTo, { PH1: this.dockSideInternal || '' }));
        }
    }
}
const states = ["right" /* DockState.RIGHT */, "bottom" /* DockState.BOTTOM */, "left" /* DockState.LEFT */, "undocked" /* DockState.UNDOCKED */];
export class ToggleDockActionDelegate {
    handleAction(_context, _actionId) {
        DockController.instance().toggleDockSide();
        return true;
    }
}
let closeButtonProviderInstance;
export class CloseButtonProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!closeButtonProviderInstance || forceNew) {
            closeButtonProviderInstance = new CloseButtonProvider();
        }
        return closeButtonProviderInstance;
    }
    item() {
        return DockController.instance().closeButton;
    }
}
//# sourceMappingURL=DockController.js.map