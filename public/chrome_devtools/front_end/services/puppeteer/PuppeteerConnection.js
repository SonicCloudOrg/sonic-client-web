// Copyright (c) 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as puppeteer from '../../third_party/puppeteer/puppeteer.js';
class Transport {
    #connection;
    constructor(connection) {
        this.#connection = connection;
    }
    send(data) {
        this.#connection.sendRawMessage(data);
    }
    close() {
        void this.#connection.disconnect();
    }
    set onmessage(cb) {
        this.#connection.setOnMessage((message) => {
            const data = (message);
            if (!data.sessionId) {
                return;
            }
            return cb(JSON.stringify({
                ...data,
                // Puppeteer is expecting to use the default session, but we give it a non-default session in #connection.
                // Replace that sessionId with undefined so Puppeteer treats it as default.
                sessionId: data.sessionId === this.#connection.getSessionId() ? undefined : data.sessionId,
            }));
        });
    }
    set onclose(cb) {
        const prev = this.#connection.getOnDisconnect();
        this.#connection.setOnDisconnect(reason => {
            if (prev) {
                prev(reason);
            }
            if (cb) {
                cb();
            }
        });
    }
}
class PuppeteerConnection extends puppeteer.Connection {
    async onMessage(message) {
        const msgObj = JSON.parse(message);
        if (msgObj.sessionId && !this._sessions.has(msgObj.sessionId)) {
            return;
        }
        void super.onMessage(message);
    }
}
export class PuppeteerConnectionHelper {
    static async connectPuppeteerToConnectionViaTab(options) {
        const { connection, rootTargetId, isPageTargetCallback } = options;
        // Pass an empty message handler because it will be overwritten by puppeteer anyways.
        const transport = new Transport(connection);
        // url is an empty string in this case parallel to:
        // https://github.com/puppeteer/puppeteer/blob/f63a123ecef86693e6457b07437a96f108f3e3c5/src/common/BrowserConnector.ts#L72
        const puppeteerConnection = new PuppeteerConnection('', transport);
        const browserPromise = puppeteer.Browser._create('chrome', puppeteerConnection, [] /* contextIds */, false /* ignoreHTTPSErrors */, undefined /* defaultViewport */, undefined /* process */, undefined /* closeCallback */, undefined, target => isPageTargetCallback(target._getTargetInfo()), false /* waitForInitiallyDiscoveredTargets */);
        const [, browser] = await Promise.all([
            puppeteerConnection._createSession({ targetId: rootTargetId }, /* emulateAutoAttach= */ true),
            browserPromise,
        ]);
        await browser.waitForTarget(t => t.type() === 'page');
        const pages = await browser.pages();
        return { page: pages[0], browser, puppeteerConnection };
    }
}
//# sourceMappingURL=PuppeteerConnection.js.map