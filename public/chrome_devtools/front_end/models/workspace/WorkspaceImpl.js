/*
 * Copyright (C) 2012 Google Inc. All rights reserved.
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
import * as Common from '../../core/common/common.js';
import { UISourceCode } from './UISourceCode.js';
// eslint-disable-next-line @typescript-eslint/naming-convention
export var projectTypes;
(function (projectTypes) {
    projectTypes["Debugger"] = "debugger";
    projectTypes["Formatter"] = "formatter";
    projectTypes["Network"] = "network";
    projectTypes["FileSystem"] = "filesystem";
    projectTypes["ContentScripts"] = "contentscripts";
    projectTypes["Service"] = "service";
})(projectTypes || (projectTypes = {}));
export class ProjectStore {
    workspaceInternal;
    idInternal;
    typeInternal;
    displayNameInternal;
    #uiSourceCodes;
    constructor(workspace, id, type, displayName) {
        this.workspaceInternal = workspace;
        this.idInternal = id;
        this.typeInternal = type;
        this.displayNameInternal = displayName;
        this.#uiSourceCodes = new Map();
    }
    id() {
        return this.idInternal;
    }
    type() {
        return this.typeInternal;
    }
    displayName() {
        return this.displayNameInternal;
    }
    workspace() {
        return this.workspaceInternal;
    }
    createUISourceCode(url, contentType) {
        return new UISourceCode(this, url, contentType);
    }
    addUISourceCode(uiSourceCode) {
        const url = uiSourceCode.url();
        if (this.uiSourceCodeForURL(url)) {
            return false;
        }
        this.#uiSourceCodes.set(url, uiSourceCode);
        this.workspaceInternal.dispatchEventToListeners(Events.UISourceCodeAdded, uiSourceCode);
        return true;
    }
    removeUISourceCode(url) {
        const uiSourceCode = this.#uiSourceCodes.get(url);
        if (uiSourceCode === undefined) {
            return;
        }
        this.#uiSourceCodes.delete(url);
        this.workspaceInternal.dispatchEventToListeners(Events.UISourceCodeRemoved, uiSourceCode);
    }
    removeProject() {
        this.workspaceInternal.removeProject(this);
        this.#uiSourceCodes.clear();
    }
    uiSourceCodeForURL(url) {
        return this.#uiSourceCodes.get(url) ?? null;
    }
    uiSourceCodes() {
        return this.#uiSourceCodes.values();
    }
    renameUISourceCode(uiSourceCode, newName) {
        const oldPath = uiSourceCode.url();
        const newPath = uiSourceCode.parentURL() ?
            Common.ParsedURL.ParsedURL.urlFromParentUrlAndName(uiSourceCode.parentURL(), newName) :
            Common.ParsedURL.ParsedURL.preEncodeSpecialCharactersInPath(newName);
        this.#uiSourceCodes.set(newPath, uiSourceCode);
        this.#uiSourceCodes.delete(oldPath);
    }
    // No-op implementation for a handfull of interface methods.
    rename(_uiSourceCode, _newName, _callback) {
    }
    excludeFolder(_path) {
    }
    deleteFile(_uiSourceCode) {
    }
    deleteDirectoryRecursively(_path) {
        return Promise.resolve(false);
    }
    remove() {
    }
    indexContent(_progress) {
    }
}
let workspaceInstance;
export class WorkspaceImpl extends Common.ObjectWrapper.ObjectWrapper {
    projectsInternal;
    hasResourceContentTrackingExtensionsInternal;
    constructor() {
        super();
        this.projectsInternal = new Map();
        this.hasResourceContentTrackingExtensionsInternal = false;
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!workspaceInstance || forceNew) {
            workspaceInstance = new WorkspaceImpl();
        }
        return workspaceInstance;
    }
    static removeInstance() {
        workspaceInstance = undefined;
    }
    uiSourceCode(projectId, url) {
        const project = this.projectsInternal.get(projectId);
        return project ? project.uiSourceCodeForURL(url) : null;
    }
    uiSourceCodeForURL(url) {
        for (const project of this.projectsInternal.values()) {
            const uiSourceCode = project.uiSourceCodeForURL(url);
            if (uiSourceCode) {
                return uiSourceCode;
            }
        }
        return null;
    }
    findCompatibleUISourceCodes(uiSourceCode) {
        const url = uiSourceCode.url();
        const contentType = uiSourceCode.contentType();
        const result = [];
        for (const project of this.projectsInternal.values()) {
            if (uiSourceCode.project().type() !== project.type()) {
                continue;
            }
            const candidate = project.uiSourceCodeForURL(url);
            if (candidate && candidate.url() === url && candidate.contentType() === contentType) {
                result.push(candidate);
            }
        }
        return result;
    }
    uiSourceCodesForProjectType(type) {
        const result = [];
        for (const project of this.projectsInternal.values()) {
            if (project.type() === type) {
                for (const uiSourceCode of project.uiSourceCodes()) {
                    result.push(uiSourceCode);
                }
            }
        }
        return result;
    }
    addProject(project) {
        console.assert(!this.projectsInternal.has(project.id()), `A project with id ${project.id()} already exists!`);
        this.projectsInternal.set(project.id(), project);
        this.dispatchEventToListeners(Events.ProjectAdded, project);
    }
    removeProject(project) {
        this.projectsInternal.delete(project.id());
        this.dispatchEventToListeners(Events.ProjectRemoved, project);
    }
    project(projectId) {
        return this.projectsInternal.get(projectId) || null;
    }
    projects() {
        return [...this.projectsInternal.values()];
    }
    projectsForType(type) {
        function filterByType(project) {
            return project.type() === type;
        }
        return this.projects().filter(filterByType);
    }
    uiSourceCodes() {
        const result = [];
        for (const project of this.projectsInternal.values()) {
            for (const uiSourceCode of project.uiSourceCodes()) {
                result.push(uiSourceCode);
            }
        }
        return result;
    }
    setHasResourceContentTrackingExtensions(hasExtensions) {
        this.hasResourceContentTrackingExtensionsInternal = hasExtensions;
    }
    hasResourceContentTrackingExtensions() {
        return this.hasResourceContentTrackingExtensionsInternal;
    }
}
export var Events;
(function (Events) {
    Events["UISourceCodeAdded"] = "UISourceCodeAdded";
    Events["UISourceCodeRemoved"] = "UISourceCodeRemoved";
    Events["UISourceCodeRenamed"] = "UISourceCodeRenamed";
    Events["WorkingCopyChanged"] = "WorkingCopyChanged";
    Events["WorkingCopyCommitted"] = "WorkingCopyCommitted";
    Events["WorkingCopyCommittedByUser"] = "WorkingCopyCommittedByUser";
    Events["ProjectAdded"] = "ProjectAdded";
    Events["ProjectRemoved"] = "ProjectRemoved";
})(Events || (Events = {}));
//# sourceMappingURL=WorkspaceImpl.js.map