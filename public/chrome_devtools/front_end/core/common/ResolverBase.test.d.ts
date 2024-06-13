import * as Common from './common.js';
declare class TestClass {
}
export declare class ResolverTestImpl extends Common.ResolverBase.ResolverBase<string, TestClass> {
    items: Map<string, TestClass>;
    currentlyListening: boolean;
    constructor(id?: string, obj?: TestClass);
    protected getForId(id: string): TestClass | null;
    protected startListening(): void;
    protected stopListening(): void;
    assertIsListening(): void;
    assertIsNotListening(): void;
    onResolve(id: string, obj: TestClass): void;
}
export {};
