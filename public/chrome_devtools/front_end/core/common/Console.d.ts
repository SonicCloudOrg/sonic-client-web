import { ObjectWrapper } from './Object.js';
export declare class Console extends ObjectWrapper<EventTypes> {
    #private;
    /**
     * Instantiable via the instance() factory below.
     */
    constructor();
    static instance(opts?: {
        forceNew: boolean;
    }): Console;
    static removeInstance(): void;
    addMessage(text: string, level: MessageLevel, show?: boolean, source?: FrontendMessageSource): void;
    log(text: string): void;
    warn(text: string, source?: FrontendMessageSource): void;
    error(text: string): void;
    messages(): Message[];
    show(): void;
    showPromise(): Promise<void>;
}
export declare const enum Events {
    MessageAdded = "messageAdded"
}
export type EventTypes = {
    [Events.MessageAdded]: Message;
};
export declare const enum MessageLevel {
    Info = "info",
    Warning = "warning",
    Error = "error"
}
export declare enum FrontendMessageSource {
    CSS = "css",
    ConsoleAPI = "console-api",
    IssuePanel = "issue-panel",
    SelfXss = "self-xss"
}
export declare class Message {
    text: string;
    level: MessageLevel;
    timestamp: number;
    show: boolean;
    source?: FrontendMessageSource;
    constructor(text: string, level: MessageLevel, timestamp: number, show: boolean, source?: FrontendMessageSource);
}
