// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
import timelinePaintProfilerStyles from './timelinePaintProfiler.css.js';
export class TimelinePaintProfilerView extends UI.SplitWidget.SplitWidget {
    logAndImageSplitWidget;
    imageView;
    paintProfilerView;
    logTreeView;
    needsUpdateWhenVisible;
    pendingSnapshot;
    event;
    paintProfilerModel;
    lastLoadedSnapshot;
    #traceEngineData;
    constructor(traceEngineData) {
        super(false, false);
        this.element.classList.add('timeline-paint-profiler-view');
        this.setSidebarSize(60);
        this.setResizable(false);
        this.#traceEngineData = traceEngineData;
        this.logAndImageSplitWidget = new UI.SplitWidget.SplitWidget(true, false);
        this.logAndImageSplitWidget.element.classList.add('timeline-paint-profiler-log-split');
        this.setMainWidget(this.logAndImageSplitWidget);
        this.imageView = new TimelinePaintImageView();
        this.logAndImageSplitWidget.setMainWidget(this.imageView);
        this.paintProfilerView =
            new LayerViewer.PaintProfilerView.PaintProfilerView(this.imageView.showImage.bind(this.imageView));
        this.paintProfilerView.addEventListener("WindowChanged" /* LayerViewer.PaintProfilerView.Events.WindowChanged */, this.onWindowChanged, this);
        this.setSidebarWidget(this.paintProfilerView);
        this.logTreeView = new LayerViewer.PaintProfilerView.PaintProfilerCommandLogView();
        this.logAndImageSplitWidget.setSidebarWidget(this.logTreeView);
        this.needsUpdateWhenVisible = false;
        this.pendingSnapshot = null;
        this.event = null;
        this.paintProfilerModel = null;
        this.lastLoadedSnapshot = null;
    }
    wasShown() {
        super.wasShown();
        if (this.needsUpdateWhenVisible) {
            this.needsUpdateWhenVisible = false;
            this.update();
        }
    }
    setSnapshot(snapshot) {
        this.releaseSnapshot();
        this.pendingSnapshot = snapshot;
        this.event = null;
        this.updateWhenVisible();
    }
    #rasterEventHasTile(event) {
        const data = event.args.tileData;
        if (!data) {
            return false;
        }
        const frame = this.#traceEngineData.Frames.framesById[data.sourceFrameNumber];
        if (!frame || !frame.layerTree) {
            return false;
        }
        return true;
    }
    setEvent(paintProfilerModel, event) {
        this.releaseSnapshot();
        this.paintProfilerModel = paintProfilerModel;
        this.pendingSnapshot = null;
        this.event = event;
        this.updateWhenVisible();
        if (TraceEngine.Types.TraceEvents.isTraceEventPaint(event)) {
            const snapshot = this.#traceEngineData.LayerTree.paintsToSnapshots.get(event);
            return Boolean(snapshot);
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventRasterTask(event)) {
            return this.#rasterEventHasTile(event);
        }
        return false;
    }
    updateWhenVisible() {
        if (this.isShowing()) {
            this.update();
        }
        else {
            this.needsUpdateWhenVisible = true;
        }
    }
    async #rasterTilePromise(rasterEvent) {
        const data = rasterEvent.args.tileData;
        if (!data) {
            return null;
        }
        if (!data.tileId.id_ref) {
            return null;
        }
        const target = SDK.TargetManager.TargetManager.instance().rootTarget();
        if (!target) {
            return null;
        }
        const frame = this.#traceEngineData.Frames.framesById[data.sourceFrameNumber];
        if (!frame || !frame.layerTree) {
            return null;
        }
        const layerTree = new TimelineModel.TracingLayerTree.TracingFrameLayerTree(target, frame.layerTree);
        const tracingLayerTree = await layerTree.layerTreePromise();
        return tracingLayerTree ? tracingLayerTree.pictureForRasterTile(data.tileId.id_ref) : null;
    }
    update() {
        this.logTreeView.setCommandLog([]);
        void this.paintProfilerView.setSnapshotAndLog(null, [], null);
        let snapshotPromise;
        if (this.pendingSnapshot) {
            snapshotPromise = Promise.resolve({ rect: null, snapshot: this.pendingSnapshot });
        }
        else if (this.event && this.paintProfilerModel && TraceEngine.Types.TraceEvents.isTraceEventPaint(this.event)) {
            // When we process events (TimelineModel#processEvent) and find a
            // snapshot event, we look for the last paint that occurred and link the
            // snapshot to that paint event. That is why here if the event is a Paint
            // event, we look to see if it has had a matching picture event set for
            // it.
            const snapshotEvent = this.#traceEngineData.LayerTree.paintsToSnapshots.get(this.event);
            if (snapshotEvent) {
                const encodedData = snapshotEvent.args.snapshot.skp64;
                snapshotPromise = this.paintProfilerModel.loadSnapshot(encodedData).then(snapshot => {
                    return snapshot && { rect: null, snapshot: snapshot };
                });
            }
            else {
                snapshotPromise = Promise.resolve(null);
            }
        }
        else if (this.event && TraceEngine.Types.TraceEvents.isTraceEventRasterTask(this.event)) {
            snapshotPromise = this.#rasterTilePromise(this.event);
        }
        else {
            console.assert(false, 'Unexpected event type or no snapshot');
            return;
        }
        void snapshotPromise.then(snapshotWithRect => {
            this.releaseSnapshot();
            if (!snapshotWithRect) {
                this.imageView.showImage();
                return;
            }
            const snapshot = snapshotWithRect.snapshot;
            this.lastLoadedSnapshot = snapshot;
            this.imageView.setMask(snapshotWithRect.rect);
            void snapshot.commandLog().then(log => onCommandLogDone.call(this, snapshot, snapshotWithRect.rect, log || []));
        });
        function onCommandLogDone(snapshot, clipRect, log) {
            this.logTreeView.setCommandLog(log || []);
            void this.paintProfilerView.setSnapshotAndLog(snapshot, log || [], clipRect);
        }
    }
    releaseSnapshot() {
        if (!this.lastLoadedSnapshot) {
            return;
        }
        this.lastLoadedSnapshot.release();
        this.lastLoadedSnapshot = null;
    }
    onWindowChanged() {
        this.logTreeView.updateWindow(this.paintProfilerView.selectionWindow());
    }
}
export class TimelinePaintImageView extends UI.Widget.Widget {
    imageContainer;
    imageElement;
    maskElement;
    transformController;
    maskRectangle;
    constructor() {
        super(true);
        this.contentElement.classList.add('fill', 'paint-profiler-image-view');
        this.imageContainer = this.contentElement.createChild('div', 'paint-profiler-image-container');
        this.imageElement = this.imageContainer.createChild('img');
        this.maskElement = this.imageContainer.createChild('div');
        this.imageElement.addEventListener('load', this.updateImagePosition.bind(this), false);
        this.transformController =
            new LayerViewer.TransformController.TransformController(this.contentElement, true);
        this.transformController.addEventListener("TransformChanged" /* LayerViewer.TransformController.Events.TransformChanged */, this.updateImagePosition, this);
    }
    onResize() {
        if (this.imageElement.src) {
            this.updateImagePosition();
        }
    }
    updateImagePosition() {
        const width = this.imageElement.naturalWidth;
        const height = this.imageElement.naturalHeight;
        const clientWidth = this.contentElement.clientWidth;
        const clientHeight = this.contentElement.clientHeight;
        const paddingFraction = 0.1;
        const paddingX = clientWidth * paddingFraction;
        const paddingY = clientHeight * paddingFraction;
        const scaleX = (clientWidth - paddingX) / width;
        const scaleY = (clientHeight - paddingY) / height;
        const scale = Math.min(scaleX, scaleY);
        if (this.maskRectangle) {
            const style = this.maskElement.style;
            style.width = width + 'px';
            style.height = height + 'px';
            style.borderLeftWidth = this.maskRectangle.x + 'px';
            style.borderTopWidth = this.maskRectangle.y + 'px';
            style.borderRightWidth = (width - this.maskRectangle.x - this.maskRectangle.width) + 'px';
            style.borderBottomWidth = (height - this.maskRectangle.y - this.maskRectangle.height) + 'px';
        }
        this.transformController.setScaleConstraints(0.5, 10 / scale);
        let matrix = new WebKitCSSMatrix()
            .scale(this.transformController.scale(), this.transformController.scale())
            .translate(clientWidth / 2, clientHeight / 2)
            .scale(scale, scale)
            .translate(-width / 2, -height / 2);
        const bounds = UI.Geometry.boundsForTransformedPoints(matrix, [0, 0, 0, width, height, 0]);
        this.transformController.clampOffsets(paddingX - bounds.maxX, clientWidth - paddingX - bounds.minX, paddingY - bounds.maxY, clientHeight - paddingY - bounds.minY);
        matrix = new WebKitCSSMatrix()
            .translate(this.transformController.offsetX(), this.transformController.offsetY())
            .multiply(matrix);
        this.imageContainer.style.webkitTransform = matrix.toString();
    }
    showImage(imageURL) {
        this.imageContainer.classList.toggle('hidden', !imageURL);
        if (imageURL) {
            this.imageElement.src = imageURL;
        }
    }
    setMask(maskRectangle) {
        this.maskRectangle = maskRectangle;
        this.maskElement.classList.toggle('hidden', !maskRectangle);
    }
    wasShown() {
        super.wasShown();
        this.registerCSSFiles([timelinePaintProfilerStyles]);
    }
}
//# sourceMappingURL=TimelinePaintProfilerView.js.map