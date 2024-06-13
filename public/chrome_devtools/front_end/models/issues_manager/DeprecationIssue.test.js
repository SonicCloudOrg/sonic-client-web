// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Issues from '../../panels/issues/issues.js';
import { describeWithLocale } from '../../testing/EnvironmentHelpers.js';
import { MockIssuesManager } from '../../testing/MockIssuesManager.js';
import { MockIssuesModel } from '../../testing/MockIssuesModel.js';
import * as IssuesManager from '../issues_manager/issues_manager.js';
describeWithLocale('DeprecationIssue', () => {
    const mockModel = new MockIssuesModel([]);
    const mockManager = new MockIssuesManager([]);
    function createDeprecationIssue(type) {
        return new IssuesManager.DeprecationIssue.DeprecationIssue({
            sourceCodeLocation: {
                url: 'empty.html',
                lineNumber: 1,
                columnNumber: 1,
            },
            type,
        }, mockModel);
    }
    function createDeprecationIssueDetails(type) {
        return {
            code: "DeprecationIssue" /* Protocol.Audits.InspectorIssueCode.DeprecationIssue */,
            details: {
                deprecationIssueDetails: {
                    sourceCodeLocation: {
                        url: 'empty.html',
                        lineNumber: 1,
                        columnNumber: 1,
                    },
                    type,
                },
            },
        };
    }
    it('normal deprecation issue works', () => {
        const details = createDeprecationIssueDetails('DeprecationExample');
        const issue = IssuesManager.DeprecationIssue.DeprecationIssue.fromInspectorIssue(mockModel, details);
        assert.isNotEmpty(issue);
    });
    it('aggregates issues with the same type', () => {
        const issues = [
            createDeprecationIssue('DeprecationExample'),
            createDeprecationIssue('DeprecationExample'),
        ];
        const aggregator = new Issues.IssueAggregator.IssueAggregator(mockManager);
        for (const issue of issues) {
            mockManager.dispatchEventToListeners("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, { issuesModel: mockModel, issue });
        }
        const aggregatedIssues = Array.from(aggregator.aggregatedIssues());
        assert.strictEqual(aggregatedIssues.length, 1);
        const deprecationIssues = Array.from(aggregatedIssues[0].getDeprecationIssues());
        assert.strictEqual(deprecationIssues.length, 2);
    });
    it('does not aggregate issues with different types', () => {
        const issues = [
            createDeprecationIssue('DeprecationExample'),
            createDeprecationIssue('CrossOriginWindowAlert'),
        ];
        const aggregator = new Issues.IssueAggregator.IssueAggregator(mockManager);
        for (const issue of issues) {
            mockManager.dispatchEventToListeners("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, { issuesModel: mockModel, issue });
        }
        const aggregatedIssues = Array.from(aggregator.aggregatedIssues());
        assert.strictEqual(aggregatedIssues.length, 2);
    });
});
//# sourceMappingURL=DeprecationIssue.test.js.map