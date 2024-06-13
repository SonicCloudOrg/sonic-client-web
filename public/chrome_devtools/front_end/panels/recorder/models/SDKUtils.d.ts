import type * as Protocol from '../../../generated/protocol.js';
import * as SDK from '../../../core/sdk/sdk.js';
import { type Target, type FrameSelector } from './Schema.js';
interface Context {
    target: Target;
    frame: FrameSelector;
}
export declare function getTargetName(target: SDK.Target.Target): string;
/**
 * Returns the context for an SDK target and frame.
 * The frame is identified by the path in the resource tree model.
 * And the target is identified by `getTargetName`.
 */
export declare function getTargetFrameContext(target: SDK.Target.Target, frame: SDK.ResourceTreeModel.ResourceTreeFrame): Context;
export declare function evaluateInAllFrames(worldName: string, target: SDK.Target.Target, expression: string): Promise<void>;
export declare function findTargetByExecutionContext(targets: Iterable<SDK.Target.Target>, executionContextId: number): SDK.Target.Target | undefined;
export declare function findFrameIdByExecutionContext(targets: Iterable<SDK.Target.Target>, executionContextId: number): Protocol.Page.FrameId | undefined;
export declare const isFrameTargetInfo: (target: Protocol.Target.TargetInfo) => boolean;
export {};
