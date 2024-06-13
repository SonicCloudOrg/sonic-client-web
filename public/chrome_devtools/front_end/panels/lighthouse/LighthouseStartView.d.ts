import * as UI from '../../ui/legacy/legacy.js';
import { type LighthouseController } from './LighthouseController.js';
import { type LighthousePanel } from './LighthousePanel.js';
export declare class StartView extends UI.Widget.Widget {
    private controller;
    private panel;
    private readonly settingsToolbarInternal;
    private startButton;
    private helpText?;
    private warningText?;
    private checkboxes;
    changeFormMode?: (mode: string) => void;
    constructor(controller: LighthouseController, panel: LighthousePanel);
    private populateRuntimeSettingAsRadio;
    private populateRuntimeSettingAsToolbarCheckbox;
    private populateRuntimeSettingAsToolbarDropdown;
    private populateFormControls;
    private render;
    private populateStartButton;
    refresh(): void;
    onResize(): void;
    focusStartButton(): void;
    setStartButtonEnabled(isEnabled: boolean): void;
    setUnauditableExplanation(text: string | null): void;
    setWarningText(text: string | null): void;
    wasShown(): void;
    settingsToolbar(): UI.Toolbar.Toolbar;
}
