import * as SDK from '../../core/sdk/sdk.js';
import * as Protocol from '../../generated/protocol.js';
import type * as Buttons from '../../ui/components/buttons/buttons.js';
import * as DataGrid from '../../ui/legacy/components/data_grid/data_grid.js';
import * as UI from '../../ui/legacy/legacy.js';
declare class DataGridNode extends DataGrid.DataGrid.DataGridNode<DataGridNode> {
    private readonly credential;
    constructor(credential: Protocol.WebAuthn.Credential);
    nodeSelfHeight(): number;
    createCell(columnId: string): HTMLElement;
}
export declare class WebauthnPaneImpl extends UI.Widget.VBox implements SDK.TargetManager.SDKModelObserver<SDK.WebAuthnModel.WebAuthnModel> {
    #private;
    readonly dataGrids: Map<Protocol.WebAuthn.AuthenticatorId, DataGrid.DataGrid.DataGridImpl<DataGridNode>>;
    residentKeyCheckbox: HTMLInputElement | undefined;
    largeBlobCheckbox: HTMLInputElement | undefined;
    addAuthenticatorButton: Buttons.Button.Button | undefined;
    constructor();
    modelAdded(model: SDK.WebAuthnModel.WebAuthnModel): void;
    modelRemoved(model: SDK.WebAuthnModel.WebAuthnModel): void;
    ownerViewDisposed(): Promise<void>;
    wasShown(): void;
}
export {};
