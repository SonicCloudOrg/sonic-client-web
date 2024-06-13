// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
let autofillManagerInstance;
export class AutofillManager extends Common.ObjectWrapper.ObjectWrapper {
    #autoOpenViewSetting;
    #address = '';
    #filledFields = [];
    #matches = [];
    #autofillModel = null;
    constructor() {
        super();
        SDK.TargetManager.TargetManager.instance().addModelListener(SDK.AutofillModel.AutofillModel, "AddressFormFilled" /* SDK.AutofillModel.Events.AddressFormFilled */, this.#addressFormFilled, this, { scoped: true });
        this.#autoOpenViewSetting =
            Common.Settings.Settings.instance().createSetting('auto-open-autofill-view-on-event', true);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!autofillManagerInstance || forceNew) {
            autofillManagerInstance = new AutofillManager();
        }
        return autofillManagerInstance;
    }
    async #addressFormFilled({ data }) {
        if (Root.Runtime.experiments.isEnabled("autofill-view" /* Root.Runtime.ExperimentName.AUTOFILL_VIEW */) &&
            this.#autoOpenViewSetting.get()) {
            await UI.ViewManager.ViewManager.instance().showView('autofill-view');
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.AutofillReceivedAndTabAutoOpened);
        }
        else {
            Host.userMetrics.actionTaken(Host.UserMetrics.Action.AutofillReceived);
        }
        this.#autofillModel = data.autofillModel;
        this.#processAddressFormFilledData(data.event);
        if (this.#address) {
            this.dispatchEventToListeners("AddressFormFilled" /* Events.AddressFormFilled */, {
                address: this.#address,
                filledFields: this.#filledFields,
                matches: this.#matches,
                autofillModel: this.#autofillModel,
            });
        }
    }
    getLastFilledAddressForm() {
        if (!this.#address || !this.#autofillModel) {
            return null;
        }
        return {
            address: this.#address,
            filledFields: this.#filledFields,
            matches: this.#matches,
            autofillModel: this.#autofillModel,
        };
    }
    #processAddressFormFilledData({ addressUi, filledFields }) {
        // Transform addressUi into a single (multi-line) string.
        const concatAddressFields = (addressFields) => addressFields.fields.filter(field => field.value.length).map(field => field.value).join(' ');
        this.#address = addressUi.addressFields.map(addressFields => concatAddressFields(addressFields))
            .filter(str => str.length)
            .join('\n');
        this.#filledFields = filledFields;
        this.#matches = [];
        // Populate a list of matches by searching in the address string for
        // occurences of filled field values.
        for (let i = 0; i < this.#filledFields.length; i++) {
            if (this.#filledFields[i].value === '') {
                continue;
            }
            // 1) Replace multiple whitespaces with a single space.
            // 2) Escape special characters.
            // 3) For ',' or '.' before whitespace, insert the '?' quantifier.
            const needle = Platform.StringUtilities.escapeForRegExp(this.#filledFields[i].value.replaceAll(/\s/g, ' '))
                .replaceAll(/([.,]+)\s/g, '$1? ');
            const matches = this.#address.replaceAll(/\s/g, ' ').matchAll(new RegExp(needle, 'g'));
            for (const match of matches) {
                if (typeof match.index !== 'undefined') {
                    this.#matches.push({ startIndex: match.index, endIndex: match.index + match[0].length, filledFieldIndex: i });
                }
            }
        }
    }
}
//# sourceMappingURL=AutofillManager.js.map