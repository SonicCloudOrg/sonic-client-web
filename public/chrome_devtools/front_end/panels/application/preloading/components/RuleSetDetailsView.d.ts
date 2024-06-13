import type * as Protocol from '../../../../generated/protocol.js';
import * as LegacyWrapper from '../../../../ui/components/legacy_wrapper/legacy_wrapper.js';
import type * as UI from '../../../../ui/legacy/legacy.js';
type RuleSet = Protocol.Preload.RuleSet;
export type RuleSetDetailsViewData = RuleSet | null;
export declare class RuleSetDetailsView extends LegacyWrapper.LegacyWrapper.WrappableComponent<UI.Widget.VBox> {
    #private;
    connectedCallback(): void;
    set data(data: RuleSetDetailsViewData);
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-resources-rulesets-details-view': RuleSetDetailsView;
    }
}
export {};
