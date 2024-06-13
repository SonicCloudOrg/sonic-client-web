// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
export class MediaModel extends SDK.SDKModel.SDKModel {
    enabled;
    agent;
    constructor(target) {
        super(target);
        this.enabled = false;
        this.agent = target.mediaAgent();
        target.registerMediaDispatcher(this);
    }
    async resumeModel() {
        if (!this.enabled) {
            return Promise.resolve();
        }
        await this.agent.invoke_enable();
    }
    ensureEnabled() {
        void this.agent.invoke_enable();
        this.enabled = true;
    }
    playerPropertiesChanged(event) {
        this.dispatchEventToListeners("PlayerPropertiesChanged" /* Events.PlayerPropertiesChanged */, event);
    }
    playerEventsAdded(event) {
        this.dispatchEventToListeners("PlayerEventsAdded" /* Events.PlayerEventsAdded */, event);
    }
    playerMessagesLogged(event) {
        this.dispatchEventToListeners("PlayerMessagesLogged" /* Events.PlayerMessagesLogged */, event);
    }
    playerErrorsRaised(event) {
        this.dispatchEventToListeners("PlayerErrorsRaised" /* Events.PlayerErrorsRaised */, event);
    }
    playersCreated({ players }) {
        this.dispatchEventToListeners("PlayersCreated" /* Events.PlayersCreated */, players);
    }
}
SDK.SDKModel.SDKModel.register(MediaModel, { capabilities: 262144 /* SDK.Target.Capability.Media */, autostart: false });
//# sourceMappingURL=MediaModel.js.map