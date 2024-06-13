// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as Platform from '../../../core/platform/platform.js';
import * as Input from '../../../ui/components/input/input.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import { valueTypeToLocalizedString } from './ValueInterpreterDisplayUtils.js';
import valueInterpreterSettingsStyles from './valueInterpreterSettings.css.js';
const { render, html } = LitHtml;
const UIStrings = {
    /**
     *@description Name of a group of selectable value types that do not fall under integer and floating point value types, e.g. Pointer32. The group appears name appears under the Value Interpreter Settings.
     */
    otherGroup: 'Other',
};
const str_ = i18n.i18n.registerUIStrings('panels/linear_memory_inspector/components/ValueInterpreterSettings.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
const GROUP_TO_TYPES = new Map([
    ["Integer" /* ValueTypeGroup.Integer */, ["Integer 8-bit" /* ValueType.Int8 */, "Integer 16-bit" /* ValueType.Int16 */, "Integer 32-bit" /* ValueType.Int32 */, "Integer 64-bit" /* ValueType.Int64 */]],
    ["Floating point" /* ValueTypeGroup.Float */, ["Float 32-bit" /* ValueType.Float32 */, "Float 64-bit" /* ValueType.Float64 */]],
    ["Other" /* ValueTypeGroup.Other */, ["Pointer 32-bit" /* ValueType.Pointer32 */, "Pointer 64-bit" /* ValueType.Pointer64 */]],
]);
function valueTypeGroupToLocalizedString(group) {
    if (group === "Other" /* ValueTypeGroup.Other */) {
        return i18nString(UIStrings.otherGroup);
    }
    // The remaining group type names should not be localized.
    return group;
}
export class TypeToggleEvent extends Event {
    static eventName = 'typetoggle';
    data;
    constructor(type, checked) {
        super(TypeToggleEvent.eventName);
        this.data = { type, checked };
    }
}
export class ValueInterpreterSettings extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-linear-memory-inspector-interpreter-settings`;
    #shadow = this.attachShadow({ mode: 'open' });
    #valueTypes = new Set();
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [Input.checkboxStyles, valueInterpreterSettingsStyles];
    }
    set data(data) {
        this.#valueTypes = data.valueTypes;
        this.#render();
    }
    #render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <div class="settings" jslog=${VisualLogging.pane('settings')}>
       ${[...GROUP_TO_TYPES.keys()].map(group => {
            return html `
          <div class="value-types-selection">
            <span class="group">${valueTypeGroupToLocalizedString(group)}</span>
            ${this.#plotTypeSelections(group)}
          </div>
        `;
        })}
      </div>
      `, this.#shadow, { host: this });
    }
    #plotTypeSelections(group) {
        const types = GROUP_TO_TYPES.get(group);
        if (!types) {
            throw new Error(`Unknown group ${group}`);
        }
        return html `
      ${types.map(type => {
            return html `
          <label class="type-label" title=${valueTypeToLocalizedString(type)}>
            <input data-input="true" type="checkbox" .checked=${this.#valueTypes.has(type)} @change=${(e) => this.#onTypeToggle(type, e)} jslog=${VisualLogging.toggle().track({ change: true }).context(Platform.StringUtilities.toKebabCase(type))}>
            <span data-title="true">${valueTypeToLocalizedString(type)}</span>
          </label>
     `;
        })}`;
    }
    #onTypeToggle(type, event) {
        const checkbox = event.target;
        this.dispatchEvent(new TypeToggleEvent(type, checkbox.checked));
    }
}
customElements.define('devtools-linear-memory-inspector-interpreter-settings', ValueInterpreterSettings);
//# sourceMappingURL=ValueInterpreterSettings.js.map