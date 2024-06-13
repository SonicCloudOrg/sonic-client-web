import * as Platform from '../../../core/platform/platform.js';
import type * as Protocol from '../../../generated/protocol.js';
import { EditableSpan } from './EditableSpan.js';
export declare const isValidHeaderName: (headerName: string) => boolean;
export declare const compareHeaders: (first: string | null | undefined, second: string | null | undefined) => boolean;
export declare class HeaderEditedEvent extends Event {
    static readonly eventName = "headeredited";
    headerName: Platform.StringUtilities.LowerCaseString;
    headerValue: string;
    constructor(headerName: Platform.StringUtilities.LowerCaseString, headerValue: string);
}
export declare class HeaderRemovedEvent extends Event {
    static readonly eventName = "headerremoved";
    headerName: Platform.StringUtilities.LowerCaseString;
    headerValue: string;
    constructor(headerName: Platform.StringUtilities.LowerCaseString, headerValue: string);
}
export declare class EnableHeaderEditingEvent extends Event {
    static readonly eventName = "enableheaderediting";
    constructor();
}
export interface HeaderSectionRowData {
    header: HeaderDescriptor;
}
export declare class HeaderSectionRow extends HTMLElement {
    #private;
    static readonly litTagName: import("../../../ui/lit-html/static.js").Static;
    connectedCallback(): void;
    set data(data: HeaderSectionRowData);
    focus(): void;
}
declare global {
    interface HTMLElementTagNameMap {
        'devtools-header-section-row': HeaderSectionRow;
        'devtools-editable-span': EditableSpan;
    }
    interface HTMLElementEventMap {
        [HeaderEditedEvent.eventName]: HeaderEditedEvent;
    }
}
interface BlockedDetailsDescriptor {
    explanation: () => string;
    examples: Array<{
        codeSnippet: string;
        comment?: () => string;
    }>;
    link: {
        url: string;
    } | null;
    reveal?: () => void;
}
export declare const enum EditingAllowedStatus {
    Disabled = 0,// Local overrides are currently disabled.
    Enabled = 1,// The header is free to be edited.
    Forbidden = 2
}
export interface HeaderDetailsDescriptor {
    name: Platform.StringUtilities.LowerCaseString;
    value: string | null;
    headerValueIncorrect?: boolean;
    blockedDetails?: BlockedDetailsDescriptor;
    headerNotSet?: boolean;
    setCookieBlockedReasons?: Protocol.Network.SetCookieBlockedReason[];
    highlight?: boolean;
    isResponseHeader?: boolean;
}
export interface HeaderEditorDescriptor {
    name: Platform.StringUtilities.LowerCaseString;
    value: string | null;
    originalName?: string | null;
    originalValue?: string | null;
    isOverride?: boolean;
    valueEditable: EditingAllowedStatus;
    nameEditable?: boolean;
    isDeleted?: boolean;
}
export type HeaderDescriptor = HeaderDetailsDescriptor & HeaderEditorDescriptor;
export {};
