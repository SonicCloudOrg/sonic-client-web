// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import { contentAsDataURL } from './ContentProvider.js';
/**
 * This class is a small wrapper around either raw binary or text data.
 * As the binary data can actually contain textual data, we also store the
 * MIME type and if applicable, the charset.
 *
 * This information should be generally kept together, as interpreting text
 * from raw bytes requires an encoding.
 *
 * Note that we only rarely have to decode text ourselves in the frontend,
 * this is mostly handled by the backend. There are cases though (e.g. SVG,
 * or streaming response content) where we receive text data in
 * binary (base64-encoded) form.
 *
 * The class only implements decoding. We currently don't have a use-case
 * to re-encode text into base64 bytes using a specified charset.
 */
export class ContentData {
    mimeType;
    charset;
    #contentAsBase64;
    #contentAsText;
    constructor(data, isBase64, mimeType, charset) {
        this.charset = charset || 'utf-8';
        if (isBase64) {
            this.#contentAsBase64 = data;
        }
        else {
            this.#contentAsText = data;
        }
        this.mimeType = mimeType;
        if (!this.mimeType) {
            // Tests or broken requests might pass an empty/undefined mime type. Fallback to
            // "default" mime types.
            this.mimeType = isBase64 ? 'application/octet-stream' : 'text/plain';
        }
    }
    /**
     * Returns the data as base64.
     *
     * @throws if this `ContentData` was constructed from text content.
     */
    get base64() {
        if (this.#contentAsBase64 === undefined) {
            throw new Error('Encoding text content as base64 is not supported');
        }
        return this.#contentAsBase64;
    }
    /**
     * Returns the content as text. If this `ContentData` was constructed with base64
     * encoded bytes, it will use the provided charset to attempt to decode the bytes.
     *
     * @throws if `resourceType` is not a text type.
     */
    get text() {
        if (this.#contentAsText !== undefined) {
            return this.#contentAsText;
        }
        if (!this.isTextContent) {
            throw new Error('Cannot interpret binary data as text');
        }
        const binaryString = window.atob(this.#contentAsBase64);
        const bytes = Uint8Array.from(binaryString, m => m.codePointAt(0));
        this.#contentAsText = new TextDecoder(this.charset).decode(bytes);
        return this.#contentAsText;
    }
    get isTextContent() {
        return Platform.MimeType.isTextType(this.mimeType);
    }
    get isEmpty() {
        // Don't trigger unnecessary decoding. Only check if both of the strings are empty.
        return !Boolean(this.#contentAsBase64) && !Boolean(this.#contentAsText);
    }
    get createdFromBase64() {
        return this.#contentAsBase64 !== undefined;
    }
    /**
     * @returns True, iff the contents (base64 or text) are equal.
     * Does not compare mime type and charset, but will decode base64 data if both
     * mime types indicate that it's text content.
     */
    contentEqualTo(other) {
        if (this.#contentAsBase64 !== undefined && other.#contentAsBase64 !== undefined) {
            return this.#contentAsBase64 === other.#contentAsBase64;
        }
        if (this.#contentAsText !== undefined && other.#contentAsText !== undefined) {
            return this.#contentAsText === other.#contentAsText;
        }
        if (this.isTextContent && other.isTextContent) {
            return this.text === other.text;
        }
        return false;
    }
    asDataUrl() {
        // To keep with existing behavior we prefer to return the content
        // encoded if that is how this ContentData was constructed with.
        if (this.#contentAsBase64 !== undefined) {
            const charset = this.isTextContent ? this.charset : null;
            return contentAsDataURL(this.#contentAsBase64, this.mimeType ?? '', true, charset);
        }
        return contentAsDataURL(this.text, this.mimeType ?? '', false, 'utf-8');
    }
    /**
     * @deprecated Used during migration from `DeferredContent` to `ContentData`.
     */
    asDeferedContent() {
        // To prevent encoding mistakes, we'll return text content already decoded.
        if (this.isTextContent) {
            return { content: this.text, isEncoded: false };
        }
        if (this.#contentAsText !== undefined) {
            // Unknown text mime type, this should not really happen.
            return { content: this.#contentAsText, isEncoded: false };
        }
        if (this.#contentAsBase64 !== undefined) {
            return { content: this.#contentAsBase64, isEncoded: true };
        }
        throw new Error('Unreachable');
    }
    static isError(contentDataOrError) {
        return 'error' in contentDataOrError;
    }
    /** @returns `value` if the passed `ContentDataOrError` is an error, or the text content otherwise */
    static textOr(contentDataOrError, value) {
        if (ContentData.isError(contentDataOrError)) {
            return value;
        }
        return contentDataOrError.text;
    }
    /**
     * @deprecated Used during migration from `DeferredContent` to `ContentData`.
     */
    static asDeferredContent(contentDataOrError) {
        if (ContentData.isError(contentDataOrError)) {
            return { error: contentDataOrError.error, content: null, isEncoded: false };
        }
        return contentDataOrError.asDeferedContent();
    }
}
//# sourceMappingURL=ContentData.js.map