import * as UI from '../../ui/legacy/legacy.js';
export declare class FreestylerPanel extends UI.Panel.Panel {
    #private;
    private view;
    static panelName: string;
    private constructor();
    static instance(opts?: {
        forceNew: boolean | null;
    } | undefined): FreestylerPanel;
    wasShown(): void;
    doUpdate(): void;
    handleAction(actionId: string): void;
}
export declare class ActionDelegate implements UI.ActionRegistration.ActionDelegate {
    handleAction(_context: UI.Context.Context, actionId: string): boolean;
}
