import { type Step, type SetViewportStep, type EmulateNetworkConditionsStep } from './Schema.js';
import * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
export declare function createViewportStep(viewport: {
    clientWidth: number;
    clientHeight: number;
}): SetViewportStep;
export declare function createEmulateNetworkConditionsStep(conditions: {
    download: number;
    upload: number;
    latency: number;
}): EmulateNetworkConditionsStep;
export declare function areSelectorsEqual(stepA: Step, stepB: Step): boolean;
export declare const minTimeout = 1;
export declare const maxTimeout = 30000;
export declare const parse: typeof PuppeteerReplay.parse;
export declare const parseStep: typeof PuppeteerReplay.parseStep;
