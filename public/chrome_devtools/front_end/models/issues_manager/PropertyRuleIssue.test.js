// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Issues from '../../panels/issues/issues.js';
import { describeWithLocale } from '../../testing/EnvironmentHelpers.js';
import { MockIssuesManager } from '../../testing/MockIssuesManager.js';
import { MockIssuesModel } from '../../testing/MockIssuesModel.js';
import * as IssuesManager from '../issues_manager/issues_manager.js';
function createProtocolIssue(propertyRuleIssueDetails) {
    return {
        code: "PropertyRuleIssue" /* Protocol.Audits.InspectorIssueCode.PropertyRuleIssue */,
        details: { propertyRuleIssueDetails },
    };
}
describeWithLocale('PropertyRuleIssue', () => {
    const mockModel = new MockIssuesModel([]);
    const mockManager = new MockIssuesManager([]);
    it('can be created for property rules parsing failures', () => {
        const issueDetails = {
            sourceCodeLocation: {
                url: 'http://example.com',
                lineNumber: 2,
                columnNumber: 2,
            },
            propertyRuleIssueReason: "InvalidInitialValue" /* Protocol.Audits.PropertyRuleIssueReason.InvalidInitialValue */,
            propertyValue: 'invalid',
        };
        const issue = createProtocolIssue(issueDetails);
        const propertyRuleIssues = IssuesManager.PropertyRuleIssue.PropertyRuleIssue.fromInspectorIssue(mockModel, issue);
        assert.lengthOf(propertyRuleIssues, 1);
        const propertyRuleIssue = propertyRuleIssues[0];
        assert.strictEqual(propertyRuleIssue.getCategory(), "Other" /* IssuesManager.Issue.IssueCategory.Other */);
        assert.deepStrictEqual(propertyRuleIssue.sources(), [issueDetails.sourceCodeLocation]);
        assert.strictEqual(propertyRuleIssue.getKind(), "PageError" /* IssuesManager.Issue.IssueKind.PageError */);
        assert.isNotNull(propertyRuleIssue.getDescription());
        assert.strictEqual(propertyRuleIssue.getPropertyName(), 'initial-value');
    });
    it('only aggregates identical issues', () => {
        const issueDetails = [
            {
                sourceCodeLocation: {
                    url: 'http://example.com',
                    lineNumber: 2,
                    columnNumber: 2,
                },
                propertyRuleIssueReason: "InvalidInitialValue" /* Protocol.Audits.PropertyRuleIssueReason.InvalidInitialValue */,
                propertyValue: 'invalid',
            },
            {
                sourceCodeLocation: {
                    url: 'http://example.com',
                    lineNumber: 2,
                    columnNumber: 2,
                },
                propertyRuleIssueReason: "InvalidInitialValue" /* Protocol.Audits.PropertyRuleIssueReason.InvalidInitialValue */,
                propertyValue: 'invalid',
            },
            {
                sourceCodeLocation: {
                    url: 'http://example.com',
                    lineNumber: 2,
                    columnNumber: 2,
                },
                propertyRuleIssueReason: "InvalidInherits" /* Protocol.Audits.PropertyRuleIssueReason.InvalidInherits */,
                propertyValue: 'invalid',
            },
            {
                sourceCodeLocation: {
                    url: 'http://example.com',
                    lineNumber: 3,
                    columnNumber: 2,
                },
                propertyRuleIssueReason: "InvalidInitialValue" /* Protocol.Audits.PropertyRuleIssueReason.InvalidInitialValue */,
                propertyValue: 'invalid',
            },
        ];
        const issues = issueDetails
            .map(details => IssuesManager.PropertyRuleIssue.PropertyRuleIssue.fromInspectorIssue(mockModel, createProtocolIssue(details)))
            .flat();
        assert.lengthOf(issues, 4);
        const aggregator = new Issues.IssueAggregator.IssueAggregator(mockManager);
        for (const issue of issues) {
            mockManager.dispatchEventToListeners("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, { issuesModel: mockModel, issue });
        }
        const aggregatedIssues = Array.from(aggregator.aggregatedIssues());
        assert.lengthOf(aggregatedIssues, 3);
        // Use shallow comparison. We thus ensure the correct issues are aggregated:
        assert.strictEqual(Array.from(aggregatedIssues[0].sources())[0], issueDetails[0].sourceCodeLocation);
        assert.strictEqual(Array.from(aggregatedIssues[1].sources())[0], issueDetails[2].sourceCodeLocation);
        assert.strictEqual(Array.from(aggregatedIssues[2].sources())[0], issueDetails[3].sourceCodeLocation);
    });
});
//# sourceMappingURL=PropertyRuleIssue.test.js.map