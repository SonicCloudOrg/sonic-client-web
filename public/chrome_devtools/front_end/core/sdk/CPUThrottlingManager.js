// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import { EmulationModel } from './EmulationModel.js';
import { TargetManager } from './TargetManager.js';
let throttlingManagerInstance;
export class CPUThrottlingManager extends Common.ObjectWrapper.ObjectWrapper {
    #cpuThrottlingRateInternal;
    #hardwareConcurrencyInternal;
    #pendingMainTargetPromise;
    constructor() {
        super();
        this.#cpuThrottlingRateInternal = CPUThrottlingRates.NoThrottling;
        TargetManager.instance().observeModels(EmulationModel, this);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!throttlingManagerInstance || forceNew) {
            throttlingManagerInstance = new CPUThrottlingManager();
        }
        return throttlingManagerInstance;
    }
    cpuThrottlingRate() {
        return this.#cpuThrottlingRateInternal;
    }
    setCPUThrottlingRate(rate) {
        this.#cpuThrottlingRateInternal = rate;
        for (const emulationModel of TargetManager.instance().models(EmulationModel)) {
            void emulationModel.setCPUThrottlingRate(this.#cpuThrottlingRateInternal);
        }
        this.dispatchEventToListeners("RateChanged" /* Events.RateChanged */, this.#cpuThrottlingRateInternal);
    }
    setHardwareConcurrency(concurrency) {
        this.#hardwareConcurrencyInternal = concurrency;
        for (const emulationModel of TargetManager.instance().models(EmulationModel)) {
            void emulationModel.setHardwareConcurrency(concurrency);
        }
        this.dispatchEventToListeners("HardwareConcurrencyChanged" /* Events.HardwareConcurrencyChanged */, this.#hardwareConcurrencyInternal);
    }
    hasPrimaryPageTargetSet() {
        // In some environments, such as Node, trying to check if we have a page
        // target may error. So if we get any errors here at all, assume that we do
        // not have a target.
        try {
            return TargetManager.instance().primaryPageTarget() !== null;
        }
        catch {
            return false;
        }
    }
    async getHardwareConcurrency() {
        const target = TargetManager.instance().primaryPageTarget();
        const existingCallback = this.#pendingMainTargetPromise;
        // If the main target hasn't attached yet, block callers until it appears.
        if (!target) {
            if (existingCallback) {
                return new Promise(r => {
                    this.#pendingMainTargetPromise = (result) => {
                        r(result);
                        existingCallback(result);
                    };
                });
            }
            return new Promise(r => {
                this.#pendingMainTargetPromise = r;
            });
        }
        const evalResult = await target.runtimeAgent().invoke_evaluate({ expression: 'navigator.hardwareConcurrency', returnByValue: true, silent: true, throwOnSideEffect: true });
        const error = evalResult.getError();
        if (error) {
            throw new Error(error);
        }
        const { result, exceptionDetails } = evalResult;
        if (exceptionDetails) {
            throw new Error(exceptionDetails.text);
        }
        return result.value;
    }
    modelAdded(emulationModel) {
        if (this.#cpuThrottlingRateInternal !== CPUThrottlingRates.NoThrottling) {
            void emulationModel.setCPUThrottlingRate(this.#cpuThrottlingRateInternal);
        }
        if (this.#hardwareConcurrencyInternal !== undefined) {
            void emulationModel.setHardwareConcurrency(this.#hardwareConcurrencyInternal);
        }
        // If there are any callers blocked on a getHardwareConcurrency call, let's wake them now.
        if (this.#pendingMainTargetPromise) {
            const existingCallback = this.#pendingMainTargetPromise;
            this.#pendingMainTargetPromise = undefined;
            void this.getHardwareConcurrency().then(existingCallback);
        }
    }
    modelRemoved(_emulationModel) {
        // Implemented as a requirement for being a SDKModelObserver.
    }
}
export function throttlingManager() {
    return CPUThrottlingManager.instance();
}
export var CPUThrottlingRates;
(function (CPUThrottlingRates) {
    CPUThrottlingRates[CPUThrottlingRates["NoThrottling"] = 1] = "NoThrottling";
    CPUThrottlingRates[CPUThrottlingRates["MidTierMobile"] = 4] = "MidTierMobile";
    CPUThrottlingRates[CPUThrottlingRates["LowEndMobile"] = 6] = "LowEndMobile";
    CPUThrottlingRates[CPUThrottlingRates["ExtraSlow"] = 20] = "ExtraSlow";
})(CPUThrottlingRates || (CPUThrottlingRates = {}));
//# sourceMappingURL=CPUThrottlingManager.js.map