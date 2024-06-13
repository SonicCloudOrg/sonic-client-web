export type MicroSeconds = number & {
    _tag: 'MicroSeconds';
};
export declare function MicroSeconds(value: number): MicroSeconds;
export type MilliSeconds = number & {
    _tag: 'MilliSeconds';
};
export declare function MilliSeconds(value: number): MilliSeconds;
export type Seconds = number & {
    _tag: 'Seconds';
};
export declare function Seconds(value: number): Seconds;
export declare const enum TimeUnit {
    MICROSECONDS = 0,
    MILLISECONDS = 1,
    SECONDS = 2,
    MINUTES = 3
}
export interface TraceWindow<TimeFormat extends MicroSeconds | MilliSeconds> {
    min: TimeFormat;
    max: TimeFormat;
    range: TimeFormat;
}
export type TraceWindowMicroSeconds = TraceWindow<MicroSeconds>;
export type TraceWindowMilliSeconds = TraceWindow<MilliSeconds>;
