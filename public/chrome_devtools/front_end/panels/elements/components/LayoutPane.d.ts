import * as SDK from '../../../core/sdk/sdk.js';
import * as LegacyWrapper from '../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import { type LayoutElement, type Setting } from './LayoutPaneUtils.js';
export { LayoutElement };
export interface LayoutPaneData {
    settings: Setting[];
    gridElements: LayoutElement[];
    flexContainerElements?: LayoutElement[];
}
export declare class LayoutPane extends LegacyWrapper.LegacyWrapper.WrappableComponent {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    constructor();
    static instance(): LayoutPane;
    modelAdded(domModel: SDK.DOMModel.DOMModel): void;
    modelRemoved(domModel: SDK.DOMModel.DOMModel): void;
    onSettingChanged(setting: string, value: string | boolean): void;
    wasShown(): void;
    willHide(): void;
    render(): Promise<void>;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-layout-pane': LayoutPane;
    }
}
