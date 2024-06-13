import type * as UI from '../../legacy/legacy.js';
export declare abstract class WrappableComponent<T extends UI.Widget.Widget = UI.Widget.Widget> extends HTMLElement {
    wrapper: T | null;
    render(): Promise<void>;
    wasShown(): void;
    willHide(): void;
}
type Constructor<T extends UI.Widget.Widget> = new (...args: any[]) => T;
export type LegacyWrapper<T extends UI.Widget.Widget, Component extends WrappableComponent<T>> = {
    getComponent(): Component;
} & T;
export declare function legacyWrapper<T extends Constructor<UI.Widget.Widget>, Component extends WrappableComponent<InstanceType<T>>>(base: T, component: Component, jsLogContext?: string): LegacyWrapper<InstanceType<T>, Component>;
export {};
