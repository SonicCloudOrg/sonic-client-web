// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../../../models/trace/trace.js';
import { dispatchClickEvent, dispatchKeyDownEvent, querySelectorErrorOnMissing, raf, renderElementIntoDOM, } from '../../../../testing/DOMHelpers.js';
import { describeWithEnvironment } from '../../../../testing/EnvironmentHelpers.js';
import { TraceLoader } from '../../../../testing/TraceLoader.js';
import * as PerfUI from './perf_ui.js';
describeWithEnvironment('FilmStripView', function () {
    async function renderView(filmStripData) {
        const filmStripView = new PerfUI.FilmStripView.FilmStripView();
        filmStripView.setModel(filmStripData);
        const container = document.createElement('div');
        renderElementIntoDOM(container);
        filmStripView.markAsRoot();
        filmStripView.show(container);
        // Give the film strip time to render.
        await raf();
        return filmStripView;
    }
    it('generates frames and timestamps', async function () {
        const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
        const filmStrip = await renderView(TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData));
        const renderedFrames = Array.from(filmStrip.contentElement.querySelectorAll('button.frame'));
        assert.lengthOf(renderedFrames, 5);
        const expectedTimeLabelsForFrames = [
            '0ms',
            '139ms',
            '222ms',
            '239ms',
            '289ms',
        ];
        // Ensure for each frame that we rendered the right snapshot from the trace
        // data. And that the time label is as expected.
        renderedFrames.forEach((frame, index) => {
            const img = querySelectorErrorOnMissing(frame, 'img');
            assert.isTrue(img.src.includes(traceParsedData.Screenshots[index].args.dataUri));
            const timeElement = querySelectorErrorOnMissing(frame, '.time');
            // Remove whitespace to avoid having to compare with &nbsp; in the
            // expected text.
            assert.strictEqual(timeElement.innerText.replace(/\s/, ''), expectedTimeLabelsForFrames[index]);
        });
        assert.deepStrictEqual(1, 1);
        filmStrip.detach();
    });
    describe('FilmStripView Dialog', function () {
        async function renderDialogWithTraceEngine(filmStrip, selectedFrameIndex) {
            const dialogWidget = PerfUI.FilmStripView.Dialog.fromFilmStrip(filmStrip, selectedFrameIndex);
            // Give the dialog time to render
            await raf();
            // Creating the dialog widget is enough to cause it to render, so now we can find the Dialog HTML.
            const container = document.body.querySelector('[data-devtools-glass-pane]');
            const containerShadowRoot = container?.shadowRoot;
            if (!containerShadowRoot) {
                throw new Error('Could not find the Dialog shadowRoot');
            }
            return { dialog: dialogWidget, shadowRoot: containerShadowRoot };
        }
        it('renders and shows the provided frame by default', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 0);
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[0].args.dataUri));
            dialog.hide();
        });
        it('does not let the user navigate back if they are at the first frame already', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 0);
            const previousBtn = shadowRoot.querySelector('devtools-button');
            assert.isTrue(previousBtn?.textContent === '◀' || previousBtn?.textContent === '&#9664;');
            if (!previousBtn) {
                throw new Error('Could not find previous button');
            }
            dispatchClickEvent(previousBtn);
            await raf();
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[0].args.dataUri));
            dialog.hide();
        });
        it('lets the user navigate back to the previous frame with the mouse', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 1);
            const previousBtn = shadowRoot.querySelector('devtools-button');
            assert.isTrue(previousBtn?.textContent === '◀' || previousBtn?.textContent === '&#9664;');
            if (!previousBtn) {
                throw new Error('Could not find previous button');
            }
            dispatchClickEvent(previousBtn);
            await raf();
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[0].args.dataUri));
            dialog.hide();
        });
        it('lets the user navigate back to the previous frame with the keyboard', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 1);
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            if (!renderedImage) {
                throw new Error('Could not find film-strip-dialog img');
            }
            dispatchKeyDownEvent(renderedImage, {
                key: 'ArrowLeft',
                bubbles: true,
            });
            await raf();
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[0].args.dataUri));
            dialog.hide();
        });
        it('lets the user navigate forwards to the next frame with the mouse', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 0);
            const nextBtn = shadowRoot.querySelectorAll('devtools-button')[1];
            assert.isTrue(nextBtn.textContent === '▶' || nextBtn.textContent === '&#9654;');
            if (!nextBtn) {
                throw new Error('Could not find next button');
            }
            dispatchClickEvent(nextBtn);
            await raf();
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[1].args.dataUri));
            dialog.hide();
        });
        it('does not let the user go beyond the last image', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const numberOfFrames = filmStrip.frames.length;
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, numberOfFrames - 1);
            let renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[numberOfFrames - 1].args.dataUri));
            const nextBtn = shadowRoot.querySelectorAll('devtools-button')[1];
            assert.isTrue(nextBtn.textContent === '▶' || nextBtn.textContent === '&#9654;');
            if (!nextBtn) {
                throw new Error('Could not find next button');
            }
            dispatchClickEvent(nextBtn);
            await raf();
            renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[numberOfFrames - 1].args.dataUri));
            dialog.hide();
        });
        it('lets the user navigate forwards to the next frame with the keyboard', async function () {
            const traceParsedData = await TraceLoader.traceEngine(this, 'web-dev.json.gz');
            const filmStrip = TraceEngine.Extras.FilmStrip.fromTraceData(traceParsedData);
            const { dialog, shadowRoot } = await renderDialogWithTraceEngine(filmStrip, 0);
            const renderedImage = shadowRoot.querySelector('[data-film-strip-dialog-img]');
            if (!renderedImage) {
                throw new Error('Could not find film-strip-dialog img');
            }
            dispatchKeyDownEvent(renderedImage, {
                key: 'ArrowRight',
                bubbles: true,
            });
            await raf();
            assert.isTrue(renderedImage?.currentSrc.includes(traceParsedData.Screenshots[1].args.dataUri));
            dialog.hide();
        });
    });
});
//# sourceMappingURL=FilmStripView.test.js.map