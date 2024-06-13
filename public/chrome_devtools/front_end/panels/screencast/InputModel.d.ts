import * as SDK from '../../core/sdk/sdk.js';
export declare class InputModel extends SDK.SDKModel.SDKModel<void> {
    private readonly inputAgent;
    private activeMouseOffsetTop;
    constructor(target: SDK.Target.Target);
    emitKeyEvent(event: KeyboardEvent): void;
    emitMouseEvent(event: MouseEvent, offsetTop: number, zoom: number): void;
    emitWheelEvent(event: WheelEvent, offsetTop: number, zoom: number): void;
    private modifiersForEvent;
}
