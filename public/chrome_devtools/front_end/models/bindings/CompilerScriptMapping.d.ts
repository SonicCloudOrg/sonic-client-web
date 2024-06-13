import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
import { type DebuggerSourceMapping, type DebuggerWorkspaceBinding } from './DebuggerWorkspaceBinding.js';
/**
 * The `CompilerScriptMapping` maps script entities from source maps to scripts and vice versa.
 * It is part of the {@link DebuggerWorkspaceBinding} and operates on top of the
 * {@link SDK.SourceMapManager.SourceMapManager}.
 *
 * The `CompilerScriptMapping` maintains a list of {@link ContentProviderBasedProject}s, in which it
 * creates the `UISourceCode`s for the source-mapped entities. The mapping is implemented in various
 * layers:
 *
 * - `#sourceMapToProject` holds a mapping of all the attached `SourceMap`s to their respective
 *   `ContentBasedProviderBasedProject`s. When resolving raw to UI locations this is the first
 *   place to check.
 * - `#uiSourceCodeToSourceMaps` maps every `UISourceCode` created herein to the `SourceMap` that
 *   it originated from. This is the authoritative source of information: The `#projects` might
 *   contain `UISourceCode` objects that were created from this `CompilerScriptMapping`, but which
 *   have become stale, and `#uiSourceCodeToSourceMaps` represents these as having no source maps.
 *
 * @see {@link SDK.SourceMap.SourceMap}
 * @see {@link SDK.SourceMapManager.SourceMapManager}
 */
export declare class CompilerScriptMapping implements DebuggerSourceMapping {
    #private;
    constructor(debuggerModel: SDK.DebuggerModel.DebuggerModel, workspace: Workspace.Workspace.WorkspaceImpl, debuggerWorkspaceBinding: DebuggerWorkspaceBinding);
    private addStubUISourceCode;
    private removeStubUISourceCode;
    getLocationRangesForSameSourceLocation(rawLocation: SDK.DebuggerModel.Location): SDK.DebuggerModel.LocationRange[];
    uiSourceCodeForURL(url: Platform.DevToolsPath.UrlString, isContentScript: boolean): Workspace.UISourceCode.UISourceCode | null;
    /**
     * Resolves the source-mapped entity mapped from the given `rawLocation` if any. If the `rawLocation`
     * does not point into a script with a source map, `null` is returned from here, while if the source
     * map for the script is currently being loaded, a stub `UISourceCode` is returned meanwhile. Otherwise,
     * if the script has a source map entry for the position identified by the `rawLocation`, this method
     * will compute the location in the source-mapped file by a reverse lookup on the source map.
     *
     * If `rawLocation` points to a script with a source map managed by this `CompilerScriptMapping`, which
     * is stale (because it was overridden by a more recent mapping), `null` will be returned.
     *
     * @param rawLocation script location.
     * @returns the {@link Workspace.UISourceCode.UILocation} for the `rawLocation` if any.
     */
    rawLocationToUILocation(rawLocation: SDK.DebuggerModel.Location): Workspace.UISourceCode.UILocation | null;
    /**
     * Resolves a location within a source mapped entity managed by the `CompilerScriptMapping`
     * to its script locations. If the `uiSourceCode` does not belong to this mapping or if its
     * mapping is stale, an empty list will be returned.
     *
     * A single UI location can map to multiple different {@link SDK.DebuggerModel.RawLocation}s,
     * and these raw locations don't even need to belong to the same script (e.g. multiple bundles
     * can reference the same shared source file in case of code splitting, and locations within
     * this shared source file will then resolve to locations in all the bundles).
     *
     * @param uiSourceCode the source mapped entity.
     * @param lineNumber the line number in terms of the {@link uiSourceCode}.
     * @param columnNumber the column number in terms of the {@link uiSourceCode}.
     * @returns a list of raw locations that correspond to the UI location.
     */
    uiLocationToRawLocations(uiSourceCode: Workspace.UISourceCode.UISourceCode, lineNumber: number, columnNumber: number): SDK.DebuggerModel.Location[];
    uiLocationRangeToRawLocationRanges(uiSourceCode: Workspace.UISourceCode.UISourceCode, textRange: TextUtils.TextRange.TextRange): SDK.DebuggerModel.LocationRange[] | null;
    /**
     * Computes the set of line numbers which are source-mapped to a script within the
     * given {@link uiSourceCode}.
     *
     * @param uiSourceCode the source mapped entity.
     * @return a set of source-mapped line numbers or `null` if the {@link uiSourceCode}
     *         is not provided by this {@link CompilerScriptMapping} instance.
     */
    getMappedLines(uiSourceCode: Workspace.UISourceCode.UISourceCode): Set<number> | null;
    /**
     * Invoked by the {@link SDK.SourceMapManager.SourceMapManager} whenever it starts loading the
     * source map for a given {@link SDK.Script.Script}. The `CompilerScriptMapping` will set up a
     * {@link Workspace.UISourceCode.UISourceCode} stub for the time that the source map is being
     * loaded to avoid showing the generated code when the DevTools front-end is stopped early (for
     * example on a breakpoint).
     *
     * @param event holds the {@link SDK.Script.Script} whose source map is being loaded.
     */
    private sourceMapWillAttach;
    /**
     * Invoked by the {@link SDK.SourceMapManager.SourceMapManager} after an attempt to load the
     * source map for a given {@link SDK.Script.Script} failed. The `CompilerScriptMapping` will
     * remove the {@link Workspace.UISourceCode.UISourceCode} stub, and from this time on won't
     * report any mappings for the `client` script.
     *
     * @param event holds the {@link SDK.Script.Script} whose source map failed to load.
     */
    private sourceMapFailedToAttach;
    /**
     * Invoked by the {@link SDK.SourceMapManager.SourceMapManager} after an attempt to load the
     * source map for a given {@link SDK.Script.Script} succeeded. The `CompilerScriptMapping` will
     * now create {@link Workspace.UISourceCode.UISourceCode}s for all the sources mentioned in the
     * `sourceMap`.
     *
     * In case of a conflict this method creates a new {@link Workspace.UISourceCode.UISourceCode}
     * and copies over all the mappings from the other source maps that were registered for the
     * same URL and which are compatible (agree on the content and ignore-list hint for the given
     * URL). If they are considered incompatible, the original `UISourceCode` will simply be
     * removed and a new mapping will be established.
     *
     * @param event holds the {@link SDK.Script.Script} and its {@link SDK.SourceMap.SourceMap}.
     */
    private sourceMapAttached;
    /**
     * Invoked by the {@link SDK.SourceMapManager.SourceMapManager} when the source map for a given
     * {@link SDK.Script.Script} is removed, which could be either because the target is execution
     * context was destroyed, or the user manually asked to replace the source map for a given
     * script.
     *
     * @param event holds the {@link SDK.Script.Script} and {@link SDK.SourceMap.SourceMap} that
     *              should be detached.
     */
    private sourceMapDetached;
    scriptsForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): SDK.Script.Script[];
    private sourceMapAttachedForTest;
    dispose(): void;
}
