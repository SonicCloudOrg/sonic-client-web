// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
 * Copyright (C) 2012 Intel Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Google Inc. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as Platform from '../../core/platform/platform.js';
import * as Root from '../../core/root/root.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Bindings from '../../models/bindings/bindings.js';
import * as TimelineModel from '../../models/timeline_model/timeline_model.js';
import * as TraceEngine from '../../models/trace/trace.js';
import * as ModificationsManager from '../../services/modifications_manager/modifications_manager.js';
import * as TraceBounds from '../../services/trace_bounds/trace_bounds.js';
import * as CodeHighlighter from '../../ui/components/code_highlighter/code_highlighter.js';
// eslint-disable-next-line rulesdir/es_modules_import
import codeHighlighterStyles from '../../ui/components/code_highlighter/codeHighlighter.css.js';
import * as PerfUI from '../../ui/legacy/components/perf_ui/perf_ui.js';
// eslint-disable-next-line rulesdir/es_modules_import
import imagePreviewStyles from '../../ui/legacy/components/utils/imagePreview.css.js';
import * as LegacyComponents from '../../ui/legacy/components/utils/utils.js';
// eslint-disable-next-line rulesdir/es_modules_import
import inspectorCommonStyles from '../../ui/legacy/inspectorCommon.css.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { CLSRect } from './CLSLinkifier.js';
import * as TimelineComponents from './components/components.js';
import { getCategoryStyles, getEventStyle, TimelineRecordStyle, visibleTypes, } from './EventUICategory.js';
import * as Extensions from './extensions/extensions.js';
import { Tracker } from './FreshRecording.js';
import { titleForInteractionEvent } from './InteractionsTrackAppender.js';
import { SourceMapsResolver } from './SourceMapsResolver.js';
import { targetForEvent } from './TargetForEvent.js';
import { TimelinePanel } from './TimelinePanel.js';
import { TimelineSelection } from './TimelineSelection.js';
const UIStrings = {
    /**
     *@description Text that only contain a placeholder
     *@example {100ms (at 200ms)} PH1
     */
    emptyPlaceholder: '{PH1}', // eslint-disable-line rulesdir/l10n_no_locked_or_placeholder_only_phrase
    /**
     *@description Text that refers to updated priority of network request
     */
    initialPriority: 'Initial Priority',
    /**
     *@description Text for timestamps of items
     */
    timestamp: 'Timestamp',
    /**
     *@description Text shown next to the interaction event's ID in the detail view.
     */
    interactionID: 'ID',
    /**
     *@description Text shown next to the interaction event's input delay time in the detail view.
     */
    inputDelay: 'Input delay',
    /**
     *@description Text shown next to the interaction event's thread processing duration in the detail view.
     */
    processingDuration: 'Processing duration',
    /**
     *@description Text shown next to the interaction event's presentation delay time in the detail view.
     */
    presentationDelay: 'Presentation delay',
    /**
     *@description Text shown when the user has selected an event that represents script compiliation.
     */
    compile: 'Compile',
    /**
     *@description Text shown when the user selects an event that represents script parsing.
     */
    parse: 'Parse',
    /**
     *@description Text with two placeholders separated by a colon
     *@example {Node removed} PH1
     *@example {div#id1} PH2
     */
    sS: '{PH1}: {PH2}',
    /**
     *@description Details text used to show the amount of data collected.
     *@example {30 MB} PH1
     */
    sCollected: '{PH1} collected',
    /**
     *@description Text used to show a URL to a script and the relevant line numbers.
     *@example {https://example.com/foo.js} PH1
     *@example {2} PH2
     *@example {4} PH3
     */
    sSs: '{PH1} [{PH2}…{PH3}]',
    /**
     *@description Text used to show a URL to a script and the starting line
     *             number - used when there is no end line number available.
     *@example {https://example.com/foo.js} PH1
     *@example {2} PH2
     */
    sSSquareBrackets: '{PH1} [{PH2}…]',
    /**
     *@description Text that is usually a hyperlink to more documentation
     */
    learnMore: 'Learn more',
    /**
     *@description Text referring to the status of the browser's compilation cache.
     */
    compilationCacheStatus: 'Compilation cache status',
    /**
     *@description Text referring to the size of the browser's compiliation cache.
     */
    compilationCacheSize: 'Compilation cache size',
    /**
     *@description Text in Timeline UIUtils of the Performance panel. "Compilation
     * cache" refers to the code cache described at
     * https://v8.dev/blog/code-caching-for-devs . This label is followed by the
     * type of code cache data used, either "normal" or "full" as described in the
     * linked article.
     */
    compilationCacheKind: 'Compilation cache kind',
    /**
     *@description Text used to inform the user that the script they are looking
     *             at was loaded from the browser's cache.
     */
    scriptLoadedFromCache: 'script loaded from cache',
    /**
     *@description Text to inform the user that the script they are looking at
     *             was unable to be loaded from the browser's cache.
     */
    failedToLoadScriptFromCache: 'failed to load script from cache',
    /**
     *@description Text to inform the user that the script they are looking at was not eligible to be loaded from the browser's cache.
     */
    scriptNotEligibleToBeLoadedFromCache: 'script not eligible',
    /**
     *@description Text for the total time of something
     */
    totalTime: 'Total Time',
    /**
     *@description Time of a single activity, as opposed to the total time
     */
    selfTime: 'Self Time',
    /**
     *@description Label in the summary view in the Performance panel for a number which indicates how much managed memory has been reclaimed by performing Garbage Collection
     */
    collected: 'Collected',
    /**
     *@description Text for a programming function
     */
    function: 'Function',
    /**
     *@description Text for referring to the ID of a timer.
     */
    timerId: 'Timer ID',
    /**
     *@description Text for referring to a timer that has timed-out and therefore is being removed.
     */
    timeout: 'Timeout',
    /**
     *@description Text used to indicate that a timer is repeating (e.g. every X seconds) rather than a one off.
     */
    repeats: 'Repeats',
    /**
     *@description Text for referring to the ID of a callback function installed by an event.
     */
    callbackId: 'Callback ID',
    /**
     *@description Text that refers to the network request method
     */
    requestMethod: 'Request Method',
    /**
     *@description Text to show the priority of an item
     */
    priority: 'Priority',
    /**
     *@description Text used when referring to the data sent in a network request that is encoded as a particular file format.
     */
    encodedData: 'Encoded Data',
    /**
     *@description Text used to refer to the data sent in a network request that has been decoded.
     */
    decodedBody: 'Decoded Body',
    /**
     *@description Text for a module, the programming concept
     */
    module: 'Module',
    /**
     *@description Label for a group of JavaScript files
     */
    script: 'Script',
    /**
     *@description Text used to tell a user that a compilation trace event was streamed.
     */
    streamed: 'Streamed',
    /**
     *@description Text to indicate if a compilation event was eager.
     */
    eagerCompile: 'Compiling all functions eagerly',
    /**
     *@description Text to refer to the URL associated with a given event.
     */
    url: 'Url',
    /**
     *@description Text to indicate to the user the size of the cache (as a filesize - e.g. 5mb).
     */
    producedCacheSize: 'Produced Cache Size',
    /**
     *@description Text to indicate to the user the amount of the cache (as a filesize - e.g. 5mb) that has been used.
     */
    consumedCacheSize: 'Consumed Cache Size',
    /**
     *@description Title for a group of cities
     */
    location: 'Location',
    /**
     *@description Text used to show a coordinate pair (e.g. (3, 2)).
     *@example {2} PH1
     *@example {2} PH2
     */
    sSCurlyBrackets: '({PH1}, {PH2})',
    /**
     *@description Text used to indicate to the user they are looking at the physical dimensions of a shape that was drawn by the browser.
     */
    dimensions: 'Dimensions',
    /**
     *@description Text used to show the user the dimensions of a shape and indicate its area (e.g. 3x2).
     *@example {2} PH1
     *@example {2} PH2
     */
    sSDimensions: '{PH1} × {PH2}',
    /**
     *@description Related node label in Timeline UIUtils of the Performance panel
     */
    layerRoot: 'Layer Root',
    /**
     *@description Related node label in Timeline UIUtils of the Performance panel
     */
    ownerElement: 'Owner Element',
    /**
     *@description Text used to show the user the URL of the image they are viewing.
     */
    imageUrl: 'Image URL',
    /**
     *@description Text used to show the user that the URL they are viewing is loading a CSS stylesheet.
     */
    stylesheetUrl: 'Stylesheet URL',
    /**
     *@description Text used next to a number to show the user how many elements were affected.
     */
    elementsAffected: 'Elements Affected',
    /**
     *@description Text used next to a number to show the user how many nodes required the browser to update and re-layout the page.
     */
    nodesThatNeedLayout: 'Nodes That Need Layout',
    /**
     *@description Text used to show the amount in a subset - e.g. "2 of 10".
     *@example {2} PH1
     *@example {10} PH2
     */
    sOfS: '{PH1} of {PH2}',
    /**
     *@description Related node label in Timeline UIUtils of the Performance panel
     */
    layoutRoot: 'Layout root',
    /**
     *@description Text used when viewing an event that can have a custom message attached.
     */
    message: 'Message',
    /**
     *@description Text used to tell the user they are viewing an event that has a function embedded in it, which is referred to as the "callback function".
     */
    callbackFunction: 'Callback Function',
    /**
     *@description The current state of an item
     */
    state: 'State',
    /**
     *@description Text used to show the relevant range of a file - e.g. "lines 2-10".
     */
    range: 'Range',
    /**
     *@description Text used to refer to the amount of time some event or code was given to complete within.
     */
    allottedTime: 'Allotted Time',
    /**
     *@description Text used to tell a user that a particular event or function was automatically run by a timeout.
     */
    invokedByTimeout: 'Invoked by Timeout',
    /**
     *@description Text that refers to some types
     */
    type: 'Type',
    /**
     *@description Text for the size of something
     */
    size: 'Size',
    /**
     *@description Text for the details of something
     */
    details: 'Details',
    /**
     *@description Title in Timeline for Cumulative Layout Shifts
     */
    cumulativeLayoutShifts: 'Cumulative Layout Shifts',
    /**
     *@description Text for the link to the evolved CLS website
     */
    evolvedClsLink: 'evolved',
    /**
     *@description Warning in Timeline that CLS can cause a poor user experience. It contains a link to inform developers about the recent changes to how CLS is measured. The new CLS metric is said to have evolved from the previous version.
     *@example {Link to web.dev/metrics} PH1
     *@example {Link to web.dev/evolving-cls which will always have the text 'evolved'} PH2
     */
    sCLSInformation: '{PH1} can result in poor user experiences. It has recently {PH2}.',
    /**
     *@description Text to indicate an item is a warning
     */
    warning: 'Warning',
    /**
     *@description Title for the Timeline CLS Score
     */
    score: 'Score',
    /**
     *@description Text in Timeline for the cumulative CLS score
     */
    cumulativeScore: 'Cumulative Score',
    /**
     *@description Text in Timeline for the current CLS score
     */
    currentClusterScore: 'Current Cluster Score',
    /**
     *@description Text in Timeline for the current CLS cluster
     */
    currentClusterId: 'Current Cluster ID',
    /**
     *@description Text in Timeline for whether input happened recently
     */
    hadRecentInput: 'Had recent input',
    /**
     *@description Text in Timeline indicating that input has happened recently
     */
    yes: 'Yes',
    /**
     *@description Text in Timeline indicating that input has not happened recently
     */
    no: 'No',
    /**
     *@description Label for Cumulative Layout records, indicating where they moved from
     */
    movedFrom: 'Moved from',
    /**
     *@description Label for Cumulative Layout records, indicating where they moved to
     */
    movedTo: 'Moved to',
    /**
     *@description Text that indicates a particular HTML element or node is related to what the user is viewing.
     */
    relatedNode: 'Related Node',
    /**
     *@description Text for previewing items
     */
    preview: 'Preview',
    /**
     *@description Text used to refer to the total time summed up across multiple events.
     */
    aggregatedTime: 'Aggregated Time',
    /**
     *@description Text to indicate to the user they are viewing an event representing a network request.
     */
    networkRequest: 'Network request',
    /**
     *@description Text used to indicate if a network request was loaded from the cache.
     */
    loadFromCache: 'load from cache',
    /**
     *@description Text used to indicate if a network request was transferred over the network (rather than being loaded from the cache.)
     */
    networkTransfer: 'network transfer',
    /**
     *@description Text used to show the total time a network request spent loading a resource.
     *@example {1ms} PH1
     *@example {network transfer} PH2
     *@example {1ms} PH3
     */
    SSSResourceLoading: ' ({PH1} {PH2} + {PH3} resource loading)',
    /**
     *@description Text for the duration of something
     */
    duration: 'Duration',
    /**
     *@description Text used to show the mime-type of the data transferred with a network request (e.g. "application/json").
     */
    mimeType: 'Mime Type',
    /**
     *@description Text used to show the user that a request was served from the browser's in-memory cache.
     */
    FromMemoryCache: ' (from memory cache)',
    /**
     *@description Text used to show the user that a request was served from the browser's file cache.
     */
    FromCache: ' (from cache)',
    /**
     *@description Label for a network request indicating that it was a HTTP2 server push instead of a regular network request, in the Performance panel
     */
    FromPush: ' (from push)',
    /**
     *@description Text used to show a user that a request was served from an installed, active service worker.
     */
    FromServiceWorker: ' (from `service worker`)',
    /**
     *@description Text for the stack trace of the initiator of something. The Initiator is the event or factor that directly triggered or precipitated a subsequent action.
     */
    initiatorStackTrace: 'Initiator Stack Trace',
    /**
     *@description Text for the event initiated by another one
     */
    initiatedBy: 'Initiated by',
    /**
     *@description Text for the event that is an initiator for another one
     */
    initiatorFor: 'Initiator for',
    /**
     *@description Text for the underlying data behing a specific flamechart selection. Trace events are the browser instrumentation that are emitted as JSON objects.
     */
    traceEvent: 'Trace Event',
    /**
     *@description Call site stack label in Timeline UIUtils of the Performance panel
     */
    timerInstalled: 'Timer Installed',
    /**
     *@description Call site stack label in Timeline UIUtils of the Performance panel
     */
    animationFrameRequested: 'Animation Frame Requested',
    /**
     *@description Call site stack label in Timeline UIUtils of the Performance panel
     */
    idleCallbackRequested: 'Idle Callback Requested',
    /**
     *@description Stack label in Timeline UIUtils of the Performance panel
     */
    recalculationForced: 'Recalculation Forced',
    /**
     *@description Call site stack label in Timeline UIUtils of the Performance panel
     */
    firstLayoutInvalidation: 'First Layout Invalidation',
    /**
     *@description Stack label in Timeline UIUtils of the Performance panel
     */
    layoutForced: 'Layout Forced',
    /**
     *@description Text for the execution stack trace
     */
    stackTrace: 'Stack Trace',
    /**
     *@description Text used to show any invalidations for a particular event that caused the browser to have to do more work to update the page.
     */
    invalidations: 'Invalidations',
    /**
     * @description Text in Timeline UIUtils of the Performance panel. Phrase is followed by a number of milliseconds.
     * Some events or tasks might have been only started, but have not ended yet. Such events or tasks are considered
     * "pending".
     */
    pendingFor: 'Pending for',
    /**
     *@description Noun label for a stack trace which indicates the first time some condition was invalidated.
     */
    firstInvalidated: 'First Invalidated',
    /**
     *@description Title of the paint profiler, old name of the performance pane
     */
    paintProfiler: 'Paint Profiler',
    /**
     *@description Text in Timeline Flame Chart View of the Performance panel
     *@example {Frame} PH1
     *@example {10ms} PH2
     */
    sAtS: '{PH1} at {PH2}',
    /**
     *@description Text used next to a time to indicate that the particular event took that much time itself. In context this might look like "3ms blink.console (self)"
     *@example {blink.console} PH1
     */
    sSelf: '{PH1} (self)',
    /**
     *@description Text used next to a time to indicate that the event's children took that much time. In context this might look like "3ms blink.console (children)"
     *@example {blink.console} PH1
     */
    sChildren: '{PH1} (children)',
    /**
     *@description Text used to show the user how much time the browser spent on rendering (drawing the page onto the screen).
     */
    timeSpentInRendering: 'Time spent in rendering',
    /**
     *@description Text for a rendering frame
     */
    frame: 'Frame',
    /**
     *@description Text used to refer to the duration of an event at a given offset - e.g. "2ms at 10ms" which can be read as "2ms starting after 10ms".
     *@example {10ms} PH1
     *@example {10ms} PH2
     */
    sAtSParentheses: '{PH1} (at {PH2})',
    /**
     *@description Text of a DOM element in Timeline UIUtils of the Performance panel
     */
    UnknownNode: '[ unknown node ]',
    /**
     *@description Text used to refer to a particular element and the file it was referred to in.
     *@example {node} PH1
     *@example {app.js} PH2
     */
    invalidationWithCallFrame: '{PH1} at {PH2}',
    /**
     *@description Text indicating that something is outside of the Performace Panel Timeline Minimap range
     */
    outsideBreadcrumbRange: '(outside of the breadcrumb range)',
    /**
     *@description Text indicating that something is hidden from the Performace Panel Timeline
     */
    entryIsHidden: '(entry is hidden)',
    /**
     * @description Title of a row in the details view for a `Recalculate Styles` event that contains more info about selector stats tracing.
     */
    selectorStatsTitle: 'Selector Stats',
    /**
     * @description Info text that explains to the user how to enable selector stats tracing.
     * @example {Setting Name} PH1
     */
    sSelectorStatsInfo: 'Select "{PH1}" to collect detailed CSS selector matching statistics.',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/TimelineUIUtils.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let eventDispatchDesciptors;
let colorGenerator;
const requestPreviewElements = new WeakMap();
export class TimelineUIUtils {
    static frameDisplayName(frame) {
        if (!TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.isNativeRuntimeFrame(frame)) {
            return UI.UIUtils.beautifyFunctionName(frame.functionName);
        }
        const nativeGroup = TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.nativeGroup(frame.functionName);
        switch (nativeGroup) {
            case "Compile" /* TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.NativeGroups.Compile */:
                return i18nString(UIStrings.compile);
            case "Parse" /* TimelineModel.TimelineJSProfile.TimelineJSProfileProcessor.NativeGroups.Parse */:
                return i18nString(UIStrings.parse);
        }
        return frame.functionName;
    }
    static testContentMatching(traceEvent, regExp, traceParsedData) {
        const title = TimelineUIUtils.eventStyle(traceEvent).title;
        const tokens = [title];
        if (TraceEngine.Types.TraceEvents.isProfileCall(traceEvent)) {
            // In the future this case will not be possible - wherever we call this
            // function we will be able to pass in the data from the new engine. But
            // currently this is called in a variety of places including from the
            // legacy model which does not have a reference to the new engine's data.
            // So if we are missing the data, we just fallback to the name from the
            // callFrame.
            if (!traceParsedData || !traceParsedData.Samples) {
                tokens.push(traceEvent.callFrame.functionName);
            }
            else {
                tokens.push(TraceEngine.Handlers.ModelHandlers.Samples.getProfileCallFunctionName(traceParsedData.Samples, traceEvent));
            }
        }
        if (traceParsedData) {
            const url = TraceEngine.Extras.URLForEntry.get(traceParsedData, traceEvent);
            if (url) {
                tokens.push(url);
            }
        }
        // This works for both legacy and new engine events.
        appendObjectProperties(traceEvent.args, 2);
        const result = tokens.join('|').match(regExp);
        return result ? result.length > 0 : false;
        function appendObjectProperties(object, depth) {
            if (!depth) {
                return;
            }
            for (const key in object) {
                const value = object[key];
                if (typeof value === 'string') {
                    tokens.push(value);
                }
                else if (typeof value === 'number') {
                    tokens.push(String(value));
                }
                else if (typeof value === 'object' && value !== null) {
                    appendObjectProperties(value, depth - 1);
                }
            }
        }
    }
    static eventStyle(event) {
        if (TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console) ||
            TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.UserTiming)) {
            return new TimelineRecordStyle(event.name, getCategoryStyles()['scripting']);
        }
        if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
            if (event.callFrame.functionName === '(idle)') {
                return new TimelineRecordStyle(event.name, getCategoryStyles().idle);
            }
        }
        const defaultStyles = new TimelineRecordStyle(event.name, getCategoryStyles().other);
        return getEventStyle(event.name) || defaultStyles;
    }
    static eventColor(event) {
        if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
            const frame = event.callFrame;
            if (TimelineUIUtils.isUserFrame(frame)) {
                return TimelineUIUtils.colorForId(frame.url);
            }
        }
        if (TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event)) {
            return Extensions.ExtensionUI.extensionEntryColor(event);
        }
        let parsedColor = TimelineUIUtils.eventStyle(event).category.getComputedColorValue();
        // This event is considered idle time but still rendered as a scripting event here
        // to connect the StreamingCompileScriptParsing events it belongs to.
        if (event.name === "v8.parseOnBackgroundWaiting" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScriptWaiting */) {
            parsedColor = getCategoryStyles().scripting.getComputedColorValue();
            if (!parsedColor) {
                throw new Error('Unable to parse color from getCategoryStyles().scripting.color');
            }
        }
        return parsedColor;
    }
    static eventTitle(event) {
        // Profile call events do not have a args.data property, thus, we
        // need to check for profile calls in the beginning of this
        // function.
        if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
            const maybeResolvedName = SourceMapsResolver.resolvedNodeNameForEntry(event);
            const displayName = maybeResolvedName || TimelineUIUtils.frameDisplayName(event.callFrame);
            return displayName;
        }
        if (event.name === 'EventTiming' && TraceEngine.Types.TraceEvents.isSyntheticInteractionEvent(event)) {
            return titleForInteractionEvent(event);
        }
        const title = TimelineUIUtils.eventStyle(event).title;
        if (TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console)) {
            return title;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventTimeStamp(event)) {
            return i18nString(UIStrings.sS, { PH1: title, PH2: event.args.data.message });
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventAnimation(event) && event.args.data.name) {
            return i18nString(UIStrings.sS, { PH1: title, PH2: event.args.data.name });
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventDispatch(event)) {
            return i18nString(UIStrings.sS, { PH1: title, PH2: event.args.data.type });
        }
        return title;
    }
    static isUserFrame(frame) {
        return frame.scriptId !== '0' && !(frame.url && frame.url.startsWith('native '));
    }
    static syntheticNetworkRequestCategory(request) {
        switch (request.args.data.mimeType) {
            case 'text/html':
                return "HTML" /* NetworkCategory.HTML */;
            case 'application/javascript':
            case 'application/x-javascript':
            case 'text/javascript':
                return "Script" /* NetworkCategory.Script */;
            case 'text/css':
                return "Style" /* NetworkCategory.Style */;
            case 'audio/ogg':
            case 'image/gif':
            case 'image/jpeg':
            case 'image/png':
            case 'image/svg+xml':
            case 'image/webp':
            case 'image/x-icon':
            case 'font/opentype':
            case 'font/woff2':
            case 'font/ttf':
            case 'application/font-woff':
                return "Media" /* NetworkCategory.Media */;
            default:
                return "Other" /* NetworkCategory.Other */;
        }
    }
    static networkCategoryColor(category) {
        let cssVarName = '--app-color-system';
        switch (category) {
            case "HTML" /* NetworkCategory.HTML */:
                cssVarName = '--app-color-loading';
                break;
            case "Script" /* NetworkCategory.Script */:
                cssVarName = '--app-color-scripting';
                break;
            case "Style" /* NetworkCategory.Style */:
                cssVarName = '--app-color-rendering';
                break;
            case "Media" /* NetworkCategory.Media */:
                cssVarName = '--app-color-painting';
                break;
            default:
                cssVarName = '--app-color-system';
                break;
        }
        return ThemeSupport.ThemeSupport.instance().getComputedValue(cssVarName);
    }
    static async buildDetailsTextForTraceEvent(event, traceParsedData) {
        let detailsText;
        // TODO(40287735): update this code with type-safe data checks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventArgs = event.args;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventData = event.args?.data;
        switch (event.name) {
            case "GCEvent" /* TraceEngine.Types.TraceEvents.KnownEventName.GC */:
            case "MajorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MajorGC */:
            case "MinorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MinorGC */: {
                const delta = unsafeEventArgs['usedHeapSizeBefore'] - unsafeEventArgs['usedHeapSizeAfter'];
                detailsText = i18nString(UIStrings.sCollected, { PH1: Platform.NumberUtilities.bytesToString(delta) });
                break;
            }
            case "FunctionCall" /* TraceEngine.Types.TraceEvents.KnownEventName.FunctionCall */: {
                const { lineNumber, columnNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                if (lineNumber !== undefined && columnNumber !== undefined) {
                    detailsText = unsafeEventData.url + ':' + (lineNumber + 1) + ':' + (columnNumber + 1);
                }
                break;
            }
            case "EventDispatch" /* TraceEngine.Types.TraceEvents.KnownEventName.EventDispatch */:
                detailsText = unsafeEventData ? unsafeEventData['type'] : null;
                break;
            case "Paint" /* TraceEngine.Types.TraceEvents.KnownEventName.Paint */: {
                const width = TimelineUIUtils.quadWidth(unsafeEventData.clip);
                const height = TimelineUIUtils.quadHeight(unsafeEventData.clip);
                if (width && height) {
                    detailsText = i18nString(UIStrings.sSDimensions, { PH1: width, PH2: height });
                }
                break;
            }
            case "ParseHTML" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseHTML */: {
                const startLine = unsafeEventArgs['beginData']['startLine'];
                const endLine = unsafeEventArgs['endData'] && unsafeEventArgs['endData']['endLine'];
                const url = Bindings.ResourceUtils.displayNameForURL(unsafeEventArgs['beginData']['url']);
                if (endLine >= 0) {
                    detailsText = i18nString(UIStrings.sSs, { PH1: url, PH2: startLine + 1, PH3: endLine + 1 });
                }
                else {
                    detailsText = i18nString(UIStrings.sSSquareBrackets, { PH1: url, PH2: startLine + 1 });
                }
                break;
            }
            case "V8.CompileModule" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileModule */:
            case "v8.produceModuleCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheModule */:
                detailsText = Bindings.ResourceUtils.displayNameForURL(unsafeEventArgs['fileName']);
                break;
            case "V8.CompileScript" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileScript */:
            case "v8.produceCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheScript */:
            case "EvaluateScript" /* TraceEngine.Types.TraceEvents.KnownEventName.EvaluateScript */: {
                const { lineNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                const url = unsafeEventData && unsafeEventData['url'];
                if (url) {
                    detailsText = Bindings.ResourceUtils.displayNameForURL(url) + ':' + ((lineNumber || 0) + 1);
                }
                break;
            }
            case "v8.wasm.compiledModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCompiledModule */:
            case "v8.wasm.moduleCacheHit" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheHit */: {
                const url = unsafeEventArgs['url'];
                if (url) {
                    detailsText = Bindings.ResourceUtils.displayNameForURL(url);
                }
                break;
            }
            case "v8.parseOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScript */:
            case "v8.deserializeOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.BackgroundDeserialize */:
            case "XHRReadyStateChange" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRReadyStateChange */:
            case "XHRLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRLoad */: {
                const url = unsafeEventData['url'];
                if (url) {
                    detailsText = Bindings.ResourceUtils.displayNameForURL(url);
                }
                break;
            }
            case "TimeStamp" /* TraceEngine.Types.TraceEvents.KnownEventName.TimeStamp */:
                detailsText = unsafeEventData['message'];
                break;
            case "WebSocketCreate" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketCreate */:
            case "WebSocketSendHandshakeRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSendHandshakeRequest */:
            case "WebSocketReceiveHandshakeResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceiveHandshakeResponse */:
            case "WebSocketSend" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSend */:
            case "WebSocketReceive" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceive */:
            case "WebSocketDestroy" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketDestroy */:
            case "ResourceWillSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceWillSendRequest */:
            case "ResourceSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceSendRequest */:
            case "ResourceReceivedData" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceivedData */:
            case "ResourceReceiveResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceiveResponse */:
            case "ResourceFinish" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceFinish */:
            case "PaintImage" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintImage */:
            case "Decode Image" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeImage */:
            case "Decode LazyPixelRef" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeLazyPixelRef */: {
                const url = TraceEngine.Extras.URLForEntry.get(traceParsedData, event);
                if (url) {
                    detailsText = Bindings.ResourceUtils.displayNameForURL(url);
                }
                break;
            }
            case "EmbedderCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.EmbedderCallback */:
                detailsText = unsafeEventData['callbackName'];
                break;
            case "Animation" /* TraceEngine.Types.TraceEvents.KnownEventName.Animation */:
                detailsText = unsafeEventData && unsafeEventData['name'];
                break;
            case "AsyncTask" /* TraceEngine.Types.TraceEvents.KnownEventName.AsyncTask */:
                detailsText = unsafeEventData ? unsafeEventData['name'] : null;
                break;
            default:
                if (TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console)) {
                    detailsText = null;
                }
                else {
                    detailsText = linkifyTopCallFrameAsText();
                }
                break;
        }
        return detailsText;
        function linkifyTopCallFrameAsText() {
            const frame = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(event)?.at(0) ?? null;
            if (!frame) {
                return null;
            }
            return frame.url + ':' + (frame.lineNumber + 1) + ':' + (frame.columnNumber + 1);
        }
    }
    static async buildDetailsNodeForTraceEvent(event, target, linkifier, isFreshRecording = false, traceParsedData) {
        let details = null;
        let detailsText;
        // TODO(40287735): update this code with type-safe data checks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventArgs = event.args;
        // TODO(40287735): update this code with type-safe data checks.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventData = event.args?.data;
        switch (event.name) {
            case "GCEvent" /* TraceEngine.Types.TraceEvents.KnownEventName.GC */:
            case "MajorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MajorGC */:
            case "MinorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MinorGC */:
            case "EventDispatch" /* TraceEngine.Types.TraceEvents.KnownEventName.EventDispatch */:
            case "Paint" /* TraceEngine.Types.TraceEvents.KnownEventName.Paint */:
            case "Animation" /* TraceEngine.Types.TraceEvents.KnownEventName.Animation */:
            case "EmbedderCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.EmbedderCallback */:
            case "ParseHTML" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseHTML */:
            case "v8.wasm.streamFromResponseCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmStreamFromResponseCallback */:
            case "v8.wasm.compiledModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCompiledModule */:
            case "v8.wasm.moduleCacheHit" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheHit */:
            case "v8.wasm.cachedModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCachedModule */:
            case "v8.wasm.moduleCacheInvalid" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheInvalid */:
            case "WebSocketCreate" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketCreate */:
            case "WebSocketSendHandshakeRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSendHandshakeRequest */:
            case "WebSocketReceiveHandshakeResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceiveHandshakeResponse */:
            case "WebSocketSend" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSend */:
            case "WebSocketReceive" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceive */:
            case "WebSocketDestroy" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketDestroy */: {
                detailsText = await TimelineUIUtils.buildDetailsTextForTraceEvent(event, traceParsedData);
                break;
            }
            case "PaintImage" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintImage */:
            case "Decode Image" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeImage */:
            case "Decode LazyPixelRef" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeLazyPixelRef */:
            case "XHRReadyStateChange" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRReadyStateChange */:
            case "XHRLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.XHRLoad */:
            case "ResourceWillSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceWillSendRequest */:
            case "ResourceSendRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceSendRequest */:
            case "ResourceReceivedData" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceivedData */:
            case "ResourceReceiveResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceReceiveResponse */:
            case "ResourceFinish" /* TraceEngine.Types.TraceEvents.KnownEventName.ResourceFinish */: {
                const url = TraceEngine.Extras.URLForEntry.get(traceParsedData, event);
                if (url) {
                    const options = {
                        tabStop: true,
                        showColumnNumber: false,
                        inlineFrameIndex: 0,
                    };
                    details = LegacyComponents.Linkifier.Linkifier.linkifyURL(url, options);
                }
                break;
            }
            case "FunctionCall" /* TraceEngine.Types.TraceEvents.KnownEventName.FunctionCall */: {
                details = document.createElement('span');
                // FunctionCall events have an args.data that could be a CallFrame, if all the details are present, so we check for that.
                if (TraceEngine.Types.TraceEvents.isTraceEventFunctionCall(event) && event.args.data &&
                    TraceEngine.Types.TraceEvents.objectIsTraceEventCallFrame(event.args.data)) {
                    UI.UIUtils.createTextChild(details, TimelineUIUtils.frameDisplayName({ ...event.args.data, scriptId: String(event.args.data.scriptId) }));
                }
                const { lineNumber, columnNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                const location = this.linkifyLocation({
                    scriptId: unsafeEventData['scriptId'],
                    url: unsafeEventData['url'],
                    lineNumber: lineNumber || 0,
                    columnNumber: columnNumber,
                    target,
                    isFreshRecording,
                    linkifier,
                });
                if (location) {
                    UI.UIUtils.createTextChild(details, ' @ ');
                    details.appendChild(location);
                }
                break;
            }
            case "V8.CompileModule" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileModule */:
            case "v8.produceModuleCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheModule */: {
                details = this.linkifyLocation({
                    scriptId: null,
                    url: unsafeEventArgs['fileName'],
                    lineNumber: 0,
                    columnNumber: 0,
                    target,
                    isFreshRecording,
                    linkifier,
                });
                break;
            }
            case "V8.CompileScript" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileScript */:
            case "v8.produceCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheScript */:
            case "EvaluateScript" /* TraceEngine.Types.TraceEvents.KnownEventName.EvaluateScript */: {
                const url = unsafeEventData['url'];
                if (url) {
                    const { lineNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                    details = this.linkifyLocation({
                        scriptId: null,
                        url,
                        lineNumber: lineNumber || 0,
                        columnNumber: 0,
                        target,
                        isFreshRecording,
                        linkifier,
                    });
                }
                break;
            }
            case "v8.deserializeOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.BackgroundDeserialize */:
            case "v8.parseOnBackground" /* TraceEngine.Types.TraceEvents.KnownEventName.StreamingCompileScript */: {
                const url = unsafeEventData['url'];
                if (url) {
                    details = this.linkifyLocation({ scriptId: null, url, lineNumber: 0, columnNumber: 0, target, isFreshRecording, linkifier });
                }
                break;
            }
            case "ProfileCall" /* TraceEngine.Types.TraceEvents.KnownEventName.ProfileCall */: {
                details = document.createElement('span');
                // This check is only added for convenience with the type checker.
                if (!TraceEngine.Types.TraceEvents.isProfileCall(event)) {
                    break;
                }
                const maybeResolvedName = SourceMapsResolver.resolvedNodeNameForEntry(event);
                const functionName = maybeResolvedName || TimelineUIUtils.frameDisplayName(event.callFrame);
                UI.UIUtils.createTextChild(details, functionName);
                const location = this.linkifyLocation({
                    scriptId: event.callFrame['scriptId'],
                    url: event.callFrame['url'],
                    lineNumber: event.callFrame['lineNumber'],
                    columnNumber: event.callFrame['columnNumber'],
                    target,
                    isFreshRecording,
                    linkifier,
                });
                if (location) {
                    UI.UIUtils.createTextChild(details, ' @ ');
                    details.appendChild(location);
                }
                break;
            }
            default: {
                if (TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console)) {
                    detailsText = null;
                }
                else {
                    details = this.linkifyTopCallFrame(event, target, linkifier, isFreshRecording) ?? null;
                }
                break;
            }
        }
        if (!details && detailsText) {
            details = document.createTextNode(detailsText);
        }
        return details;
    }
    static linkifyLocation(linkifyOptions) {
        const { scriptId, url, lineNumber, columnNumber, isFreshRecording, linkifier, target } = linkifyOptions;
        const options = {
            lineNumber,
            columnNumber,
            showColumnNumber: true,
            inlineFrameIndex: 0,
            className: 'timeline-details',
            tabStop: true,
        };
        if (isFreshRecording) {
            return linkifier.linkifyScriptLocation(target, scriptId, url, lineNumber, options);
        }
        return LegacyComponents.Linkifier.Linkifier.linkifyURL(url, options);
    }
    static linkifyTopCallFrame(event, target, linkifier, isFreshRecording = false) {
        let frame = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(event)?.[0];
        if (TraceEngine.Types.TraceEvents.isProfileCall(event)) {
            frame = event.callFrame;
        }
        if (!frame) {
            return null;
        }
        const options = {
            className: 'timeline-details',
            tabStop: true,
            inlineFrameIndex: 0,
            showColumnNumber: true,
            columnNumber: frame.columnNumber,
            lineNumber: frame.lineNumber,
        };
        if (isFreshRecording) {
            return linkifier.maybeLinkifyConsoleCallFrame(target, frame, { showColumnNumber: true, inlineFrameIndex: 0 });
        }
        return LegacyComponents.Linkifier.Linkifier.linkifyURL(frame.url, options);
    }
    static buildDetailsNodeForMarkerEvents(event) {
        let link = 'https://web.dev/user-centric-performance-metrics/';
        let name = 'page performance metrics';
        switch (event.name) {
            case "largestContentfulPaint::Candidate" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLCPCandidate */:
                link = 'https://web.dev/lcp/';
                name = 'largest contentful paint';
                break;
            case "firstContentfulPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFCP */:
                link = 'https://web.dev/first-contentful-paint/';
                name = 'first contentful paint';
                break;
            default:
                break;
        }
        const html = UI.Fragment.html `<div>${UI.XLink.XLink.create(link, i18nString(UIStrings.learnMore), undefined, undefined, 'learn-more')} about ${name}.</div>`;
        return html;
    }
    static buildConsumeCacheDetails(eventData, contentHelper) {
        if (typeof eventData.consumedCacheSize === 'number') {
            contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheStatus), i18nString(UIStrings.scriptLoadedFromCache));
            contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheSize), Platform.NumberUtilities.bytesToString(eventData.consumedCacheSize));
            const cacheKind = eventData.cacheKind;
            if (cacheKind) {
                contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheKind), cacheKind);
            }
        }
        else if ('cacheRejected' in eventData && eventData['cacheRejected']) {
            // Version mismatch or similar.
            contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheStatus), i18nString(UIStrings.failedToLoadScriptFromCache));
        }
        else {
            contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheStatus), i18nString(UIStrings.scriptNotEligibleToBeLoadedFromCache));
        }
    }
    static async buildTraceEventDetails(traceParseData, event, linkifier, detailed) {
        const maybeTarget = targetForEvent(traceParseData, event);
        const { duration, selfTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
        const relatedNodesMap = await TraceEngine.Extras.FetchNodes.extractRelatedDOMNodesFromEvent(traceParseData, event);
        if (maybeTarget) {
            // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
            if (typeof event[previewElementSymbol] === 'undefined') {
                let previewElement = null;
                const url = TraceEngine.Extras.URLForEntry.get(traceParseData, event);
                if (url) {
                    previewElement = await LegacyComponents.ImagePreview.ImagePreview.build(maybeTarget, url, false, {
                        imageAltText: LegacyComponents.ImagePreview.ImagePreview.defaultAltTextForImageURL(url),
                        precomputedFeatures: undefined,
                    });
                }
                else if (TraceEngine.Types.TraceEvents.isTraceEventPaint(event)) {
                    previewElement = await TimelineUIUtils.buildPicturePreviewContent(traceParseData, event, maybeTarget);
                }
                // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
                event[previewElementSymbol] = previewElement;
            }
        }
        if (TraceEngine.Types.TraceEvents.isSyntheticLayoutShift(event)) {
            // Ensure that there are no pie charts or extended info for layout shifts.
            detailed = false;
        }
        // This message may vary per event.name;
        let relatedNodeLabel;
        const contentHelper = new TimelineDetailsContentHelper(targetForEvent(traceParseData, event), linkifier);
        const defaultColorForEvent = this.eventColor(event);
        const isMarker = traceParseData && isMarkerEvent(traceParseData, event);
        const color = isMarker ? TimelineUIUtils.markerStyleForEvent(event).color : defaultColorForEvent;
        contentHelper.addSection(TimelineUIUtils.eventTitle(event), color);
        // TODO: as part of the removal of the old engine, produce a typesafe way
        // to look up args and data for events.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventArgs = event.args;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsafeEventData = event.args?.data;
        const initiator = traceParseData.Initiators.eventToInitiator.get(event) ?? null;
        const initiatorFor = traceParseData.Initiators.initiatorToEvents.get(event) ?? null;
        let url = null;
        if (traceParseData) {
            const warnings = TimelineComponents.DetailsView.buildWarningElementsForEvent(event, traceParseData);
            for (const warning of warnings) {
                contentHelper.appendElementRow(i18nString(UIStrings.warning), warning, true);
            }
        }
        if (detailed && !Number.isNaN(duration || 0)) {
            contentHelper.appendTextRow(i18nString(UIStrings.totalTime), i18n.TimeUtilities.millisToString(duration || 0, true));
            contentHelper.appendTextRow(i18nString(UIStrings.selfTime), i18n.TimeUtilities.millisToString(selfTime, true));
        }
        if (traceParseData.Meta.traceIsGeneric) {
            TimelineUIUtils.renderEventJson(event, contentHelper);
            return contentHelper.fragment;
        }
        if (TraceEngine.Types.TraceEvents.isTraceEventV8Compile(event)) {
            url = event.args.data?.url;
            if (url) {
                const { lineNumber, columnNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                contentHelper.appendLocationRow(i18nString(UIStrings.script), url, lineNumber || 0, columnNumber);
            }
            const isEager = Boolean(event.args.data?.eager);
            if (isEager) {
                contentHelper.appendTextRow(i18nString(UIStrings.eagerCompile), true);
            }
            const isStreamed = Boolean(event.args.data?.streamed);
            contentHelper.appendTextRow(i18nString(UIStrings.streamed), isStreamed + (isStreamed ? '' : `: ${event.args.data?.notStreamedReason || ''}`));
            if (event.args.data) {
                TimelineUIUtils.buildConsumeCacheDetails(event.args.data, contentHelper);
            }
        }
        if (TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event)) {
            for (const [key, value] of event.args.detailsPairs || []) {
                contentHelper.appendTextRow(key, value);
            }
        }
        const isFreshRecording = Boolean(traceParseData && Tracker.instance().recordingIsFresh(traceParseData));
        switch (event.name) {
            case "GCEvent" /* TraceEngine.Types.TraceEvents.KnownEventName.GC */:
            case "MajorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MajorGC */:
            case "MinorGC" /* TraceEngine.Types.TraceEvents.KnownEventName.MinorGC */: {
                const delta = unsafeEventArgs['usedHeapSizeBefore'] - unsafeEventArgs['usedHeapSizeAfter'];
                contentHelper.appendTextRow(i18nString(UIStrings.collected), Platform.NumberUtilities.bytesToString(delta));
                break;
            }
            case "ProfileCall" /* TraceEngine.Types.TraceEvents.KnownEventName.ProfileCall */:
            case "FunctionCall" /* TraceEngine.Types.TraceEvents.KnownEventName.FunctionCall */: {
                const detailsNode = await TimelineUIUtils.buildDetailsNodeForTraceEvent(event, targetForEvent(traceParseData, event), linkifier, isFreshRecording, traceParseData);
                if (detailsNode) {
                    contentHelper.appendElementRow(i18nString(UIStrings.function), detailsNode);
                }
                break;
            }
            case "TimerFire" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerFire */:
            case "TimerInstall" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerInstall */:
            case "TimerRemove" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerRemove */: {
                contentHelper.appendTextRow(i18nString(UIStrings.timerId), unsafeEventData.timerId);
                if (event.name === "TimerInstall" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerInstall */) {
                    contentHelper.appendTextRow(i18nString(UIStrings.timeout), i18n.TimeUtilities.millisToString(unsafeEventData['timeout']));
                    contentHelper.appendTextRow(i18nString(UIStrings.repeats), !unsafeEventData['singleShot']);
                }
                break;
            }
            case "FireAnimationFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.FireAnimationFrame */: {
                contentHelper.appendTextRow(i18nString(UIStrings.callbackId), unsafeEventData['id']);
                break;
            }
            case "V8.CompileModule" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileModule */: {
                contentHelper.appendLocationRow(i18nString(UIStrings.module), unsafeEventArgs['fileName'], 0);
                break;
            }
            case "V8.CompileScript" /* TraceEngine.Types.TraceEvents.KnownEventName.CompileScript */: {
                // This case is handled above
                break;
            }
            case "v8.produceModuleCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheModule */: {
                url = unsafeEventData && unsafeEventData['url'];
                contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheSize), Platform.NumberUtilities.bytesToString(unsafeEventData['producedCacheSize']));
                break;
            }
            case "v8.produceCache" /* TraceEngine.Types.TraceEvents.KnownEventName.CacheScript */: {
                url = unsafeEventData && unsafeEventData['url'];
                if (url) {
                    const { lineNumber, columnNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                    contentHelper.appendLocationRow(i18nString(UIStrings.script), url, lineNumber || 0, columnNumber);
                }
                contentHelper.appendTextRow(i18nString(UIStrings.compilationCacheSize), Platform.NumberUtilities.bytesToString(unsafeEventData['producedCacheSize']));
                break;
            }
            case "EvaluateScript" /* TraceEngine.Types.TraceEvents.KnownEventName.EvaluateScript */: {
                url = unsafeEventData && unsafeEventData['url'];
                if (url) {
                    const { lineNumber, columnNumber } = TraceEngine.Helpers.Trace.getZeroIndexedLineAndColumnForEvent(event);
                    contentHelper.appendLocationRow(i18nString(UIStrings.script), url, lineNumber || 0, columnNumber);
                }
                break;
            }
            case "v8.wasm.streamFromResponseCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmStreamFromResponseCallback */:
            case "v8.wasm.compiledModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCompiledModule */:
            case "v8.wasm.cachedModule" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmCachedModule */:
            case "v8.wasm.moduleCacheHit" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheHit */:
            case "v8.wasm.moduleCacheInvalid" /* TraceEngine.Types.TraceEvents.KnownEventName.WasmModuleCacheInvalid */: {
                if (unsafeEventData) {
                    url = unsafeEventArgs['url'];
                    if (url) {
                        contentHelper.appendTextRow(i18nString(UIStrings.url), url);
                    }
                    const producedCachedSize = unsafeEventArgs['producedCachedSize'];
                    if (producedCachedSize) {
                        contentHelper.appendTextRow(i18nString(UIStrings.producedCacheSize), producedCachedSize);
                    }
                    const consumedCachedSize = unsafeEventArgs['consumedCachedSize'];
                    if (consumedCachedSize) {
                        contentHelper.appendTextRow(i18nString(UIStrings.consumedCacheSize), consumedCachedSize);
                    }
                }
                break;
            }
            // @ts-ignore Fall-through intended.
            case "Paint" /* TraceEngine.Types.TraceEvents.KnownEventName.Paint */: {
                const clip = unsafeEventData['clip'];
                contentHelper.appendTextRow(i18nString(UIStrings.location), i18nString(UIStrings.sSCurlyBrackets, { PH1: clip[0], PH2: clip[1] }));
                const clipWidth = TimelineUIUtils.quadWidth(clip);
                const clipHeight = TimelineUIUtils.quadHeight(clip);
                contentHelper.appendTextRow(i18nString(UIStrings.dimensions), i18nString(UIStrings.sSDimensions, { PH1: clipWidth, PH2: clipHeight }));
            }
            case "PaintSetup" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintSetup */:
            case "Rasterize" /* TraceEngine.Types.TraceEvents.KnownEventName.Rasterize */:
            case "ScrollLayer" /* TraceEngine.Types.TraceEvents.KnownEventName.ScrollLayer */: {
                relatedNodeLabel = i18nString(UIStrings.layerRoot);
                break;
            }
            case "PaintImage" /* TraceEngine.Types.TraceEvents.KnownEventName.PaintImage */:
            case "Decode LazyPixelRef" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeLazyPixelRef */:
            case "Decode Image" /* TraceEngine.Types.TraceEvents.KnownEventName.DecodeImage */:
            case "Draw LazyPixelRef" /* TraceEngine.Types.TraceEvents.KnownEventName.DrawLazyPixelRef */: {
                relatedNodeLabel = i18nString(UIStrings.ownerElement);
                url = TraceEngine.Extras.URLForEntry.get(traceParseData, event);
                if (url) {
                    const options = {
                        tabStop: true,
                        showColumnNumber: false,
                        inlineFrameIndex: 0,
                    };
                    contentHelper.appendElementRow(i18nString(UIStrings.imageUrl), LegacyComponents.Linkifier.Linkifier.linkifyURL(url, options));
                }
                break;
            }
            case "ParseAuthorStyleSheet" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseAuthorStyleSheet */: {
                url = unsafeEventData['styleSheetUrl'];
                if (url) {
                    const options = {
                        tabStop: true,
                        showColumnNumber: false,
                        inlineFrameIndex: 0,
                    };
                    contentHelper.appendElementRow(i18nString(UIStrings.stylesheetUrl), LegacyComponents.Linkifier.Linkifier.linkifyURL(url, options));
                }
                break;
            }
            case "UpdateLayoutTree" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayoutTree */: {
                contentHelper.appendTextRow(i18nString(UIStrings.elementsAffected), unsafeEventArgs['elementCount']);
                const selectorStatsSetting = Common.Settings.Settings.instance().createSetting('timeline-capture-selector-stats', false);
                if (!selectorStatsSetting.get()) {
                    const note = document.createElement('span');
                    note.textContent = i18nString(UIStrings.sSelectorStatsInfo, { PH1: selectorStatsSetting.title() });
                    contentHelper.appendElementRow(i18nString(UIStrings.selectorStatsTitle), note);
                }
                break;
            }
            case "Layout" /* TraceEngine.Types.TraceEvents.KnownEventName.Layout */: {
                const beginData = unsafeEventArgs['beginData'];
                contentHelper.appendTextRow(i18nString(UIStrings.nodesThatNeedLayout), i18nString(UIStrings.sOfS, { PH1: beginData['dirtyObjects'], PH2: beginData['totalObjects'] }));
                relatedNodeLabel = i18nString(UIStrings.layoutRoot);
                break;
            }
            case "ConsoleTime" /* TraceEngine.Types.TraceEvents.KnownEventName.ConsoleTime */: {
                contentHelper.appendTextRow(i18nString(UIStrings.message), event.name);
                break;
            }
            case "WebSocketCreate" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketCreate */:
            case "WebSocketSendHandshakeRequest" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSendHandshakeRequest */:
            case "WebSocketReceiveHandshakeResponse" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceiveHandshakeResponse */:
            case "WebSocketSend" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketSend */:
            case "WebSocketReceive" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketReceive */:
            case "WebSocketDestroy" /* TraceEngine.Types.TraceEvents.KnownEventName.WebSocketDestroy */: {
                if (TraceEngine.Types.TraceEvents.isWebSocketTraceEvent(event)) {
                    const rows = TimelineComponents.DetailsView.buildRowsForWebSocketEvent(event, traceParseData);
                    for (const { key, value } of rows) {
                        contentHelper.appendTextRow(key, value);
                    }
                }
                break;
            }
            case "EmbedderCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.EmbedderCallback */: {
                contentHelper.appendTextRow(i18nString(UIStrings.callbackFunction), unsafeEventData['callbackName']);
                break;
            }
            case "Animation" /* TraceEngine.Types.TraceEvents.KnownEventName.Animation */: {
                if (event.ph === "n" /* TraceEngine.Types.TraceEvents.Phase.ASYNC_NESTABLE_INSTANT */) {
                    contentHelper.appendTextRow(i18nString(UIStrings.state), unsafeEventData['state']);
                }
                break;
            }
            case "ParseHTML" /* TraceEngine.Types.TraceEvents.KnownEventName.ParseHTML */: {
                const beginData = unsafeEventArgs['beginData'];
                const startLine = beginData['startLine'] - 1;
                const endLine = unsafeEventArgs['endData'] ? unsafeEventArgs['endData']['endLine'] - 1 : undefined;
                url = beginData['url'];
                if (url) {
                    contentHelper.appendLocationRange(i18nString(UIStrings.range), url, startLine, endLine);
                }
                break;
            }
            // @ts-ignore Fall-through intended.
            case "FireIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.FireIdleCallback */: {
                contentHelper.appendTextRow(i18nString(UIStrings.allottedTime), i18n.TimeUtilities.millisToString(unsafeEventData['allottedMilliseconds']));
                contentHelper.appendTextRow(i18nString(UIStrings.invokedByTimeout), unsafeEventData['timedOut']);
            }
            case "RequestIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.RequestIdleCallback */:
            case "CancelIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.CancelIdleCallback */: {
                contentHelper.appendTextRow(i18nString(UIStrings.callbackId), unsafeEventData['id']);
                break;
            }
            case "EventDispatch" /* TraceEngine.Types.TraceEvents.KnownEventName.EventDispatch */: {
                contentHelper.appendTextRow(i18nString(UIStrings.type), unsafeEventData['type']);
                break;
            }
            // @ts-ignore Fall-through intended.
            case "largestContentfulPaint::Candidate" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLCPCandidate */: {
                contentHelper.appendTextRow(i18nString(UIStrings.type), String(unsafeEventData['type']));
                contentHelper.appendTextRow(i18nString(UIStrings.size), String(unsafeEventData['size']));
            }
            case "firstPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFirstPaint */:
            case "firstContentfulPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFCP */:
            case "MarkLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLoad */:
            case "MarkDOMContent" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkDOMContent */: {
                const adjustedEventTimeStamp = timeStampForEventAdjustedForClosestNavigationIfPossible(event, traceParseData);
                contentHelper.appendTextRow(i18nString(UIStrings.timestamp), i18n.TimeUtilities.preciseMillisToString(adjustedEventTimeStamp, 1));
                if (TraceEngine.Types.TraceEvents.isTraceEventMarkerEvent(event)) {
                    contentHelper.appendElementRow(i18nString(UIStrings.details), TimelineUIUtils.buildDetailsNodeForMarkerEvents(event));
                }
                break;
            }
            case "EventTiming" /* TraceEngine.Types.TraceEvents.KnownEventName.EventTiming */: {
                const detailsNode = await TimelineUIUtils.buildDetailsNodeForTraceEvent(event, targetForEvent(traceParseData, event), linkifier, isFreshRecording, traceParseData);
                if (detailsNode) {
                    contentHelper.appendElementRow(i18nString(UIStrings.details), detailsNode);
                }
                if (TraceEngine.Types.TraceEvents.isSyntheticInteractionEvent(event)) {
                    const inputDelay = i18n.TimeUtilities.formatMicroSecondsTime(event.inputDelay);
                    const mainThreadTime = i18n.TimeUtilities.formatMicroSecondsTime(event.mainThreadHandling);
                    const presentationDelay = i18n.TimeUtilities.formatMicroSecondsTime(event.presentationDelay);
                    contentHelper.appendTextRow(i18nString(UIStrings.interactionID), event.interactionId);
                    contentHelper.appendTextRow(i18nString(UIStrings.inputDelay), inputDelay);
                    contentHelper.appendTextRow(i18nString(UIStrings.processingDuration), mainThreadTime);
                    contentHelper.appendTextRow(i18nString(UIStrings.presentationDelay), presentationDelay);
                }
                break;
            }
            case "LayoutShift" /* TraceEngine.Types.TraceEvents.KnownEventName.LayoutShift */: {
                if (!TraceEngine.Types.TraceEvents.isSyntheticLayoutShift(event)) {
                    console.error('Unexpected type for LayoutShift event');
                    break;
                }
                const layoutShift = event;
                const layoutShiftEventData = layoutShift.args.data;
                const warning = document.createElement('span');
                const clsLink = UI.XLink.XLink.create('https://web.dev/cls/', i18nString(UIStrings.cumulativeLayoutShifts), undefined, undefined, 'cumulative-layout-shifts');
                const evolvedClsLink = UI.XLink.XLink.create('https://web.dev/evolving-cls/', i18nString(UIStrings.evolvedClsLink), undefined, undefined, 'evolved-cls');
                warning.appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.sCLSInformation, { PH1: clsLink, PH2: evolvedClsLink }));
                contentHelper.appendElementRow(i18nString(UIStrings.warning), warning, true);
                if (!layoutShiftEventData) {
                    break;
                }
                contentHelper.appendTextRow(i18nString(UIStrings.score), layoutShiftEventData['score'].toPrecision(4));
                contentHelper.appendTextRow(i18nString(UIStrings.cumulativeScore), layoutShiftEventData['cumulative_score'].toPrecision(4));
                contentHelper.appendTextRow(i18nString(UIStrings.currentClusterId), layoutShift.parsedData.sessionWindowData.id);
                contentHelper.appendTextRow(i18nString(UIStrings.currentClusterScore), layoutShift.parsedData.sessionWindowData.cumulativeWindowScore.toPrecision(4));
                contentHelper.appendTextRow(i18nString(UIStrings.hadRecentInput), unsafeEventData['had_recent_input'] ? i18nString(UIStrings.yes) : i18nString(UIStrings.no));
                for (const impactedNode of unsafeEventData['impacted_nodes']) {
                    const oldRect = new CLSRect(impactedNode['old_rect']);
                    const newRect = new CLSRect(impactedNode['new_rect']);
                    const linkedOldRect = await Common.Linkifier.Linkifier.linkify(oldRect);
                    const linkedNewRect = await Common.Linkifier.Linkifier.linkify(newRect);
                    contentHelper.appendElementRow(i18nString(UIStrings.movedFrom), linkedOldRect);
                    contentHelper.appendElementRow(i18nString(UIStrings.movedTo), linkedNewRect);
                }
                break;
            }
            default: {
                const detailsNode = await TimelineUIUtils.buildDetailsNodeForTraceEvent(event, targetForEvent(traceParseData, event), linkifier, isFreshRecording, traceParseData);
                if (detailsNode) {
                    contentHelper.appendElementRow(i18nString(UIStrings.details), detailsNode);
                }
                break;
            }
        }
        const relatedNodes = relatedNodesMap?.values() || [];
        for (const relatedNode of relatedNodes) {
            if (relatedNode) {
                const nodeSpan = await Common.Linkifier.Linkifier.linkify(relatedNode);
                contentHelper.appendElementRow(relatedNodeLabel || i18nString(UIStrings.relatedNode), nodeSpan);
            }
        }
        // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
        if (event[previewElementSymbol]) {
            contentHelper.addSection(i18nString(UIStrings.preview));
            // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
            contentHelper.appendElementRow('', event[previewElementSymbol]);
        }
        const stackTrace = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(event);
        if (initiator || initiatorFor || stackTrace || traceParseData?.Invalidations.invalidationsForEvent.get(event)) {
            await TimelineUIUtils.generateCauses(event, contentHelper, traceParseData);
        }
        if (Root.Runtime.experiments.isEnabled("timeline-debug-mode" /* Root.Runtime.ExperimentName.TIMELINE_DEBUG_MODE */)) {
            TimelineUIUtils.renderEventJson(event, contentHelper);
        }
        const stats = {};
        const showPieChart = detailed && traceParseData && TimelineUIUtils.aggregatedStatsForTraceEvent(stats, traceParseData, event);
        if (showPieChart) {
            contentHelper.addSection(i18nString(UIStrings.aggregatedTime));
            const pieChart = TimelineUIUtils.generatePieChart(stats, TimelineUIUtils.eventStyle(event).category, selfTime);
            contentHelper.appendElementRow('', pieChart);
        }
        return contentHelper.fragment;
    }
    static statsForTimeRange(events, startTime, endTime) {
        if (!events.length) {
            return { 'idle': endTime - startTime };
        }
        buildRangeStatsCacheIfNeeded(events);
        const aggregatedStats = subtractStats(aggregatedStatsAtTime(endTime), aggregatedStatsAtTime(startTime));
        const aggregatedTotal = Object.values(aggregatedStats).reduce((a, b) => a + b, 0);
        aggregatedStats['idle'] = Math.max(0, endTime - startTime - aggregatedTotal);
        return aggregatedStats;
        function aggregatedStatsAtTime(time) {
            const stats = {};
            // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
            const cache = events[categoryBreakdownCacheSymbol];
            for (const category in cache) {
                const categoryCache = cache[category];
                const index = Platform.ArrayUtilities.upperBound(categoryCache.time, time, Platform.ArrayUtilities.DEFAULT_COMPARATOR);
                let value;
                if (index === 0) {
                    value = 0;
                }
                else if (index === categoryCache.time.length) {
                    value = categoryCache.value[categoryCache.value.length - 1];
                }
                else {
                    const t0 = categoryCache.time[index - 1];
                    const t1 = categoryCache.time[index];
                    const v0 = categoryCache.value[index - 1];
                    const v1 = categoryCache.value[index];
                    value = v0 + (v1 - v0) * (time - t0) / (t1 - t0);
                }
                stats[category] = value;
            }
            return stats;
        }
        function subtractStats(a, b) {
            const result = Object.assign({}, a);
            for (const key in b) {
                result[key] -= b[key];
            }
            return result;
        }
        function buildRangeStatsCacheIfNeeded(events) {
            // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
            if (events[categoryBreakdownCacheSymbol]) {
                return;
            }
            // aggeregatedStats is a map by categories. For each category there's an array
            // containing sorted time points which records accumulated value of the category.
            const aggregatedStats = {};
            const categoryStack = [];
            let lastTime = 0;
            TraceEngine.Helpers.Trace.forEachEvent(events, {
                onStartEvent,
                onEndEvent,
            });
            function updateCategory(category, time) {
                let statsArrays = aggregatedStats[category];
                if (!statsArrays) {
                    statsArrays = { time: [], value: [] };
                    aggregatedStats[category] = statsArrays;
                }
                if (statsArrays.time.length && statsArrays.time[statsArrays.time.length - 1] === time || lastTime > time) {
                    return;
                }
                const lastValue = statsArrays.value.length > 0 ? statsArrays.value[statsArrays.value.length - 1] : 0;
                statsArrays.value.push(lastValue + time - lastTime);
                statsArrays.time.push(time);
            }
            function categoryChange(from, to, time) {
                if (from) {
                    updateCategory(from, time);
                }
                lastTime = time;
                if (to) {
                    updateCategory(to, time);
                }
            }
            function onStartEvent(e) {
                const { startTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
                const category = getEventStyle(e.name)?.category.name ||
                    getCategoryStyles().other.name;
                const parentCategory = categoryStack.length ? categoryStack[categoryStack.length - 1] : null;
                if (category !== parentCategory) {
                    categoryChange(parentCategory || null, category, startTime);
                }
                categoryStack.push(category);
            }
            function onEndEvent(e) {
                const { endTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
                const category = categoryStack.pop();
                const parentCategory = categoryStack.length ? categoryStack[categoryStack.length - 1] : null;
                if (category !== parentCategory) {
                    categoryChange(category || null, parentCategory || null, endTime || 0);
                }
            }
            const obj = events;
            // @ts-ignore TODO(crbug.com/1011811): Remove symbol usage.
            obj[categoryBreakdownCacheSymbol] = aggregatedStats;
        }
    }
    static async buildSyntheticNetworkRequestDetails(traceParseData, event, linkifier) {
        const maybeTarget = targetForEvent(traceParseData, event);
        const contentHelper = new TimelineDetailsContentHelper(maybeTarget, linkifier);
        const category = TimelineUIUtils.syntheticNetworkRequestCategory(event);
        const color = TimelineUIUtils.networkCategoryColor(category);
        contentHelper.addSection(i18nString(UIStrings.networkRequest), color);
        const options = {
            tabStop: true,
            showColumnNumber: false,
            inlineFrameIndex: 0,
        };
        contentHelper.appendElementRow(i18n.i18n.lockedString('URL'), LegacyComponents.Linkifier.Linkifier.linkifyURL(event.args.data.url, options));
        // The time from queueing the request until resource processing is finished.
        const fullDuration = event.dur;
        if (isFinite(fullDuration)) {
            let textRow = i18n.TimeUtilities.formatMicroSecondsTime(fullDuration);
            // The time from queueing the request until the download is finished. This
            // corresponds to the total time reported for the request in the network tab.
            const networkDuration = event.args.data.syntheticData.finishTime - event.ts;
            // The time it takes to make the resource available to the renderer process.
            const processingDuration = event.ts + event.dur - event.args.data.syntheticData.finishTime;
            if (isFinite(networkDuration) && isFinite(processingDuration)) {
                const networkDurationStr = i18n.TimeUtilities.formatMicroSecondsTime(networkDuration);
                const processingDurationStr = i18n.TimeUtilities.formatMicroSecondsTime(processingDuration);
                const cached = event.args.data.syntheticData.isMemoryCached || event.args.data.syntheticData.isDiskCached;
                const cacheOrNetworkLabel = cached ? i18nString(UIStrings.loadFromCache) : i18nString(UIStrings.networkTransfer);
                textRow += i18nString(UIStrings.SSSResourceLoading, { PH1: networkDurationStr, PH2: cacheOrNetworkLabel, PH3: processingDurationStr });
            }
            contentHelper.appendTextRow(i18nString(UIStrings.duration), textRow);
        }
        if (event.args.data.requestMethod) {
            contentHelper.appendTextRow(i18nString(UIStrings.requestMethod), event.args.data.requestMethod);
        }
        if (event.args.data.initialPriority) {
            const initialPriority = PerfUI.NetworkPriorities.uiLabelForNetworkPriority(event.args.data.initialPriority);
            contentHelper.appendTextRow(i18nString(UIStrings.initialPriority), initialPriority);
        }
        const priority = PerfUI.NetworkPriorities.uiLabelForNetworkPriority(event.args.data.priority);
        contentHelper.appendTextRow(i18nString(UIStrings.priority), priority);
        if (event.args.data.mimeType) {
            contentHelper.appendTextRow(i18nString(UIStrings.mimeType), event.args.data.mimeType);
        }
        let lengthText = '';
        if (event.args.data.syntheticData.isMemoryCached) {
            lengthText += i18nString(UIStrings.FromMemoryCache);
        }
        else if (event.args.data.syntheticData.isDiskCached) {
            lengthText += i18nString(UIStrings.FromCache);
        }
        else if (event.args.data.timing?.pushStart) {
            lengthText += i18nString(UIStrings.FromPush);
        }
        if (event.args.data.fromServiceWorker) {
            lengthText += i18nString(UIStrings.FromServiceWorker);
        }
        if (event.args.data.encodedDataLength || !lengthText) {
            lengthText = `${Platform.NumberUtilities.bytesToString(event.args.data.encodedDataLength)}${lengthText}`;
        }
        contentHelper.appendTextRow(i18nString(UIStrings.encodedData), lengthText);
        if (event.args.data.decodedBodyLength) {
            contentHelper.appendTextRow(i18nString(UIStrings.decodedBody), Platform.NumberUtilities.bytesToString(event.args.data.decodedBodyLength));
        }
        const title = i18nString(UIStrings.initiatedBy);
        const topFrame = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(event)?.at(0) ?? null;
        if (topFrame) {
            const link = linkifier.maybeLinkifyConsoleCallFrame(maybeTarget, topFrame, { tabStop: true, inlineFrameIndex: 0, showColumnNumber: true });
            if (link) {
                contentHelper.appendElementRow(title, link);
            }
        }
        if (!requestPreviewElements.get(event) && event.args.data.url && maybeTarget) {
            const previewElement = await LegacyComponents.ImagePreview.ImagePreview.build(maybeTarget, event.args.data.url, false, {
                imageAltText: LegacyComponents.ImagePreview.ImagePreview.defaultAltTextForImageURL(event.args.data.url),
                precomputedFeatures: undefined,
            });
            requestPreviewElements.set(event, previewElement);
        }
        const requestPreviewElement = requestPreviewElements.get(event);
        if (requestPreviewElement) {
            contentHelper.appendElementRow(i18nString(UIStrings.preview), requestPreviewElement);
        }
        return contentHelper.fragment;
    }
    static renderEventJson(event, contentHelper) {
        contentHelper.addSection(i18nString(UIStrings.traceEvent));
        const eventWithArgsFirst = {
            ...{ args: event.args },
            ...event,
        };
        const indentLength = Common.Settings.Settings.instance().moduleSetting('text-editor-indent').get().length;
        // Elide if the data is huge. Then remove the initial new-line for a denser UI
        const eventStr = JSON.stringify(eventWithArgsFirst, null, indentLength).slice(0, 3000).replace(/{\n  /, '{ ');
        // Use CodeHighlighter for syntax highlighting.
        const highlightContainer = document.createElement('div');
        const shadowRoot = highlightContainer.attachShadow({ mode: 'open' });
        shadowRoot.adoptedStyleSheets = [inspectorCommonStyles, codeHighlighterStyles];
        const elem = shadowRoot.createChild('div');
        elem.classList.add('monospace', 'source-code');
        elem.textContent = eventStr;
        void CodeHighlighter.CodeHighlighter.highlightNode(elem, 'text/javascript');
        contentHelper.appendElementRow('', highlightContainer);
    }
    static stackTraceFromCallFrames(callFrames) {
        return { callFrames: callFrames };
    }
    static async generateCauses(event, contentHelper, traceParseData) {
        const { startTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
        let initiatorStackLabel = i18nString(UIStrings.initiatorStackTrace);
        let stackLabel = i18nString(UIStrings.stackTrace);
        switch (event.name) {
            case "TimerFire" /* TraceEngine.Types.TraceEvents.KnownEventName.TimerFire */:
                initiatorStackLabel = i18nString(UIStrings.timerInstalled);
                break;
            case "FireAnimationFrame" /* TraceEngine.Types.TraceEvents.KnownEventName.FireAnimationFrame */:
                initiatorStackLabel = i18nString(UIStrings.animationFrameRequested);
                break;
            case "FireIdleCallback" /* TraceEngine.Types.TraceEvents.KnownEventName.FireIdleCallback */:
                initiatorStackLabel = i18nString(UIStrings.idleCallbackRequested);
                break;
            case "UpdateLayoutTree" /* TraceEngine.Types.TraceEvents.KnownEventName.UpdateLayoutTree */:
                initiatorStackLabel = i18nString(UIStrings.firstInvalidated);
                stackLabel = i18nString(UIStrings.recalculationForced);
                break;
            case "Layout" /* TraceEngine.Types.TraceEvents.KnownEventName.Layout */:
                initiatorStackLabel = i18nString(UIStrings.firstLayoutInvalidation);
                stackLabel = i18nString(UIStrings.layoutForced);
                break;
        }
        const stackTrace = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(event);
        if (stackTrace && stackTrace.length) {
            contentHelper.addSection(stackLabel);
            contentHelper.createChildStackTraceElement(TimelineUIUtils.stackTraceFromCallFrames(stackTrace));
        }
        const initiator = traceParseData.Initiators.eventToInitiator.get(event);
        const initiatorFor = traceParseData.Initiators.initiatorToEvents.get(event);
        const invalidations = traceParseData.Invalidations.invalidationsForEvent.get(event);
        if (initiator) {
            // If we have an initiator for the event, we can show its stack trace, a link to reveal the initiator,
            // and the time since the initiator (Pending For).
            const stackTrace = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(initiator);
            if (stackTrace) {
                contentHelper.addSection(initiatorStackLabel);
                contentHelper.createChildStackTraceElement(TimelineUIUtils.stackTraceFromCallFrames(stackTrace.map(frame => {
                    return {
                        ...frame,
                        scriptId: String(frame.scriptId),
                    };
                })));
            }
            const link = this.createEntryLink(initiator);
            contentHelper.appendElementRow(i18nString(UIStrings.initiatedBy), link);
            const { startTime: initiatorStartTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(initiator);
            const delay = startTime - initiatorStartTime;
            contentHelper.appendTextRow(i18nString(UIStrings.pendingFor), i18n.TimeUtilities.preciseMillisToString(delay, 1));
        }
        if (initiatorFor) {
            // If the event is an initiator for some entries, add links to reveal them.
            const links = document.createElement('div');
            initiatorFor.map((initiator, i) => {
                links.appendChild(this.createEntryLink(initiator));
                // Add space between each link if it's not last
                if (i < initiatorFor.length - 1) {
                    links.append(' ');
                }
            });
            contentHelper.appendElementRow(UIStrings.initiatorFor, links);
        }
        if (invalidations && invalidations.length) {
            contentHelper.addSection(i18nString(UIStrings.invalidations));
            await TimelineUIUtils.generateInvalidationsList(invalidations, contentHelper);
        }
    }
    static createEntryLink(entry) {
        const link = document.createElement('span');
        const traceBoundsState = TraceBounds.TraceBounds.BoundsManager.instance().state();
        if (!traceBoundsState) {
            console.error('Tried to link to an entry without any traceBoundsState. This should never happen.');
            return link;
        }
        // Check is the entry is outside of the current breadcrumb. If it is, don't create a link to navigate to it because there is no way to navigate outside breadcrumb without removing it. Instead, just display the name and "outside breadcrumb" text
        // Consider entry outside breadcrumb only if it is fully outside. If a part of it is visible, we can still select it.
        const isEntryOutsideBreadcrumb = traceBoundsState.micro.minimapTraceBounds.min > entry.ts + (entry.dur || 0) ||
            traceBoundsState.micro.minimapTraceBounds.max < entry.ts;
        // Check if it is in the hidden array
        const isEntryHidden = ModificationsManager.ModificationsManager.ModificationsManager.activeManager()
            ?.getEntriesFilter()
            .inEntryInvisible(entry);
        if (!isEntryOutsideBreadcrumb) {
            link.classList.add('devtools-link');
            UI.ARIAUtils.markAsLink(link);
            link.tabIndex = 0;
            link.addEventListener('click', () => {
                TimelinePanel.instance().select(TimelineSelection.fromTraceEvent((entry)));
            });
            link.addEventListener('keydown', event => {
                if (event.key === 'Enter') {
                    TimelinePanel.instance().select(TimelineSelection.fromTraceEvent((entry)));
                    event.consume(true);
                }
            });
        }
        if (isEntryHidden) {
            link.textContent = this.eventTitle(entry) + ' ' + i18nString(UIStrings.entryIsHidden);
        }
        else if (isEntryOutsideBreadcrumb) {
            link.textContent = this.eventTitle(entry) + ' ' + i18nString(UIStrings.outsideBreadcrumbRange);
        }
        else {
            link.textContent = this.eventTitle(entry);
        }
        return link;
    }
    static async generateInvalidationsList(invalidations, contentHelper) {
        const { groupedByReason, backendNodeIds } = TimelineComponents.DetailsView.generateInvalidationsList(invalidations);
        let relatedNodesMap = null;
        const target = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        const domModel = target?.model(SDK.DOMModel.DOMModel);
        if (domModel) {
            relatedNodesMap = await domModel.pushNodesByBackendIdsToFrontend(backendNodeIds);
        }
        Object.keys(groupedByReason).forEach(reason => {
            TimelineUIUtils.generateInvalidationsForReason(reason, groupedByReason[reason], relatedNodesMap, contentHelper);
        });
    }
    static generateInvalidationsForReason(reason, invalidations, relatedNodesMap, contentHelper) {
        function createLinkForInvalidationNode(invalidation) {
            const node = (invalidation.nodeId && relatedNodesMap) ? relatedNodesMap.get(invalidation.nodeId) : null;
            if (node) {
                const nodeSpan = document.createElement('span');
                void Common.Linkifier.Linkifier.linkify(node).then(link => nodeSpan.appendChild(link));
                return nodeSpan;
            }
            if (invalidation.nodeName) {
                const nodeSpan = document.createElement('span');
                nodeSpan.textContent = invalidation.nodeName;
                return nodeSpan;
            }
            const nodeSpan = document.createElement('span');
            UI.UIUtils.createTextChild(nodeSpan, i18nString(UIStrings.UnknownNode));
            return nodeSpan;
        }
        const generatedItems = new Set();
        for (const invalidation of invalidations) {
            const stackTrace = TraceEngine.Helpers.Trace.getZeroIndexedStackTraceForEvent(invalidation);
            let scriptLink = null;
            const callFrame = stackTrace?.at(0);
            if (callFrame) {
                scriptLink = contentHelper.linkifier()?.maybeLinkifyScriptLocation(SDK.TargetManager.TargetManager.instance().rootTarget(), callFrame.scriptId, callFrame.url, callFrame.lineNumber) ||
                    null;
            }
            const niceNodeLink = createLinkForInvalidationNode(invalidation);
            const text = scriptLink ?
                i18n.i18n.getFormatLocalizedString(str_, UIStrings.invalidationWithCallFrame, { PH1: niceNodeLink, PH2: scriptLink }) :
                niceNodeLink;
            // Sometimes we can get different Invalidation events which cause
            // the same text for the same element for the same reason to be
            // generated. Rather than show the user duplicates, if we have
            // generated text that looks identical to this before, we will
            // bail.
            const generatedText = (typeof text === 'string' ? text : text.innerText);
            if (generatedItems.has(generatedText)) {
                continue;
            }
            generatedItems.add(generatedText);
            contentHelper.appendElementRow(reason, text);
        }
    }
    static aggregatedStatsForTraceEvent(total, traceParseData, event) {
        const events = traceParseData.Renderer?.allTraceEntries || [];
        const { startTime, endTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
        function eventComparator(startTime, e) {
            const { startTime: eventStartTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(e);
            return startTime - eventStartTime;
        }
        const index = Platform.ArrayUtilities.binaryIndexOf(events, startTime, eventComparator);
        // Not a main thread event?
        if (index < 0) {
            return false;
        }
        let hasChildren = false;
        if (endTime) {
            for (let i = index; i < events.length; i++) {
                const nextEvent = events[i];
                const { startTime: nextEventStartTime, selfTime: nextEventSelfTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(nextEvent);
                if (nextEventStartTime >= endTime) {
                    break;
                }
                if (!nextEvent.selfTime) {
                    continue;
                }
                if (nextEvent.tid !== event.tid) {
                    continue;
                }
                if (i > index) {
                    hasChildren = true;
                }
                const categoryName = TimelineUIUtils.eventStyle(nextEvent).category.name;
                total[categoryName] = (total[categoryName] || 0) + nextEventSelfTime;
            }
        }
        if (TraceEngine.Types.TraceEvents.isAsyncPhase(event.ph)) {
            if (endTime) {
                let aggregatedTotal = 0;
                for (const categoryName in total) {
                    aggregatedTotal += total[categoryName];
                }
                total['idle'] = Math.max(0, endTime - startTime - aggregatedTotal);
            }
            return false;
        }
        return hasChildren;
    }
    static async buildPicturePreviewContent(traceData, event, target) {
        const snapshotEvent = traceData.LayerTree.paintsToSnapshots.get(event);
        if (!snapshotEvent) {
            return null;
        }
        const paintProfilerModel = target.model(SDK.PaintProfiler.PaintProfilerModel);
        if (!paintProfilerModel) {
            return null;
        }
        const snapshot = await paintProfilerModel.loadSnapshot(snapshotEvent.args.snapshot.skp64);
        if (!snapshot) {
            return null;
        }
        const snapshotWithRect = {
            snapshot,
            rect: snapshotEvent.args.snapshot.params?.layer_rect,
        };
        if (!snapshotWithRect) {
            return null;
        }
        const imageURLPromise = snapshotWithRect.snapshot.replay();
        snapshotWithRect.snapshot.release();
        const imageURL = await imageURLPromise;
        if (!imageURL) {
            return null;
        }
        const stylesContainer = document.createElement('div');
        const shadowRoot = stylesContainer.attachShadow({ mode: 'open' });
        shadowRoot.adoptedStyleSheets = [imagePreviewStyles];
        const container = shadowRoot.createChild('div');
        container.classList.add('image-preview-container', 'vbox', 'link');
        const img = container.createChild('img');
        img.src = imageURL;
        img.alt = LegacyComponents.ImagePreview.ImagePreview.defaultAltTextForImageURL(imageURL);
        const paintProfilerButton = container.createChild('a');
        paintProfilerButton.textContent = i18nString(UIStrings.paintProfiler);
        UI.ARIAUtils.markAsLink(container);
        container.tabIndex = 0;
        container.addEventListener('click', () => TimelinePanel.instance().select(TimelineSelection.fromTraceEvent(event)), false);
        container.addEventListener('keydown', keyEvent => {
            if (keyEvent.key === 'Enter') {
                TimelinePanel.instance().select(TimelineSelection.fromTraceEvent(event));
                keyEvent.consume(true);
            }
        });
        return stylesContainer;
    }
    static createEventDivider(event, zeroTime) {
        const eventDivider = document.createElement('div');
        eventDivider.classList.add('resources-event-divider');
        const { startTime: eventStartTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
        const startTime = i18n.TimeUtilities.millisToString(eventStartTime - zeroTime);
        UI.Tooltip.Tooltip.install(eventDivider, i18nString(UIStrings.sAtS, { PH1: TimelineUIUtils.eventTitle(event), PH2: startTime }));
        const style = TimelineUIUtils.markerStyleForEvent(event);
        if (style.tall) {
            eventDivider.style.backgroundColor = style.color;
        }
        return eventDivider;
    }
    static visibleEventsFilter() {
        return new TimelineModel.TimelineModelFilter.TimelineVisibleEventsFilter(visibleTypes());
    }
    // Included only for layout tests.
    // TODO(crbug.com/1386091): Fix/port layout tests and remove.
    static categories() {
        return getCategoryStyles();
    }
    static generatePieChart(aggregatedStats, selfCategory, selfTime) {
        let total = 0;
        for (const categoryName in aggregatedStats) {
            total += aggregatedStats[categoryName];
        }
        const element = document.createElement('div');
        element.classList.add('timeline-details-view-pie-chart-wrapper');
        element.classList.add('hbox');
        const pieChart = new PerfUI.PieChart.PieChart();
        const slices = [];
        function appendLegendRow(name, title, value, color) {
            if (!value) {
                return;
            }
            slices.push({ value, color, title });
        }
        // In case of self time, first add self, then children of the same category.
        if (selfCategory) {
            if (selfTime) {
                appendLegendRow(selfCategory.name, i18nString(UIStrings.sSelf, { PH1: selfCategory.title }), selfTime, selfCategory.getCSSValue());
            }
            // Children of the same category.
            const categoryTime = aggregatedStats[selfCategory.name];
            const value = categoryTime - (selfTime || 0);
            if (value > 0) {
                appendLegendRow(selfCategory.name, i18nString(UIStrings.sChildren, { PH1: selfCategory.title }), value, selfCategory.getCSSValue());
            }
        }
        // Add other categories.
        for (const categoryName in getCategoryStyles()) {
            const category = getCategoryStyles()[categoryName];
            if (categoryName === selfCategory?.name) {
                // Do not add an entry for this event's self category because 2
                // entries for it where added just before this for loop (for
                // self and children times).
                continue;
            }
            appendLegendRow(category.name, category.title, aggregatedStats[category.name], category.getCSSValue());
        }
        pieChart.data = {
            chartName: i18nString(UIStrings.timeSpentInRendering),
            size: 110,
            formatter: (value) => i18n.TimeUtilities.preciseMillisToString(value),
            showLegend: true,
            total,
            slices,
        };
        const pieChartContainer = element.createChild('div', 'vbox');
        pieChartContainer.appendChild(pieChart);
        return element;
    }
    static generateDetailsContentForFrame(frame, filmStrip, filmStripFrame) {
        const contentHelper = new TimelineDetailsContentHelper(null, null);
        contentHelper.addSection(i18nString(UIStrings.frame));
        const duration = TimelineUIUtils.frameDuration(frame);
        contentHelper.appendElementRow(i18nString(UIStrings.duration), duration);
        if (filmStrip && filmStripFrame) {
            const filmStripPreview = document.createElement('div');
            filmStripPreview.classList.add('timeline-filmstrip-preview');
            void UI.UIUtils.loadImage(filmStripFrame.screenshotEvent.args.dataUri)
                .then(image => image && filmStripPreview.appendChild(image));
            contentHelper.appendElementRow('', filmStripPreview);
            filmStripPreview.addEventListener('click', frameClicked.bind(null, filmStrip, filmStripFrame), false);
        }
        function frameClicked(filmStrip, filmStripFrame) {
            PerfUI.FilmStripView.Dialog.fromFilmStrip(filmStrip, filmStripFrame.index);
        }
        return contentHelper.fragment;
    }
    static frameDuration(frame) {
        const offsetMilli = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(frame.startTimeOffset);
        const durationMilli = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(TraceEngine.Types.Timing.MicroSeconds(frame.endTime - frame.startTime));
        const durationText = i18nString(UIStrings.sAtSParentheses, {
            PH1: i18n.TimeUtilities.millisToString(durationMilli, true),
            PH2: i18n.TimeUtilities.millisToString(offsetMilli, true),
        });
        return i18n.i18n.getFormatLocalizedString(str_, UIStrings.emptyPlaceholder, { PH1: durationText });
    }
    static quadWidth(quad) {
        return Math.round(Math.sqrt(Math.pow(quad[0] - quad[2], 2) + Math.pow(quad[1] - quad[3], 2)));
    }
    static quadHeight(quad) {
        return Math.round(Math.sqrt(Math.pow(quad[0] - quad[6], 2) + Math.pow(quad[1] - quad[7], 2)));
    }
    static eventDispatchDesciptors() {
        if (eventDispatchDesciptors) {
            return eventDispatchDesciptors;
        }
        const lightOrange = 'hsl(40,100%,80%)';
        const orange = 'hsl(40,100%,50%)';
        const green = 'hsl(90,100%,40%)';
        const purple = 'hsl(256,100%,75%)';
        eventDispatchDesciptors = [
            new EventDispatchTypeDescriptor(1, lightOrange, ['mousemove', 'mouseenter', 'mouseleave', 'mouseout', 'mouseover']),
            new EventDispatchTypeDescriptor(1, lightOrange, ['pointerover', 'pointerout', 'pointerenter', 'pointerleave', 'pointermove']),
            new EventDispatchTypeDescriptor(2, green, ['wheel']),
            new EventDispatchTypeDescriptor(3, orange, ['click', 'mousedown', 'mouseup']),
            new EventDispatchTypeDescriptor(3, orange, ['touchstart', 'touchend', 'touchmove', 'touchcancel']),
            new EventDispatchTypeDescriptor(3, orange, ['pointerdown', 'pointerup', 'pointercancel', 'gotpointercapture', 'lostpointercapture']),
            new EventDispatchTypeDescriptor(3, purple, ['keydown', 'keyup', 'keypress']),
        ];
        return eventDispatchDesciptors;
    }
    static markerStyleForEvent(event) {
        const tallMarkerDashStyle = [6, 4];
        const title = TimelineUIUtils.eventTitle(event);
        if (event.name !== "navigationStart" /* TraceEngine.Types.TraceEvents.KnownEventName.NavigationStart */ &&
            TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console) ||
            TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.UserTiming)) {
            return {
                title: title,
                dashStyle: tallMarkerDashStyle,
                lineWidth: 0.5,
                color: TraceEngine.Helpers.Trace.eventHasCategory(event, TraceEngine.Types.TraceEvents.Categories.Console) ?
                    'purple' :
                    'orange',
                tall: false,
                lowPriority: false,
            };
        }
        let tall = false;
        let color = 'grey';
        switch (event.name) {
            case "navigationStart" /* TraceEngine.Types.TraceEvents.KnownEventName.NavigationStart */:
                color = '#FF9800';
                tall = true;
                break;
            case "FrameStartedLoading" /* TraceEngine.Types.TraceEvents.KnownEventName.FrameStartedLoading */:
                color = 'green';
                tall = true;
                break;
            case "MarkDOMContent" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkDOMContent */:
                color = '#0867CB';
                tall = true;
                break;
            case "MarkLoad" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLoad */:
                color = '#B31412';
                tall = true;
                break;
            case "firstPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFirstPaint */:
                color = '#228847';
                tall = true;
                break;
            case "firstContentfulPaint" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkFCP */:
                color = '#1A6937';
                tall = true;
                break;
            case "largestContentfulPaint::Candidate" /* TraceEngine.Types.TraceEvents.KnownEventName.MarkLCPCandidate */:
                color = '#1A3422';
                tall = true;
                break;
            case "TimeStamp" /* TraceEngine.Types.TraceEvents.KnownEventName.TimeStamp */:
                color = 'orange';
                break;
        }
        return {
            title: title,
            dashStyle: tallMarkerDashStyle,
            lineWidth: 0.5,
            color: color,
            tall: tall,
            lowPriority: false,
        };
    }
    static colorForId(id) {
        if (!colorGenerator) {
            colorGenerator =
                new Common.Color.Generator({ min: 30, max: 330, count: undefined }, { min: 50, max: 80, count: 3 }, 85);
            colorGenerator.setColorForID('', '#f2ecdc');
        }
        return colorGenerator.colorForID(id);
    }
    static displayNameForFrame(frame, trimAt = 80) {
        const url = frame.url;
        return Common.ParsedURL.schemeIs(url, 'about:') ? `"${Platform.StringUtilities.trimMiddle(frame.name, trimAt)}"` :
            frame.url.slice(0, trimAt);
    }
}
export const aggregatedStatsKey = Symbol('aggregatedStats');
export const previewElementSymbol = Symbol('previewElement');
export class EventDispatchTypeDescriptor {
    priority;
    color;
    eventTypes;
    constructor(priority, color, eventTypes) {
        this.priority = priority;
        this.color = color;
        this.eventTypes = eventTypes;
    }
}
export class TimelineDetailsContentHelper {
    fragment;
    linkifierInternal;
    target;
    element;
    tableElement;
    constructor(target, linkifier) {
        this.fragment = document.createDocumentFragment();
        this.linkifierInternal = linkifier;
        this.target = target;
        this.element = document.createElement('div');
        this.element.classList.add('timeline-details-view-block');
        this.tableElement = this.element.createChild('div', 'vbox timeline-details-chip-body');
        this.fragment.appendChild(this.element);
    }
    addSection(title, swatchColor) {
        if (!this.tableElement.hasChildNodes()) {
            this.element.removeChildren();
        }
        else {
            this.element = document.createElement('div');
            this.element.classList.add('timeline-details-view-block');
            this.fragment.appendChild(this.element);
        }
        if (title) {
            const titleElement = this.element.createChild('div', 'timeline-details-chip-title');
            if (swatchColor) {
                titleElement.createChild('div').style.backgroundColor = swatchColor;
            }
            UI.UIUtils.createTextChild(titleElement, title);
        }
        this.tableElement = this.element.createChild('div', 'vbox timeline-details-chip-body');
        this.fragment.appendChild(this.element);
    }
    linkifier() {
        return this.linkifierInternal;
    }
    appendTextRow(title, value) {
        const rowElement = this.tableElement.createChild('div', 'timeline-details-view-row');
        rowElement.createChild('div', 'timeline-details-view-row-title').textContent = title;
        rowElement.createChild('div', 'timeline-details-view-row-value').textContent = value.toString();
    }
    appendElementRow(title, content, isWarning, isStacked) {
        const rowElement = this.tableElement.createChild('div', 'timeline-details-view-row');
        rowElement.setAttribute('data-row-title', title);
        if (isWarning) {
            rowElement.classList.add('timeline-details-warning');
        }
        if (isStacked) {
            rowElement.classList.add('timeline-details-stack-values');
        }
        const titleElement = rowElement.createChild('div', 'timeline-details-view-row-title');
        titleElement.textContent = title;
        const valueElement = rowElement.createChild('div', 'timeline-details-view-row-value');
        if (content instanceof Node) {
            valueElement.appendChild(content);
        }
        else {
            UI.UIUtils.createTextChild(valueElement, content || '');
        }
    }
    appendLocationRow(title, url, startLine, startColumn) {
        if (!this.linkifierInternal) {
            return;
        }
        const options = {
            tabStop: true,
            columnNumber: startColumn,
            showColumnNumber: true,
            inlineFrameIndex: 0,
        };
        const link = this.linkifierInternal.maybeLinkifyScriptLocation(this.target, null, url, startLine, options);
        if (!link) {
            return;
        }
        this.appendElementRow(title, link);
    }
    appendLocationRange(title, url, startLine, endLine) {
        if (!this.linkifierInternal || !this.target) {
            return;
        }
        const locationContent = document.createElement('span');
        const link = this.linkifierInternal.maybeLinkifyScriptLocation(this.target, null, url, startLine, { tabStop: true, inlineFrameIndex: 0 });
        if (!link) {
            return;
        }
        locationContent.appendChild(link);
        UI.UIUtils.createTextChild(locationContent, Platform.StringUtilities.sprintf(' [%s…%s]', startLine + 1, (endLine || 0) + 1 || ''));
        this.appendElementRow(title, locationContent);
    }
    createChildStackTraceElement(stackTrace) {
        if (!this.linkifierInternal) {
            return;
        }
        const stackTraceElement = this.tableElement.createChild('div', 'timeline-details-view-row timeline-details-stack-values');
        const callFrameContents = LegacyComponents.JSPresentationUtils.buildStackTracePreviewContents(this.target, this.linkifierInternal, { stackTrace, tabStops: true, showColumnNumber: true });
        stackTraceElement.appendChild(callFrameContents.element);
    }
}
export const categoryBreakdownCacheSymbol = Symbol('categoryBreakdownCache');
/**
 * Given a particular event, this method can adjust its timestamp by
 * substracting the timestamp of the previous navigation. This helps in cases
 * where the user has navigated multiple times in the trace, so that we can show
 * the LCP (for example) relative to the last navigation.
 **/
export function timeStampForEventAdjustedForClosestNavigationIfPossible(event, traceParsedData) {
    if (!traceParsedData) {
        const { startTime } = TraceEngine.Helpers.Timing.eventTimingsMilliSeconds(event);
        return startTime;
    }
    const time = TraceEngine.Helpers.Timing.timeStampForEventAdjustedByClosestNavigation(event, traceParsedData.Meta.traceBounds, traceParsedData.Meta.navigationsByNavigationId, traceParsedData.Meta.navigationsByFrameId);
    return TraceEngine.Helpers.Timing.microSecondsToMilliseconds(time);
}
/**
 * Determines if an event is potentially a marker event. A marker event here
 * is a single moment in time that we want to highlight on the timeline, such as
 * the LCP time. This method does not filter out events: for example, it treats
 * every LCP Candidate event as a potential marker event.
 **/
export function isMarkerEvent(traceParseData, event) {
    const { KnownEventName } = TraceEngine.Types.TraceEvents;
    if (event.name === "TimeStamp" /* KnownEventName.TimeStamp */) {
        return true;
    }
    if (TraceEngine.Types.TraceEvents.isTraceEventFirstContentfulPaint(event) ||
        TraceEngine.Types.TraceEvents.isTraceEventFirstPaint(event)) {
        return event.args.frame === traceParseData.Meta.mainFrameId;
    }
    if (TraceEngine.Types.TraceEvents.isTraceEventMarkDOMContent(event) ||
        TraceEngine.Types.TraceEvents.isTraceEventMarkLoad(event) ||
        TraceEngine.Types.TraceEvents.isTraceEventLargestContentfulPaintCandidate(event)) {
        // isOutermostMainFrame was added in 2022, so we fallback to isMainFrame
        // for older traces.
        if (!event.args.data) {
            return false;
        }
        const { isOutermostMainFrame, isMainFrame } = event.args.data;
        if (typeof isOutermostMainFrame !== 'undefined') {
            // If isOutermostMainFrame is defined we want to use that and not
            // fallback to isMainFrame, even if isOutermostMainFrame is false. Hence
            // this check.
            return isOutermostMainFrame;
        }
        return Boolean(isMainFrame);
    }
    return false;
}
//# sourceMappingURL=TimelineUIUtils.js.map