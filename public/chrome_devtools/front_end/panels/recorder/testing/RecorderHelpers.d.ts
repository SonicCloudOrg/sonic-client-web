/// <reference types="sinon" />
import * as Models from '../models/models.js';
export interface ClientMock {
    send(): sinon.SinonStub;
}
export declare const createCustomStep: () => Models.Schema.Step;
export declare const installMocksForRecordingPlayer: () => void;
export declare const installMocksForTargetManager: () => void;
