// Copyright 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { ObjectWrapper } from './Object.js';
import { reveal } from './Revealer.js';
let consoleInstance;
export class Console extends ObjectWrapper {
    #messagesInternal;
    /**
     * Instantiable via the instance() factory below.
     */
    constructor() {
        super();
        this.#messagesInternal = [];
    }
    static instance(opts) {
        if (!consoleInstance || opts?.forceNew) {
            consoleInstance = new Console();
        }
        return consoleInstance;
    }
    static removeInstance() {
        consoleInstance = undefined;
    }
    addMessage(text, level, show, source) {
        const message = new Message(text, level || "info" /* MessageLevel.Info */, Date.now(), show || false, source);
        this.#messagesInternal.push(message);
        this.dispatchEventToListeners("messageAdded" /* Events.MessageAdded */, message);
    }
    log(text) {
        this.addMessage(text, "info" /* MessageLevel.Info */);
    }
    warn(text, source) {
        this.addMessage(text, "warning" /* MessageLevel.Warning */, undefined, source);
    }
    error(text) {
        this.addMessage(text, "error" /* MessageLevel.Error */, true);
    }
    messages() {
        return this.#messagesInternal;
    }
    show() {
        void this.showPromise();
    }
    showPromise() {
        return reveal(this);
    }
}
export var FrontendMessageSource;
(function (FrontendMessageSource) {
    FrontendMessageSource["CSS"] = "css";
    FrontendMessageSource["ConsoleAPI"] = "console-api";
    FrontendMessageSource["IssuePanel"] = "issue-panel";
    FrontendMessageSource["SelfXss"] = "self-xss";
})(FrontendMessageSource || (FrontendMessageSource = {}));
export class Message {
    text;
    level;
    timestamp;
    show;
    source;
    constructor(text, level, timestamp, show, source) {
        this.text = text;
        this.level = level;
        this.timestamp = (typeof timestamp === 'number') ? timestamp : Date.now();
        this.show = show;
        if (source) {
            this.source = source;
        }
    }
}
//# sourceMappingURL=Console.js.map