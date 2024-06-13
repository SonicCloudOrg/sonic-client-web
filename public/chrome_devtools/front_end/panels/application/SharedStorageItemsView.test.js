// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { dispatchClickEvent, dispatchKeyDownEvent, getCleanTextContentFromElements, raf, } from '../../testing/DOMHelpers.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, } from '../../testing/MockConnection.js';
import * as Coordinator from '../../ui/components/render_coordinator/render_coordinator.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Resources from './application.js';
var View = Resources.SharedStorageItemsView;
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
class SharedStorageItemsListener {
    #dispatcher;
    #cleared = false;
    #filteredCleared = false;
    #refreshed = false;
    #deletedKeys = [];
    #editedEvents = [];
    constructor(dispatcher) {
        this.#dispatcher = dispatcher;
        this.#dispatcher.addEventListener("ItemsCleared" /* View.SharedStorageItemsDispatcher.Events.ItemsCleared */, this.#itemsCleared, this);
        this.#dispatcher.addEventListener("FilteredItemsCleared" /* View.SharedStorageItemsDispatcher.Events.FilteredItemsCleared */, this.#filteredItemsCleared, this);
        this.#dispatcher.addEventListener("ItemsRefreshed" /* View.SharedStorageItemsDispatcher.Events.ItemsRefreshed */, this.#itemsRefreshed, this);
        this.#dispatcher.addEventListener("ItemDeleted" /* View.SharedStorageItemsDispatcher.Events.ItemDeleted */, this.#itemDeleted, this);
        this.#dispatcher.addEventListener("ItemEdited" /* View.SharedStorageItemsDispatcher.Events.ItemEdited */, this.#itemEdited, this);
    }
    dispose() {
        this.#dispatcher.removeEventListener("ItemsCleared" /* View.SharedStorageItemsDispatcher.Events.ItemsCleared */, this.#itemsCleared, this);
        this.#dispatcher.removeEventListener("FilteredItemsCleared" /* View.SharedStorageItemsDispatcher.Events.FilteredItemsCleared */, this.#filteredItemsCleared, this);
        this.#dispatcher.removeEventListener("ItemsRefreshed" /* View.SharedStorageItemsDispatcher.Events.ItemsRefreshed */, this.#itemsRefreshed, this);
        this.#dispatcher.removeEventListener("ItemDeleted" /* View.SharedStorageItemsDispatcher.Events.ItemDeleted */, this.#itemDeleted, this);
        this.#dispatcher.removeEventListener("ItemEdited" /* View.SharedStorageItemsDispatcher.Events.ItemEdited */, this.#itemEdited, this);
    }
    get deletedKeys() {
        return this.#deletedKeys;
    }
    get editedEvents() {
        return this.#editedEvents;
    }
    resetRefreshed() {
        this.#refreshed = false;
    }
    #itemsCleared() {
        this.#cleared = true;
    }
    #filteredItemsCleared() {
        this.#filteredCleared = true;
    }
    #itemsRefreshed() {
        this.#refreshed = true;
    }
    #itemDeleted(event) {
        this.#deletedKeys.push(event.data.key);
    }
    #itemEdited(event) {
        this.#editedEvents.push(event.data);
    }
    async waitForItemsCleared() {
        if (!this.#cleared) {
            await this.#dispatcher.once("ItemsCleared" /* View.SharedStorageItemsDispatcher.Events.ItemsCleared */);
        }
        this.#cleared = true;
    }
    async waitForFilteredItemsCleared() {
        if (!this.#filteredCleared) {
            await this.#dispatcher.once("FilteredItemsCleared" /* View.SharedStorageItemsDispatcher.Events.FilteredItemsCleared */);
        }
        this.#filteredCleared = true;
    }
    async waitForItemsRefreshed() {
        if (!this.#refreshed) {
            await this.#dispatcher.once("ItemsRefreshed" /* View.SharedStorageItemsDispatcher.Events.ItemsRefreshed */);
        }
        this.#refreshed = true;
    }
    async waitForItemsDeletedTotal(total) {
        while (this.#deletedKeys.length < total) {
            await this.#dispatcher.once("ItemDeleted" /* View.SharedStorageItemsDispatcher.Events.ItemDeleted */);
        }
    }
    async waitForItemsEditedTotal(total) {
        while (this.#editedEvents.length < total) {
            await this.#dispatcher.once("ItemEdited" /* View.SharedStorageItemsDispatcher.Events.ItemEdited */);
        }
    }
}
function selectNodeByKey(dataGrid, key) {
    for (const node of dataGrid.rootNode().children) {
        if (node?.data?.key === key) {
            node.select();
            return node;
        }
    }
    return null;
}
function getCellElementFromNodeAndColumnId(dataGrid, node, columnId) {
    const column = dataGrid.columns[columnId];
    const cellIndex = dataGrid.visibleColumnsArray.indexOf(column);
    return node.element()?.children[cellIndex] || null;
}
describeWithMockConnection('SharedStorageItemsView', function () {
    let target;
    let sharedStorageModel;
    let sharedStorage;
    const TEST_ORIGIN = 'http://a.test';
    const METADATA = {
        creationTime: 100,
        length: 3,
        remainingBudget: 2.5,
        bytesUsed: 30,
    };
    const METADATA_NO_ENTRIES = {
        creationTime: 100,
        length: 0,
        remainingBudget: 2.5,
        bytesUsed: 0,
    };
    const METADATA_2_ENTRIES = {
        creationTime: 100,
        length: 2,
        remainingBudget: 2.5,
        bytesUsed: 20,
    };
    const METADATA_4_ENTRIES = {
        creationTime: 100,
        length: 4,
        remainingBudget: 2.5,
        bytesUsed: 38,
    };
    const ENTRIES = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key2',
            value: 'b',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const ENTRIES_1 = [
        {
            key: 'key2',
            value: 'b',
        },
    ];
    const ENTRIES_2 = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const ENTRIES_KEY_EDITED_1 = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key0',
            value: 'b',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const ENTRIES_KEY_EDITED_2 = [
        {
            key: 'key1',
            value: 'b',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const ENTRIES_VALUE_EDITED = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key2',
            value: 'd',
        },
        {
            key: 'key3',
            value: 'c',
        },
    ];
    const ENTRIES_NEW_KEY = [
        {
            key: 'key1',
            value: 'a',
        },
        {
            key: 'key2',
            value: 'b',
        },
        {
            key: 'key3',
            value: 'c',
        },
        {
            key: 'key4',
            value: '',
        },
    ];
    beforeEach(() => {
        target = createTarget();
        sharedStorageModel = target.model(Resources.SharedStorageModel.SharedStorageModel);
        assert.exists(sharedStorageModel);
        sharedStorage = new Resources.SharedStorageModel.SharedStorageForOrigin(sharedStorageModel, TEST_ORIGIN);
        assert.strictEqual(sharedStorage.securityOrigin, TEST_ORIGIN);
    });
    it('displays metadata and entries', async () => {
        assert.exists(sharedStorageModel);
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        const metadataView = view.innerSplitWidget.sidebarWidget()?.contentElement.firstChild;
        assert.exists(metadataView);
        assert.isNotNull(metadataView.shadowRoot);
        await coordinator.done();
        const keys = getCleanTextContentFromElements(metadataView.shadowRoot, 'devtools-report-key');
        assert.deepEqual(keys, [
            'Origin',
            'Creation Time',
            'Number of Entries',
            'Number of Bytes Used',
            'Entropy Budget for Fenced Frames',
        ]);
        const values = getCleanTextContentFromElements(metadataView.shadowRoot, 'devtools-report-value');
        assert.deepEqual(values, [
            TEST_ORIGIN,
            (new Date(100 * 1e3)).toLocaleString(),
            '3',
            '30',
            '2.5',
        ]);
        view.detach();
    });
    it('displays metadata with placeholder message if origin is not using API', async () => {
        assert.exists(sharedStorageModel);
        sinon.stub(sharedStorage, 'getMetadata').resolves(null);
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            entries: [],
            getError: () => undefined,
        });
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.strictEqual(view.getEntriesForTesting().length, 0);
        const metadataView = view.innerSplitWidget.sidebarWidget()?.contentElement.firstChild;
        assert.exists(metadataView);
        assert.isNotNull(metadataView.shadowRoot);
        await coordinator.done();
        const keys = getCleanTextContentFromElements(metadataView.shadowRoot, 'devtools-report-key');
        assert.deepEqual(keys, [
            'Origin',
            'Creation Time',
            'Number of Entries',
            'Number of Bytes Used',
            'Entropy Budget for Fenced Frames',
        ]);
        const values = getCleanTextContentFromElements(metadataView.shadowRoot, 'devtools-report-value');
        assert.deepEqual(values, [
            TEST_ORIGIN,
            'Not yet created',
            '0',
            '0',
            '0',
        ]);
        view.detach();
    });
    it('has placeholder sidebar when there are no entries', async () => {
        assert.exists(sharedStorageModel);
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            metadata: METADATA_NO_ENTRIES,
            getError: () => undefined,
        });
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            entries: [],
            getError: () => undefined,
        });
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.notInstanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        assert.exists(view.contentElement.querySelector('.placeholder'));
        view.detach();
    });
    it('updates sidebarWidget upon receiving SelectedNode Event', async () => {
        assert.exists(sharedStorageModel);
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries')
            .withArgs({ ownerOrigin: TEST_ORIGIN })
            .resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        // Select the second row.
        assert.exists(selectNodeByKey(view.dataGrid, 'key2'));
        await raf();
        assert.instanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        view.detach();
    });
    it('refreshes when "Refresh" is clicked', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata').resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries').resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise1 = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise1;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Clicking "Refresh" will cause `getMetadata()` and `getEntries()` to be called.
        itemsListener.resetRefreshed();
        const refreshedPromise2 = itemsListener.waitForItemsRefreshed();
        dispatchClickEvent(view.refreshButton.element);
        await raf();
        await refreshedPromise2;
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        view.detach();
    });
    it('clears entries when "Delete All" is clicked', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA_NO_ENTRIES,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: [],
            getError: () => undefined,
        });
        const clearSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_clearSharedStorageEntries').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Clicking "Delete All" will cause `clear()`, `getMetadata()`, and `getEntries()` to be called.
        const clearedPromise = itemsListener.waitForItemsCleared();
        dispatchClickEvent(view.deleteAllButton.element);
        await raf();
        await clearedPromise;
        assert.isTrue(clearSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), []);
        view.detach();
    });
    it('clears filtered entries when "Delete All" is clicked with a filter set', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(3).resolves({
            metadata: METADATA_2_ENTRIES,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(4).resolves({
            metadata: METADATA_2_ENTRIES,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(2).resolves({
            entries: ENTRIES_2,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(3).resolves({
            entries: ENTRIES_2,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise1 = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise1;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Adding a filter to the text box will cause `getMetadata()`, and `getEntries()` to be called.
        itemsListener.resetRefreshed();
        const refreshedPromise2 = itemsListener.waitForItemsRefreshed();
        view.filterItem.dispatchEventToListeners("TextChanged" /* UI.Toolbar.ToolbarInput.Event.TextChanged */, 'b');
        await raf();
        await refreshedPromise2;
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        // Only the filtered entries are displayed.
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_1);
        // Clicking "Delete All" will cause `deleteEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const clearedPromise = itemsListener.waitForFilteredItemsCleared();
        dispatchClickEvent(view.deleteAllButton.element);
        await raf();
        await clearedPromise;
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key2' }));
        assert.strictEqual(getMetadataSpy.callCount, 4);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledThrice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        // The filtered entries are cleared.
        assert.deepEqual(view.getEntriesForTesting(), []);
        // Changing the filter in the text box will cause `getMetadata()`, and `getEntries()` to be called.
        itemsListener.resetRefreshed();
        const refreshedPromise3 = itemsListener.waitForItemsRefreshed();
        view.filterItem.dispatchEventToListeners("TextChanged" /* UI.Toolbar.ToolbarInput.Event.TextChanged */, '');
        await raf();
        await refreshedPromise3;
        assert.strictEqual(getMetadataSpy.callCount, 5);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.strictEqual(getEntriesSpy.callCount, 4);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_2);
        view.detach();
    });
    it('deletes selected entry when "Delete Selected" is clicked', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA_2_ENTRIES,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: [],
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the second row.
        assert.exists(selectNodeByKey(view.dataGrid, 'key2'));
        await raf();
        // Clicking "Delete Selected" will cause `deleteEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const deletedPromise = itemsListener.waitForItemsDeletedTotal(1);
        dispatchClickEvent(view.deleteSelectedButton.element);
        await raf();
        await deletedPromise;
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key2' }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), []);
        assert.deepEqual(itemsListener.deletedKeys, ['key2']);
        view.detach();
    });
    it('edits key of selected entry to a non-preexisting key', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: ENTRIES_KEY_EDITED_1,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the second row.
        const node = selectNodeByKey(view.dataGrid, 'key2');
        assert.exists(node);
        await raf();
        const selectedNode = node;
        view.dataGrid.startEditingNextEditableColumnOfDataGridNode(selectedNode, 'key', true);
        const cellElement = getCellElementFromNodeAndColumnId(view.dataGrid, selectedNode, 'key');
        assert.exists(cellElement);
        //  Editing a key will cause `deleteEntry()`, `setEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const editedPromise = itemsListener.waitForItemsEditedTotal(1);
        cellElement.textContent = 'key0';
        dispatchKeyDownEvent(cellElement, { key: 'Enter' });
        await raf();
        await editedPromise;
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key2' }));
        assert.isTrue(setEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key0', value: 'b', ignoreIfPresent: false }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_KEY_EDITED_1);
        assert.deepEqual(itemsListener.editedEvents, [
            { columnIdentifier: 'key', oldText: 'key2', newText: 'key0' },
        ]);
        view.detach();
    });
    it('edits key of selected entry to a preexisting key', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA_2_ENTRIES,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: ENTRIES_KEY_EDITED_2,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the second row.
        const node = selectNodeByKey(view.dataGrid, 'key2');
        assert.exists(node);
        await raf();
        const selectedNode = node;
        view.dataGrid.startEditingNextEditableColumnOfDataGridNode(selectedNode, 'key', true);
        const cellElement = getCellElementFromNodeAndColumnId(view.dataGrid, selectedNode, 'key');
        assert.exists(cellElement);
        // Editing a key will cause `deleteEntry()`, `setEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const editedPromise = itemsListener.waitForItemsEditedTotal(1);
        cellElement.textContent = 'key1';
        dispatchKeyDownEvent(cellElement, { key: 'Enter' });
        await raf();
        await editedPromise;
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key2' }));
        assert.isTrue(setEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key1', value: 'b', ignoreIfPresent: false }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_KEY_EDITED_2);
        assert.deepEqual(itemsListener.editedEvents, [
            { columnIdentifier: 'key', oldText: 'key2', newText: 'key1' },
        ]);
        // Verify that the preview loads.
        assert.instanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        view.detach();
    });
    it('edits value of selected entry to a new value', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: ENTRIES_VALUE_EDITED,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the second row.
        const node = selectNodeByKey(view.dataGrid, 'key2');
        assert.exists(node);
        await raf();
        const selectedNode = node;
        view.dataGrid.startEditingNextEditableColumnOfDataGridNode(selectedNode, 'value', true);
        const cellElement = getCellElementFromNodeAndColumnId(view.dataGrid, selectedNode, 'value');
        assert.exists(cellElement);
        // Editing a value will cause `setEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const editedPromise = itemsListener.waitForItemsEditedTotal(1);
        cellElement.textContent = 'd';
        dispatchKeyDownEvent(cellElement, { key: 'Enter' });
        await raf();
        await editedPromise;
        assert.isTrue(deleteEntrySpy.notCalled);
        assert.isTrue(setEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key2', value: 'd', ignoreIfPresent: false }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_VALUE_EDITED);
        assert.deepEqual(itemsListener.editedEvents, [
            { columnIdentifier: 'value', oldText: 'b', newText: 'd' },
        ]);
        // Verify that the preview loads.
        assert.instanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        view.detach();
    });
    it('adds an entry when the key cell of the empty data row is edited', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata');
        getMetadataSpy.onCall(0).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(1).resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        getMetadataSpy.onCall(2).resolves({
            metadata: METADATA_4_ENTRIES,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries');
        getEntriesSpy.onCall(0).resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        getEntriesSpy.onCall(1).resolves({
            entries: ENTRIES_NEW_KEY,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the empty (null) row.
        const node = selectNodeByKey(view.dataGrid, null);
        assert.exists(node);
        await raf();
        const selectedNode = node;
        view.dataGrid.startEditingNextEditableColumnOfDataGridNode(selectedNode, 'key', true);
        const cellElement = getCellElementFromNodeAndColumnId(view.dataGrid, selectedNode, 'key');
        assert.exists(cellElement);
        // Editing a key will cause `deleteEntry()`, `setEntry()`, `getMetadata()`, and `getEntries()` to be called.
        const editedPromise = itemsListener.waitForItemsEditedTotal(1);
        cellElement.textContent = 'key4';
        dispatchKeyDownEvent(cellElement, { key: 'Enter' });
        await raf();
        await editedPromise;
        assert.isTrue(deleteEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: '' }));
        assert.isTrue(setEntrySpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN, key: 'key4', value: '', ignoreIfPresent: false }));
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES_NEW_KEY);
        assert.deepEqual(itemsListener.editedEvents, [
            { columnIdentifier: 'key', oldText: '', newText: 'key4' },
        ]);
        // Verify that the preview loads.
        assert.instanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        view.detach();
    });
    it('attempting to edit key of selected entry to an empty key cancels the edit', async () => {
        assert.exists(sharedStorageModel);
        const getMetadataSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageMetadata').resolves({
            metadata: METADATA,
            getError: () => undefined,
        });
        const getEntriesSpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_getSharedStorageEntries').resolves({
            entries: ENTRIES,
            getError: () => undefined,
        });
        const deleteEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_deleteSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        const setEntrySpy = sinon.stub(sharedStorageModel.storageAgent, 'invoke_setSharedStorageEntry').resolves({
            getError: () => undefined,
        });
        // Creating will cause `getMetadata()` to be called.
        const view = await View.SharedStorageItemsView.createView(sharedStorage);
        await coordinator.done({ waitForWork: true });
        assert.isTrue(getMetadataSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        const itemsListener = new SharedStorageItemsListener(view.sharedStorageItemsDispatcher);
        const refreshedPromise1 = itemsListener.waitForItemsRefreshed();
        // Showing will cause `getMetadata()` and `getEntries()` to be called.
        view.markAsRoot();
        view.show(document.body);
        await refreshedPromise1;
        assert.isTrue(getMetadataSpy.calledTwice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledOnceWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Select the second row.
        const node = selectNodeByKey(view.dataGrid, 'key2');
        assert.exists(node);
        await raf();
        const selectedNode = node;
        view.dataGrid.startEditingNextEditableColumnOfDataGridNode(selectedNode, 'key', true);
        const cellElement = getCellElementFromNodeAndColumnId(view.dataGrid, selectedNode, 'key');
        assert.exists(cellElement);
        // Editing a key with the edit canceled will cause `getMetadata()` and `getEntries()` to be called.
        itemsListener.resetRefreshed();
        const refreshedPromise2 = itemsListener.waitForItemsRefreshed();
        cellElement.textContent = '';
        dispatchKeyDownEvent(cellElement, { key: 'Enter' });
        await raf();
        await refreshedPromise2;
        assert.isTrue(deleteEntrySpy.notCalled);
        assert.isTrue(setEntrySpy.notCalled);
        assert.isTrue(getMetadataSpy.calledThrice);
        assert.isTrue(getMetadataSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.isTrue(getEntriesSpy.calledTwice);
        assert.isTrue(getEntriesSpy.alwaysCalledWithExactly({ ownerOrigin: TEST_ORIGIN }));
        assert.deepEqual(view.getEntriesForTesting(), ENTRIES);
        // Verify that the preview loads.
        assert.instanceOf(view.outerSplitWidget.sidebarWidget(), UI.SearchableView.SearchableView);
        view.detach();
    });
});
//# sourceMappingURL=SharedStorageItemsView.test.js.map