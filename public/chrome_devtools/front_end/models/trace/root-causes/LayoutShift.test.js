// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { describeWithMockConnection, } from '../../../testing/MockConnection.js';
import { getBaseTraceParseModelData } from '../../../testing/TraceHelpers.js';
import * as TraceEngine from '../trace.js';
import * as RootCauses from './RootCauses.js';
function assertArrayHasNoNulls(inputArray) {
    inputArray.forEach((item, index) => {
        if (item === null) {
            assert.fail(`Found null at array index ${index}`);
        }
    });
}
function createMockStyle(cssProperties) {
    return { cssProperties, shorthandEntries: [] };
}
function createMockMatchedRules(cssProperties) {
    return [{
            rule: {
                style: createMockStyle(cssProperties),
                selectorList: { selectors: [], text: '' },
                origin: "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */,
            },
            matchingSelectors: [],
        }];
}
describeWithMockConnection('LayoutShift root causes', () => {
    /*
       * This test has to do a lot of mocking and creating of fake data in order
       * to function. Normally in the perfomance panel tests we prefer to parse a
       * real trace and use that, but in this case because LayoutShift root causes
       * rely on having an actual DevTools instance open with access to the DOM,
       * we can't do that. So therefore we completely mock the set of data
       * required.
       */
    describe('assigns root causes to layout shifts', () => {
        let layoutShifts;
        let prePaintEvents;
        let resizeEvents;
        let injectedIframeEvents;
        let fontChanges;
        let unknownLayoutInvalidation;
        let domNodeByBackendIdMap;
        let model;
        let modelMut;
        let resizeEventsNodeIds;
        let iframesNodeIds;
        let shifts;
        let matchedStylesMock;
        let protocolInterface;
        let computedStylesMock;
        let fontFaceMock;
        const fontSource = 'mock-source.woff';
        const renderBlockSource = 'mock-source.css';
        beforeEach(() => {
            fontFaceMock = { fontFamily: 'Roboto', src: fontSource, fontDisplay: 'swap' };
            // Layout shifts for which we want to extract potential root causes.
            shifts = [{ ts: 10 }, { ts: 30 }, { ts: 50 }, { ts: 70 }, { ts: 90 }];
            // Initialize the shifts.
            for (const shift of shifts) {
                shift.args = {
                    frame: 'frame-id-123',
                };
                shift.name = 'LayoutShift';
            }
            const clusters = [{ events: shifts }];
            // PrePaint events to which each layout shift belongs.
            prePaintEvents = [{ ts: 5, dur: 30 }, { ts: 45, dur: 30 }, { ts: 85, dur: 10 }];
            resizeEvents = [{ ts: 0 }, { ts: 25 }, { ts: 80 }, { ts: 100 }];
            injectedIframeEvents =
                [{ ts: 2 }, { ts: 81 }];
            fontChanges =
                [{ ts: 3 }, { ts: 35 }];
            unknownLayoutInvalidation =
                [{ ts: 4 }, { ts: 36 }];
            // |Resize|---|Iframe|---|Fonts-|---|--PrePaint 1--|----|Resize|---|Fonts-|-|---PrePaint 2---|---|Resize|---|Iframe|---|PrePaint 3|
            // ----------------------------------|LS 1|-|LS 2|----------------------------|LS 3|-|LS 4|-----------------------------|LS 5|
            // Initialize the LI events by adding a nodeId and setting a reason so that they
            // aren't filtered out.
            for (let i = 0; i < resizeEvents.length; i++) {
                resizeEvents[i].args = {
                    data: {
                        nodeId: i + 1,
                        reason: "Size changed" /* TraceEngine.Types.TraceEvents.LayoutInvalidationReason.SIZE_CHANGED */,
                        nodeName: 'IMG',
                        frame: 'frame-id-123',
                    },
                };
            }
            for (let i = 0; i < injectedIframeEvents.length; i++) {
                injectedIframeEvents[i].args = {
                    data: {
                        nodeId: i + 11,
                        reason: "Added to layout" /* TraceEngine.Types.TraceEvents.LayoutInvalidationReason.ADDED_TO_LAYOUT */,
                        nodeName: 'IFRAME',
                        frame: 'frame-id-123',
                    },
                };
            }
            for (let i = 0; i < fontChanges.length; i++) {
                fontChanges[i].args = {
                    data: {
                        nodeId: i + 21,
                        reason: "Fonts changed" /* TraceEngine.Types.TraceEvents.LayoutInvalidationReason.FONTS_CHANGED */,
                        nodeName: 'DIV',
                        frame: 'frame-id-123',
                    },
                };
            }
            for (let i = 0; i < unknownLayoutInvalidation.length; i++) {
                unknownLayoutInvalidation[i].args = {
                    data: {
                        nodeId: i + 31,
                        reason: "Unknown" /* TraceEngine.Types.TraceEvents.LayoutInvalidationReason.UNKNOWN */,
                        nodeName: 'DIV',
                        frame: 'frame-id-123',
                    },
                };
            }
            const layoutInvalidationEvents = [
                ...resizeEvents,
                ...injectedIframeEvents,
                ...fontChanges,
                ...unknownLayoutInvalidation,
            ].sort((a, b) => a.ts - b.ts);
            for (const e of layoutInvalidationEvents) {
                e.name = "LayoutInvalidationTracking" /* TraceEngine.Types.TraceEvents.KnownEventName.LayoutInvalidationTracking */;
            }
            // Map from fake BackendNodeId to fake Protocol.DOM.Node used by the handler to
            // resolve the nodeIds in the traces.
            const domNodeByBackendIdMapEntries = [];
            const domNodeByIdMap = new Map();
            for (let i = 0; i < layoutInvalidationEvents.length; i++) {
                const backendNodeId = layoutInvalidationEvents[i].args.data.nodeId;
                const nodeId = i;
                const nodeName = layoutInvalidationEvents[i].args.data.nodeName || 'DIV';
                const fakeNode = {
                    backendNodeId,
                    nodeId,
                    localName: nodeName.toLowerCase(),
                    nodeName,
                    attributes: [],
                    nodeType: Node.ELEMENT_NODE,
                };
                domNodeByBackendIdMapEntries.push([backendNodeId, fakeNode]);
                domNodeByIdMap.set(nodeId, fakeNode);
            }
            domNodeByBackendIdMap =
                new Map(domNodeByBackendIdMapEntries);
            model = getBaseTraceParseModelData();
            modelMut = model;
            // Now fake out the relevant LayoutShift data
            modelMut.LayoutShifts.prePaintEvents = prePaintEvents;
            modelMut.LayoutShifts.layoutInvalidationEvents = layoutInvalidationEvents;
            modelMut.LayoutShifts.backendNodeIds = [...domNodeByBackendIdMap.keys()];
            modelMut.LayoutShifts.clusters = clusters;
            modelMut.LayoutShifts.scheduleStyleInvalidationEvents = [];
            modelMut.Initiators = {
                eventToInitiator: new Map(),
                initiatorToEvents: new Map(),
            };
            resizeEventsNodeIds = resizeEvents.map(li => Number(li.args.data.nodeId));
            iframesNodeIds = injectedIframeEvents.map(li => Number(li.args.data.nodeId));
            computedStylesMock = [];
            matchedStylesMock = {};
            protocolInterface = {
                getInitiatorForRequest(_) {
                    return null;
                },
                async pushNodesByBackendIdsToFrontend(backendNodeIds) {
                    return backendNodeIds.map(id => {
                        const node = domNodeByBackendIdMap.get(id);
                        if (!node) {
                            throw new Error('unexpected backend id');
                        }
                        return node.nodeId;
                    });
                },
                async getNode(nodeId) {
                    const node = domNodeByIdMap.get(nodeId);
                    if (!node) {
                        throw new Error('unexpected id');
                    }
                    return node;
                },
                async getComputedStyleForNode(_) {
                    return computedStylesMock;
                },
                async getMatchedStylesForNode(_) {
                    return {
                        ...matchedStylesMock,
                        getError: () => undefined,
                    };
                },
                fontFaceForSource(url) {
                    if (url === fontFaceMock.src) {
                        return fontFaceMock;
                    }
                    return;
                },
            };
            layoutShifts = new RootCauses.LayoutShiftRootCauses(protocolInterface, { enableIframeRootCauses: true });
        });
        it('uses cached node details', async () => {
            // Use duplicate node ids for invalidation events that use `getNode`
            resizeEvents.forEach(e => {
                e.args.data.nodeId = 1;
            });
            injectedIframeEvents.forEach(e => {
                e.args.data.nodeId = 11;
            });
            const getNodeSpy = sinon.spy(protocolInterface, 'getNode');
            const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
            assertArrayHasNoNulls(rootCauses);
            assert.strictEqual(getNodeSpy.callCount, 2);
        });
        describe('Unsized media', () => {
            it('marks unsized media node in LayoutInvalidation events as a potential root cause to layout shifts correctly', async () => {
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.unsizedMedia.map(media => Number(media.node.backendNodeId));
                });
                // Test the nodes from the LI events are assinged as the potential root causes to layout shifts correctly.
                assert.strictEqual(shiftCausesNodeIds[0].length, 1);
                assert.strictEqual(shiftCausesNodeIds[0][0], resizeEventsNodeIds[0]);
                assert.strictEqual(shiftCausesNodeIds[1].length, 1);
                assert.strictEqual(shiftCausesNodeIds[1][0], resizeEventsNodeIds[0]);
                assert.strictEqual(shiftCausesNodeIds[2].length, 1);
                assert.strictEqual(shiftCausesNodeIds[2][0], resizeEventsNodeIds[1]);
                assert.strictEqual(shiftCausesNodeIds[3].length, 1);
                assert.strictEqual(shiftCausesNodeIds[3][0], resizeEventsNodeIds[1]);
                assert.strictEqual(shiftCausesNodeIds[4].length, 1);
                assert.strictEqual(shiftCausesNodeIds[4][0], resizeEventsNodeIds[2]);
            });
            it('sets partially sized media\'s authored dimensions properly, using inline styles.', async () => {
                // Set height using inline and matched CSS styles.
                matchedStylesMock = {
                    attributesStyle: createMockStyle([]),
                    inlineStyle: createMockStyle([{ name: 'height', value: '20px' }]),
                    matchedCSSRules: createMockMatchedRules([{ name: 'height', value: '10px' }]),
                };
                const rootCause = await layoutShifts.rootCausesForEvent(model, shifts[0]);
                const authoredDimensions = rootCause?.unsizedMedia[0].authoredDimensions;
                if (!authoredDimensions) {
                    assert.fail('Expected defined authored dimensions');
                    return;
                }
                // Assert inline styles are preferred.
                assert.strictEqual(authoredDimensions.height, '20px');
                assert.isUndefined(authoredDimensions.width);
                assert.isUndefined(authoredDimensions.aspectRatio);
            });
            it('sets partially sized media\'s authored dimensions properly, using matched CSS rules.', async () => {
                // Set height using matched CSS rules.
                matchedStylesMock = {
                    attributesStyle: createMockStyle([{ name: 'height', value: '10px' }]),
                    inlineStyle: createMockStyle([]),
                    matchedCSSRules: createMockMatchedRules([{ name: 'height', value: '30px' }]),
                };
                const rootCause = await layoutShifts.rootCausesForEvent(model, shifts[1]);
                const authoredDimensions = rootCause?.unsizedMedia[0].authoredDimensions;
                if (!authoredDimensions) {
                    assert.fail('Expected defined authored dimensions');
                    return;
                }
                // Assert matched CSS rules styles are preferred.
                assert.strictEqual(authoredDimensions.height, '30px');
            });
            it('sets partially unsized media\'s computed dimensions properly.', async () => {
                const height = '10px';
                const width = '20px';
                computedStylesMock = [
                    { name: 'height', value: height },
                    { name: 'width', value: width },
                ];
                const rootCause = await layoutShifts.rootCausesForEvent(model, shifts[1]);
                const computedDimensions = rootCause?.unsizedMedia[0].computedDimensions;
                if (!computedDimensions) {
                    assert.fail('Expected defined computed dimensions');
                    return;
                }
                // Assert correct computed styles are set.
                assert.strictEqual(computedDimensions.height, height);
                assert.strictEqual(computedDimensions.width, width);
            });
            async function assertAmountOfBlamedLayoutInvalidations(amount) {
                const allShiftsRootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                const nodesFromLayoutInvalidations = new Set();
                for (const currentShiftRootCauses of allShiftsRootCauses) {
                    if (currentShiftRootCauses === null) {
                        continue;
                    }
                    for (const media of currentShiftRootCauses.unsizedMedia) {
                        nodesFromLayoutInvalidations.add(media.node.backendNodeId);
                    }
                }
                assert.strictEqual(nodesFromLayoutInvalidations.size, amount);
            }
            it('ignores media with inline height and width', async () => {
                matchedStylesMock = {
                    attributesStyle: createMockStyle([{ name: 'height', value: '10px' }, { name: 'width', value: '10px' }]),
                    inlineStyle: createMockStyle([]),
                    matchedCSSRules: createMockMatchedRules([]),
                };
                await assertAmountOfBlamedLayoutInvalidations(0);
            });
            it('ignores media with CSS height and width', async () => {
                matchedStylesMock = {
                    attributesStyle: createMockStyle([]),
                    inlineStyle: createMockStyle([]),
                    matchedCSSRules: createMockMatchedRules([{ name: 'height', value: '10px' }, { name: 'width', value: '10px' }]),
                };
                await assertAmountOfBlamedLayoutInvalidations(0);
            });
            it('ignores media with height and aspect ratio', async () => {
                matchedStylesMock = {
                    attributesStyle: createMockStyle([{ name: 'height', value: '10px' }, { name: 'aspect-ratio', value: '1' }]),
                    inlineStyle: createMockStyle([]),
                    matchedCSSRules: createMockMatchedRules([]),
                };
                await assertAmountOfBlamedLayoutInvalidations(0);
            });
            it('ignores media with explicit height and width', async () => {
                matchedStylesMock = {
                    attributesStyle: createMockStyle([{ name: 'height', value: '10px' }]),
                    inlineStyle: createMockStyle([{ name: 'width', value: '10px' }]),
                    matchedCSSRules: createMockMatchedRules([]),
                };
                await assertAmountOfBlamedLayoutInvalidations(0);
            });
            it('ignores media with fixed position as potential root causes of layout shifts', async () => {
                computedStylesMock = [{ name: 'position', value: 'fixed' }];
                await assertAmountOfBlamedLayoutInvalidations(0);
            });
            it('does not ignore media with only height or width explicitly set as potential root causes of layout shifts', async () => {
                matchedStylesMock = {
                    attributesStyle: createMockStyle([{ name: 'height', value: '10px' }]),
                    inlineStyle: createMockStyle([]),
                    matchedCSSRules: createMockMatchedRules([]),
                };
                await assertAmountOfBlamedLayoutInvalidations(3);
            });
            it('does not error when there are no layout shifts', async () => {
                // Layout shifts for which we want to associate LayoutInvalidation events as potential root causes.
                shifts = [{ ts: 10 }, { ts: 30 }, { ts: 50 }, { ts: 70 }, { ts: 90 }];
                // Initialize the shifts.
                for (const shift of shifts) {
                    shift.args = {
                        frame: 'frame-id-123',
                    };
                    shift.name = 'LayoutShift';
                }
                const clusters = [{ events: shifts }];
                modelMut.LayoutShifts.clusters = clusters;
                assert.doesNotThrow(async () => {
                    await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                });
            });
        });
        describe('Injected iframes', () => {
            it('marks injected iframes in LayoutInvalidation events as a potential root cause to layout shifts correctly', async () => {
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.iframes.map(node => Number(node.iframe.backendNodeId));
                });
                // Test the nodes from the LI events are assinged as the potential root causes to layout shifts correctly.
                assert.strictEqual(shiftCausesNodeIds[0].length, 1);
                assert.strictEqual(shiftCausesNodeIds[0][0], iframesNodeIds[0]);
                assert.strictEqual(shiftCausesNodeIds[4].length, 1);
                assert.strictEqual(shiftCausesNodeIds[4][0], iframesNodeIds[1]);
            });
            it('ignores injected iframes if disabled', async () => {
                layoutShifts = new RootCauses.LayoutShiftRootCauses(protocolInterface, { enableIframeRootCauses: false });
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                assert(rootCauses.every(cause => cause.iframes.length === 0), 'contained iframe root causes');
            });
            it('ignores events that could not add or resize an iframe', async () => {
                injectedIframeEvents.forEach(e => {
                    e.args.data.nodeName = 'DIV';
                    e.args.data.reason = "Size changed" /* TraceEngine.Types.TraceEvents.LayoutInvalidationReason.SIZE_CHANGED */;
                });
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                assert(rootCauses.every(cause => cause.iframes.length === 0), 'contained iframe root causes');
            });
        });
        describe('Font changes', () => {
            // Mock two font network request that finished right before the mocked layout invalidation events
            // that correspond to font changes.
            const fontRequests = [
                {
                    dur: TraceEngine.Types.Timing.MicroSeconds(2),
                    ts: TraceEngine.Types.Timing.MicroSeconds(0),
                    args: {
                        data: {
                            url: fontSource,
                            mimeType: 'font/woff2',
                        },
                    },
                },
                {
                    dur: TraceEngine.Types.Timing.MicroSeconds(30),
                    ts: TraceEngine.Types.Timing.MicroSeconds(0),
                    args: {
                        data: {
                            url: fontSource,
                            mimeType: 'font/woff2',
                        },
                    },
                },
            ];
            it('marks fonts changes in LayoutInvalidation events as a potential root cause to layout shifts correctly', async () => {
                modelMut.NetworkRequests.byTime = fontRequests;
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.fontChanges;
                });
                // Test the font requests are marked as potential layout shift root causes
                // in the correct order.
                assert.deepEqual(shiftCausesNodeIds[0][0]?.request, fontRequests[0]);
                assert.deepEqual(shiftCausesNodeIds[1][0]?.request, fontRequests[0]);
                assert.deepEqual(shiftCausesNodeIds[2][0]?.request, fontRequests[1]);
                assert.deepEqual(shiftCausesNodeIds[3][0]?.request, fontRequests[1]);
                assert.deepEqual(shiftCausesNodeIds[2][1]?.request, fontRequests[0]);
                assert.deepEqual(shiftCausesNodeIds[3][1]?.request, fontRequests[0]);
            });
            it('ignores requests for fonts whose font-display property is "optional"', async () => {
                const optionalFontRequests = [{
                        dur: TraceEngine.Types.Timing.MicroSeconds(2),
                        ts: TraceEngine.Types.Timing.MicroSeconds(0),
                        args: {
                            data: {
                                url: fontSource,
                                mimeType: 'font/woff2',
                            },
                        },
                    }];
                modelMut.NetworkRequests.byTime = optionalFontRequests;
                fontFaceMock = { fontFamily: 'Roboto', src: fontSource, fontDisplay: 'optional' };
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.fontChanges;
                });
                // Test no font request is marked as potential layout shift root causes
                assert.strictEqual(shiftCausesNodeIds[0].length, 0);
                assert.strictEqual(shiftCausesNodeIds[1].length, 0);
                assert.strictEqual(shiftCausesNodeIds[2].length, 0);
                assert.strictEqual(shiftCausesNodeIds[3].length, 0);
            });
            it('ignores requests for fonts that lie outside the fixed time window from ending at the "font change" layout invalidation event', async () => {
                const optionalFontRequests = [{
                        dur: TraceEngine.Types.Timing.MicroSeconds(2),
                        ts: TraceEngine.Types.Timing.MicroSeconds(85),
                        args: {
                            data: {
                                url: fontSource,
                                mimeType: 'font/woff2',
                            },
                        },
                    }];
                modelMut.NetworkRequests.byTime = optionalFontRequests;
                fontFaceMock = { fontFamily: 'Roboto', src: fontSource, fontDisplay: 'swap' };
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.fontChanges;
                });
                // Test no font request is marked as potential layout shift root causes
                assert.strictEqual(shiftCausesNodeIds[0].length, 0);
                assert.strictEqual(shiftCausesNodeIds[1].length, 0);
                assert.strictEqual(shiftCausesNodeIds[2].length, 0);
                assert.strictEqual(shiftCausesNodeIds[3].length, 0);
            });
        });
        describe('Render blocking request', () => {
            const RenderBlockingRequest = [
                {
                    dur: TraceEngine.Types.Timing.MicroSeconds(2),
                    ts: TraceEngine.Types.Timing.MicroSeconds(0),
                    args: {
                        data: {
                            url: renderBlockSource,
                            mimeType: 'text/plain',
                            renderBlocking: 'blocking',
                        },
                    },
                },
                {
                    dur: TraceEngine.Types.Timing.MicroSeconds(30),
                    ts: TraceEngine.Types.Timing.MicroSeconds(0),
                    args: {
                        data: {
                            url: renderBlockSource,
                            mimeType: 'text/css',
                            renderBlocking: 'non_blocking',
                        },
                    },
                },
            ];
            it('marks render blocks in LayoutInvalidation events as a potential root cause to layout shifts correctly', async () => {
                modelMut.NetworkRequests.byTime = RenderBlockingRequest;
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const shiftCausesNodeIds = rootCauses.map(cause => {
                    return cause.renderBlockingRequests;
                });
                // Test the rendering block requests are marked as potential layout shift root causes
                // in the correct order.
                assert.deepEqual(shiftCausesNodeIds[2][0]?.request, RenderBlockingRequest[0]);
                assert.deepEqual(shiftCausesNodeIds[3][0]?.request, RenderBlockingRequest[0]);
                assert.deepEqual(shiftCausesNodeIds[4][0]?.request, RenderBlockingRequest[0]);
            });
        });
        describe('Scripts causing relayout/style recalc', () => {
            it('adds a Layout initiator\'s stack trace to the corresponding layout shift root causes.', async () => {
                const mockStackTrace = [
                    {
                        scriptId: 0,
                        functionName: 'foo',
                        columnNumber: 10,
                        lineNumber: 1,
                        url: 'Main.js',
                    },
                    {
                        scriptId: 2,
                        functionName: 'bar',
                        columnNumber: 10,
                        lineNumber: 20,
                        url: 'Main.js',
                    },
                ];
                // Mock a Layout event, which corresponds to the last shift.
                // a stack trace.
                modelMut.Renderer.allTraceEntries = [{
                        name: 'Layout',
                        ts: 82,
                    }];
                const node = {
                    entry: model.Renderer.allTraceEntries[0],
                };
                model.Renderer.entryToNode.set(model.Renderer.allTraceEntries[0], node);
                // Fake out the initiator detection and link the Layout event with a fake InvalidateLayout event.
                model.Initiators.eventToInitiator.set(model.Renderer.allTraceEntries[0], {
                    name: 'InvalidateLayout',
                    args: {
                        data: {
                            stackTrace: mockStackTrace,
                        },
                    },
                });
                // Verify the Layout initiator's stack trace is added to the last shift.
                const rootCauses = await Promise.all(shifts.map(shift => layoutShifts.rootCausesForEvent(model, shift)));
                assertArrayHasNoNulls(rootCauses);
                const rootCauseStackTraces = rootCauses.map(cause => {
                    return cause.scriptStackTrace;
                });
                const stackTracesForLastShift = rootCauseStackTraces.at(-1);
                if (!stackTracesForLastShift) {
                    assert.fail('No stack traces found for layout shift');
                    return;
                }
                assert.strictEqual(stackTracesForLastShift, mockStackTrace);
            });
        });
    });
});
//# sourceMappingURL=LayoutShift.test.js.map