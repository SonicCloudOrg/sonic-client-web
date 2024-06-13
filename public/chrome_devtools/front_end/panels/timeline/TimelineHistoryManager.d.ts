import * as TraceEngine from '../../models/trace/trace.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type TimelineMiniMap } from './TimelineMiniMap.js';
export type RecordingData = {
    traceParseDataIndex: number;
};
export interface NewHistoryRecordingData {
    data: RecordingData;
    filmStripForPreview: TraceEngine.Extras.FilmStrip.Data | null;
    traceParsedData: TraceEngine.Handlers.Types.TraceParseData;
    startTime: number | null;
}
export declare class TimelineHistoryManager {
    #private;
    private recordings;
    private readonly action;
    private readonly nextNumberByDomain;
    private readonly buttonInternal;
    private readonly allOverviews;
    private totalHeight;
    private enabled;
    private lastActiveTraceIndex;
    constructor(minimapComponent?: TimelineMiniMap);
    addRecording(newInput: NewHistoryRecordingData): void;
    setEnabled(enabled: boolean): void;
    button(): ToolbarButton;
    clear(): void;
    showHistoryDropDown(): Promise<RecordingData | null>;
    cancelIfShowing(): void;
    navigate(direction: number): RecordingData | null;
    private setCurrentModel;
    private updateState;
    static previewElement(traceDataIndex: number): Element;
    private static coarseAge;
    private title;
    private static dataForTraceIndex;
}
export declare const maxRecordings = 5;
export declare const previewWidth = 450;
export interface PreviewData {
    preview: Element;
    time: Element;
    lastUsed: number;
    startTime: number | null;
    title: string;
}
export declare class DropDown implements UI.ListControl.ListDelegate<number> {
    private readonly glassPane;
    private readonly listControl;
    private readonly focusRestorer;
    private selectionDone;
    constructor(availableTraceDataIndexes: number[]);
    static show(availableTraceDataIndexes: number[], activeTraceDataIndex: number, anchor: Element): Promise<number | null>;
    static cancelIfShowing(): void;
    private show;
    private onMouseMove;
    private onClick;
    private onKeyDown;
    private close;
    createElementForItem(traceDataIndex: number): Element;
    heightForItem(_traceDataIndex: number): number;
    isItemSelectable(_traceDataIndex: number): boolean;
    selectedItemChanged(from: number | null, to: number | null, fromElement: Element | null, toElement: Element | null): void;
    updateSelectedItemARIA(_fromElement: Element | null, _toElement: Element | null): boolean;
    private static instance;
}
export declare class ToolbarButton extends UI.Toolbar.ToolbarItem {
    private contentElement;
    constructor(action: UI.ActionRegistration.Action);
    setText(text: string): void;
}
