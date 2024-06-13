// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
const BUTTONS = [
    "left" /* Protocol.Input.MouseButton.Left */,
    "middle" /* Protocol.Input.MouseButton.Middle */,
    "right" /* Protocol.Input.MouseButton.Right */,
    "back" /* Protocol.Input.MouseButton.Back */,
    "forward" /* Protocol.Input.MouseButton.Forward */,
];
const MOUSE_EVENT_TYPES = {
    mousedown: "mousePressed" /* Protocol.Input.DispatchMouseEventRequestType.MousePressed */,
    mouseup: "mouseReleased" /* Protocol.Input.DispatchMouseEventRequestType.MouseReleased */,
    mousemove: "mouseMoved" /* Protocol.Input.DispatchMouseEventRequestType.MouseMoved */,
};
export class InputModel extends SDK.SDKModel.SDKModel {
    inputAgent;
    activeMouseOffsetTop;
    constructor(target) {
        super(target);
        this.inputAgent = target.inputAgent();
        this.activeMouseOffsetTop = null;
    }
    emitKeyEvent(event) {
        let type;
        switch (event.type) {
            case 'keydown':
                type = "keyDown" /* Protocol.Input.DispatchKeyEventRequestType.KeyDown */;
                break;
            case 'keyup':
                type = "keyUp" /* Protocol.Input.DispatchKeyEventRequestType.KeyUp */;
                break;
            case 'keypress':
                type = "char" /* Protocol.Input.DispatchKeyEventRequestType.Char */;
                break;
            default:
                return;
        }
        const text = event.type === 'keypress' ? String.fromCharCode(event.charCode) : undefined;
        void this.inputAgent.invoke_dispatchKeyEvent({
            type: type,
            modifiers: this.modifiersForEvent(event),
            text: text,
            unmodifiedText: text ? text.toLowerCase() : undefined,
            keyIdentifier: event.keyIdentifier,
            code: event.code,
            key: event.key,
            windowsVirtualKeyCode: event.keyCode,
            nativeVirtualKeyCode: event.keyCode,
            autoRepeat: event.repeat,
            isKeypad: event.location === 3,
            isSystemKey: false,
            location: event.location !== 3 ? event.location : undefined,
        });
    }
    emitMouseEvent(event, offsetTop, zoom) {
        if (!(event.type in MOUSE_EVENT_TYPES)) {
            return;
        }
        if (event.type === 'mousedown' || this.activeMouseOffsetTop === null) {
            this.activeMouseOffsetTop = offsetTop;
        }
        void this.inputAgent.invoke_dispatchMouseEvent({
            type: MOUSE_EVENT_TYPES[event.type],
            x: Math.round(event.offsetX / zoom),
            y: Math.round(event.offsetY / zoom - this.activeMouseOffsetTop),
            modifiers: this.modifiersForEvent(event),
            button: BUTTONS[event.button],
            clickCount: event.detail,
        });
        if (event.type === 'mouseup') {
            this.activeMouseOffsetTop = null;
        }
    }
    emitWheelEvent(event, offsetTop, zoom) {
        if (this.activeMouseOffsetTop === null) {
            this.activeMouseOffsetTop = offsetTop;
        }
        void this.inputAgent.invoke_dispatchMouseEvent({
            type: "mouseWheel" /* Protocol.Input.DispatchMouseEventRequestType.MouseWheel */,
            x: Math.round(event.offsetX / zoom),
            y: Math.round(event.offsetY / zoom - this.activeMouseOffsetTop),
            modifiers: this.modifiersForEvent(event),
            button: BUTTONS[event.button],
            clickCount: event.detail,
            deltaX: event.deltaX / zoom,
            deltaY: event.deltaY / zoom,
        });
    }
    modifiersForEvent(event) {
        return Number(event.getModifierState('Alt')) | (Number(event.getModifierState('Control')) << 1) |
            (Number(event.getModifierState('Meta')) << 2) | (Number(event.getModifierState('Shift')) << 3);
    }
}
SDK.SDKModel.SDKModel.register(InputModel, {
    capabilities: 1024 /* SDK.Target.Capability.Input */,
    autostart: false,
});
//# sourceMappingURL=InputModel.js.map