// Copyright 2015 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as Coordinator from '../../ui/components/render_coordinator/render_coordinator.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { NetworkLogView } from './NetworkLogView.js';
import { NetworkTimeBoundary } from './NetworkTimeCalculator.js';
import { RequestTimingView } from './RequestTimingView.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
export class NetworkOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    selectedFilmStripTime;
    numBands;
    highlightedRequest;
    loadEvents;
    domContentLoadedEvents;
    nextBand;
    bandMap;
    requestsList;
    requestsSet;
    span;
    lastBoundary;
    constructor() {
        super();
        this.selectedFilmStripTime = -1;
        this.element.classList.add('network-overview');
        this.numBands = 1;
        this.highlightedRequest = null;
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.Load, this.loadEventFired, this, { scoped: true });
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.ResourceTreeModel.ResourceTreeModel, SDK.ResourceTreeModel.Events.DOMContentLoaded, this.domContentLoadedEventFired, this, { scoped: true });
        this.reset();
    }
    setHighlightedRequest(request) {
        this.highlightedRequest = request;
        this.scheduleUpdate();
    }
    selectFilmStripFrame(time) {
        this.selectedFilmStripTime = time;
        this.scheduleUpdate();
    }
    clearFilmStripFrame() {
        this.selectedFilmStripTime = -1;
        this.scheduleUpdate();
    }
    loadEventFired(event) {
        const time = event.data.loadTime;
        if (time) {
            this.loadEvents.push(time * 1000);
        }
        this.scheduleUpdate();
    }
    domContentLoadedEventFired(event) {
        const { data } = event;
        if (data) {
            this.domContentLoadedEvents.push(data * 1000);
        }
        this.scheduleUpdate();
    }
    bandId(connectionId) {
        if (!connectionId || connectionId === '0') {
            return -1;
        }
        if (this.bandMap.has(connectionId)) {
            return this.bandMap.get(connectionId);
        }
        const result = this.nextBand++;
        this.bandMap.set(connectionId, result);
        return result;
    }
    updateRequest(request) {
        if (!this.requestsSet.has(request)) {
            this.requestsSet.add(request);
            this.requestsList.push(request);
        }
        this.scheduleUpdate();
    }
    wasShown() {
        this.onResize();
    }
    calculator() {
        return super.calculator();
    }
    onResize() {
        const width = this.element.offsetWidth;
        const height = this.element.offsetHeight;
        this.calculator().setDisplayWidth(width);
        this.resetCanvas();
        const numBands = (((height - PADDING - 1) / BAND_HEIGHT) - 1) | 0;
        this.numBands = (numBands > 0) ? numBands : 1;
        this.scheduleUpdate();
    }
    reset() {
        this.span = 1;
        this.lastBoundary = null;
        this.nextBand = 0;
        this.bandMap = new Map();
        this.requestsList = [];
        this.requestsSet = new Set();
        this.loadEvents = [];
        this.domContentLoadedEvents = [];
        // Clear screen.
        this.resetCanvas();
    }
    scheduleUpdate() {
        if (!this.isShowing()) {
            return;
        }
        void coordinator.write('NetworkOverview.render', this.update.bind(this));
    }
    update() {
        const calculator = this.calculator();
        const newBoundary = new NetworkTimeBoundary(calculator.minimumBoundary(), calculator.maximumBoundary());
        if (!this.lastBoundary || !newBoundary.equals(this.lastBoundary)) {
            const span = calculator.boundarySpan();
            while (this.span < span) {
                this.span *= 1.25;
            }
            calculator.setBounds(calculator.minimumBoundary(), TraceEngine.Types.Timing.MilliSeconds(calculator.minimumBoundary() + this.span));
            this.lastBoundary = new NetworkTimeBoundary(calculator.minimumBoundary(), calculator.maximumBoundary());
        }
        const context = this.context();
        const linesByType = new Map();
        const paddingTop = PADDING;
        function drawLines(type) {
            const lines = linesByType.get(type);
            if (!lines) {
                return;
            }
            const n = lines.length;
            context.beginPath();
            context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--color-background-opacity-80');
            context.lineWidth = BORDER_WIDTH;
            context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(RequestTimeRangeNameToColor[type]);
            for (let i = 0; i < n;) {
                const y = lines[i++] * BAND_HEIGHT + paddingTop;
                const startTime = lines[i++];
                let endTime = lines[i++];
                if (endTime === Number.MAX_VALUE) {
                    endTime = calculator.maximumBoundary();
                }
                const startX = calculator.computePosition(TraceEngine.Types.Timing.MilliSeconds(startTime));
                const endX = calculator.computePosition(TraceEngine.Types.Timing.MilliSeconds(endTime)) + 1;
                context.fillRect(startX, y, Math.max(endX - startX, MIN_BAND_WIDTH), BAND_HEIGHT);
                context.strokeRect(startX, y, Math.max(endX - startX, MIN_BAND_WIDTH), BAND_HEIGHT);
            }
        }
        function addLine(type, y, start, end) {
            let lines = linesByType.get(type);
            if (!lines) {
                lines = [];
                linesByType.set(type, lines);
            }
            lines.push(y, start, end);
        }
        const requests = this.requestsList;
        const n = requests.length;
        for (let i = 0; i < n; ++i) {
            const request = requests[i];
            const band = this.bandId(request.connectionId);
            const y = (band === -1) ? 0 : (band % this.numBands + 1);
            const timeRanges = RequestTimingView.calculateRequestTimeRanges(request, this.calculator().minimumBoundary());
            for (let j = 0; j < timeRanges.length; ++j) {
                const type = timeRanges[j].name;
                if (band !== -1 || type === "total" /* RequestTimeRangeNames.Total */) {
                    addLine(type, y, timeRanges[j].start * 1000, timeRanges[j].end * 1000);
                }
            }
        }
        context.clearRect(0, 0, this.width(), this.height());
        context.save();
        context.scale(window.devicePixelRatio, window.devicePixelRatio);
        context.lineWidth = 2;
        drawLines("total" /* RequestTimeRangeNames.Total */);
        drawLines("blocking" /* RequestTimeRangeNames.Blocking */);
        drawLines("connecting" /* RequestTimeRangeNames.Connecting */);
        drawLines("serviceworker" /* RequestTimeRangeNames.ServiceWorker */);
        drawLines("serviceworker-preparation" /* RequestTimeRangeNames.ServiceWorkerPreparation */);
        drawLines("serviceworker-respondwith" /* RequestTimeRangeNames.ServiceWorkerRespondWith */);
        drawLines("push" /* RequestTimeRangeNames.Push */);
        drawLines("proxy" /* RequestTimeRangeNames.Proxy */);
        drawLines("dns" /* RequestTimeRangeNames.DNS */);
        drawLines("ssl" /* RequestTimeRangeNames.SSL */);
        drawLines("sending" /* RequestTimeRangeNames.Sending */);
        drawLines("waiting" /* RequestTimeRangeNames.Waiting */);
        drawLines("receiving" /* RequestTimeRangeNames.Receiving */);
        if (this.highlightedRequest) {
            const size = 5;
            const borderSize = 2;
            const request = this.highlightedRequest;
            const band = this.bandId(request.connectionId);
            const y = ((band === -1) ? 0 : (band % this.numBands + 1)) * BAND_HEIGHT + paddingTop;
            const timeRanges = RequestTimingView.calculateRequestTimeRanges(request, this.calculator().minimumBoundary());
            context.fillStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--sys-color-tonal-container');
            // The network overview works in seconds, but the calcululator deals in
            // milliseconds, hence the multiplication by 1000.
            const start = TraceEngine.Types.Timing.MilliSeconds(timeRanges[0].start * 1000);
            const end = TraceEngine.Types.Timing.MilliSeconds(timeRanges[0].end * 1000);
            context.fillRect(calculator.computePosition(start) - borderSize, y - size / 2 - borderSize, calculator.computePosition(end) - calculator.computePosition(start) + 1 + 2 * borderSize, size * borderSize);
            for (let j = 0; j < timeRanges.length; ++j) {
                const type = timeRanges[j].name;
                if (band !== -1 || type === "total" /* RequestTimeRangeNames.Total */) {
                    context.beginPath();
                    context.strokeStyle =
                        ThemeSupport.ThemeSupport.instance().getComputedValue(RequestTimeRangeNameToColor[type]);
                    context.lineWidth = size;
                    const start = TraceEngine.Types.Timing.MilliSeconds(timeRanges[j].start * 1000);
                    const end = TraceEngine.Types.Timing.MilliSeconds(timeRanges[j].end * 1000);
                    context.moveTo(calculator.computePosition(start) - 0, y);
                    context.lineTo(calculator.computePosition(end) + 1, y);
                    context.stroke();
                }
            }
        }
        const height = this.element.offsetHeight;
        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(NetworkLogView.getDCLEventColor());
        for (let i = this.domContentLoadedEvents.length - 1; i >= 0; --i) {
            const position = calculator.computePosition(TraceEngine.Types.Timing.MilliSeconds(this.domContentLoadedEvents[i]));
            const x = Math.round(position) + 0.5;
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        context.stroke();
        context.beginPath();
        context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue(NetworkLogView.getLoadEventColor());
        for (let i = this.loadEvents.length - 1; i >= 0; --i) {
            const position = calculator.computePosition(TraceEngine.Types.Timing.MilliSeconds(this.loadEvents[i]));
            const x = Math.round(position) + 0.5;
            context.moveTo(x, 0);
            context.lineTo(x, height);
        }
        context.stroke();
        if (this.selectedFilmStripTime !== -1) {
            context.lineWidth = 2;
            context.beginPath();
            context.strokeStyle = ThemeSupport.ThemeSupport.instance().getComputedValue('--network-frame-divider-color');
            const timeInMilliseconds = TraceEngine.Types.Timing.MilliSeconds(this.selectedFilmStripTime);
            const x = Math.round(calculator.computePosition(timeInMilliseconds));
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        context.restore();
    }
}
export const RequestTimeRangeNameToColor = {
    ["total" /* RequestTimeRangeNames.Total */]: '--network-overview-total',
    ["blocking" /* RequestTimeRangeNames.Blocking */]: '--network-overview-blocking',
    ["connecting" /* RequestTimeRangeNames.Connecting */]: '--network-overview-connecting',
    ["serviceworker" /* RequestTimeRangeNames.ServiceWorker */]: '--network-overview-service-worker',
    ["serviceworker-preparation" /* RequestTimeRangeNames.ServiceWorkerPreparation */]: '--network-overview-service-worker',
    ["serviceworker-respondwith" /* RequestTimeRangeNames.ServiceWorkerRespondWith */]: '--network-overview-service-worker-respond-with',
    ["push" /* RequestTimeRangeNames.Push */]: '--network-overview-push',
    ["proxy" /* RequestTimeRangeNames.Proxy */]: '--override-network-overview-proxy',
    ["dns" /* RequestTimeRangeNames.DNS */]: '--network-overview-dns',
    ["ssl" /* RequestTimeRangeNames.SSL */]: '--network-overview-ssl',
    ["sending" /* RequestTimeRangeNames.Sending */]: '--override-network-overview-sending',
    ["waiting" /* RequestTimeRangeNames.Waiting */]: '--network-overview-waiting',
    ["receiving" /* RequestTimeRangeNames.Receiving */]: '--network-overview-receiving',
    ["queueing" /* RequestTimeRangeNames.Queueing */]: '--network-overview-queueing',
};
const BAND_HEIGHT = 3;
const PADDING = 5;
// Minimum rectangle width for very short requests.
const MIN_BAND_WIDTH = 10;
// Border between bars in network overview panel for accessibility.
const BORDER_WIDTH = 1;
//# sourceMappingURL=NetworkOverview.js.map