import type * as Protocol from '../../../generated/protocol.js';
import * as Types from '../types/types.js';
import { ScoreClassification } from './PageLoadMetricsHandler.js';
import { type TraceEventHandlerName } from './types.js';
interface LayoutShifts {
    clusters: readonly LayoutShiftCluster[];
    sessionMaxScore: number;
    clsWindowID: number;
    prePaintEvents: Types.TraceEvents.TraceEventPrePaint[];
    layoutInvalidationEvents: readonly Types.TraceEvents.TraceEventLayoutInvalidationTracking[];
    scheduleStyleInvalidationEvents: readonly Types.TraceEvents.TraceEventScheduleStyleInvalidationTracking[];
    styleRecalcInvalidationEvents: readonly Types.TraceEvents.TraceEventStyleRecalcInvalidationTracking[];
    renderFrameImplCreateChildFrameEvents: readonly Types.TraceEvents.TraceEventRenderFrameImplCreateChildFrame[];
    scoreRecords: readonly ScoreRecord[];
    backendNodeIds: Protocol.DOM.BackendNodeId[];
}
export declare const MAX_CLUSTER_DURATION: Types.Timing.MicroSeconds;
export declare const MAX_SHIFT_TIME_DELTA: Types.Timing.MicroSeconds;
type ScoreRecord = {
    ts: number;
    score: number;
};
export declare function initialize(): void;
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): LayoutShifts;
export declare function deps(): TraceEventHandlerName[];
export declare function stateForLayoutShiftScore(score: number): ScoreClassification;
export interface LayoutShiftCluster {
    clusterWindow: Types.Timing.TraceWindowMicroSeconds;
    clusterCumulativeScore: number;
    events: Types.TraceEvents.SyntheticLayoutShift[];
    scoreWindows: {
        good: Types.Timing.TraceWindowMicroSeconds;
        needsImprovement: Types.Timing.TraceWindowMicroSeconds | null;
        bad: Types.Timing.TraceWindowMicroSeconds | null;
    };
}
export declare const enum LayoutShiftsThreshold {
    GOOD = 0,
    NEEDS_IMPROVEMENT = 0.1,
    BAD = 0.25
}
export {};
