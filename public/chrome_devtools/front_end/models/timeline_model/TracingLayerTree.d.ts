import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as TraceEngine from '../trace/trace.js';
export declare class TracingLayerTree extends SDK.LayerTreeBase.LayerTreeBase {
    private tileById;
    private paintProfilerModel;
    constructor(target: SDK.Target.Target | null);
    setLayers(root: TracingLayerPayload | null, layers: TracingLayerPayload[] | null, paints: TraceEngine.Handlers.ModelHandlers.Frames.LayerPaintEvent[]): Promise<void>;
    setTiles(tiles: TracingLayerTile[]): void;
    pictureForRasterTile(tileId: string): Promise<SDK.PaintProfiler.SnapshotWithRect | null>;
    private setPaints;
    private innerSetLayers;
    private extractNodeIdsToResolve;
}
export declare class TracingFrameLayerTree {
    #private;
    constructor(target: SDK.Target.Target | null, data: TraceEngine.Handlers.ModelHandlers.Frames.FrameLayerTreeData);
    layerTreePromise(): Promise<TracingLayerTree | null>;
    paints(): TraceEngine.Handlers.ModelHandlers.Frames.LayerPaintEvent[];
}
export declare class TracingLayer implements SDK.LayerTreeBase.Layer {
    private parentLayerId;
    private parentInternal;
    private layerId;
    private nodeInternal;
    private offsetXInternal;
    private offsetYInternal;
    private widthInternal;
    private heightInternal;
    private childrenInternal;
    private quadInternal;
    private scrollRectsInternal;
    private gpuMemoryUsageInternal;
    private paints;
    private compositingReasons;
    private compositingReasonIds;
    private drawsContentInternal;
    private paintProfilerModel;
    constructor(paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel | null, payload: TracingLayerPayload);
    reset(payload: TracingLayerPayload): void;
    id(): string;
    parentId(): string | null;
    parent(): SDK.LayerTreeBase.Layer | null;
    isRoot(): boolean;
    children(): SDK.LayerTreeBase.Layer[];
    addChild(childParam: SDK.LayerTreeBase.Layer): void;
    setNode(node: SDK.DOMModel.DOMNode | null): void;
    node(): SDK.DOMModel.DOMNode | null;
    nodeForSelfOrAncestor(): SDK.DOMModel.DOMNode | null;
    offsetX(): number;
    offsetY(): number;
    width(): number;
    height(): number;
    transform(): number[] | null;
    quad(): number[];
    anchorPoint(): number[];
    invisible(): boolean;
    paintCount(): number;
    lastPaintRect(): Protocol.DOM.Rect | null;
    scrollRects(): Protocol.LayerTree.ScrollRect[];
    stickyPositionConstraint(): SDK.LayerTreeBase.StickyPositionConstraint | null;
    gpuMemoryUsage(): number;
    snapshots(): Promise<SDK.PaintProfiler.SnapshotWithRect | null>[];
    pictureForRect(targetRect: number[]): Promise<SDK.PaintProfiler.SnapshotWithRect | null>;
    private scrollRectsFromParams;
    private createScrollRects;
    addPaintEvent(paint: TraceEngine.Handlers.ModelHandlers.Frames.LayerPaintEvent): void;
    requestCompositingReasons(): Promise<string[]>;
    requestCompositingReasonIds(): Promise<string[]>;
    drawsContent(): boolean;
}
export interface TracingLayerPayload {
    bounds: {
        height: number;
        width: number;
    };
    children: TracingLayerPayload[];
    layer_id: number;
    position: number[];
    scroll_offset: number[];
    layer_quad: number[];
    draws_content: number;
    gpu_memory_usage: number;
    transform: number[];
    owner_node: Protocol.DOM.BackendNodeId;
    compositing_reasons: string[];
    compositing_reason_ids: string[];
    non_fast_scrollable_region: number[];
    touch_event_handler_region: number[];
    wheel_event_handler_region: number[];
    scroll_event_handler_region: number[];
}
export interface TracingLayerTile {
    id: string;
    layer_id: string;
    gpu_memory_usage: number;
    content_rect: number[];
}
