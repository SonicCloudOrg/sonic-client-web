export type Screenshot = string & {
    _brand: 'ImageData';
};
export interface ScreenshotMetaData {
    recordingName: string;
    index: number;
    data: Screenshot;
}
/**
 * This class stores the screenshots taken for a specific recording
 * in a settings object. The total storage size is limited to 50 MB
 * by default and the least recently accessed screenshots will be
 * deleted first.
 */
export declare class ScreenshotStorage {
    #private;
    constructor(maxStorageSize?: number);
    clear(): void;
    getScreenshotForSection(recordingName: string, index: number): Screenshot | null;
    storeScreenshotForSection(recordingName: string, index: number, data: Screenshot): void;
    deleteScreenshotsForRecording(recordingName: string): void;
    static instance(opts?: {
        forceNew?: boolean | null;
        maxStorageSize?: number;
    }): ScreenshotStorage;
}
