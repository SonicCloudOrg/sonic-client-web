export type Configuration = {
    /**
     * Include V8 RCS functions in the JS stacks
     */
    includeRuntimeCallStats: boolean;
    /**
     * Show all events: disable the default filtering which hides and excludes some events.
     */
    showAllEvents: boolean;
    /**
     * Extra detail for RPP developers (eg Trace Event json in Summary, and individual JS Sample events)
     */
    debugMode: boolean;
};
export declare const defaults: () => Configuration;
/**
 * Generates a key that can be used to represent this config in a cache. This is
 * used mainly in tests, where we want to avoid re-parsing a file if we have
 * already processed it with the same configuration.
 */
export declare function configToCacheKey(config: Configuration): string;
