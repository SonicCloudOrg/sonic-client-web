import type * as ProtocolProxyApi from '../../generated/protocol-proxy-api.js';
import type * as Protocol from '../../generated/protocol.js';
import { SDKModel } from './SDKModel.js';
import { type Target } from './Target.js';
export declare class AutofillModel extends SDKModel<EventTypes> implements ProtocolProxyApi.AutofillDispatcher {
    #private;
    readonly agent: ProtocolProxyApi.AutofillApi;
    constructor(target: Target);
    enable(): void;
    disable(): void;
    addressFormFilled(addressFormFilledEvent: Protocol.Autofill.AddressFormFilledEvent): void;
}
export declare const enum Events {
    AddressFormFilled = "AddressFormFilled"
}
export interface AddressFormFilledEvent {
    autofillModel: AutofillModel;
    event: Protocol.Autofill.AddressFormFilledEvent;
}
export type EventTypes = {
    [Events.AddressFormFilled]: AddressFormFilledEvent;
};
