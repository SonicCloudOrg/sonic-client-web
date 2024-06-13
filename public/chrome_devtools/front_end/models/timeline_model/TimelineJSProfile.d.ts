import type * as Protocol from '../../generated/protocol.js';
import * as TraceEngine from '../trace/trace.js';
export declare class TimelineJSProfileProcessor {
    static isNativeRuntimeFrame(frame: Protocol.Runtime.CallFrame): boolean;
    static nativeGroup(nativeName: string): string | null;
    static createFakeTraceFromCpuProfile(profile: Protocol.Profiler.Profile, tid: TraceEngine.Types.TraceEvents.ThreadID): TraceEngine.Types.TraceEvents.TraceEventData[];
}
export declare namespace TimelineJSProfileProcessor {
    const enum NativeGroups {
        Compile = "Compile",
        Parse = "Parse"
    }
}
