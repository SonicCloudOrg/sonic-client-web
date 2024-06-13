import * as Host from '../../core/host/host.js';
import type * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import { type SoftContextMenuDescriptor } from './SoftContextMenu.js';
export declare class Item {
    #private;
    private readonly typeInternal;
    protected readonly label: string | undefined;
    protected disabled: boolean | undefined;
    private readonly checked;
    protected contextMenu: ContextMenu | null;
    protected idInternal: number | undefined;
    customElement?: Element;
    private shortcut?;
    protected jslogContext: string | undefined;
    constructor(contextMenu: ContextMenu | null, type: 'checkbox' | 'item' | 'separator' | 'subMenu', label?: string, disabled?: boolean, checked?: boolean, tooltip?: Platform.UIString.LocalizedString, jslogContext?: string);
    id(): number;
    type(): string;
    isEnabled(): boolean;
    setEnabled(enabled: boolean): void;
    buildDescriptor(): SoftContextMenuDescriptor | Host.InspectorFrontendHostAPI.ContextMenuDescriptor;
    setShortcut(shortcut: string): void;
}
export declare class Section {
    private readonly contextMenu;
    readonly items: Item[];
    constructor(contextMenu: ContextMenu | null);
    appendItem(label: string, handler: () => void, options?: {
        disabled?: boolean;
        additionalElement?: Element;
        tooltip?: Platform.UIString.LocalizedString;
        jslogContext?: string;
    }): Item;
    appendCustomItem(element: Element, jslogContext?: string): Item;
    appendSeparator(): Item;
    appendAction(actionId: string, label?: string, optional?: boolean): void;
    appendSubMenuItem(label: string, disabled?: boolean, jslogContext?: string): SubMenu;
    appendCheckboxItem(label: string, handler: () => void, options?: {
        checked?: boolean;
        disabled?: boolean;
        additionalElement?: Element;
        tooltip?: Platform.UIString.LocalizedString;
        jslogContext?: string;
    }): Item;
}
export declare class SubMenu extends Item {
    private readonly sections;
    private readonly sectionList;
    constructor(contextMenu: ContextMenu | null, label?: string, disabled?: boolean, jslogContext?: string);
    init(): void;
    section(name?: string): Section;
    headerSection(): Section;
    newSection(): Section;
    revealSection(): Section;
    clipboardSection(): Section;
    editSection(): Section;
    debugSection(): Section;
    viewSection(): Section;
    defaultSection(): Section;
    overrideSection(): Section;
    saveSection(): Section;
    footerSection(): Section;
    buildDescriptor(): SoftContextMenuDescriptor | Host.InspectorFrontendHostAPI.ContextMenuDescriptor;
    appendItemsAtLocation(location: string): void;
    private static uniqueSectionName;
}
export interface ContextMenuOptions {
    useSoftMenu?: boolean;
    keepOpen?: boolean;
    onSoftMenuClosed?: () => void;
    x?: number;
    y?: number;
}
export declare class ContextMenu extends SubMenu {
    protected contextMenu: this;
    private pendingTargets;
    private readonly event;
    private readonly useSoftMenu;
    private readonly keepOpen;
    private x;
    private y;
    private onSoftMenuClosed?;
    private jsLogContext?;
    private readonly handlers;
    idInternal: number;
    private softMenu?;
    private contextMenuLabel?;
    private openHostedMenu;
    private eventTarget;
    private loggableParent;
    constructor(event: Event, options?: ContextMenuOptions);
    static initialize(): void;
    static installHandler(doc: Document): void;
    nextId(): number;
    isHostedMenuOpen(): boolean;
    getItems(): SoftContextMenuDescriptor[];
    setChecked(item: SoftContextMenuDescriptor, checked: boolean): void;
    show(): Promise<void>;
    discard(): void;
    private registerLoggablesWithin;
    private innerShow;
    setContextMenuLabel(label: string): void;
    setX(x: number): void;
    setY(y: number): void;
    setHandler(id: number, handler: () => void): void;
    private buildMenuDescriptors;
    private onItemSelected;
    private itemSelected;
    private menuCleared;
    /**
     * Appends the `target` to the list of pending targets for which context menu providers
     * will be loaded when showing the context menu. If the `target` was already appended
     * before, it just ignores this call.
     *
     * @param target an object for which we can have registered menu item providers.
     */
    appendApplicableItems(target: unknown): void;
    markAsMenuItemCheckBox(): void;
    private static pendingMenu;
    private static useSoftMenu;
    static readonly groupWeights: string[];
}
export interface Provider<T> {
    appendApplicableItems(event: Event, contextMenu: ContextMenu, target: T): void;
}
export declare function registerProvider<T>(registration: ProviderRegistration<T>): void;
export declare function registerItem(registration: ContextMenuItemRegistration): void;
export declare function maybeRemoveItem(registration: ContextMenuItemRegistration): boolean;
export declare const enum ItemLocation {
    DEVICE_MODE_MENU_SAVE = "deviceModeMenu/save",
    MAIN_MENU = "mainMenu",
    MAIN_MENU_DEFAULT = "mainMenu/default",
    MAIN_MENU_FOOTER = "mainMenu/footer",
    MAIN_MENU_HELP_DEFAULT = "mainMenuHelp/default",
    NAVIGATOR_MENU_DEFAULT = "navigatorMenu/default",
    PROFILER_MENU_DEFAULT = "profilerMenu/default",
    TIMELINE_MENU_OPEN = "timelineMenu/open"
}
export interface ProviderRegistration<T> {
    contextTypes: () => Array<abstract new (...any: any[]) => T>;
    loadProvider: () => Promise<Provider<T>>;
    experiment?: Root.Runtime.ExperimentName;
}
export interface ContextMenuItemRegistration {
    location: ItemLocation;
    actionId: string;
    order?: number;
    experiment?: Root.Runtime.ExperimentName;
}
