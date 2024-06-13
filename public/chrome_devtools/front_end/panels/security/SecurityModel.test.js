// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Security from './security.js';
describe('SecurityModel', () => {
    describe('securityStateCompare', () => {
        const { securityStateCompare } = Security.SecurityModel;
        const { SecurityState } = Protocol.Security;
        it('identifies security states', () => {
            assert.strictEqual(securityStateCompare("unknown" /* SecurityState.Unknown */, "unknown" /* SecurityState.Unknown */), 0);
            assert.strictEqual(securityStateCompare("neutral" /* SecurityState.Neutral */, "neutral" /* SecurityState.Neutral */), 0);
            assert.strictEqual(securityStateCompare("insecure" /* SecurityState.Insecure */, "insecure" /* SecurityState.Insecure */), 0);
            assert.strictEqual(securityStateCompare("secure" /* SecurityState.Secure */, "secure" /* SecurityState.Secure */), 0);
            assert.strictEqual(securityStateCompare("info" /* SecurityState.Info */, "info" /* SecurityState.Info */), 0);
            assert.strictEqual(securityStateCompare("insecure-broken" /* SecurityState.InsecureBroken */, "insecure-broken" /* SecurityState.InsecureBroken */), 0);
        });
        it('ranks Info lowest', () => {
            assert.isBelow(securityStateCompare("info" /* SecurityState.Info */, "unknown" /* SecurityState.Unknown */), 0);
            assert.isBelow(securityStateCompare("info" /* SecurityState.Info */, "neutral" /* SecurityState.Neutral */), 0);
            assert.isBelow(securityStateCompare("info" /* SecurityState.Info */, "insecure" /* SecurityState.Insecure */), 0);
            assert.isBelow(securityStateCompare("info" /* SecurityState.Info */, "secure" /* SecurityState.Secure */), 0);
            assert.isBelow(securityStateCompare("info" /* SecurityState.Info */, "insecure-broken" /* SecurityState.InsecureBroken */), 0);
        });
        it('ranks Unknown highest', () => {
            assert.isAbove(securityStateCompare("unknown" /* SecurityState.Unknown */, "neutral" /* SecurityState.Neutral */), 0);
            assert.isAbove(securityStateCompare("unknown" /* SecurityState.Unknown */, "insecure" /* SecurityState.Insecure */), 0);
            assert.isAbove(securityStateCompare("unknown" /* SecurityState.Unknown */, "secure" /* SecurityState.Secure */), 0);
            assert.isAbove(securityStateCompare("unknown" /* SecurityState.Unknown */, "info" /* SecurityState.Info */), 0);
            assert.isAbove(securityStateCompare("unknown" /* SecurityState.Unknown */, "insecure-broken" /* SecurityState.InsecureBroken */), 0);
        });
        it('orders correctly from InsecureBroken to Secure', () => {
            assert.isBelow(securityStateCompare("insecure-broken" /* SecurityState.InsecureBroken */, "insecure" /* SecurityState.Insecure */), 0);
            assert.isBelow(securityStateCompare("insecure" /* SecurityState.Insecure */, "neutral" /* SecurityState.Neutral */), 0);
            assert.isBelow(securityStateCompare("neutral" /* SecurityState.Neutral */, "secure" /* SecurityState.Secure */), 0);
        });
    });
});
//# sourceMappingURL=SecurityModel.test.js.map