import { type SetViewportStep, type EmulateNetworkConditionsStep } from './Schema.js';
export interface RecordingSettings {
    viewportSettings?: SetViewportStep;
    networkConditionsSettings?: EmulateNetworkConditionsStep & {
        title?: string;
        i18nTitleKey?: string;
    };
    timeout?: number;
}
