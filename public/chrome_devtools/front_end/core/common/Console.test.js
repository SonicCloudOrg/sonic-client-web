// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from './common.js';
const Console = Common.Console.Console;
describe('Console', () => {
    let consoleImpl;
    beforeEach(() => {
        consoleImpl = Console.instance({ forceNew: true });
    });
    it('adds messages', () => {
        consoleImpl.addMessage('Foo', "info" /* Common.Console.MessageLevel.Info */, true);
        const messages = consoleImpl.messages();
        assert.strictEqual(messages.length, 1);
        assert.strictEqual(messages[0].text, 'Foo');
    });
    it('adds handles messages of all types', () => {
        const messageTypes = new Map([
            ["info" /* Common.Console.MessageLevel.Info */, 'log'],
            ["warning" /* Common.Console.MessageLevel.Warning */, 'warn'],
            ["error" /* Common.Console.MessageLevel.Error */, 'error'],
        ]);
        for (const [type, method] of messageTypes) {
            consoleImpl = Console.instance({ forceNew: true });
            // Dispatch the message of the appropriate type.
            // @ts-ignore
            consoleImpl[method](type);
            // Now read the message back and check it.
            const messages = consoleImpl.messages();
            assert.strictEqual(messages.length, 1);
            assert.strictEqual(messages[0].text, type);
            assert.strictEqual(messages[0].level, type);
        }
    });
    it('stores messages', () => {
        consoleImpl.addMessage('Foo', "info" /* Common.Console.MessageLevel.Info */, true);
        consoleImpl.addMessage('Baz', "warning" /* Common.Console.MessageLevel.Warning */, true);
        consoleImpl.addMessage('Bar', "error" /* Common.Console.MessageLevel.Error */, true);
        consoleImpl.addMessage('Donkey', "info" /* Common.Console.MessageLevel.Info */, true);
        const messages = consoleImpl.messages();
        assert.strictEqual(messages.length, 4);
    });
    it('dispatches events to listeners', done => {
        const callback = ({ data }) => {
            consoleImpl.removeEventListener("messageAdded" /* Common.Console.Events.MessageAdded */, callback);
            assert.strictEqual(data.text, 'Foo');
            done();
        };
        consoleImpl.addEventListener("messageAdded" /* Common.Console.Events.MessageAdded */, callback);
        consoleImpl.addMessage('Foo', "info" /* Common.Console.MessageLevel.Info */, true);
    });
});
//# sourceMappingURL=Console.test.js.map