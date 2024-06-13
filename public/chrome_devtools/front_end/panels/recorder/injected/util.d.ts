import { type Schema } from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
export declare function assert<Condition>(condition: Condition): asserts condition;
export declare const haultImmediateEvent: (event: Event) => void;
export declare const getMouseEventOffsets: (event: MouseEvent, target: Element) => {
    offsetX: number;
    offsetY: number;
};
/**
 * @returns the element that emitted the event.
 */
export declare const getClickableTargetFromEvent: (event: Event) => Element;
export declare const createClickAttributes: (event: MouseEvent, target: Element) => Schema.ClickAttributes | undefined;
