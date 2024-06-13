// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import { createFakeSetting, describeWithLocale } from '../../../../testing/EnvironmentHelpers.js';
import * as QuickOpen from './quick_open.js';
function createCommandMenuProvider(deprecationNotice) {
    const setting = createFakeSetting('test-setting', false);
    setting.setRegistration({
        settingName: 'test-setting',
        settingType: "boolean" /* Common.SettingRegistration.SettingType.BOOLEAN */,
        category: "APPEARANCE" /* Common.SettingRegistration.SettingCategory.APPEARANCE */,
        defaultValue: false,
        deprecationNotice,
    });
    const command = QuickOpen.CommandMenu.CommandMenu.createSettingCommand(setting, i18n.i18n.lockedString('Test Set Value'), true);
    const provider = new QuickOpen.CommandMenu.CommandMenuProvider([command]);
    return { setting, provider, command };
}
const warning = () => 'Deprecation Warning';
function setupElements() {
    const toplevel = document.createElement('div');
    const container = toplevel.createChild('div');
    const title = container.createChild('div');
    const subtitle = container.createChild('div');
    return { toplevel, container, title, subtitle };
}
describeWithLocale('CommandMenu', () => {
    let elements;
    beforeEach(() => {
        elements = setupElements();
    });
    afterEach(() => {
        const { toplevel, container, title, subtitle } = elements;
        subtitle.remove();
        title.remove();
        container.remove();
        toplevel.remove();
    });
    it('shows a deprecation warning for deprecated settings', () => {
        const deprecation = { disabled: true, warning };
        const { provider } = createCommandMenuProvider(deprecation);
        provider.renderItem(0, 'Test', elements.title, elements.subtitle);
        const tags = Array.from(elements.toplevel.querySelectorAll('.deprecated-tag'));
        try {
            assert.deepEqual(tags.map(e => e.textContent), ['— deprecated']);
            assert.deepEqual(tags[0].title, 'Deprecation Warning');
        }
        finally {
        }
    });
    it('reveals the setting when calling a deprecated setting', () => {
        const deprecation = { disabled: true, warning };
        const { setting, command } = createCommandMenuProvider(deprecation);
        const reveal = sinon.stub(Common.Revealer.RevealerRegistry.prototype, 'reveal');
        command.execute();
        assert.isTrue(reveal.calledOnceWithExactly(setting, false), 'Revealer was either not called or was called with unexpected arguments');
    });
});
//# sourceMappingURL=CommandMenu.test.js.map