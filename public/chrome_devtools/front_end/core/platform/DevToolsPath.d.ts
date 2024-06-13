import { type Brand } from './Brand.js';
/**
 * File paths in DevTools that are represented as URLs
 * @example
 * “file:///Hello%20World/file/js”
 */
export type UrlString = Brand<string, 'UrlString'>;
export declare const EmptyUrlString: UrlString;
/**
 * File paths in DevTools that are represented as unencoded absolute
 * or relative paths
 * @example
 * “/Hello World/file.js”
 */
export type RawPathString = Brand<string, 'RawPathString'>;
export declare const EmptyRawPathString: RawPathString;
/**
 * File paths in DevTools that are represented as encoded paths
 * @example
 * “/Hello%20World/file.js”
 */
export type EncodedPathString = Brand<string, 'EncodedPathString'>;
export declare const EmptyEncodedPathString: EncodedPathString;
