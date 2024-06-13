type Awaitable<T> = Promise<T> | T;
export type ReleaseFunction = () => Promise<void>;
/**
 * SharedObject is similar to a C++ shared pointer, i.e. a reference counted
 * object.
 *
 * A object is "created" whenever there are no acquirers and it's then acquired.
 * Subsequent acquirers use the same object. Only until all acquirers release
 * will the object be "destroyed".
 *
 * Using an object after it's destroyed is undefined behavior.
 *
 * The definition of "created" and "destroyed" is dependent on the functions
 * passed into the constructor.
 */
export declare class SharedObject<T> {
    #private;
    constructor(create: () => Awaitable<T>, destroy: (value: T) => Awaitable<void>);
    /**
     * @returns The shared object and a release function. If the release function
     * throws, you may attempt to call it again (however this probably implies
     * your destroy function is bad).
     */
    acquire(): Promise<[T, ReleaseFunction]>;
    /**
     * Automatically perform an acquire and release.
     *
     * **If the release fails**, then this will throw and the object will be
     * permanently alive. This is expected to be a fatal error and you should
     * debug your destroy function.
     */
    run<U>(action: (value: T) => Awaitable<U>): Promise<U>;
}
export {};
