import * as Types from '../types/types.js';
export interface AnimationData {
    animations: readonly Types.TraceEvents.SyntheticAnimationPair[];
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): AnimationData;
