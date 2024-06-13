// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../../core/host/host.js';
import * as Workspace from '../../../models/workspace/workspace.js';
import { dispatchFocusEvent, dispatchFocusOutEvent, dispatchInputEvent, dispatchKeyDownEvent, dispatchPasteEvent, renderElementIntoDOM, } from '../../../testing/DOMHelpers.js';
import { deinitializeGlobalVars, initializeGlobalVars, } from '../../../testing/EnvironmentHelpers.js';
import { createFileSystemUISourceCode } from '../../../testing/UISourceCodeHelpers.js';
import { recordedMetricsContain, resetRecordedMetrics, } from '../../../testing/UserMetricsHelpers.js';
import * as Coordinator from '../../../ui/components/render_coordinator/render_coordinator.js';
import * as UI from '../../../ui/legacy/legacy.js';
import * as SourcesComponents from './components.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
describe('HeadersView', () => {
    const commitWorkingCopySpy = sinon.spy();
    before(async () => {
        await initializeGlobalVars();
    });
    after(async () => {
        await deinitializeGlobalVars();
    });
    beforeEach(() => {
        commitWorkingCopySpy.resetHistory();
        resetRecordedMetrics();
    });
    async function renderEditor() {
        const editor = new SourcesComponents.HeadersView.HeadersViewComponent();
        editor.data = {
            headerOverrides: [
                {
                    applyTo: '*',
                    headers: [
                        {
                            name: 'server',
                            value: 'DevTools Unit Test Server',
                        },
                        {
                            name: 'access-control-allow-origin',
                            value: '*',
                        },
                    ],
                },
                {
                    applyTo: '*.jpg',
                    headers: [
                        {
                            name: 'jpg-header',
                            value: 'only for jpg files',
                        },
                    ],
                },
            ],
            parsingError: false,
            uiSourceCode: {
                name: () => '.headers',
                setWorkingCopy: () => { },
                commitWorkingCopy: commitWorkingCopySpy,
            },
        };
        renderElementIntoDOM(editor);
        assert.isNotNull(editor.shadowRoot);
        await coordinator.done();
        return editor;
    }
    async function renderEditorWithinWrapper() {
        const workspace = Workspace.Workspace.WorkspaceImpl.instance();
        const headers = `[
      {
        "applyTo": "*",
        "headers": [
          {
            "name": "server",
            "value": "DevTools Unit Test Server"
          },
          {
            "name": "access-control-allow-origin",
            "value": "*"
          }
        ]
      },
      {
        "applyTo": "*.jpg",
        "headers": [{
          "name": "jpg-header",
          "value": "only for jpg files"
        }]
      }
    ]`;
        const { uiSourceCode, project } = createFileSystemUISourceCode({
            url: 'file:///path/to/overrides/example.html',
            mimeType: 'text/html',
            content: headers,
        });
        uiSourceCode.commitWorkingCopy = commitWorkingCopySpy;
        project.canSetFileContent = () => true;
        const editorWrapper = new SourcesComponents.HeadersView.HeadersView(uiSourceCode);
        await uiSourceCode.requestContentData();
        await coordinator.done();
        const editor = editorWrapper.getComponent();
        renderElementIntoDOM(editor);
        assert.isNotNull(editor.shadowRoot);
        await coordinator.done();
        workspace.removeProject(project);
        return editor;
    }
    async function changeEditable(editable, value) {
        dispatchFocusEvent(editable, { bubbles: true });
        editable.innerText = value;
        dispatchInputEvent(editable, { inputType: 'insertText', data: value, bubbles: true, composed: true });
        dispatchFocusOutEvent(editable, { bubbles: true });
        await coordinator.done();
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
    }
    async function pressButton(shadowRoot, rowIndex, selector) {
        const rowElements = shadowRoot.querySelectorAll('.row');
        const button = rowElements[rowIndex].querySelector(selector);
        assert.instanceOf(button, HTMLElement);
        button.click();
        await coordinator.done();
    }
    function getRowContent(shadowRoot) {
        const rows = Array.from(shadowRoot.querySelectorAll('.row'));
        return rows.map(row => {
            return Array.from(row.querySelectorAll('div, .editable'))
                .map(element => element.innerText)
                .join('');
        });
    }
    function getSingleRowContent(shadowRoot, rowIndex) {
        const rows = Array.from(shadowRoot.querySelectorAll('.row'));
        assert.isTrue(rows.length > rowIndex);
        return Array.from(rows[rowIndex].querySelectorAll('div, .editable'))
            .map(element => element.innerText)
            .join('');
    }
    function isWholeElementContentSelected(element) {
        const textContent = element.textContent;
        if (!textContent || textContent.length < 1 || !element.hasSelection()) {
            return false;
        }
        const selection = element.getComponentSelection();
        if (!selection || selection.rangeCount < 1) {
            return false;
        }
        if (selection.anchorNode !== selection.focusNode) {
            return false;
        }
        const range = selection.getRangeAt(0);
        return (range.endOffset - range.startOffset === textContent.length);
    }
    it('shows an error message when parsingError is true', async () => {
        const editor = new SourcesComponents.HeadersView.HeadersViewComponent();
        editor.data = {
            headerOverrides: [],
            parsingError: true,
            uiSourceCode: {
                name: () => '.headers',
            },
        };
        renderElementIntoDOM(editor);
        assert.isNotNull(editor.shadowRoot);
        await coordinator.done();
        const errorHeader = editor.shadowRoot.querySelector('.error-header');
        assert.strictEqual(errorHeader?.textContent, 'Error when parsing \'.headers\'.');
    });
    it('displays data and allows editing', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        const addRuleButton = editor.shadowRoot.querySelector('.add-block');
        assert.instanceOf(addRuleButton, HTMLElement);
        assert.strictEqual(addRuleButton.textContent?.trim(), 'Add override rule');
        const learnMoreLink = editor.shadowRoot.querySelector('.learn-more-row x-link');
        assert.instanceOf(learnMoreLink, HTMLElement);
        assert.strictEqual(learnMoreLink.title, 'https://goo.gle/devtools-override');
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        await changeEditable(editables[0], 'index.html');
        await changeEditable(editables[1], 'content-type');
        await changeEditable(editables[4], 'example.com');
        await changeEditable(editables[7], 'is image');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:index.html',
            'content-type:DevTools Unit Test Server',
            'access-control-allow-origin:example.com',
            'Apply to:*.jpg',
            'jpg-header:is image',
        ]);
        assert.strictEqual(commitWorkingCopySpy.callCount, 4);
    });
    it('resets edited value to previous state on Escape key', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 1), 'server:DevTools Unit Test Server');
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        assert.strictEqual(editables.length, 8);
        const headerValue = editables[2];
        headerValue.focus();
        headerValue.innerText = 'discard_me';
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 1), 'server:discard_me');
        dispatchKeyDownEvent(headerValue, {
            key: 'Escape',
            bubbles: true,
        });
        await coordinator.done();
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 1), 'server:DevTools Unit Test Server');
        const headerName = editables[1];
        headerName.focus();
        headerName.innerText = 'discard_me_2';
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 1), 'discard_me_2:DevTools Unit Test Server');
        dispatchKeyDownEvent(headerName, {
            key: 'Escape',
            bubbles: true,
        });
        await coordinator.done();
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 1), 'server:DevTools Unit Test Server');
    });
    it('selects the whole content when clicking on an editable field', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        let element = editables[0];
        element.focus();
        assert.isTrue(isWholeElementContentSelected(element));
        element = editables[1];
        element.focus();
        assert.isTrue(isWholeElementContentSelected(element));
        element = editables[2];
        element.focus();
        assert.isTrue(isWholeElementContentSelected(element));
    });
    it('un-selects the content when an editable field loses focus', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        const element = editables[0];
        element.focus();
        assert.isTrue(isWholeElementContentSelected(element));
        element.blur();
        assert.isFalse(element.hasSelection());
    });
    it('handles pressing \'Enter\' key by removing focus and moving it to the next field if possible', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        assert.strictEqual(editables.length, 8);
        const lastHeaderName = editables[6];
        const lastHeaderValue = editables[7];
        assert.isFalse(lastHeaderName.hasSelection());
        assert.isFalse(lastHeaderValue.hasSelection());
        lastHeaderName.focus();
        assert.isTrue(isWholeElementContentSelected(lastHeaderName));
        assert.isFalse(lastHeaderValue.hasSelection());
        dispatchKeyDownEvent(lastHeaderName, { key: 'Enter', bubbles: true });
        assert.isFalse(lastHeaderName.hasSelection());
        assert.isTrue(isWholeElementContentSelected(lastHeaderValue));
        dispatchKeyDownEvent(lastHeaderValue, { key: 'Enter', bubbles: true });
        for (const editable of editables) {
            assert.isFalse(editable.hasSelection());
        }
    });
    it('sets empty \'ApplyTo\' to \'*\'', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        assert.strictEqual(editables.length, 8);
        const applyTo = editables[5];
        assert.strictEqual(applyTo.innerHTML, '*.jpg');
        applyTo.innerText = '';
        dispatchInputEvent(applyTo, { inputType: 'deleteContentBackward', data: null, bubbles: true });
        assert.strictEqual(applyTo.innerHTML, '');
        dispatchFocusOutEvent(applyTo, { bubbles: true });
        assert.strictEqual(applyTo.innerHTML, '*');
        assert.strictEqual(commitWorkingCopySpy.callCount, 1);
    });
    it('removes the entire header when the header name is deleted', async () => {
        const editor = await renderEditorWithinWrapper();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        assert.strictEqual(editables.length, 8);
        const headerName = editables[1];
        assert.strictEqual(headerName.innerHTML, 'server');
        headerName.innerText = '';
        dispatchInputEvent(headerName, { inputType: 'deleteContentBackward', data: null, bubbles: true });
        assert.strictEqual(headerName.innerHTML, '');
        dispatchFocusOutEvent(headerName, { bubbles: true });
        await coordinator.done();
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        assert.strictEqual(commitWorkingCopySpy.callCount, 1);
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
    });
    it('allows adding headers', async () => {
        const editor = await renderEditorWithinWrapper();
        await coordinator.done();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        await pressButton(editor.shadowRoot, 1, '.add-header');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'header-name-1:header value',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        await changeEditable(editables[3], 'cache-control');
        await changeEditable(editables[4], 'max-age=1000');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'cache-control:max-age=1000',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
    });
    it('allows adding "ApplyTo"-blocks', async () => {
        const editor = await renderEditorWithinWrapper();
        await coordinator.done();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        const button = editor.shadowRoot.querySelector('.add-block');
        assert.instanceOf(button, HTMLElement);
        button.click();
        await coordinator.done();
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
            'Apply to:*',
            'header-name-1:header value',
        ]);
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        await changeEditable(editables[8], 'articles/*');
        await changeEditable(editables[9], 'cache-control');
        await changeEditable(editables[10], 'max-age=1000');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
            'Apply to:articles/*',
            'cache-control:max-age=1000',
        ]);
    });
    it('allows removing headers', async () => {
        const editor = await renderEditorWithinWrapper();
        await coordinator.done();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        await pressButton(editor.shadowRoot, 1, '.remove-header');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
        let hiddenDeleteElements = await editor.shadowRoot.querySelectorAll('.row.padded > .remove-header[hidden]');
        assert.isTrue(hiddenDeleteElements.length === 0, 'remove-header button is visible');
        await pressButton(editor.shadowRoot, 1, '.remove-header');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'header-name-1:header value',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        hiddenDeleteElements = await editor.shadowRoot.querySelectorAll('.row.padded > .remove-header[hidden]');
        assert.isTrue(hiddenDeleteElements.length === 1, 'remove-header button is hidden');
    });
    it('allows removing "ApplyTo"-blocks', async () => {
        const editor = await renderEditorWithinWrapper();
        await coordinator.done();
        assert.isNotNull(editor.shadowRoot);
        let rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*',
            'server:DevTools Unit Test Server',
            'access-control-allow-origin:*',
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        await pressButton(editor.shadowRoot, 0, '.remove-block');
        rows = getRowContent(editor.shadowRoot);
        assert.deepEqual(rows, [
            'Apply to:*.jpg',
            'jpg-header:only for jpg files',
        ]);
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
    });
    it('removes formatting for pasted content', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const editables = editor.shadowRoot.querySelectorAll('.editable');
        assert.strictEqual(editables.length, 8);
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 2), 'access-control-allow-origin:*');
        const headerValue = editables[4];
        headerValue.focus();
        const dt = new DataTransfer();
        dt.setData('text/plain', 'foo\nbar');
        dt.setData('text/html', 'This is <b>bold</b>');
        dispatchPasteEvent(headerValue, { clipboardData: dt, bubbles: true });
        await coordinator.done();
        assert.deepEqual(getSingleRowContent(editor.shadowRoot, 2), 'access-control-allow-origin:foo bar');
        assert.isTrue(recordedMetricsContain("DevTools.ActionTaken" /* Host.InspectorFrontendHostAPI.EnumeratedHistogram.ActionTaken */, Host.UserMetrics.Action.HeaderOverrideHeadersFileEdited));
    });
    it('shows context menu', async () => {
        const editor = await renderEditor();
        assert.isNotNull(editor.shadowRoot);
        const contextMenuShow = sinon.stub(UI.ContextMenu.ContextMenu.prototype, 'show').resolves();
        editor.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }));
        assert.isTrue(contextMenuShow.calledOnce);
    });
});
//# sourceMappingURL=HeadersView.test.js.map