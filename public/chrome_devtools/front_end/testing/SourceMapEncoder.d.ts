import * as SDK from '../core/sdk/sdk.js';
export declare function encodeVlq(n: number): string;
export declare function encodeVlqList(list: number[]): string;
export declare function encodeSourceMap(textMap: string[], sourceRoot?: string): SDK.SourceMap.SourceMapV3Object;
export declare class OriginalScopeBuilder {
    #private;
    start(line: number, column: number, kind: SDK.SourceMapScopes.ScopeKind, name?: number, variables?: number[]): this;
    end(line: number, column: number): this;
    build(): string;
}
export declare class GeneratedRangeBuilder {
    #private;
    start(line: number, column: number, options?: {
        definition?: {
            sourceIdx: number;
            scopeIdx: number;
        };
        callsite?: {
            sourceIdx: number;
            line: number;
            column: number;
        };
        bindings?: (number | {
            line: number;
            column: number;
            nameIdx: number;
        }[])[];
    }): this;
    end(line: number, column: number): this;
    build(): string;
}
