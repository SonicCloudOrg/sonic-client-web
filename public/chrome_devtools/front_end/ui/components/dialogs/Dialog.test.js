// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../../core/platform/platform.js';
import * as Helpers from '../../../testing/DOMHelpers.js'; // eslint-disable-line rulesdir/es_modules_import
import * as Coordinator from '../render_coordinator/render_coordinator.js';
import * as Dialogs from './dialogs.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
class DialogExampleWindowBoundsServiceFactory {
    boundingElement;
    constructor(boundingElement) {
        this.boundingElement = boundingElement;
    }
    getDevToolsBoundingElement() {
        return this.boundingElement;
    }
}
describe('Dialog', () => {
    describe('positioning', () => {
        let dialog;
        let container;
        let host;
        beforeEach(() => {
            dialog = new Dialogs.Dialog.Dialog();
            container = document.createElement('div');
            container.style.width = '500px';
            container.style.height = '500px';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.justifyContent = 'center';
            host = document.createElement('div');
            host.textContent = 'Hover me';
            host.style.width = '100px';
            host.style.height = '100px';
            dialog.position = "top" /* Dialogs.Dialog.DialogVerticalPosition.TOP */;
            dialog.showConnector = true;
            dialog.origin = host;
        });
        it('places the Dialog hit area correctly', async () => {
            host.addEventListener('click', () => dialog.setDialogVisible(true));
            dialog.addEventListener('clickoutsidedialog', () => dialog.setDialogVisible(false));
            container.appendChild(host);
            container.appendChild(dialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            const hostBounds = host.getBoundingClientRect();
            const hitAreaBounds = dialog.getHitArea();
            // Make sure the hit area contains the host fully.
            assert.isAtMost(hitAreaBounds.top, hostBounds.top);
            assert.isAtLeast(hitAreaBounds.bottom, hostBounds.top + hostBounds.height);
            assert.isAtMost(hitAreaBounds.left, hostBounds.left);
            assert.isAtLeast(hitAreaBounds.right, hostBounds.left + hostBounds.width);
        });
        it('sets the automatic horizontal alignment correctly', async () => {
            // Create the container for the dialog and its origin (host).
            // This container will be set as the dialog's "window".
            // With the host in the left border of the window, the Dialog
            // should deploy from left to right (left horizontal alignment).
            container.style.display = 'block';
            host.style.position = 'relative';
            host.style.left = '0';
            const content = document.createElement('div');
            content.classList.add('dialog-content');
            content.style.padding = '0 1em';
            content.innerHTML = 'Hi';
            dialog.horizontalAlignment = "auto" /* Dialogs.Dialog.DialogHorizontalAlignment.AUTO */;
            dialog.showConnector = true;
            dialog.origin = host;
            // Set the dialog's "window" to be the container element we just created.
            dialog.windowBoundsService = new DialogExampleWindowBoundsServiceFactory(container);
            host.addEventListener('click', () => dialog.setDialogVisible(true));
            dialog.addEventListener('clickoutsidedialog', () => dialog.setDialogVisible(false));
            dialog.appendChild(content);
            container.appendChild(host);
            container.appendChild(dialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            // Open the dialog and check its position.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            // Test the dialog is deployed left to right, since this way there is more space.
            assert.strictEqual(dialog.bestHorizontalAlignment, "left" /* Dialogs.Dialog.DialogHorizontalAlignment.LEFT */);
            // Close the dialog
            Helpers.dispatchKeyDownEvent(dialog, { key: Platform.KeyboardUtilities.ESCAPE_KEY, bubbles: true, composed: true });
            await coordinator.done();
            // With the host in the right border of the window, the Dialog
            // should deploy from right to left (left horizontal alignment).
            host.style.position = 'relative';
            host.style.left = '450px';
            await coordinator.done();
            // Open the dialog and check its position.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            // Test the dialog is deployed right to left.
            assert.strictEqual(dialog.bestHorizontalAlignment, "right" /* Dialogs.Dialog.DialogHorizontalAlignment.RIGHT */);
        });
        it('sets the automatic vertical position correctly when it fits on top', async () => {
            // Create the container for the dialog and its origin (host), aligning
            // items to the bottom of the container. This container will be set as the
            // dialog's "window".
            // By default the dialog is placed at the bottom of its origin, but doing
            // so means it wouldn't fit in its window. Because if shown on top would
            // fit in its window it should be automatically positioned there.
            container.style.width = '150px';
            container.style.height = '300px';
            container.style.display = 'flex';
            container.style.alignItems = 'end';
            container.style.justifyContent = 'center';
            // The dialogs content dimensions exceed the viewport's
            const content = document.createElement('div');
            content.classList.add('dialog-content');
            content.style.padding = '0 1em';
            content.innerHTML = 'Hello, World<br/> I am <br/> a Dialog!';
            dialog.position = "auto" /* Dialogs.Dialog.DialogVerticalPosition.AUTO */;
            dialog.showConnector = true;
            dialog.origin = host;
            // Set the dialog's "window" to be the container element we just created.
            dialog.windowBoundsService = new DialogExampleWindowBoundsServiceFactory(container);
            host.addEventListener('click', () => dialog.setDialogVisible(true));
            dialog.addEventListener('clickoutsidedialog', () => dialog.setDialogVisible(false));
            dialog.appendChild(content);
            container.appendChild(host);
            container.appendChild(dialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            // Open the dialog and check its position.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            // Test the capped dimensions
            assert.strictEqual(dialog.bestVerticalPosition, "top" /* Dialogs.Dialog.DialogVerticalPosition.TOP */);
        });
        it('sets the automatic vertical position correctly when it does not fit on top', async () => {
            // Create the container for the dialog and its origin (host), aligning
            // items to the bottom of the container. This container will be set as the
            // dialog's "window".
            // Because the dialog's full height cannot be fully fit at the
            // bottom or at the top it is positioned at the bottom and the
            // overflow made visible by scrolling.
            container.style.width = '150px';
            container.style.height = '80px';
            container.style.display = 'flex';
            container.style.alignItems = 'end';
            container.style.justifyContent = 'center';
            // The dialogs content dimensions exceed the viewport's
            const content = document.createElement('div');
            content.classList.add('dialog-content');
            content.style.padding = '0 1em';
            content.innerHTML = 'Hello, World<br/> I am <br/> a Dialog!';
            dialog.position = "auto" /* Dialogs.Dialog.DialogVerticalPosition.AUTO */;
            dialog.showConnector = true;
            dialog.origin = host;
            // Set the dialog's "window" to be the container element we just created.
            dialog.windowBoundsService = new DialogExampleWindowBoundsServiceFactory(container);
            host.addEventListener('click', () => dialog.setDialogVisible(true));
            dialog.addEventListener('clickoutsidedialog', () => dialog.setDialogVisible(false));
            dialog.appendChild(content);
            container.appendChild(host);
            container.appendChild(dialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            // Open the dialog and check its position.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            // Test the capped dimensions
            assert.strictEqual(dialog.bestVerticalPosition, "bottom" /* Dialogs.Dialog.DialogVerticalPosition.BOTTOM */);
        });
        // Fails on bots https://crbug.com/1441801.
        it.skip('[crbug.com/1441801]: sets the max width and height correctly when the dialog\'s content dimensions exceed the viewport and the dialog is displayed as a modal', async () => {
            const devtoolsDialog = new Dialogs.Dialog.Dialog();
            const WINDOW_WIDTH = 500;
            // This container will be set as the dialog's "window", or the representation
            // of DevTools bounding element.
            container.style.width = `${WINDOW_WIDTH}px`;
            container.style.height = `${WINDOW_WIDTH}px`;
            const host = document.createElement('div');
            host.textContent = 'Hover me';
            host.style.width = '100px';
            const content = document.createElement('div');
            content.classList.add('dialog-content');
            content.style.width = '600px';
            content.style.height = '600px';
            content.innerHTML = 'Hello, World<br/> I am <br/> a Dialog!';
            devtoolsDialog.origin = Dialogs.Dialog.MODAL;
            // Set the dialog's "window" to be the container element we just created.
            devtoolsDialog.windowBoundsService = new DialogExampleWindowBoundsServiceFactory(container);
            host.addEventListener('click', () => devtoolsDialog.setDialogVisible(true));
            devtoolsDialog.addEventListener('clickoutsidedialog', () => devtoolsDialog.setDialogVisible(false));
            container.appendChild(host);
            container.appendChild(devtoolsDialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            devtoolsDialog.appendChild(content);
            // Open the dialog and check its position.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
            if (!dialog) {
                assert.fail('Dialog not found');
                return;
            }
            assert.strictEqual(dialog.clientWidth, WINDOW_WIDTH - Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW + 2 * Dialogs.Dialog.DIALOG_SIDE_PADDING);
            assert.strictEqual(dialog.clientHeight, WINDOW_WIDTH - Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW + 2 * Dialogs.Dialog.DIALOG_VERTICAL_PADDING);
        });
        describe('with an anchor and possible overflow', () => {
            const CONTAINER_WIDTH = 500;
            const HOST_OFFSET = 100;
            const HOST_HEIGHT = 100;
            const devtoolsDialog = new Dialogs.Dialog.Dialog();
            let host;
            let container;
            beforeEach(async () => {
                // This container will be set as the dialog's "window", or the representation
                // of DevTools bounding element.
                container = document.createElement('div');
                container.style.width = `${CONTAINER_WIDTH}px`;
                container.style.height = `${CONTAINER_WIDTH}px`;
                container.style.position = 'fixed';
                container.style.top = '0';
                container.style.left = '0';
                host = document.createElement('div');
                host.textContent = 'Click me';
                host.style.width = `${HOST_HEIGHT}px`;
                host.style.height = `${HOST_HEIGHT}px`;
                host.style.position = 'absolute';
                host.style.top = `${HOST_OFFSET}px`;
                host.style.left = `${HOST_OFFSET}px`;
                // The dialogs content dimensions exceed the container's
                const content = document.createElement('div');
                content.classList.add('dialog-content');
                content.style.width = '600px';
                content.style.height = '600px';
                content.innerHTML = 'Hello, World<br/> I am <br/> a Dialog!';
                devtoolsDialog.origin = host;
                devtoolsDialog.horizontalAlignment = "center" /* Dialogs.Dialog.DialogHorizontalAlignment.CENTER */;
                // Set the dialog's "window" to be the container element we just created.
                devtoolsDialog.windowBoundsService = new DialogExampleWindowBoundsServiceFactory(container);
                host.addEventListener('click', () => devtoolsDialog.setDialogVisible(true));
                devtoolsDialog.addEventListener('clickoutsidedialog', () => devtoolsDialog.setDialogVisible(false));
                container.appendChild(host);
                container.appendChild(devtoolsDialog);
                Helpers.renderElementIntoDOM(container);
                await coordinator.done();
                devtoolsDialog.appendChild(content);
            });
            it('sets the max width and height correctly when the dialog\'s content dimensions exceed the viewport and the dialog is anchored to the left', async () => {
                devtoolsDialog.horizontalAlignment = "left" /* Dialogs.Dialog.DialogHorizontalAlignment.LEFT */;
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const { left: dialogLeft, width: dialogWidth } = dialog.getBoundingClientRect();
                const dialogLeftBorderLimitPosition = dialogWidth + dialogLeft + Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW -
                    2 * Dialogs.Dialog.DIALOG_SIDE_PADDING;
                assert.strictEqual(dialogLeftBorderLimitPosition, CONTAINER_WIDTH);
                assert.strictEqual(dialog.clientHeight, CONTAINER_WIDTH - Dialogs.Dialog.CONNECTOR_HEIGHT - HOST_HEIGHT - HOST_OFFSET +
                    2 * Dialogs.Dialog.DIALOG_VERTICAL_PADDING);
            });
            it('sets the max width and height correctly when the dialog\'s content dimensions exceed the viewport and the dialog is anchored to the right', async () => {
                devtoolsDialog.horizontalAlignment = "right" /* Dialogs.Dialog.DialogHorizontalAlignment.RIGHT */;
                await coordinator.done();
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const dialogRight = host.getBoundingClientRect().right;
                const containerLeft = container.getBoundingClientRect().left;
                assert.strictEqual(dialog.clientWidth, (dialogRight - containerLeft) - Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW +
                    2 * Dialogs.Dialog.DIALOG_SIDE_PADDING);
            });
            it('sets the dialog\'s horizontal position correctly to prevent overlap with DevTools when alinged to the left.', async () => {
                devtoolsDialog.horizontalAlignment = "left" /* Dialogs.Dialog.DialogHorizontalAlignment.LEFT */;
                host.style.left = '-10px';
                await coordinator.done();
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const dialogLeft = dialog.getBoundingClientRect().left;
                const containerLeft = container.getBoundingClientRect().left;
                assert.isAtLeast(dialogLeft, containerLeft);
            });
            it('sets the dialog\'s horizontal position correctly to prevent overlap with DevTools when alinged to the right.', async () => {
                devtoolsDialog.horizontalAlignment = "right" /* Dialogs.Dialog.DialogHorizontalAlignment.RIGHT */;
                const containerWidth = container.clientWidth;
                host.style.left = `${containerWidth + 10}px`;
                await coordinator.done();
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const dialogRight = dialog.getBoundingClientRect().right;
                const dialogRightEdgePosition = dialogRight - 2 * Dialogs.Dialog.DIALOG_SIDE_PADDING - Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW / 2;
                assert.isAtMost(dialogRightEdgePosition, containerWidth);
            });
            it('sets the dialog\'s horizontal position correctly to prevent overlapping with DevTools on the right when alinged to the center.', async () => {
                const containerWidth = container.clientWidth;
                host.style.left = `${containerWidth + 260}px`;
                await coordinator.done();
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const dialogRight = dialog.getBoundingClientRect().right;
                const dialogRightEdgePosition = dialogRight - 2 * Dialogs.Dialog.DIALOG_SIDE_PADDING - Dialogs.Dialog.DIALOG_PADDING_FROM_WINDOW / 2;
                assert.isAtMost(dialogRightEdgePosition, containerWidth);
            });
            it('sets the dialog\'s horizontal position correctly to prevent overlapping with DevTools on the left when alinged to the center.', async () => {
                host.style.left = '-260px';
                await coordinator.done();
                // Open the dialog and check its position.
                Helpers.dispatchClickEvent(host);
                await coordinator.done();
                const dialog = devtoolsDialog.shadowRoot?.querySelector('dialog');
                if (!dialog) {
                    assert.fail('Dialog not found');
                    return;
                }
                // Test the capped dimensions
                const containerLeft = container.getBoundingClientRect().left;
                const dialogLeft = dialog.getBoundingClientRect().left;
                assert.isAtLeast(dialogLeft, containerLeft);
            });
        });
        it('updates the dialog client rect automatically when its dimensions change', async function () {
            host.addEventListener('click', () => dialog.setDialogVisible(true));
            const dialogContent = document.createElement('div');
            dialogContent.style.display = 'block';
            dialogContent.style.minWidth = '10px';
            dialogContent.style.minHeight = '10px';
            dialogContent.style.fontSize = '10px';
            dialogContent.innerText = 'Hello';
            dialog.append(dialogContent);
            container.appendChild(host);
            container.appendChild(dialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
            const initialWidth = dialog.getDialogBounds().width;
            const initialHeight = dialog.getDialogBounds().height;
            // Increase the font size to increase the dialog's dimensions
            dialogContent.style.fontSize = '200px';
            // Wait for the resize handling to take effect.
            await new Promise(res => setTimeout(res, 200));
            const finalWidth = dialog.getDialogBounds().width;
            const finalHeight = dialog.getDialogBounds().height;
            assert.isAbove(finalWidth, initialWidth);
            assert.isAbove(finalHeight, initialHeight);
        });
    });
    describe('closing the dialog with the ESC key', () => {
        let devtoolsDialog;
        beforeEach(async () => {
            devtoolsDialog = new Dialogs.Dialog.Dialog();
            const container = document.createElement('div');
            const host = document.createElement('div');
            const content = document.createElement('div');
            content.innerHTML = 'Hello, World<br/> I am <br/> a Dialog!';
            devtoolsDialog.origin = host;
            host.addEventListener('click', () => devtoolsDialog.setDialogVisible(true));
            devtoolsDialog.addEventListener('clickoutsidedialog', () => devtoolsDialog.setDialogVisible(false));
            container.appendChild(host);
            container.appendChild(devtoolsDialog);
            Helpers.renderElementIntoDOM(container);
            await coordinator.done();
            devtoolsDialog.appendChild(content);
            // Open the dialog.
            Helpers.dispatchClickEvent(host);
            await coordinator.done();
        });
        it('closes the dialog by default when the ESC key is pressed', async () => {
            let dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (!dialog) {
                assert.fail('Dialog not found');
                return;
            }
            Helpers.dispatchKeyDownEvent(dialog, { key: Platform.KeyboardUtilities.ESCAPE_KEY, bubbles: true, composed: true });
            await coordinator.done();
            dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (dialog) {
                assert.fail('Dialog did not close');
                return;
            }
        });
        it('closes the dialog by default when the ESC key is pressed from document.body', async () => {
            let dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (!dialog) {
                assert.fail('Dialog not found');
                return;
            }
            Helpers.dispatchKeyDownEvent(document.body, { key: Platform.KeyboardUtilities.ESCAPE_KEY, bubbles: true, composed: true });
            await coordinator.done();
            dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (dialog) {
                assert.fail('Dialog did not close');
                return;
            }
        });
        it('closes the dialog by default when the ESC key is pressed anywhere within the devtools bounding element', async () => {
            let dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (!dialog) {
                assert.fail('Dialog not found');
                return;
            }
            const boundingElement = devtoolsDialog.windowBoundsService.getDevToolsBoundingElement();
            Helpers.dispatchKeyDownEvent(boundingElement, { key: Platform.KeyboardUtilities.ESCAPE_KEY, bubbles: true, composed: true });
            await coordinator.done();
            dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (dialog) {
                assert.fail('Dialog did not close');
                return;
            }
        });
        it('does not close the dialog when the ESC key is pressed if the closeOnESC prop is set to false', async () => {
            let dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            devtoolsDialog.closeOnESC = false;
            if (!dialog) {
                assert.fail('Dialog not found');
                return;
            }
            Helpers.dispatchKeyDownEvent(dialog, { key: Platform.KeyboardUtilities.ESCAPE_KEY });
            await coordinator.done();
            dialog = devtoolsDialog.shadowRoot?.querySelector('dialog[open]');
            if (!dialog) {
                assert.fail('Dialog was closed');
                return;
            }
        });
    });
});
//# sourceMappingURL=Dialog.test.js.map