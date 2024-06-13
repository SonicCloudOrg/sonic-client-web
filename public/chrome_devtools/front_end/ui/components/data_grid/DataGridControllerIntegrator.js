// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as UI from '../../legacy/legacy.js';
import { DataGridController } from './DataGridController.js';
export class DataGridControllerIntegrator extends UI.Widget.VBox {
    dataGrid;
    #updateThrottler;
    // The `data` here mirrors the data of the DataGridController because
    // the users of this class expects the `data` to be up to date after `update` calls.
    // However, the `update` calls below are debounced for setting `dataGrid`s data
    // for performance reasons.
    #data;
    constructor(data) {
        /**
         * first true = isWebComponent and tells the widget system it's rendering a
         * component
         * second true = delegatesFocus, which tells the widget system to
         * let the component deal with its own focusing.
         */
        super(true, true);
        this.dataGrid = new DataGridController();
        this.dataGrid.data = data;
        this.#data = data;
        this.contentElement.appendChild(this.dataGrid);
        this.#updateThrottler = new Common.Throttler.Throttler(0);
    }
    data() {
        return this.#data;
    }
    update(data) {
        this.#data = data;
        // Setting of `dataGrid.data` is compute heavy because of the
        // filtering logic. Thus, we're debouncing calls to the setter.
        void this.#updateThrottler.schedule(async () => {
            this.dataGrid.data = data;
        });
    }
}
//# sourceMappingURL=DataGridControllerIntegrator.js.map