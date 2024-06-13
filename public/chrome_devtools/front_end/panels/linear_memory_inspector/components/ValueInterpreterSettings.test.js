// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { getElementsWithinComponent, getEventPromise, renderElementIntoDOM, } from '../../../testing/DOMHelpers.js';
import { describeWithLocale } from '../../../testing/EnvironmentHelpers.js';
import * as LinearMemoryInspectorComponents from './components.js';
const SETTINGS_INPUT_SELECTOR = '[data-input]';
const SETTINGS_TITLE_SELECTOR = '[data-title]';
const SETTINGS_LABEL_SELECTOR = '.type-label';
describeWithLocale('ValueInterpreterSettings', () => {
    function setUpComponent() {
        const component = new LinearMemoryInspectorComponents.ValueInterpreterSettings.ValueInterpreterSettings();
        const data = {
            valueTypes: new Set([
                "Integer 8-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int8 */,
                "Float 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Float64 */,
                "Pointer 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Pointer32 */,
            ]),
        };
        component.data = data;
        renderElementIntoDOM(component);
        return { component, data };
    }
    it('renders all checkboxes', () => {
        const { component } = setUpComponent();
        const checkboxes = getElementsWithinComponent(component, SETTINGS_LABEL_SELECTOR, HTMLLabelElement);
        const checkboxLabels = Array.from(checkboxes, checkbox => checkbox.getAttribute('title'));
        assert.deepEqual(checkboxLabels, [
            "Integer 8-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int8 */,
            "Integer 16-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int16 */,
            "Integer 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int32 */,
            "Integer 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int64 */,
            "Float 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Float32 */,
            "Float 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Float64 */,
            "Pointer 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Pointer32 */,
            "Pointer 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Pointer64 */,
        ]);
    });
    it('triggers an event on checkbox click', async () => {
        const { component } = setUpComponent();
        const labels = getElementsWithinComponent(component, SETTINGS_LABEL_SELECTOR, HTMLLabelElement);
        for (const label of labels) {
            const checkbox = label.querySelector(SETTINGS_INPUT_SELECTOR);
            assert.instanceOf(checkbox, HTMLInputElement);
            const title = label.querySelector(SETTINGS_TITLE_SELECTOR);
            assert.instanceOf(title, HTMLSpanElement);
            const checked = checkbox.checked;
            const eventPromise = getEventPromise(component, 'typetoggle');
            checkbox.click();
            const event = await eventPromise;
            assert.strictEqual(`${event.data.type}`, title.innerText);
            assert.strictEqual(checkbox.checked, !checked);
        }
    });
    it('correctly shows checkboxes as checked/unchecked', () => {
        const { component, data } = setUpComponent();
        const labels = getElementsWithinComponent(component, SETTINGS_LABEL_SELECTOR, HTMLLabelElement);
        const elements = Array.from(labels).map(label => {
            const checkbox = label.querySelector(SETTINGS_INPUT_SELECTOR);
            const title = label.querySelector(SETTINGS_TITLE_SELECTOR);
            assert.instanceOf(checkbox, HTMLInputElement);
            assert.instanceOf(title, HTMLSpanElement);
            return { title, checked: checkbox.checked };
        });
        assert.isAtLeast(data.valueTypes.size, 1);
        const checkedTitles = new Set(elements.filter(n => n.checked).map(n => n.title.innerText));
        const expectedTitles = new Set([...data.valueTypes].map(type => `${type}`));
        assert.deepEqual(checkedTitles, expectedTitles);
        const uncheckedTitles = new Set(elements.filter(n => !n.checked).map(n => n.title.innerText));
        const allTypesTitle = [
            "Integer 8-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int8 */,
            "Integer 16-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int16 */,
            "Integer 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int32 */,
            "Integer 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Int64 */,
            "Float 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Float32 */,
            "Float 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Float64 */,
            "Pointer 32-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Pointer32 */,
            "Pointer 64-bit" /* LinearMemoryInspectorComponents.ValueInterpreterDisplayUtils.ValueType.Pointer64 */,
        ];
        const expectedUncheckedTitles = new Set(allTypesTitle.filter(title => !expectedTitles.has(title)));
        assert.deepEqual(uncheckedTitles, expectedUncheckedTitles);
    });
});
//# sourceMappingURL=ValueInterpreterSettings.test.js.map