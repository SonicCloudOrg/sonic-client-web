import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Settings from '../components/settings/settings.js';
export declare const createSettingCheckbox: (name: string, setting: Common.Settings.Setting<boolean>, omitParagraphElement?: boolean, tooltip?: string) => Element;
export declare const bindCheckbox: (inputElement: Element, setting: Common.Settings.Setting<boolean>, metric?: UserMetricOptions) => void;
export declare const createCustomSetting: (name: string, element: Element) => Element;
export declare const createControlForSetting: (setting: Common.Settings.Setting<unknown>, subtitle?: string) => HTMLElement | null;
export interface SettingUI {
    settingElement(): Element | null;
}
/**
 * Track toggle action as a whole or
 * track on and off action separately.
 */
export interface UserMetricOptions {
    toggle?: Host.UserMetrics.Action;
    enable?: Host.UserMetrics.Action;
    disable?: Host.UserMetrics.Action;
}
