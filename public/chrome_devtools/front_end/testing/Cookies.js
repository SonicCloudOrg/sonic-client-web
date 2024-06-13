// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const cookieExpectationDefaults = {
    name: 'name',
    value: 'value',
    httpOnly: false,
    sameSite: undefined,
    secure: false,
    session: true,
    path: undefined,
    domain: undefined,
    expires: null,
    size: undefined,
    priority: "Medium" /* Protocol.Network.CookiePriority.Medium */,
    partitionKey: null,
    partitionKeyOpaque: false,
};
const requestDate = new Date('Mon Oct 18 2010 17:00:00 GMT+0000');
export function expectCookie(cookie, cookieExpectation) {
    const expectation = { ...cookieExpectationDefaults, ...cookieExpectation };
    assert.strictEqual(cookie.name(), expectation.name, 'name');
    assert.strictEqual(cookie.value(), expectation.value, 'value');
    assert.strictEqual(cookie.httpOnly(), expectation.httpOnly, 'httpOnly');
    assert.strictEqual(cookie.sameSite(), expectation.sameSite, 'sameSite');
    assert.strictEqual(cookie.secure(), expectation.secure, 'secure');
    assert.strictEqual(cookie.session(), expectation.session, 'session');
    assert.strictEqual(cookie.path(), expectation.path, 'path');
    assert.strictEqual(cookie.domain(), expectation.domain, 'domain');
    const date = cookie.expiresDate(requestDate);
    if (typeof expectation.expires === 'string') {
        assert.isNotNull(date);
        assert.strictEqual(date.toISOString(), expectation.expires, 'expires');
    }
    else if (typeof expectation.expires === 'number') {
        assert.isNotNull(date);
        assert.strictEqual(date.getTime(), expectation.expires, 'expires');
    }
    else {
        assert.strictEqual(date, expectation.expires, 'expires');
    }
    assert.strictEqual(cookie.size(), expectation.size, 'size');
    assert.strictEqual(cookie.priority(), expectation.priority, 'priority');
    assert.strictEqual(cookie.partitioned(), Boolean(expectation.partitionKey), 'partitioned');
    if (cookie.partitioned()) {
        assert.strictEqual(cookie.hasCrossSiteAncestor(), expectation.partitionKey?.hasCrossSiteAncestor, 'partitionKey');
        assert.strictEqual(cookie.topLevelSite(), expectation.partitionKey?.topLevelSite, 'topLevelSite');
    }
    assert.strictEqual(cookie.partitionKeyOpaque(), expectation.partitionKeyOpaque, 'partitionKeyOpaque');
}
//# sourceMappingURL=Cookies.js.map