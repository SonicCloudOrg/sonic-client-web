// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import { deinitializeGlobalVars, initializeGlobalVars, } from '../../testing/EnvironmentHelpers.js';
import * as LegacyUI from './legacy.js';
async function registerDockingSettings(currentValue) {
    Common.Settings.registerSettingsForTest([{
            category: "GLOBAL" /* Common.Settings.SettingCategory.GLOBAL */,
            settingName: 'currentDockState',
            settingType: "enum" /* Common.Settings.SettingType.ENUM */,
            defaultValue: currentValue,
            options: [
                {
                    value: 'right',
                    text: () => 'right',
                    title: () => 'Dock to right',
                    raw: false,
                },
                {
                    value: 'bottom',
                    text: () => 'bottom',
                    title: () => 'Dock to bottom',
                    raw: false,
                },
                {
                    value: 'left',
                    text: () => 'left',
                    title: () => 'Dock to left',
                    raw: false,
                },
                {
                    value: 'undocked',
                    text: () => 'undocked',
                    title: () => 'Undock',
                    raw: false,
                },
            ],
        }]);
    Root.Runtime.experiments.clearForTest();
    await initializeGlobalVars({ reset: false });
}
describe('DockController', () => {
    after(async () => {
        await deinitializeGlobalVars();
    });
    it('defaults the dockside to undefined when first created', async () => {
        /* Note: this seems like weird behaviour, but updating DockController to
         * explicitly set DockSide by default seems to cause issues in Chrome web
         * tests, so adding this test here to ensure we don't cause any problems.
         */
        await registerDockingSettings('left');
        const dockController = LegacyUI.DockController.DockController.instance({ forceNew: true, canDock: true });
        assert.strictEqual(dockController.dockSide(), undefined);
    });
    it('falls back to undefined if the setting value is unexpected', async () => {
        await registerDockingSettings('woah-not-a-real-setting-value');
        const dockController = LegacyUI.DockController.DockController.instance({ forceNew: true, canDock: true });
        assert.strictEqual(dockController.dockSide(), undefined);
    });
    it('sets the dockSide to undocked if the dock cannot be docked', async () => {
        await registerDockingSettings('left');
        const dockController = LegacyUI.DockController.DockController.instance({ forceNew: true, canDock: false });
        assert.strictEqual(dockController.dockSide(), "undocked" /* LegacyUI.DockController.DockState.UNDOCKED */);
    });
    it('can toggle the dock between two settings', async () => {
        await registerDockingSettings('left');
        const dockController = LegacyUI.DockController.DockController.instance({ forceNew: true, canDock: true });
        dockController.toggleDockSide();
        assert.strictEqual(dockController.dockSide(), "bottom" /* LegacyUI.DockController.DockState.BOTTOM */);
        dockController.toggleDockSide();
        assert.strictEqual(dockController.dockSide(), "left" /* LegacyUI.DockController.DockState.LEFT */);
        dockController.toggleDockSide();
        assert.strictEqual(dockController.dockSide(), "bottom" /* LegacyUI.DockController.DockState.BOTTOM */);
    });
});
//# sourceMappingURL=DockController.test.js.map