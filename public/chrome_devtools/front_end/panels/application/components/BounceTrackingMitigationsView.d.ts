import type * as Platform from '../../../core/platform/platform.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
export declare const i18nString: (id: string, values?: import("../../../core/i18n/i18nTypes.js").Values | undefined) => Platform.UIString.LocalizedString;
export interface BounceTrackingMitigationsViewData {
    trackingSites: string[];
}
export declare class BounceTrackingMitigationsView extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-bounce-tracking-mitigations-view': BounceTrackingMitigationsView;
    }
}
