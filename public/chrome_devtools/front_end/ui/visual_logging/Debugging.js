// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { assertNotNullOrUndefined } from '../../core/platform/platform.js';
import { VisualElements } from './LoggingConfig.js';
import { getLoggingState } from './LoggingState.js';
let veDebuggingEnabled = false;
let debugPopover = null;
const nonDomDebugElements = new WeakMap();
function setVeDebuggingEnabled(enabled) {
    veDebuggingEnabled = enabled;
    if (enabled && !debugPopover) {
        debugPopover = document.createElement('div');
        debugPopover.classList.add('ve-debug');
        debugPopover.style.position = 'absolute';
        debugPopover.style.bottom = '100px';
        debugPopover.style.left = '100px';
        debugPopover.style.background = 'black';
        debugPopover.style.color = 'white';
        debugPopover.style.zIndex = '100000';
        document.body.appendChild(debugPopover);
    }
}
// @ts-ignore
globalThis.setVeDebuggingEnabled = setVeDebuggingEnabled;
export function processForDebugging(loggable) {
    const loggingState = getLoggingState(loggable);
    if (!veDebuggingEnabled || !loggingState || loggingState.processedForDebugging) {
        return;
    }
    if (loggable instanceof Element) {
        processElementForDebugging(loggable, loggingState);
    }
    else {
        processNonDomLoggableForDebugging(loggable, loggingState);
    }
}
function showDebugPopover(content) {
    if (!debugPopover) {
        return;
    }
    debugPopover.style.display = 'block';
    debugPopover.innerHTML = content;
}
function processElementForDebugging(element, loggingState) {
    if (element.tagName === 'OPTION') {
        if (loggingState.parent?.selectOpen && debugPopover) {
            debugPopover.innerHTML += '<br>' + debugString(loggingState.config);
            loggingState.processedForDebugging = true;
        }
    }
    else {
        element.style.outline = 'solid 1px red';
        element.addEventListener('mouseenter', () => {
            assertNotNullOrUndefined(debugPopover);
            const pathToRoot = [loggingState];
            let ancestor = loggingState.parent;
            while (ancestor) {
                pathToRoot.push(ancestor);
                ancestor = ancestor.parent;
            }
            showDebugPopover(pathToRoot.map(s => debugString(s.config)).join('<br>'));
        }, { capture: true });
        element.addEventListener('mouseleave', () => {
            assertNotNullOrUndefined(debugPopover);
            debugPopover.style.display = 'none';
        }, { capture: true });
        loggingState.processedForDebugging = true;
    }
}
export function processEventForDebugging(event, state, extraInfo) {
    const format = localStorage.getItem('veDebugLoggingEnabled');
    if (!format) {
        return;
    }
    switch (format) {
        case DebugLoggingFormat.Intuitive:
            processEventForIntuitiveDebugging(event, state, extraInfo);
            break;
        case DebugLoggingFormat.AdHocAnalysis:
            processEventForAdHocAnalysisDebugging(event, state, extraInfo);
            break;
    }
}
export function processEventForIntuitiveDebugging(event, state, extraInfo) {
    const entry = {
        event,
        ve: state ? VisualElements[state?.config.ve] : undefined,
        veid: state?.veid,
        context: state?.config.context,
        time: Date.now() - sessionStartTime,
        ...extraInfo,
    };
    deleteUndefinedFields(entry);
    maybeLogDebugEvent(entry);
}
export function processEventForAdHocAnalysisDebugging(event, state, extraInfo) {
    const ve = state ? adHocAnalysisEntries.get(state.veid) : null;
    if (ve) {
        const interaction = { time: Date.now() - sessionStartTime, type: event, ...extraInfo };
        deleteUndefinedFields(interaction);
        ve.interactions.push(interaction);
    }
}
function deleteUndefinedFields(entry) {
    for (const stringKey in entry) {
        const key = stringKey;
        if (typeof entry[key] === 'undefined') {
            delete entry[key];
        }
    }
}
export function processImpressionsForDebugging(states) {
    const format = localStorage.getItem('veDebugLoggingEnabled');
    switch (format) {
        case DebugLoggingFormat.Intuitive:
            processImpressionsForIntuitiveDebugLog(states);
            break;
        case DebugLoggingFormat.AdHocAnalysis:
            processImpressionsForAdHocAnalysisDebugLog(states);
            break;
        default:
    }
}
function processImpressionsForIntuitiveDebugLog(states) {
    const impressions = new Map();
    for (const state of states) {
        const entry = {
            event: 'Impression',
            ve: VisualElements[state.config.ve],
            context: state?.config.context,
            width: state.size.width,
            height: state.size.height,
            veid: state.veid,
        };
        deleteUndefinedFields(entry);
        impressions.set(state.veid, entry);
        if (!state.parent || !impressions.has(state.parent?.veid)) {
            entry.parent = state.parent?.veid;
        }
        else {
            const parent = impressions.get(state.parent?.veid);
            parent.children = parent.children || [];
            parent.children.push(entry);
        }
    }
    const entries = [...impressions.values()].filter(i => 'parent' in i);
    if (entries.length === 1) {
        entries[0].time = Date.now() - sessionStartTime;
        maybeLogDebugEvent(entries[0]);
    }
    else {
        maybeLogDebugEvent({ event: 'Impression', children: entries, time: Date.now() - sessionStartTime });
    }
}
const adHocAnalysisEntries = new Map();
function processImpressionsForAdHocAnalysisDebugLog(states) {
    for (const state of states) {
        const buildVe = (state) => {
            const ve = {
                ve: VisualElements[state.config.ve],
                veid: state.veid,
                width: state.size?.width,
                height: state.size?.height,
                context: state.config.context,
            };
            deleteUndefinedFields(ve);
            if (state.parent) {
                ve.parent = buildVe(state.parent);
            }
            return ve;
        };
        const entry = { ...buildVe(state), interactions: [], time: Date.now() - sessionStartTime };
        adHocAnalysisEntries.set(state.veid, entry);
        maybeLogDebugEvent(entry);
    }
}
function processNonDomLoggableForDebugging(loggable, loggingState) {
    let debugElement = nonDomDebugElements.get(loggable);
    if (!debugElement) {
        debugElement = document.createElement('div');
        debugElement.classList.add('ve-debug');
        debugElement.style.background = 'black';
        debugElement.style.color = 'white';
        debugElement.style.zIndex = '100000';
        debugElement.textContent = debugString(loggingState.config);
        nonDomDebugElements.set(loggable, debugElement);
        setTimeout(() => {
            if (!loggingState.size?.width || !loggingState.size?.height) {
                debugElement?.parentElement?.removeChild(debugElement);
                nonDomDebugElements.delete(loggable);
            }
        }, 10000);
    }
    const parentDebugElement = parent instanceof HTMLElement ? parent : nonDomDebugElements.get(parent) || debugPopover;
    assertNotNullOrUndefined(parentDebugElement);
    if (!parentDebugElement.classList.contains('ve-debug')) {
        debugElement.style.position = 'absolute';
        parentDebugElement.insertBefore(debugElement, parentDebugElement.firstChild);
    }
    else {
        debugElement.style.marginLeft = '10px';
        parentDebugElement.appendChild(debugElement);
    }
}
export function debugString(config) {
    const components = [VisualElements[config.ve]];
    if (config.context) {
        components.push(`context: ${config.context}`);
    }
    if (config.parent) {
        components.push(`parent: ${config.parent}`);
    }
    if (config.track) {
        components.push(`track: ${Object.entries(config.track)
            .map(([key, value]) => `${key}${typeof value === 'string' ? `: ${value}` : ''}`)
            .join(', ')}`);
    }
    return components.join('; ');
}
const veDebugEventsLog = [];
function maybeLogDebugEvent(entry) {
    const format = localStorage.getItem('veDebugLoggingEnabled');
    if (!format) {
        return;
    }
    veDebugEventsLog.push(entry);
    if (format === DebugLoggingFormat.Intuitive) {
        // eslint-disable-next-line no-console
        console.info('VE Debug:', entry);
    }
}
var DebugLoggingFormat;
(function (DebugLoggingFormat) {
    DebugLoggingFormat["Intuitive"] = "Intuitive";
    DebugLoggingFormat["AdHocAnalysis"] = "AdHocAnalysis";
})(DebugLoggingFormat || (DebugLoggingFormat = {}));
function setVeDebugLoggingEnabled(enabled, format = DebugLoggingFormat.Intuitive) {
    if (enabled) {
        localStorage.setItem('veDebugLoggingEnabled', format);
    }
    else {
        localStorage.removeItem('veDebugLoggingEnabled');
    }
}
function findVeDebugImpression(veid, includeAncestorChain) {
    const findImpression = (entry) => {
        if (entry.event === 'Impression' && entry.veid === veid) {
            return entry;
        }
        let i = 0;
        for (const childEntry of entry.children || []) {
            const matchingEntry = findImpression(childEntry);
            if (matchingEntry) {
                if (includeAncestorChain) {
                    const children = [];
                    children[i] = matchingEntry;
                    return { ...entry, children };
                }
                return matchingEntry;
            }
            ++i;
        }
        return undefined;
    };
    return findImpression({ children: veDebugEventsLog });
}
function fieldValuesForSql(obj, fields) {
    return [
        ...fields.strings.map(f => obj[f] ? `"${obj[f]}"` : '$NullString'),
        ...fields.numerics.map(f => obj[f] ?? 'null'),
        ...fields.booleans.map(f => obj[f] ?? '$NullBool'),
    ].join(', ');
}
function exportAdHocAnalysisLogForSql() {
    const VE_FIELDS = {
        strings: ['ve', 'context'],
        numerics: ['veid', 'width', 'height'],
        booleans: [],
    };
    const INTERACTION_FIELDS = {
        strings: ['type', 'context'],
        numerics: ['width', 'height', 'mouseButton', 'time'],
        booleans: ['width', 'height', 'mouseButton', 'time'],
    };
    const fieldsDefsForSql = (fields) => fields.map((f, i) => `$${i + 1} as ${f}`).join(', ');
    const veForSql = (e) => `$VeFields(${fieldValuesForSql(e, VE_FIELDS)}, ${e.parent ? `STRUCT(${veForSql(e.parent)})` : null})`;
    const interactionForSql = (i) => `$Interaction(${fieldValuesForSql(i, INTERACTION_FIELDS)})`;
    const entryForSql = (e) => `$Entry(${veForSql(e)}, ([${e.interactions.map(interactionForSql).join(', ')}]), ${e.time})`;
    const entries = veDebugEventsLog;
    // eslint-disable-next-line no-console
    console.log(`
DEFINE MACRO NullString CAST(null AS STRING);
DEFINE MACRO NullBool CAST(null AS BOOL);
DEFINE MACRO VeFields ${fieldsDefsForSql([
        ...VE_FIELDS.strings,
        ...VE_FIELDS.numerics,
        'parent',
    ])};
DEFINE MACRO Interaction STRUCT(${fieldsDefsForSql([
        ...INTERACTION_FIELDS.strings,
        ...INTERACTION_FIELDS.numerics,
        ...INTERACTION_FIELDS.booleans,
    ])});
DEFINE MACRO Entry STRUCT($1, $2 AS interactions, $3 AS time);

// This fake entry put first fixes nested struct fiels names being lost
DEFINE MACRO FakeVeFields $VeFields("", $NullString, 0, 0, 0, $1);
DEFINE MACRO FakeVe STRUCT($FakeVeFields($1));
DEFINE MACRO FakeEntry $Entry($FakeVeFields($FakeVe($FakeVe($FakeVe($FakeVe($FakeVe($FakeVe($FakeVe(null)))))))), ([]), 0);

WITH
  processed_logs AS (
      SELECT * FROM UNNEST([
        $FakeEntry,
        ${entries.map(entryForSql).join(', \n')}
      ])
    )



SELECT * FROM processed_logs;`);
}
function getStateFlowMutations() {
    const mutations = [];
    for (const entry of veDebugEventsLog) {
        mutations.push(entry);
        const veid = entry.veid;
        for (const interaction of entry.interactions) {
            mutations.push({ ...interaction, veid });
        }
    }
    mutations.sort((e1, e2) => e1.time - e2.time);
    return mutations;
}
class StateFlowElementsByArea {
    #data = new Map();
    add(e) {
        this.#data.set(e.veid, e);
    }
    get(veid) {
        return this.#data.get(veid);
    }
    getArea(e) {
        let area = (e.width || 0) * (e.height || 0);
        const parent = e.parent ? this.#data.get(e.parent?.veid) : null;
        if (!parent) {
            return area;
        }
        const parentArea = this.getArea(parent);
        if (area > parentArea) {
            area = parentArea;
        }
        return area;
    }
    get data() {
        return [...this.#data.values()].filter(e => this.getArea(e)).sort((e1, e2) => this.getArea(e2) - this.getArea(e1));
    }
}
function updateStateFlowTree(rootNode, elements, time, interactions) {
    let node = rootNode;
    for (const element of elements.data) {
        if (!('children' in node)) {
            return;
        }
        let nextNode = node.children[node.children.length - 1];
        const nextNodeId = nextNode?.type === 'Impression' ? nextNode.veid : null;
        if (nextNodeId !== element.veid) {
            node.children.push(...interactions);
            interactions.length = 0;
            nextNode = { type: 'Impression', ve: element.ve, veid: element.veid, context: element.context, time, children: [] };
            node.children.push(nextNode);
        }
        node = nextNode;
    }
}
function normalizeNode(node) {
    if (node.type !== 'Impression') {
        return;
    }
    while (node.children.length === 1) {
        if (node.children[0].type === 'Impression') {
            node.children = node.children[0].children;
        }
    }
    for (const child of node.children) {
        normalizeNode(child);
    }
}
function buildStateFlow() {
    const mutations = getStateFlowMutations();
    const elements = new StateFlowElementsByArea();
    const rootNode = { type: 'Session', children: [] };
    let time = mutations[0].time;
    const interactions = [];
    for (const mutation of mutations) {
        if (mutation.time > time + 1000) {
            updateStateFlowTree(rootNode, elements, time, interactions);
            interactions.length = 0;
        }
        if (!('type' in mutation)) {
            elements.add(mutation);
        }
        else if (mutation.type === 'Resize') {
            const element = elements.get(mutation.veid);
            if (!element) {
                continue;
            }
            const oldArea = elements.getArea(element);
            element.width = mutation.width;
            element.height = mutation.height;
            if (elements.getArea(element) !== 0 && oldArea !== 0) {
                interactions.push(mutation);
            }
        }
        else {
            interactions.push(mutation);
        }
        time = mutation.time;
    }
    updateStateFlowTree(rootNode, elements, time, interactions);
    normalizeNode(rootNode);
    return rootNode;
}
let sessionStartTime = Date.now();
export function processStartLoggingForDebugging() {
    sessionStartTime = Date.now();
    if (localStorage.getItem('veDebugLoggingEnabled') === DebugLoggingFormat.Intuitive) {
        maybeLogDebugEvent({ event: 'SessionStart' });
    }
}
// @ts-ignore
globalThis.setVeDebugLoggingEnabled = setVeDebugLoggingEnabled;
// @ts-ignore
globalThis.veDebugEventsLog = veDebugEventsLog;
// @ts-ignore
globalThis.findVeDebugImpression = findVeDebugImpression;
// @ts-ignore
globalThis.exportAdHocAnalysisLogForSql = exportAdHocAnalysisLogForSql;
// @ts-ignore
globalThis.buildStateFlow = buildStateFlow;
//# sourceMappingURL=Debugging.js.map