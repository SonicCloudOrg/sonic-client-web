import * as puppeteer from '../../third_party/puppeteer/puppeteer.js';
import type * as Protocol from '../../generated/protocol.js';
import type * as SDK from '../../core/sdk/sdk.js';
export declare class PuppeteerConnectionHelper {
    static connectPuppeteerToConnectionViaTab(options: {
        connection: SDK.Connections.ParallelConnectionInterface;
        rootTargetId: string;
        isPageTargetCallback: (targetInfo: Protocol.Target.TargetInfo) => boolean;
    }): Promise<{
        page: puppeteer.Page | null;
        browser: puppeteer.Browser;
        puppeteerConnection: puppeteer.Connection;
    }>;
}
