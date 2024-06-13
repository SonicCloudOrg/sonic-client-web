import * as Types from '../types/types.js';
import { type TraceEventHandlerName } from './types.js';
export declare const LONG_INTERACTION_THRESHOLD: Types.Timing.MicroSeconds;
export interface UserInteractionsData {
    /** All the user events we found in the trace */
    allEvents: readonly Types.TraceEvents.TraceEventEventTiming[];
    /** All the BeginCommitCompositorFrame events we found in the trace */
    beginCommitCompositorFrameEvents: readonly Types.TraceEvents.TraceEventBeginCommitCompositorFrame[];
    /** All the interaction events we found in the trace that had an
     * interactionId and a duration > 0
     **/
    interactionEvents: readonly Types.TraceEvents.SyntheticInteractionPair[];
    /** If the user rapidly generates interaction events (think typing into a
     * text box), in the UI we only really want to show the user the longest
     * interaction in that set.
     * For example picture interactions like this:
     * ===[interaction A]==========
     *       =[interaction B]======
     *            =[interaction C]=
     *
     * These events all end at the same time, and so in this instance we only want
     * to show the first interaction A on the timeline, as that is the longest one
     * and the one the developer should be focusing on. So this array of events is
     * all the interaction events filtered down, removing any nested interactions
     * entirely.
     **/
    interactionEventsWithNoNesting: readonly Types.TraceEvents.SyntheticInteractionPair[];
    longestInteractionEvent: Readonly<Types.TraceEvents.SyntheticInteractionPair> | null;
    interactionsOverThreshold: Readonly<Set<Types.TraceEvents.SyntheticInteractionPair>>;
}
export declare function reset(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export type InteractionCategory = 'KEYBOARD' | 'POINTER' | 'OTHER';
export declare function categoryOfInteraction(interaction: Types.TraceEvents.SyntheticInteractionPair): InteractionCategory;
/**
 * We define a set of interactions as nested where:
 * 1. Their end times align.
 * 2. The longest interaction's start time is earlier than all other
 * interactions with the same end time.
 * 3. The interactions are of the same category [each interaction is either
 * categorised as keyboard, or pointer.]
 *
 * =============A=[pointerup]=
 *        ====B=[pointerdown]=
 *        ===C=[pointerdown]==
 *         ===D=[pointerup]===
 *
 * In this example, B, C and D are all nested and therefore should not be
 * returned from this function.
 *
 * However, in this example we would only consider B nested (under A) and D
 * nested (under C). A and C both stay because they are of different types.
 * ========A=[keydown]====
 *   =======B=[keyup]=====
 *    ====C=[pointerdown]=
 *         =D=[pointerup]=
 **/
export declare function removeNestedInteractions(interactions: readonly Types.TraceEvents.SyntheticInteractionPair[]): readonly Types.TraceEvents.SyntheticInteractionPair[];
export declare function finalize(): Promise<void>;
export declare function data(): UserInteractionsData;
export declare function deps(): TraceEventHandlerName[];
