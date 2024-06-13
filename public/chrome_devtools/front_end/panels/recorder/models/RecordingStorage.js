// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
let instance = null;
class UUIDGenerator {
    next() {
        // @ts-ignore
        return crypto.randomUUID();
    }
}
export class RecordingStorage {
    #recordingsSetting;
    #mutex = new Common.Mutex.Mutex();
    #idGenerator = new UUIDGenerator();
    constructor() {
        this.#recordingsSetting = Common.Settings.Settings.instance().createSetting('recorder-recordings-ng', []);
    }
    clearForTest() {
        this.#recordingsSetting.set([]);
        this.#idGenerator = new UUIDGenerator();
    }
    setIdGeneratorForTest(idGenerator) {
        this.#idGenerator = idGenerator;
    }
    async saveRecording(flow) {
        const release = await this.#mutex.acquire();
        try {
            const recordings = await this.#recordingsSetting.forceGet();
            const storageName = this.#idGenerator.next();
            const recording = { storageName, flow };
            recordings.push(recording);
            this.#recordingsSetting.set(recordings);
            return recording;
        }
        finally {
            release();
        }
    }
    async updateRecording(storageName, flow) {
        const release = await this.#mutex.acquire();
        try {
            const recordings = await this.#recordingsSetting.forceGet();
            const recording = recordings.find(recording => recording.storageName === storageName);
            if (!recording) {
                throw new Error('No recording is found during updateRecording');
            }
            recording.flow = flow;
            this.#recordingsSetting.set(recordings);
            return recording;
        }
        finally {
            release();
        }
    }
    async deleteRecording(storageName) {
        const release = await this.#mutex.acquire();
        try {
            const recordings = await this.#recordingsSetting.forceGet();
            this.#recordingsSetting.set(recordings.filter(recording => recording.storageName !== storageName));
        }
        finally {
            release();
        }
    }
    getRecording(storageName) {
        const recordings = this.#recordingsSetting.get();
        return recordings.find(recording => recording.storageName === storageName);
    }
    getRecordings() {
        return this.#recordingsSetting.get();
    }
    static instance() {
        if (!instance) {
            instance = new RecordingStorage();
        }
        return instance;
    }
}
//# sourceMappingURL=RecordingStorage.js.map