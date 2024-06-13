import * as TraceEngine from '../../models/trace/trace.js';
export declare enum EventCategory {
    DRAWING = "drawing",
    RASTERIZING = "rasterizing",
    LAYOUT = "layout",
    LOADING = "loading",
    EXPERIENCE = "experience",
    SCRIPTING = "scripting",
    MESSAGING = "messaging",
    RENDERING = "rendering",
    PAINTING = "painting",
    GPU = "gpu",
    ASYNC = "async",
    OTHER = "other",
    IDLE = "idle"
}
export declare class TimelineRecordStyle {
    title: string;
    category: TimelineCategory;
    hidden: boolean;
    constructor(title: string, category: TimelineCategory, hidden?: boolean | undefined);
}
export declare class TimelineCategory {
    name: EventCategory;
    title: string;
    visible: boolean;
    childColor: string;
    colorInternal: string;
    private hiddenInternal?;
    constructor(name: EventCategory, title: string, visible: boolean, childColor: string, color: string);
    get hidden(): boolean;
    get color(): string;
    getCSSValue(): string;
    getComputedColorValue(): string;
    set hidden(hidden: boolean);
}
export type CategoryPalette = {
    [c in EventCategory]: TimelineCategory;
};
type EventStylesMap = {
    [key in TraceEngine.Types.TraceEvents.KnownEventName]?: TimelineRecordStyle;
};
export declare function getEventStyle(eventName: TraceEngine.Types.TraceEvents.KnownEventName): TimelineRecordStyle | undefined;
export declare function stringIsEventCategory(it: string): it is EventCategory;
export declare function getCategoryStyles(): CategoryPalette;
export declare function maybeInitSylesMap(): EventStylesMap;
export declare function setEventStylesMap(eventStyles: EventStylesMap): void;
export declare function setCategories(cats: CategoryPalette): void;
export declare function visibleTypes(): string[];
export declare function getTimelineMainEventCategories(): EventCategory[];
export declare function setTimelineMainEventCategories(categories: EventCategory[]): void;
export {};
