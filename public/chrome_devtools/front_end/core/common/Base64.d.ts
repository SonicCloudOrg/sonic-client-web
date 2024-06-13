export declare const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
export declare const BASE64_CODES: Uint8Array;
/**
 * Decodes Base64-encoded data from a string without performing any kind of checking.
 */
export declare function decode(input: string): ArrayBuffer;
export declare function encode(input: ArrayBuffer | Blob): Promise<string>;
