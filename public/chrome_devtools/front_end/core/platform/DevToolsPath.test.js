// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function fnExpectingUrlString(urlString) {
    urlString;
}
function fnExpectingRawPathString(rawPathString) {
    rawPathString;
}
function fnExpectingEncodedPathString(encPathString) {
    encPathString;
}
// @ts-expect-error Passing a plain string when UrlString is expected
fnExpectingUrlString('foo');
// @ts-expect-error Passing a plain string when RawPathString is expected
fnExpectingRawPathString('foo');
// @ts-expect-error Passing a plain string when EncodedPathString is expected
fnExpectingEncodedPathString('foo');
const urlString = 'urlStr';
fnExpectingUrlString(urlString);
// @ts-expect-error Passing a UrlString when RawPathString is expected
fnExpectingRawPathString(urlString);
// @ts-expect-error Passing a UrlString when EncodedPathString is expected
fnExpectingEncodedPathString(urlString);
const rawPathString = 'rawPathStr';
fnExpectingRawPathString(rawPathString);
// @ts-expect-error Passing a RawPathString when UrlString is expected
fnExpectingUrlString(rawPathString);
// @ts-expect-error Passing a RawPathString when EncodedPathString is expected
fnExpectingEncodedPathString(rawPathString);
const encPathString = 'encPathStr';
fnExpectingEncodedPathString(encPathString);
// @ts-expect-error Passing a EncodedPathString when UrlString is expected
fnExpectingUrlString(encPathString);
// @ts-expect-error Passing a EncodedPathString when RawPathString is expected
fnExpectingRawPathString(encPathString);
export {};
//# sourceMappingURL=DevToolsPath.test.js.map