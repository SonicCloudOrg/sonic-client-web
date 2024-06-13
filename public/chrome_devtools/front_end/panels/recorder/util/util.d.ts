import * as SharedObject from './SharedObject.js';
declare const isDebugBuild = false;
declare const DEVTOOLS_RECORDER_WORLD_NAME = "devtools_recorder";
declare class InjectedScript {
    #private;
    static get(): Promise<string>;
}
export { DEVTOOLS_RECORDER_WORLD_NAME, InjectedScript, SharedObject, isDebugBuild };
