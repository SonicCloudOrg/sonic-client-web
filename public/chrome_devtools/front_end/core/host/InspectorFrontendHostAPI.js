// Copyright (c) 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export var Events;
(function (Events) {
    Events["AppendedToURL"] = "appendedToURL";
    Events["CanceledSaveURL"] = "canceledSaveURL";
    Events["ColorThemeChanged"] = "colorThemeChanged";
    Events["ContextMenuCleared"] = "contextMenuCleared";
    Events["ContextMenuItemSelected"] = "contextMenuItemSelected";
    Events["DeviceCountUpdated"] = "deviceCountUpdated";
    Events["DevicesDiscoveryConfigChanged"] = "devicesDiscoveryConfigChanged";
    Events["DevicesPortForwardingStatusChanged"] = "devicesPortForwardingStatusChanged";
    Events["DevicesUpdated"] = "devicesUpdated";
    Events["DispatchMessage"] = "dispatchMessage";
    Events["DispatchMessageChunk"] = "dispatchMessageChunk";
    Events["EnterInspectElementMode"] = "enterInspectElementMode";
    Events["EyeDropperPickedColor"] = "eyeDropperPickedColor";
    Events["FileSystemsLoaded"] = "fileSystemsLoaded";
    Events["FileSystemRemoved"] = "fileSystemRemoved";
    Events["FileSystemAdded"] = "fileSystemAdded";
    Events["FileSystemFilesChangedAddedRemoved"] = "FileSystemFilesChangedAddedRemoved";
    Events["IndexingTotalWorkCalculated"] = "indexingTotalWorkCalculated";
    Events["IndexingWorked"] = "indexingWorked";
    Events["IndexingDone"] = "indexingDone";
    Events["KeyEventUnhandled"] = "keyEventUnhandled";
    Events["ReattachRootTarget"] = "reattachMainTarget";
    Events["ReloadInspectedPage"] = "reloadInspectedPage";
    Events["RevealSourceLine"] = "revealSourceLine";
    Events["SavedURL"] = "savedURL";
    Events["SearchCompleted"] = "searchCompleted";
    Events["SetInspectedTabId"] = "setInspectedTabId";
    Events["SetUseSoftMenu"] = "setUseSoftMenu";
    Events["ShowPanel"] = "showPanel";
})(Events || (Events = {}));
export const EventDescriptors = [
    [Events.AppendedToURL, 'appendedToURL', ['url']],
    [Events.CanceledSaveURL, 'canceledSaveURL', ['url']],
    [Events.ColorThemeChanged, 'colorThemeChanged', []],
    [Events.ContextMenuCleared, 'contextMenuCleared', []],
    [Events.ContextMenuItemSelected, 'contextMenuItemSelected', ['id']],
    [Events.DeviceCountUpdated, 'deviceCountUpdated', ['count']],
    [Events.DevicesDiscoveryConfigChanged, 'devicesDiscoveryConfigChanged', ['config']],
    [Events.DevicesPortForwardingStatusChanged, 'devicesPortForwardingStatusChanged', ['status']],
    [Events.DevicesUpdated, 'devicesUpdated', ['devices']],
    [Events.DispatchMessage, 'dispatchMessage', ['messageObject']],
    [Events.DispatchMessageChunk, 'dispatchMessageChunk', ['messageChunk', 'messageSize']],
    [Events.EnterInspectElementMode, 'enterInspectElementMode', []],
    [Events.EyeDropperPickedColor, 'eyeDropperPickedColor', ['color']],
    [Events.FileSystemsLoaded, 'fileSystemsLoaded', ['fileSystems']],
    [Events.FileSystemRemoved, 'fileSystemRemoved', ['fileSystemPath']],
    [Events.FileSystemAdded, 'fileSystemAdded', ['errorMessage', 'fileSystem']],
    [Events.FileSystemFilesChangedAddedRemoved, 'fileSystemFilesChangedAddedRemoved', ['changed', 'added', 'removed']],
    [Events.IndexingTotalWorkCalculated, 'indexingTotalWorkCalculated', ['requestId', 'fileSystemPath', 'totalWork']],
    [Events.IndexingWorked, 'indexingWorked', ['requestId', 'fileSystemPath', 'worked']],
    [Events.IndexingDone, 'indexingDone', ['requestId', 'fileSystemPath']],
    [Events.KeyEventUnhandled, 'keyEventUnhandled', ['event']],
    [Events.ReattachRootTarget, 'reattachMainTarget', []],
    [Events.ReloadInspectedPage, 'reloadInspectedPage', ['hard']],
    [Events.RevealSourceLine, 'revealSourceLine', ['url', 'lineNumber', 'columnNumber']],
    [Events.SavedURL, 'savedURL', ['url', 'fileSystemPath']],
    [Events.SearchCompleted, 'searchCompleted', ['requestId', 'fileSystemPath', 'files']],
    [Events.SetInspectedTabId, 'setInspectedTabId', ['tabId']],
    [Events.SetUseSoftMenu, 'setUseSoftMenu', ['useSoftMenu']],
    [Events.ShowPanel, 'showPanel', ['panelName']],
];
//# sourceMappingURL=InspectorFrontendHostAPI.js.map