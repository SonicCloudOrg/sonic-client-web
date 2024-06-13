import * as Platform from '../platform/platform.js';
export declare const preciseMillisToString: (ms: number, precision?: number) => string;
export declare function formatMicroSecondsTime(time: Platform.Timing.MicroSeconds): string;
export declare function formatMicroSecondsAsSeconds(time: Platform.Timing.MicroSeconds): string;
export declare const millisToString: (ms: number, higherResolution?: boolean) => string;
export declare const secondsToString: (seconds: number, higherResolution?: boolean) => string;
