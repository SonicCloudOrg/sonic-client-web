import * as Common from '../common/common.js';
import type * as Protocol from '../../generated/protocol.js';
import { type Resource } from './Resource.js';
import { ResourceTreeModel, type ResourceTreeFrame } from './ResourceTreeModel.js';
import { type Target } from './Target.js';
import { type SDKModelObserver } from './TargetManager.js';
/**
 * The FrameManager is a central storage for all #frames. It collects #frames from all
 * ResourceTreeModel-instances (one per target), so that #frames can be found by id
 * without needing to know their target.
 */
export declare class FrameManager extends Common.ObjectWrapper.ObjectWrapper<EventTypes> implements SDKModelObserver<ResourceTreeModel> {
    #private;
    constructor();
    static instance({ forceNew }?: {
        forceNew: boolean;
    }): FrameManager;
    modelAdded(resourceTreeModel: ResourceTreeModel): void;
    modelRemoved(resourceTreeModel: ResourceTreeModel): void;
    private frameAdded;
    private frameDetached;
    private frameNavigated;
    private resourceAdded;
    private decreaseOrRemoveFrame;
    /**
     * Looks for the outermost frame in `#frames` and sets `#outermostFrame` accordingly.
     *
     * Important: This method needs to be called everytime `#frames` is updated.
     */
    private resetOutermostFrame;
    /**
     * Returns the ResourceTreeFrame with a given frameId.
     * When a frame is being detached a new ResourceTreeFrame but with the same
     * frameId is created. Consequently getFrame() will return a different
     * ResourceTreeFrame after detachment. Callers of getFrame() should therefore
     * immediately use the function return value and not store it for later use.
     */
    getFrame(frameId: Protocol.Page.FrameId): ResourceTreeFrame | null;
    getAllFrames(): ResourceTreeFrame[];
    getOutermostFrame(): ResourceTreeFrame | null;
    getOrWaitForFrame(frameId: Protocol.Page.FrameId, notInTarget?: Target): Promise<ResourceTreeFrame>;
    private resolveAwaitedFrame;
}
export declare const enum Events {
    FrameAddedToTarget = "FrameAddedToTarget",
    FrameNavigated = "FrameNavigated",
    FrameRemoved = "FrameRemoved",
    ResourceAdded = "ResourceAdded",
    OutermostFrameNavigated = "OutermostFrameNavigated"
}
export type EventTypes = {
    [Events.FrameAddedToTarget]: {
        frame: ResourceTreeFrame;
    };
    [Events.FrameNavigated]: {
        frame: ResourceTreeFrame;
    };
    [Events.FrameRemoved]: {
        frameId: Protocol.Page.FrameId;
    };
    [Events.ResourceAdded]: {
        resource: Resource;
    };
    [Events.OutermostFrameNavigated]: {
        frame: ResourceTreeFrame;
    };
};
