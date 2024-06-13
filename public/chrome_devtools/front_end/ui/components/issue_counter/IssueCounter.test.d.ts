import * as IconButton from '../icon_button/icon_button.js';
export declare const extractIconGroups: (shadowRoot: ShadowRoot) => {
    iconData: IconButton.Icon.IconData;
    label: string | null;
}[];
export declare const extractButton: (shadowRoot: ShadowRoot) => HTMLButtonElement;
