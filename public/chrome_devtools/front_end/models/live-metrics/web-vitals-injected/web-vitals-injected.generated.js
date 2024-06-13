(function () {
    'use strict';

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let bfcacheRestoreTime = -1;
    const getBFCacheRestoreTime = () => bfcacheRestoreTime;
    const onBFCacheRestore = (cb) => {
        addEventListener('pageshow', (event) => {
            if (event.persisted) {
                bfcacheRestoreTime = event.timeStamp;
                cb(event);
            }
        }, true);
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Performantly generate a unique, 30-char string by combining a version
     * number, the current timestamp with a 13-digit number integer.
     * @return {string}
     */
    const generateUniqueID = () => {
        return `v4-${Date.now()}-${Math.floor(Math.random() * (9e12 - 1)) + 1e12}`;
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getNavigationEntry = () => {
        const navigationEntry = self.performance &&
            performance.getEntriesByType &&
            performance.getEntriesByType('navigation')[0];
        // Check to ensure the `responseStart` property is present and valid.
        // In some cases no value is reported by the browser (for
        // privacy/security reasons), and in other cases (bugs) the value is
        // negative or is larger than the current page time. Ignore these cases:
        // https://github.com/GoogleChrome/web-vitals/issues/137
        // https://github.com/GoogleChrome/web-vitals/issues/162
        // https://github.com/GoogleChrome/web-vitals/issues/275
        if (navigationEntry &&
            navigationEntry.responseStart > 0 &&
            navigationEntry.responseStart < performance.now()) {
            return navigationEntry;
        }
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getActivationStart = () => {
        const navEntry = getNavigationEntry();
        return (navEntry && navEntry.activationStart) || 0;
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const initMetric = (name, value) => {
        const navEntry = getNavigationEntry();
        let navigationType = 'navigate';
        if (getBFCacheRestoreTime() >= 0) {
            navigationType = 'back-forward-cache';
        }
        else if (navEntry) {
            if (document.prerendering || getActivationStart() > 0) {
                navigationType = 'prerender';
            }
            else if (document.wasDiscarded) {
                navigationType = 'restore';
            }
            else if (navEntry.type) {
                navigationType = navEntry.type.replace(/_/g, '-');
            }
        }
        // Use `entries` type specific for the metric.
        const entries = [];
        return {
            name,
            value: typeof value === 'undefined' ? -1 : value,
            rating: 'good', // If needed, will be updated when reported. `const` to keep the type from widening to `string`.
            delta: 0,
            entries,
            id: generateUniqueID(),
            navigationType,
        };
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Takes a performance entry type and a callback function, and creates a
     * `PerformanceObserver` instance that will observe the specified entry type
     * with buffering enabled and call the callback _for each entry_.
     *
     * This function also feature-detects entry support and wraps the logic in a
     * try/catch to avoid errors in unsupporting browsers.
     */
    const observe = (type, callback, opts) => {
        try {
            if (PerformanceObserver.supportedEntryTypes.includes(type)) {
                const po = new PerformanceObserver((list) => {
                    // Delay by a microtask to workaround a bug in Safari where the
                    // callback is invoked immediately, rather than in a separate task.
                    // See: https://github.com/GoogleChrome/web-vitals/issues/277
                    Promise.resolve().then(() => {
                        callback(list.getEntries());
                    });
                });
                po.observe(Object.assign({
                    type,
                    buffered: true,
                }, opts || {}));
                return po;
            }
        }
        catch (e) {
            // Do nothing.
        }
        return;
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getRating = (value, thresholds) => {
        if (value > thresholds[1]) {
            return 'poor';
        }
        if (value > thresholds[0]) {
            return 'needs-improvement';
        }
        return 'good';
    };
    const bindReporter = (callback, metric, thresholds, reportAllChanges) => {
        let prevValue;
        let delta;
        return (forceReport) => {
            if (metric.value >= 0) {
                if (forceReport || reportAllChanges) {
                    delta = metric.value - (prevValue || 0);
                    // Report the metric if there's a non-zero delta or if no previous
                    // value exists (which can happen in the case of the document becoming
                    // hidden when the metric value is 0).
                    // See: https://github.com/GoogleChrome/web-vitals/issues/14
                    if (delta || prevValue === undefined) {
                        prevValue = metric.value;
                        metric.delta = delta;
                        metric.rating = getRating(metric.value, thresholds);
                        callback(metric);
                    }
                }
            }
        };
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const doubleRAF = (cb) => {
        requestAnimationFrame(() => requestAnimationFrame(() => cb()));
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const onHidden = (cb) => {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                cb();
            }
        });
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const runOnce = (cb) => {
        let called = false;
        return () => {
            if (!called) {
                cb();
                called = true;
            }
        };
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let firstHiddenTime = -1;
    const initHiddenTime = () => {
        // If the document is hidden when this code runs, assume it was always
        // hidden and the page was loaded in the background, with the one exception
        // that visibility state is always 'hidden' during prerendering, so we have
        // to ignore that case until prerendering finishes (see: `prerenderingchange`
        // event logic below).
        return document.visibilityState === 'hidden' && !document.prerendering
            ? 0
            : Infinity;
    };
    const onVisibilityUpdate = (event) => {
        // If the document is 'hidden' and no previous hidden timestamp has been
        // set, update it based on the current event data.
        if (document.visibilityState === 'hidden' && firstHiddenTime > -1) {
            // If the event is a 'visibilitychange' event, it means the page was
            // visible prior to this change, so the event timestamp is the first
            // hidden time.
            // However, if the event is not a 'visibilitychange' event, then it must
            // be a 'prerenderingchange' event, and the fact that the document is
            // still 'hidden' from the above check means the tab was activated
            // in a background state and so has always been hidden.
            firstHiddenTime = event.type === 'visibilitychange' ? event.timeStamp : 0;
            // Remove all listeners now that a `firstHiddenTime` value has been set.
            removeChangeListeners();
        }
    };
    const addChangeListeners = () => {
        addEventListener('visibilitychange', onVisibilityUpdate, true);
        // IMPORTANT: when a page is prerendering, its `visibilityState` is
        // 'hidden', so in order to account for cases where this module checks for
        // visibility during prerendering, an additional check after prerendering
        // completes is also required.
        addEventListener('prerenderingchange', onVisibilityUpdate, true);
    };
    const removeChangeListeners = () => {
        removeEventListener('visibilitychange', onVisibilityUpdate, true);
        removeEventListener('prerenderingchange', onVisibilityUpdate, true);
    };
    const getVisibilityWatcher = () => {
        if (firstHiddenTime < 0) {
            // If the document is hidden when this code runs, assume it was hidden
            // since navigation start. This isn't a perfect heuristic, but it's the
            // best we can do until an API is available to support querying past
            // visibilityState.
            firstHiddenTime = initHiddenTime();
            addChangeListeners();
            // Reset the time on bfcache restores.
            onBFCacheRestore(() => {
                // Schedule a task in order to track the `visibilityState` once it's
                // had an opportunity to change to visible in all browsers.
                // https://bugs.chromium.org/p/chromium/issues/detail?id=1133363
                setTimeout(() => {
                    firstHiddenTime = initHiddenTime();
                    addChangeListeners();
                }, 0);
            });
        }
        return {
            get firstHiddenTime() {
                return firstHiddenTime;
            },
        };
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const whenActivated = (callback) => {
        if (document.prerendering) {
            addEventListener('prerenderingchange', () => callback(), true);
        }
        else {
            callback();
        }
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for FCP. See https://web.dev/articles/fcp#what_is_a_good_fcp_score */
    const FCPThresholds = [1800, 3000];
    /**
     * Calculates the [FCP](https://web.dev/articles/fcp) value for the current page and
     * calls the `callback` function once the value is ready, along with the
     * relevant `paint` performance entry used to determine the value. The reported
     * value is a `DOMHighResTimeStamp`.
     */
    const onFCP$1 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        whenActivated(() => {
            const visibilityWatcher = getVisibilityWatcher();
            let metric = initMetric('FCP');
            let report;
            const handleEntries = (entries) => {
                entries.forEach((entry) => {
                    if (entry.name === 'first-contentful-paint') {
                        po.disconnect();
                        // Only report if the page wasn't hidden prior to the first paint.
                        if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                            // The activationStart reference is used because FCP should be
                            // relative to page activation rather than navigation start if the
                            // page was prerendered. But in cases where `activationStart` occurs
                            // after the FCP, this time should be clamped at 0.
                            metric.value = Math.max(entry.startTime - getActivationStart(), 0);
                            metric.entries.push(entry);
                            report(true);
                        }
                    }
                });
            };
            const po = observe('paint', handleEntries);
            if (po) {
                report = bindReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
                // Only report after a bfcache restore if the `PerformanceObserver`
                // successfully registered or the `paint` entry exists.
                onBFCacheRestore((event) => {
                    metric = initMetric('FCP');
                    report = bindReporter(onReport, metric, FCPThresholds, opts.reportAllChanges);
                    doubleRAF(() => {
                        metric.value = performance.now() - event.timeStamp;
                        report(true);
                    });
                });
            }
        });
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for CLS. See https://web.dev/articles/cls#what_is_a_good_cls_score */
    const CLSThresholds = [0.1, 0.25];
    /**
     * Calculates the [CLS](https://web.dev/articles/cls) value for the current page and
     * calls the `callback` function once the value is ready to be reported, along
     * with all `layout-shift` performance entries that were used in the metric
     * value calculation. The reported value is a `double` (corresponding to a
     * [layout shift score](https://web.dev/articles/cls#layout_shift_score)).
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called as soon as the value is initially
     * determined as well as any time the value changes throughout the page
     * lifespan.
     *
     * _**Important:** CLS should be continually monitored for changes throughout
     * the entire lifespan of a page—including if the user returns to the page after
     * it's been hidden/backgrounded. However, since browsers often [will not fire
     * additional callbacks once the user has backgrounded a
     * page](https://developer.chrome.com/blog/page-lifecycle-api/#advice-hidden),
     * `callback` is always called when the page's visibility state changes to
     * hidden. As a result, the `callback` function might be called multiple times
     * during the same page load._
     */
    const onCLS$2 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        // Start monitoring FCP so we can only report CLS if FCP is also reported.
        // Note: this is done to match the current behavior of CrUX.
        onFCP$1(runOnce(() => {
            let metric = initMetric('CLS', 0);
            let report;
            let sessionValue = 0;
            let sessionEntries = [];
            const handleEntries = (entries) => {
                entries.forEach((entry) => {
                    // Only count layout shifts without recent user input.
                    if (!entry.hadRecentInput) {
                        const firstSessionEntry = sessionEntries[0];
                        const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                        // If the entry occurred less than 1 second after the previous entry
                        // and less than 5 seconds after the first entry in the session,
                        // include the entry in the current session. Otherwise, start a new
                        // session.
                        if (sessionValue &&
                            entry.startTime - lastSessionEntry.startTime < 1000 &&
                            entry.startTime - firstSessionEntry.startTime < 5000) {
                            sessionValue += entry.value;
                            sessionEntries.push(entry);
                        }
                        else {
                            sessionValue = entry.value;
                            sessionEntries = [entry];
                        }
                    }
                });
                // If the current session value is larger than the current CLS value,
                // update CLS and the entries contributing to it.
                if (sessionValue > metric.value) {
                    metric.value = sessionValue;
                    metric.entries = sessionEntries;
                    report();
                }
            };
            const po = observe('layout-shift', handleEntries);
            if (po) {
                report = bindReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);
                onHidden(() => {
                    handleEntries(po.takeRecords());
                    report(true);
                });
                // Only report after a bfcache restore if the `PerformanceObserver`
                // successfully registered.
                onBFCacheRestore(() => {
                    sessionValue = 0;
                    metric = initMetric('CLS', 0);
                    report = bindReporter(onReport, metric, CLSThresholds, opts.reportAllChanges);
                    doubleRAF(() => report());
                });
                // Queue a task to report (if nothing else triggers a report first).
                // This allows CLS to be reported as soon as FCP fires when
                // `reportAllChanges` is true.
                setTimeout(report, 0);
            }
        }));
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let interactionCountEstimate = 0;
    let minKnownInteractionId = Infinity;
    let maxKnownInteractionId = 0;
    const updateEstimate = (entries) => {
        entries.forEach((e) => {
            if (e.interactionId) {
                minKnownInteractionId = Math.min(minKnownInteractionId, e.interactionId);
                maxKnownInteractionId = Math.max(maxKnownInteractionId, e.interactionId);
                interactionCountEstimate = maxKnownInteractionId
                    ? (maxKnownInteractionId - minKnownInteractionId) / 7 + 1
                    : 0;
            }
        });
    };
    let po;
    /**
     * Returns the `interactionCount` value using the native API (if available)
     * or the polyfill estimate in this module.
     */
    const getInteractionCount = () => {
        return po ? interactionCountEstimate : performance.interactionCount || 0;
    };
    /**
     * Feature detects native support or initializes the polyfill if needed.
     */
    const initInteractionCountPolyfill = () => {
        if ('interactionCount' in performance || po)
            return;
        po = observe('event', updateEstimate, {
            type: 'event',
            buffered: true,
            durationThreshold: 0,
        });
    };

    /*
     * Copyright 2024 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // A list of longest interactions on the page (by latency) sorted so the
    // longest one is first. The list is at most MAX_INTERACTIONS_TO_CONSIDER long.
    const longestInteractionList = [];
    // A mapping of longest interactions by their interaction ID.
    // This is used for faster lookup.
    const longestInteractionMap = new Map();
    // The default `durationThreshold` used across this library for observing
    // `event` entries via PerformanceObserver.
    const DEFAULT_DURATION_THRESHOLD = 40;
    // Used to store the interaction count after a bfcache restore, since p98
    // interaction latencies should only consider the current navigation.
    let prevInteractionCount = 0;
    /**
     * Returns the interaction count since the last bfcache restore (or for the
     * full page lifecycle if there were no bfcache restores).
     */
    const getInteractionCountForNavigation = () => {
        return getInteractionCount() - prevInteractionCount;
    };
    const resetInteractions = () => {
        prevInteractionCount = 0;
        longestInteractionList.length = 0;
        longestInteractionMap.clear();
    };
    /**
     * Returns the estimated p98 longest interaction based on the stored
     * interaction candidates and the interaction count for the current page.
     */
    const estimateP98LongestInteraction = () => {
        const candidateInteractionIndex = Math.min(longestInteractionList.length - 1, Math.floor(getInteractionCountForNavigation() / 50));
        return longestInteractionList[candidateInteractionIndex];
    };
    // To prevent unnecessary memory usage on pages with lots of interactions,
    // store at most 10 of the longest interactions to consider as INP candidates.
    const MAX_INTERACTIONS_TO_CONSIDER = 10;
    /**
     * A list of callback functions to run before each entry is processed.
     * Exposing this list allows the attribution build to hook into the
     * entry processing pipeline.
     */
    const entryPreProcessingCallbacks = [];
    /**
     * Takes a performance entry and adds it to the list of worst interactions
     * if its duration is long enough to make it among the worst. If the
     * entry is part of an existing interaction, it is merged and the latency
     * and entries list is updated as needed.
     */
    const processInteractionEntry = (entry) => {
        entryPreProcessingCallbacks.forEach((cb) => cb(entry));
        // Skip further processing for entries that cannot be INP candidates.
        if (!(entry.interactionId || entry.entryType === 'first-input'))
            return;
        // The least-long of the 10 longest interactions.
        const minLongestInteraction = longestInteractionList[longestInteractionList.length - 1];
        const existingInteraction = longestInteractionMap.get(entry.interactionId);
        // Only process the entry if it's possibly one of the ten longest,
        // or if it's part of an existing interaction.
        if (existingInteraction ||
            longestInteractionList.length < MAX_INTERACTIONS_TO_CONSIDER ||
            entry.duration > minLongestInteraction.latency) {
            // If the interaction already exists, update it. Otherwise create one.
            if (existingInteraction) {
                // If the new entry has a longer duration, replace the old entries,
                // otherwise add to the array.
                if (entry.duration > existingInteraction.latency) {
                    existingInteraction.entries = [entry];
                    existingInteraction.latency = entry.duration;
                }
                else if (entry.duration === existingInteraction.latency &&
                    entry.startTime === existingInteraction.entries[0].startTime) {
                    existingInteraction.entries.push(entry);
                }
            }
            else {
                const interaction = {
                    id: entry.interactionId,
                    latency: entry.duration,
                    entries: [entry],
                };
                longestInteractionMap.set(interaction.id, interaction);
                longestInteractionList.push(interaction);
            }
            // Sort the entries by latency (descending) and keep only the top ten.
            longestInteractionList.sort((a, b) => b.latency - a.latency);
            if (longestInteractionList.length > MAX_INTERACTIONS_TO_CONSIDER) {
                longestInteractionList
                    .splice(MAX_INTERACTIONS_TO_CONSIDER)
                    .forEach((i) => longestInteractionMap.delete(i.id));
            }
        }
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for INP. See https://web.dev/articles/inp#what_is_a_good_inp_score */
    const INPThresholds = [200, 500];
    /**
     * Calculates the [INP](https://web.dev/articles/inp) value for the current
     * page and calls the `callback` function once the value is ready, along with
     * the `event` performance entries reported for that interaction. The reported
     * value is a `DOMHighResTimeStamp`.
     *
     * A custom `durationThreshold` configuration option can optionally be passed to
     * control what `event-timing` entries are considered for INP reporting. The
     * default threshold is `40`, which means INP scores of less than 40 are
     * reported as 0. Note that this will not affect your 75th percentile INP value
     * unless that value is also less than 40 (well below the recommended
     * [good](https://web.dev/articles/inp#what_is_a_good_inp_score) threshold).
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called as soon as the value is initially
     * determined as well as any time the value changes throughout the page
     * lifespan.
     *
     * _**Important:** INP should be continually monitored for changes throughout
     * the entire lifespan of a page—including if the user returns to the page after
     * it's been hidden/backgrounded. However, since browsers often [will not fire
     * additional callbacks once the user has backgrounded a
     * page](https://developer.chrome.com/blog/page-lifecycle-api/#advice-hidden),
     * `callback` is always called when the page's visibility state changes to
     * hidden. As a result, the `callback` function might be called multiple times
     * during the same page load._
     */
    const onINP$2 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        whenActivated(() => {
            // TODO(philipwalton): remove once the polyfill is no longer needed.
            initInteractionCountPolyfill();
            let metric = initMetric('INP');
            let report;
            const handleEntries = (entries) => {
                entries.forEach(processInteractionEntry);
                const inp = estimateP98LongestInteraction();
                if (inp && inp.latency !== metric.value) {
                    metric.value = inp.latency;
                    metric.entries = inp.entries;
                    report();
                }
            };
            const po = observe('event', handleEntries, {
                // Event Timing entries have their durations rounded to the nearest 8ms,
                // so a duration of 40ms would be any event that spans 2.5 or more frames
                // at 60Hz. This threshold is chosen to strike a balance between usefulness
                // and performance. Running this callback for any interaction that spans
                // just one or two frames is likely not worth the insight that could be
                // gained.
                durationThreshold: opts.durationThreshold ?? DEFAULT_DURATION_THRESHOLD,
            });
            report = bindReporter(onReport, metric, INPThresholds, opts.reportAllChanges);
            if (po) {
                // If browser supports interactionId (and so supports INP), also
                // observe entries of type `first-input`. This is useful in cases
                // where the first interaction is less than the `durationThreshold`.
                if ('PerformanceEventTiming' in self &&
                    'interactionId' in PerformanceEventTiming.prototype) {
                    po.observe({ type: 'first-input', buffered: true });
                }
                onHidden(() => {
                    handleEntries(po.takeRecords());
                    report(true);
                });
                // Only report after a bfcache restore if the `PerformanceObserver`
                // successfully registered.
                onBFCacheRestore(() => {
                    resetInteractions();
                    metric = initMetric('INP');
                    report = bindReporter(onReport, metric, INPThresholds, opts.reportAllChanges);
                });
            }
        });
    };

    /*
     * Copyright 2024 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Runs the passed callback during the next idle period, or immediately
     * if the browser's visibility state is (or becomes) hidden.
     */
    const whenIdle = (cb) => {
        const rIC = self.requestIdleCallback || self.setTimeout;
        let handle = -1;
        cb = runOnce(cb);
        // If the document is hidden, run the callback immediately, otherwise
        // race an idle callback with the next `visibilitychange` event.
        if (document.visibilityState === 'hidden') {
            cb();
        }
        else {
            handle = rIC(cb);
            onHidden(cb);
        }
        return handle;
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for LCP. See https://web.dev/articles/lcp#what_is_a_good_lcp_score */
    const LCPThresholds = [2500, 4000];
    const reportedMetricIDs = {};
    /**
     * Calculates the [LCP](https://web.dev/articles/lcp) value for the current page and
     * calls the `callback` function once the value is ready (along with the
     * relevant `largest-contentful-paint` performance entry used to determine the
     * value). The reported value is a `DOMHighResTimeStamp`.
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called any time a new `largest-contentful-paint`
     * performance entry is dispatched, or once the final value of the metric has
     * been determined.
     */
    const onLCP$2 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        whenActivated(() => {
            const visibilityWatcher = getVisibilityWatcher();
            let metric = initMetric('LCP');
            let report;
            const handleEntries = (entries) => {
                // If reportAllChanges is set then call this function for each entry,
                // otherwise only consider the last one.
                if (!opts.reportAllChanges) {
                    entries = entries.slice(-1);
                }
                entries.forEach((entry) => {
                    // Only report if the page wasn't hidden prior to LCP.
                    if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                        // The startTime attribute returns the value of the renderTime if it is
                        // not 0, and the value of the loadTime otherwise. The activationStart
                        // reference is used because LCP should be relative to page activation
                        // rather than navigation start if the page was prerendered. But in cases
                        // where `activationStart` occurs after the LCP, this time should be
                        // clamped at 0.
                        metric.value = Math.max(entry.startTime - getActivationStart(), 0);
                        metric.entries = [entry];
                        report();
                    }
                });
            };
            const po = observe('largest-contentful-paint', handleEntries);
            if (po) {
                report = bindReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);
                const stopListening = runOnce(() => {
                    if (!reportedMetricIDs[metric.id]) {
                        handleEntries(po.takeRecords());
                        po.disconnect();
                        reportedMetricIDs[metric.id] = true;
                        report(true);
                    }
                });
                // Stop listening after input. Note: while scrolling is an input that
                // stops LCP observation, it's unreliable since it can be programmatically
                // generated. See: https://github.com/GoogleChrome/web-vitals/issues/75
                ['keydown', 'click'].forEach((type) => {
                    // Wrap in a setTimeout so the callback is run in a separate task
                    // to avoid extending the keyboard/click handler to reduce INP impact
                    // https://github.com/GoogleChrome/web-vitals/issues/383
                    addEventListener(type, () => whenIdle(stopListening), true);
                });
                onHidden(stopListening);
                // Only report after a bfcache restore if the `PerformanceObserver`
                // successfully registered.
                onBFCacheRestore((event) => {
                    metric = initMetric('LCP');
                    report = bindReporter(onReport, metric, LCPThresholds, opts.reportAllChanges);
                    doubleRAF(() => {
                        metric.value = performance.now() - event.timeStamp;
                        reportedMetricIDs[metric.id] = true;
                        report(true);
                    });
                });
            }
        });
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for TTFB. See https://web.dev/articles/ttfb#what_is_a_good_ttfb_score */
    const TTFBThresholds = [800, 1800];
    /**
     * Runs in the next task after the page is done loading and/or prerendering.
     * @param callback
     */
    const whenReady = (callback) => {
        if (document.prerendering) {
            whenActivated(() => whenReady(callback));
        }
        else if (document.readyState !== 'complete') {
            addEventListener('load', () => whenReady(callback), true);
        }
        else {
            // Queue a task so the callback runs after `loadEventEnd`.
            setTimeout(callback, 0);
        }
    };
    /**
     * Calculates the [TTFB](https://web.dev/articles/ttfb) value for the
     * current page and calls the `callback` function once the page has loaded,
     * along with the relevant `navigation` performance entry used to determine the
     * value. The reported value is a `DOMHighResTimeStamp`.
     *
     * Note, this function waits until after the page is loaded to call `callback`
     * in order to ensure all properties of the `navigation` entry are populated.
     * This is useful if you want to report on other metrics exposed by the
     * [Navigation Timing API](https://w3c.github.io/navigation-timing/). For
     * example, the TTFB metric starts from the page's [time
     * origin](https://www.w3.org/TR/hr-time-2/#sec-time-origin), which means it
     * includes time spent on DNS lookup, connection negotiation, network latency,
     * and server processing time.
     */
    const onTTFB$1 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        let metric = initMetric('TTFB');
        let report = bindReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);
        whenReady(() => {
            const navigationEntry = getNavigationEntry();
            if (navigationEntry) {
                // The activationStart reference is used because TTFB should be
                // relative to page activation rather than navigation start if the
                // page was prerendered. But in cases where `activationStart` occurs
                // after the first byte is received, this time should be clamped at 0.
                metric.value = Math.max(navigationEntry.responseStart - getActivationStart(), 0);
                metric.entries = [navigationEntry];
                report(true);
                // Only report TTFB after bfcache restores if a `navigation` entry
                // was reported for the initial load.
                onBFCacheRestore(() => {
                    metric = initMetric('TTFB', 0);
                    report = bindReporter(onReport, metric, TTFBThresholds, opts.reportAllChanges);
                    report(true);
                });
            }
        });
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    let firstInputEvent;
    let firstInputDelay;
    let firstInputTimeStamp;
    let callbacks;
    const listenerOpts = { passive: true, capture: true };
    const startTimeStamp = new Date();
    /**
     * Accepts a callback to be invoked once the first input delay and event
     * are known.
     */
    const firstInputPolyfill = (onFirstInput) => {
        callbacks.push(onFirstInput);
        reportFirstInputDelayIfRecordedAndValid();
    };
    const resetFirstInputPolyfill = () => {
        callbacks = [];
        firstInputDelay = -1;
        firstInputEvent = null;
        eachEventType(addEventListener);
    };
    /**
     * Records the first input delay and event, so subsequent events can be
     * ignored. All added event listeners are then removed.
     */
    const recordFirstInputDelay = (delay, event) => {
        if (!firstInputEvent) {
            firstInputEvent = event;
            firstInputDelay = delay;
            firstInputTimeStamp = new Date();
            eachEventType(removeEventListener);
            reportFirstInputDelayIfRecordedAndValid();
        }
    };
    /**
     * Reports the first input delay and event (if they're recorded and valid)
     * by running the array of callback functions.
     */
    const reportFirstInputDelayIfRecordedAndValid = () => {
        // In some cases the recorded delay is clearly wrong, e.g. it's negative
        // or it's larger than the delta between now and initialization.
        // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
        // - https://github.com/GoogleChromeLabs/first-input-delay/issues/6
        // - https://github.com/GoogleChromeLabs/first-input-delay/issues/7
        if (firstInputDelay >= 0 &&
            // @ts-ignore (subtracting two dates always returns a number)
            firstInputDelay < firstInputTimeStamp - startTimeStamp) {
            const entry = {
                entryType: 'first-input',
                name: firstInputEvent.type,
                target: firstInputEvent.target,
                cancelable: firstInputEvent.cancelable,
                startTime: firstInputEvent.timeStamp,
                processingStart: firstInputEvent.timeStamp + firstInputDelay,
            };
            callbacks.forEach(function (callback) {
                callback(entry);
            });
            callbacks = [];
        }
    };
    /**
     * Handles pointer down events, which are a special case.
     * Pointer events can trigger main or compositor thread behavior.
     * We differentiate these cases based on whether or not we see a
     * 'pointercancel' event, which are fired when we scroll. If we're scrolling
     * we don't need to report input delay since FID excludes scrolling and
     * pinch/zooming.
     */
    const onPointerDown = (delay, event) => {
        /**
         * Responds to 'pointerup' events and records a delay. If a pointer up event
         * is the next event after a pointerdown event, then it's not a scroll or
         * a pinch/zoom.
         */
        const onPointerUp = () => {
            recordFirstInputDelay(delay, event);
            removePointerEventListeners();
        };
        /**
         * Responds to 'pointercancel' events and removes pointer listeners.
         * If a 'pointercancel' is the next event to fire after a pointerdown event,
         * it means this is a scroll or pinch/zoom interaction.
         */
        const onPointerCancel = () => {
            removePointerEventListeners();
        };
        /**
         * Removes added pointer event listeners.
         */
        const removePointerEventListeners = () => {
            removeEventListener('pointerup', onPointerUp, listenerOpts);
            removeEventListener('pointercancel', onPointerCancel, listenerOpts);
        };
        addEventListener('pointerup', onPointerUp, listenerOpts);
        addEventListener('pointercancel', onPointerCancel, listenerOpts);
    };
    /**
     * Handles all input events and records the time between when the event
     * was received by the operating system and when it's JavaScript listeners
     * were able to run.
     */
    const onInput = (event) => {
        // Only count cancelable events, which should trigger behavior
        // important to the user.
        if (event.cancelable) {
            // In some browsers `event.timeStamp` returns a `DOMTimeStamp` value
            // (epoch time) instead of the newer `DOMHighResTimeStamp`
            // (document-origin time). To check for that we assume any timestamp
            // greater than 1 trillion is a `DOMTimeStamp`, and compare it using
            // the `Date` object rather than `performance.now()`.
            // - https://github.com/GoogleChromeLabs/first-input-delay/issues/4
            const isEpochTime = event.timeStamp > 1e12;
            const now = isEpochTime ? new Date() : performance.now();
            // Input delay is the delta between when the system received the event
            // (e.g. event.timeStamp) and when it could run the callback (e.g. `now`).
            const delay = now - event.timeStamp;
            if (event.type == 'pointerdown') {
                onPointerDown(delay, event);
            }
            else {
                recordFirstInputDelay(delay, event);
            }
        }
    };
    /**
     * Invokes the passed callback const for =  each event type with t =>he
     * `onInput` const and =  `listenerOpts =>`.
     */
    const eachEventType = (callback) => {
        const eventTypes = ['mousedown', 'keydown', 'touchstart', 'pointerdown'];
        eventTypes.forEach((type) => callback(type, onInput, listenerOpts));
    };

    /*
     * Copyright 2020 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /** Thresholds for FID. See https://web.dev/articles/fid#what_is_a_good_fid_score */
    const FIDThresholds = [100, 300];
    /**
     * Calculates the [FID](https://web.dev/articles/fid) value for the current page and
     * calls the `callback` function once the value is ready, along with the
     * relevant `first-input` performance entry used to determine the value. The
     * reported value is a `DOMHighResTimeStamp`.
     *
     * _**Important:** since FID is only reported after the user interacts with the
     * page, it's possible that it will not be reported for some page loads._
     */
    const onFID$1 = (onReport, opts) => {
        // Set defaults
        opts = opts || {};
        whenActivated(() => {
            const visibilityWatcher = getVisibilityWatcher();
            let metric = initMetric('FID');
            let report;
            const handleEntry = (entry) => {
                // Only report if the page wasn't hidden prior to the first input.
                if (entry.startTime < visibilityWatcher.firstHiddenTime) {
                    metric.value = entry.processingStart - entry.startTime;
                    metric.entries.push(entry);
                    report(true);
                }
            };
            const handleEntries = (entries) => {
                entries.forEach(handleEntry);
            };
            const po = observe('first-input', handleEntries);
            report = bindReporter(onReport, metric, FIDThresholds, opts.reportAllChanges);
            if (po) {
                onHidden(runOnce(() => {
                    handleEntries(po.takeRecords());
                    po.disconnect();
                }));
                onBFCacheRestore(() => {
                    metric = initMetric('FID');
                    report = bindReporter(onReport, metric, FIDThresholds, opts.reportAllChanges);
                    // Browsers don't re-emit FID on bfcache restore so fake it until you make it
                    resetFirstInputPolyfill();
                    firstInputPolyfill(handleEntry);
                });
            }
        });
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getLoadState = (timestamp) => {
        if (document.readyState === 'loading') {
            // If the `readyState` is 'loading' there's no need to look at timestamps
            // since the timestamp has to be the current time or earlier.
            return 'loading';
        }
        else {
            const navigationEntry = getNavigationEntry();
            if (navigationEntry) {
                if (timestamp < navigationEntry.domInteractive) {
                    return 'loading';
                }
                else if (navigationEntry.domContentLoadedEventStart === 0 ||
                    timestamp < navigationEntry.domContentLoadedEventStart) {
                    // If the `domContentLoadedEventStart` timestamp has not yet been
                    // set, or if the given timestamp is less than that value.
                    return 'dom-interactive';
                }
                else if (navigationEntry.domComplete === 0 ||
                    timestamp < navigationEntry.domComplete) {
                    // If the `domComplete` timestamp has not yet been
                    // set, or if the given timestamp is less than that value.
                    return 'dom-content-loaded';
                }
            }
        }
        // If any of the above fail, default to loaded. This could really only
        // happy if the browser doesn't support the performance timeline, which
        // most likely means this code would never run anyway.
        return 'complete';
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getName = (node) => {
        const name = node.nodeName;
        return node.nodeType === 1
            ? name.toLowerCase()
            : name.toUpperCase().replace(/^#/, '');
    };
    const getSelector = (node, maxLen) => {
        let sel = '';
        try {
            while (node && node.nodeType !== 9) {
                const el = node;
                const part = el.id
                    ? '#' + el.id
                    : getName(el) +
                        (el.classList &&
                            el.classList.value &&
                            el.classList.value.trim() &&
                            el.classList.value.trim().length
                            ? '.' + el.classList.value.trim().replace(/\s+/g, '.')
                            : '');
                if (sel.length + part.length > (maxLen || 100) - 1)
                    return sel || part;
                sel = sel ? part + '>' + sel : part;
                if (el.id)
                    break;
                node = el.parentNode;
            }
        }
        catch (err) {
            // Do nothing...
        }
        return sel;
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const getLargestLayoutShiftEntry = (entries) => {
        return entries.reduce((a, b) => (a && a.value > b.value ? a : b));
    };
    const getLargestLayoutShiftSource = (sources) => {
        return sources.find((s) => s.node && s.node.nodeType === 1) || sources[0];
    };
    const attributeCLS = (metric) => {
        // Use an empty object if no other attribution has been set.
        let attribution = {};
        if (metric.entries.length) {
            const largestEntry = getLargestLayoutShiftEntry(metric.entries);
            if (largestEntry && largestEntry.sources && largestEntry.sources.length) {
                const largestSource = getLargestLayoutShiftSource(largestEntry.sources);
                if (largestSource) {
                    attribution = {
                        largestShiftTarget: getSelector(largestSource.node),
                        largestShiftTime: largestEntry.startTime,
                        largestShiftValue: largestEntry.value,
                        largestShiftSource: largestSource,
                        largestShiftEntry: largestEntry,
                        loadState: getLoadState(largestEntry.startTime),
                    };
                }
            }
        }
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [CLS](https://web.dev/articles/cls) value for the current page and
     * calls the `callback` function once the value is ready to be reported, along
     * with all `layout-shift` performance entries that were used in the metric
     * value calculation. The reported value is a `double` (corresponding to a
     * [layout shift score](https://web.dev/articles/cls#layout_shift_score)).
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called as soon as the value is initially
     * determined as well as any time the value changes throughout the page
     * lifespan.
     *
     * _**Important:** CLS should be continually monitored for changes throughout
     * the entire lifespan of a page—including if the user returns to the page after
     * it's been hidden/backgrounded. However, since browsers often [will not fire
     * additional callbacks once the user has backgrounded a
     * page](https://developer.chrome.com/blog/page-lifecycle-api/#advice-hidden),
     * `callback` is always called when the page's visibility state changes to
     * hidden. As a result, the `callback` function might be called multiple times
     * during the same page load._
     */
    const onCLS$1 = (onReport, opts) => {
        onCLS$2((metric) => {
            const metricWithAttribution = attributeCLS(metric);
            onReport(metricWithAttribution);
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const attributeFCP = (metric) => {
        // Use a default object if no other attribution has been set.
        let attribution = {
            timeToFirstByte: 0,
            firstByteToFCP: metric.value,
            loadState: getLoadState(getBFCacheRestoreTime()),
        };
        if (metric.entries.length) {
            const navigationEntry = getNavigationEntry();
            const fcpEntry = metric.entries[metric.entries.length - 1];
            if (navigationEntry) {
                const activationStart = navigationEntry.activationStart || 0;
                const ttfb = Math.max(0, navigationEntry.responseStart - activationStart);
                attribution = {
                    timeToFirstByte: ttfb,
                    firstByteToFCP: metric.value - ttfb,
                    loadState: getLoadState(metric.entries[0].startTime),
                    navigationEntry,
                    fcpEntry,
                };
            }
        }
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [FCP](https://web.dev/articles/fcp) value for the current page and
     * calls the `callback` function once the value is ready, along with the
     * relevant `paint` performance entry used to determine the value. The reported
     * value is a `DOMHighResTimeStamp`.
     */
    const onFCP = (onReport, opts) => {
        onFCP$1((metric) => {
            const metricWithAttribution = attributeFCP(metric);
            onReport(metricWithAttribution);
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    // A PerformanceObserver, observing new `long-animation-frame` entries.
    // If this variable is defined it means the browser supports LoAF.
    let loafObserver;
    // A list of LoAF entries that have been dispatched and could potentially
    // intersect with the INP candidate interaction. Note that periodically this
    // list is cleaned up and entries that are known to not match INP are removed.
    let pendingLoAFs = [];
    // A mapping between a particular frame's render time and all of the
    // event timing entries that occurred within that frame. Note that periodically
    // this map is cleaned up and entries that are known to not match INP are
    // removed.
    const pendingEntriesGroupMap = new Map();
    // A list of recent render times. This corresponds to the keys in
    // `pendingEntriesGroupMap` but as an array so it can be iterated on in
    // reverse. Note that this list is periodically clean up and old render times
    // are removed.
    let previousRenderTimes = [];
    // A WeakMap so you can look up the `renderTime` of a given entry and the
    // value returned will be the same value used by `pendingEntriesGroupMap`.
    const entryToRenderTimeMap = new WeakMap();
    // A mapping of interactions to the target selector
    const interactionTargetMap = new Map();
    // A reference to the idle task used to clean up entries from the above
    // variables. If the value is -1 it means no task is queue, and if it's
    // greater than -1 the value corresponds to the idle callback handle.
    let idleHandle = -1;
    /**
     * Adds new LoAF entries to the `pendingLoAFs` list.
     */
    const handleLoAFEntries = (entries) => {
        entries.forEach((entry) => pendingLoAFs.push(entry));
    };
    // Get a reference to the interaction target element in case it's removed
    // from the DOM later.
    const saveInteractionTarget = (entry) => {
        if (entry.interactionId &&
            entry.target &&
            !interactionTargetMap.has(entry.interactionId)) {
            interactionTargetMap.set(entry.interactionId, entry.target);
        }
    };
    /**
     * Groups entries that were presented within the same animation frame by
     * a common `renderTime`. This function works by referencing
     * `pendingEntriesGroupMap` and using an existing render time if one is found
     * (otherwise creating a new one). This function also adds all interaction
     * entries to an `entryToRenderTimeMap` WeakMap so that the "grouped" render
     * times can be looked up later.
     */
    const groupEntriesByRenderTime = (entry) => {
        let renderTime = entry.startTime + entry.duration;
        let previousRenderTime;
        // Iterate of all previous render times in reverse order to find a match.
        // Go in reverse since the most likely match will be at the end.
        for (let i = previousRenderTimes.length - 1; i >= 0; i--) {
            previousRenderTime = previousRenderTimes[i];
            // If a previous render time is within 8ms of the current render time,
            // assume they were part of the same frame and re-use the previous time.
            // Also break out of the loop because all subsequent times will be newer.
            if (Math.abs(renderTime - previousRenderTime) <= 8) {
                const group = pendingEntriesGroupMap.get(previousRenderTime);
                group.startTime = Math.min(entry.startTime, group.startTime);
                group.processingStart = Math.min(entry.processingStart, group.processingStart);
                group.processingEnd = Math.max(entry.processingEnd, group.processingEnd);
                group.entries.push(entry);
                renderTime = previousRenderTime;
                break;
            }
        }
        // If there was no matching render time, assume this is a new frame.
        if (renderTime !== previousRenderTime) {
            previousRenderTimes.push(renderTime);
            pendingEntriesGroupMap.set(renderTime, {
                startTime: entry.startTime,
                processingStart: entry.processingStart,
                processingEnd: entry.processingEnd,
                entries: [entry],
            });
        }
        // Store the grouped render time for this entry for reference later.
        if (entry.interactionId || entry.entryType === 'first-input') {
            entryToRenderTimeMap.set(entry, renderTime);
        }
    };
    const queueCleanup = () => {
        // Queue cleanup of entries that are not part of any INP candidates.
        if (idleHandle < 0) {
            idleHandle = whenIdle(cleanupEntries);
        }
    };
    const cleanupEntries = () => {
        // Delete any stored interaction target elements if they're not part of one
        // of the 10 longest interactions.
        if (interactionTargetMap.size > 10) {
            interactionTargetMap.forEach((_, key) => {
                if (!longestInteractionMap.has(key)) {
                    interactionTargetMap.delete(key);
                }
            });
        }
        // The list of previous render times is used to handle cases where
        // events are dispatched out of order. When this happens they're generally
        // only off by a frame or two, so keeping the most recent 50 should be
        // more than sufficient.
        previousRenderTimes = previousRenderTimes.slice(-50);
        // Keep all render times that are part of a pending INP candidate or
        // that occurred within the 50 most recently-dispatched animation frames.
        const renderTimesToKeep = new Set(previousRenderTimes.concat(longestInteractionList.map((i) => entryToRenderTimeMap.get(i.entries[0]))));
        pendingEntriesGroupMap.forEach((_, key) => {
            if (!renderTimesToKeep.has(key))
                pendingEntriesGroupMap.delete(key);
        });
        // Remove all pending LoAF entries that don't intersect with entries in
        // the newly cleaned up `pendingEntriesGroupMap`.
        const loafsToKeep = new Set();
        pendingEntriesGroupMap.forEach((group) => {
            getIntersectingLoAFs(group.startTime, group.processingEnd).forEach((loaf) => {
                loafsToKeep.add(loaf);
            });
        });
        pendingLoAFs = Array.from(loafsToKeep);
        // Reset the idle callback handle so it can be queued again.
        idleHandle = -1;
    };
    entryPreProcessingCallbacks.push(saveInteractionTarget, groupEntriesByRenderTime, queueCleanup);
    const getIntersectingLoAFs = (start, end) => {
        const intersectingLoAFs = [];
        for (let i = 0, loaf; (loaf = pendingLoAFs[i]); i++) {
            // If the LoAF ends before the given start time, ignore it.
            if (loaf.startTime + loaf.duration < start)
                continue;
            // If the LoAF starts after the given end time, ignore it and all
            // subsequent pending LoAFs (because they're in time order).
            if (loaf.startTime > end)
                break;
            // Still here? If so this LoAF intersects with the interaction.
            intersectingLoAFs.push(loaf);
        }
        return intersectingLoAFs;
    };
    const attributeINP = (metric) => {
        const firstEntry = metric.entries[0];
        const renderTime = entryToRenderTimeMap.get(firstEntry);
        const group = pendingEntriesGroupMap.get(renderTime);
        const processingStart = firstEntry.processingStart;
        const processingEnd = group.processingEnd;
        // Sort the entries in processing time order.
        const processedEventEntries = group.entries.sort((a, b) => {
            return a.processingStart - b.processingStart;
        });
        const longAnimationFrameEntries = getIntersectingLoAFs(firstEntry.startTime, processingEnd);
        // The first interaction entry may not have a target defined, so use the
        // first one found in the entry list.
        // TODO: when the following bug is fixed just use `firstInteractionEntry`.
        // https://bugs.chromium.org/p/chromium/issues/detail?id=1367329
        // As a fallback, also check the interactionTargetMap (to account for
        // cases where the element is removed from the DOM before reporting happens).
        const firstEntryWithTarget = metric.entries.find((entry) => entry.target);
        const interactionTargetElement = (firstEntryWithTarget && firstEntryWithTarget.target) ||
            interactionTargetMap.get(firstEntry.interactionId);
        // Since entry durations are rounded to the nearest 8ms, we need to clamp
        // the `nextPaintTime` value to be higher than the `processingEnd` or
        // end time of any LoAF entry.
        const nextPaintTimeCandidates = [
            firstEntry.startTime + firstEntry.duration,
            processingEnd,
        ].concat(longAnimationFrameEntries.map((loaf) => loaf.startTime + loaf.duration));
        const nextPaintTime = Math.max.apply(Math, nextPaintTimeCandidates);
        const attribution = {
            interactionTarget: getSelector(interactionTargetElement),
            interactionTargetElement: interactionTargetElement,
            interactionType: firstEntry.name.startsWith('key') ? 'keyboard' : 'pointer',
            interactionTime: firstEntry.startTime,
            nextPaintTime: nextPaintTime,
            processedEventEntries: processedEventEntries,
            longAnimationFrameEntries: longAnimationFrameEntries,
            inputDelay: processingStart - firstEntry.startTime,
            processingDuration: processingEnd - processingStart,
            presentationDelay: Math.max(nextPaintTime - processingEnd, 0),
            loadState: getLoadState(firstEntry.startTime),
        };
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [INP](https://web.dev/articles/inp) value for the current
     * page and calls the `callback` function once the value is ready, along with
     * the `event` performance entries reported for that interaction. The reported
     * value is a `DOMHighResTimeStamp`.
     *
     * A custom `durationThreshold` configuration option can optionally be passed to
     * control what `event-timing` entries are considered for INP reporting. The
     * default threshold is `40`, which means INP scores of less than 40 are
     * reported as 0. Note that this will not affect your 75th percentile INP value
     * unless that value is also less than 40 (well below the recommended
     * [good](https://web.dev/articles/inp#what_is_a_good_inp_score) threshold).
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called as soon as the value is initially
     * determined as well as any time the value changes throughout the page
     * lifespan.
     *
     * _**Important:** INP should be continually monitored for changes throughout
     * the entire lifespan of a page—including if the user returns to the page after
     * it's been hidden/backgrounded. However, since browsers often [will not fire
     * additional callbacks once the user has backgrounded a
     * page](https://developer.chrome.com/blog/page-lifecycle-api/#advice-hidden),
     * `callback` is always called when the page's visibility state changes to
     * hidden. As a result, the `callback` function might be called multiple times
     * during the same page load._
     */
    const onINP$1 = (onReport, opts) => {
        if (!loafObserver) {
            loafObserver = observe('long-animation-frame', handleLoAFEntries);
        }
        onINP$2((metric) => {
            // Queue attribution and reporting in the next idle task.
            // This is needed to increase the chances that all event entries that
            // occurred between the user interaction and the next paint
            // have been dispatched. Note: there is currently an experiment
            // running in Chrome (EventTimingKeypressAndCompositionInteractionId)
            // 123+ that if rolled out fully would make this no longer necessary.
            whenIdle(() => {
                const metricWithAttribution = attributeINP(metric);
                onReport(metricWithAttribution);
            });
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const attributeLCP = (metric) => {
        // Use a default object if no other attribution has been set.
        let attribution = {
            timeToFirstByte: 0,
            resourceLoadDelay: 0,
            resourceLoadDuration: 0,
            elementRenderDelay: metric.value,
        };
        if (metric.entries.length) {
            const navigationEntry = getNavigationEntry();
            if (navigationEntry) {
                const activationStart = navigationEntry.activationStart || 0;
                const lcpEntry = metric.entries[metric.entries.length - 1];
                const lcpResourceEntry = lcpEntry.url &&
                    performance
                        .getEntriesByType('resource')
                        .filter((e) => e.name === lcpEntry.url)[0];
                const ttfb = Math.max(0, navigationEntry.responseStart - activationStart);
                const lcpRequestStart = Math.max(ttfb, 
                // Prefer `requestStart` (if TOA is set), otherwise use `startTime`.
                lcpResourceEntry
                    ? (lcpResourceEntry.requestStart || lcpResourceEntry.startTime) -
                        activationStart
                    : 0);
                const lcpResponseEnd = Math.max(lcpRequestStart, lcpResourceEntry ? lcpResourceEntry.responseEnd - activationStart : 0);
                const lcpRenderTime = Math.max(lcpResponseEnd, lcpEntry.startTime - activationStart);
                attribution = {
                    element: getSelector(lcpEntry.element),
                    timeToFirstByte: ttfb,
                    resourceLoadDelay: lcpRequestStart - ttfb,
                    resourceLoadDuration: lcpResponseEnd - lcpRequestStart,
                    elementRenderDelay: lcpRenderTime - lcpResponseEnd,
                    navigationEntry,
                    lcpEntry,
                };
                // Only attribution the URL and resource entry if they exist.
                if (lcpEntry.url) {
                    attribution.url = lcpEntry.url;
                }
                if (lcpResourceEntry) {
                    attribution.lcpResourceEntry = lcpResourceEntry;
                }
            }
        }
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [LCP](https://web.dev/articles/lcp) value for the current page and
     * calls the `callback` function once the value is ready (along with the
     * relevant `largest-contentful-paint` performance entry used to determine the
     * value). The reported value is a `DOMHighResTimeStamp`.
     *
     * If the `reportAllChanges` configuration option is set to `true`, the
     * `callback` function will be called any time a new `largest-contentful-paint`
     * performance entry is dispatched, or once the final value of the metric has
     * been determined.
     */
    const onLCP$1 = (onReport, opts) => {
        onLCP$2((metric) => {
            const metricWithAttribution = attributeLCP(metric);
            onReport(metricWithAttribution);
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const attributeTTFB = (metric) => {
        // Use a default object if no other attribution has been set.
        let attribution = {
            waitingDuration: 0,
            cacheDuration: 0,
            dnsDuration: 0,
            connectionDuration: 0,
            requestDuration: 0,
        };
        if (metric.entries.length) {
            const navigationEntry = metric.entries[0];
            const activationStart = navigationEntry.activationStart || 0;
            // Measure from workerStart or fetchStart so any service worker startup
            // time is included in cacheDuration (which also includes other sw time
            // anyway, that cannot be accurately split out cross-browser).
            const waitEnd = Math.max((navigationEntry.workerStart || navigationEntry.fetchStart) -
                activationStart, 0);
            const dnsStart = Math.max(navigationEntry.domainLookupStart - activationStart, 0);
            const connectStart = Math.max(navigationEntry.connectStart - activationStart, 0);
            const connectEnd = Math.max(navigationEntry.connectEnd - activationStart, 0);
            attribution = {
                waitingDuration: waitEnd,
                cacheDuration: dnsStart - waitEnd,
                // dnsEnd usually equals connectStart but use connectStart over dnsEnd
                // for dnsDuration in case there ever is a gap.
                dnsDuration: connectStart - dnsStart,
                connectionDuration: connectEnd - connectStart,
                // There is often a gap between connectEnd and requestStart. Attribute
                // that to requestDuration so connectionDuration remains 0 for
                // service worker controlled requests were connectStart and connectEnd
                // are the same.
                requestDuration: metric.value - connectEnd,
                navigationEntry: navigationEntry,
            };
        }
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [TTFB](https://web.dev/articles/ttfb) value for the
     * current page and calls the `callback` function once the page has loaded,
     * along with the relevant `navigation` performance entry used to determine the
     * value. The reported value is a `DOMHighResTimeStamp`.
     *
     * Note, this function waits until after the page is loaded to call `callback`
     * in order to ensure all properties of the `navigation` entry are populated.
     * This is useful if you want to report on other metrics exposed by the
     * [Navigation Timing API](https://w3c.github.io/navigation-timing/). For
     * example, the TTFB metric starts from the page's [time
     * origin](https://www.w3.org/TR/hr-time-2/#sec-time-origin), which means it
     * includes time spent on DNS lookup, connection negotiation, network latency,
     * and server processing time.
     */
    const onTTFB = (onReport, opts) => {
        onTTFB$1((metric) => {
            const metricWithAttribution = attributeTTFB(metric);
            onReport(metricWithAttribution);
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const attributeFID = (metric) => {
        const fidEntry = metric.entries[0];
        const attribution = {
            eventTarget: getSelector(fidEntry.target),
            eventType: fidEntry.name,
            eventTime: fidEntry.startTime,
            eventEntry: fidEntry,
            loadState: getLoadState(fidEntry.startTime),
        };
        // Use Object.assign to set property to keep tsc happy.
        const metricWithAttribution = Object.assign(metric, { attribution });
        return metricWithAttribution;
    };
    /**
     * Calculates the [FID](https://web.dev/articles/fid) value for the current page and
     * calls the `callback` function once the value is ready, along with the
     * relevant `first-input` performance entry used to determine the value. The
     * reported value is a `DOMHighResTimeStamp`.
     *
     * _**Important:** since FID is only reported after the user interacts with the
     * page, it's possible that it will not be reported for some page loads._
     */
    const onFID = (onReport, opts) => {
        onFID$1((metric) => {
            const metricWithAttribution = attributeFID(metric);
            onReport(metricWithAttribution);
        }, opts);
    };

    /*
     * Copyright 2022 Google LLC
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     https://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    var index = /*#__PURE__*/Object.freeze({
        __proto__: null,
        onCLS: onCLS$1,
        onFCP: onFCP,
        onINP: onINP$1,
        onLCP: onLCP$1,
        onTTFB: onTTFB,
        CLSThresholds: CLSThresholds,
        FCPThresholds: FCPThresholds,
        INPThresholds: INPThresholds,
        LCPThresholds: LCPThresholds,
        TTFBThresholds: TTFBThresholds,
        onFID: onFID,
        FIDThresholds: FIDThresholds
    });

    // Copyright 2024 The Chromium Authors. All rights reserved.
    function valueToRating(score) {
        if (score < INPThresholds[0]) {
            return 'good';
        }
        if (score <= INPThresholds[1]) {
            return 'needs-improvement';
        }
        return 'poor';
    }
    function onEachInteraction$1(callback) {
        const eventObserver = new PerformanceObserver(list => {
            const entries = list.getEntries();
            const interactions = new Map();
            const performanceEventTimings = entries.filter((entry) => 'interactionId' in entry)
                .filter(entry => entry.interactionId);
            for (const entry of performanceEventTimings) {
                const interaction = interactions.get(entry.interactionId) || [];
                interaction.push(entry);
                interactions.set(entry.interactionId, interaction);
            }
            // Will report as a single interaction even if parts are in separate frames.
            // Consider splitting by animation frame.
            for (const [interactionId, interaction] of interactions.entries()) {
                const longestEntry = interaction.reduce((prev, curr) => prev.duration >= curr.duration ? prev : curr);
                const value = longestEntry.duration;
                const firstEntryWithTarget = interaction.find(entry => entry.target);
                callback({
                    attribution: {
                        interactionTargetElement: firstEntryWithTarget?.target ?? null,
                        interactionTime: longestEntry.startTime,
                        interactionType: longestEntry.name.startsWith('key') ? 'keyboard' : 'pointer',
                        interactionId,
                    },
                    entries: interaction,
                    rating: valueToRating(value),
                    value,
                });
            }
        });
        eventObserver.observe({
            type: 'first-input',
            buffered: true,
        });
        eventObserver.observe({
            type: 'event',
            durationThreshold: 0,
            buffered: true,
        });
    }

    var OnEachInteraction = /*#__PURE__*/Object.freeze({
        __proto__: null,
        onEachInteraction: onEachInteraction$1
    });

    // Copyright 2024 The Chromium Authors. All rights reserved.
    // Use of this source code is governed by a BSD-style license that can be
    // found in the LICENSE file.
    const EVENT_BINDING_NAME = '__chromium_devtools_metrics_reporter';

    // Copyright 2024 The Chromium Authors. All rights reserved.
    const { onLCP, onCLS, onINP } = index;
    const { onEachInteraction } = OnEachInteraction;
    function sendEventToDevTools(event) {
        const payload = JSON.stringify(event);
        window[EVENT_BINDING_NAME](payload);
    }
    const nodeList = [];
    function establishNodeIndex(node) {
        const index = nodeList.length;
        nodeList.push(node);
        return index;
    }
    /**
     * The data sent over the event binding needs to be JSON serializable, so we
     * can't send DOM nodes directly. Instead we create an ID for each node (see
     * `establishNodeIndex`) that we can later use to retrieve a remote object
     * for that node.
     *
     * This function is used by `Runtime.evaluate` calls to get a remote object
     * for the specified index.
     */
    window.getNodeForIndex = (index) => {
        return nodeList[index];
    };
    function inIframe() {
        try {
            return window.self !== window.top;
        }
        catch {
            return true;
        }
    }
    function initialize() {
        // `Page.addScriptToEvaluateOnNewDocument` will create a script that runs
        // in all frames. We only want metrics from the main frame so the filter
        // has to be here.
        if (inIframe()) {
            return;
        }
        sendEventToDevTools({ name: 'reset' });
        // We want to treat bfcache navigations like a standard navigations, so emit
        // a reset event when bfcache is restored.
        //
        // Metric functions will also re-emit their values using this listener's callback.
        // To ensure this event is fired before those values are emitted, register this
        // callback before any others.
        onBFCacheRestore(() => {
            sendEventToDevTools({ name: 'reset' });
        });
        onLCP(metric => {
            const event = {
                name: 'LCP',
                value: metric.value,
                rating: metric.rating,
            };
            const element = metric.attribution.lcpEntry?.element;
            if (element) {
                event.nodeIndex = establishNodeIndex(element);
            }
            sendEventToDevTools(event);
        }, { reportAllChanges: true });
        onCLS(metric => {
            const event = {
                name: 'CLS',
                value: metric.value,
                rating: metric.rating,
            };
            sendEventToDevTools(event);
        }, { reportAllChanges: true });
        onINP(metric => {
            const event = {
                name: 'INP',
                value: metric.value,
                rating: metric.rating,
                interactionType: metric.attribution.interactionType,
            };
            const element = metric.attribution.interactionTargetElement;
            if (element) {
                event.nodeIndex = establishNodeIndex(element);
            }
            sendEventToDevTools(event);
        }, { reportAllChanges: true });
        onEachInteraction(interaction => {
            const event = {
                name: 'Interaction',
                duration: interaction.value,
                rating: interaction.rating,
                interactionId: interaction.attribution.interactionId,
                interactionType: interaction.attribution.interactionType,
            };
            const node = interaction.attribution.interactionTargetElement;
            if (node) {
                event.nodeIndex = establishNodeIndex(node);
            }
            sendEventToDevTools(event);
        });
    }
    initialize();

})();
