import type * as Protocol from '../../generated/protocol.js';
import { ProfileNode, ProfileTreeModel } from './ProfileTreeModel.js';
export declare class CPUProfileNode extends ProfileNode {
    id: number;
    self: number;
    positionTicks: Protocol.Profiler.PositionTickInfo[] | undefined;
    deoptReason: string | null;
    constructor(node: Protocol.Profiler.ProfileNode, samplingInterval: number);
}
export declare class CPUProfileDataModel extends ProfileTreeModel {
    #private;
    profileStartTime: number;
    profileEndTime: number;
    timestamps: number[];
    samples: number[] | undefined;
    lines?: number[];
    totalHitCount: number;
    profileHead: CPUProfileNode;
    gcNode?: ProfileNode;
    programNode?: ProfileNode;
    idleNode?: ProfileNode;
    constructor(profile: ExtendedProfile);
    private compatibilityConversionHeadToNodes;
    /**
     * Calculate timestamps using timeDeltas. Some CPU profile formats,
     * like the ones contained in traces have timeDeltas instead of
     * timestamps.
     */
    private convertTimeDeltas;
    /**
     * Creates a Tree of CPUProfileNodes using the Protocol.Profiler.ProfileNodes.
     * As the tree is built, samples of native code (prefixed with "native ") are
     * filtered out. Samples of filtered nodes are replaced with the parent of the
     * node being filtered.
     *
     * This function supports legacy and new definitions of the CDP Profiler.Profile
     * type.
     */
    private translateProfileTree;
    /**
     * Sorts the samples array using the timestamps array (there is a one
     * to one matching by index between the two).
     */
    private sortSamples;
    /**
     * Fills in timestamps and/or time deltas from legacy profiles where
     * they could be missing.
     */
    private normalizeTimestamps;
    /**
     * Some nodes do not refer to JS samples but to V8 system tasks, AKA
     * "meta" nodes. This function extracts those nodes from the profile.
     */
    private extractMetaNodes;
    private fixMissingSamples;
    /**
     * Traverses the call tree derived from the samples calling back when a call is opened
     * and when it's closed
     */
    forEachFrame(openFrameCallback: (depth: number, node: ProfileNode, sampleIndex: number, timestamp: number) => void, closeFrameCallback: (depth: number, node: ProfileNode, sampleIndex: number, timestamp: number, dur: number, selfTime: number) => void, startTime?: number, stopTime?: number): void;
    /**
     * Returns the node that corresponds to a given index of a sample.
     */
    nodeByIndex(index: number): ProfileNode | null;
    /**
     * Returns the node that corresponds to a given node id.
     */
    nodeById(nodeId: number): ProfileNode | null;
    nodes(): ProfileNode[] | null;
}
export type ExtendedProfileNode = Protocol.Profiler.ProfileNode & {
    parent?: number;
};
export type ExtendedProfile = Protocol.Profiler.Profile & {
    nodes: Protocol.Profiler.ProfileNode[] | ExtendedProfileNode[];
    lines?: number[];
};
