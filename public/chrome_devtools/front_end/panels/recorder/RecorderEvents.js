// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class ReplayFinishedEvent extends Event {
    static eventName = 'replayfinished';
    constructor() {
        super(ReplayFinishedEvent.eventName, { bubbles: true, composed: true });
    }
}
export class RecordingStateChangedEvent extends Event {
    recording;
    static eventName = 'recordingstatechanged';
    constructor(recording) {
        super(RecordingStateChangedEvent.eventName, {
            bubbles: true,
            composed: true,
        });
        this.recording = recording;
    }
}
//# sourceMappingURL=RecorderEvents.js.map