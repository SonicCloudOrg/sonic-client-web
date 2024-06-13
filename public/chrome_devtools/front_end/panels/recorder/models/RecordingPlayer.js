// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as PuppeteerService from '../../../services/puppeteer/puppeteer.js';
import * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
const speedDelayMap = {
    ["normal" /* PlayRecordingSpeed.Normal */]: 0,
    ["slow" /* PlayRecordingSpeed.Slow */]: 500,
    ["very_slow" /* PlayRecordingSpeed.VerySlow */]: 1000,
    ["extremely_slow" /* PlayRecordingSpeed.ExtremelySlow */]: 2000,
};
export const defaultTimeout = 5000; // ms
function isPageTarget(target) {
    // Treat DevTools targets as page targets too.
    return (Common.ParsedURL.schemeIs(target.url, 'devtools:') || target.type === 'page' ||
        target.type === 'background_page' || target.type === 'webview');
}
export class RecordingPlayer extends Common.ObjectWrapper.ObjectWrapper {
    #stopPromise;
    #resolveStopPromise;
    userFlow;
    speed;
    timeout;
    breakpointIndexes;
    steppingOver = false;
    aborted = false;
    abortPromise;
    #abortResolveFn;
    #runner;
    constructor(userFlow, { speed, breakpointIndexes = new Set(), }) {
        super();
        this.userFlow = userFlow;
        this.speed = speed;
        this.timeout = userFlow.timeout || defaultTimeout;
        this.breakpointIndexes = breakpointIndexes;
        this.#stopPromise = new Promise(resolve => {
            this.#resolveStopPromise = resolve;
        });
        this.abortPromise = new Promise(resolve => {
            this.#abortResolveFn = resolve;
        });
    }
    #resolveAndRefreshStopPromise() {
        this.#resolveStopPromise?.();
        this.#stopPromise = new Promise(resolve => {
            this.#resolveStopPromise = resolve;
        });
    }
    static async connectPuppeteer() {
        const rootTarget = SDK.TargetManager.TargetManager.instance().rootTarget();
        if (!rootTarget) {
            throw new Error('Could not find the root target');
        }
        const primaryPageTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!primaryPageTarget) {
            throw new Error('Could not find the primary page target');
        }
        const childTargetManager = primaryPageTarget.model(SDK.ChildTargetManager.ChildTargetManager);
        if (!childTargetManager) {
            throw new Error('Could not get childTargetManager');
        }
        const resourceTreeModel = primaryPageTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            throw new Error('Could not get resource tree model');
        }
        const mainFrame = resourceTreeModel.mainFrame;
        if (!mainFrame) {
            throw new Error('Could not find main frame');
        }
        const rootChildTargetManager = rootTarget.model(SDK.ChildTargetManager.ChildTargetManager);
        if (!rootChildTargetManager) {
            throw new Error('Could not find the child target manager class for the root target');
        }
        // Pass an empty message handler because it will be overwritten by puppeteer anyways.
        const result = await rootChildTargetManager.createParallelConnection(() => { });
        const connection = result.connection;
        const mainTargetId = await childTargetManager.getParentTargetId();
        const rootTargetId = await rootChildTargetManager.getParentTargetId();
        const { page, browser, puppeteerConnection } = await PuppeteerService.PuppeteerConnection.PuppeteerConnectionHelper.connectPuppeteerToConnectionViaTab({
            connection,
            rootTargetId: rootTargetId,
            isPageTargetCallback: isPageTarget,
        });
        if (!page) {
            throw new Error('could not find main page!');
        }
        browser.on('targetdiscovered', (targetInfo) => {
            // Pop-ups opened by the main target won't be auto-attached. Therefore,
            // we need to create a session for them explicitly. We user openedId
            // and type to classify a target as requiring a session.
            if (targetInfo.type !== 'page') {
                return;
            }
            if (targetInfo.targetId === mainTargetId) {
                return;
            }
            if (targetInfo.openerId !== mainTargetId) {
                return;
            }
            void puppeteerConnection._createSession(targetInfo, 
            /* emulateAutoAttach= */ true);
        });
        return { page, browser };
    }
    static async disconnectPuppeteer(browser) {
        try {
            const pages = await browser.pages();
            for (const page of pages) {
                const client = page._client();
                await client.send('Network.disable');
                await client.send('Page.disable');
                await client.send('Log.disable');
                await client.send('Performance.disable');
                await client.send('Runtime.disable');
                await client.send('Emulation.clearDeviceMetricsOverride');
                await client.send('Emulation.setAutomationOverride', { enabled: false });
                for (const frame of page.frames()) {
                    const client = frame.client;
                    await client.send('Network.disable');
                    await client.send('Page.disable');
                    await client.send('Log.disable');
                    await client.send('Performance.disable');
                    await client.send('Runtime.disable');
                    await client.send('Emulation.setAutomationOverride', { enabled: false });
                }
            }
            await browser.disconnect();
        }
        catch (err) {
            console.error('Error disconnecting Puppeteer', err.message);
        }
    }
    async stop() {
        await Promise.race([this.#stopPromise, this.abortPromise]);
    }
    abort() {
        this.aborted = true;
        this.#abortResolveFn?.();
        this.#runner?.abort();
    }
    disposeForTesting() {
        this.#resolveStopPromise?.();
        this.#abortResolveFn?.();
    }
    continue() {
        this.steppingOver = false;
        this.#resolveAndRefreshStopPromise();
    }
    stepOver() {
        this.steppingOver = true;
        this.#resolveAndRefreshStopPromise();
    }
    updateBreakpointIndexes(breakpointIndexes) {
        this.breakpointIndexes = breakpointIndexes;
    }
    async play() {
        const { page, browser } = await RecordingPlayer.connectPuppeteer();
        this.aborted = false;
        const player = this;
        class ExtensionWithBreak extends PuppeteerReplay.PuppeteerRunnerExtension {
            #speed;
            constructor(browser, page, { timeout, speed, }) {
                super(browser, page, { timeout });
                this.#speed = speed;
            }
            async beforeEachStep(step, flow) {
                let resolver = () => { };
                const promise = new Promise(r => {
                    resolver = r;
                });
                player.dispatchEventToListeners("Step" /* Events.Step */, {
                    step,
                    resolve: resolver,
                });
                await promise;
                const currentStepIndex = flow.steps.indexOf(step);
                const shouldStopAtCurrentStep = player.steppingOver || player.breakpointIndexes.has(currentStepIndex);
                const shouldWaitForSpeed = step.type !== 'setViewport' && step.type !== 'navigate' && !player.aborted;
                if (shouldStopAtCurrentStep) {
                    player.dispatchEventToListeners("Stop" /* Events.Stop */);
                    await player.stop();
                    player.dispatchEventToListeners("Continue" /* Events.Continue */);
                }
                else if (shouldWaitForSpeed) {
                    await Promise.race([
                        new Promise(resolve => setTimeout(resolve, speedDelayMap[this.#speed])),
                        player.abortPromise,
                    ]);
                }
            }
            async runStep(step, flow) {
                // When replaying on a DevTools target we skip setViewport and navigate steps
                // because navigation and viewport changes are not supported there.
                if (Common.ParsedURL.schemeIs(page?.url(), 'devtools:') &&
                    (step.type === 'setViewport' || step.type === 'navigate')) {
                    return;
                }
                // Focus the target in case it's not focused.
                await this.page.bringToFront();
                await super.runStep(step, flow);
            }
        }
        const extension = new ExtensionWithBreak(browser, page, {
            timeout: this.timeout,
            speed: this.speed,
        });
        this.#runner = await PuppeteerReplay.createRunner(this.userFlow, extension);
        let error;
        try {
            await this.#runner.run();
        }
        catch (err) {
            error = err;
            console.error('Replay error', err.message);
        }
        finally {
            await RecordingPlayer.disconnectPuppeteer(browser);
        }
        if (this.aborted) {
            this.dispatchEventToListeners("Abort" /* Events.Abort */);
        }
        else if (error) {
            this.dispatchEventToListeners("Error" /* Events.Error */, error);
        }
        else {
            this.dispatchEventToListeners("Done" /* Events.Done */);
        }
    }
}
//# sourceMappingURL=RecordingPlayer.js.map