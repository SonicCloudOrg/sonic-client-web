import type * as Platform from '../../core/platform/platform.js';
import * as UI from '../../ui/legacy/legacy.js';
export declare class AddDebugInfoURLDialog extends UI.Widget.HBox {
    private readonly input;
    private readonly dialog;
    private readonly callback;
    private constructor();
    static createAddSourceMapURLDialog(callback: (arg0: Platform.DevToolsPath.UrlString) => void): AddDebugInfoURLDialog;
    static createAddDWARFSymbolsURLDialog(callback: (arg0: Platform.DevToolsPath.UrlString) => void): AddDebugInfoURLDialog;
    show(): void;
    private done;
    private apply;
    private onKeyDown;
    wasShown(): void;
}
