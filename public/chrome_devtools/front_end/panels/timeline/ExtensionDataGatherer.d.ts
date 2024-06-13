import type * as TraceEngine from '../../models/trace/trace.js';
type TrackData = TraceEngine.Types.Extensions.ExtensionTrackData;
export { TrackData };
type ExtensionData = readonly TrackData[];
/**
 * This class abstracts the source of extension data out by providing a
 * single access point to the performance panel for extension data.
 */
export declare class ExtensionDataGatherer {
    #private;
    static instance(): ExtensionDataGatherer;
    static removeInstance(): void;
    /**
     * Gets the data provided by extensions.
     */
    getExtensionData(): ExtensionData;
    saveCurrentModelData(): void;
    modelChanged(traceParsedData: TraceEngine.Handlers.Types.TraceParseData | null): void;
}
