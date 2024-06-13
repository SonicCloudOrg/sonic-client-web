// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as SDK from './sdk.js';
describeWithMockConnection('AutofillModel', () => {
    it('can enable and disable the Autofill CDP domain', () => {
        const target = createTarget();
        const autofillModel = target.model(SDK.AutofillModel.AutofillModel);
        const enableSpy = sinon.spy(autofillModel.agent, 'invoke_enable');
        const disableSpy = sinon.spy(autofillModel.agent, 'invoke_disable');
        assert.isTrue(enableSpy.notCalled);
        assert.isTrue(disableSpy.notCalled);
        autofillModel.disable();
        assert.isTrue(enableSpy.notCalled);
        assert.isTrue(disableSpy.calledOnce);
        disableSpy.resetHistory();
        autofillModel.enable();
        assert.isTrue(enableSpy.calledOnce);
        assert.isTrue(disableSpy.notCalled);
    });
    it('sets test addresses by calling the Autofill backend', () => {
        const target = createTarget();
        const autofillModel = target.model(SDK.AutofillModel.AutofillModel);
        const setAddressSpy = sinon.spy(autofillModel.agent, 'invoke_setAddresses');
        assert.isTrue(setAddressSpy.notCalled);
        autofillModel.disable();
        assert.isTrue(setAddressSpy.notCalled);
        autofillModel.enable();
        assert.isTrue(setAddressSpy.calledOnce);
    });
    it('dispatches addressFormFilledEvent on autofill event', () => {
        const target = createTarget();
        const autofillModel = target.model(SDK.AutofillModel.AutofillModel);
        const dispatchedEvents = [];
        autofillModel.addEventListener("AddressFormFilled" /* SDK.AutofillModel.Events.AddressFormFilled */, e => dispatchedEvents.push(e.data));
        const addressFormFilledEvent = {
            addressUi: {
                addressFields: [
                    {
                        fields: [
                            { name: 'NAME_FULL', value: 'Crocodile Dundee' },
                        ],
                    },
                ],
            },
            filledFields: [
                {
                    htmlType: 'text',
                    id: 'input1',
                    name: '',
                    value: 'Crocodile',
                    autofillType: 'First name',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 1,
                    frameId: '1',
                },
            ],
        };
        autofillModel.addressFormFilled(addressFormFilledEvent);
        assert.lengthOf(dispatchedEvents, 1);
        assert.deepStrictEqual(dispatchedEvents[0].event, addressFormFilledEvent);
    });
});
//# sourceMappingURL=AutofillModel.test.js.map