import type * as Platform from '../core/platform/platform.js';
import type * as SDK from '../core/sdk/sdk.js';
import type * as Persistence from '../models/persistence/persistence.js';
import * as Workspace from '../models/workspace/workspace.js';
export declare function createFileSystemFileForPersistenceTests(fileSystemScript: {
    fileSystemFileUrl: Platform.DevToolsPath.UrlString;
    fileSystemPath: Platform.DevToolsPath.UrlString;
    type?: string;
}, networkScriptUrl: Platform.DevToolsPath.UrlString, content: string, target: SDK.Target.Target): {
    uiSourceCode: Workspace.UISourceCode.UISourceCode;
    project: Persistence.FileSystemWorkspaceBinding.FileSystem;
};
