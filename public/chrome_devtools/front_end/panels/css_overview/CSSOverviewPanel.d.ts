import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { type OverviewController } from './CSSOverviewController.js';
export declare class CSSOverviewPanel extends UI.Panel.Panel implements SDK.TargetManager.Observer {
    #private;
    constructor(controller: OverviewController);
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(): void;
    wasShown(): void;
}
