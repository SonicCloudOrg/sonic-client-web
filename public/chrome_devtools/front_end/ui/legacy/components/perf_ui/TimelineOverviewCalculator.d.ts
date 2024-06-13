import * as TraceEngine from '../../../../models/trace/trace.js';
import { type Calculator } from './TimelineGrid.js';
export declare class TimelineOverviewCalculator implements Calculator {
    #private;
    private workingArea;
    private navStartTimes?;
    computePosition(time: TraceEngine.Types.Timing.MilliSeconds): number;
    positionToTime(position: number): number;
    setBounds(minimumBoundary: TraceEngine.Types.Timing.MilliSeconds, maximumBoundary: TraceEngine.Types.Timing.MilliSeconds): void;
    setNavStartTimes(navStartTimes: readonly TraceEngine.Types.TraceEvents.TraceEventNavigationStart[]): void;
    setDisplayWidth(clientWidth: number): void;
    reset(): void;
    formatValue(value: number, precision?: number): string;
    maximumBoundary(): TraceEngine.Types.Timing.MilliSeconds;
    minimumBoundary(): TraceEngine.Types.Timing.MilliSeconds;
    zeroTime(): TraceEngine.Types.Timing.MilliSeconds;
    boundarySpan(): TraceEngine.Types.Timing.MilliSeconds;
}
