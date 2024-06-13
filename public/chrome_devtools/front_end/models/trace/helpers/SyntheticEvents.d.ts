import type * as Types from '../types/types.js';
export declare class SyntheticEventsManager {
    #private;
    /**
     * Initializes a SyntheticEventsManager for a trace. This needs to be
     * called before running the trace engine handlers, since the instance
     * created here will be used by the handlers to register their
     * synthetic trace events.
     */
    static initSyntheticEventsManagerForTrace(rawEvents: readonly Types.TraceEvents.TraceEventData[]): SyntheticEventsManager;
    /**
     * Gets the SyntheticEventsManager instance for a trace given the index
     * of the trace given its index used in Model#traces. If no index is
     * passed, defaults to the last created instance.
     * If no instance is found throws error.
     */
    static getManagerForTrace(traceIndex?: number): SyntheticEventsManager;
    static getActiveManager(): SyntheticEventsManager;
    static reset(): void;
    static registerSyntheticBasedEvent<T extends Types.TraceEvents.SyntheticBasedEvent>(syntheticEvent: Omit<T, '_tag'>): T;
    private constructor();
    /**
     * Registers and returns a branded synthetic event. Synthetic events need to
     * be created with this method to ensure they are registered and made
     * available to load events using serialized keys.
     */
    registerSyntheticBasedEvent<T extends Types.TraceEvents.SyntheticBasedEvent>(syntheticEvent: Omit<T, '_tag'>): T;
    syntheticEventForRawEventIndex(rawEventIndex: number): Types.TraceEvents.SyntheticBasedEvent;
    getSyntheticTraceEvents(): Types.TraceEvents.SyntheticBasedEvent[];
    getRawTraceEvents(): readonly Types.TraceEvents.TraceEventData[];
}
