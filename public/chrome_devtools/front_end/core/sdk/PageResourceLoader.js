// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../common/common.js';
import * as Host from '../host/host.js';
import * as i18n from '../i18n/i18n.js';
import { FrameManager } from './FrameManager.js';
import { IOModel } from './IOModel.js';
import { MultitargetNetworkManager, NetworkManager } from './NetworkManager.js';
import { Events as ResourceTreeModelEvents, ResourceTreeModel, } from './ResourceTreeModel.js';
import { TargetManager } from './TargetManager.js';
const UIStrings = {
    /**
     *@description Error message for canceled source map loads
     */
    loadCanceledDueToReloadOf: 'Load canceled due to reload of inspected page',
};
const str_ = i18n.i18n.registerUIStrings('core/sdk/PageResourceLoader.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function isExtensionInitiator(initiator) {
    return 'extensionId' in initiator;
}
// Used for revealing a resource.
export class ResourceKey {
    key;
    constructor(key) {
        this.key = key;
    }
}
let pageResourceLoader = null;
/**
 * The page resource loader is a bottleneck for all DevTools-initiated resource loads. For each such load, it keeps a
 * `PageResource` object around that holds meta information. This can be as the basis for reporting to the user which
 * resources were loaded, and whether there was a load error.
 */
export class PageResourceLoader extends Common.ObjectWrapper.ObjectWrapper {
    #currentlyLoading;
    #currentlyLoadingPerTarget;
    #maxConcurrentLoads;
    #pageResources;
    #queuedLoads;
    #loadOverride;
    constructor(loadOverride, maxConcurrentLoads) {
        super();
        this.#currentlyLoading = 0;
        this.#currentlyLoadingPerTarget = new Map();
        this.#maxConcurrentLoads = maxConcurrentLoads;
        this.#pageResources = new Map();
        this.#queuedLoads = [];
        TargetManager.instance().addModelListener(ResourceTreeModel, ResourceTreeModelEvents.PrimaryPageChanged, this.onPrimaryPageChanged, this);
        this.#loadOverride = loadOverride;
    }
    static instance({ forceNew, loadOverride, maxConcurrentLoads } = {
        forceNew: false,
        loadOverride: null,
        maxConcurrentLoads: 500,
    }) {
        if (!pageResourceLoader || forceNew) {
            pageResourceLoader = new PageResourceLoader(loadOverride, maxConcurrentLoads);
        }
        return pageResourceLoader;
    }
    static removeInstance() {
        pageResourceLoader = null;
    }
    onPrimaryPageChanged(event) {
        const { frame: mainFrame, type } = event.data;
        if (!mainFrame.isOutermostFrame()) {
            return;
        }
        for (const { reject } of this.#queuedLoads) {
            reject(new Error(i18nString(UIStrings.loadCanceledDueToReloadOf)));
        }
        this.#queuedLoads = [];
        const mainFrameTarget = mainFrame.resourceTreeModel().target();
        const keptResources = new Map();
        // If the navigation is a prerender-activation, the pageResources for the destination page have
        // already been preloaded. In such cases, we therefore don't just discard all pageResources, but
        // instead make sure to keep the pageResources for the prerendered target.
        for (const [key, pageResource] of this.#pageResources.entries()) {
            if ((type === "Activation" /* PrimaryPageChangeType.Activation */) && mainFrameTarget === pageResource.initiator.target) {
                keptResources.set(key, pageResource);
            }
        }
        this.#pageResources = keptResources;
        this.dispatchEventToListeners("Update" /* Events.Update */);
    }
    getResourcesLoaded() {
        return this.#pageResources;
    }
    getScopedResourcesLoaded() {
        return new Map([...this.#pageResources].filter(([_, pageResource]) => TargetManager.instance().isInScope(pageResource.initiator.target) ||
            isExtensionInitiator(pageResource.initiator)));
    }
    /**
     * Loading is the number of currently loading and queued items. Resources is the total number of resources,
     * including loading and queued resources, but not including resources that are still loading but scheduled
     * for cancelation.;
     */
    getNumberOfResources() {
        return { loading: this.#currentlyLoading, queued: this.#queuedLoads.length, resources: this.#pageResources.size };
    }
    getScopedNumberOfResources() {
        const targetManager = TargetManager.instance();
        let loadingCount = 0;
        for (const [targetId, count] of this.#currentlyLoadingPerTarget) {
            const target = targetManager.targetById(targetId);
            if (targetManager.isInScope(target)) {
                loadingCount += count;
            }
        }
        return { loading: loadingCount, resources: this.getScopedResourcesLoaded().size };
    }
    async acquireLoadSlot(target) {
        this.#currentlyLoading++;
        if (target) {
            const currentCount = this.#currentlyLoadingPerTarget.get(target.id()) || 0;
            this.#currentlyLoadingPerTarget.set(target.id(), currentCount + 1);
        }
        if (this.#currentlyLoading > this.#maxConcurrentLoads) {
            const entry = { resolve: () => { }, reject: () => { } };
            const waitForCapacity = new Promise((resolve, reject) => {
                entry.resolve = resolve;
                entry.reject = reject;
            });
            this.#queuedLoads.push(entry);
            await waitForCapacity;
        }
    }
    releaseLoadSlot(target) {
        this.#currentlyLoading--;
        if (target) {
            const currentCount = this.#currentlyLoadingPerTarget.get(target.id());
            if (currentCount) {
                this.#currentlyLoadingPerTarget.set(target.id(), currentCount - 1);
            }
        }
        const entry = this.#queuedLoads.shift();
        if (entry) {
            entry.resolve();
        }
    }
    static makeExtensionKey(url, initiator) {
        if (isExtensionInitiator(initiator) && initiator.extensionId) {
            return `${url}-${initiator.extensionId}`;
        }
        throw new Error('Invalid initiator');
    }
    static makeKey(url, initiator) {
        if (initiator.frameId) {
            return `${url}-${initiator.frameId}`;
        }
        if (initiator.target) {
            return `${url}-${initiator.target.id()}`;
        }
        throw new Error('Invalid initiator');
    }
    resourceLoadedThroughExtension(pageResource) {
        const key = PageResourceLoader.makeExtensionKey(pageResource.url, pageResource.initiator);
        this.#pageResources.set(key, pageResource);
        this.dispatchEventToListeners("Update" /* Events.Update */);
    }
    async loadResource(url, initiator) {
        if (isExtensionInitiator(initiator)) {
            throw new Error('Invalid initiator');
        }
        const key = PageResourceLoader.makeKey(url, initiator);
        const pageResource = { success: null, size: null, errorMessage: undefined, url, initiator };
        this.#pageResources.set(key, pageResource);
        this.dispatchEventToListeners("Update" /* Events.Update */);
        try {
            await this.acquireLoadSlot(initiator.target);
            const resultPromise = this.dispatchLoad(url, initiator);
            const result = await resultPromise;
            pageResource.errorMessage = result.errorDescription.message;
            pageResource.success = result.success;
            if (result.success) {
                pageResource.size = result.content.length;
                return { content: result.content };
            }
            throw new Error(result.errorDescription.message);
        }
        catch (e) {
            if (pageResource.errorMessage === undefined) {
                pageResource.errorMessage = e.message;
            }
            if (pageResource.success === null) {
                pageResource.success = false;
            }
            throw e;
        }
        finally {
            this.releaseLoadSlot(initiator.target);
            this.dispatchEventToListeners("Update" /* Events.Update */);
        }
    }
    async dispatchLoad(url, initiator) {
        if (isExtensionInitiator(initiator)) {
            throw new Error('Invalid initiator');
        }
        let failureReason = null;
        if (this.#loadOverride) {
            return this.#loadOverride(url);
        }
        const parsedURL = new Common.ParsedURL.ParsedURL(url);
        const eligibleForLoadFromTarget = getLoadThroughTargetSetting().get() && parsedURL && parsedURL.scheme !== 'file' &&
            parsedURL.scheme !== 'data' && parsedURL.scheme !== 'devtools';
        Host.userMetrics.developerResourceScheme(this.getDeveloperResourceScheme(parsedURL));
        if (eligibleForLoadFromTarget) {
            try {
                if (initiator.target) {
                    Host.userMetrics.developerResourceLoaded(0 /* Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageViaTarget */);
                    const result = await this.loadFromTarget(initiator.target, initiator.frameId, url);
                    return result;
                }
                const frame = FrameManager.instance().getFrame(initiator.frameId);
                if (frame) {
                    Host.userMetrics.developerResourceLoaded(1 /* Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageViaFrame */);
                    const result = await this.loadFromTarget(frame.resourceTreeModel().target(), initiator.frameId, url);
                    return result;
                }
            }
            catch (e) {
                if (e instanceof Error) {
                    Host.userMetrics.developerResourceLoaded(2 /* Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageFailure */);
                    failureReason = e.message;
                }
            }
            Host.userMetrics.developerResourceLoaded(3 /* Host.UserMetrics.DeveloperResourceLoaded.LoadThroughPageFallback */);
        }
        else {
            const code = getLoadThroughTargetSetting().get() ? 6 /* Host.UserMetrics.DeveloperResourceLoaded.FallbackPerProtocol */ :
                5 /* Host.UserMetrics.DeveloperResourceLoaded.FallbackPerOverride */;
            Host.userMetrics.developerResourceLoaded(code);
        }
        const result = await MultitargetNetworkManager.instance().loadResource(url);
        if (eligibleForLoadFromTarget && !result.success) {
            Host.userMetrics.developerResourceLoaded(7 /* Host.UserMetrics.DeveloperResourceLoaded.FallbackFailure */);
        }
        if (failureReason) {
            // In case we have a success, add a note about why the load through the target failed.
            result.errorDescription.message =
                `Fetch through target failed: ${failureReason}; Fallback: ${result.errorDescription.message}`;
        }
        return result;
    }
    getDeveloperResourceScheme(parsedURL) {
        if (!parsedURL || parsedURL.scheme === '') {
            return 1 /* Host.UserMetrics.DeveloperResourceScheme.SchemeUnknown */;
        }
        const isLocalhost = parsedURL.host === 'localhost' || parsedURL.host.endsWith('.localhost');
        switch (parsedURL.scheme) {
            case 'file':
                return 7 /* Host.UserMetrics.DeveloperResourceScheme.SchemeFile */;
            case 'data':
                return 6 /* Host.UserMetrics.DeveloperResourceScheme.SchemeData */;
            case 'blob':
                return 8 /* Host.UserMetrics.DeveloperResourceScheme.SchemeBlob */;
            case 'http':
                return isLocalhost ? 4 /* Host.UserMetrics.DeveloperResourceScheme.SchemeHttpLocalhost */ :
                    2 /* Host.UserMetrics.DeveloperResourceScheme.SchemeHttp */;
            case 'https':
                return isLocalhost ? 5 /* Host.UserMetrics.DeveloperResourceScheme.SchemeHttpsLocalhost */ :
                    3 /* Host.UserMetrics.DeveloperResourceScheme.SchemeHttps */;
        }
        return 0 /* Host.UserMetrics.DeveloperResourceScheme.SchemeOther */;
    }
    async loadFromTarget(target, frameId, url) {
        const networkManager = target.model(NetworkManager);
        const ioModel = target.model(IOModel);
        const disableCache = Common.Settings.Settings.instance().moduleSetting('cache-disabled').get();
        const resource = await networkManager.loadNetworkResource(frameId, url, { disableCache, includeCredentials: true });
        try {
            const content = resource.stream ? await ioModel.readToString(resource.stream) : '';
            return {
                success: resource.success,
                content,
                errorDescription: {
                    statusCode: resource.httpStatusCode || 0,
                    netError: resource.netError,
                    netErrorName: resource.netErrorName,
                    message: Host.ResourceLoader.netErrorToMessage(resource.netError, resource.httpStatusCode, resource.netErrorName) ||
                        '',
                    urlValid: undefined,
                },
            };
        }
        finally {
            if (resource.stream) {
                void ioModel.close(resource.stream);
            }
        }
    }
}
export function getLoadThroughTargetSetting() {
    return Common.Settings.Settings.instance().createSetting('load-through-target', true);
}
//# sourceMappingURL=PageResourceLoader.js.map