export declare const mod: (a: number, n: number) => number;
export declare function assert<T>(predicate: T, message?: string): asserts predicate;
export type Keys<T> = T extends T ? keyof T : never;
export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];
export type OptionalKeys<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];
export type DeepImmutable<T> = {
    readonly [K in keyof T]: DeepImmutable<T[K]>;
};
export type DeepMutable<T> = {
    -readonly [K in keyof T]: DeepMutable<T[K]>;
};
export type DeepPartial<T> = {
    [K in keyof T]?: DeepPartial<Exclude<T[K], undefined>>;
};
export type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
export declare const deepFreeze: <T extends object>(object: T) => DeepImmutable<T>;
export declare class InsertAssignment<T> {
    value: T;
    constructor(value: T);
}
export declare class ArrayAssignments<T> {
    value: {
        [n: number]: T;
    };
    constructor(value: {
        [n: number]: T;
    });
}
export type Assignments<T> = T extends Readonly<Array<infer R>> ? R[] | ArrayAssignments<Assignments<R> | InsertAssignment<R>> : {
    [K in keyof T]: Assignments<T[K]>;
};
export declare const immutableDeepAssign: <T>(object: DeepImmutable<T>, assignments: DeepImmutable<DeepPartial<Assignments<T>>>) => DeepImmutable<T>;
