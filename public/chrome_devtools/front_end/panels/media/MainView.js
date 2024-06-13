// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { MediaModel } from './MediaModel.js';
import { PlayerDetailView } from './PlayerDetailView.js';
import { PlayerListView } from './PlayerListView.js';
class PlayerDataCollection {
    properties;
    messages;
    events;
    errors;
    constructor() {
        this.properties = new Map();
        this.messages = [];
        this.events = [];
        this.errors = [];
    }
    onProperty(property) {
        this.properties.set(property.name, property.value);
    }
    onError(error) {
        this.errors.push(error);
    }
    onMessage(message) {
        this.messages.push(message);
    }
    onEvent(event) {
        this.events.push(event);
    }
    export() {
        return { 'properties': this.properties, 'messages': this.messages, 'events': this.events, 'errors': this.errors };
    }
}
export class PlayerDataDownloadManager {
    playerDataCollection;
    constructor() {
        this.playerDataCollection = new Map();
    }
    addPlayer(playerID) {
        this.playerDataCollection.set(playerID, new PlayerDataCollection());
    }
    onProperty(playerID, property) {
        const playerProperty = this.playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onProperty(property);
    }
    onError(playerID, error) {
        const playerProperty = this.playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onError(error);
    }
    onMessage(playerID, message) {
        const playerProperty = this.playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onMessage(message);
    }
    onEvent(playerID, event) {
        const playerProperty = this.playerDataCollection.get(playerID);
        if (!playerProperty) {
            return;
        }
        playerProperty.onEvent(event);
    }
    exportPlayerData(playerID) {
        const playerProperty = this.playerDataCollection.get(playerID);
        if (!playerProperty) {
            throw new Error('Unable to find player');
        }
        return playerProperty.export();
    }
    deletePlayer(playerID) {
        this.playerDataCollection.delete(playerID);
    }
}
export class MainView extends UI.Panel.PanelWithSidebar {
    detailPanels;
    deletedPlayers;
    downloadStore;
    sidebar;
    constructor(downloadStore = new PlayerDataDownloadManager()) {
        super('media');
        this.detailPanels = new Map();
        this.deletedPlayers = new Set();
        this.downloadStore = downloadStore;
        this.sidebar = new PlayerListView(this);
        this.sidebar.show(this.panelSidebarElement());
        SDK.TargetManager.TargetManager.instance().observeModels(MediaModel, this, { scoped: true });
    }
    renderMainPanel(playerID) {
        if (!this.detailPanels.has(playerID)) {
            return;
        }
        const mainWidget = this.splitWidget().mainWidget();
        if (mainWidget) {
            mainWidget.detachChildWidgets();
        }
        this.detailPanels.get(playerID)?.show(this.mainElement());
    }
    wasShown() {
        super.wasShown();
        for (const model of SDK.TargetManager.TargetManager.instance().models(MediaModel, { scoped: true })) {
            this.addEventListeners(model);
        }
    }
    willHide() {
        for (const model of SDK.TargetManager.TargetManager.instance().models(MediaModel, { scoped: true })) {
            this.removeEventListeners(model);
        }
    }
    modelAdded(model) {
        if (this.isShowing()) {
            this.addEventListeners(model);
        }
    }
    modelRemoved(model) {
        this.removeEventListeners(model);
    }
    addEventListeners(mediaModel) {
        mediaModel.ensureEnabled();
        mediaModel.addEventListener("PlayerPropertiesChanged" /* Events.PlayerPropertiesChanged */, this.propertiesChanged, this);
        mediaModel.addEventListener("PlayerEventsAdded" /* Events.PlayerEventsAdded */, this.eventsAdded, this);
        mediaModel.addEventListener("PlayerMessagesLogged" /* Events.PlayerMessagesLogged */, this.messagesLogged, this);
        mediaModel.addEventListener("PlayerErrorsRaised" /* Events.PlayerErrorsRaised */, this.errorsRaised, this);
        mediaModel.addEventListener("PlayersCreated" /* Events.PlayersCreated */, this.playersCreated, this);
    }
    removeEventListeners(mediaModel) {
        mediaModel.removeEventListener("PlayerPropertiesChanged" /* Events.PlayerPropertiesChanged */, this.propertiesChanged, this);
        mediaModel.removeEventListener("PlayerEventsAdded" /* Events.PlayerEventsAdded */, this.eventsAdded, this);
        mediaModel.removeEventListener("PlayerMessagesLogged" /* Events.PlayerMessagesLogged */, this.messagesLogged, this);
        mediaModel.removeEventListener("PlayerErrorsRaised" /* Events.PlayerErrorsRaised */, this.errorsRaised, this);
        mediaModel.removeEventListener("PlayersCreated" /* Events.PlayersCreated */, this.playersCreated, this);
    }
    onPlayerCreated(playerID) {
        this.sidebar.addMediaElementItem(playerID);
        this.detailPanels.set(playerID, new PlayerDetailView());
        this.downloadStore.addPlayer(playerID);
    }
    propertiesChanged(event) {
        for (const property of event.data.properties) {
            this.onProperty(event.data.playerId, property);
        }
    }
    eventsAdded(event) {
        for (const ev of event.data.events) {
            // TODO(crbug.com/1228674): The conversion from Protocol.Media.PlayerEvent to PlayerEvent happens implicitly
            // by augmenting the protocol type with some additional property in various places. This needs to be cleaned up
            // in a conversion function that takes the protocol type and produces the PlayerEvent type.
            this.onEvent(event.data.playerId, ev);
        }
    }
    messagesLogged(event) {
        for (const message of event.data.messages) {
            this.onMessage(event.data.playerId, message);
        }
    }
    errorsRaised(event) {
        for (const error of event.data.errors) {
            this.onError(event.data.playerId, error);
        }
    }
    shouldPropagate(playerID) {
        return !this.deletedPlayers.has(playerID) && this.detailPanels.has(playerID);
    }
    onProperty(playerID, property) {
        if (!this.shouldPropagate(playerID)) {
            return;
        }
        this.sidebar.onProperty(playerID, property);
        this.downloadStore.onProperty(playerID, property);
        this.detailPanels.get(playerID)?.onProperty(property);
    }
    onError(playerID, error) {
        if (!this.shouldPropagate(playerID)) {
            return;
        }
        this.sidebar.onError(playerID, error);
        this.downloadStore.onError(playerID, error);
        this.detailPanels.get(playerID)?.onError(error);
    }
    onMessage(playerID, message) {
        if (!this.shouldPropagate(playerID)) {
            return;
        }
        this.sidebar.onMessage(playerID, message);
        this.downloadStore.onMessage(playerID, message);
        this.detailPanels.get(playerID)?.onMessage(message);
    }
    onEvent(playerID, event) {
        if (!this.shouldPropagate(playerID)) {
            return;
        }
        this.sidebar.onEvent(playerID, event);
        this.downloadStore.onEvent(playerID, event);
        this.detailPanels.get(playerID)?.onEvent(event);
    }
    playersCreated(event) {
        for (const playerID of event.data) {
            this.onPlayerCreated(playerID);
        }
    }
    markPlayerForDeletion(playerID) {
        // TODO(tmathmeyer): send this to chromium to save the storage space there too.
        this.deletedPlayers.add(playerID);
        this.detailPanels.delete(playerID);
        this.sidebar.deletePlayer(playerID);
        this.downloadStore.deletePlayer(playerID);
    }
    markOtherPlayersForDeletion(playerID) {
        for (const keyID of this.detailPanels.keys()) {
            if (keyID !== playerID) {
                this.markPlayerForDeletion(keyID);
            }
        }
    }
    exportPlayerData(playerID) {
        const dump = this.downloadStore.exportPlayerData(playerID);
        const uriContent = 'data:application/octet-stream,' + encodeURIComponent(JSON.stringify(dump, null, 2));
        const anchor = document.createElement('a');
        anchor.href = uriContent;
        anchor.download = playerID + '.json';
        anchor.click();
    }
}
//# sourceMappingURL=MainView.js.map