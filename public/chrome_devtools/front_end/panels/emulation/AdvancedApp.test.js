// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import { deinitializeGlobalVars, initializeGlobalVars, } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import * as Emulation from './emulation.js';
describeWithMockConnection('AdvancedApp', () => {
    beforeEach(async () => {
        await deinitializeGlobalVars();
        Common.Settings.registerSettingsForTest([{
                category: "GLOBAL" /* Common.Settings.SettingCategory.GLOBAL */,
                settingName: 'currentDockState',
                settingType: "enum" /* Common.Settings.SettingType.ENUM */,
                defaultValue: 'right',
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
        await initializeGlobalVars({ reset: false });
    });
    afterEach(async () => {
        await deinitializeGlobalVars();
    });
    it('updates colors node link on ColorThemeChanged', async () => {
        const advancedApp = Emulation.AdvancedApp.AdvancedApp.instance();
        assert.exists(advancedApp);
        const fetchColorsSpy = sinon.spy(ThemeSupport.ThemeSupport.instance(), 'fetchColorsAndApplyHostTheme');
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.events.dispatchEventToListeners(Host.InspectorFrontendHostAPI.Events.ColorThemeChanged);
        assert.isTrue(fetchColorsSpy.called);
    });
});
//# sourceMappingURL=AdvancedApp.test.js.map