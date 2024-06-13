// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Platform from '../../core/platform/platform.js';
import { dispatchKeyDownEvent } from '../../testing/DOMHelpers.js';
import { describeWithEnvironment } from '../../testing/EnvironmentHelpers.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Search from './search.js';
class FakeSearchScope {
    performSearchCalledPromise;
    #resolvePerformSearchCalledPromise;
    constructor() {
        const { promise, resolve } = Platform.PromiseUtilities.promiseWithResolvers();
        this.performSearchCalledPromise = promise;
        this.#resolvePerformSearchCalledPromise = resolve;
    }
    performSearch(searchConfig, progress, searchResultCallback, searchFinishedCallback) {
        this.#resolvePerformSearchCalledPromise({ searchConfig, progress, searchResultCallback, searchFinishedCallback });
    }
    performIndexing(progress) {
        setTimeout(() => progress.done(), 0); // Allow microtasks to run.
    }
    stopSearch() {
    }
}
class TestSearchView extends Search.SearchView.SearchView {
    /**
     * The throttler with which the base 'SearchView' throttles UI updates.
     * Exposed here so tests can wait for the updates to finish.
     */
    throttler;
    #scopeCreator;
    /**
     * `SearchView` resets and lazily re-creates the search results pane for each search.
     * To provide a fake instance we install a get/set accesssor for the original property
     * that behaves normally with no override, but returns the mock if one is provided.
     */
    #searchResultsPane = null;
    #overrideResultsPane;
    constructor(scopeCreator, searchResultsPane) {
        const throttler = new Common.Throttler.Throttler(/* timeoutMs */ 0);
        super('fake', throttler);
        this.throttler = throttler;
        this.#scopeCreator = scopeCreator;
        this.#searchResultsPane = searchResultsPane ?? null;
        this.#overrideResultsPane = Boolean(searchResultsPane);
        // Use 'Object.definePrroperty' or TS won't be happy that we replace a prop with an accessor.
        Object.defineProperty(this, 'searchResultsPane', {
            get: () => this.#searchResultsPane,
            set: (pane) => {
                if (!this.#overrideResultsPane) {
                    this.#searchResultsPane = pane;
                }
            },
        });
    }
    createScope() {
        return this.#scopeCreator();
    }
    /** Fills in the UI elements of the SearchView and hits 'Enter'. */
    triggerSearch(query, matchCase, isRegex) {
        this.search.value = query;
        this.matchCaseButton.toggled = matchCase;
        this.regexButton.toggled = isRegex;
        dispatchKeyDownEvent(this.search, { keyCode: UI.KeyboardShortcut.Keys.Enter.code });
    }
    get currentSearchResultMessage() {
        return this.contentElement.querySelector('.search-message:nth-child(3)').textContent ?? '';
    }
}
describeWithEnvironment('SearchView', () => {
    it('calls the search scope with the search config provided by the user via the UI', async () => {
        const fakeScope = new FakeSearchScope();
        const searchView = new TestSearchView(() => fakeScope);
        searchView.triggerSearch('a query', true, true);
        const { searchConfig } = await fakeScope.performSearchCalledPromise;
        assert.strictEqual(searchConfig.query(), 'a query');
        assert.isFalse(searchConfig.ignoreCase());
        assert.isTrue(searchConfig.isRegex());
    });
    it('notifies the user when no search results were found', async () => {
        const fakeScope = new FakeSearchScope();
        const searchView = new TestSearchView(() => fakeScope);
        searchView.triggerSearch('a query', true, true);
        const { searchFinishedCallback } = await fakeScope.performSearchCalledPromise;
        searchFinishedCallback(/* finished */ true);
        assert.strictEqual(searchView.currentSearchResultMessage, 'No matches found.');
    });
    it('updates the search result message with a count when search results are added', async () => {
        const fakeScope = new FakeSearchScope();
        const fakeResultsPane = sinon.createStubInstance(Search.SearchResultsPane.SearchResultsPane);
        const searchView = new TestSearchView(() => fakeScope, fakeResultsPane);
        searchView.triggerSearch('a query', true, true);
        const { searchResultCallback } = await fakeScope.performSearchCalledPromise;
        searchResultCallback({ matchesCount: () => 10 });
        await searchView.throttler.process?.();
        assert.strictEqual(searchView.currentSearchResultMessage, 'Found 10 matching lines in 1 file.');
        searchResultCallback({ matchesCount: () => 42 });
        await searchView.throttler.process?.();
        assert.strictEqual(searchView.currentSearchResultMessage, 'Found 52 matching lines in 2 files.');
    });
    it('forwards each SearchResult to the results pane', async () => {
        const fakeScope = new FakeSearchScope();
        const fakeResultsPane = sinon.createStubInstance(Search.SearchResultsPane.SearchResultsPane);
        const searchView = new TestSearchView(() => fakeScope, fakeResultsPane);
        searchView.triggerSearch('a query', true, true);
        const { searchResultCallback } = await fakeScope.performSearchCalledPromise;
        const searchResult1 = ({ matchesCount: () => 10 });
        const searchResult2 = ({ matchesCount: () => 42 });
        searchResultCallback(searchResult1);
        searchResultCallback(searchResult2);
        await searchView.throttler.process?.();
        assert.isTrue(fakeResultsPane.addSearchResult.calledTwice);
        assert.strictEqual(fakeResultsPane.addSearchResult.args[0][0], searchResult1);
        assert.strictEqual(fakeResultsPane.addSearchResult.args[1][0], searchResult2);
    });
});
//# sourceMappingURL=SearchView.test.js.map