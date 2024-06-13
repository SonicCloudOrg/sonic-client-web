// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { dispatchKeyDownEvent, renderElementIntoDOM } from '../../../testing/DOMHelpers.js';
import * as Coordinator from '../render_coordinator/render_coordinator.js';
import * as Buttons from './buttons.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
describe('Button', () => {
    const iconUrl = new URL('../../../Images/file-image.svg', import.meta.url).toString();
    async function renderButton(data = {
        variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
    }, text = 'Button') {
        const button = new Buttons.Button.Button();
        button.data = data;
        // Toolbar and round buttons do not take text, and error if you try to set any.
        if (data.variant !== "toolbar" /* Buttons.Button.Variant.TOOLBAR */ && data.variant !== "icon" /* Buttons.Button.Variant.ICON */) {
            button.innerText = text;
        }
        renderElementIntoDOM(button);
        await coordinator.done();
        return button;
    }
    async function testClick(data = {
        variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
        disabled: false,
    }, expectedClickCount = 1) {
        const button = await renderButton(data);
        let clicks = 0;
        button.onclick = () => clicks++;
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.instanceOf(innerButton, HTMLButtonElement);
        innerButton.click();
        dispatchKeyDownEvent(innerButton, {
            key: 'Enter',
        });
        assert.strictEqual(clicks, expectedClickCount);
    }
    it('primary button can be clicked', async () => {
        await testClick({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
        });
    });
    it('disabled primary button cannot be clicked', async () => {
        await testClick({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            disabled: true,
        }, 0);
    });
    it('secondary button can be clicked', async () => {
        await testClick({
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
        });
    });
    it('disabled secondary button cannot be clicked', async () => {
        await testClick({
            variant: "outlined" /* Buttons.Button.Variant.OUTLINED */,
            disabled: true,
        }, 0);
    });
    it('toolbar button can be clicked', async () => {
        await testClick({
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconUrl,
        });
    });
    it('disabled toolbar button cannot be clicked', async () => {
        await testClick({
            variant: "toolbar" /* Buttons.Button.Variant.TOOLBAR */,
            iconUrl,
            disabled: true,
        }, 0);
    });
    it('gets the no additional classes set for the inner button if only text is provided', async () => {
        const button = await renderButton();
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.isTrue(!innerButton.classList.contains('text-with-icon'));
        assert.isTrue(!innerButton.classList.contains('only-icon'));
    });
    it('gets title set', async () => {
        const button = await renderButton({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            title: 'Custom',
        });
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.strictEqual(innerButton.title, 'Custom');
        button.title = 'Custom2';
        await coordinator.done();
        assert.strictEqual(innerButton.title, 'Custom2');
    });
    it('gets the text-with-icon class set for the inner button if text and icon is provided', async () => {
        const button = await renderButton({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            iconUrl,
        }, 'text');
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.isTrue(innerButton.classList.contains('text-with-icon'));
        assert.isTrue(!innerButton.classList.contains('only-icon'));
    });
    it('gets the only-icon class set for the inner button if only icon is provided', async () => {
        const button = await renderButton({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            iconUrl,
        }, '');
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.isTrue(!innerButton.classList.contains('text-with-icon'));
        assert.isTrue(innerButton.classList.contains('only-icon'));
    });
    it('gets the `small` class set for the inner button if size === SMALL', async () => {
        const button = await renderButton({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            size: "SMALL" /* Buttons.Button.Size.SMALL */,
        }, '');
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.isTrue(innerButton.classList.contains('small'));
    });
    it('does not get the `small` class set for the inner button if size === MEDIUM', async () => {
        const button = await renderButton({
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
            iconUrl,
        }, '');
        const innerButton = button.shadowRoot?.querySelector('button');
        assert.isFalse(innerButton.classList.contains('small'));
    });
    describe('in forms', () => {
        async function renderForm(data = {
            variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
        }) {
            const form = document.createElement('form');
            const input = document.createElement('input');
            const button = new Buttons.Button.Button();
            const reference = {
                submitCount: 0,
                form,
                button,
                input,
            };
            form.onsubmit = (event) => {
                event.preventDefault();
                reference.submitCount++;
            };
            button.data = data;
            button.innerText = 'button';
            form.append(input);
            form.append(button);
            renderElementIntoDOM(form);
            await coordinator.done();
            return reference;
        }
        it('submits a form with button[type=submit]', async () => {
            const state = await renderForm({
                variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
                type: 'submit',
            });
            state.button.click();
            assert.strictEqual(state.submitCount, 1);
        });
        it('does not submit a form with button[type=button]', async () => {
            const state = await renderForm({
                variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
                type: 'button',
            });
            state.button.click();
            assert.strictEqual(state.submitCount, 0);
        });
        it('resets a form with button[type=reset]', async () => {
            const state = await renderForm({
                variant: "primary" /* Buttons.Button.Variant.PRIMARY */,
                type: 'reset',
            });
            state.input.value = 'test';
            state.button.click();
            assert.strictEqual(state.input.value, '');
        });
    });
});
//# sourceMappingURL=Button.test.js.map