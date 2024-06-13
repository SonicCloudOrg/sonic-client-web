import { type AccessibilityBindings } from './selectors/ARIASelector.js';
declare global {
    interface Window {
        captureSelectors(data: string): void;
    }
}
declare class SelectorPicker {
    #private;
    constructor(bindings: AccessibilityBindings, customAttribute?: string, debug?: boolean);
    start: () => void;
    stop: () => void;
}
export { SelectorPicker };
