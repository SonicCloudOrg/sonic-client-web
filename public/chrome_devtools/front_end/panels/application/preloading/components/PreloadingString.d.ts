import type * as Common from '../../../../core/common/common.js';
import type * as Platform from '../../../../core/platform/platform.js';
import * as SDK from '../../../../core/sdk/sdk.js';
import * as Protocol from '../../../../generated/protocol.js';
export declare const PrefetchReasonDescription: {
    [key: string]: {
        name: () => Platform.UIString.LocalizedString;
    };
};
export declare function prefetchFailureReason({ prefetchStatus }: SDK.PreloadingModel.PrefetchAttempt): string | null;
export declare function prerenderFailureReason(attempt: SDK.PreloadingModel.PrerenderAttempt): string | null;
export declare function ruleSetLocationShort(ruleSet: Protocol.Preload.RuleSet, pageURL: Platform.DevToolsPath.UrlString): string;
export declare function capitalizedAction(action: Protocol.Preload.SpeculationAction): Common.UIString.LocalizedString;
export declare function status(status: SDK.PreloadingModel.PreloadingStatus): string;
export declare function composedStatus(attempt: SDK.PreloadingModel.PreloadingAttempt): string;
