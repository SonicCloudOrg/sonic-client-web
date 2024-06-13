// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createFakeSetting, createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, dispatchEvent } from '../../testing/MockConnection.js';
import { activate, getMainFrame, navigate } from '../../testing/ResourceTreeHelpers.js';
import { mkInspectorCspIssue, StubIssue, ThirdPartyStubIssue, } from '../../testing/StubIssue.js';
import * as IssuesManager from '../issues_manager/issues_manager.js';
describeWithMockConnection('IssuesManager', () => {
    let target;
    let model;
    beforeEach(() => {
        target = createTarget();
        const maybeModel = target.model(SDK.IssuesModel.IssuesModel);
        assert.exists(maybeModel);
        model = maybeModel;
    });
    it('collects issues from an issues model', () => {
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        const dispatchedIssues = [];
        issuesManager.addEventListener("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, event => dispatchedIssues.push(event.data.issue));
        model.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: model, inspectorIssue: mkInspectorCspIssue('url1') });
        model.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: model, inspectorIssue: mkInspectorCspIssue('url2') });
        const expected = ['ContentSecurityPolicyIssue::kURLViolation', 'ContentSecurityPolicyIssue::kURLViolation'];
        assert.deepStrictEqual(dispatchedIssues.map(i => i.code()), expected);
        const issueCodes = Array.from(issuesManager.issues()).map(r => r.code());
        assert.deepStrictEqual(issueCodes, expected);
    });
    function getBlockedUrl(issue) {
        const cspIssue = issue;
        return cspIssue.details().blockedURL;
    }
    function assertOutOfScopeIssuesAreFiltered() {
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        const dispatchedIssues = [];
        issuesManager.addEventListener("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, event => dispatchedIssues.push(event.data.issue));
        model.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: model, inspectorIssue: mkInspectorCspIssue('url1') });
        const prerenderTarget = createTarget({ subtype: 'prerender' });
        const prerenderModel = prerenderTarget.model(SDK.IssuesModel.IssuesModel);
        assert.exists(prerenderModel);
        prerenderModel.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: prerenderModel, inspectorIssue: mkInspectorCspIssue('url2') });
        const expected = ['url1'];
        assert.deepStrictEqual(dispatchedIssues.map(getBlockedUrl), expected);
        assert.deepStrictEqual(Array.from(issuesManager.issues()).map(getBlockedUrl), expected);
        return { issuesManager, prerenderTarget };
    }
    it('updates filtered issues when switching scope', () => {
        const { issuesManager, prerenderTarget } = assertOutOfScopeIssuesAreFiltered();
        SDK.TargetManager.TargetManager.instance().setScopeTarget(prerenderTarget);
        assert.deepStrictEqual(Array.from(issuesManager.issues()).map(getBlockedUrl), ['url2']);
    });
    it('keeps issues of prerendered page upon activation', () => {
        const { issuesManager, prerenderTarget } = assertOutOfScopeIssuesAreFiltered();
        SDK.TargetManager.TargetManager.instance().setScopeTarget(prerenderTarget);
        activate(prerenderTarget);
        assert.deepStrictEqual(Array.from(issuesManager.issues()).map(getBlockedUrl), ['url2']);
    });
    const updatesOnPrimaryPageChange = (primary) => () => {
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        model.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: model, inspectorIssue: mkInspectorCspIssue('url1') });
        assert.strictEqual(issuesManager.numberOfIssues(), 1);
        navigate(getMainFrame(primary ? target : createTarget({ subtype: 'prerender' })));
        assert.strictEqual(issuesManager.numberOfIssues(), primary ? 0 : 1);
    };
    it('clears issues after primary page navigation', updatesOnPrimaryPageChange(true));
    it('does not clear issues after non-primary page navigation', updatesOnPrimaryPageChange(false));
    it('filters third-party issues when the third-party issues setting is false, includes them otherwise', () => {
        const issues = [
            new ThirdPartyStubIssue('AllowedStubIssue1', false),
            new ThirdPartyStubIssue('StubIssue2', true),
            new ThirdPartyStubIssue('AllowedStubIssue3', false),
            new ThirdPartyStubIssue('StubIssue4', true),
        ];
        const showThirdPartyIssuesSetting = createFakeSetting('third party flag', false);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager(showThirdPartyIssuesSetting);
        const firedIssueAddedEventCodes = [];
        issuesManager.addEventListener("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, event => firedIssueAddedEventCodes.push(event.data.issue.code()));
        for (const issue of issues) {
            issuesManager.addIssue(model, issue);
        }
        let issueCodes = Array.from(issuesManager.issues()).map(i => i.code());
        assert.deepStrictEqual(issueCodes, ['AllowedStubIssue1', 'AllowedStubIssue3']);
        assert.deepStrictEqual(firedIssueAddedEventCodes, ['AllowedStubIssue1', 'AllowedStubIssue3']);
        showThirdPartyIssuesSetting.set(true);
        issueCodes = Array.from(issuesManager.issues()).map(i => i.code());
        assert.deepStrictEqual(issueCodes, ['AllowedStubIssue1', 'StubIssue2', 'AllowedStubIssue3', 'StubIssue4']);
    });
    it('reports issue counts by kind', () => {
        const issue1 = new StubIssue('StubIssue1', ['id1'], [], "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */);
        const issue2 = new StubIssue('StubIssue1', ['id2'], [], "Improvement" /* IssuesManager.Issue.IssueKind.Improvement */);
        const issue3 = new StubIssue('StubIssue1', ['id3'], [], "BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        issuesManager.addIssue(model, issue1);
        issuesManager.addIssue(model, issue2);
        issuesManager.addIssue(model, issue3);
        assert.deepStrictEqual(issuesManager.numberOfIssues(), 3);
        assert.deepStrictEqual(issuesManager.numberOfIssues("Improvement" /* IssuesManager.Issue.IssueKind.Improvement */), 2);
        assert.deepStrictEqual(issuesManager.numberOfIssues("BreakingChange" /* IssuesManager.Issue.IssueKind.BreakingChange */), 1);
        assert.deepStrictEqual(issuesManager.numberOfIssues("PageError" /* IssuesManager.Issue.IssueKind.PageError */), 0);
    });
    describe('instance', () => {
        it('throws an Error if its not the first instance created with "ensureFirst" set', () => {
            IssuesManager.IssuesManager.IssuesManager.instance();
            assert.throws(() => IssuesManager.IssuesManager.IssuesManager.instance({ forceNew: true, ensureFirst: true }));
            assert.throws(() => IssuesManager.IssuesManager.IssuesManager.instance({ forceNew: false, ensureFirst: true }));
        });
    });
    it('hides issues added after setting has been initialised', () => {
        const issues = [
            new StubIssue('HiddenStubIssue1', [], []),
            new StubIssue('HiddenStubIssue2', [], []),
            new StubIssue('UnhiddenStubIssue1', [], []),
            new StubIssue('UnhiddenStubIssue2', [], []),
        ];
        const hideIssueByCodeSetting = createFakeSetting('hide by code', {});
        const showThirdPartyIssuesSetting = createFakeSetting('third party flag', true);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager(showThirdPartyIssuesSetting, hideIssueByCodeSetting);
        const hiddenIssues = [];
        issuesManager.addEventListener("IssueAdded" /* IssuesManager.IssuesManager.Events.IssueAdded */, event => {
            if (event.data.issue.isHidden()) {
                hiddenIssues.push(event.data.issue.code());
            }
        });
        // This Setting can either have been initialised in a previous Devtools session and retained
        // through to a new session.
        // OR
        // These settings have been updated by clicking on "hide issue" and cause the updateHiddenIssues
        // method to be called. These issues are being added to the IssuesManager after this has happened.
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        for (const issue of issues) {
            issuesManager.addIssue(model, issue);
        }
        assert.deepStrictEqual(hiddenIssues, ['HiddenStubIssue1', 'HiddenStubIssue2']);
    });
    it('hides issues present in IssuesManager when setting is updated', () => {
        const issues = [
            new StubIssue('HiddenStubIssue1', [], []),
            new StubIssue('HiddenStubIssue2', [], []),
            new StubIssue('UnhiddenStubIssue1', [], []),
            new StubIssue('UnhiddenStubIssue2', [], []),
        ];
        const hideIssueByCodeSetting = createFakeSetting('hide by code', {});
        const showThirdPartyIssuesSetting = createFakeSetting('third party flag', true);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager(showThirdPartyIssuesSetting, hideIssueByCodeSetting);
        let hiddenIssues = [];
        issuesManager.addEventListener("FullUpdateRequired" /* IssuesManager.IssuesManager.Events.FullUpdateRequired */, () => {
            hiddenIssues = [];
            for (const issue of issuesManager.issues()) {
                if (issue.isHidden()) {
                    hiddenIssues.push(issue.code());
                }
            }
        });
        for (const issue of issues) {
            issuesManager.addIssue(model, issue);
        }
        // Setting is updated by clicking on "hide issue".
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        assert.deepStrictEqual(hiddenIssues, ['HiddenStubIssue1']);
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        assert.deepStrictEqual(hiddenIssues, ['HiddenStubIssue1', 'HiddenStubIssue2']);
    });
    it('unhides issues present in IssuesManager when setting is updated', () => {
        const issues = [
            new StubIssue('HiddenStubIssue1', [], []),
            new StubIssue('HiddenStubIssue2', [], []),
            new StubIssue('UnhiddenStubIssue1', [], []),
            new StubIssue('UnhiddenStubIssue2', [], []),
        ];
        const hideIssueByCodeSetting = createFakeSetting('hide by code', {});
        const showThirdPartyIssuesSetting = createFakeSetting('third party flag', true);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager(showThirdPartyIssuesSetting, hideIssueByCodeSetting);
        for (const issue of issues) {
            issuesManager.addIssue(model, issue);
        }
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        let unhiddenIssues = [];
        issuesManager.addEventListener("FullUpdateRequired" /* IssuesManager.IssuesManager.Events.FullUpdateRequired */, () => {
            unhiddenIssues = [];
            for (const issue of issuesManager.issues()) {
                if (!issue.isHidden()) {
                    unhiddenIssues.push(issue.code());
                }
            }
        });
        // Setting updated by clicking on "unhide issue"
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue1': "Unhidden" /* IssuesManager.IssuesManager.IssueStatus.Unhidden */,
            'UnhiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        assert.deepStrictEqual(unhiddenIssues, ['UnhiddenStubIssue1']);
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue1': "Unhidden" /* IssuesManager.IssuesManager.IssueStatus.Unhidden */,
            'UnhiddenStubIssue2': "Unhidden" /* IssuesManager.IssuesManager.IssueStatus.Unhidden */,
        });
        assert.deepStrictEqual(unhiddenIssues, ['UnhiddenStubIssue1', 'UnhiddenStubIssue2']);
    });
    it('unhides all issues correctly', () => {
        const issues = [
            new StubIssue('HiddenStubIssue1', [], []),
            new StubIssue('HiddenStubIssue2', [], []),
            new StubIssue('UnhiddenStubIssue1', [], []),
            new StubIssue('UnhiddenStubIssue2', [], []),
        ];
        const hideIssueByCodeSetting = createFakeSetting('hide by code', {});
        const showThirdPartyIssuesSetting = createFakeSetting('third party flag', true);
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager(showThirdPartyIssuesSetting, hideIssueByCodeSetting);
        for (const issue of issues) {
            issuesManager.addIssue(model, issue);
        }
        hideIssueByCodeSetting.set({
            'HiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'HiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue1': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
            'UnhiddenStubIssue2': "Hidden" /* IssuesManager.IssuesManager.IssueStatus.Hidden */,
        });
        let unhiddenIssues = [];
        issuesManager.addEventListener("FullUpdateRequired" /* IssuesManager.IssuesManager.Events.FullUpdateRequired */, () => {
            unhiddenIssues = [];
            for (const issue of issuesManager.issues()) {
                if (!issue.isHidden()) {
                    unhiddenIssues.push(issue.code());
                }
            }
        });
        issuesManager.unhideAllIssues();
        assert.deepStrictEqual(unhiddenIssues, ['HiddenStubIssue1', 'HiddenStubIssue2', 'UnhiddenStubIssue1', 'UnhiddenStubIssue2']);
    });
    it('send update event on scope change', async () => {
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        const updateRequired = issuesManager.once("FullUpdateRequired" /* IssuesManager.IssuesManager.Events.FullUpdateRequired */);
        const anotherTarget = createTarget();
        SDK.TargetManager.TargetManager.instance().setScopeTarget(anotherTarget);
        await updateRequired;
    });
    it('clears BounceTrackingIssue only on user-initiated navigation', () => {
        const issuesManager = new IssuesManager.IssuesManager.IssuesManager();
        const issue = {
            code: "BounceTrackingIssue" /* Protocol.Audits.InspectorIssueCode.BounceTrackingIssue */,
            details: {
                bounceTrackingIssueDetails: {
                    trackingSites: ['example_1.test'],
                },
            },
        };
        model.dispatchEventToListeners("IssueAdded" /* SDK.IssuesModel.Events.IssueAdded */, { issuesModel: model, inspectorIssue: issue });
        assert.strictEqual(issuesManager.numberOfIssues(), 1);
        dispatchEvent(target, 'Network.requestWillBeSent', {
            requestId: 'requestId1',
            loaderId: 'loaderId1',
            request: { url: 'http://example.com' },
            hasUserGesture: false,
        });
        const frame = getMainFrame(target);
        navigate(frame, { loaderId: 'loaderId1' });
        assert.strictEqual(issuesManager.numberOfIssues(), 1);
        dispatchEvent(target, 'Network.requestWillBeSent', {
            requestId: 'requestId2',
            loaderId: 'loaderId2',
            request: { url: 'http://example.com/page' },
            hasUserGesture: true,
        });
        navigate(frame, { loaderId: 'loaderId2' });
        assert.strictEqual(issuesManager.numberOfIssues(), 0);
    });
});
//# sourceMappingURL=IssuesManager.test.js.map