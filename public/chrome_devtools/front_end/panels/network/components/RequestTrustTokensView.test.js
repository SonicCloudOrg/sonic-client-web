// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { getElementsWithinComponent, getElementWithinComponent, renderElementIntoDOM, } from '../../../testing/DOMHelpers.js';
import { describeWithLocale } from '../../../testing/EnvironmentHelpers.js';
import * as NetworkComponents from './components.js';
describeWithLocale('RequestTrustTokensView', () => {
    const mockId = 'mockId';
    const makeRequest = (params, result) => {
        return { trustTokenParams: () => params, trustTokenOperationDoneEvent: () => result };
    };
    const renderRequestTrustTokensView = (request) => {
        const component = new NetworkComponents.RequestTrustTokensView.RequestTrustTokensView(request);
        renderElementIntoDOM(component);
        void component.render();
        return component;
    };
    it('renders the RefreshPolicy for redemptions', () => {
        const component = renderRequestTrustTokensView(makeRequest({
            operation: "Redemption" /* Protocol.Network.TrustTokenOperationType.Redemption */,
            refreshPolicy: "UseCached" /* Protocol.Network.TrustTokenParamsRefreshPolicy.UseCached */,
        }));
        const [typeSpan, refreshPolicySpan] = getElementsWithinComponent(component, 'devtools-report-value.code', HTMLElement);
        assert.strictEqual(typeSpan.textContent, 'Redemption');
        assert.strictEqual(refreshPolicySpan.textContent, 'UseCached');
    });
    it('renders all issuers as a list', () => {
        const expectedIssuers = ['example.org', 'foo.dev', 'bar.com'];
        const component = renderRequestTrustTokensView(makeRequest({
            operation: "Signing" /* Protocol.Network.TrustTokenOperationType.Signing */,
            issuers: expectedIssuers,
        }));
        const issuerElements = getElementsWithinComponent(component, 'ul.issuers-list > li', HTMLElement);
        const actualIssuers = [...issuerElements].map(e => e.textContent);
        assert.deepStrictEqual(actualIssuers.sort(), expectedIssuers.sort());
    });
    it('renders a result section with success status for successful requests', () => {
        const component = renderRequestTrustTokensView(makeRequest(undefined, {
            status: "Ok" /* Protocol.Network.TrustTokenOperationDoneEventStatus.Ok */,
            type: "Issuance" /* Protocol.Network.TrustTokenOperationType.Issuance */,
            requestId: mockId,
        }));
        const simpleText = getElementWithinComponent(component, 'span > strong', HTMLElement);
        assert.exists(simpleText);
        assert.strictEqual(simpleText.textContent, 'Success');
    });
    it('renders a result section with failure status for failed requests', () => {
        const component = renderRequestTrustTokensView(makeRequest(undefined, {
            status: "BadResponse" /* Protocol.Network.TrustTokenOperationDoneEventStatus.BadResponse */,
            type: "Issuance" /* Protocol.Network.TrustTokenOperationType.Issuance */,
            requestId: mockId,
        }));
        const simpleText = getElementWithinComponent(component, 'span > strong', HTMLElement);
        assert.exists(simpleText);
        assert.strictEqual(simpleText.textContent, 'Failure');
    });
});
//# sourceMappingURL=RequestTrustTokensView.test.js.map