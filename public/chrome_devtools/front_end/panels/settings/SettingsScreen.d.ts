import * as Common from '../../core/common/common.js';
import * as Root from '../../core/root/root.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class SettingsScreen extends UI.Widget.VBox implements UI.View.ViewLocationResolver {
    private readonly tabbedLocation;
    private keybindsTab?;
    private reportTabOnReveal;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    }): SettingsScreen;
    private static revealSettingsScreen;
    static showSettingsScreen(options?: ShowSettingsScreenOptions | undefined): Promise<void>;
    resolveLocation(_locationName: string): UI.View.ViewLocation | null;
    private selectTab;
    private tabInvoked;
    private reportSettingsPanelShown;
    private onEscapeKeyPressed;
    wasShown(): void;
}
declare abstract class SettingsTab extends UI.Widget.VBox {
    containerElement: HTMLElement;
    constructor(name: string, id?: string);
    protected appendSection(name?: string): HTMLElement;
    abstract highlightObject(_object: Object): void;
}
export declare class GenericSettingsTab extends SettingsTab {
    private readonly syncSection;
    private readonly settingToControl;
    constructor();
    static isSettingVisible(setting: Common.Settings.SettingRegistration): boolean;
    wasShown(): void;
    willHide(): void;
    private updateSyncSection;
    private createExtensionSection;
    private createSectionElement;
    private createStandardSectionElement;
    highlightObject(setting: Object): void;
}
export declare class ExperimentsSettingsTab extends SettingsTab {
    #private;
    private readonly experimentToControl;
    constructor();
    private renderExperiments;
    private createExperimentsWarningSubsection;
    private createExperimentCheckbox;
    highlightObject(experiment: Object): void;
    setFilter(filterText: string): void;
    wasShown(): void;
    willHide(): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
export declare class Revealer implements Common.Revealer.Revealer<Root.Runtime.Experiment | Common.Settings.Setting<unknown>> {
    reveal(object: Root.Runtime.Experiment | Common.Settings.Setting<unknown>): Promise<void>;
}
export interface ShowSettingsScreenOptions {
    name?: string;
    focusTabHeader?: boolean;
}
export {};
