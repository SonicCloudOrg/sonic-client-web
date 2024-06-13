import { type SelectorType } from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
import { type Logger } from './Logger.js';
import { type AccessibilityBindings } from './selectors/ARIASelector.js';
import { type Selector } from './selectors/Selector.js';
export declare class SelectorComputer {
    #private;
    constructor(bindings: AccessibilityBindings, logger: Logger, customAttribute?: string, selectorTypesToRecord?: SelectorType[]);
    getSelectors(node: Node): Selector[];
    getCSSSelector(node: Node): Selector | undefined;
    getTextSelector(node: Node): Selector | undefined;
    getXPathSelector(node: Node): Selector | undefined;
    getPierceSelector(node: Node): Selector | undefined;
    getARIASelector(node: Node): Selector | undefined;
}
