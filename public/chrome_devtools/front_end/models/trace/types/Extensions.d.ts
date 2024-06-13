import { type SyntheticTraceEntry, type TraceEventArgs, type TraceEventData } from './TraceEvents.js';
export declare const enum ExtensionEntryType {
    TRACK_ENTRY = "track-entry",
    MARKER = "marker"
}
declare const extensionPalette: readonly ["primary", "primary-light", "primary-dark", "secondary", "secondary-light", "secondary-dark", "tertiary", "tertiary-light", "tertiary-dark", "error"];
export type ExtensionColorFromPalette = typeof extensionPalette[number];
export declare function colorIsValid(color: string): boolean;
export interface ExtensionDataPayload {
    metadata: {
        dataType: ExtensionEntryType;
        extensionName: string;
    };
}
export interface ExtensionFlameChartEntryPayload extends ExtensionDataPayload {
    metadata: ExtensionDataPayload['metadata'] & {
        dataType: ExtensionEntryType.TRACK_ENTRY;
    };
    color: ExtensionColorFromPalette;
    track: string;
    detailsPairs?: [string, string][];
    hintText?: string;
}
export interface ExtensionMarkerPayload extends ExtensionDataPayload {
    metadata: ExtensionDataPayload['metadata'] & {
        dataType: ExtensionEntryType.MARKER;
    };
    color: ExtensionColorFromPalette;
    detailsPairs?: [string, string][];
    hintText?: string;
}
export interface SyntheticExtensionFlameChartEntry extends SyntheticTraceEntry {
    args: TraceEventArgs & ExtensionFlameChartEntryPayload;
}
export interface SyntheticExtensionMarker extends SyntheticTraceEntry {
    args: TraceEventArgs & ExtensionMarkerPayload;
}
export type SyntheticExtensionEntry = SyntheticExtensionFlameChartEntry | SyntheticExtensionMarker;
export declare function validateColorInPayload(payload: ExtensionDataPayload): boolean;
export declare function isExtensionPayloadMarker(payload: ExtensionDataPayload): payload is ExtensionMarkerPayload;
export declare function isExtensionPayloadFlameChartEntry(payload: ExtensionDataPayload): payload is ExtensionFlameChartEntryPayload;
export declare function isSyntheticExtensionEntry(entry: TraceEventData): entry is SyntheticExtensionEntry;
/**
 * Synthetic events created for extension tracks.
 */
export interface SyntheticExtensionFlameChartEntry extends SyntheticTraceEntry {
    args: TraceEventArgs & ExtensionFlameChartEntryPayload;
    cat: 'devtools.extension';
}
/**
 * Synthetic events created for extension marks.
 */
export interface SyntheticExtensionMarker extends SyntheticTraceEntry {
    args: TraceEventArgs & ExtensionMarkerPayload;
    cat: 'devtools.extension';
}
export interface ExtensionTrackData {
    name: string;
    extensionName: string;
    flameChartEntries: SyntheticExtensionFlameChartEntry[];
}
export {};
