// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
const UIStrings = {
    /**
     *@description Tooltip for the 3-dots menu in the Memory panel profiles list.
     */
    profileOptions: 'Profile options',
};
const str_ = i18n.i18n.registerUIStrings('panels/profiler/ProfileSidebarTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ProfileSidebarTreeElement extends UI.TreeOutline.TreeElement {
    iconElement;
    titlesElement;
    menuElement;
    titleContainer;
    titleElement;
    subtitleElement;
    className;
    small;
    dataDisplayDelegate;
    profile;
    saveLinkElement;
    editing;
    constructor(dataDisplayDelegate, profile, className) {
        super('', false);
        this.iconElement = document.createElement('div');
        this.iconElement.classList.add('icon');
        this.titlesElement = document.createElement('div');
        this.titlesElement.classList.add('titles');
        this.titlesElement.classList.add('no-subtitle');
        this.titlesElement.setAttribute('jslog', `${VisualLogging.value('title').track({ dblclick: true, change: true })}`);
        this.titleContainer = this.titlesElement.createChild('span', 'title-container');
        this.titleElement = this.titleContainer.createChild('span', 'title');
        this.subtitleElement = this.titlesElement.createChild('span', 'subtitle');
        this.menuElement = document.createElement('button');
        this.menuElement.tabIndex = -1;
        this.menuElement.appendChild(IconButton.Icon.create('dots-vertical'));
        this.menuElement.addEventListener('click', this.handleContextMenuEvent.bind(this));
        this.menuElement.setAttribute('jslog', `${VisualLogging.dropDown('profile-options').track({ click: true })}`);
        UI.Tooltip.Tooltip.install(this.menuElement, i18nString(UIStrings.profileOptions));
        this.titleElement.textContent = profile.title;
        this.className = className;
        this.small = false;
        this.dataDisplayDelegate = dataDisplayDelegate;
        this.profile = profile;
        profile.addEventListener("UpdateStatus" /* ProfileHeaderEvents.UpdateStatus */, this.updateStatus, this);
    }
    updateStatus(event) {
        const statusUpdate = event.data;
        if (statusUpdate.subtitle !== null) {
            this.subtitleElement.textContent = statusUpdate.subtitle || '';
            this.titlesElement.classList.toggle('no-subtitle', !statusUpdate.subtitle);
            UI.ARIAUtils.setLabel(this.listItemElement, `${this.profile.title}, ${statusUpdate.subtitle}`);
        }
        if (typeof statusUpdate.wait === 'boolean' && this.listItemElement) {
            this.iconElement.classList.toggle('spinner', statusUpdate.wait);
            this.listItemElement.classList.toggle('wait', statusUpdate.wait);
        }
    }
    ondblclick(event) {
        if (!this.editing) {
            this.startEditing(event.target);
        }
        return false;
    }
    startEditing(eventTarget) {
        const container = eventTarget.enclosingNodeOrSelfWithClass('title');
        if (!container) {
            return;
        }
        const config = new UI.InplaceEditor.Config(this.editingCommitted.bind(this), this.editingCancelled.bind(this));
        this.editing = UI.InplaceEditor.InplaceEditor.startEditing(container, config);
    }
    editingCommitted(container, newTitle) {
        delete this.editing;
        this.profile.setTitle(newTitle);
    }
    editingCancelled() {
        delete this.editing;
    }
    dispose() {
        this.profile.removeEventListener("UpdateStatus" /* ProfileHeaderEvents.UpdateStatus */, this.updateStatus, this);
    }
    onselect() {
        this.dataDisplayDelegate.showProfile(this.profile);
        return true;
    }
    ondelete() {
        this.profile.profileType().removeProfile(this.profile);
        return true;
    }
    onattach() {
        if (this.className) {
            this.listItemElement.classList.add(this.className);
        }
        if (this.small) {
            this.listItemElement.classList.add('small');
        }
        this.listItemElement.append(this.iconElement, this.titlesElement, this.menuElement);
        this.listItemElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this), true);
        UI.ARIAUtils.setDescription(this.listItemElement, this.profile.profileType().name);
    }
    handleContextMenuEvent(event) {
        const contextMenu = new UI.ContextMenu.ContextMenu(event);
        contextMenu.appendItemsAtLocation('profilerMenu');
        void contextMenu.show();
    }
    setSmall(small) {
        this.small = small;
        if (this.listItemElement) {
            this.listItemElement.classList.toggle('small', this.small);
        }
    }
    setMainTitle(title) {
        this.titleElement.textContent = title;
    }
}
//# sourceMappingURL=ProfileSidebarTreeElement.js.map