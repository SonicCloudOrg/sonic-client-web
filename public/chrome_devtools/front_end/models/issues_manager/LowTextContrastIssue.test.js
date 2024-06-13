// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Issues from '../../panels/issues/issues.js';
import { MockIssuesManager } from '../../testing/MockIssuesManager.js';
import { MockIssuesModel } from '../../testing/MockIssuesModel.js';
import * as IssuesManager from '../issues_manager/issues_manager.js';
describe('LowTextContrastIssue', () => {
    it('aggregates multiple issues with duplicates correctly', () => {
        const mockModel = new MockIssuesModel([]);
        const mockManager = new MockIssuesManager([]);
        const commonDetails = {
            violatingNodeSelector: 'div',
            contrastRatio: 1,
            thresholdAA: 1,
            thresholdAAA: 1,
            fontSize: '14px',
            fontWeight: '500',
        };
        const issueDetails = [
            {
                ...commonDetails,
                violatingNodeId: 1,
            },
            {
                ...commonDetails,
                violatingNodeId: 2,
            },
            {
                ...commonDetails,
                violatingNodeId: 3,
            },
        ];
        const issues = issueDetails.map(details => new IssuesManager.LowTextContrastIssue.LowTextContrastIssue(details, mockModel));
        const aggregator = new Issues.IssueAggregator.IssueAggregator(mockManager);
        for (const issue of issues) {
            mockManager.dispatchEventToListeners("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, { issuesModel: mockModel, issue });
        }
        const aggregatedIssues = Array.from(aggregator.aggregatedIssues());
        assert.strictEqual(aggregatedIssues.length, 1);
        const lowContrastIssues = Array.from(aggregatedIssues[0].getLowContrastIssues());
        assert.strictEqual(lowContrastIssues.length, 3);
        const violatingNodeIds = [];
        for (const contrastIssue of lowContrastIssues) {
            violatingNodeIds.push(contrastIssue.details().violatingNodeId);
        }
        violatingNodeIds.sort();
        assert.deepEqual(violatingNodeIds, [1, 2, 3]);
    });
});
//# sourceMappingURL=LowTextContrastIssue.test.js.map