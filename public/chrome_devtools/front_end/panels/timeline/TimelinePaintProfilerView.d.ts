import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class TimelinePaintProfilerView extends UI.SplitWidget.SplitWidget {
    #private;
    private readonly logAndImageSplitWidget;
    private readonly imageView;
    private readonly paintProfilerView;
    private readonly logTreeView;
    private needsUpdateWhenVisible;
    private pendingSnapshot;
    private event;
    private paintProfilerModel;
    private lastLoadedSnapshot;
    constructor(traceEngineData: TraceEngine.Handlers.Types.TraceParseData);
    wasShown(): void;
    setSnapshot(snapshot: SDK.PaintProfiler.PaintProfilerSnapshot): void;
    setEvent(paintProfilerModel: SDK.PaintProfiler.PaintProfilerModel, event: TraceEngine.Types.TraceEvents.TraceEventData): boolean;
    private updateWhenVisible;
    private update;
    private releaseSnapshot;
    private onWindowChanged;
}
export declare class TimelinePaintImageView extends UI.Widget.Widget {
    private imageContainer;
    private imageElement;
    private readonly maskElement;
    private transformController;
    private maskRectangle?;
    constructor();
    onResize(): void;
    private updateImagePosition;
    showImage(imageURL?: string): void;
    setMask(maskRectangle: Protocol.DOM.Rect | null): void;
    wasShown(): void;
}
