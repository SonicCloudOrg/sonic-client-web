export declare class Logger {
    #private;
    constructor(level?: 'silent' | 'debug');
    log(...args: unknown[]): void;
    timed<T>(label: string, action: () => T): T;
}
