// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import { activate, getMainFrame, navigate } from '../../testing/ResourceTreeHelpers.js';
import * as SDK from './sdk.js';
describeWithMockConnection('CSSModel', () => {
    it('gets the FontFace of a source URL', () => {
        const target = createTarget();
        const cssModel = new SDK.CSSModel.CSSModel(target);
        const src = 'mock.com';
        const fontFace = { fontFamily: 'Roboto', src, fontDisplay: 'swap' };
        cssModel.fontsUpdated(fontFace);
        const fontFaceForSource = cssModel.fontFaceForSource(src);
        assert.strictEqual(fontFaceForSource?.getFontFamily(), fontFace.fontFamily);
        assert.strictEqual(fontFaceForSource?.getSrc(), fontFace.src);
        assert.strictEqual(fontFaceForSource?.getFontDisplay(), fontFace.fontDisplay);
    });
    it('reports stylesheets that fail to load as constructed stylesheets', async () => {
        const target = createTarget();
        const cssModel = new SDK.CSSModel.CSSModel(target);
        const header = {
            styleSheetId: 'stylesheet',
            frameId: 'frame',
            sourceURL: 'http://stylesheet.test/404.css',
            origin: "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */,
            title: 'failed sheet',
            disabled: false,
            isInline: false,
            isMutable: false,
            isConstructed: false,
            loadingFailed: true,
            startLine: 0,
            startColumn: 0,
            length: 0,
            endLine: 0,
            endColumn: 0,
        };
        const addedPromise = cssModel.once(SDK.CSSModel.Events.StyleSheetAdded);
        cssModel.styleSheetAdded(header);
        const cssModelHeader = await addedPromise;
        assert.deepEqual(cssModelHeader.sourceURL, '');
        assert.deepEqual(cssModelHeader.isConstructed, true);
    });
    describe('on primary page change', () => {
        let target;
        let cssModel;
        const header = {
            styleSheetId: 'stylesheet',
            frameId: 'frame',
            sourceURL: 'http://example.com/styles.css',
            origin: "regular" /* Protocol.CSS.StyleSheetOrigin.Regular */,
            title: 'title',
            disabled: false,
            isInline: false,
            isMutable: false,
            isConstructed: false,
            loadingFailed: false,
            startLine: 0,
            startColumn: 0,
            length: 0,
            endLine: 0,
            endColumn: 0,
        };
        beforeEach(() => {
            target = createTarget();
            cssModel = target.model(SDK.CSSModel.CSSModel);
        });
        it('resets on navigation', () => {
            assert.exists(cssModel);
            cssModel.styleSheetAdded(header);
            let styleSheetIds = cssModel.getStyleSheetIdsForURL('http://example.com/styles.css');
            assert.deepEqual(styleSheetIds, ['stylesheet']);
            navigate(getMainFrame(target));
            styleSheetIds =
                cssModel.getStyleSheetIdsForURL('http://example.com/styles.css');
            assert.deepEqual(styleSheetIds, []);
        });
        it('does not reset on prerender activation', () => {
            assert.exists(cssModel);
            getMainFrame(target);
            cssModel.styleSheetAdded(header);
            let styleSheetIds = cssModel.getStyleSheetIdsForURL('http://example.com/styles.css');
            assert.deepEqual(styleSheetIds, ['stylesheet']);
            activate(target);
            styleSheetIds =
                cssModel.getStyleSheetIdsForURL('http://example.com/styles.css');
            assert.deepEqual(styleSheetIds, ['stylesheet']);
        });
    });
});
//# sourceMappingURL=CSSModel.test.js.map