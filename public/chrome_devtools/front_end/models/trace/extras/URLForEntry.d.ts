import type * as Platform from '../../../core/platform/platform.js';
import type * as Handlers from '../handlers/handlers.js';
import * as Types from '../types/types.js';
export declare function get(traceParsedData: Handlers.Types.TraceParseData, entry: Types.TraceEvents.TraceEventData): Platform.DevToolsPath.UrlString | null;
