// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import { getMainFrame, navigate } from '../../testing/ResourceTreeHelpers.js';
import * as Security from './security.js';
describeWithMockConnection('SecurityPanel', () => {
    let target;
    let prerenderTarget;
    beforeEach(() => {
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        prerenderTarget = createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
    });
    it('updates when security state changes', async () => {
        const securityPanel = Security.SecurityPanel.SecurityPanel.instance({ forceNew: true });
        const securityModel = target.model(Security.SecurityModel.SecurityModel);
        assert.exists(securityModel);
        const visibleSecurityState = {
            securityState: "insecure" /* Protocol.Security.SecurityState.Insecure */,
            securityStateIssueIds: [],
            certificateSecurityState: null,
        };
        securityModel.dispatchEventToListeners(Security.SecurityModel.Events.VisibleSecurityStateChanged, visibleSecurityState);
        assert.isTrue(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-insecure'));
        visibleSecurityState.securityState = "secure" /* Protocol.Security.SecurityState.Secure */;
        securityModel.dispatchEventToListeners(Security.SecurityModel.Events.VisibleSecurityStateChanged, visibleSecurityState);
        assert.isFalse(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-insecure'));
        assert.isTrue(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-secure'));
    });
    it('can switch to a different SecurityModel', async () => {
        const mainSecurityModel = target.model(Security.SecurityModel.SecurityModel);
        assert.exists(mainSecurityModel);
        const securityPanel = Security.SecurityPanel.SecurityPanel.instance({ forceNew: true });
        // Add the main target to the security panel.
        securityPanel.modelAdded(mainSecurityModel);
        const visibleSecurityState = {
            securityState: "insecure" /* Protocol.Security.SecurityState.Insecure */,
            securityStateIssueIds: [],
            certificateSecurityState: null,
        };
        mainSecurityModel.dispatchEventToListeners(Security.SecurityModel.Events.VisibleSecurityStateChanged, visibleSecurityState);
        assert.isTrue(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-insecure'));
        // Switch to the prerender target.
        const prerenderSecurityModel = prerenderTarget.model(Security.SecurityModel.SecurityModel);
        assert.exists(prerenderSecurityModel);
        securityPanel.modelAdded(prerenderSecurityModel);
        securityPanel.modelRemoved(mainSecurityModel);
        // Check that the security panel does not listen to events from the previous target.
        visibleSecurityState.securityState = "secure" /* Protocol.Security.SecurityState.Secure */;
        mainSecurityModel.dispatchEventToListeners(Security.SecurityModel.Events.VisibleSecurityStateChanged, visibleSecurityState);
        assert.isTrue(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-insecure'));
        // Check that the security panel listens to events from the current target.
        prerenderSecurityModel.dispatchEventToListeners(Security.SecurityModel.Events.VisibleSecurityStateChanged, visibleSecurityState);
        assert.isTrue(securityPanel.mainView.contentElement.querySelector('.security-summary')
            ?.classList.contains('security-summary-secure'));
        // Check that the SecurityPanel listens to any PrimaryPageChanged event
        const sidebarTreeClearSpy = sinon.spy(securityPanel.sidebarTree, 'clearOrigins');
        navigate(getMainFrame(target));
        assert.isTrue(sidebarTreeClearSpy.calledOnce);
    });
    it('shows \'reload page\' message when no data is available', async () => {
        const securityModel = target.model(Security.SecurityModel.SecurityModel);
        assert.exists(securityModel);
        const securityPanel = Security.SecurityPanel.SecurityPanel.instance({ forceNew: true });
        // Check that reload message is visible initially.
        const reloadMessage = securityPanel.sidebarTree.shadowRoot.querySelector('.security-main-view-reload-message');
        assert.instanceOf(reloadMessage, HTMLLIElement);
        assert.isFalse(reloadMessage.classList.contains('hidden'));
        // Check that reload message is hidden when there is data to display.
        const networkManager = securityModel.networkManager();
        const request = {
            wasBlocked: () => false,
            url: () => 'https://www.example.com',
            securityState: () => "secure" /* Protocol.Security.SecurityState.Secure */,
            securityDetails: () => null,
            cached: () => false,
        };
        networkManager.dispatchEventToListeners(SDK.NetworkManager.Events.RequestFinished, request);
        assert.isTrue(reloadMessage.classList.contains('hidden'));
        // Check that reload message is hidden after clearing data.
        navigate(getMainFrame(target));
        assert.isFalse(reloadMessage.classList.contains('hidden'));
    });
});
//# sourceMappingURL=SecurityPanel.test.js.map