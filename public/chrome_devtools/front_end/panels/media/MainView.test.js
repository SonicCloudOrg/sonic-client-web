// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Coordinator from '../../ui/components/render_coordinator/render_coordinator.js';
import * as Media from './media.js';
const PLAYER_ID = 'PLAYER_ID';
describeWithMockConnection('MediaMainView', () => {
    let target;
    beforeEach(() => {
        target = createTarget();
    });
    const testUiUpdate = (event, expectedMethod, inScope) => async () => {
        SDK.TargetManager.TargetManager.instance().setScopeTarget(inScope ? target : null);
        const downloadStore = new Media.MainView.PlayerDataDownloadManager();
        const expectedCall = sinon.stub(downloadStore, expectedMethod).returns();
        const mainView = new Media.MainView.MainView(downloadStore);
        mainView.markAsRoot();
        mainView.show(document.body);
        const model = target.model(Media.MediaModel.MediaModel);
        assert.exists(model);
        model.dispatchEventToListeners("PlayersCreated" /* Media.MediaModel.Events.PlayersCreated */, [PLAYER_ID]);
        const field = [{ name: 'kResolution', value: '{}', data: {}, stack: [], cause: [] }];
        const data = { playerId: PLAYER_ID, properties: field, events: field, messages: field, errors: field };
        model.dispatchEventToListeners(event, ...[data]);
        await new Promise(resolve => setTimeout(resolve, 0));
        assert.strictEqual(expectedCall.called, inScope);
        await Coordinator.RenderCoordinator.RenderCoordinator.instance().done();
        mainView.detach();
    };
    it('reacts to properties on in scope event', testUiUpdate("PlayerPropertiesChanged" /* Media.MediaModel.Events.PlayerPropertiesChanged */, 'onProperty', true));
    it('does not react to properties on out of scope event', testUiUpdate("PlayerPropertiesChanged" /* Media.MediaModel.Events.PlayerPropertiesChanged */, 'onProperty', false));
    it('reacts to event on in scope event', testUiUpdate("PlayerEventsAdded" /* Media.MediaModel.Events.PlayerEventsAdded */, 'onEvent', true));
    it('does not react to event on out of scope event', testUiUpdate("PlayerEventsAdded" /* Media.MediaModel.Events.PlayerEventsAdded */, 'onEvent', false));
    it('reacts to messages on in scope event', testUiUpdate("PlayerMessagesLogged" /* Media.MediaModel.Events.PlayerMessagesLogged */, 'onMessage', true));
    it('does not react to messages on out of scope event', testUiUpdate("PlayerMessagesLogged" /* Media.MediaModel.Events.PlayerMessagesLogged */, 'onMessage', false));
    it('reacts to error on in scope event', testUiUpdate("PlayerErrorsRaised" /* Media.MediaModel.Events.PlayerErrorsRaised */, 'onError', true));
    it('does not react to error on out of scope event', testUiUpdate("PlayerErrorsRaised" /* Media.MediaModel.Events.PlayerErrorsRaised */, 'onError', false));
});
//# sourceMappingURL=MainView.test.js.map