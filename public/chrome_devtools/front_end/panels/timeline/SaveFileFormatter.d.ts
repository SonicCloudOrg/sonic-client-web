import type * as Protocol from '../../generated/protocol.js';
import type * as TraceEngine from '../../models/trace/trace.js';
/**
 * Generates a JSON representation of an array of objects with the objects
 * printed one per line for improved readability (but not *too* verbose).
 */
export declare function arrayOfObjectsJsonGenerator(arrayOfObjects: readonly TraceEngine.Types.TraceEvents.TraceEventData[]): IterableIterator<string>;
/**
 * Generates a JSON representation of traceData line-by-line for a nicer printed
 * version with one trace event per line.
 */
export declare function traceJsonGenerator(traceEvents: readonly TraceEngine.Types.TraceEvents.TraceEventData[], metadata: Readonly<TraceEngine.Types.File.MetaData> | null): IterableIterator<string>;
/**
 * Generates a JSON representation of CPU profile.
 */
export declare function cpuprofileJsonGenerator(cpuprofile: Protocol.Profiler.Profile): string;
