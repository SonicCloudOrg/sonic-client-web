import { VBox } from './Widget.js';
export declare class ThrottledWidget extends VBox {
    private readonly updateThrottler;
    private updateWhenVisible;
    protected lastUpdatePromise: Promise<void>;
    constructor(isWebComponent?: boolean, timeout?: number);
    protected doUpdate(): Promise<void>;
    update(): void;
    wasShown(): void;
}
