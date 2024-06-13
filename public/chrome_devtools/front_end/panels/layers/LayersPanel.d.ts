import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as LayerViewer from '../layer_viewer/layer_viewer.js';
export declare class LayersPanel extends UI.Panel.PanelWithSidebar implements SDK.TargetManager.Observer {
    private model;
    private readonly layerViewHost;
    private readonly layerTreeOutline;
    private readonly rightSplitWidget;
    readonly layers3DView: LayerViewer.Layers3DView.Layers3DView;
    private tabbedPane;
    private readonly layerDetailsView;
    private readonly paintProfilerView;
    private readonly updateThrottler;
    private layerBeingProfiled?;
    constructor();
    static instance(opts?: {
        forceNew: boolean;
    }): LayersPanel;
    focus(): void;
    wasShown(): void;
    willHide(): void;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
    private onLayerTreeUpdated;
    private update;
    private onLayerPainted;
    private onPaintProfileRequested;
    private onTabClosed;
    private showImage;
    private onScaleChanged;
}
export declare const DetailsViewTabs: {
    Details: string;
    Profiler: string;
};
