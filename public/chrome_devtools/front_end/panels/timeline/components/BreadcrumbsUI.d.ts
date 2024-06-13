import * as TraceEngine from '../../../models/trace/trace.js';
export interface BreadcrumbsUIData {
    breadcrumb: TraceEngine.Types.File.Breadcrumb;
}
export declare class BreadcrumbRemovedEvent extends Event {
    breadcrumb: TraceEngine.Types.File.Breadcrumb;
    static readonly eventName = "breadcrumbremoved";
    constructor(breadcrumb: TraceEngine.Types.File.Breadcrumb);
}
export declare class BreadcrumbsUI extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: BreadcrumbsUIData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-breadcrumbs-ui': BreadcrumbsUI;
    }
}
