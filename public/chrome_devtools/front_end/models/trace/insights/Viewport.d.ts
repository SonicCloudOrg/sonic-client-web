import { type InsightResult, type NavigationInsightContext, type RequiredData } from './types.js';
export declare function deps(): ['Meta', 'UserInteractions'];
export declare function generateInsight(traceParsedData: RequiredData<typeof deps>, context: NavigationInsightContext): InsightResult<{
    mobileOptimized: boolean | null;
}>;
