/// <reference types="sinon" />
import * as Common from '../core/common/common.js';
import type * as Platform from '../core/platform/platform.js';
import * as SDK from '../core/sdk/sdk.js';
import type * as Protocol from '../generated/protocol.js';
import * as Bindings from '../models/bindings/bindings.js';
import * as Persistence from '../models/persistence/persistence.js';
import * as Workspace from '../models/workspace/workspace.js';
export declare function createContentProviderUISourceCodes(options: {
    items: {
        url: Platform.DevToolsPath.UrlString;
        content?: string;
        mimeType: string;
        resourceType?: Common.ResourceType.ResourceType;
        metadata?: Workspace.UISourceCode.UISourceCodeMetadata;
    }[];
    projectType?: Workspace.Workspace.projectTypes;
    projectId?: string;
    target?: SDK.Target.Target;
}): {
    project: Bindings.ContentProviderBasedProject.ContentProviderBasedProject;
    uiSourceCodes: Workspace.UISourceCode.UISourceCode[];
};
export declare function createContentProviderUISourceCode(options: {
    url: Platform.DevToolsPath.UrlString;
    content?: string;
    mimeType: string;
    projectType?: Workspace.Workspace.projectTypes;
    projectId?: string;
    metadata?: Workspace.UISourceCode.UISourceCodeMetadata;
    target?: SDK.Target.Target;
}): {
    project: Bindings.ContentProviderBasedProject.ContentProviderBasedProject;
    uiSourceCode: Workspace.UISourceCode.UISourceCode;
};
export declare function createFileSystemUISourceCode(options: {
    url: Platform.DevToolsPath.UrlString;
    mimeType: string;
    content?: string;
    fileSystemPath?: string;
    autoMapping?: boolean;
    type?: string;
    metadata?: Workspace.UISourceCode.UISourceCodeMetadata;
}): {
    uiSourceCode: Workspace.UISourceCode.UISourceCode;
    project: Persistence.FileSystemWorkspaceBinding.FileSystem;
};
export declare function setupMockedUISourceCode(url?: string): {
    sut: Workspace.UISourceCode.UISourceCode;
    projectStub: import("sinon").SinonStubbedInstance<Bindings.ContentProviderBasedProject.ContentProviderBasedProject>;
    contentTypeStub: import("sinon").SinonStubbedInstance<Common.ResourceType.ResourceType>;
};
export declare function createFakeScriptMapping(debuggerModel: SDK.DebuggerModel.DebuggerModel, uiSourceCode: Workspace.UISourceCode.UISourceCode, uiLineNumber: number, scriptId: Protocol.Runtime.ScriptId): Bindings.DebuggerWorkspaceBinding.DebuggerSourceMapping;
