// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// Important: This code does not actually run any tests but is used to verify
//            that the type magic of `EventTarget` behaves as expected w.r.t
//            to the TypeScript compiler.
import * as Common from './common.js';
class TypedEventEmitter extends Common.ObjectWrapper.ObjectWrapper {
    testValidArgumentTypes() {
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */);
        this.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */, 5.0);
        this.dispatchEventToListeners("KeyValueEvent" /* Events.KeyValueEvent */, { key: 'key', value: 42 });
        this.dispatchEventToListeners("BooleanEvent" /* Events.BooleanEvent */, true);
        this.dispatchEventToListeners("UnionEvent" /* Events.UnionEvent */, 'foo');
        this.dispatchEventToListeners("UnionEvent" /* Events.UnionEvent */, null);
    }
    testInvalidArgumentTypes() {
        // @ts-expect-error undefined instead of no argument provided
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */, undefined);
        // @ts-expect-error string instead of undefined provided
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */, 'void');
        // @ts-expect-error string instead of number provided
        this.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */, 'expected number');
        // @ts-expect-error argument missing
        this.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */);
        // @ts-expect-error wrong object type provided as payload
        this.dispatchEventToListeners("KeyValueEvent" /* Events.KeyValueEvent */, { key: 'key', foo: 'foo' });
        // @ts-expect-error unknown event type used
        this.dispatchEventToListeners('fake', { key: 'key', foo: 'foo' });
        // @ts-expect-error wrong payload not part of the union
        this.dispatchEventToListeners("UnionEvent" /* Events.UnionEvent */, 25);
    }
    testStringAndSymbolDisallowed() {
        // @ts-expect-error only keys of `TestEvents` are allowed.
        this.dispatchEventToListeners('foo');
        // @ts-expect-error only keys of `TestEvents` are allowed.
        this.dispatchEventToListeners(Symbol('foo'));
    }
}
class VoidTypedEventEmitter extends Common.ObjectWrapper.ObjectWrapper {
    testInvalidArgumentTypes() {
        // @ts-expect-error undefined instead of no argument provided
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */, undefined);
        // @ts-expect-error string instead of undefined provided
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */, 'void');
        // @ts-expect-error string instead of number provided
        this.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */, 'expected number');
        // @ts-expect-error argument missing
        this.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */);
        // @ts-expect-error wrong object type provided as payload
        this.dispatchEventToListeners("KeyValueEvent" /* Events.KeyValueEvent */, { key: 'key', foo: 'foo' });
        // @ts-expect-error unknown event type used
        this.dispatchEventToListeners('fake', { key: 'key', foo: 'foo' });
        // @ts-expect-error wrong payload not part of the union
        this.dispatchEventToListeners("UnionEvent" /* Events.UnionEvent */, 25);
    }
    testStringAndSymbolDisallowed() {
        // @ts-expect-error only keys of `TestEvents` are allowed.
        this.dispatchEventToListeners('foo');
        // @ts-expect-error only keys of `TestEvents` are allowed.
        this.dispatchEventToListeners(Symbol('foo'));
    }
}
VoidTypedEventEmitter;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
class UntypedEventEmitter extends Common.ObjectWrapper.ObjectWrapper {
    testDispatch() {
        this.dispatchEventToListeners('foo');
        this.dispatchEventToListeners(Symbol('number payload'), 25);
        this.dispatchEventToListeners("VoidEvent" /* Events.VoidEvent */);
        this.dispatchEventToListeners("UnionEvent" /* Events.UnionEvent */, 'foo');
    }
}
function genericListener() {
    return (_arg) => { };
}
const typedEmitter = new TypedEventEmitter();
(function testValidListeners() {
    typedEmitter.addEventListener("VoidEvent" /* Events.VoidEvent */, genericListener());
    typedEmitter.addEventListener("NumberEvent" /* Events.NumberEvent */, genericListener());
    typedEmitter.addEventListener("KeyValueEvent" /* Events.KeyValueEvent */, genericListener());
    typedEmitter.addEventListener("BooleanEvent" /* Events.BooleanEvent */, genericListener());
    typedEmitter.addEventListener("UnionEvent" /* Events.UnionEvent */, genericListener());
})();
(function testInvalidListenerArguments() {
    // @ts-expect-error
    typedEmitter.addEventListener("VoidEvent" /* Events.VoidEvent */, genericListener());
    // @ts-expect-error
    typedEmitter.addEventListener("NumberEvent" /* Events.NumberEvent */, genericListener());
    // @ts-expect-error
    typedEmitter.addEventListener("KeyValueEvent" /* Events.KeyValueEvent */, genericListener());
    // @ts-expect-error
    typedEmitter.addEventListener("UnionEvent" /* Events.UnionEvent */, genericListener());
})();
(function testInvalidListenerType() {
    // @ts-expect-error
    typedEmitter.addEventListener('foo', genericListener());
    // @ts-expect-error
    typedEmitter.addEventListener(Symbol('foo'), genericListener());
})();
(function testUnionTypeOnDispatch() {
    // @ts-expect-error
    typedEmitter.dispatchEventToListeners("NumberEvent" /* Events.NumberEvent */, 5);
    const event = Math.random() < 0.5 ? "NumberEvent" /* Events.NumberEvent */ : "BooleanEvent" /* Events.BooleanEvent */;
    // @ts-expect-error
    typedEmitter.dispatchEventToListeners(event, true);
})();
const untypedEmitter = new UntypedEventEmitter();
(function testUntypedListeners() {
    untypedEmitter.addEventListener('foo', genericListener());
    untypedEmitter.addEventListener(Symbol('foo'), genericListener());
    untypedEmitter.addEventListener("VoidEvent" /* Events.VoidEvent */, genericListener());
})();
//# sourceMappingURL=EventTarget.test.js.map