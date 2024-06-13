/**
 * @fileoverview web-vitals.js doesn't provide a log of all interactions.
 * This was largely copied from the web vitals extension:
 * https://github.com/GoogleChrome/web-vitals-extension/blob/main/src/browser_action/on-each-interaction.js
 */
import * as WebVitals from '../../../third_party/web-vitals/web-vitals.js';
export interface InteractionWithAttribution {
    attribution: {
        interactionTargetElement: Node | null;
        interactionTime: number;
        interactionType: WebVitals.INPAttribution['interactionType'];
        interactionId: number;
    };
    entries: PerformanceEntry[];
    rating: WebVitals.Metric['rating'];
    value: number;
}
export declare function onEachInteraction(callback: (interaction: InteractionWithAttribution) => void): void;
