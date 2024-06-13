import * as TraceEngine from '../../models/trace/trace.js';
export declare class EventsSerializer {
    #private;
    keyForEvent(event: TraceEngine.Types.TraceEvents.TraceEventData): TraceEngine.Types.File.TraceEventSerializableKey | null;
    eventForKey(key: TraceEngine.Types.File.TraceEventSerializableKey, traceParsedData: TraceEngine.Handlers.Types.TraceParseData): TraceEngine.Types.TraceEvents.TraceEventData;
    static isProfileCallKey(key: TraceEngine.Types.File.TraceEventSerializableKeyValues): key is TraceEngine.Types.File.ProfileCallKeyValues;
    static isRawEventKey(key: TraceEngine.Types.File.TraceEventSerializableKeyValues): key is TraceEngine.Types.File.RawEventKeyValues;
    static isSyntheticEventKey(key: TraceEngine.Types.File.TraceEventSerializableKeyValues): key is TraceEngine.Types.File.SyntheticEventKeyValues;
}
