// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget, stubNoopSettings } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection, } from '../../testing/MockConnection.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as Main from './main.js';
describeWithMockConnection('MainMenuItem', () => {
    beforeEach(async () => {
        stubNoopSettings();
        sinon.stub(UI.ShortcutRegistry.ShortcutRegistry, 'instance').returns({
            shortcutTitleForAction: () => { },
            shortcutsForAction: () => [],
        });
        const tabTaget = createTarget({ type: SDK.Target.Type.Tab });
        createTarget({ parentTarget: tabTaget, subtype: 'prerender' });
        createTarget({ parentTarget: tabTaget });
        sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'hasAction')
            .withArgs(sinon.match(/inspector-main.focus-debuggee|main.toggle-drawer/))
            .returns(true);
        sinon.stub(UI.ActionRegistry.ActionRegistry.instance(), 'getAction')
            .withArgs(sinon.match(/inspector-main.focus-debuggee|main.toggle-drawer/))
            .returns(sinon.createStubInstance(UI.ActionRegistration.Action));
    });
    it('includes focus debuggee item when undocked', async () => {
        UI.DockController.DockController.instance().setDockSide("undocked" /* UI.DockController.DockState.UNDOCKED */);
        const item = Main.MainImpl.MainMenuItem.instance({ forceNew: true }).item();
        assert.exists(item);
        const contextMenuShow = sinon.stub(UI.ContextMenu.ContextMenu.prototype, 'show').resolves();
        item.clicked(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }));
        assert.isTrue(contextMenuShow.calledOnce);
        assert.exists(contextMenuShow.thisValues[0].defaultSection().items.find((item) => item.buildDescriptor().label === 'Focus page'));
    });
    it('does not include focus debuggee item when docked', async () => {
        UI.DockController.DockController.instance().setDockSide("bottom" /* UI.DockController.DockState.BOTTOM */);
        const item = Main.MainImpl.MainMenuItem.instance({ forceNew: true }).item();
        assert.exists(item);
        const contextMenuShow = sinon.stub(UI.ContextMenu.ContextMenu.prototype, 'show').resolves();
        item.clicked(new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
        }));
        assert.isTrue(contextMenuShow.calledOnce);
        assert.notExists(contextMenuShow.thisValues[0].defaultSection().items.find((item) => item.buildDescriptor().label === 'Focus page'));
    });
});
//# sourceMappingURL=MainImpl.test.js.map