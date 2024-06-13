import * as Common from '../../../core/common/common.js';
export declare class SettingDeprecationWarning extends HTMLElement {
    #private;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: Common.Settings.Deprecation);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-setting-deprecation-warning': SettingDeprecationWarning;
    }
}
