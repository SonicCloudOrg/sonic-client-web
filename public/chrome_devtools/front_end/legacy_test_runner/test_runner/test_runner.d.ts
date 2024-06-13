export function _executeTestScript(): Promise<void>;
/**
 * @implements {SDK.TargetManager.Observer}
 */
export class _TestObserver implements SDK.TargetManager.Observer {
    /**
     * @param {!SDK.Target.Target} target
     * @override
     */
    override targetAdded(target: SDK.Target.Target): void;
    /**
     * @param {!SDK.Target.Target} target
     * @override
     */
    override targetRemoved(target: SDK.Target.Target): void;
}
export { globalTestRunner as TestRunner };
import * as SDK from '../../core/sdk/sdk.js';
declare const globalTestRunner: any;
