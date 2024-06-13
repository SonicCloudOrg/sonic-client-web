import * as UI from '../../legacy/legacy.js';
import { DataGridController, type DataGridControllerData } from './DataGridController.js';
export declare class DataGridControllerIntegrator extends UI.Widget.VBox {
    #private;
    readonly dataGrid: DataGridController;
    constructor(data: DataGridControllerData);
    data(): Readonly<DataGridControllerData>;
    update(data: Readonly<DataGridControllerData>): void;
}
