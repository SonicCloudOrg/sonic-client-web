import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import { type FrameAssociated } from './FrameAssociated.js';
import { type Target } from './Target.js';
import { SourceMap } from './SourceMap.js';
export declare class SourceMapManager<T extends FrameAssociated> extends Common.ObjectWrapper.ObjectWrapper<EventTypes<T>> {
    #private;
    constructor(target: Target);
    setEnabled(isEnabled: boolean): void;
    private static getBaseUrl;
    static resolveRelativeSourceURL(target: Target | null, url: Platform.DevToolsPath.UrlString): Platform.DevToolsPath.UrlString;
    private inspectedURLChanged;
    sourceMapForClient(client: T): SourceMap | undefined;
    sourceMapForClientPromise(client: T): Promise<SourceMap | undefined>;
    clientForSourceMap(sourceMap: SourceMap): T | undefined;
    attachSourceMap(client: T, relativeSourceURL: Platform.DevToolsPath.UrlString, relativeSourceMapURL: string | undefined): void;
    cancelAttachSourceMap(client: T): void;
    detachSourceMap(client: T): void;
    dispose(): void;
}
export declare enum Events {
    SourceMapWillAttach = "SourceMapWillAttach",
    SourceMapFailedToAttach = "SourceMapFailedToAttach",
    SourceMapAttached = "SourceMapAttached",
    SourceMapDetached = "SourceMapDetached"
}
export type EventTypes<T extends FrameAssociated> = {
    [Events.SourceMapWillAttach]: {
        client: T;
    };
    [Events.SourceMapFailedToAttach]: {
        client: T;
    };
    [Events.SourceMapAttached]: {
        client: T;
        sourceMap: SourceMap;
    };
    [Events.SourceMapDetached]: {
        client: T;
        sourceMap: SourceMap;
    };
};
