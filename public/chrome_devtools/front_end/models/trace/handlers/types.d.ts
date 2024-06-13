import type * as Types from './../types/types.js';
import * as ModelHandlers from './ModelHandlers.js';
export interface TraceEventHandler {
    reset(): void;
    initialize?(freshRecording?: boolean): void;
    handleEvent(data: {}): void;
    finalize?(): Promise<void>;
    data(): unknown;
    deps?(): TraceEventHandlerName[];
    handleUserConfig?(config: Types.Configuration.Configuration): void;
}
export type TraceEventHandlerName = keyof typeof ModelHandlers;
export type EnabledHandlerDataWithMeta<T extends {
    [key: string]: TraceEventHandler;
}> = {
    Meta: Readonly<ReturnType<typeof ModelHandlers['Meta']['data']>>;
} & {
    [K in keyof T]: Readonly<ReturnType<T[K]['data']>>;
};
export type HandlersWithMeta<T extends {
    [key: string]: TraceEventHandler;
}> = {
    Meta: typeof ModelHandlers.Meta;
} & {
    [K in keyof T]: T[K];
};
export type TraceParseData = Readonly<EnabledHandlerDataWithMeta<typeof ModelHandlers>>;
/**
 * Because you can run the trace engine with a subset of handlers enabled,
 * there can be times when you need to confirm if the trace contains all
 * handlers or not, because some parts of the engine expect to be given all
 * the handlers.
 */
export declare function handlerDataHasAllHandlers(data: Readonly<EnabledHandlerDataWithMeta<{}>>): data is TraceParseData;
type DeepWriteable<T> = {
    -readonly [P in keyof T]: DeepWriteable<T[P]>;
};
export type TraceParseDataMutable = DeepWriteable<TraceParseData>;
export type Handlers = typeof ModelHandlers;
export declare const enum HandlerState {
    UNINITIALIZED = 1,
    INITIALIZED = 2,
    FINALIZED = 3
}
export {};
