// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2009 Apple Inc.  All rights reserved.
 * Copyright (C) 2009 Joseph Pecoraro
 * Copyright (C) 2010 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1.  Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 * 2.  Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in the
 *     documentation and/or other materials provided with the distribution.
 * 3.  Neither the name of Apple Computer, Inc. ("Apple") nor the names of
 *     its contributors may be used to endorse or promote products derived
 *     from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE AND ITS CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL APPLE OR ITS CONTRIBUTORS BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as Platform from '../../../../core/platform/platform.js';
import * as Root from '../../../../core/root/root.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as IssuesManager from '../../../../models/issues_manager/issues_manager.js';
import * as NetworkForward from '../../../../panels/network/forward/forward.js';
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
import * as DataGrid from '../data_grid/data_grid.js';
import cookiesTableStyles from './cookiesTable.css.js';
const UIStrings = {
    /**
     *@description Cookie table cookies table expires session value in Cookies Table of the Cookies table in the Application panel
     */
    session: 'Session',
    /**
     *@description Text for the name of something
     */
    name: 'Name',
    /**
     *@description Text for the value of something
     */
    value: 'Value',
    /**
     *@description Text for the size of something
     */
    size: 'Size',
    /**
     *@description Data grid name for Editable Cookies data grid
     */
    editableCookies: 'Editable Cookies',
    /**
     *@description Text for web cookies
     */
    cookies: 'Cookies',
    /**
     *@description Text for something not available
     */
    na: 'N/A',
    /**
     *@description Text for Context Menu entry
     */
    showRequestsWithThisCookie: 'Show Requests With This Cookie',
    /**
     *@description Text for Context Menu entry
     */
    showIssueAssociatedWithThis: 'Show issue associated with this cookie',
    /**
     *@description Tooltip for the cell that shows the sourcePort property of a cookie in the cookie table. The source port is numberic attribute of a cookie.
     */
    sourcePortTooltip: 'Shows the source port (range 1-65535) the cookie was set on. If the port is unknown, this shows -1.',
    /**
     *@description Tooltip for the cell that shows the sourceScheme property of a cookie in the cookie table. The source scheme is a trinary attribute of a cookie.
     */
    sourceSchemeTooltip: 'Shows the source scheme (`Secure`, `NonSecure`) the cookie was set on. If the scheme is unknown, this shows `Unset`.',
    /**
     * @description Text for the date column displayed if the expiration time of the cookie is extremely far out in the future.
     * @example {+275760-09-13T00:00:00.000Z} date
     */
    timeAfter: 'after {date}',
    /**
     * @description Tooltip for the date column displayed if the expiration time of the cookie is extremely far out in the future.
     * @example {+275760-09-13T00:00:00.000Z} date
     * @example {9001628746521180} seconds
     */
    timeAfterTooltip: 'The expiration timestamp is {seconds}, which corresponds to a date after {date}',
    /**
     * @description Text to be show in the Partition Key column in case it is an opaque origin.
     */
    opaquePartitionKey: '(opaque)',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/cookie_table/CookiesTable.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const i18nLazyString = i18n.i18n.getLazilyComputedLocalizedString.bind(undefined, str_);
const expiresSessionValue = i18nLazyString(UIStrings.session);
export class CookiesTable extends UI.Widget.VBox {
    saveCallback;
    refreshCallback;
    deleteCallback;
    dataGrid;
    lastEditedColumnId;
    data;
    cookieDomain;
    cookieToBlockedReasons;
    cookieToExemptionReason;
    constructor(renderInline, saveCallback, refreshCallback, selectedCallback, deleteCallback) {
        super();
        this.element.classList.add('cookies-table');
        this.saveCallback = saveCallback;
        this.refreshCallback = refreshCallback;
        this.deleteCallback = deleteCallback;
        const editable = Boolean(saveCallback);
        const columns = [
            {
                id: "name" /* SDK.Cookie.Attribute.Name */,
                title: i18nString(UIStrings.name),
                sortable: true,
                disclosure: editable,
                sort: DataGrid.DataGrid.Order.Ascending,
                longText: true,
                weight: 24,
                editable: editable,
            },
            {
                id: "value" /* SDK.Cookie.Attribute.Value */,
                title: i18nString(UIStrings.value),
                sortable: true,
                longText: true,
                weight: 34,
                editable: editable,
            },
            {
                id: "domain" /* SDK.Cookie.Attribute.Domain */,
                title: 'Domain',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: "path" /* SDK.Cookie.Attribute.Path */,
                title: 'Path',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: "expires" /* SDK.Cookie.Attribute.Expires */,
                title: 'Expires / Max-Age',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: "size" /* SDK.Cookie.Attribute.Size */,
                title: i18nString(UIStrings.size),
                sortable: true,
                align: "right" /* DataGrid.DataGrid.Align.Right */,
                weight: 7,
            },
            {
                id: "http-only" /* SDK.Cookie.Attribute.HttpOnly */,
                title: 'HttpOnly',
                sortable: true,
                align: "center" /* DataGrid.DataGrid.Align.Center */,
                weight: 7,
                dataType: "Boolean" /* DataGrid.DataGrid.DataType.Boolean */,
                editable,
            },
            {
                id: "secure" /* SDK.Cookie.Attribute.Secure */,
                title: 'Secure',
                sortable: true,
                align: "center" /* DataGrid.DataGrid.Align.Center */,
                weight: 7,
                dataType: "Boolean" /* DataGrid.DataGrid.DataType.Boolean */,
                editable,
            },
            {
                id: "same-site" /* SDK.Cookie.Attribute.SameSite */,
                title: 'SameSite',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: "partition-key-site" /* SDK.Cookie.Attribute.PartitionKeySite */,
                title: 'Partition Key Site',
                sortable: true,
                weight: 7,
                editable: editable,
            },
            {
                id: "has-cross-site-ancestor" /* SDK.Cookie.Attribute.HasCrossSiteAncestor */,
                title: 'Cross Site',
                sortable: true,
                align: "center" /* DataGrid.DataGrid.Align.Center */,
                weight: 7,
                dataType: "Boolean" /* DataGrid.DataGrid.DataType.Boolean */,
                editable,
            },
            {
                id: "priority" /* SDK.Cookie.Attribute.Priority */,
                title: 'Priority',
                sortable: true,
                weight: 7,
                editable: editable,
            },
        ];
        if (Root.Runtime.experiments.isEnabled('experimental-cookie-features')) {
            const additionalColumns = [
                {
                    id: "source-scheme" /* SDK.Cookie.Attribute.SourceScheme */,
                    title: 'SourceScheme',
                    sortable: true,
                    align: "center" /* DataGrid.DataGrid.Align.Center */,
                    weight: 7,
                    editable: editable,
                },
                {
                    id: "source-port" /* SDK.Cookie.Attribute.SourcePort */,
                    title: 'SourcePort',
                    sortable: true,
                    align: "center" /* DataGrid.DataGrid.Align.Center */,
                    weight: 7,
                    editable: editable,
                },
            ];
            columns.push(...additionalColumns);
        }
        if (editable) {
            this.dataGrid = new DataGrid.DataGrid.DataGridImpl({
                displayName: i18nString(UIStrings.editableCookies),
                columns,
                editCallback: this.onUpdateCookie.bind(this),
                deleteCallback: this.onDeleteCookie.bind(this),
                refreshCallback,
            });
        }
        else {
            this.dataGrid = new DataGrid.DataGrid.DataGridImpl({
                displayName: i18nString(UIStrings.cookies),
                columns,
                editCallback: undefined,
                deleteCallback: undefined,
                refreshCallback: undefined,
            });
        }
        this.dataGrid.setStriped(true);
        this.dataGrid.setName('cookies-table');
        this.dataGrid.addEventListener("SortingChanged" /* DataGrid.DataGrid.Events.SortingChanged */, this.rebuildTable, this);
        this.dataGrid.setRowContextMenuCallback(this.populateContextMenu.bind(this));
        if (renderInline) {
            this.dataGrid.renderInline();
        }
        if (selectedCallback) {
            this.dataGrid.addEventListener("SelectedNode" /* DataGrid.DataGrid.Events.SelectedNode */, selectedCallback, this);
        }
        this.lastEditedColumnId = null;
        this.dataGrid.asWidget().show(this.element);
        this.data = [];
        this.cookieDomain = '';
        this.cookieToBlockedReasons = null;
        this.cookieToExemptionReason = null;
    }
    wasShown() {
        this.registerCSSFiles([cookiesTableStyles]);
    }
    setCookies(cookies, cookieToBlockedReasons, cookieToExemptionReason) {
        this.setCookieFolders([{ cookies: cookies, folderName: null }], cookieToBlockedReasons, cookieToExemptionReason);
    }
    setCookieFolders(cookieFolders, cookieToBlockedReasons, cookieToExemptionReason) {
        this.data = cookieFolders;
        this.cookieToBlockedReasons = cookieToBlockedReasons || null;
        this.cookieToExemptionReason = cookieToExemptionReason || null;
        this.rebuildTable();
    }
    setCookieDomain(cookieDomain) {
        this.cookieDomain = cookieDomain;
    }
    selectedCookie() {
        const node = this.dataGrid.selectedNode;
        return node ? node.cookie : null;
    }
    getSelectionCookies() {
        const node = this.dataGrid.selectedNode;
        const nextNeighbor = node && node.traverseNextNode(true);
        const previousNeighbor = node && node.traversePreviousNode(true);
        return {
            current: node && node.cookie,
            neighbor: (nextNeighbor && nextNeighbor.cookie) || (previousNeighbor && previousNeighbor.cookie),
        };
    }
    willHide() {
        this.lastEditedColumnId = null;
    }
    findSelectedCookie(selectionCookies, cookies) {
        if (!cookies) {
            return null;
        }
        const current = selectionCookies.current;
        const foundCurrent = cookies.find(cookie => this.isSameCookie(cookie, current));
        if (foundCurrent) {
            return foundCurrent;
        }
        const neighbor = selectionCookies.neighbor;
        const foundNeighbor = cookies.find(cookie => this.isSameCookie(cookie, neighbor));
        if (foundNeighbor) {
            return foundNeighbor;
        }
        return null;
    }
    isSameCookie(cookieA, cookieB) {
        return cookieB !== null && cookieB !== undefined && cookieB.name() === cookieA.name() &&
            cookieB.domain() === cookieA.domain() && cookieB.path() === cookieA.path();
    }
    rebuildTable() {
        const restoreFocus = this.dataGrid.element?.contains(document.activeElement);
        const selectionCookies = this.getSelectionCookies();
        const lastEditedColumnId = this.lastEditedColumnId;
        this.lastEditedColumnId = null;
        this.dataGrid.rootNode().removeChildren();
        for (let i = 0; i < this.data.length; ++i) {
            const item = this.data[i];
            const selectedCookie = this.findSelectedCookie(selectionCookies, item.cookies);
            if (item.folderName) {
                const groupData = {};
                groupData["name" /* SDK.Cookie.Attribute.Name */] = item.folderName;
                groupData["value" /* SDK.Cookie.Attribute.Value */] = '';
                groupData["size" /* SDK.Cookie.Attribute.Size */] = this.totalSize(item.cookies);
                groupData["domain" /* SDK.Cookie.Attribute.Domain */] = '';
                groupData["path" /* SDK.Cookie.Attribute.Path */] = '';
                groupData["expires" /* SDK.Cookie.Attribute.Expires */] = '';
                groupData["http-only" /* SDK.Cookie.Attribute.HttpOnly */] = '';
                groupData["secure" /* SDK.Cookie.Attribute.Secure */] = '';
                groupData["same-site" /* SDK.Cookie.Attribute.SameSite */] = '';
                groupData["source-port" /* SDK.Cookie.Attribute.SourcePort */] = '';
                groupData["source-scheme" /* SDK.Cookie.Attribute.SourceScheme */] = '';
                groupData["priority" /* SDK.Cookie.Attribute.Priority */] = '';
                const groupNode = new DataGrid.DataGrid.DataGridNode(groupData);
                groupNode.selectable = true;
                this.dataGrid.rootNode().appendChild(groupNode);
                groupNode.element().classList.add('row-group');
                this.populateNode(groupNode, item.cookies, selectedCookie, lastEditedColumnId);
                groupNode.expand();
            }
            else {
                this.populateNode(this.dataGrid.rootNode(), item.cookies, selectedCookie, lastEditedColumnId);
            }
        }
        if (selectionCookies.current && lastEditedColumnId && !this.dataGrid.selectedNode) {
            this.addInactiveNode(this.dataGrid.rootNode(), selectionCookies.current, lastEditedColumnId);
        }
        if (this.saveCallback) {
            this.dataGrid.addCreationNode(false);
        }
        if (restoreFocus) {
            this.dataGrid.element.focus();
        }
    }
    populateNode(parentNode, cookies, selectedCookie, lastEditedColumnId) {
        parentNode.removeChildren();
        if (!cookies) {
            return;
        }
        this.sortCookies(cookies);
        for (let i = 0; i < cookies.length; ++i) {
            const cookie = cookies[i];
            const cookieNode = this.createGridNode(cookie);
            parentNode.appendChild(cookieNode);
            if (this.isSameCookie(cookie, selectedCookie)) {
                cookieNode.select();
                if (lastEditedColumnId !== null) {
                    this.dataGrid.startEditingNextEditableColumnOfDataGridNode(cookieNode, lastEditedColumnId);
                }
            }
        }
    }
    addInactiveNode(parentNode, cookie, editedColumnId) {
        const cookieNode = this.createGridNode(cookie);
        parentNode.appendChild(cookieNode);
        cookieNode.select();
        cookieNode.setInactive(true);
        if (editedColumnId !== null) {
            this.dataGrid.startEditingNextEditableColumnOfDataGridNode(cookieNode, editedColumnId);
        }
    }
    totalSize(cookies) {
        let totalSize = 0;
        for (let i = 0; cookies && i < cookies.length; ++i) {
            totalSize += cookies[i].size();
        }
        return totalSize;
    }
    sortCookies(cookies) {
        const sortDirection = this.dataGrid.isSortOrderAscending() ? 1 : -1;
        function getValue(cookie, property) {
            switch (property) {
                case "name" /* SDK.Cookie.Attribute.Name */:
                    return String(cookie.name());
                case "value" /* SDK.Cookie.Attribute.Value */:
                    return String(cookie.value());
                case "domain" /* SDK.Cookie.Attribute.Domain */:
                    return String(cookie.domain());
                case "path" /* SDK.Cookie.Attribute.Path */:
                    return String(cookie.path());
                case "http-only" /* SDK.Cookie.Attribute.HttpOnly */:
                    return String(cookie.httpOnly());
                case "secure" /* SDK.Cookie.Attribute.Secure */:
                    return String(cookie.secure());
                case "same-site" /* SDK.Cookie.Attribute.SameSite */:
                    return String(cookie.sameSite());
                case "partition-key-site" /* SDK.Cookie.Attribute.PartitionKeySite */:
                    return cookie.partitionKeyOpaque() ? i18nString(UIStrings.opaquePartitionKey) : String(cookie.topLevelSite());
                case "has-cross-site-ancestor" /* SDK.Cookie.Attribute.HasCrossSiteAncestor */:
                    return String(cookie.partitioned() ? cookie.hasCrossSiteAncestor() : false);
                case "source-scheme" /* SDK.Cookie.Attribute.SourceScheme */:
                    return String(cookie.sourceScheme());
                default:
                    return String(cookie.name());
            }
        }
        function compareTo(property, cookie1, cookie2) {
            return sortDirection * Platform.StringUtilities.compare(getValue(cookie1, property), getValue(cookie2, property));
        }
        function numberCompare(p, cookie1, cookie2) {
            return sortDirection * (p(cookie1) - p(cookie2));
        }
        function priorityCompare(cookie1, cookie2) {
            const priorities = [
                "Low" /* Protocol.Network.CookiePriority.Low */,
                "Medium" /* Protocol.Network.CookiePriority.Medium */,
                "High" /* Protocol.Network.CookiePriority.High */,
            ];
            const priority1 = priorities.indexOf(cookie1.priority());
            const priority2 = priorities.indexOf(cookie2.priority());
            return sortDirection * (priority1 - priority2);
        }
        function expiresCompare(cookie1, cookie2) {
            if (cookie1.session() !== cookie2.session()) {
                return sortDirection * (cookie1.session() ? 1 : -1);
            }
            if (cookie1.session()) {
                return 0;
            }
            if (cookie1.maxAge() && cookie2.maxAge()) {
                return sortDirection * (cookie1.maxAge() - cookie2.maxAge());
            }
            if (cookie1.expires() && cookie2.expires()) {
                return sortDirection * (cookie1.expires() - cookie2.expires());
            }
            return sortDirection * (cookie1.expires() ? 1 : -1);
        }
        let comparator;
        const columnId = this.dataGrid.sortColumnId() || "name" /* SDK.Cookie.Attribute.Name */;
        if (columnId === "expires" /* SDK.Cookie.Attribute.Expires */) {
            comparator = expiresCompare;
        }
        else if (columnId === "size" /* SDK.Cookie.Attribute.Size */) {
            comparator = numberCompare.bind(null, c => c.size());
        }
        else if (columnId === "source-port" /* SDK.Cookie.Attribute.SourcePort */) {
            comparator = numberCompare.bind(null, c => c.sourcePort());
        }
        else if (columnId === "priority" /* SDK.Cookie.Attribute.Priority */) {
            comparator = priorityCompare;
        }
        else {
            comparator = compareTo.bind(null, columnId);
        }
        cookies.sort(comparator);
    }
    createGridNode(cookie) {
        const data = {};
        data["name" /* SDK.Cookie.Attribute.Name */] = cookie.name();
        data["value" /* SDK.Cookie.Attribute.Value */] = cookie.value();
        if (cookie.type() === 0 /* SDK.Cookie.Type.Request */) {
            data["domain" /* SDK.Cookie.Attribute.Domain */] = cookie.domain() ? cookie.domain() : i18nString(UIStrings.na);
            data["path" /* SDK.Cookie.Attribute.Path */] = cookie.path() ? cookie.path() : i18nString(UIStrings.na);
        }
        else {
            data["domain" /* SDK.Cookie.Attribute.Domain */] = cookie.domain() || '';
            data["path" /* SDK.Cookie.Attribute.Path */] = cookie.path() || '';
        }
        let expiresTooltip = undefined;
        if (cookie.maxAge()) {
            data["expires" /* SDK.Cookie.Attribute.Expires */] = i18n.TimeUtilities.secondsToString(Math.floor(cookie.maxAge()));
        }
        else if (cookie.expires()) {
            const expires = cookie.expires();
            if (expires < 0) {
                data["expires" /* SDK.Cookie.Attribute.Expires */] = expiresSessionValue();
            }
            else {
                // See https://tc39.es/ecma262/#sec-time-values-and-time-range
                const maxTimestamp = 8640000000000000;
                if (expires > maxTimestamp) {
                    const date = new Date(maxTimestamp).toISOString();
                    data["expires" /* SDK.Cookie.Attribute.Expires */] = i18nString(UIStrings.timeAfter, { date });
                    expiresTooltip = i18nString(UIStrings.timeAfterTooltip, { seconds: expires, date });
                }
                else {
                    data["expires" /* SDK.Cookie.Attribute.Expires */] = new Date(expires).toISOString();
                }
            }
        }
        else {
            data["expires" /* SDK.Cookie.Attribute.Expires */] =
                cookie.type() === 0 /* SDK.Cookie.Type.Request */ ? i18nString(UIStrings.na) : expiresSessionValue();
        }
        data["size" /* SDK.Cookie.Attribute.Size */] = cookie.size();
        data["http-only" /* SDK.Cookie.Attribute.HttpOnly */] = cookie.httpOnly();
        data["secure" /* SDK.Cookie.Attribute.Secure */] = cookie.secure();
        data["same-site" /* SDK.Cookie.Attribute.SameSite */] = cookie.sameSite() || '';
        data["source-port" /* SDK.Cookie.Attribute.SourcePort */] = cookie.sourcePort();
        data["source-scheme" /* SDK.Cookie.Attribute.SourceScheme */] = cookie.sourceScheme();
        data["priority" /* SDK.Cookie.Attribute.Priority */] = cookie.priority() || '';
        data["partition-key-site" /* SDK.Cookie.Attribute.PartitionKeySite */] = cookie.topLevelSite();
        data["has-cross-site-ancestor" /* SDK.Cookie.Attribute.HasCrossSiteAncestor */] = cookie.hasCrossSiteAncestor() ? 'true' : '';
        const blockedReasons = this.cookieToBlockedReasons?.get(cookie);
        const exemptionReason = this.cookieToExemptionReason?.get(cookie);
        const node = new DataGridNode(data, cookie, blockedReasons || null, exemptionReason || null);
        if (expiresTooltip) {
            node.setExpiresTooltip(expiresTooltip);
        }
        node.selectable = true;
        return node;
    }
    onDeleteCookie(node) {
        if (node.cookie && this.deleteCallback) {
            this.deleteCallback(node.cookie, () => this.refresh());
        }
    }
    onUpdateCookie(editingNode, columnIdentifier, _oldText, _newText) {
        this.lastEditedColumnId = columnIdentifier;
        this.setDefaults(editingNode);
        if (this.isValidCookieData(editingNode.data)) {
            this.saveNode(editingNode);
        }
        else {
            editingNode.setDirty(true);
        }
    }
    setDefaults(node) {
        if (node.data["name" /* SDK.Cookie.Attribute.Name */] === null) {
            node.data["name" /* SDK.Cookie.Attribute.Name */] = '';
        }
        if (node.data["value" /* SDK.Cookie.Attribute.Value */] === null) {
            node.data["value" /* SDK.Cookie.Attribute.Value */] = '';
        }
        if (node.data["domain" /* SDK.Cookie.Attribute.Domain */] === null) {
            node.data["domain" /* SDK.Cookie.Attribute.Domain */] = this.cookieDomain;
        }
        if (node.data["path" /* SDK.Cookie.Attribute.Path */] === null) {
            node.data["path" /* SDK.Cookie.Attribute.Path */] = '/';
        }
        if (node.data["expires" /* SDK.Cookie.Attribute.Expires */] === null) {
            node.data["expires" /* SDK.Cookie.Attribute.Expires */] = expiresSessionValue();
        }
        if (node.data["partition-key" /* SDK.Cookie.Attribute.PartitionKey */] === null) {
            node.data["partition-key" /* SDK.Cookie.Attribute.PartitionKey */] = '';
        }
    }
    saveNode(node) {
        const oldCookie = node.cookie;
        const newCookie = this.createCookieFromData(node.data);
        node.cookie = newCookie;
        if (!this.saveCallback) {
            return;
        }
        void this.saveCallback(newCookie, oldCookie).then(success => {
            if (success) {
                this.refresh();
            }
            else {
                node.setDirty(true);
            }
        });
    }
    createCookieFromData(data) {
        const cookie = new SDK.Cookie.Cookie(data["name" /* SDK.Cookie.Attribute.Name */], data["value" /* SDK.Cookie.Attribute.Value */], null, data["priority" /* SDK.Cookie.Attribute.Priority */]);
        cookie.addAttribute("domain" /* SDK.Cookie.Attribute.Domain */, data["domain" /* SDK.Cookie.Attribute.Domain */]);
        cookie.addAttribute("path" /* SDK.Cookie.Attribute.Path */, data["path" /* SDK.Cookie.Attribute.Path */]);
        if (data.expires && data.expires !== expiresSessionValue()) {
            cookie.addAttribute("expires" /* SDK.Cookie.Attribute.Expires */, (new Date(data["expires" /* SDK.Cookie.Attribute.Expires */])).toUTCString());
        }
        if (data["http-only" /* SDK.Cookie.Attribute.HttpOnly */]) {
            cookie.addAttribute("http-only" /* SDK.Cookie.Attribute.HttpOnly */);
        }
        if (data["secure" /* SDK.Cookie.Attribute.Secure */]) {
            cookie.addAttribute("secure" /* SDK.Cookie.Attribute.Secure */);
        }
        if (data["same-site" /* SDK.Cookie.Attribute.SameSite */]) {
            cookie.addAttribute("same-site" /* SDK.Cookie.Attribute.SameSite */, data["same-site" /* SDK.Cookie.Attribute.SameSite */]);
        }
        if ("source-scheme" /* SDK.Cookie.Attribute.SourceScheme */ in data) {
            cookie.addAttribute("source-scheme" /* SDK.Cookie.Attribute.SourceScheme */, data["source-scheme" /* SDK.Cookie.Attribute.SourceScheme */]);
        }
        if ("source-port" /* SDK.Cookie.Attribute.SourcePort */ in data) {
            cookie.addAttribute("source-port" /* SDK.Cookie.Attribute.SourcePort */, Number.parseInt(data["source-port" /* SDK.Cookie.Attribute.SourcePort */], 10) || undefined);
        }
        if (data["partition-key-site" /* SDK.Cookie.Attribute.PartitionKeySite */]) {
            cookie.setPartitionKey(data["partition-key-site" /* SDK.Cookie.Attribute.PartitionKeySite */], Boolean(data["has-cross-site-ancestor" /* SDK.Cookie.Attribute.HasCrossSiteAncestor */] ? data["has-cross-site-ancestor" /* SDK.Cookie.Attribute.HasCrossSiteAncestor */] :
                false));
        }
        cookie.setSize(data["name" /* SDK.Cookie.Attribute.Name */].length + data["value" /* SDK.Cookie.Attribute.Value */].length);
        return cookie;
    }
    isValidCookieData(data) {
        return (Boolean(data.name) || Boolean(data.value)) && this.isValidDomain(data.domain) &&
            this.isValidPath(data.path) && this.isValidDate(data.expires) &&
            this.isValidPartitionKey(data.PartitionKeySite);
    }
    isValidDomain(domain) {
        if (!domain) {
            return true;
        }
        const parsedURL = Common.ParsedURL.ParsedURL.fromString('http://' + domain);
        return parsedURL !== null && parsedURL.domain() === domain;
    }
    isValidPath(path) {
        const parsedURL = Common.ParsedURL.ParsedURL.fromString('http://example.com' + path);
        return parsedURL !== null && parsedURL.path === path;
    }
    isValidDate(date) {
        return date === '' || date === expiresSessionValue() || !isNaN(Date.parse(date));
    }
    isValidPartitionKey(partitionKey) {
        if (!partitionKey) {
            return true;
        }
        const parsedURL = Common.ParsedURL.ParsedURL.fromString(partitionKey);
        return parsedURL !== null;
    }
    refresh() {
        if (this.refreshCallback) {
            this.refreshCallback();
        }
    }
    populateContextMenu(contextMenu, gridNode) {
        const maybeCookie = gridNode.cookie;
        if (!maybeCookie) {
            return;
        }
        const cookie = maybeCookie;
        contextMenu.revealSection().appendItem(i18nString(UIStrings.showRequestsWithThisCookie), () => {
            const requestFilter = NetworkForward.UIFilter.UIRequestFilter.filters([
                {
                    filterType: NetworkForward.UIFilter.FilterType.CookieDomain,
                    filterValue: cookie.domain(),
                },
                {
                    filterType: NetworkForward.UIFilter.FilterType.CookieName,
                    filterValue: cookie.name(),
                },
            ]);
            void Common.Revealer.reveal(requestFilter);
        }, { jslogContext: 'show-requests-with-this-cookie' });
        if (IssuesManager.RelatedIssue.hasIssues(cookie)) {
            contextMenu.revealSection().appendItem(i18nString(UIStrings.showIssueAssociatedWithThis), () => {
                // TODO(chromium:1077719): Just filter for the cookie instead of revealing one of the associated issues.
                void IssuesManager.RelatedIssue.reveal(cookie);
            }, { jslogContext: 'show-issue-associated-with-this' });
        }
    }
}
export class DataGridNode extends DataGrid.DataGrid.DataGridNode {
    cookie;
    blockedReasons;
    exemptionReason;
    expiresTooltip;
    constructor(data, cookie, blockedReasons, exemptionReason) {
        super(data);
        this.cookie = cookie;
        this.blockedReasons = blockedReasons;
        this.exemptionReason = exemptionReason;
    }
    createCells(element) {
        super.createCells(element);
        if (this.blockedReasons && this.blockedReasons.length) {
            element.classList.add('flagged-cookie-attribute-row');
        }
    }
    setExpiresTooltip(tooltip) {
        this.expiresTooltip = tooltip;
    }
    createCell(columnId) {
        const cell = super.createCell(columnId);
        if (columnId === "source-port" /* SDK.Cookie.Attribute.SourcePort */) {
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.sourcePortTooltip));
        }
        else if (columnId === "source-scheme" /* SDK.Cookie.Attribute.SourceScheme */) {
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.sourceSchemeTooltip));
        }
        else if (columnId === "expires" /* SDK.Cookie.Attribute.Expires */ && this.expiresTooltip) {
            UI.Tooltip.Tooltip.install(cell, this.expiresTooltip);
        }
        else {
            UI.Tooltip.Tooltip.install(cell, cell.textContent || '');
        }
        let blockedReasonString = '';
        if (this.blockedReasons) {
            for (const blockedReason of this.blockedReasons) {
                const attributeMatches = blockedReason.attribute === columnId;
                const useNameColumn = !blockedReason.attribute && columnId === "name" /* SDK.Cookie.Attribute.Name */;
                if (attributeMatches || useNameColumn) {
                    if (blockedReasonString) {
                        blockedReasonString += '\n';
                    }
                    blockedReasonString += blockedReason.uiString;
                }
            }
        }
        if (blockedReasonString) {
            const infoElement = new IconButton.Icon.Icon();
            if (columnId === "name" /* SDK.Cookie.Attribute.Name */ &&
                IssuesManager.RelatedIssue.hasThirdPartyPhaseoutCookieIssue(this.cookie)) {
                infoElement.data = { iconName: 'warning-filled', color: 'var(--icon-warning)', width: '14px', height: '14px' };
                infoElement.onclick = () => IssuesManager.RelatedIssue.reveal(this.cookie);
                infoElement.style.cursor = 'pointer';
            }
            else {
                infoElement.data = { iconName: 'info', color: 'var(--icon-info)', width: '14px', height: '14px' };
                cell.classList.add('flagged-cookie-attribute-cell');
            }
            infoElement.title = blockedReasonString;
            cell.insertBefore(infoElement, cell.firstChild);
        }
        if (this.exemptionReason?.uiString && columnId === "name" /* SDK.Cookie.Attribute.Name */) {
            const infoElement = new IconButton.Icon.Icon();
            infoElement.data = { iconName: 'info', color: 'var(--icon-info)', width: '14px', height: '14px' };
            cell.classList.add('flagged-cookie-attribute-cell');
            infoElement.title = this.exemptionReason.uiString;
            cell.insertBefore(infoElement, cell.firstChild);
        }
        return cell;
    }
}
//# sourceMappingURL=CookiesTable.js.map