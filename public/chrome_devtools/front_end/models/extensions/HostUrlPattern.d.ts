import type * as Platform from '../../core/platform/platform.js';
export declare class HostUrlPattern {
    readonly pattern: {
        matchesAll: true;
    } | {
        readonly scheme: string;
        readonly host: string;
        readonly port: string;
        matchesAll: false;
    };
    static parse(pattern: string): HostUrlPattern | undefined;
    private constructor();
    get scheme(): string;
    get host(): string;
    get port(): string;
    matchesAllUrls(): boolean;
    matchesUrl(url: Platform.DevToolsPath.UrlString): boolean;
    matchesScheme(scheme: string): boolean;
    matchesHost(host: string): boolean;
    matchesPort(port: string): boolean;
}
