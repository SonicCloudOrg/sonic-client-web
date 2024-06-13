// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2007, 2008 Apple Inc.  All rights reserved.
 * Copyright (C) 2008, 2009 Anthony Ricaud <rik@webkit.org>
 * Copyright (C) 2011 Google Inc. All rights reserved.
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
// TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
/* eslint-disable @typescript-eslint/naming-convention */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as Logs from '../../models/logs/logs.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as NetworkForward from '../../panels/network/forward/forward.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import { PanelUtils } from '../utils/utils.js';
const UIStrings = {
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    redirect: 'Redirect',
    /**
     *@description Content of the request method column in the network log view. Some requests require an additional request to check permissions, and this additional request is called 'Preflight Request', see https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request. In the request method column we use, for example, 'POST + Preflight' to indicate that the request method was 'POST' and the request was accompanied by a preflight request. Since the column is short, the translation for Preflight in this context should ideally also be short.
     *@example {GET} PH1
     */
    sPreflight: '{PH1} + Preflight',
    /**
     *@description Name of a network initiator type
     */
    preflight: 'Preflight',
    /**
     *@description Title for a link element in the network log view
     */
    selectPreflightRequest: 'Select preflight request',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    failed: '(failed)',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    data: '(data)',
    /**
     * @description Text in Network Data Grid Node of the Network panel. Indicates a network request has
     * been canceled.
     */
    canceled: '(canceled)',
    /**
     *@description Reason in Network Data Grid Node of the Network panel
     */
    other: 'other',
    /**
     *@description Reason in Network Data Grid Node of the Network panel
     */
    csp: 'csp',
    /**
     *@description Reason in Network Data Grid Node of the Network panel
     */
    origin: 'origin',
    /**
     *@description Reason in Network Data Grid Node of the Network panel
     */
    devtools: 'devtools',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     *@example {mixed-content} PH1
     */
    blockeds: '(blocked:{PH1})',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    blockedTooltip: 'This request was blocked due to misconfigured response headers, click to view the headers',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    corsError: 'CORS error',
    /**
     *@description Tooltip providing the cors error code
     *@example {PreflightDisallowedRedirect} PH1
     */
    crossoriginResourceSharingErrorS: 'Cross-Origin Resource Sharing error: {PH1}',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    finished: 'Finished',
    /**
     * @description Status text in the Network panel that indicates a network request is still loading
     * and has not finished yet (is pending).
     */
    pendingq: '(pending)',
    /**
     * @description Status text in the Network panel that indicates a network request state is not known.
     */
    unknown: '(unknown)',
    /**
     * @description Tooltip providing details on why the request has unknown status.
     */
    unknownExplanation: 'The request status cannot be shown here because the page that issued it unloaded while the request was in flight. You can use chrome://net-export to capture a network log and see all request details.',
    /**
     * @description Text in Network Data Grid Node of the Network panel. Noun, short for a 'HTTP server
     * push'.
     */
    push: 'Push / ',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    parser: 'Parser',
    /**
     *@description Label for a group of JavaScript files
     */
    script: 'Script',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     */
    preload: 'Preload',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     */
    earlyHints: 'early-hints',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    signedexchange: 'signed-exchange',
    /**
     *@description Title for a link element in the network log view
     */
    selectTheRequestThatTriggered: 'Select the request that triggered this preflight',
    /**
     *@description Text for other types of items
     */
    otherC: 'Other',
    /**
     *@description Text of a DOM element in Network Data Grid Node of the Network panel
     */
    memoryCache: '(memory cache)',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel. Indicates that the response came from memory cache.
     *@example {50 B} PH1
     */
    servedFromMemoryCacheResource: 'Served from memory cache, resource size: {PH1}',
    /**
     *@description Text of a DOM element in Network Data Grid Node of the Network panel
     */
    serviceWorker: '(`ServiceWorker`)',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {4 B} PH1
     */
    servedFromServiceWorkerResource: 'Served from `ServiceWorker`, resource size: {PH1}',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {4 B} PH1
     */
    servedFromSignedHttpExchange: 'Served from Signed HTTP Exchange, resource size: {PH1}',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel. Indicates that the response came from preloaded web bundle. See https://web.dev/web-bundles/
     *@example {4 B} PH1
     */
    servedFromWebBundle: 'Served from Web Bundle, resource size: {PH1}',
    /**
     *@description Text of a DOM element in Network Data Grid Node of the Network panel
     */
    prefetchCache: '(prefetch cache)',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {4 B} PH1
     */
    servedFromPrefetchCacheResource: 'Served from prefetch cache, resource size: {PH1}',
    /**
     *@description Text of a DOM element in Network Data Grid Node of the Network panel
     */
    diskCache: '(disk cache)',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {10 B} PH1
     */
    servedFromDiskCacheResourceSizeS: 'Served from disk cache, resource size: {PH1}',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {1} PH1
     *@example {4 B} PH2
     */
    matchedToServiceWorkerRouter: 'Matched to `ServiceWorker router`#{PH1}, resource size: {PH2}',
    /**
     *@description Cell title in Network Data Grid Node of the Network panel
     *@example {1} PH1
     *@example {4 B} PH2
     *@example {12 B} PH3
     */
    matchedToServiceWorkerRouterWithNetworkSource: 'Matched to `ServiceWorker router`#{PH1}, {PH2} transferred over network, resource size: {PH3}',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    pending: 'Pending',
    /**
     *@description Text describing the depth of a top level node in the network datagrid
     */
    level: 'level 1',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    webBundleError: 'Web Bundle error',
    /**
     *@description Alternative text for the web bundle inner request icon in Network Data Grid Node of the Network panel
     * Indicates that the response came from preloaded web bundle. See https://web.dev/web-bundles/
     */
    webBundleInnerRequest: 'Served from Web Bundle',
    /**
     *@description Text in Network Data Grid Node of the Network panel
     */
    webBundle: '(Web Bundle)',
    /**
     *@description Tooltip text for subtitles of Time cells in Network request rows. Latency is the time difference
     * between the time a response to a network request is received and the time the request is started.
     */
    timeSubtitleTooltipText: 'Latency (response received time - start time)',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    alternativeJobWonWithoutRace: '`Chrome` used a `HTTP/3` connection induced by an \'`Alt-Svc`\' header without racing against establishing a connection using a different `HTTP` version.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    alternativeJobWonRace: '`Chrome` used a `HTTP/3` connection induced by an \'`Alt-Svc`\' header because it won a race against establishing a connection using a different `HTTP` version.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    mainJobWonRace: '`Chrome` used this protocol because it won a race against establishing a `HTTP/3` connection.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    mappingMissing: '`Chrome` did not use an alternative `HTTP` version because no alternative protocol information was available when the request was issued, but an \'`Alt-Svc`\' header was present in the response.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    broken: '`Chrome` did not try to establish a `HTTP/3` connection because it was marked as broken.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    dnsAlpnH3JobWonWithoutRace: '`Chrome` used a `HTTP/3` connection due to the `DNS record` indicating `HTTP/3` support. There was no race against establishing a connection using a different `HTTP` version.',
    /**
     *@description Tooltip text giving the reason why a specific HTTP transport protocol has been used
     */
    dnsAlpnH3JobWonRace: '`Chrome` used a `HTTP/3` connection due to the `DNS record` indicating `HTTP/3` support, which won a race against establishing a connection using a different `HTTP` version.',
    /**
     *@description Tooltip to explain the resource's overridden status
     */
    requestContentHeadersOverridden: 'Both request content and headers are overridden',
    /**
     *@description Tooltip to explain the resource's overridden status
     */
    requestContentOverridden: 'Request content is overridden',
    /**
     *@description Tooltip to explain the resource's overridden status
     */
    requestHeadersOverridden: 'Request headers are overridden',
    /**
     *@description Tooltip to explain the resource's initial priority
     *@example {High} PH1
     *@example {Low} PH2
     */
    initialPriorityToolTip: '{PH1}, Initial priority: {PH2}',
    /**
     *@description Tooltip to explain why the request has warning icon
     */
    thirdPartyPhaseout: 'Cookies for this request are blocked due to third-party cookie phaseout. Learn more in the Issues tab.',
};
const str_ = i18n.i18n.registerUIStrings('panels/network/NetworkDataGridNode.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class NetworkNode extends DataGrid.SortableDataGrid.SortableDataGridNode {
    parentViewInternal;
    isHovered;
    showingInitiatorChainInternal;
    requestOrFirstKnownChildRequestInternal;
    constructor(parentView) {
        super({});
        this.parentViewInternal = parentView;
        this.isHovered = false;
        this.showingInitiatorChainInternal = false;
        this.requestOrFirstKnownChildRequestInternal = null;
    }
    displayName() {
        return '';
    }
    displayType() {
        return '';
    }
    createCell(columnId) {
        const cell = this.createTD(columnId);
        this.renderCell(cell, columnId);
        return cell;
    }
    renderCell(_cell, _columnId) {
    }
    isFailed() {
        return false;
    }
    backgroundColor() {
        const bgColors = _backgroundColors;
        const hasFocus = document.hasFocus();
        const isSelected = this.dataGrid && this.dataGrid.element === document.activeElement;
        const isFailed = this.isFailed();
        if (this.selected && hasFocus && isSelected && isFailed) {
            return bgColors.FocusSelectedHasError;
        }
        if (this.selected && hasFocus && isSelected) {
            return bgColors.FocusSelected;
        }
        if (this.selected) {
            return bgColors.Selected;
        }
        if (this.hovered()) {
            return bgColors.Hovered;
        }
        if (this.isOnInitiatorPath()) {
            return bgColors.InitiatorPath;
        }
        if (this.isOnInitiatedPath()) {
            return bgColors.InitiatedPath;
        }
        if (this.isStriped()) {
            return bgColors.Stripe;
        }
        return bgColors.Default;
    }
    updateBackgroundColor() {
        const element = this.existingElement();
        if (!element) {
            return;
        }
        element.style.backgroundColor = `var(${this.backgroundColor()})`;
        this.parentViewInternal.stylesChanged();
    }
    setStriped(isStriped) {
        super.setStriped(isStriped);
        this.updateBackgroundColor();
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        this.updateBackgroundColor();
        this.parentViewInternal.updateNodeSelectedClass(/* isSelected */ true);
    }
    deselect(supressSelectedEvent) {
        super.deselect(supressSelectedEvent);
        this.updateBackgroundColor();
        this.parentViewInternal.updateNodeSelectedClass(/* isSelected */ false);
    }
    parentView() {
        return this.parentViewInternal;
    }
    hovered() {
        return this.isHovered;
    }
    showingInitiatorChain() {
        return this.showingInitiatorChainInternal;
    }
    nodeSelfHeight() {
        return this.parentViewInternal.rowHeight();
    }
    setHovered(hovered, showInitiatorChain) {
        if (this.isHovered === hovered && this.showingInitiatorChainInternal === showInitiatorChain) {
            return;
        }
        if (this.isHovered !== hovered) {
            this.isHovered = hovered;
            if (this.attached()) {
                this.element().classList.toggle('hover', hovered);
            }
        }
        if (this.showingInitiatorChainInternal !== showInitiatorChain) {
            this.showingInitiatorChainInternal = showInitiatorChain;
            this.showingInitiatorChainChanged();
        }
        this.parentViewInternal.stylesChanged();
        this.updateBackgroundColor();
    }
    showingInitiatorChainChanged() {
    }
    isOnInitiatorPath() {
        return false;
    }
    isOnInitiatedPath() {
        return false;
    }
    request() {
        return null;
    }
    isNavigationRequest() {
        return false;
    }
    clearFlatNodes() {
        super.clearFlatNodes();
        this.requestOrFirstKnownChildRequestInternal = null;
    }
    requestOrFirstKnownChildRequest() {
        if (this.requestOrFirstKnownChildRequestInternal) {
            return this.requestOrFirstKnownChildRequestInternal;
        }
        let request = this.request();
        if (request || !this.hasChildren()) {
            this.requestOrFirstKnownChildRequestInternal = request;
            return this.requestOrFirstKnownChildRequestInternal;
        }
        let firstChildRequest = null;
        const flatChildren = this.flatChildren();
        for (let i = 0; i < flatChildren.length; i++) {
            request = flatChildren[i].request();
            if (!firstChildRequest || (request && request.issueTime() < firstChildRequest.issueTime())) {
                firstChildRequest = request;
            }
        }
        this.requestOrFirstKnownChildRequestInternal = firstChildRequest;
        return this.requestOrFirstKnownChildRequestInternal;
    }
}
export const _backgroundColors = {
    Default: '--color-grid-default',
    Stripe: '--color-grid-stripe',
    Navigation: '--network-grid-navigation-color',
    Hovered: '--color-grid-hovered',
    InitiatorPath: '--network-grid-initiator-path-color',
    InitiatedPath: '--network-grid-initiated-path-color',
    Selected: '--color-grid-selected',
    FocusSelected: '--color-grid-focus-selected',
    FocusSelectedHasError: '--network-grid-focus-selected-color-has-error',
    FromFrame: '--network-grid-from-frame-color',
};
export class NetworkRequestNode extends NetworkNode {
    nameCell;
    initiatorCell;
    requestInternal;
    isNavigationRequestInternal;
    selectable;
    isOnInitiatorPathInternal;
    isOnInitiatedPathInternal;
    linkifiedInitiatorAnchor;
    constructor(parentView, request) {
        super(parentView);
        this.nameCell = null;
        this.initiatorCell = null;
        this.requestInternal = request;
        this.isNavigationRequestInternal = false;
        this.selectable = true;
        this.isOnInitiatorPathInternal = false;
        this.isOnInitiatedPathInternal = false;
    }
    static NameComparator(a, b) {
        const aName = a.displayName().toLowerCase();
        const bName = b.displayName().toLowerCase();
        if (aName === bName) {
            const aRequest = a.requestOrFirstKnownChildRequest();
            const bRequest = b.requestOrFirstKnownChildRequest();
            if (aRequest && bRequest) {
                return aRequest.identityCompare(bRequest);
            }
            return aRequest ? -1 : 1;
        }
        return aName < bName ? -1 : 1;
    }
    static RemoteAddressComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aRemoteAddress = aRequest.remoteAddress();
        const bRemoteAddress = bRequest.remoteAddress();
        if (aRemoteAddress > bRemoteAddress) {
            return 1;
        }
        if (bRemoteAddress > aRemoteAddress) {
            return -1;
        }
        return aRequest.identityCompare(bRequest);
    }
    static SizeComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        if (bRequest.cached() && !aRequest.cached()) {
            return 1;
        }
        if (aRequest.cached() && !bRequest.cached()) {
            return -1;
        }
        return (aRequest.transferSize - bRequest.transferSize) || (aRequest.resourceSize - bRequest.resourceSize) ||
            aRequest.identityCompare(bRequest);
    }
    static TypeComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aSimpleType = a.displayType();
        const bSimpleType = b.displayType();
        if (aSimpleType > bSimpleType) {
            return 1;
        }
        if (bSimpleType > aSimpleType) {
            return -1;
        }
        return aRequest.identityCompare(bRequest);
    }
    static InitiatorComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aHasInitiatorCell = a instanceof NetworkRequestNode && a.initiatorCell;
        const bHasInitiatorCell = b instanceof NetworkRequestNode && b.initiatorCell;
        if (!aHasInitiatorCell || !bHasInitiatorCell) {
            return !aHasInitiatorCell ? -1 : 1;
        }
        // `a` and `b` are guaranteed NetworkRequestNodes with present initiatorCell elements.
        const networkRequestNodeA = a;
        const networkRequestNodeB = b;
        const aText = networkRequestNodeA.linkifiedInitiatorAnchor ?
            networkRequestNodeA.linkifiedInitiatorAnchor.textContent || '' :
            networkRequestNodeA.initiatorCell.title;
        const bText = networkRequestNodeB.linkifiedInitiatorAnchor ?
            networkRequestNodeB.linkifiedInitiatorAnchor.textContent || '' :
            networkRequestNodeB.initiatorCell.title;
        return aText.localeCompare(bText);
    }
    static InitiatorAddressSpaceComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aClientSecurityState = aRequest.clientSecurityState();
        const bClientSecurityState = bRequest.clientSecurityState();
        if (!aClientSecurityState || !bClientSecurityState) {
            return !aClientSecurityState ? -1 : 1;
        }
        return aClientSecurityState.initiatorIPAddressSpace.localeCompare(bClientSecurityState.initiatorIPAddressSpace);
    }
    static RemoteAddressSpaceComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        return aRequest.remoteAddressSpace().localeCompare(bRequest.remoteAddressSpace());
    }
    static RequestCookiesCountComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aScore = aRequest.includedRequestCookies().length;
        const bScore = bRequest.includedRequestCookies().length;
        return (aScore - bScore) || aRequest.identityCompare(bRequest);
    }
    // TODO(allada) This function deserves to be in a network-common of some sort.
    static ResponseCookiesCountComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aScore = aRequest.responseCookies ? aRequest.responseCookies.length : 0;
        const bScore = bRequest.responseCookies ? bRequest.responseCookies.length : 0;
        return (aScore - bScore) || aRequest.identityCompare(bRequest);
    }
    static PriorityComparator(a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aPriority = aRequest.priority();
        let aScore = aPriority ? PerfUI.NetworkPriorities.networkPriorityWeight(aPriority) : 0;
        aScore = aScore || 0;
        const bPriority = bRequest.priority();
        let bScore = bPriority ? PerfUI.NetworkPriorities.networkPriorityWeight(bPriority) : 0;
        bScore = bScore || 0;
        return aScore - bScore || aRequest.identityCompare(bRequest);
    }
    static RequestPropertyComparator(propertyName, a, b) {
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const aRequest = a.requestOrFirstKnownChildRequest();
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aValue = aRequest[propertyName];
        const bValue = bRequest[propertyName];
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    static RequestURLComparator(a, b) {
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aURL = aRequest.url();
        const bURL = bRequest.url();
        if (aURL === bURL) {
            return aRequest.identityCompare(bRequest);
        }
        return aURL > bURL ? 1 : -1;
    }
    static ResponseHeaderStringComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aValue = String(aRequest.responseHeaderValue(propertyName) || '');
        const bValue = String(bRequest.responseHeaderValue(propertyName) || '');
        return aValue.localeCompare(bValue) || aRequest.identityCompare(bRequest);
    }
    static ResponseHeaderNumberComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aRawValue = aRequest.responseHeaderValue(propertyName);
        const aValue = (aRawValue !== undefined) ? parseFloat(aRawValue) : -Infinity;
        const bRawValue = bRequest.responseHeaderValue(propertyName);
        const bValue = (bRawValue !== undefined) ? parseFloat(bRawValue) : -Infinity;
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    static ResponseHeaderDateComparator(propertyName, a, b) {
        // TODO(allada) Handle this properly for group nodes.
        const aRequest = a.requestOrFirstKnownChildRequest();
        const bRequest = b.requestOrFirstKnownChildRequest();
        if (!aRequest || !bRequest) {
            return !aRequest ? -1 : 1;
        }
        const aHeader = aRequest.responseHeaderValue(propertyName);
        const bHeader = bRequest.responseHeaderValue(propertyName);
        const aValue = aHeader ? new Date(aHeader).getTime() : -Infinity;
        const bValue = bHeader ? new Date(bHeader).getTime() : -Infinity;
        if (aValue === bValue) {
            return aRequest.identityCompare(bRequest);
        }
        return aValue > bValue ? 1 : -1;
    }
    showingInitiatorChainChanged() {
        const showInitiatorChain = this.showingInitiatorChain();
        const initiatorGraph = Logs.NetworkLog.NetworkLog.instance().initiatorGraphForRequest(this.requestInternal);
        for (const request of initiatorGraph.initiators) {
            if (request === this.requestInternal) {
                continue;
            }
            const node = this.parentView().nodeForRequest(request);
            if (!node) {
                continue;
            }
            node.setIsOnInitiatorPath(showInitiatorChain);
        }
        for (const request of initiatorGraph.initiated.keys()) {
            if (request === this.requestInternal) {
                continue;
            }
            const node = this.parentView().nodeForRequest(request);
            if (!node) {
                continue;
            }
            node.setIsOnInitiatedPath(showInitiatorChain);
        }
    }
    setIsOnInitiatorPath(isOnInitiatorPath) {
        if (this.isOnInitiatorPathInternal === isOnInitiatorPath || !this.attached()) {
            return;
        }
        this.isOnInitiatorPathInternal = isOnInitiatorPath;
        this.updateBackgroundColor();
    }
    isOnInitiatorPath() {
        return this.isOnInitiatorPathInternal;
    }
    setIsOnInitiatedPath(isOnInitiatedPath) {
        if (this.isOnInitiatedPathInternal === isOnInitiatedPath || !this.attached()) {
            return;
        }
        this.isOnInitiatedPathInternal = isOnInitiatedPath;
        this.updateBackgroundColor();
    }
    isOnInitiatedPath() {
        return this.isOnInitiatedPathInternal;
    }
    displayType() {
        const mimeType = this.requestInternal.mimeType || this.requestInternal.requestContentType() || '';
        const resourceType = this.requestInternal.resourceType();
        let simpleType = resourceType.name();
        if (this.requestInternal.fromEarlyHints()) {
            return i18nString(UIStrings.earlyHints);
        }
        if (resourceType === Common.ResourceType.resourceTypes.Other ||
            resourceType === Common.ResourceType.resourceTypes.Image) {
            simpleType = mimeType.replace(/^(application|image)\//, '');
        }
        if (this.requestInternal.isRedirect()) {
            simpleType += ' / ' + i18nString(UIStrings.redirect);
        }
        return simpleType;
    }
    displayName() {
        return this.requestInternal.name();
    }
    request() {
        return this.requestInternal;
    }
    isNavigationRequest() {
        const pageLoad = SDK.PageLoad.PageLoad.forRequest(this.requestInternal);
        return pageLoad ? pageLoad.mainRequest === this.requestInternal : false;
    }
    nodeSelfHeight() {
        return this.parentView().rowHeight();
    }
    createCells(element) {
        this.nameCell = null;
        this.initiatorCell = null;
        element.classList.toggle('network-error-row', this.isFailed());
        element.classList.toggle('network-navigation-row', this.isNavigationRequestInternal);
        super.createCells(element);
        this.updateBackgroundColor();
    }
    setTextAndTitle(element, text, title) {
        UI.UIUtils.createTextChild(element, text);
        UI.Tooltip.Tooltip.install(element, title || text);
    }
    setTextAndTitleAsLink(element, cellText, titleText, handler) {
        const link = document.createElement('span');
        link.classList.add('devtools-link');
        link.textContent = cellText;
        link.addEventListener('click', handler);
        element.appendChild(link);
        UI.Tooltip.Tooltip.install(element, titleText);
    }
    renderCell(c, columnId) {
        const cell = c;
        switch (columnId) {
            case 'name': {
                this.renderPrimaryCell(cell, columnId);
                break;
            }
            case 'path': {
                this.renderPrimaryCell(cell, columnId, this.requestInternal.pathname);
                break;
            }
            case 'url': {
                this.renderPrimaryCell(cell, columnId, this.requestInternal.url());
                break;
            }
            case 'method': {
                const preflightRequest = this.requestInternal.preflightRequest();
                if (preflightRequest) {
                    this.setTextAndTitle(cell, `${this.requestInternal.requestMethod} + `, i18nString(UIStrings.sPreflight, { PH1: this.requestInternal.requestMethod }));
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyRevealable(preflightRequest, i18nString(UIStrings.preflight), undefined, i18nString(UIStrings.selectPreflightRequest), undefined, 'preflight-request'));
                }
                else {
                    this.setTextAndTitle(cell, this.requestInternal.requestMethod);
                }
                break;
            }
            case 'status': {
                this.renderStatusCell(cell);
                break;
            }
            case 'protocol': {
                this.renderProtocolCell(cell);
                break;
            }
            case 'scheme': {
                this.setTextAndTitle(cell, this.requestInternal.scheme);
                break;
            }
            case 'domain': {
                this.setTextAndTitle(cell, this.requestInternal.domain);
                break;
            }
            case 'remote-address': {
                this.setTextAndTitle(cell, this.requestInternal.remoteAddress());
                break;
            }
            case 'remote-address-space': {
                this.renderAddressSpaceCell(cell, this.requestInternal.remoteAddressSpace());
                break;
            }
            case 'cookies': {
                this.setTextAndTitle(cell, this.arrayLength(this.requestInternal.includedRequestCookies()));
                break;
            }
            case 'set-cookies': {
                this.setTextAndTitle(cell, this.arrayLength(this.requestInternal.nonBlockedResponseCookies()));
                break;
            }
            case 'priority': {
                const priority = this.requestInternal.priority();
                const initialPriority = this.requestInternal.initialPriority();
                if (priority && initialPriority) {
                    this.setTextAndTitle(cell, PerfUI.NetworkPriorities.uiLabelForNetworkPriority(priority), i18nString(UIStrings.initialPriorityToolTip, {
                        PH1: PerfUI.NetworkPriorities.uiLabelForNetworkPriority(priority),
                        PH2: PerfUI.NetworkPriorities.uiLabelForNetworkPriority(initialPriority),
                    }));
                }
                else {
                    this.setTextAndTitle(cell, priority ? PerfUI.NetworkPriorities.uiLabelForNetworkPriority(priority) : '');
                }
                this.appendSubtitle(cell, initialPriority ? PerfUI.NetworkPriorities.uiLabelForNetworkPriority(initialPriority) : '');
                break;
            }
            case 'connection-id': {
                this.setTextAndTitle(cell, this.requestInternal.connectionId === '0' ? '' : this.requestInternal.connectionId);
                break;
            }
            case 'type': {
                this.setTextAndTitle(cell, this.displayType());
                break;
            }
            case 'initiator': {
                this.renderInitiatorCell(cell);
                break;
            }
            case 'initiator-address-space': {
                const clientSecurityState = this.requestInternal.clientSecurityState();
                this.renderAddressSpaceCell(cell, clientSecurityState ? clientSecurityState.initiatorIPAddressSpace :
                    "Unknown" /* Protocol.Network.IPAddressSpace.Unknown */);
                break;
            }
            case 'size': {
                this.renderSizeCell(cell);
                break;
            }
            case 'time': {
                this.renderTimeCell(cell);
                break;
            }
            case 'timeline': {
                this.setTextAndTitle(cell, '');
                break;
            }
            case 'has-overrides': {
                this.setTextAndTitle(cell, this.requestInternal.overrideTypes.join(', '));
                break;
            }
            default: {
                this.setTextAndTitle(cell, this.requestInternal.responseHeaderValue(columnId) || '');
                break;
            }
        }
    }
    arrayLength(array) {
        return array ? String(array.length) : '';
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        this.parentView().dispatchEventToListeners("RequestSelected" /* Events.RequestSelected */, this.requestInternal);
    }
    highlightMatchedSubstring(regexp) {
        if (!regexp || !this.nameCell || this.nameCell.textContent === null) {
            return [];
        }
        // Ensure element is created.
        this.element();
        const domChanges = [];
        const matchInfo = this.nameCell.textContent.match(regexp);
        if (matchInfo) {
            UI.UIUtils.highlightSearchResult(this.nameCell, matchInfo.index || 0, matchInfo[0].length, domChanges);
        }
        return domChanges;
    }
    openInNewTab() {
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(this.requestInternal.url());
    }
    isFailed() {
        if (this.requestInternal.failed && !this.requestInternal.statusCode) {
            return true;
        }
        if (this.requestInternal.statusCode >= 400) {
            return true;
        }
        const signedExchangeInfo = this.requestInternal.signedExchangeInfo();
        if (signedExchangeInfo !== null && Boolean(signedExchangeInfo.errors)) {
            return true;
        }
        if (this.requestInternal.webBundleInfo()?.errorMessage ||
            this.requestInternal.webBundleInnerRequestInfo()?.errorMessage) {
            return true;
        }
        if (this.requestInternal.corsErrorStatus()) {
            return true;
        }
        return false;
    }
    renderPrimaryCell(cell, columnId, text) {
        const columnIndex = this.dataGrid?.indexOfVisibleColumn(columnId) | 0;
        const isFirstCell = (columnIndex === 0);
        if (isFirstCell) {
            const leftPadding = this.leftPadding ? this.leftPadding + 'px' : '';
            cell.style.setProperty('padding-left', leftPadding);
            cell.tabIndex = -1;
            this.nameCell = cell;
            cell.addEventListener('dblclick', this.openInNewTab.bind(this), false);
            cell.addEventListener('mousedown', () => {
                // When the request panel isn't visible yet, firing the RequestActivated event
                // doesn't make it visible if no request is selected. So we'll select it first.
                this.select();
                this.parentView().dispatchEventToListeners("RequestActivated" /* Events.RequestActivated */, { showPanel: true });
            });
            cell.addEventListener('focus', () => this.parentView().resetFocus());
            // render icons
            const iconElement = this.getIcon(this.requestInternal);
            cell.appendChild(iconElement);
        }
        if (columnId === 'name') {
            const webBundleInnerRequestInfo = this.requestInternal.webBundleInnerRequestInfo();
            if (webBundleInnerRequestInfo) {
                const iconData = {
                    iconName: 'bundle',
                    color: 'var(--icon-info)',
                };
                const secondIconElement = this.createIconElement(iconData, i18nString(UIStrings.webBundleInnerRequest));
                secondIconElement.classList.add('icon');
                const networkManager = SDK.NetworkManager.NetworkManager.forRequest(this.requestInternal);
                if (webBundleInnerRequestInfo.bundleRequestId && networkManager) {
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyRevealable(new NetworkForward.NetworkRequestId.NetworkRequestId(webBundleInnerRequestInfo.bundleRequestId, networkManager), secondIconElement, undefined, undefined, undefined, 'webbundle-request'));
                }
                else {
                    cell.appendChild(secondIconElement);
                }
            }
            const name = Platform.StringUtilities.trimMiddle(this.requestInternal.name(), 100);
            const networkManager = SDK.NetworkManager.NetworkManager.forRequest(this.requestInternal);
            UI.UIUtils.createTextChild(cell, networkManager ? networkManager.target().decorateLabel(name) : name);
            this.appendSubtitle(cell, this.requestInternal.path());
            if (!this.requestInternal.url().startsWith('data')) {
                // Show the URL as tooltip unless it's a data URL.
                UI.Tooltip.Tooltip.install(cell, this.requestInternal.url());
            }
        }
        else if (text) {
            UI.UIUtils.createTextChild(cell, text);
        }
    }
    createIconElement(iconData, title) {
        const iconElement = document.createElement('div');
        iconElement.title = title;
        iconElement.style.setProperty('mask', `url('${new URL(`../../Images/${iconData.iconName}.svg`, import.meta.url).toString()}')  no-repeat center /99%`);
        iconElement.style.setProperty('background-color', iconData.color);
        return iconElement;
    }
    getIcon(request) {
        let type = request.resourceType();
        let iconElement;
        if (this.isFailed()) {
            const iconData = {
                iconName: 'cross-circle-filled',
                color: 'var(--icon-error)',
            };
            iconElement = this.createIconElement(iconData, type.title());
            iconElement.classList.add('icon');
            return iconElement;
        }
        if (request.hasThirdPartyCookiePhaseoutIssue()) {
            const iconData = {
                iconName: 'warning-filled',
                color: 'var(--icon-warning)',
            };
            iconElement = this.createIconElement(iconData, i18nString(UIStrings.thirdPartyPhaseout));
            iconElement.classList.add('icon');
            return iconElement;
        }
        const isHeaderOverriden = request.hasOverriddenHeaders();
        const isContentOverriden = request.hasOverriddenContent;
        if (isHeaderOverriden || isContentOverriden) {
            const iconData = {
                iconName: 'document',
                color: 'var(--icon-default)',
            };
            let title;
            if (isHeaderOverriden && isContentOverriden) {
                title = i18nString(UIStrings.requestContentHeadersOverridden);
            }
            else if (isContentOverriden) {
                title = i18nString(UIStrings.requestContentOverridden);
            }
            else {
                title = i18nString(UIStrings.requestHeadersOverridden);
            }
            const iconChildElement = this.createIconElement(iconData, title);
            iconChildElement.classList.add('icon');
            iconElement = document.createElement('div');
            iconElement.classList.add('network-override-marker');
            iconElement.appendChild(iconChildElement);
            return iconElement;
        }
        // Pick icon based on MIME type in the following cases:
        // - If the MIME type is 'image': some images have request type of 'fetch' or etc.
        // - If the request type is 'fetch': everything fetched by service worker has request type 'fetch'.
        // - If the request type is 'other' and MIME type is 'script', e.g. for wasm files
        const typeFromMime = Common.ResourceType.ResourceType.fromMimeType(request.mimeType);
        if (typeFromMime !== type && typeFromMime !== Common.ResourceType.resourceTypes.Other) {
            if (type === Common.ResourceType.resourceTypes.Fetch) {
                type = typeFromMime;
            }
            else if (typeFromMime === Common.ResourceType.resourceTypes.Image) {
                type = typeFromMime;
            }
            else if (type === Common.ResourceType.resourceTypes.Other &&
                typeFromMime === Common.ResourceType.resourceTypes.Script) {
                type = typeFromMime;
            }
        }
        if (type === Common.ResourceType.resourceTypes.Image) {
            const previewImage = document.createElement('img');
            previewImage.classList.add('image-network-icon-preview');
            previewImage.alt = request.resourceType().title();
            void request.populateImageSource(previewImage);
            iconElement = document.createElement('div');
            iconElement.classList.add('image', 'icon');
            iconElement.appendChild(previewImage);
            return iconElement;
        }
        // Exclude Manifest here because it has mimeType:application/json but it has its own icon
        if (type !== Common.ResourceType.resourceTypes.Manifest &&
            Common.ResourceType.ResourceType.simplifyContentType(request.mimeType) === 'application/json') {
            const iconData = {
                iconName: 'file-json',
                color: 'var(--icon-file-script)',
            };
            iconElement = this.createIconElement(iconData, request.resourceType().title());
            iconElement.classList.add('icon');
            return iconElement;
        }
        // Others
        const iconData = PanelUtils.iconDataForResourceType(type);
        iconElement = this.createIconElement(iconData, request.resourceType().title());
        iconElement.classList.add('icon');
        return iconElement;
    }
    renderStatusCell(cell) {
        cell.classList.toggle('network-dim-cell', !this.isFailed() && (this.requestInternal.cached() || !this.requestInternal.statusCode));
        const corsErrorStatus = this.requestInternal.corsErrorStatus();
        const webBundleErrorMessage = this.requestInternal.webBundleInfo()?.errorMessage ||
            this.requestInternal.webBundleInnerRequestInfo()?.errorMessage;
        if (webBundleErrorMessage) {
            this.setTextAndTitle(cell, i18nString(UIStrings.webBundleError), webBundleErrorMessage);
        }
        else if (this.requestInternal.failed && !this.requestInternal.canceled && !this.requestInternal.wasBlocked() &&
            !corsErrorStatus) {
            const failText = i18nString(UIStrings.failed);
            if (this.requestInternal.localizedFailDescription) {
                UI.UIUtils.createTextChild(cell, failText);
                this.appendSubtitle(cell, this.requestInternal.localizedFailDescription, true);
                UI.Tooltip.Tooltip.install(cell, failText + ' ' + this.requestInternal.localizedFailDescription);
            }
            else {
                this.setTextAndTitle(cell, failText);
            }
        }
        else if (this.requestInternal.statusCode && this.requestInternal.statusCode >= 400) {
            const statusText = this.requestInternal.getInferredStatusText();
            UI.UIUtils.createTextChild(cell, String(this.requestInternal.statusCode));
            this.appendSubtitle(cell, statusText);
            UI.Tooltip.Tooltip.install(cell, this.requestInternal.statusCode + ' ' + statusText);
        }
        else if (!this.requestInternal.statusCode && this.requestInternal.parsedURL.isDataURL()) {
            this.setTextAndTitle(cell, i18nString(UIStrings.data));
        }
        else if (!this.requestInternal.statusCode && this.requestInternal.canceled) {
            this.setTextAndTitle(cell, i18nString(UIStrings.canceled));
        }
        else if (this.requestInternal.wasBlocked()) {
            let reason = i18nString(UIStrings.other);
            let displayShowHeadersLink = false;
            switch (this.requestInternal.blockedReason()) {
                case "other" /* Protocol.Network.BlockedReason.Other */:
                    reason = i18nString(UIStrings.other);
                    break;
                case "csp" /* Protocol.Network.BlockedReason.Csp */:
                    reason = i18nString(UIStrings.csp);
                    break;
                case "mixed-content" /* Protocol.Network.BlockedReason.MixedContent */:
                    reason = i18n.i18n.lockedString('mixed-content');
                    break;
                case "origin" /* Protocol.Network.BlockedReason.Origin */:
                    reason = i18nString(UIStrings.origin);
                    break;
                case "inspector" /* Protocol.Network.BlockedReason.Inspector */:
                    reason = i18nString(UIStrings.devtools);
                    break;
                case "subresource-filter" /* Protocol.Network.BlockedReason.SubresourceFilter */:
                    reason = i18n.i18n.lockedString('subresource-filter');
                    break;
                case "content-type" /* Protocol.Network.BlockedReason.ContentType */:
                    reason = i18n.i18n.lockedString('content-type');
                    break;
                case "coep-frame-resource-needs-coep-header" /* Protocol.Network.BlockedReason.CoepFrameResourceNeedsCoepHeader */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('CoepFrameResourceNeedsCoepHeader');
                    break;
                case "coop-sandboxed-iframe-cannot-navigate-to-coop-page" /* Protocol.Network.BlockedReason.CoopSandboxedIframeCannotNavigateToCoopPage */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('CoopSandboxedIframeCannotNavigateToCoopPage');
                    break;
                case "corp-not-same-origin" /* Protocol.Network.BlockedReason.CorpNotSameOrigin */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameOrigin');
                    break;
                case "corp-not-same-site" /* Protocol.Network.BlockedReason.CorpNotSameSite */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameSite');
                    break;
                case "corp-not-same-origin-after-defaulted-to-same-origin-by-coep" /* Protocol.Network.BlockedReason.CorpNotSameOriginAfterDefaultedToSameOriginByCoep */:
                    displayShowHeadersLink = true;
                    reason = i18n.i18n.lockedString('NotSameOriginAfterDefaultedToSameOriginByCoep');
                    break;
            }
            if (displayShowHeadersLink) {
                this.setTextAndTitleAsLink(cell, i18nString(UIStrings.blockeds, { PH1: reason }), i18nString(UIStrings.blockedTooltip), () => {
                    this.parentView().dispatchEventToListeners("RequestActivated" /* Events.RequestActivated */, {
                        showPanel: true,
                        tab: "headers-component" /* NetworkForward.UIRequestLocation.UIRequestTabs.HeadersComponent */,
                    });
                });
            }
            else {
                this.setTextAndTitle(cell, i18nString(UIStrings.blockeds, { PH1: reason }));
            }
        }
        else if (corsErrorStatus) {
            this.setTextAndTitle(cell, i18nString(UIStrings.corsError), i18nString(UIStrings.crossoriginResourceSharingErrorS, { PH1: corsErrorStatus.corsError }));
        }
        else if (this.requestInternal.statusCode) {
            UI.UIUtils.createTextChild(cell, String(this.requestInternal.statusCode));
            const statusText = this.requestInternal.getInferredStatusText();
            this.appendSubtitle(cell, statusText);
            UI.Tooltip.Tooltip.install(cell, this.requestInternal.statusCode + ' ' + statusText);
        }
        else if (this.requestInternal.finished) {
            this.setTextAndTitle(cell, i18nString(UIStrings.finished));
        }
        else if (this.requestInternal.preserved) {
            this.setTextAndTitle(cell, i18nString(UIStrings.unknown), i18nString(UIStrings.unknownExplanation));
        }
        else {
            this.setTextAndTitle(cell, i18nString(UIStrings.pendingq));
        }
    }
    renderProtocolCell(cell) {
        UI.UIUtils.createTextChild(cell, this.requestInternal.protocol);
        switch (this.requestInternal.alternateProtocolUsage) {
            case "alternativeJobWonWithoutRace" /* Protocol.Network.AlternateProtocolUsage.AlternativeJobWonWithoutRace */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.alternativeJobWonWithoutRace);
                break;
            }
            case "alternativeJobWonRace" /* Protocol.Network.AlternateProtocolUsage.AlternativeJobWonRace */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.alternativeJobWonRace);
                break;
            }
            case "mainJobWonRace" /* Protocol.Network.AlternateProtocolUsage.MainJobWonRace */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.mainJobWonRace);
                break;
            }
            case "mappingMissing" /* Protocol.Network.AlternateProtocolUsage.MappingMissing */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.mappingMissing);
                break;
            }
            case "broken" /* Protocol.Network.AlternateProtocolUsage.Broken */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.broken);
                break;
            }
            case "dnsAlpnH3JobWonWithoutRace" /* Protocol.Network.AlternateProtocolUsage.DnsAlpnH3JobWonWithoutRace */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.dnsAlpnH3JobWonWithoutRace);
                break;
            }
            case "dnsAlpnH3JobWonRace" /* Protocol.Network.AlternateProtocolUsage.DnsAlpnH3JobWonRace */: {
                UI.Tooltip.Tooltip.install(cell, UIStrings.dnsAlpnH3JobWonRace);
                break;
            }
            default: {
                UI.Tooltip.Tooltip.install(cell, this.requestInternal.protocol);
                break;
            }
        }
    }
    #getLinkifierMetric() {
        if (this.requestInternal.resourceType().isStyleSheet()) {
            return Host.UserMetrics.Action.StyleSheetInitiatorLinkClicked;
        }
        return undefined;
    }
    renderInitiatorCell(cell) {
        this.initiatorCell = cell;
        const request = this.requestInternal;
        const initiator = Logs.NetworkLog.NetworkLog.instance().initiatorInfoForRequest(request);
        const timing = request.timing;
        if (timing && timing.pushStart) {
            cell.appendChild(document.createTextNode(i18nString(UIStrings.push)));
        }
        switch (initiator.type) {
            case "parser" /* SDK.NetworkRequest.InitiatorType.Parser */: {
                const uiSourceCode = Workspace.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(initiator.url);
                const displayName = uiSourceCode?.displayName();
                const text = displayName !== undefined && initiator.lineNumber !== undefined ?
                    `${displayName}:${initiator.lineNumber}` :
                    undefined;
                cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(initiator.url, {
                    text,
                    lineNumber: initiator.lineNumber,
                    columnNumber: initiator.columnNumber,
                    userMetric: this.#getLinkifierMetric(),
                }));
                this.appendSubtitle(cell, i18nString(UIStrings.parser));
                break;
            }
            case "redirect" /* SDK.NetworkRequest.InitiatorType.Redirect */: {
                UI.Tooltip.Tooltip.install(cell, initiator.url);
                const redirectSource = request.redirectSource();
                console.assert(redirectSource !== null);
                if (this.parentView().nodeForRequest(redirectSource)) {
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyRevealable(redirectSource, Bindings.ResourceUtils.displayNameForURL(redirectSource.url()), undefined, undefined, undefined, 'redirect-source-request'));
                }
                else {
                    cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(redirectSource.url(), { jslogContext: 'redirect-source-request-url' }));
                }
                this.appendSubtitle(cell, i18nString(UIStrings.redirect));
                break;
            }
            case "script" /* SDK.NetworkRequest.InitiatorType.Script */: {
                const target = SDK.NetworkManager.NetworkManager.forRequest(request)?.target() || null;
                const linkifier = this.parentView().linkifier();
                if (initiator.stack) {
                    this.linkifiedInitiatorAnchor = linkifier.linkifyStackTraceTopFrame(target, initiator.stack);
                }
                else {
                    this.linkifiedInitiatorAnchor = linkifier.linkifyScriptLocation(target, initiator.scriptId, initiator.url, initiator.lineNumber, { columnNumber: initiator.columnNumber, inlineFrameIndex: 0 });
                }
                UI.Tooltip.Tooltip.install((this.linkifiedInitiatorAnchor), '');
                cell.appendChild(this.linkifiedInitiatorAnchor);
                this.appendSubtitle(cell, i18nString(UIStrings.script));
                cell.classList.add('network-script-initiated');
                break;
            }
            case "preload" /* SDK.NetworkRequest.InitiatorType.Preload */: {
                UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.preload));
                cell.classList.add('network-dim-cell');
                cell.appendChild(document.createTextNode(i18nString(UIStrings.preload)));
                break;
            }
            case "signedExchange" /* SDK.NetworkRequest.InitiatorType.SignedExchange */: {
                cell.appendChild(Components.Linkifier.Linkifier.linkifyURL(initiator.url));
                this.appendSubtitle(cell, i18nString(UIStrings.signedexchange));
                break;
            }
            case "preflight" /* SDK.NetworkRequest.InitiatorType.Preflight */: {
                cell.appendChild(document.createTextNode(i18nString(UIStrings.preflight)));
                if (initiator.initiatorRequest) {
                    const icon = IconButton.Icon.create('arrow-up-down-circle');
                    const link = Components.Linkifier.Linkifier.linkifyRevealable(initiator.initiatorRequest, icon, undefined, i18nString(UIStrings.selectTheRequestThatTriggered), 'trailing-link-icon', 'initator-request');
                    UI.ARIAUtils.setLabel(link, i18nString(UIStrings.selectTheRequestThatTriggered));
                    cell.appendChild(link);
                }
                break;
            }
            default: {
                UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.otherC));
                cell.classList.add('network-dim-cell');
                cell.appendChild(document.createTextNode(i18nString(UIStrings.otherC)));
            }
        }
    }
    renderAddressSpaceCell(cell, ipAddressSpace) {
        if (ipAddressSpace !== "Unknown" /* Protocol.Network.IPAddressSpace.Unknown */) {
            UI.UIUtils.createTextChild(cell, ipAddressSpace);
        }
    }
    renderSizeCell(cell) {
        const resourceSize = Platform.NumberUtilities.bytesToString(this.requestInternal.resourceSize);
        if (this.requestInternal.cachedInMemory()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.memoryCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromMemoryCacheResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.serviceWorkerRouterInfo) {
            const { serviceWorkerRouterInfo } = this.requestInternal;
            // If `serviceWorkerRouterInfo.ruleIdMatched` is undefined,store 0 to indicate invalid ID.
            const ruleIdMatched = serviceWorkerRouterInfo.ruleIdMatched ?? 0;
            UI.UIUtils.createTextChild(cell, i18n.i18n.lockedString('(ServiceWorker router)'));
            let tooltipText;
            if (serviceWorkerRouterInfo.matchedSourceType === "network" /* Protocol.Network.ServiceWorkerRouterSource.Network */) {
                const transferSize = Platform.NumberUtilities.bytesToString(this.requestInternal.transferSize);
                tooltipText = i18nString(UIStrings.matchedToServiceWorkerRouterWithNetworkSource, { PH1: ruleIdMatched, PH2: transferSize, PH3: resourceSize });
            }
            else {
                tooltipText = i18nString(UIStrings.matchedToServiceWorkerRouter, { PH1: ruleIdMatched, PH2: resourceSize });
            }
            UI.Tooltip.Tooltip.install(cell, tooltipText);
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.fetchedViaServiceWorker) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.serviceWorker));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromServiceWorkerResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.redirectSourceSignedExchangeInfoHasNoErrors()) {
            UI.UIUtils.createTextChild(cell, i18n.i18n.lockedString('(signed-exchange)'));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromSignedHttpExchange, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.webBundleInnerRequestInfo()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.webBundle));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromWebBundle, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.fromPrefetchCache()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.prefetchCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromPrefetchCacheResource, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else if (this.requestInternal.cached()) {
            UI.UIUtils.createTextChild(cell, i18nString(UIStrings.diskCache));
            UI.Tooltip.Tooltip.install(cell, i18nString(UIStrings.servedFromDiskCacheResourceSizeS, { PH1: resourceSize }));
            cell.classList.add('network-dim-cell');
        }
        else {
            const transferSize = Platform.NumberUtilities.bytesToString(this.requestInternal.transferSize);
            UI.UIUtils.createTextChild(cell, transferSize);
            UI.Tooltip.Tooltip.install(cell, `${transferSize} transferred over network, resource size: ${resourceSize}`);
        }
        this.appendSubtitle(cell, resourceSize);
    }
    renderTimeCell(cell) {
        if (this.requestInternal.duration > 0) {
            this.setTextAndTitle(cell, i18n.TimeUtilities.secondsToString(this.requestInternal.duration));
            this.appendSubtitle(cell, i18n.TimeUtilities.secondsToString(this.requestInternal.latency), false, i18nString(UIStrings.timeSubtitleTooltipText));
        }
        else if (this.requestInternal.preserved) {
            this.setTextAndTitle(cell, i18nString(UIStrings.unknown), i18nString(UIStrings.unknownExplanation));
        }
        else {
            cell.classList.add('network-dim-cell');
            this.setTextAndTitle(cell, i18nString(UIStrings.pending));
        }
    }
    appendSubtitle(cellElement, subtitleText, alwaysVisible = false, tooltipText = '') {
        const subtitleElement = document.createElement('div');
        subtitleElement.classList.add('network-cell-subtitle');
        if (alwaysVisible) {
            subtitleElement.classList.add('always-visible');
        }
        subtitleElement.textContent = subtitleText;
        if (tooltipText) {
            UI.Tooltip.Tooltip.install(subtitleElement, tooltipText);
        }
        cellElement.appendChild(subtitleElement);
    }
}
export class NetworkGroupNode extends NetworkNode {
    createCells(element) {
        super.createCells(element);
        const primaryColumn = this.dataGrid.visibleColumnsArray[0];
        const localizedTitle = `${primaryColumn.title}`;
        const localizedLevel = i18nString(UIStrings.level);
        this.nodeAccessibleText =
            `${localizedLevel} ${localizedTitle}: ${this.cellAccessibleTextMap.get(primaryColumn.id)}`;
    }
    renderCell(c, columnId) {
        const columnIndex = this.dataGrid.indexOfVisibleColumn(columnId);
        if (columnIndex === 0) {
            const cell = c;
            const leftPadding = this.leftPadding ? this.leftPadding + 'px' : '';
            cell.style.setProperty('padding-left', leftPadding);
            cell.classList.add('disclosure');
            this.setCellAccessibleName(cell.textContent || '', cell, columnId);
        }
    }
    select(supressSelectedEvent) {
        super.select(supressSelectedEvent);
        const firstChildNode = this.traverseNextNode(false, undefined, true);
        const request = firstChildNode?.request();
        if (request) {
            this.parentView().dispatchEventToListeners("RequestSelected" /* Events.RequestSelected */, request);
        }
    }
}
//# sourceMappingURL=NetworkDataGridNode.js.map