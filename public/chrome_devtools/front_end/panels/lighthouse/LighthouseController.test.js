// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget, stubNoopSettings } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
describeWithMockConnection('LighthouseController', () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let Lighthouse;
    let target;
    beforeEach(async () => {
        stubNoopSettings();
        Lighthouse = await import('./lighthouse.js');
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
    });
    it('updates page auditability on service worker registraion', async () => {
        const controller = new Lighthouse.LighthouseController.LighthouseController(sinon.createStubInstance(Lighthouse.LighthouseProtocolService.ProtocolService));
        const serviceWorkerManager = target.model(SDK.ServiceWorkerManager.ServiceWorkerManager);
        assert.exists(serviceWorkerManager);
        const pageAuditabilityChange = controller.once(Lighthouse.LighthouseController.Events.PageAuditabilityChanged);
        serviceWorkerManager.dispatchEventToListeners("RegistrationUpdated" /* SDK.ServiceWorkerManager.Events.RegistrationUpdated */, {});
        await pageAuditabilityChange;
    });
});
//# sourceMappingURL=LighthouseController.test.js.map