// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget, stubNoopSettings } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, setMockConnectionResponseHandler, } from '../../testing/MockConnection.js';
import { createResource, getMainFrame } from '../../testing/ResourceTreeHelpers.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Application from './application.js';
class SharedStorageTreeElementListener {
    #sidebar;
    #originsAdded = new Array();
    constructor(sidebar) {
        this.#sidebar = sidebar;
        this.#sidebar.sharedStorageTreeElementDispatcher.addEventListener("SharedStorageTreeElementAdded" /* Application.ApplicationPanelSidebar.SharedStorageTreeElementDispatcher.Events.SharedStorageTreeElementAdded */, this.#treeElementAdded, this);
    }
    dispose() {
        this.#sidebar.sharedStorageTreeElementDispatcher.removeEventListener("SharedStorageTreeElementAdded" /* Application.ApplicationPanelSidebar.SharedStorageTreeElementDispatcher.Events.SharedStorageTreeElementAdded */, this.#treeElementAdded, this);
    }
    #treeElementAdded(event) {
        this.#originsAdded.push(event.data.origin);
    }
    async waitForElementsAdded(expectedCount) {
        while (this.#originsAdded.length < expectedCount) {
            await this.#sidebar.sharedStorageTreeElementDispatcher.once("SharedStorageTreeElementAdded" /* Application.ApplicationPanelSidebar.SharedStorageTreeElementDispatcher.Events.SharedStorageTreeElementAdded */);
        }
    }
}
describeWithMockConnection('ApplicationPanelSidebar', () => {
    let target;
    const TEST_ORIGIN_A = 'http://www.example.com/';
    const TEST_ORIGIN_B = 'http://www.example.org/';
    const TEST_ORIGIN_C = 'http://www.example.net/';
    const ID = 'AA';
    const EVENTS = [
        {
            accessTime: 0,
            type: "documentAppend" /* Protocol.Storage.SharedStorageAccessType.DocumentAppend */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_A,
            params: { key: 'key0', value: 'value0' },
        },
        {
            accessTime: 10,
            type: "workletGet" /* Protocol.Storage.SharedStorageAccessType.WorkletGet */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_A,
            params: { key: 'key0' },
        },
        {
            accessTime: 15,
            type: "workletLength" /* Protocol.Storage.SharedStorageAccessType.WorkletLength */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_A,
            params: {},
        },
        {
            accessTime: 20,
            type: "documentClear" /* Protocol.Storage.SharedStorageAccessType.DocumentClear */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_C,
            params: {},
        },
        {
            accessTime: 100,
            type: "workletSet" /* Protocol.Storage.SharedStorageAccessType.WorkletSet */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_C,
            params: { key: 'key0', value: 'value1', ignoreIfPresent: true },
        },
        {
            accessTime: 150,
            type: "workletRemainingBudget" /* Protocol.Storage.SharedStorageAccessType.WorkletRemainingBudget */,
            mainFrameId: ID,
            ownerOrigin: TEST_ORIGIN_C,
            params: {},
        },
    ];
    beforeEach(() => {
        stubNoopSettings();
        SDK.ChildTargetManager.ChildTargetManager.install();
        const tabTarget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTarget, subtype: 'prerender' });
        target = createTarget({ parentTarget: tabTarget });
        Root.Runtime.experiments.register("preloading-status-panel" /* Root.Runtime.ExperimentName.PRELOADING_STATUS_PANEL */, '', false);
        sinon.stub(UI.ViewManager.ViewManager.instance(), 'showView').resolves(); // Silence console error
        setMockConnectionResponseHandler('Storage.getSharedStorageEntries', () => ({}));
        setMockConnectionResponseHandler('Storage.setSharedStorageTracking', () => ({}));
    });
    // Flaking on multiple bots on CQ.
    it.skip('[crbug.com/1472237] shows cookies for all frames', async () => {
        Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
        const sidebar = await Application.ResourcesPanel.ResourcesPanel.showAndGetSidebar();
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        assert.exists(resourceTreeModel);
        sinon.stub(resourceTreeModel, 'frames').returns([
            {
                url: 'http://www.example.com/',
                unreachableUrl: () => null,
                resourceTreeModel: () => resourceTreeModel,
            },
            {
                url: 'http://www.example.com/admin/',
                unreachableUrl: () => null,
                resourceTreeModel: () => resourceTreeModel,
            },
            {
                url: 'http://www.example.org/',
                unreachableUrl: () => null,
                resourceTreeModel: () => resourceTreeModel,
            },
        ]);
        resourceTreeModel.dispatchEventToListeners(SDK.ResourceTreeModel.Events.CachedResourcesLoaded, resourceTreeModel);
        assert.strictEqual(sidebar.cookieListTreeElement.childCount(), 2);
        assert.deepStrictEqual(sidebar.cookieListTreeElement.children().map(e => e.title), ['http://www.example.com', 'http://www.example.org']);
    });
    // Flaking on windows + subsequence test failing
    it.skip('[crbug.com/1472651] shows shared storages and events for origins using shared storage', async () => {
        const securityOriginManager = target.model(SDK.SecurityOriginManager.SecurityOriginManager);
        assert.exists(securityOriginManager);
        sinon.stub(securityOriginManager, 'securityOrigins').returns([
            TEST_ORIGIN_A,
            TEST_ORIGIN_B,
            TEST_ORIGIN_C,
        ]);
        const sharedStorageModel = target.model(Application.SharedStorageModel.SharedStorageModel);
        assert.exists(sharedStorageModel);
        const setTrackingSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageTracking').resolves({
            getError: () => undefined,
        });
        Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
        const sidebar = await Application.ResourcesPanel.ResourcesPanel.showAndGetSidebar();
        const listener = new SharedStorageTreeElementListener(sidebar);
        const addedPromise = listener.waitForElementsAdded(3);
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        assert.exists(resourceTreeModel);
        resourceTreeModel.dispatchEventToListeners(SDK.ResourceTreeModel.Events.CachedResourcesLoaded, resourceTreeModel);
        await addedPromise;
        assert.isTrue(setTrackingSpy.calledOnceWithExactly({ enable: true }));
        assert.strictEqual(sidebar.sharedStorageListTreeElement.childCount(), 3);
        assert.deepStrictEqual(sidebar.sharedStorageListTreeElement.children().map(e => e.title), [
            TEST_ORIGIN_A,
            TEST_ORIGIN_B,
            TEST_ORIGIN_C,
        ]);
        sidebar.sharedStorageListTreeElement.view.setDefaultIdForTesting(ID);
        for (const event of EVENTS) {
            sharedStorageModel.dispatchEventToListeners("SharedStorageAccess" /* Application.SharedStorageModel.Events.SharedStorageAccess */, event);
        }
        assert.deepEqual(sidebar.sharedStorageListTreeElement.view.getEventsForTesting(), EVENTS);
    });
    async function getExpectedCall(expectedCall) {
        Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
        const sidebar = await Application.ResourcesPanel.ResourcesPanel.showAndGetSidebar();
        const components = expectedCall.split('.');
        assert.strictEqual(components.length, 2);
        // @ts-ignore
        const object = sidebar[components[0]];
        assert.exists(object);
        return sinon.spy(object, components[1]);
    }
    const MOCK_EVENT_ITEM = {
        addEventListener: () => { },
        securityOrigin: 'https://example.com',
        databaseId: new Application.IndexedDBModel.DatabaseId({ storageKey: '' }, ''),
    };
    const testUiUpdate = (event, modelClass, expectedCallString, inScope) => async () => {
        SDK.TargetManager.TargetManager.instance().setScopeTarget(inScope ? target : null);
        const expectedCall = await getExpectedCall(expectedCallString);
        const model = target.model(modelClass);
        assert.exists(model);
        const data = [{ ...MOCK_EVENT_ITEM, model }];
        model.dispatchEventToListeners(event, ...data);
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.strictEqual(expectedCall.called, inScope);
    };
    it('adds interest group event on in scope event', testUiUpdate("InterestGroupAccess" /* Application.InterestGroupStorageModel.Events.InterestGroupAccess */, Application.InterestGroupStorageModel.InterestGroupStorageModel, 'interestGroupTreeElement.addEvent', true));
    it('does not add interest group event on out of scope event', testUiUpdate("InterestGroupAccess" /* Application.InterestGroupStorageModel.Events.InterestGroupAccess */, Application.InterestGroupStorageModel.InterestGroupStorageModel, 'interestGroupTreeElement.addEvent', false));
    it('adds DOM storage on in scope event', testUiUpdate("DOMStorageAdded" /* Application.DOMStorageModel.Events.DOMStorageAdded */, Application.DOMStorageModel.DOMStorageModel, 'sessionStorageListTreeElement.appendChild', true));
    it('does not add DOM storage on out of scope event', testUiUpdate("DOMStorageAdded" /* Application.DOMStorageModel.Events.DOMStorageAdded */, Application.DOMStorageModel.DOMStorageModel, 'sessionStorageListTreeElement.appendChild', false));
    it('adds indexed DB on in scope event', testUiUpdate(Application.IndexedDBModel.Events.DatabaseAdded, Application.IndexedDBModel.IndexedDBModel, 'indexedDBListTreeElement.appendChild', true));
    it('does not add indexed DB on out of scope event', testUiUpdate(Application.IndexedDBModel.Events.DatabaseAdded, Application.IndexedDBModel.IndexedDBModel, 'indexedDBListTreeElement.appendChild', false));
    it('adds shared storage on in scope event', testUiUpdate("SharedStorageAdded" /* Application.SharedStorageModel.Events.SharedStorageAdded */, Application.SharedStorageModel.SharedStorageModel, 'sharedStorageListTreeElement.appendChild', true));
    it('does not add shared storage on out of scope event', testUiUpdate("SharedStorageAdded" /* Application.SharedStorageModel.Events.SharedStorageAdded */, Application.SharedStorageModel.SharedStorageModel, 'sharedStorageListTreeElement.appendChild', false));
    const MOCK_GETTER_ITEM = {
        ...MOCK_EVENT_ITEM,
        ...MOCK_EVENT_ITEM.databaseId,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testUiUpdateOnScopeChange = (modelClass, getter, expectedCallString) => async () => {
        SDK.TargetManager.TargetManager.instance().setScopeTarget(null);
        const expectedCall = await getExpectedCall(expectedCallString);
        const model = target.model(modelClass);
        assert.exists(model);
        sinon.stub(model, getter).returns([MOCK_GETTER_ITEM]);
        SDK.TargetManager.TargetManager.instance().setScopeTarget(target);
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.strictEqual(expectedCall.called, true);
    };
    it('adds DOM storage element after scope change', testUiUpdateOnScopeChange(Application.DOMStorageModel.DOMStorageModel, 'storages', 'sessionStorageListTreeElement.appendChild'));
    it('adds shared storage after scope change', testUiUpdateOnScopeChange(Application.SharedStorageModel.SharedStorageModel, 'storages', 'sharedStorageListTreeElement.appendChild'));
    it('adds indexed db after scope change', testUiUpdateOnScopeChange(Application.IndexedDBModel.IndexedDBModel, 'databases', 'indexedDBListTreeElement.appendChild'));
});
describeWithMockConnection('IDBDatabaseTreeElement', () => {
    beforeEach(() => {
        stubNoopSettings();
        Root.Runtime.experiments.register("preloading-status-panel" /* Root.Runtime.ExperimentName.PRELOADING_STATUS_PANEL */, '', false);
    });
    it('only becomes selectable after database is updated', () => {
        const target = createTarget();
        const model = target.model(Application.IndexedDBModel.IndexedDBModel);
        assert.exists(model);
        const panel = Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
        const databaseId = new Application.IndexedDBModel.DatabaseId({ storageKey: '' }, '');
        const treeElement = new Application.ApplicationPanelSidebar.IDBDatabaseTreeElement(panel, model, databaseId);
        assert.isFalse(treeElement.selectable);
        treeElement.update(new Application.IndexedDBModel.Database(databaseId, 1), false);
        assert.isTrue(treeElement.selectable);
    });
});
describeWithMockConnection('ResourcesSection', () => {
    const tests = (inScope) => () => {
        let target;
        beforeEach(() => {
            stubNoopSettings();
            Root.Runtime.experiments.register("preloading-status-panel" /* Root.Runtime.ExperimentName.PRELOADING_STATUS_PANEL */, '', false);
            SDK.FrameManager.FrameManager.instance({ forceNew: true });
            target = createTarget();
        });
        it('adds tree elements for a frame and resource', () => {
            SDK.TargetManager.TargetManager.instance().setScopeTarget(inScope ? target : null);
            const panel = Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
            const treeElement = new UI.TreeOutline.TreeElement();
            new Application.ApplicationPanelSidebar.ResourcesSection(panel, treeElement);
            const model = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
            assert.exists(model);
            assert.strictEqual(treeElement.childCount(), 0);
            const frame = getMainFrame(target);
            const url = 'http://example.com';
            assert.strictEqual(treeElement.firstChild()?.childCount() ?? 0, 0);
            createResource(frame, url, 'text/html', '');
            assert.strictEqual(treeElement.firstChild()?.childCount() ?? 0, inScope ? 1 : 0);
        });
        it('picks up existing frames and resource', () => {
            SDK.TargetManager.TargetManager.instance().setScopeTarget(null);
            const panel = Application.ResourcesPanel.ResourcesPanel.instance({ forceNew: true });
            const treeElement = new UI.TreeOutline.TreeElement();
            new Application.ApplicationPanelSidebar.ResourcesSection(panel, treeElement);
            const url = 'http://example.com';
            createResource(getMainFrame(target), url, 'text/html', '');
            assert.strictEqual(treeElement.firstChild()?.childCount() ?? 0, 0);
            assert.strictEqual(treeElement.childCount(), 0);
            SDK.TargetManager.TargetManager.instance().setScopeTarget(inScope ? target : null);
            assert.strictEqual(treeElement.childCount(), inScope ? 1 : 0);
            assert.strictEqual(treeElement.firstChild()?.childCount() ?? 0, inScope ? 1 : 0);
        });
    };
    describe('in scope', tests(true));
    describe('out of scope', tests(false));
});
//# sourceMappingURL=ApplicationPanelSidebar.test.js.map