// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as TextUtils from '../../../../models/text_utils/text_utils.js';
import { describeWithEnvironment } from '../../../../testing/EnvironmentHelpers.js';
import * as SourceFrame from './source_frame.js';
class MockStreamingContentProvider {
    #contentURL;
    #contentType;
    #content;
    constructor(contentURL, contentType, initialContent) {
        this.#contentURL = contentURL;
        this.#contentType = contentType;
        this.#content = TextUtils.StreamingContentData.StreamingContentData.from(initialContent);
    }
    async requestStreamingContent() {
        return this.#content;
    }
    async requestContentData() {
        return this.#content.content();
    }
    contentURL() {
        return this.#contentURL;
    }
    contentType() {
        return this.#contentType;
    }
    async requestContent() {
        return this.#content.content().asDeferedContent();
    }
    addChunk(chunk) {
        this.#content.addChunk(chunk);
    }
    searchInContent(_query, _caseSensitive, _isRegex) {
        throw new Error('Method not implemented.');
    }
}
describeWithEnvironment('ResourceSourceFrame', () => {
    it('updates the editor when a StreamingContentProvider changes', async () => {
        const contentProvider = new MockStreamingContentProvider('https://example.com/sse', Common.ResourceType.resourceTypes.Fetch, new TextUtils.ContentData.ContentData('', true, 'text/event-stream'));
        const resourceSourceFrame = new SourceFrame.ResourceSourceFrame.ResourceSourceFrame(contentProvider, 'text/event-stream');
        resourceSourceFrame.markAsRoot();
        resourceSourceFrame.show(document.body);
        const initialState = await new Promise(resolve => sinon.stub(resourceSourceFrame.textEditor, 'state').set(resolve));
        assert.strictEqual(initialState.doc.toString(), '');
        contentProvider.addChunk('Zm9v');
        const updatedState = await new Promise(resolve => sinon.stub(resourceSourceFrame.textEditor, 'state').set(resolve));
        assert.strictEqual(updatedState.doc.toString(), 'foo');
        resourceSourceFrame.detach();
    });
});
//# sourceMappingURL=ResourceSourceFrame.test.js.map