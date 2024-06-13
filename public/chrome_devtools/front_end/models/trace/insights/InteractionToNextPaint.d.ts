import { type SyntheticInteractionPair } from '../types/TraceEvents.js';
import { type InsightResult, type NavigationInsightContext, type RequiredData } from './types.js';
export declare function deps(): ['UserInteractions'];
type Result = InsightResult<{
    longestInteractionEvent?: SyntheticInteractionPair;
    highPercentileInteractionEvent?: SyntheticInteractionPair;
}>;
export declare function generateInsight(traceParsedData: RequiredData<typeof deps>, context: NavigationInsightContext): Result;
export {};
