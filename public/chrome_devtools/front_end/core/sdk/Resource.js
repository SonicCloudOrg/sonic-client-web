// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TextUtils from '../../models/text_utils/text_utils.js';
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
export class Resource {
    #resourceTreeModel;
    #requestInternal;
    #urlInternal;
    #documentURLInternal;
    #frameIdInternal;
    #loaderIdInternal;
    #type;
    #mimeTypeInternal;
    #isGeneratedInternal;
    #lastModifiedInternal;
    #contentSizeInternal;
    #parsedURLInternal;
    #contentData = null;
    /**
     * There is always at most one CDP "getResourceContent" call in-flight. But once it's done
     * we'll hit the backend again in case we failed.
     */
    #pendingContentData = null;
    constructor(resourceTreeModel, request, url, documentURL, frameId, loaderId, type, mimeType, lastModified, contentSize) {
        this.#resourceTreeModel = resourceTreeModel;
        this.#requestInternal = request;
        this.url = url;
        this.#documentURLInternal = documentURL;
        this.#frameIdInternal = frameId;
        this.#loaderIdInternal = loaderId;
        this.#type = type || Common.ResourceType.resourceTypes.Other;
        this.#mimeTypeInternal = mimeType;
        this.#isGeneratedInternal = false;
        this.#lastModifiedInternal = lastModified && Platform.DateUtilities.isValid(lastModified) ? lastModified : null;
        this.#contentSizeInternal = contentSize;
    }
    lastModified() {
        if (this.#lastModifiedInternal || !this.#requestInternal) {
            return this.#lastModifiedInternal;
        }
        const lastModifiedHeader = this.#requestInternal.responseLastModified();
        const date = lastModifiedHeader ? new Date(lastModifiedHeader) : null;
        this.#lastModifiedInternal = date && Platform.DateUtilities.isValid(date) ? date : null;
        return this.#lastModifiedInternal;
    }
    contentSize() {
        if (typeof this.#contentSizeInternal === 'number' || !this.#requestInternal) {
            return this.#contentSizeInternal;
        }
        return this.#requestInternal.resourceSize;
    }
    get request() {
        return this.#requestInternal;
    }
    get url() {
        return this.#urlInternal;
    }
    set url(x) {
        this.#urlInternal = x;
        this.#parsedURLInternal = new Common.ParsedURL.ParsedURL(x);
    }
    get parsedURL() {
        return this.#parsedURLInternal;
    }
    get documentURL() {
        return this.#documentURLInternal;
    }
    get frameId() {
        return this.#frameIdInternal;
    }
    get loaderId() {
        return this.#loaderIdInternal;
    }
    get displayName() {
        return this.#parsedURLInternal ? this.#parsedURLInternal.displayName : '';
    }
    resourceType() {
        return this.#requestInternal ? this.#requestInternal.resourceType() : this.#type;
    }
    get mimeType() {
        return this.#requestInternal ? this.#requestInternal.mimeType : this.#mimeTypeInternal;
    }
    get content() {
        if (this.#contentData?.isTextContent) {
            return this.#contentData.text;
        }
        return this.#contentData?.base64 ?? null;
    }
    get isGenerated() {
        return this.#isGeneratedInternal;
    }
    set isGenerated(val) {
        this.#isGeneratedInternal = val;
    }
    contentURL() {
        return this.#urlInternal;
    }
    contentType() {
        if (this.resourceType() === Common.ResourceType.resourceTypes.Document &&
            this.mimeType.indexOf('javascript') !== -1) {
            return Common.ResourceType.resourceTypes.Script;
        }
        return this.resourceType();
    }
    async requestContent() {
        const contentData = await this.requestContentData();
        return TextUtils.ContentData.ContentData.asDeferredContent(contentData);
    }
    async requestContentData() {
        if (this.#contentData) {
            return this.#contentData;
        }
        if (this.#pendingContentData) {
            return this.#pendingContentData;
        }
        this.#pendingContentData = this.innerRequestContent().then(contentData => {
            // If an error happended we don't set `this.#contentData` so future `requestContentData` will
            // attempt again to hit the backend for this Resource.
            if (!TextUtils.ContentData.ContentData.isError(contentData)) {
                this.#contentData = contentData;
            }
            this.#pendingContentData = null;
            return contentData;
        });
        return this.#pendingContentData;
    }
    canonicalMimeType() {
        return this.contentType().canonicalMimeType() || this.mimeType;
    }
    async searchInContent(query, caseSensitive, isRegex) {
        if (!this.frameId) {
            return [];
        }
        if (this.request) {
            return this.request.searchInContent(query, caseSensitive, isRegex);
        }
        const result = await this.#resourceTreeModel.target().pageAgent().invoke_searchInResource({ frameId: this.frameId, url: this.url, query, caseSensitive, isRegex });
        return TextUtils.TextUtils.performSearchInSearchMatches(result.result || [], query, caseSensitive, isRegex);
    }
    async populateImageSource(image) {
        const contentData = await this.requestContentData();
        if (TextUtils.ContentData.ContentData.isError(contentData)) {
            return;
        }
        image.src = contentData.asDataUrl() ?? this.#urlInternal;
    }
    async innerRequestContent() {
        if (this.request) {
            // The `contentData` promise only resolves once the request is done.
            return this.request.requestContentData();
        }
        const response = await this.#resourceTreeModel.target().pageAgent().invoke_getResourceContent({ frameId: this.frameId, url: this.url });
        const error = response.getError();
        if (error) {
            return { error };
        }
        return new TextUtils.ContentData.ContentData(response.content, response.base64Encoded, this.mimeType);
    }
    hasTextContent() {
        if (this.#contentData?.isTextContent) {
            return true;
        }
        return this.#type.isTextType() || Platform.MimeType.isTextType(this.mimeType);
    }
    frame() {
        return this.#frameIdInternal ? this.#resourceTreeModel.frameForId(this.#frameIdInternal) : null;
    }
    statusCode() {
        return this.#requestInternal ? this.#requestInternal.statusCode : 0;
    }
}
//# sourceMappingURL=Resource.js.map