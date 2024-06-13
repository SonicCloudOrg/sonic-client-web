import * as Platform from '../platform/platform.js';
import * as Root from '../root/root.js';
import { type EventDescriptor, type EventTargetEvent, type GenericEvents } from './EventTarget.js';
import { ObjectWrapper } from './Object.js';
import { getLocalizedSettingsCategory, maybeRemoveSettingExtension, type RegExpSettingItem, registerSettingExtension, registerSettingsForTest, resetSettings, SettingCategory, type SettingExtensionOption, type SettingRegistration, SettingType } from './SettingRegistration.js';
export declare class Settings {
    #private;
    readonly syncedStorage: SettingsStorage;
    readonly globalStorage: SettingsStorage;
    readonly localStorage: SettingsStorage;
    settingNameSet: Set<string>;
    orderValuesBySettingCategory: Map<SettingCategory, Set<number>>;
    readonly moduleSettings: Map<string, Setting<unknown>>;
    private constructor();
    getRegisteredSettings(): SettingRegistration[];
    static hasInstance(): boolean;
    static instance(opts?: {
        forceNew: boolean | null;
        syncedStorage: SettingsStorage | null;
        globalStorage: SettingsStorage | null;
        localStorage: SettingsStorage | null;
        config?: Root.Runtime.HostConfig;
    }): Settings;
    static removeInstance(): void;
    getHostConfig(): Root.Runtime.HostConfig | undefined;
    private registerModuleSetting;
    static normalizeSettingName(name: string): string;
    moduleSetting<T = any>(settingName: string): Setting<T>;
    settingForTest(settingName: string): Setting<unknown>;
    /**
     * Get setting via key, and create a new setting if the requested setting does not exist.
     */
    createSetting<T>(key: string, defaultValue: T, storageType?: SettingStorageType): Setting<T>;
    createLocalSetting<T>(key: string, defaultValue: T): Setting<T>;
    createRegExpSetting(key: string, defaultValue: string, regexFlags?: string, storageType?: SettingStorageType): RegExpSetting;
    clearAll(): void;
    private storageFromType;
    getRegistry(): Map<string, Setting<unknown>>;
}
export interface SettingsBackingStore {
    register(setting: string): void;
    get(setting: string): Promise<string>;
    set(setting: string, value: string): void;
    remove(setting: string): void;
    clear(): void;
}
export declare const NOOP_STORAGE: SettingsBackingStore;
export declare class SettingsStorage {
    private object;
    private readonly backingStore;
    private readonly storagePrefix;
    constructor(object: Record<string, string>, backingStore?: SettingsBackingStore, storagePrefix?: string);
    register(name: string): void;
    set(name: string, value: string): void;
    has(name: string): boolean;
    get(name: string): string;
    forceGet(originalName: string): Promise<string>;
    remove(name: string): void;
    removeAll(): void;
    keys(): string[];
    dumpSizes(): void;
}
export declare class Deprecation {
    readonly disabled: boolean;
    readonly warning: Platform.UIString.LocalizedString;
    readonly experiment?: Root.Runtime.Experiment;
    constructor({ deprecationNotice }: SettingRegistration);
}
export declare class Setting<V> {
    #private;
    readonly name: string;
    readonly defaultValue: V;
    private readonly eventSupport;
    readonly storage: SettingsStorage;
    constructor(name: string, defaultValue: V, eventSupport: ObjectWrapper<GenericEvents>, storage: SettingsStorage);
    setSerializer(serializer: Serializer<unknown, V>): void;
    addChangeListener(listener: (arg0: EventTargetEvent<V>) => void, thisObject?: Object): EventDescriptor;
    removeChangeListener(listener: (arg0: EventTargetEvent<V>) => void, thisObject?: Object): void;
    title(): string;
    setTitleFunction(titleFunction: (() => Platform.UIString.LocalizedString) | undefined): void;
    setTitle(title: string): void;
    setRequiresUserAction(requiresUserAction: boolean): void;
    disabled(): boolean;
    disabledReason(): string | undefined;
    setDisabled(disabled: boolean): void;
    get(): V;
    forceGet(): Promise<V>;
    set(value: V): void;
    setRegistration(registration: SettingRegistration): void;
    type(): SettingType | null;
    options(): SimpleSettingOption[];
    reloadRequired(): boolean | null;
    category(): SettingCategory | null;
    tags(): string | null;
    order(): number | null;
    get deprecation(): Deprecation | null;
    private printSettingsSavingError;
}
export declare class RegExpSetting extends Setting<any> {
    #private;
    constructor(name: string, defaultValue: string, eventSupport: ObjectWrapper<GenericEvents>, storage: SettingsStorage, regexFlags?: string);
    get(): string;
    getAsArray(): RegExpSettingItem[];
    set(value: string): void;
    setAsArray(value: RegExpSettingItem[]): void;
    asRegExp(): RegExp | null;
}
export declare class VersionController {
    #private;
    static readonly GLOBAL_VERSION_SETTING_NAME = "inspectorVersion";
    static readonly SYNCED_VERSION_SETTING_NAME = "syncedInspectorVersion";
    static readonly LOCAL_VERSION_SETTING_NAME = "localInspectorVersion";
    static readonly CURRENT_VERSION = 37;
    constructor();
    /**
     * Force re-sets all version number settings to the current version without
     * running any migrations.
     */
    resetToCurrent(): void;
    /**
     * Runs the appropriate migrations and updates the version settings accordingly.
     *
     * To determine what migrations to run we take the minimum of all version number settings.
     *
     * IMPORTANT: All migrations must be idempotent since they might be applied multiple times.
     */
    updateVersion(): void;
    private methodsToRunToUpdateVersion;
    private updateVersionFrom0To1;
    private updateVersionFrom1To2;
    private updateVersionFrom2To3;
    private updateVersionFrom3To4;
    private updateVersionFrom4To5;
    private updateVersionFrom5To6;
    private updateVersionFrom6To7;
    private updateVersionFrom7To8;
    private updateVersionFrom8To9;
    private updateVersionFrom9To10;
    private updateVersionFrom10To11;
    private updateVersionFrom11To12;
    private updateVersionFrom12To13;
    private updateVersionFrom13To14;
    private updateVersionFrom14To15;
    private updateVersionFrom15To16;
    private updateVersionFrom16To17;
    private updateVersionFrom17To18;
    private updateVersionFrom18To19;
    private updateVersionFrom19To20;
    private updateVersionFrom20To21;
    private updateVersionFrom21To22;
    private updateVersionFrom22To23;
    private updateVersionFrom23To24;
    private updateVersionFrom24To25;
    private updateVersionFrom25To26;
    private updateVersionFrom26To27;
    private updateVersionFrom27To28;
    private updateVersionFrom28To29;
    private updateVersionFrom29To30;
    private updateVersionFrom30To31;
    updateVersionFrom31To32(): void;
    updateVersionFrom32To33(): void;
    updateVersionFrom33To34(): void;
    updateVersionFrom34To35(): void;
    updateVersionFrom35To36(): void;
    updateVersionFrom36To37(): void;
    private migrateSettingsFromLocalStorage;
    private clearBreakpointsWhenTooMany;
}
export declare const enum SettingStorageType {
    /**
     * Synced storage persists settings with the active Chrome profile but also
     * syncs the settings across devices via Chrome Sync.
     */
    Synced = "Synced",
    /** Global storage persists settings with the active Chrome profile */
    Global = "Global",
    /** Uses Window.localStorage */
    Local = "Local",
    /** Session storage dies when DevTools window closes */
    Session = "Session"
}
export declare function moduleSetting(settingName: string): Setting<unknown>;
export declare function settingForTest(settingName: string): Setting<unknown>;
export { getLocalizedSettingsCategory, maybeRemoveSettingExtension, registerSettingExtension, RegExpSettingItem, SettingCategory, SettingExtensionOption, SettingRegistration, SettingType, registerSettingsForTest, resetSettings, };
export interface Serializer<I, O> {
    stringify: (value: I) => string;
    parse: (value: string) => O;
}
export interface SimpleSettingOption {
    value: string | boolean;
    title: string;
    text?: string;
    raw?: boolean;
}
