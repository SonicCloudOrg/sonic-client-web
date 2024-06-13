export type FinishCallback = (err: Error) => void;
export declare class Throttler {
    #private;
    constructor(timeout: number);
    private processCompletedForTests;
    get process(): (() => (Promise<unknown>)) | null;
    get processCompleted(): Promise<unknown> | null;
    private onTimeout;
    schedule(process: () => (Promise<unknown>), scheduling?: Scheduling): Promise<void>;
    private innerSchedule;
    private clearTimeout;
    private setTimeout;
    private getTime;
}
export declare const enum Scheduling {
    Default = "Default",
    AsSoonAsPossible = "AsSoonAsPossible",
    Delayed = "Delayed"
}
