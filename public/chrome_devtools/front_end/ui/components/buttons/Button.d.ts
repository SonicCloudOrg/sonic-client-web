declare global {
    interface HTMLElementTagNameMap {
        'devtools-button': Button;
    }
}
export declare const enum Variant {
    PRIMARY = "primary",
    TONAL = "tonal",
    OUTLINED = "outlined",
    TEXT = "text",
    TOOLBAR = "toolbar",
    PRIMARY_TOOLBAR = "primary_toolbar",
    ICON = "icon",
    ICON_TOGGLE = "icon_toggle"
}
export declare const enum Size {
    MICRO = "MICRO",
    SMALL = "SMALL",
    REGULAR = "REGULAR"
}
export declare const enum ToggleType {
    PRIMARY = "primary-toggle",
    RED = "red-toggle"
}
type ButtonType = 'button' | 'submit' | 'reset';
interface CommonButtonData {
    variant: Variant;
    iconUrl?: string;
    iconName?: string;
    toggledIconName?: string;
    toggleType?: ToggleType;
    size?: Size;
    disabled?: boolean;
    toggled?: boolean;
    active?: boolean;
    spinner?: boolean;
    type?: ButtonType;
    value?: string;
    title?: string;
    jslogContext?: string;
}
export type ButtonData = CommonButtonData & ({
    variant: Variant.PRIMARY_TOOLBAR | Variant.TOOLBAR | Variant.ICON;
    iconUrl: string;
} | {
    variant: Variant.PRIMARY_TOOLBAR | Variant.TOOLBAR | Variant.ICON;
    iconName: string;
} | {
    variant: Variant.PRIMARY | Variant.OUTLINED | Variant.TONAL | Variant.TEXT;
} | {
    variant: Variant.ICON_TOGGLE;
    iconName: string;
    toggledIconName: string;
    toggleType: ToggleType;
    toggled: boolean;
});
export declare class Button extends HTMLElement {
    #private;
    static formAssociated: boolean;
    static readonly litTagName: import("../../lit-html/static.js").Static;
    constructor();
    /**
     * Perfer using the .data= setter instead of setting the individual properties
     * for increased type-safety.
     */
    set data(data: ButtonData);
    set iconUrl(iconUrl: string | undefined);
    set iconName(iconName: string | undefined);
    set toggledIconName(toggledIconName: string);
    set toggleType(toggleType: ToggleType);
    set variant(variant: Variant);
    set size(size: Size);
    set type(type: ButtonType);
    set title(title: string);
    set disabled(disabled: boolean);
    set toggled(toggled: boolean);
    get toggled(): boolean;
    set active(active: boolean);
    get active(): boolean;
    set spinner(spinner: boolean);
    get jslogContext(): string | undefined;
    set jslogContext(jslogContext: string | undefined);
    focus(): void;
    connectedCallback(): void;
    get value(): string;
    set value(value: string);
    get form(): HTMLFormElement | null;
    get name(): string | null;
    get type(): ButtonType;
    get validity(): ValidityState;
    get validationMessage(): string;
    get willValidate(): boolean;
    checkValidity(): boolean;
    reportValidity(): boolean;
}
export {};
