/**
 * Returns a new pending promise together with it's resolve and reject functions.
 *
 * Polyfill for https://github.com/tc39/proposal-promise-with-resolvers.
 */
export declare function promiseWithResolvers<T = unknown>(): {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (error?: Error) => void;
};
