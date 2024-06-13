import * as UI from '../../ui/legacy/legacy.js';
import type * as ApplicationComponents from './components/components.js';
export declare class ReportingApiView extends UI.SplitWidget.SplitWidget {
    private readonly endpointsGrid;
    private endpoints;
    constructor(endpointsGrid: ApplicationComponents.EndpointsGrid.EndpointsGrid);
    private onEndpointsChangedForOrigin;
}
