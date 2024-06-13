import * as Handlers from './handlers/handlers.js';
import * as Helpers from './helpers/helpers.js';
import type * as Insights from './insights/insights.js';
import * as Types from './types/types.js';
export interface ParseConfig {
    metadata?: Types.File.MetaData;
    isFreshRecording?: boolean;
}
/**
 * The new trace engine model we are migrating to. The Model is responsible for
 * parsing arrays of raw trace events and storing the resulting data. It can
 * store multiple traces at once, and can return the data for any of them.
 * Currently as we migrate from the old engine to this, we are turning on the
 * model handlers incrementally as we need the data, to save performance costs
 * of running handlers that we do not use. Therefore, when the model is
 * constructed we pass through a set of handlers that should be used. Once we
 * have migrated all tracks in the Performance Panel to this model, we can
 * remove this ability to run a subset of handlers, as we will need all handlers
 * to be used at that point. For tests, if you want to construct a model with
 * all handlers, you can use the static `Model.createWithAllHandlers` method.
 **/
export declare class Model<EnabledModelHandlers extends {
    [key: string]: Handlers.Types.TraceEventHandler;
} = typeof Handlers.ModelHandlers> extends EventTarget {
    #private;
    static createWithAllHandlers(config?: Types.Configuration.Configuration): Model<typeof Handlers.ModelHandlers>;
    constructor(handlers: EnabledModelHandlers, config?: Types.Configuration.Configuration);
    /**
     * Parses an array of trace events into a structured object containing all the
     * information parsed by the trace handlers.
     * You can `await` this function to pause execution until parsing is complete,
     * or instead rely on the `ModuleUpdateEvent` that is dispatched when the
     * parsing is finished.
     *
     * Once parsed, you then have to call the `traceParsedData` method, providing an
     * index of the trace you want to have the data for. This is because any model
     * can store a number of traces. Each trace is given an index, which starts at 0
     * and increments by one as a new trace is parsed.
     *
     * @example
     * // Awaiting the parse method() to block until parsing complete
     * await this.traceModel.parse(events);
     * const data = this.traceModel.traceParsedData(0)
     *
     * @example
     * // Using an event listener to be notified when tracing is complete.
     * this.traceModel.addEventListener(Trace.ModelUpdateEvent.eventName, (event) => {
     *   if(event.data.data === 'done') {
     *     // trace complete
     *     const data = this.traceModel.traceParsedData(0);
     *   }
     * });
     * void this.traceModel.parse(events);
     **/
    parse(traceEvents: readonly Types.TraceEvents.TraceEventData[], config?: ParseConfig): Promise<void>;
    /**
     * Returns the parsed trace data indexed by the order in which it was stored.
     * If no index is given, the last stored parsed data is returned.
     */
    traceParsedData(index?: number): Handlers.Types.EnabledHandlerDataWithMeta<EnabledModelHandlers> | null;
    traceInsights(index?: number): Insights.Types.TraceInsightData<EnabledModelHandlers> | null;
    metadata(index?: number): Types.File.MetaData | null;
    overrideModifications(index: number, newModifications: Types.File.Modifications): void;
    rawTraceEvents(index?: number): readonly Types.TraceEvents.TraceEventData[] | null;
    syntheticTraceEventsManager(index?: number): Helpers.SyntheticEvents.SyntheticEventsManager | null;
    size(): number;
    deleteTraceByIndex(recordingIndex: number): void;
    getRecordingsAvailable(): string[];
    resetProcessor(): void;
}
/**
 * This parsed trace file is used by the Model. It keeps multiple instances
 * of these so that the user can swap between them. The key is that it is
 * essentially the TraceFile plus whatever the model has parsed from it.
 */
export type ParsedTraceFile<Handlers extends {
    [key: string]: Handlers.Types.TraceEventHandler;
}> = Types.File.TraceFile & {
    traceParsedData: Handlers.Types.EnabledHandlerDataWithMeta<Handlers> | null;
    traceInsights: Insights.Types.TraceInsightData<Handlers> | null;
};
export declare const enum ModelUpdateType {
    COMPLETE = "COMPLETE",
    PROGRESS_UPDATE = "PROGRESS_UPDATE"
}
export type ModelUpdateEventData = ModelUpdateEventComplete | ModelUpdateEventProgress;
export type ModelUpdateEventComplete = {
    type: ModelUpdateType.COMPLETE;
    data: 'done';
};
export type ModelUpdateEventProgress = {
    type: ModelUpdateType.PROGRESS_UPDATE;
    data: TraceParseEventProgressData;
};
export type TraceParseEventProgressData = {
    index: number;
    total: number;
};
export declare class ModelUpdateEvent extends Event {
    data: ModelUpdateEventData;
    static readonly eventName = "modelupdate";
    constructor(data: ModelUpdateEventData);
}
declare global {
    interface HTMLElementEventMap {
        [ModelUpdateEvent.eventName]: ModelUpdateEvent;
    }
}
export declare function isModelUpdateDataComplete(eventData: ModelUpdateEventData): eventData is ModelUpdateEventComplete;
export declare function isModelUpdateDataProgress(eventData: ModelUpdateEventData): eventData is ModelUpdateEventProgress;
