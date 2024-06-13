// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as AutofillManager from './autofill_manager.js';
describeWithMockConnection('AutofillManager', () => {
    let target;
    let model;
    let autofillManager;
    let showViewStub;
    beforeEach(() => {
        target = createTarget();
        model = target.model(SDK.AutofillModel.AutofillModel);
        showViewStub = sinon.stub(UI.ViewManager.ViewManager.instance(), 'showView').resolves();
        autofillManager = AutofillManager.AutofillManager.AutofillManager.instance({ forceNew: true });
        Root.Runtime.experiments.enableForTest("autofill-view" /* Root.Runtime.ExperimentName.AUTOFILL_VIEW */);
    });
    afterEach(() => {
        showViewStub.restore();
    });
    describe('emits AddressFormFilled events', () => {
        const assertAutofillManagerEvent = async (inEvent, outEvent) => {
            const dispatchedAutofillEvents = [];
            autofillManager.addEventListener("AddressFormFilled" /* AutofillManager.AutofillManager.Events.AddressFormFilled */, event => dispatchedAutofillEvents.push(event.data));
            model.dispatchEventToListeners("AddressFormFilled" /* SDK.AutofillModel.Events.AddressFormFilled */, { autofillModel: model, event: inEvent });
            await new Promise(resolve => setTimeout(resolve, 0));
            assert.isTrue(showViewStub.calledOnceWithExactly('autofill-view'));
            assert.deepStrictEqual(dispatchedAutofillEvents, [outEvent]);
        };
        it('with a single match', async () => {
            const filledFields = [
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
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'NAME_FULL', value: 'Crocodile Dundee' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: 'Crocodile Dundee',
                filledFields,
                matches: [{ startIndex: 0, endIndex: 9, filledFieldIndex: 0 }],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
        it('with multiple matches', async () => {
            const filledFields = [
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
                {
                    htmlType: 'text',
                    id: 'input2',
                    name: '',
                    value: 'Dundee',
                    autofillType: 'Last name',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 2,
                    frameId: '1',
                },
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'NAME_FULL', value: 'Crocodile Dundee' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: 'Crocodile Dundee',
                filledFields,
                matches: [
                    { startIndex: 0, endIndex: 9, filledFieldIndex: 0 },
                    { startIndex: 10, endIndex: 16, filledFieldIndex: 1 },
                ],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
        it('with new line characters and commas', async () => {
            const filledFields = [
                {
                    htmlType: 'text',
                    id: 'input1',
                    name: '',
                    value: 'Outback Road 1, Melbourne',
                    autofillType: 'Street address',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 1,
                    frameId: '1',
                },
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'ADDRESS_HOME_STREET_ADDRESS', value: 'Outback Road 1\nMelbourne' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: 'Outback Road 1\nMelbourne',
                filledFields,
                matches: [{ startIndex: 0, endIndex: 24, filledFieldIndex: 0 }],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
        it('with a comma in the address', async () => {
            const filledFields = [
                {
                    htmlType: 'text',
                    id: 'input1',
                    name: '',
                    value: 'Outback Road 1, Melbourne',
                    autofillType: 'Street address',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 1,
                    frameId: '1',
                },
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'ADDRESS_HOME_STREET_ADDRESS', value: 'Outback Road 1, Melbourne' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: 'Outback Road 1, Melbourne',
                filledFields,
                matches: [{ startIndex: 0, endIndex: 25, filledFieldIndex: 0 }],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
        it('for phone numbers starting with "+"', async () => {
            const filledFields = [
                {
                    htmlType: 'text',
                    id: 'input1',
                    name: 'phone',
                    value: '+1234567890',
                    autofillType: 'Phone number',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 1,
                    frameId: '1',
                },
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'PHONE_HOME_WHOLE_NUMBER', value: '+1234567890' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: '+1234567890',
                filledFields,
                matches: [{ startIndex: 0, endIndex: 11, filledFieldIndex: 0 }],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
        it('with an empty string as filled field value', async () => {
            const filledFields = [
                {
                    htmlType: 'text',
                    id: 'input1',
                    name: 'name',
                    value: 'Crocodile',
                    autofillType: 'First name',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 1,
                    frameId: '1',
                },
                {
                    htmlType: 'text',
                    id: 'input2',
                    name: 'city',
                    value: '',
                    autofillType: 'City',
                    fillingStrategy: "autofillInferred" /* Protocol.Autofill.FillingStrategy.AutofillInferred */,
                    fieldId: 2,
                    frameId: '1',
                },
            ];
            const inEvent = {
                addressUi: {
                    addressFields: [
                        {
                            fields: [
                                { name: 'NAME_FULL', value: 'Crocodile Dundee' },
                            ],
                        },
                    ],
                },
                filledFields,
            };
            const outEvent = {
                address: 'Crocodile Dundee',
                filledFields,
                matches: [{ startIndex: 0, endIndex: 9, filledFieldIndex: 0 }],
                autofillModel: model,
            };
            await assertAutofillManagerEvent(inEvent, outEvent);
        });
    });
});
//# sourceMappingURL=AutofillManager.test.js.map