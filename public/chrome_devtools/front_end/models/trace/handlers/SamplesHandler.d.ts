import * as CPUProfile from '../../cpu_profile/cpu_profile.js';
import * as Helpers from '../helpers/helpers.js';
import * as Types from '../types/types.js';
declare const profilesInProcess: Map<Types.TraceEvents.ProcessID, Map<Types.TraceEvents.ThreadID, ProfileData>>;
declare const entryToNode: Map<Types.TraceEvents.SyntheticTraceEntry, Helpers.TreeHelpers.TraceEntryNode>;
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export declare function data(): SamplesHandlerData;
export interface SamplesHandlerData {
    profilesInProcess: typeof profilesInProcess;
    entryToNode: typeof entryToNode;
}
export type ProfileData = {
    profileId: Types.TraceEvents.ProfileID;
    rawProfile: CPUProfile.CPUProfileDataModel.ExtendedProfile;
    parsedProfile: CPUProfile.CPUProfileDataModel.CPUProfileDataModel;
    /**
     * Contains the calls built from the CPU profile samples.
     * Note: This doesn't contain real trace events coming from the
     * browser, only calls synthetically typed as trace events for
     * compatibility, as such it only makes sense to use them in pure CPU
     * profiles.
     *
     * If you need the profile calls from a CPU profile obtained from a
     * web trace, use the data exported by the RendererHandler instead.
     */
    profileCalls: Types.TraceEvents.SyntheticProfileCall[];
    /**
     * Contains the call tree built from the CPU profile samples.
     * Similar to the profileCalls field, this tree does not contain nor
     * take into account trace events, as such it only makes sense to use
     * them in pure CPU profiles.
     */
    profileTree?: Helpers.TreeHelpers.TraceEntryTree;
};
/**
 * Returns the name of a function for a given synthetic profile call.
 * We first look to find the ProfileNode representing this call, and use its
 * function name. This is preferred (and should always exist) because if we
 * resolve sourcemaps, we will update this name. If that name is not present,
 * we fall back to the function name that was in the callframe that we got
 * when parsing the profile's trace data.
 */
export declare function getProfileCallFunctionName(data: SamplesHandlerData, entry: Types.TraceEvents.SyntheticProfileCall): string;
export {};
