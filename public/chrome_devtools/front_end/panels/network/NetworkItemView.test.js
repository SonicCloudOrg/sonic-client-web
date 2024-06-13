// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { renderElementIntoDOM } from '../../testing/DOMHelpers.js';
import { deinitializeGlobalVars, describeWithEnvironment, } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import { setUpEnvironment } from '../../testing/OverridesHelpers.js';
import * as NetworkForward from './forward/forward.js';
import * as Network from './network.js';
function renderNetworkItemView(request) {
    if (!request) {
        request = SDK.NetworkRequest.NetworkRequest.create('requestId', 'https://www.example.com/foo.html', '', null, null, null);
    }
    const networkItemView = new Network.NetworkItemView.NetworkItemView(request, {});
    const div = document.createElement('div');
    renderElementIntoDOM(div);
    networkItemView.markAsRoot();
    networkItemView.show(div);
    return networkItemView;
}
function getIconDataInTab(tabs, tabId) {
    const icon = tabs.find(tab => tab.id === tabId)?.['icon'];
    const iconData = icon?.data;
    return iconData;
}
describeWithMockConnection('NetworkItemView', () => {
    beforeEach(() => {
        setUpEnvironment();
    });
    afterEach(async () => {
        await deinitializeGlobalVars();
    });
    it('reveals header in RequestHeadersView', async () => {
        const networkItemView = renderNetworkItemView();
        const headersViewComponent = networkItemView.getHeadersViewComponent();
        const headersViewComponentSpy = sinon.spy(headersViewComponent, 'revealHeader');
        assert.isTrue(headersViewComponentSpy.notCalled);
        networkItemView.revealHeader("Response" /* NetworkForward.UIRequestLocation.UIHeaderSection.Response */, 'headerName');
        assert.isTrue(headersViewComponentSpy.calledWith("Response" /* NetworkForward.UIRequestLocation.UIHeaderSection.Response */, 'headerName'));
        networkItemView.detach();
    });
});
describeWithEnvironment('NetworkItemView', () => {
    let request;
    const OVERRIDEN_ICON_NAME = 'small-status-dot';
    beforeEach(async () => {
        request = SDK.NetworkRequest.NetworkRequest.create('requestId', 'https://www.example.com', '', null, null, null);
        request.statusCode = 200;
    });
    it('shows indicator for overriden headers and responses', () => {
        request.setWasIntercepted(true);
        request.hasOverriddenContent = true;
        request.responseHeaders = [{ name: 'foo', value: 'overridden' }];
        request.originalResponseHeaders = [{ name: 'foo', value: 'original' }];
        const networkItemView = renderNetworkItemView(request);
        const headersIcon = getIconDataInTab(networkItemView['tabs'], 'headers-component');
        const responseIcon = getIconDataInTab(networkItemView['tabs'], 'response');
        networkItemView.detach();
        assert.strictEqual(headersIcon.iconName, OVERRIDEN_ICON_NAME);
        assert.strictEqual(responseIcon.iconName, OVERRIDEN_ICON_NAME);
    });
    it('shows indicator for overriden headers', () => {
        request.setWasIntercepted(true);
        request.responseHeaders = [{ name: 'foo', value: 'overridden' }];
        request.originalResponseHeaders = [{ name: 'foo', value: 'original' }];
        const networkItemView = renderNetworkItemView(request);
        const headersIcon = getIconDataInTab(networkItemView['tabs'], 'headers-component');
        const responseIcon = getIconDataInTab(networkItemView['tabs'], 'response');
        networkItemView.detach();
        assert.strictEqual(headersIcon.iconName, OVERRIDEN_ICON_NAME);
        assert.isUndefined(responseIcon);
    });
    it('shows indicator for overriden content', () => {
        request.setWasIntercepted(true);
        request.hasOverriddenContent = true;
        const networkItemView = renderNetworkItemView(request);
        const headersIcon = getIconDataInTab(networkItemView['tabs'], 'headers-component');
        const responseIcon = getIconDataInTab(networkItemView['tabs'], 'response');
        networkItemView.detach();
        assert.isUndefined(headersIcon);
        assert.strictEqual(responseIcon.iconName, OVERRIDEN_ICON_NAME);
    });
    it('does not show indicator for unoverriden request', () => {
        const networkItemView = renderNetworkItemView(request);
        const headersIcon = getIconDataInTab(networkItemView['tabs'], 'headers-component');
        const responseIcon = getIconDataInTab(networkItemView['tabs'], 'response');
        networkItemView.detach();
        assert.isUndefined(headersIcon);
        assert.isUndefined(responseIcon);
    });
    it('shows the Response and EventSource tab for text/event-stream requests', () => {
        request.mimeType = 'text/event-stream';
        const networkItemView = renderNetworkItemView(request);
        assert.isTrue(networkItemView.hasTab("eventSource" /* NetworkForward.UIRequestLocation.UIRequestTabs.EventSource */));
        assert.isTrue(networkItemView.hasTab("response" /* NetworkForward.UIRequestLocation.UIRequestTabs.Response */));
        networkItemView.detach();
    });
});
//# sourceMappingURL=NetworkItemView.test.js.map