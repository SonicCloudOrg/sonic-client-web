import * as TraceEngine from '../../models/trace/trace.js';
export declare class StateChangedEvent extends Event {
    state: Readonly<State>;
    updateType: 'RESET' | 'MINIMAP_BOUNDS' | 'VISIBLE_WINDOW';
    options: {
        shouldAnimate?: boolean;
    };
    static readonly eventName = "traceboundsstatechanged";
    constructor(state: Readonly<State>, updateType: 'RESET' | 'MINIMAP_BOUNDS' | 'VISIBLE_WINDOW', options?: {
        shouldAnimate?: boolean;
    });
}
export declare function onChange(cb: (event: StateChangedEvent) => void): void;
export declare function removeListener(cb: (event: StateChangedEvent) => void): void;
export interface State {
    readonly micro: Readonly<TraceWindows<TraceEngine.Types.Timing.MicroSeconds>>;
    readonly milli: Readonly<TraceWindows<TraceEngine.Types.Timing.MilliSeconds>>;
}
export interface TraceWindows<TimeFormat extends TraceEngine.Types.Timing.MicroSeconds | TraceEngine.Types.Timing.MilliSeconds> {
    /**
     * This is the bounds of the entire trace. Once a trace is imported/recorded
     * and this is set, it cannot be changed.
     */
    readonly entireTraceBounds: TraceEngine.Types.Timing.TraceWindow<TimeFormat>;
    /**
     * This is the bounds of the minimap and represents the left and right bound
     * being shown by the minimap. It can be changed by a user action: for
     * example, when a user creates a breadcrumb, that breadcrumb becomes the
     * minimap trace bounds. By default, and when a trace is first loaded, the
     * minimapTraceBounds are equivalent to the entireTraceBounds.
     * Note that this is NOT the active time window that the user has dragged
     * the minimap handles to; this is the min/max being shown by the minimap.
     */
    minimapTraceBounds: TraceEngine.Types.Timing.TraceWindow<TimeFormat>;
    /**
     * This represents the trace window that is being shown on the main timeline.
     * The reason this is called a "Window" rather than "Bounds" is because the
     * user is not bound by this value - they can use their mouse to pan/zoom
     * in/out beyond the limits of this window (the limit is the
     * minimapTraceBounds). Another way to think of this value is that the
     * min/max of this value is what is represented by the two drag handles on
     * the TimelineMiniMap that the user can drag to change their current window.
     */
    timelineTraceWindow: TraceEngine.Types.Timing.TraceWindow<TimeFormat>;
}
export declare class BoundsManager extends EventTarget {
    #private;
    static instance(opts?: {
        forceNew: boolean | null;
    }): BoundsManager;
    static removeInstance(): void;
    private constructor();
    resetWithNewBounds(initialBounds: TraceEngine.Types.Timing.TraceWindowMicroSeconds): this;
    state(): Readonly<State> | null;
    setMiniMapBounds(newBounds: TraceEngine.Types.Timing.TraceWindowMicroSeconds): void;
    setTimelineVisibleWindow(newWindow: TraceEngine.Types.Timing.TraceWindowMicroSeconds, options?: {
        shouldAnimate: boolean;
    }): void;
}
