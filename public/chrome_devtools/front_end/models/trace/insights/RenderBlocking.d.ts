import type * as Types from '../types/types.js';
import { type InsightResult, type NavigationInsightContext, type RequiredData } from './types.js';
export declare function deps(): ['NetworkRequests', 'PageLoadMetrics'];
export declare function generateInsight(traceParsedData: RequiredData<typeof deps>, context: NavigationInsightContext): InsightResult<{
    renderBlockingRequests: Types.TraceEvents.SyntheticNetworkRequest[];
}>;
