import * as Common from '../../core/common/common.js';
import type * as Root from '../../core/root/root.js';
import { type ToolbarItem } from './Toolbar.js';
import { type TabbedViewLocation, type View, type ViewLocation } from './View.js';
import { getLocalizedViewLocationCategory, getRegisteredLocationResolvers, getRegisteredViewExtensions, maybeRemoveViewExtension, registerLocationResolver, registerViewExtension, resetViewRegistration, ViewLocationCategory, ViewLocationValues, ViewPersistence, type ViewRegistration } from './ViewRegistration.js';
import { VBox, type Widget } from './Widget.js';
export declare const defaultOptionsForTabs: {
    security: boolean;
};
export declare class PreRegisteredView implements View {
    private readonly viewRegistration;
    private widgetPromise;
    constructor(viewRegistration: ViewRegistration);
    title(): Common.UIString.LocalizedString;
    commandPrompt(): Common.UIString.LocalizedString;
    isCloseable(): boolean;
    isPreviewFeature(): boolean;
    iconName(): string | undefined;
    isTransient(): boolean;
    viewId(): string;
    location(): ViewLocationValues | undefined;
    order(): number | undefined;
    settings(): string[] | undefined;
    tags(): string | undefined;
    persistence(): ViewPersistence | undefined;
    toolbarItems(): Promise<ToolbarItem[]>;
    widget(): Promise<Widget>;
    disposeView(): Promise<void>;
    experiment(): string | undefined;
    condition(): Root.Runtime.Condition | undefined;
}
export declare class ViewManager {
    readonly views: Map<string, View>;
    private readonly locationNameByViewId;
    private readonly locationOverrideSetting;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): ViewManager;
    static removeInstance(): void;
    static createToolbar(toolbarItems: ToolbarItem[]): Element | null;
    locationNameForViewId(viewId: string): string;
    /**
     * Moves a view to a new location
     */
    moveView(viewId: string, locationName: string, options?: {
        shouldSelectTab: (boolean);
        overrideSaving: (boolean);
    }): void;
    revealView(view: View): Promise<void>;
    /**
     * Show view in location
     */
    showViewInLocation(viewId: string, locationName: string, shouldSelectTab?: boolean | undefined): void;
    view(viewId: string): View;
    materializedWidget(viewId: string): Widget | null;
    showView(viewId: string, userGesture?: boolean, omitFocus?: boolean): Promise<void>;
    resolveLocation(location?: string): Promise<Location | null>;
    createTabbedLocation(revealCallback?: (() => void), location?: string, restoreSelection?: boolean, allowReorder?: boolean, defaultTab?: string | null): TabbedViewLocation;
    createStackLocation(revealCallback?: (() => void), location?: string, jslogContext?: string): ViewLocation;
    hasViewsForLocation(location: string): boolean;
    viewsForLocation(location: string): View[];
}
export declare class ContainerWidget extends VBox {
    private readonly view;
    private materializePromise?;
    constructor(view: View);
    materialize(): Promise<void>;
    wasShown(): void;
    private wasShownForTest;
}
declare class Location {
    protected readonly manager: ViewManager;
    private readonly revealCallback;
    private readonly widgetInternal;
    constructor(manager: ViewManager, widget: Widget, revealCallback?: (() => void));
    widget(): Widget;
    reveal(): void;
    showView(_view: View, _insertBefore?: View | null, _userGesture?: boolean, _omitFocus?: boolean, _shouldSelectTab?: boolean): Promise<void>;
    removeView(_view: View): void;
}
export { ViewRegistration, ViewPersistence, getRegisteredViewExtensions, maybeRemoveViewExtension, registerViewExtension, ViewLocationValues, getRegisteredLocationResolvers, registerLocationResolver, ViewLocationCategory, getLocalizedViewLocationCategory, resetViewRegistration, };
