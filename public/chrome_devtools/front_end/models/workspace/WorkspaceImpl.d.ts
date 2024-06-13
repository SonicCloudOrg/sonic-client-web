import * as Common from '../../core/common/common.js';
import type * as Platform from '../../core/platform/platform.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import { UISourceCode, type UISourceCodeMetadata } from './UISourceCode.js';
import { type SearchConfig } from './SearchConfig.js';
export interface Project {
    workspace(): WorkspaceImpl;
    id(): string;
    type(): projectTypes;
    isServiceProject(): boolean;
    displayName(): string;
    requestMetadata(uiSourceCode: UISourceCode): Promise<UISourceCodeMetadata | null>;
    requestFileContent(uiSourceCode: UISourceCode): Promise<TextUtils.ContentData.ContentDataOrError>;
    canSetFileContent(): boolean;
    setFileContent(uiSourceCode: UISourceCode, newContent: string, isBase64: boolean): Promise<void>;
    fullDisplayName(uiSourceCode: UISourceCode): string;
    mimeType(uiSourceCode: UISourceCode): string;
    canRename(): boolean;
    rename(uiSourceCode: UISourceCode, newName: Platform.DevToolsPath.RawPathString, callback: (arg0: boolean, arg1?: string, arg2?: Platform.DevToolsPath.UrlString, arg3?: Common.ResourceType.ResourceType) => void): void;
    excludeFolder(path: Platform.DevToolsPath.UrlString): void;
    canExcludeFolder(path: Platform.DevToolsPath.EncodedPathString): boolean;
    createFile(path: Platform.DevToolsPath.EncodedPathString, name: string | null, content: string, isBase64?: boolean): Promise<UISourceCode | null>;
    canCreateFile(): boolean;
    deleteFile(uiSourceCode: UISourceCode): void;
    deleteDirectoryRecursively(path: Platform.DevToolsPath.EncodedPathString): Promise<boolean>;
    remove(): void;
    removeUISourceCode(url: Platform.DevToolsPath.UrlString): void;
    searchInFileContent(uiSourceCode: UISourceCode, query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    findFilesMatchingSearchRequest(searchConfig: SearchConfig, filesMatchingFileQuery: UISourceCode[], progress: Common.Progress.Progress): Promise<Map<UISourceCode, TextUtils.ContentProvider.SearchMatch[] | null>>;
    indexContent(progress: Common.Progress.Progress): void;
    uiSourceCodeForURL(url: Platform.DevToolsPath.UrlString): UISourceCode | null;
    /**
     * Returns an iterator for the currently registered {@link UISourceCode}s for this project. When
     * new {@link UISourceCode}s are added while iterating, they might show up already. When removing
     * {@link UISourceCode}s while iterating, these will no longer show up, and will have no effect
     * on the other entries.
     *
     * @return an iterator for the sources provided by this project.
     */
    uiSourceCodes(): Iterable<UISourceCode>;
}
export declare enum projectTypes {
    Debugger = "debugger",
    Formatter = "formatter",
    Network = "network",
    FileSystem = "filesystem",
    ContentScripts = "contentscripts",
    Service = "service"
}
export declare abstract class ProjectStore implements Project {
    #private;
    private readonly workspaceInternal;
    private readonly idInternal;
    private readonly typeInternal;
    private readonly displayNameInternal;
    constructor(workspace: WorkspaceImpl, id: string, type: projectTypes, displayName: string);
    id(): string;
    type(): projectTypes;
    displayName(): string;
    workspace(): WorkspaceImpl;
    createUISourceCode(url: Platform.DevToolsPath.UrlString, contentType: Common.ResourceType.ResourceType): UISourceCode;
    addUISourceCode(uiSourceCode: UISourceCode): boolean;
    removeUISourceCode(url: Platform.DevToolsPath.UrlString): void;
    removeProject(): void;
    uiSourceCodeForURL(url: Platform.DevToolsPath.UrlString): UISourceCode | null;
    uiSourceCodes(): Iterable<UISourceCode>;
    renameUISourceCode(uiSourceCode: UISourceCode, newName: string): void;
    rename(_uiSourceCode: UISourceCode, _newName: string, _callback: (arg0: boolean, arg1?: string, arg2?: Platform.DevToolsPath.UrlString, arg3?: Common.ResourceType.ResourceType) => void): void;
    excludeFolder(_path: Platform.DevToolsPath.UrlString): void;
    deleteFile(_uiSourceCode: UISourceCode): void;
    deleteDirectoryRecursively(_path: Platform.DevToolsPath.EncodedPathString): Promise<boolean>;
    remove(): void;
    indexContent(_progress: Common.Progress.Progress): void;
    abstract isServiceProject(): boolean;
    abstract requestMetadata(uiSourceCode: UISourceCode): Promise<UISourceCodeMetadata | null>;
    abstract requestFileContent(uiSourceCode: UISourceCode): Promise<TextUtils.ContentData.ContentDataOrError>;
    abstract canSetFileContent(): boolean;
    abstract setFileContent(uiSourceCode: UISourceCode, newContent: string, isBase64: boolean): Promise<void>;
    abstract fullDisplayName(uiSourceCode: UISourceCode): string;
    abstract mimeType(uiSourceCode: UISourceCode): string;
    abstract canRename(): boolean;
    abstract canExcludeFolder(path: Platform.DevToolsPath.EncodedPathString): boolean;
    abstract createFile(path: Platform.DevToolsPath.EncodedPathString, name: string | null, content: string, isBase64?: boolean): Promise<UISourceCode | null>;
    abstract canCreateFile(): boolean;
    abstract searchInFileContent(uiSourceCode: UISourceCode, query: string, caseSensitive: boolean, isRegex: boolean): Promise<TextUtils.ContentProvider.SearchMatch[]>;
    abstract findFilesMatchingSearchRequest(searchConfig: SearchConfig, filesMatchingFileQuery: UISourceCode[], progress: Common.Progress.Progress): Promise<Map<UISourceCode, TextUtils.ContentProvider.SearchMatch[] | null>>;
}
export declare class WorkspaceImpl extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    private projectsInternal;
    private hasResourceContentTrackingExtensionsInternal;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): WorkspaceImpl;
    static removeInstance(): void;
    uiSourceCode(projectId: string, url: Platform.DevToolsPath.UrlString): UISourceCode | null;
    uiSourceCodeForURL(url: Platform.DevToolsPath.UrlString): UISourceCode | null;
    findCompatibleUISourceCodes(uiSourceCode: UISourceCode): UISourceCode[];
    uiSourceCodesForProjectType(type: projectTypes): UISourceCode[];
    addProject(project: Project): void;
    removeProject(project: Project): void;
    project(projectId: string): Project | null;
    projects(): Project[];
    projectsForType(type: string): Project[];
    uiSourceCodes(): UISourceCode[];
    setHasResourceContentTrackingExtensions(hasExtensions: boolean): void;
    hasResourceContentTrackingExtensions(): boolean;
}
export declare enum Events {
    UISourceCodeAdded = "UISourceCodeAdded",
    UISourceCodeRemoved = "UISourceCodeRemoved",
    UISourceCodeRenamed = "UISourceCodeRenamed",
    WorkingCopyChanged = "WorkingCopyChanged",
    WorkingCopyCommitted = "WorkingCopyCommitted",
    WorkingCopyCommittedByUser = "WorkingCopyCommittedByUser",
    ProjectAdded = "ProjectAdded",
    ProjectRemoved = "ProjectRemoved"
}
export interface UISourceCodeRenamedEvent {
    oldURL: Platform.DevToolsPath.UrlString;
    uiSourceCode: UISourceCode;
}
export interface WorkingCopyChangedEvent {
    uiSourceCode: UISourceCode;
}
export interface WorkingCopyCommitedEvent {
    uiSourceCode: UISourceCode;
    content: string;
    encoded?: boolean;
}
export type EventTypes = {
    [Events.UISourceCodeAdded]: UISourceCode;
    [Events.UISourceCodeRemoved]: UISourceCode;
    [Events.UISourceCodeRenamed]: UISourceCodeRenamedEvent;
    [Events.WorkingCopyChanged]: WorkingCopyChangedEvent;
    [Events.WorkingCopyCommitted]: WorkingCopyCommitedEvent;
    [Events.WorkingCopyCommittedByUser]: WorkingCopyCommitedEvent;
    [Events.ProjectAdded]: Project;
    [Events.ProjectRemoved]: Project;
};
