import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import type * as TextUtils from '../text_utils/text_utils.js';
import * as Workspace from '../workspace/workspace.js';
export declare class ContextMenuProvider implements UI.ContextMenu
    .Provider<Workspace.UISourceCode.UISourceCode | SDK.Resource.Resource | SDK.NetworkRequest.NetworkRequest> {
    appendApplicableItems(_event: Event, contextMenu: UI.ContextMenu.ContextMenu, contentProvider: TextUtils.ContentProvider.ContentProvider): void;
    private handleOverrideContent;
    private redirectOverrideToDeployedUiSourceCode;
    private getDeployedUiSourceCode;
}
