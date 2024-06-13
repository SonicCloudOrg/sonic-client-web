import { type SelectorType } from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
import { type AccessibilityBindings } from './selectors/ARIASelector.js';
import { type Selector } from './selectors/Selector.js';
declare global {
    interface Window {
        stopShortcut(payload: string): void;
        addStep(step: string): void;
    }
}
interface Shortcut {
    meta: boolean;
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    keyCode: number;
}
export interface RecordingClientOptions {
    debug: boolean;
    allowUntrustedEvents: boolean;
    selectorAttribute?: string;
    selectorTypesToRecord: SelectorType[];
    stopShortcuts?: Shortcut[];
}
declare class RecordingClient {
    #private;
    static readonly defaultSetupOptions: Readonly<RecordingClientOptions>;
    constructor(bindings: AccessibilityBindings, options?: Readonly<RecordingClientOptions>);
    start: () => void;
    stop: () => void;
    getSelectors: (node: Node) => Selector[];
    getCSSSelector: (node: Node) => Selector | undefined;
    getTextSelector: (node: Node) => Selector | undefined;
    queryCSSSelectorAllForTesting: (selector: Selector) => Element[];
}
export { RecordingClient };
