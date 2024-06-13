/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
const UIStrings = {
    /**
     * @description Error message that is displayed in the Sources panel when can't be loaded.
     */
    unknownErrorLoadingFile: 'Unknown error loading file',
};
const str_ = i18n.i18n.registerUIStrings('models/bindings/ContentProviderBasedProject.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ContentProviderBasedProject extends Workspace.Workspace.ProjectStore {
    #isServiceProjectInternal;
    #uiSourceCodeToData;
    constructor(workspace, id, type, displayName, isServiceProject) {
        super(workspace, id, type, displayName);
        this.#isServiceProjectInternal = isServiceProject;
        this.#uiSourceCodeToData = new WeakMap();
        workspace.addProject(this);
    }
    async requestFileContent(uiSourceCode) {
        const { contentProvider } = this.#uiSourceCodeToData.get(uiSourceCode);
        try {
            return await contentProvider.requestContentData();
        }
        catch (err) {
            // TODO(rob.paveza): CRBug 1013683 - Consider propagating exceptions full-stack
            return {
                error: err ? String(err) : i18nString(UIStrings.unknownErrorLoadingFile),
            };
        }
    }
    isServiceProject() {
        return this.#isServiceProjectInternal;
    }
    async requestMetadata(uiSourceCode) {
        const { metadata } = this.#uiSourceCodeToData.get(uiSourceCode);
        return metadata;
    }
    canSetFileContent() {
        return false;
    }
    async setFileContent(_uiSourceCode, _newContent, _isBase64) {
    }
    fullDisplayName(uiSourceCode) {
        let parentPath = uiSourceCode.parentURL().replace(/^(?:https?|file)\:\/\//, '');
        try {
            parentPath = decodeURI(parentPath);
        }
        catch (e) {
        }
        return parentPath + '/' + uiSourceCode.displayName(true);
    }
    mimeType(uiSourceCode) {
        const { mimeType } = this.#uiSourceCodeToData.get(uiSourceCode);
        return mimeType;
    }
    canRename() {
        return false;
    }
    rename(uiSourceCode, newName, callback) {
        const path = uiSourceCode.url();
        this.performRename(path, newName, (success, newName) => {
            if (success && newName) {
                this.renameUISourceCode(uiSourceCode, newName);
            }
            callback(success, newName);
        });
    }
    excludeFolder(_path) {
    }
    canExcludeFolder(_path) {
        return false;
    }
    async createFile(_path, _name, _content, _isBase64) {
        return null;
    }
    canCreateFile() {
        return false;
    }
    deleteFile(_uiSourceCode) {
    }
    remove() {
    }
    performRename(path, newName, callback) {
        callback(false);
    }
    searchInFileContent(uiSourceCode, query, caseSensitive, isRegex) {
        const { contentProvider } = this.#uiSourceCodeToData.get(uiSourceCode);
        return contentProvider.searchInContent(query, caseSensitive, isRegex);
    }
    async findFilesMatchingSearchRequest(searchConfig, filesMatchingFileQuery, progress) {
        const result = new Map();
        progress.setTotalWork(filesMatchingFileQuery.length);
        await Promise.all(filesMatchingFileQuery.map(searchInContent.bind(this)));
        progress.done();
        return result;
        async function searchInContent(uiSourceCode) {
            let allMatchesFound = true;
            let matches = [];
            for (const query of searchConfig.queries().slice()) {
                const searchMatches = await this.searchInFileContent(uiSourceCode, query, !searchConfig.ignoreCase(), searchConfig.isRegex());
                if (!searchMatches.length) {
                    allMatchesFound = false;
                    break;
                }
                matches = Platform.ArrayUtilities.mergeOrdered(matches, searchMatches, TextUtils.ContentProvider.SearchMatch.comparator);
            }
            if (allMatchesFound) {
                result.set(uiSourceCode, matches);
            }
            progress.incrementWorked(1);
        }
    }
    indexContent(progress) {
        queueMicrotask(progress.done.bind(progress));
    }
    addUISourceCodeWithProvider(uiSourceCode, contentProvider, metadata, mimeType) {
        this.#uiSourceCodeToData.set(uiSourceCode, { mimeType, metadata, contentProvider });
        this.addUISourceCode(uiSourceCode);
    }
    addContentProvider(url, contentProvider, mimeType) {
        const uiSourceCode = this.createUISourceCode(url, contentProvider.contentType());
        this.addUISourceCodeWithProvider(uiSourceCode, contentProvider, null, mimeType);
        return uiSourceCode;
    }
    reset() {
        this.removeProject();
        this.workspace().addProject(this);
    }
    dispose() {
        this.removeProject();
    }
}
//# sourceMappingURL=ContentProviderBasedProject.js.map