/// <reference types="mocha" />
import type * as SDK from '../core/sdk/sdk.js';
import { type ProtocolMapping } from '../generated/protocol-mapping.js';
export type ProtocolCommand = keyof ProtocolMapping.Commands;
export type ProtocolCommandParams<C extends ProtocolCommand> = ProtocolMapping.Commands[C]['paramsType'];
export type ProtocolResponse<C extends ProtocolCommand> = ProtocolMapping.Commands[C]['returnType'];
export type ProtocolCommandHandler<C extends ProtocolCommand> = (...params: ProtocolCommandParams<C>) => Omit<ProtocolResponse<C>, 'getError'> | {
    getError(): string;
};
export type MessageCallback = (result: string | Object) => void;
export declare function setMockConnectionResponseHandler<C extends ProtocolCommand>(command: C, handler: ProtocolCommandHandler<C>): void;
export declare function getMockConnectionResponseHandler(method: ProtocolCommand): Function | undefined;
export declare function clearMockConnectionResponseHandler(method: ProtocolCommand): void;
export declare function clearAllMockConnectionResponseHandlers(): void;
export declare function registerListenerOnOutgoingMessage(method: ProtocolCommand): Promise<void>;
export declare function dispatchEvent<E extends keyof ProtocolMapping.Events>(target: SDK.Target.Target, eventName: E, ...payload: ProtocolMapping.Events[E]): void;
export declare function describeWithMockConnection(title: string, fn: (this: Mocha.Suite) => void, opts?: {
    reset: boolean;
}): Mocha.Suite;
export declare namespace describeWithMockConnection {
    var only: (title: string, fn: (this: Mocha.Suite) => void, opts?: {
        reset: boolean;
    }) => Mocha.Suite;
}
