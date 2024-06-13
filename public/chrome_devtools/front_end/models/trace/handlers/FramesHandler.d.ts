import * as Types from '../types/types.js';
import { type AuctionWorkletsData } from './AuctionWorkletsHandler.js';
import { type LayerTreeData } from './LayerTreeHandler.js';
import { type MetaHandlerData } from './MetaHandler.js';
import { type RendererHandlerData } from './RendererHandler.js';
import { type TraceEventHandlerName } from './types.js';
export declare function reset(): void;
export declare function initialize(): void;
export declare function handleEvent(event: Types.TraceEvents.TraceEventData): void;
export declare function finalize(): Promise<void>;
export interface FramesData {
    frames: readonly TimelineFrame[];
    framesById: Readonly<Record<number, TimelineFrame | undefined>>;
}
export declare function data(): FramesData;
export declare function deps(): TraceEventHandlerName[];
export declare class TimelineFrameModel {
    #private;
    constructor(allEvents: readonly Types.TraceEvents.TraceEventData[], rendererData: RendererHandlerData, auctionWorkletsData: AuctionWorkletsData, metaData: MetaHandlerData, layerTreeData: LayerTreeData);
    framesById(): Readonly<Record<number, TimelineFrame | undefined>>;
    frames(): TimelineFrame[];
}
export interface FrameLayerTreeData {
    entry: Types.TraceEvents.TraceEventLayerTreeHostImplSnapshot;
    paints: LayerPaintEvent[];
}
export declare class TimelineFrame {
    startTime: Types.Timing.MicroSeconds;
    startTimeOffset: Types.Timing.MicroSeconds;
    endTime: Types.Timing.MicroSeconds;
    duration: Types.Timing.MicroSeconds;
    idle: boolean;
    dropped: boolean;
    isPartial: boolean;
    layerTree: FrameLayerTreeData | null;
    paints: LayerPaintEvent[];
    mainFrameId: number | undefined;
    readonly seqId: number;
    constructor(seqId: number, startTime: Types.Timing.MicroSeconds, startTimeOffset: Types.Timing.MicroSeconds);
    setEndTime(endTime: Types.Timing.MicroSeconds): void;
    setLayerTree(layerTree: FrameLayerTreeData | null): void;
}
export interface LayerPaintEventPicture {
    rect: Array<number>;
    serializedPicture: string;
}
export declare class LayerPaintEvent {
    #private;
    constructor(event: Types.TraceEvents.TraceEventPaint, snapshot: Types.TraceEvents.TraceEventDisplayItemListSnapshot);
    layerId(): number;
    event(): Types.TraceEvents.TraceEventPaint;
    picture(): LayerPaintEventPicture | null;
}
export declare class PendingFrame {
    paints: LayerPaintEvent[];
    mainFrameId: number | undefined;
    triggerTime: number;
    constructor(triggerTime: number);
}
declare class BeginFrameInfo {
    seqId: number;
    startTime: Types.Timing.MicroSeconds;
    isDropped: boolean;
    isPartial: boolean;
    constructor(seqId: number, startTime: Types.Timing.MicroSeconds, isDropped: boolean, isPartial: boolean);
}
export declare class TimelineFrameBeginFrameQueue {
    private queueFrames;
    private mapFrames;
    addFrameIfNotExists(seqId: number, startTime: Types.Timing.MicroSeconds, isDropped: boolean, isPartial: boolean): void;
    setDropped(seqId: number, isDropped: boolean): void;
    setPartial(seqId: number, isPartial: boolean): void;
    processPendingBeginFramesOnDrawFrame(seqId: number): BeginFrameInfo[];
}
export declare function framesWithinWindow(frames: readonly TimelineFrame[], startTime: Types.Timing.MicroSeconds, endTime: Types.Timing.MicroSeconds): TimelineFrame[];
export {};
