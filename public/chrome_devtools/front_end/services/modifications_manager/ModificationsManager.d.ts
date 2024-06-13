import * as TraceEngine from '../../models/trace/trace.js';
import * as TimelineComponents from '../../panels/timeline/components/components.js';
export declare class ModificationsManager {
    #private;
    /**
     * Gets the ModificationsManager instance corresponding to a trace
     * given its index used in Model#traces. If no index is passed gets
     * the manager instance for the last trace. If no instance is found,
     * throws.
     */
    static activeManager(): ModificationsManager | null;
    /**
     * Initializes a ModificationsManager instance for a parsed trace or changes the active manager for an existing one.
     * This needs to be called if and a trace has been parsed or switched to.
     */
    static initAndActivateModificationsManager(traceModel: TraceEngine.TraceModel.Model<typeof TraceEngine.Handlers.ModelHandlers>, traceIndex: number): void;
    private constructor();
    getEntriesFilter(): TraceEngine.EntriesFilter.EntriesFilter;
    getTimelineBreadcrumbs(): TimelineComponents.Breadcrumbs.Breadcrumbs;
    /**
     * Builds all modifications into a serializable object written into
     * the 'modifications' trace file metadata field.
     */
    toJSON(): TraceEngine.Types.File.Modifications;
    applyModificationsIfPresent(): void;
    applyEntriesFilterModifications(hiddenEntriesKeys: TraceEngine.Types.File.TraceEventSerializableKey[], expandableEntriesKeys: TraceEngine.Types.File.TraceEventSerializableKey[]): void;
}
