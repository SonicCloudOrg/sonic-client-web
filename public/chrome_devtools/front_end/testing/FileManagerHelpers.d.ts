/// <reference types="sinon" />
import * as Workspace from '../models/workspace/workspace.js';
type StubbedFileManager = Workspace.FileManager.FileManager & {
    save: sinon.SinonStub;
    append: sinon.SinonStub;
    close: sinon.SinonStub;
};
export declare function stubFileManager(): StubbedFileManager;
export {};
