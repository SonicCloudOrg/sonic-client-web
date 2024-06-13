// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { describeWithLocale } from '../../testing/EnvironmentHelpers.js';
import { MockIssuesModel } from '../../testing/MockIssuesModel.js';
import * as IssuesManager from '../issues_manager/issues_manager.js';
describeWithLocale('GenericIssue', () => {
    const mockModel = new MockIssuesModel([]);
    function createProtocolIssueWithoutDetails() {
        return {
            code: "GenericIssue" /* Protocol.Audits.InspectorIssueCode.GenericIssue */,
            details: {},
        };
    }
    function createProtocolIssueWithDetails(genericIssueDetails) {
        return {
            code: "GenericIssue" /* Protocol.Audits.InspectorIssueCode.GenericIssue */,
            details: { genericIssueDetails },
        };
    }
    beforeEach(() => {
        // The component warns if not provided with an issue that has details, but
        // we don't need that noise in the test output.
        sinon.stub(console, 'warn');
    });
    // TODO(crbug/1399414): Make this test reflect reality, cross origin errors do not have a violating node.
    it('adds a cross origin portal post message issue with valid details', () => {
        const issueDetails = {
            errorType: "CrossOriginPortalPostMessageError" /* Protocol.Audits.GenericIssueErrorType.CrossOriginPortalPostMessageError */,
            frameId: 'main',
            violatingNodeId: 1,
            violatingNodeAttribute: 'attribute',
        };
        const issue = createProtocolIssueWithDetails(issueDetails);
        const genericIssues = IssuesManager.GenericIssue.GenericIssue.fromInspectorIssue(mockModel, issue);
        assert.strictEqual(genericIssues.length, 1);
        const genericIssue = genericIssues[0];
        assert.strictEqual(genericIssue.getCategory(), "Generic" /* IssuesManager.Issue.IssueCategory.Generic */);
        assert.strictEqual(genericIssue.primaryKey(), `GenericIssue::CrossOriginPortalPostMessageError-(${'main'})-(1)-(attribute)-(no-request)`);
        assert.strictEqual(genericIssue.getKind(), "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */);
        assert.isNotNull(genericIssue.getDescription());
    });
    it('adds a cross origin portal post message issue without details', () => {
        const inspectorIssueWithoutGenericDetails = createProtocolIssueWithoutDetails();
        const genericIssues = IssuesManager.GenericIssue.GenericIssue.fromInspectorIssue(mockModel, inspectorIssueWithoutGenericDetails);
        assert.isEmpty(genericIssues);
    });
    it('adds a CORB/ORB issue with valid details', () => {
        const issueDetails = {
            errorType: "ResponseWasBlockedByORB" /* Protocol.Audits.GenericIssueErrorType.ResponseWasBlockedByORB */,
            request: { requestId: 'blabla' },
        };
        const issue = createProtocolIssueWithDetails(issueDetails);
        const genericIssues = IssuesManager.GenericIssue.GenericIssue.fromInspectorIssue(mockModel, issue);
        assert.strictEqual(genericIssues.length, 1);
        const genericIssue = genericIssues[0];
        assert.strictEqual(genericIssue.getCategory(), "Generic" /* IssuesManager.Issue.IssueCategory.Generic */);
        assert.strictEqual(genericIssue.primaryKey(), 'GenericIssue::ResponseWasBlockedByORB-(undefined)-(undefined)-(undefined)-(blabla)');
        assert.strictEqual(genericIssue.getKind(), "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */);
        assert.isNotNull(genericIssue.getDescription());
    });
});
//# sourceMappingURL=GenericIssue.test.js.map