// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Application from './application.js';
describeWithMockConnection('ServiceWorkersView', () => {
    let target;
    let view;
    beforeEach(() => {
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
    });
    afterEach(() => {
        view.detach();
    });
    it('shows service worker registrations', async () => {
        view = new Application.ServiceWorkersView.ServiceWorkersView();
        view.markAsRoot();
        view.show(document.body);
        const serviceWorkersManager = target.model(SDK.ServiceWorkerManager.ServiceWorkerManager);
        assert.exists(serviceWorkersManager);
        const securityOriginManager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assert.exists(securityOriginManager);
        const ORIGIN = 'example.com';
        sinon.stub(securityOriginManager, 'securityOrigins').returns([ORIGIN]);
        const SCOPE_URL = 'SCOPE_URL';
        serviceWorkersManager.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, {
            scopeURL: SCOPE_URL,
            securityOrigin: ORIGIN,
            versionsByMode: () => new Map(),
            fingerprint: () => { },
        });
        const sectionTitle = view.currentWorkersView.contentElement.querySelector('.report-section-title');
        assert.exists(sectionTitle);
        assert.strictEqual(sectionTitle.textContent, SCOPE_URL);
    });
    describe('router info', () => {
        const registrationId = 'fake-sw-id';
        const origin = 'https://example.com';
        const routerRules = [
            {
                condition: { urlPattern: '/foo/bar' },
                source: ['network'],
                id: 1,
            },
            {
                condition: { urlPattern: '/baz' },
                source: ['fetch-event'],
                id: 2,
            },
        ];
        let serviceWorkersManager;
        const hasRouterField = () => {
            return Array.from(view.currentWorkersView.contentElement.querySelectorAll('.report-field')).some(field => {
                return field.querySelector('.report-field-name')?.textContent === 'Routers';
            });
        };
        beforeEach(() => {
            Application.ServiceWorkersView.setThrottleDisabledForDebugging(true);
            view = new Application.ServiceWorkersView.ServiceWorkersView();
            view.markAsRoot();
            view.show(document.body);
            serviceWorkersManager = target.model(SDK.ServiceWorkerManager.ServiceWorkerManager);
            assert.exists(serviceWorkersManager);
            const securityOriginManager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
            assert.exists(securityOriginManager);
            sinon.stub(securityOriginManager, 'securityOrigins').returns([origin]);
        });
        it('shows the router field if active version has at least one router rule', async () => {
            const payload = { registrationId, scopeURL: origin, isDeleted: false };
            const registration = new SDK.ServiceWorkerManager.ServiceWorkerRegistration(payload);
            const versionId = 1;
            const versionPayload = {
                registrationId,
                versionId: versionId.toString(),
                scriptURL: '',
                status: "activated" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activated */,
                runningStatus: "running" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Running */,
                routerRules: JSON.stringify(routerRules),
            };
            registration.updateVersion(versionPayload);
            serviceWorkersManager?.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, registration);
            assert.isTrue(hasRouterField());
        });
        it('does not show the router field if active version does not have router rules', async () => {
            const payload = { registrationId, scopeURL: origin, isDeleted: false };
            const registration = new SDK.ServiceWorkerManager.ServiceWorkerRegistration(payload);
            let versionId = 1;
            const versionPayload = {
                registrationId,
                versionId: versionId.toString(),
                scriptURL: '',
                status: "activated" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activated */,
                runningStatus: "running" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Running */,
            };
            registration.updateVersion(versionPayload);
            serviceWorkersManager?.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, registration);
            assert.isFalse(hasRouterField());
            // Update the version with the empty router rules.
            versionId++;
            registration.updateVersion(Object.assign({}, versionPayload, {
                versionId: versionId.toString(),
                routerRules: JSON.stringify([]),
            }));
            registration.updateVersion(versionPayload);
            serviceWorkersManager?.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, registration);
            assert.isFalse(hasRouterField());
        });
        it('does not show the router field if there is no active version', async () => {
            const payload = { registrationId, scopeURL: origin, isDeleted: false };
            const registration = new SDK.ServiceWorkerManager.ServiceWorkerRegistration(payload);
            let versionId = 0;
            const versionPayload = {
                registrationId,
                versionId: versionId.toString(),
                scriptURL: '',
                status: "new" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.New */,
                runningStatus: "starting" /* Protocol.ServiceWorker.ServiceWorkerVersionRunningStatus.Starting */,
                routerRules: JSON.stringify(routerRules),
            };
            const updateAndDispatchEvent = (status) => {
                versionId++;
                registration.updateVersion(Object.assign({}, versionPayload, { versionId: versionId.toString(), status }));
                serviceWorkersManager?.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, registration);
            };
            updateAndDispatchEvent("new" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.New */);
            assert.isFalse(hasRouterField());
            updateAndDispatchEvent("redundant" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Redundant */);
            assert.isFalse(hasRouterField());
            updateAndDispatchEvent("installing" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installing */);
            assert.isFalse(hasRouterField());
            updateAndDispatchEvent("installed" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Installed */);
            assert.isFalse(hasRouterField());
            updateAndDispatchEvent("activating" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activating */);
            assert.isTrue(hasRouterField());
            updateAndDispatchEvent("activated" /* Protocol.ServiceWorker.ServiceWorkerVersionStatus.Activated */);
            assert.isTrue(hasRouterField());
        });
    });
});
//# sourceMappingURL=ServiceWorkersView.test.js.map