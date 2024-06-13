// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import { dispatchClickEvent, renderElementIntoDOM, } from '../../../testing/DOMHelpers.js';
import { describeWithLocale } from '../../../testing/EnvironmentHelpers.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
import * as PanelFeedback from './panel_feedback.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
describeWithLocale('Feedback button', () => {
    it('calls out to the Host API to open the link in a new tab', async () => {
        const openInNewTabStub = sinon.stub(Host.InspectorFrontendHost.InspectorFrontendHostInstance, 'openInNewTab');
        const component = new PanelFeedback.FeedbackButton.FeedbackButton();
        component.data = {
            feedbackUrl: 'https://feedbackurl.com',
        };
        renderElementIntoDOM(component);
        await coordinator.done();
        const button = component.shadowRoot.querySelector('devtools-button');
        assert.instanceOf(button, HTMLElement);
        dispatchClickEvent(button);
        assert.strictEqual(openInNewTabStub.callCount, 1);
        assert.isTrue(openInNewTabStub.firstCall.calledWith('https://feedbackurl.com'), 'openInNewTab was not called with the expected URL.');
    });
});
//# sourceMappingURL=FeedbackButton.test.js.map