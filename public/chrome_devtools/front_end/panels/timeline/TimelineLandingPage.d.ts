import * as UI from '../../ui/legacy/legacy.js';
interface Options {
    isNode?: boolean;
}
export declare class TimelineLandingPage extends UI.Widget.VBox {
    #private;
    private readonly toggleRecordAction;
    constructor(toggleRecordAction: UI.ActionRegistration.Action, options?: Options);
    onResize(): void;
    private renderLandingPage;
    private renderLegacyLandingPage;
}
export {};
