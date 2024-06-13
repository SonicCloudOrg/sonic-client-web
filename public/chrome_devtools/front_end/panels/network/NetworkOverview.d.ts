import * as SDK from '../../core/sdk/sdk.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
export declare class NetworkOverview extends PerfUI.TimelineOverviewPane.TimelineOverviewBase {
    private selectedFilmStripTime;
    private numBands;
    private highlightedRequest;
    private loadEvents;
    private domContentLoadedEvents;
    private nextBand;
    private bandMap;
    private requestsList;
    private requestsSet;
    private span;
    private lastBoundary?;
    constructor();
    setHighlightedRequest(request: SDK.NetworkRequest.NetworkRequest | null): void;
    selectFilmStripFrame(time: number): void;
    clearFilmStripFrame(): void;
    private loadEventFired;
    private domContentLoadedEventFired;
    private bandId;
    updateRequest(request: SDK.NetworkRequest.NetworkRequest): void;
    wasShown(): void;
    calculator(): PerfUI.TimelineOverviewCalculator.TimelineOverviewCalculator;
    onResize(): void;
    reset(): void;
    scheduleUpdate(): void;
    update(): void;
}
export declare const RequestTimeRangeNameToColor: {
    [key: string]: string;
};
