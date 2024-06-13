/**
 * Components don't orchestrate their DOM updates in a wider context
 * (i.e. the host frame's document), which leads to interleaved reading
 * and writing of layout-centric values, e.g. clientHeight, scrollTop etc.
 *
 * This helper to ensure that we do reads, writes, and scrolls at the
 * correct point in the frame lifecycle. It groups reads to the start of a
 * frame, where we can assume layout-centric values are available on the
 * basis of the last completed frame, and then it runs all writes
 * afterwards. In the event that a read / write / scroll callback contains
 * calls for more read / write / scroll calls, such calls will be scheduled
 * for the next available frame.
 */
interface CoordinatorCallback<T> {
    (): T | PromiseLike<T>;
}
interface CoordinatorLogEntry {
    time: number;
    value: string;
}
export declare class RenderCoordinatorQueueEmptyEvent extends Event {
    static readonly eventName = "renderqueueempty";
    constructor();
}
export declare class RenderCoordinatorNewFrameEvent extends Event {
    static readonly eventName = "newframe";
    constructor();
}
export declare class RenderCoordinator extends EventTarget {
    #private;
    static instance({ forceNew }?: {
        forceNew?: boolean | undefined;
    }): RenderCoordinator;
    static pendingFramesCount(): number;
    observe: boolean;
    recordStorageLimit: number;
    observeOnlyNamed: boolean;
    hasPendingWork(): boolean;
    done(options?: {
        waitForWork: boolean;
    }): Promise<void>;
    read<T>(callback: CoordinatorCallback<T>): Promise<T>;
    read<T>(label: string, callback: CoordinatorCallback<T>): Promise<T>;
    write<T>(callback: CoordinatorCallback<T>): Promise<T>;
    write<T>(label: string, callback: CoordinatorCallback<T>): Promise<T>;
    takeRecords(): CoordinatorLogEntry[];
    /**
     * We offer a convenience function for scroll-based activity, but often triggering a scroll
     * requires a layout pass, thus it is better handled as a read activity, i.e. we wait until
     * the layout-triggering work has been completed then it should be possible to scroll without
     * first forcing layout.  If multiple jobs are scheduled with the same non-empty label, only
     * the latest callback would be executed. Such invocations would return the same promise that
     * will resolve when the latest callback is run.
     */
    scroll<T>(callback: CoordinatorCallback<T>): Promise<T>;
    scroll<T>(label: string, callback: CoordinatorCallback<T>): Promise<T>;
    cancelPending(): void;
}
export {};
