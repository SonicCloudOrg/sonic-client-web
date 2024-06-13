import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import type * as Protocol from '../../generated/protocol.js';
export declare class AutofillManager extends Common.ObjectWrapper.ObjectWrapper<EventTypes> {
    #private;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): AutofillManager;
    getLastFilledAddressForm(): AddressFormFilledEvent | null;
}
export interface Match {
    startIndex: number;
    endIndex: number;
    filledFieldIndex: number;
}
export declare const enum Events {
    AddressFormFilled = "AddressFormFilled"
}
export interface AddressFormFilledEvent {
    address: string;
    filledFields: Protocol.Autofill.FilledField[];
    matches: Match[];
    autofillModel: SDK.AutofillModel.AutofillModel;
}
export type EventTypes = {
    [Events.AddressFormFilled]: AddressFormFilledEvent;
};
