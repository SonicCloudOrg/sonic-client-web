// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Platform from '../platform/platform.js';
import { Type } from './Target.js';
import { TargetManager } from './TargetManager.js';
import { PageResourceLoader } from './PageResourceLoader.js';
import { parseSourceMap, SourceMap } from './SourceMap.js';
export class SourceMapManager extends Common.ObjectWrapper.ObjectWrapper {
    #target;
    #isEnabled;
    #clientData;
    #sourceMaps;
    #attachingClient;
    constructor(target) {
        super();
        this.#target = target;
        this.#isEnabled = true;
        this.#attachingClient = null;
        this.#clientData = new Map();
        this.#sourceMaps = new Map();
        TargetManager.instance().addEventListener("InspectedURLChanged" /* TargetManagerEvents.InspectedURLChanged */, this.inspectedURLChanged, this);
    }
    setEnabled(isEnabled) {
        if (isEnabled === this.#isEnabled) {
            return;
        }
        // We need this copy, because `this.#clientData` is getting modified
        // in the loop body and trying to iterate over it at the same time
        // leads to an infinite loop.
        const clientData = [...this.#clientData.entries()];
        for (const [client] of clientData) {
            this.detachSourceMap(client);
        }
        this.#isEnabled = isEnabled;
        for (const [client, { relativeSourceURL, relativeSourceMapURL }] of clientData) {
            this.attachSourceMap(client, relativeSourceURL, relativeSourceMapURL);
        }
    }
    static getBaseUrl(target) {
        while (target && target.type() !== Type.Frame) {
            target = target.parentTarget();
        }
        return target?.inspectedURL() ?? Platform.DevToolsPath.EmptyUrlString;
    }
    static resolveRelativeSourceURL(target, url) {
        url = Common.ParsedURL.ParsedURL.completeURL(SourceMapManager.getBaseUrl(target), url) ?? url;
        return url;
    }
    inspectedURLChanged(event) {
        if (event.data !== this.#target) {
            return;
        }
        // We need this copy, because `this.#clientData` is getting modified
        // in the loop body and trying to iterate over it at the same time
        // leads to an infinite loop.
        const clientData = [...this.#clientData.entries()];
        for (const [client, { relativeSourceURL, relativeSourceMapURL }] of clientData) {
            this.detachSourceMap(client);
            this.attachSourceMap(client, relativeSourceURL, relativeSourceMapURL);
        }
    }
    sourceMapForClient(client) {
        return this.#clientData.get(client)?.sourceMap;
    }
    // This method actively awaits the source map, if still loading.
    sourceMapForClientPromise(client) {
        const clientData = this.#clientData.get(client);
        if (!clientData) {
            return Promise.resolve(undefined);
        }
        return clientData.sourceMapPromise;
    }
    clientForSourceMap(sourceMap) {
        return this.#sourceMaps.get(sourceMap);
    }
    // TODO(bmeurer): We are lying about the type of |relativeSourceURL| here.
    attachSourceMap(client, relativeSourceURL, relativeSourceMapURL) {
        if (this.#clientData.has(client)) {
            throw new Error('SourceMap is already attached or being attached to client');
        }
        if (!relativeSourceMapURL) {
            return;
        }
        let clientData = {
            relativeSourceURL,
            relativeSourceMapURL,
            sourceMap: undefined,
            sourceMapPromise: Promise.resolve(undefined),
        };
        if (this.#isEnabled) {
            // The `// #sourceURL=foo` can be a random string, but is generally an absolute path.
            // Complete it to inspected page url for relative links.
            const sourceURL = SourceMapManager.resolveRelativeSourceURL(this.#target, relativeSourceURL);
            const sourceMapURL = Common.ParsedURL.ParsedURL.completeURL(sourceURL, relativeSourceMapURL);
            if (sourceMapURL) {
                if (this.#attachingClient) {
                    // This should not happen
                    console.error('Attaching source map may cancel previously attaching source map');
                }
                this.#attachingClient = client;
                this.dispatchEventToListeners(Events.SourceMapWillAttach, { client });
                if (this.#attachingClient === client) {
                    this.#attachingClient = null;
                    const initiator = client.createPageResourceLoadInitiator();
                    clientData.sourceMapPromise =
                        loadSourceMap(sourceMapURL, initiator)
                            .then(payload => {
                            const sourceMap = new SourceMap(sourceURL, sourceMapURL, payload);
                            if (this.#clientData.get(client) === clientData) {
                                clientData.sourceMap = sourceMap;
                                this.#sourceMaps.set(sourceMap, client);
                                this.dispatchEventToListeners(Events.SourceMapAttached, { client, sourceMap });
                            }
                            return sourceMap;
                        }, () => {
                            if (this.#clientData.get(client) === clientData) {
                                this.dispatchEventToListeners(Events.SourceMapFailedToAttach, { client });
                            }
                            return undefined;
                        });
                }
                else {
                    // Assume cancelAttachSourceMap was called.
                    if (this.#attachingClient) {
                        // This should not happen
                        console.error('Cancelling source map attach because another source map is attaching');
                    }
                    clientData = null;
                    this.dispatchEventToListeners(Events.SourceMapFailedToAttach, { client });
                }
            }
        }
        if (clientData) {
            this.#clientData.set(client, clientData);
        }
    }
    cancelAttachSourceMap(client) {
        if (client === this.#attachingClient) {
            this.#attachingClient = null;
        }
        else {
            // This should not happen.
            if (this.#attachingClient) {
                console.error('cancel attach source map requested but a different source map was being attached');
            }
            else {
                console.error('cancel attach source map requested but no source map was being attached');
            }
        }
    }
    detachSourceMap(client) {
        const clientData = this.#clientData.get(client);
        if (!clientData) {
            return;
        }
        this.#clientData.delete(client);
        if (!this.#isEnabled) {
            return;
        }
        const { sourceMap } = clientData;
        if (sourceMap) {
            this.#sourceMaps.delete(sourceMap);
            this.dispatchEventToListeners(Events.SourceMapDetached, { client, sourceMap });
        }
        else {
            this.dispatchEventToListeners(Events.SourceMapFailedToAttach, { client });
        }
    }
    dispose() {
        TargetManager.instance().removeEventListener("InspectedURLChanged" /* TargetManagerEvents.InspectedURLChanged */, this.inspectedURLChanged, this);
    }
}
async function loadSourceMap(url, initiator) {
    try {
        const { content } = await PageResourceLoader.instance().loadResource(url, initiator);
        return parseSourceMap(content);
    }
    catch (cause) {
        throw new Error(`Could not load content for ${url}: ${cause.message}`, { cause });
    }
}
export var Events;
(function (Events) {
    Events["SourceMapWillAttach"] = "SourceMapWillAttach";
    Events["SourceMapFailedToAttach"] = "SourceMapFailedToAttach";
    Events["SourceMapAttached"] = "SourceMapAttached";
    Events["SourceMapDetached"] = "SourceMapDetached";
})(Events || (Events = {}));
//# sourceMappingURL=SourceMapManager.js.map