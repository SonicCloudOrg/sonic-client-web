import type * as SDK from '../../core/sdk/sdk.js';
import * as Formatter from '../formatter/formatter.js';
type ScopeTreeNode = Formatter.FormatterWorkerPool.ScopeTreeNode;
/**
 * Computes and caches the scope tree for `script`.
 *
 * We use {@link SDK.Script.Script} as a key to uniquely identify scripts.
 * {@link SDK.Script.Script} boils down to "target" + "script ID". This
 * duplicates work in case of identitical script running on multiple targets
 * (e.g. workers).
 */
export declare function scopeTreeForScript(script: SDK.Script.Script): Promise<ScopeTreeNode | null>;
export {};
