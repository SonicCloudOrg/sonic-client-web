/// <reference types="mocha" />
import * as Common from '../core/common/common.js';
import * as SDK from '../core/sdk/sdk.js';
import type * as Protocol from '../generated/protocol.js';
export declare function createTarget({ id, name, type, parentTarget, subtype, url }?: {
    id?: Protocol.Target.TargetID;
    name?: string;
    type?: SDK.Target.Type;
    parentTarget?: SDK.Target.Target;
    subtype?: string;
    url?: string;
}): SDK.Target.Target;
export declare function stubNoopSettings(): void;
export declare function registerNoopActions(actionIds: string[]): void;
export declare function initializeGlobalVars({ reset }?: {
    reset?: boolean | undefined;
}): Promise<void>;
export declare function deinitializeGlobalVars(): Promise<void>;
export declare function describeWithEnvironment(title: string, fn: (this: Mocha.Suite) => void, opts?: {
    reset: boolean;
}): Mocha.Suite;
export declare namespace describeWithEnvironment {
    var only: (title: string, fn: (this: Mocha.Suite) => void, opts?: {
        reset: boolean;
    }) => Mocha.Suite;
}
export declare function initializeGlobalLocaleVars(): Promise<void>;
export declare function deinitializeGlobalLocaleVars(): void;
export declare function describeWithLocale(title: string, fn: (this: Mocha.Suite) => void): Mocha.Suite;
export declare namespace describeWithLocale {
    var only: (title: string, fn: (this: Mocha.Suite) => void) => Mocha.Suite;
    var skip: (title: string, fn: (this: Mocha.Suite) => void) => void | Mocha.Suite;
}
export declare function createFakeSetting<T>(name: string, defaultValue: T): Common.Settings.Setting<T>;
export declare function enableFeatureForTest(feature: string): void;
export declare function setupActionRegistry(): void;
export declare function expectConsoleLogs(expectedLogs: {
    warn?: string[];
    log?: string[];
    error?: string[];
}): void;
