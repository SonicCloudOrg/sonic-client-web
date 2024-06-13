let extensionDataGathererInstance;
/**
 * This class abstracts the source of extension data out by providing a
 * single access point to the performance panel for extension data.
 */
export class ExtensionDataGatherer {
    #traceParsedData = null;
    #extensionDataByModel = new Map();
    static instance() {
        if (extensionDataGathererInstance) {
            return extensionDataGathererInstance;
        }
        extensionDataGathererInstance = new ExtensionDataGatherer();
        return extensionDataGathererInstance;
    }
    static removeInstance() {
        extensionDataGathererInstance = undefined;
    }
    /**
     * Gets the data provided by extensions.
     */
    getExtensionData() {
        if (!this.#traceParsedData || !this.#traceParsedData.ExtensionTraceData) {
            return [];
        }
        const maybeCachedData = this.#extensionDataByModel.get(this.#traceParsedData);
        if (maybeCachedData) {
            return maybeCachedData;
        }
        return this.#traceParsedData.ExtensionTraceData.extensionTrackData;
    }
    saveCurrentModelData() {
        if (this.#traceParsedData && !this.#extensionDataByModel.has(this.#traceParsedData)) {
            this.#extensionDataByModel.set(this.#traceParsedData, this.getExtensionData());
        }
    }
    modelChanged(traceParsedData) {
        if (traceParsedData === this.#traceParsedData) {
            return;
        }
        if (this.#traceParsedData !== null) {
            // DevTools extension data is assumed to be useful only for the current
            // trace data (model). As such, if the model changes, we cache the devtools
            // extension data we have collected for the previous model and listen
            // for new data that applies to the new model.
            this.saveCurrentModelData();
        }
        this.#traceParsedData = traceParsedData;
    }
}
//# sourceMappingURL=ExtensionDataGatherer.js.map