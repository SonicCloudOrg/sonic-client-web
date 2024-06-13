import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class BlockedURLsPane extends UI.Widget.VBox implements UI.ListWidget.Delegate<SDK.NetworkManager.BlockedPattern> {
    private manager;
    private readonly toolbar;
    private readonly enabledCheckbox;
    private readonly list;
    private editor;
    private blockedCountForUrl;
    constructor();
    private createEmptyPlaceholder;
    addPattern(): void;
    removeAllPatterns(): void;
    renderItem(pattern: SDK.NetworkManager.BlockedPattern, editable: boolean): Element;
    private togglePattern;
    private toggleEnabled;
    removeItemRequested(pattern: SDK.NetworkManager.BlockedPattern, index: number): void;
    beginEdit(pattern: SDK.NetworkManager.BlockedPattern): UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern>;
    commitEdit(item: SDK.NetworkManager.BlockedPattern, editor: UI.ListWidget.Editor<SDK.NetworkManager.BlockedPattern>, isNew: boolean): void;
    private createEditor;
    update(): void;
    private blockedRequestsCount;
    private matches;
    private onNetworkLogReset;
    private onRequestFinished;
    wasShown(): void;
    willHide(): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(context: UI.Context.Context, actionId: string): boolean;
}
