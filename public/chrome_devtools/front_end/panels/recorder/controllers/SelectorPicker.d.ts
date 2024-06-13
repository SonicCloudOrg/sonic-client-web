import * as SDK from '../../../core/sdk/sdk.js';
import type * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as Models from '../models/models.js';
export declare class SelectorPickedEvent extends Event {
    static readonly eventName = "selectorpicked";
    data: Models.Schema.StepWithSelectors & Pick<Models.Schema.ClickAttributes, 'offsetX' | 'offsetY'>;
    constructor(data: Models.Schema.StepWithSelectors & Pick<Models.Schema.ClickAttributes, 'offsetX' | 'offsetY'>);
}
export declare class RequestSelectorAttributeEvent extends Event {
    static readonly eventName = "requestselectorattribute";
    send: (attribute?: string) => void;
    constructor(send: (attribute?: string) => void);
}
export declare class SelectorPicker implements SDK.TargetManager.Observer {
    #private;
    active: boolean;
    constructor(element: LitHtml.LitElement);
    start: () => Promise<void>;
    stop: () => Promise<void>;
    toggle: () => Promise<void>;
    targetAdded(target: SDK.Target.Target): void;
    targetRemoved(target: SDK.Target.Target): void;
}
