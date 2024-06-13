/*
 * Copyright (C) 2013 Google Inc. All rights reserved.
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
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as UI from '../../ui/legacy/legacy.js';
import { InputModel } from './InputModel.js';
import screencastViewStyles from './screencastView.css.js';
const UIStrings = {
    /**
     *@description Accessible alt text for the screencast canvas rendering of the debug target webpage
     */
    screencastViewOfDebugTarget: 'Screencast view of debug target',
    /**
     *@description Glass pane element text content in Screencast View of the Remote Devices tab when toggling screencast
     */
    theTabIsInactive: 'The tab is inactive',
    /**
     *@description Glass pane element text content in Screencast View of the Remote Devices tab when toggling screencast
     */
    profilingInProgress: 'Profiling in progress',
    /**
     *@description Accessible text for the screencast back button
     */
    back: 'back',
    /**
     *@description Accessible text for the screencast forward button
     */
    forward: 'forward',
    /**
     *@description Accessible text for the screencast reload button
     */
    reload: 'reload',
    /**
     *@description Accessible text for the address bar in screencast view
     */
    addressBar: 'Address bar',
    /**
     *@description Accessible text for the touch emulation button.
     */
    touchInput: 'Use touch',
    /**
     *@description Accessible text for the mouse emulation button.
     */
    mouseInput: 'Use mouse',
};
const str_ = i18n.i18n.registerUIStrings('panels/screencast/ScreencastView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ScreencastView extends UI.Widget.VBox {
    screenCaptureModel;
    domModel;
    overlayModel;
    resourceTreeModel;
    networkManager;
    inputModel;
    shortcuts;
    scrollOffsetX;
    scrollOffsetY;
    screenZoom;
    screenOffsetTop;
    pageScaleFactor;
    imageElement;
    viewportElement;
    glassPaneElement;
    canvasElement;
    titleElement;
    context;
    imageZoom;
    tagNameElement;
    attributeElement;
    nodeWidthElement;
    nodeHeightElement;
    model;
    highlightConfig;
    navigationUrl;
    navigationBack;
    navigationForward;
    canvasContainerElement;
    isCasting;
    checkerboardPattern;
    targetInactive;
    deferredCasting;
    highlightNode;
    config;
    node;
    inspectModeConfig;
    navigationBar;
    navigationReload;
    navigationProgressBar;
    touchInputToggle;
    mouseInputToggle;
    touchInputToggleIcon;
    mouseInputToggleIcon;
    historyIndex;
    historyEntries;
    constructor(screenCaptureModel) {
        super();
        this.screenCaptureModel = screenCaptureModel;
        this.domModel = screenCaptureModel.target().model(SDK.DOMModel.DOMModel);
        this.overlayModel = screenCaptureModel.target().model(SDK.OverlayModel.OverlayModel);
        this.resourceTreeModel = screenCaptureModel.target().model(SDK.ResourceTreeModel.ResourceTreeModel);
        this.networkManager = screenCaptureModel.target().model(SDK.NetworkManager.NetworkManager);
        this.inputModel = screenCaptureModel.target().model(InputModel);
        this.setMinimumSize(150, 150);
        this.shortcuts = {};
        this.scrollOffsetX = 0;
        this.scrollOffsetY = 0;
        this.screenZoom = 1;
        this.screenOffsetTop = 0;
        this.pageScaleFactor = 1;
        this.imageZoom = 1;
    }
    initialize() {
        this.element.classList.add('screencast');
        this.createNavigationBar();
        this.viewportElement = this.element.createChild('div', 'screencast-viewport hidden');
        this.canvasContainerElement = this.viewportElement.createChild('div', 'screencast-canvas-container');
        this.glassPaneElement =
            this.canvasContainerElement.createChild('div', 'screencast-glasspane fill hidden');
        this.canvasElement = this.canvasContainerElement.createChild('canvas');
        UI.ARIAUtils.setLabel(this.canvasElement, i18nString(UIStrings.screencastViewOfDebugTarget));
        this.canvasElement.tabIndex = 0;
        this.canvasElement.addEventListener('mousedown', this.handleMouseEvent.bind(this), false);
        this.canvasElement.addEventListener('mouseup', this.handleMouseEvent.bind(this), false);
        this.canvasElement.addEventListener('mousemove', this.handleMouseEvent.bind(this), false);
        this.canvasElement.addEventListener('wheel', this.handleWheelEvent.bind(this), false);
        this.canvasElement.addEventListener('click', this.handleMouseEvent.bind(this), false);
        this.canvasElement.addEventListener('contextmenu', this.handleContextMenuEvent.bind(this), false);
        this.canvasElement.addEventListener('keydown', this.handleKeyEvent.bind(this), false);
        this.canvasElement.addEventListener('keyup', this.handleKeyEvent.bind(this), false);
        this.canvasElement.addEventListener('keypress', this.handleKeyEvent.bind(this), false);
        this.canvasElement.addEventListener('blur', this.handleBlurEvent.bind(this), false);
        this.titleElement =
            this.canvasContainerElement.createChild('div', 'screencast-element-title monospace hidden');
        this.tagNameElement = this.titleElement.createChild('span', 'screencast-tag-name');
        this.attributeElement = this.titleElement.createChild('span', 'screencast-attribute');
        UI.UIUtils.createTextChild(this.titleElement, ' ');
        const dimension = this.titleElement.createChild('span', 'screencast-dimension');
        this.nodeWidthElement = dimension.createChild('span');
        UI.UIUtils.createTextChild(dimension, ' × ');
        this.nodeHeightElement = dimension.createChild('span');
        this.titleElement.style.top = '0';
        this.titleElement.style.left = '0';
        this.imageElement = new Image();
        this.isCasting = false;
        this.context = this.canvasElement.getContext('2d');
        this.checkerboardPattern = this.createCheckerboardPattern(this.context);
        this.shortcuts[UI.KeyboardShortcut.KeyboardShortcut.makeKey('l', UI.KeyboardShortcut.Modifiers.Ctrl)] =
            this.focusNavigationBar.bind(this);
        SDK.TargetManager.TargetManager.instance().addEventListener("SuspendStateChanged" /* SDK.TargetManager.Events.SuspendStateChanged */, this.onSuspendStateChange, this);
        this.updateGlasspane();
    }
    wasShown() {
        this.startCasting();
        this.registerCSSFiles([screencastViewStyles]);
    }
    willHide() {
        this.stopCasting();
    }
    startCasting() {
        if (SDK.TargetManager.TargetManager.instance().allTargetsSuspended()) {
            return;
        }
        if (this.isCasting) {
            return;
        }
        this.isCasting = true;
        const maxImageDimension = 2048;
        const dimensions = this.viewportDimensions();
        if (dimensions.width < 0 || dimensions.height < 0) {
            this.isCasting = false;
            return;
        }
        dimensions.width *= window.devicePixelRatio;
        dimensions.height *= window.devicePixelRatio;
        // Note: startScreencast width and height are expected to be integers so must be floored.
        this.screenCaptureModel.startScreencast("jpeg" /* Protocol.Page.StartScreencastRequestFormat.Jpeg */, 80, Math.floor(Math.min(maxImageDimension, dimensions.width)), Math.floor(Math.min(maxImageDimension, dimensions.height)), undefined, this.screencastFrame.bind(this), this.screencastVisibilityChanged.bind(this));
        if (this.overlayModel) {
            this.overlayModel.setHighlighter(this);
        }
    }
    stopCasting() {
        if (!this.isCasting) {
            return;
        }
        this.isCasting = false;
        this.screenCaptureModel.stopScreencast();
        for (const emulationModel of SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel)) {
            void emulationModel.overrideEmulateTouch(false);
        }
        if (this.overlayModel) {
            this.overlayModel.setHighlighter(null);
        }
    }
    screencastFrame(base64Data, metadata) {
        this.imageElement.onload = () => {
            this.pageScaleFactor = metadata.pageScaleFactor;
            this.screenOffsetTop = metadata.offsetTop;
            this.scrollOffsetX = metadata.scrollOffsetX;
            this.scrollOffsetY = metadata.scrollOffsetY;
            const deviceSizeRatio = metadata.deviceHeight / metadata.deviceWidth;
            const dimensionsCSS = this.viewportDimensions();
            this.imageZoom = Math.min(dimensionsCSS.width / this.imageElement.naturalWidth, dimensionsCSS.height / (this.imageElement.naturalWidth * deviceSizeRatio));
            this.viewportElement.classList.remove('hidden');
            const bordersSize = BORDERS_SIZE;
            if (this.imageZoom < 1.01 / window.devicePixelRatio) {
                this.imageZoom = 1 / window.devicePixelRatio;
            }
            this.screenZoom = this.imageElement.naturalWidth * this.imageZoom / metadata.deviceWidth;
            this.viewportElement.style.width = metadata.deviceWidth * this.screenZoom + bordersSize + 'px';
            this.viewportElement.style.height = metadata.deviceHeight * this.screenZoom + bordersSize + 'px';
            const data = this.highlightNode ? { node: this.highlightNode, selectorList: undefined } : { clear: true };
            void this.updateHighlightInOverlayAndRepaint(data, this.highlightConfig);
        };
        this.imageElement.src = 'data:image/jpg;base64,' + base64Data;
    }
    isGlassPaneActive() {
        return !this.glassPaneElement.classList.contains('hidden');
    }
    screencastVisibilityChanged(visible) {
        this.targetInactive = !visible;
        this.updateGlasspane();
    }
    onSuspendStateChange() {
        if (SDK.TargetManager.TargetManager.instance().allTargetsSuspended()) {
            this.stopCasting();
        }
        else {
            this.startCasting();
        }
        this.updateGlasspane();
    }
    updateGlasspane() {
        if (this.targetInactive) {
            this.glassPaneElement.textContent = i18nString(UIStrings.theTabIsInactive);
            this.glassPaneElement.classList.remove('hidden');
        }
        else if (SDK.TargetManager.TargetManager.instance().allTargetsSuspended()) {
            this.glassPaneElement.textContent = i18nString(UIStrings.profilingInProgress);
            this.glassPaneElement.classList.remove('hidden');
        }
        else {
            this.glassPaneElement.classList.add('hidden');
        }
    }
    async handleMouseEvent(event) {
        if (this.isGlassPaneActive()) {
            event.consume();
            return;
        }
        if (!this.pageScaleFactor || !this.domModel) {
            return;
        }
        if (!this.inspectModeConfig) {
            if (this.inputModel) {
                this.inputModel.emitMouseEvent(event, this.screenOffsetTop, this.screenZoom);
            }
            event.preventDefault();
            if (event.type === 'mousedown') {
                this.canvasElement.focus();
            }
            return;
        }
        const position = this.convertIntoScreenSpace(event);
        const node = await this.domModel.nodeForLocation(Math.floor(position.x / this.pageScaleFactor + this.scrollOffsetX), Math.floor(position.y / this.pageScaleFactor + this.scrollOffsetY), Common.Settings.Settings.instance().moduleSetting('show-ua-shadow-dom').get());
        if (!node) {
            return;
        }
        if (event.type === 'mousemove') {
            void this.updateHighlightInOverlayAndRepaint({ node, selectorList: undefined }, this.inspectModeConfig);
            this.domModel.overlayModel().nodeHighlightRequested({ nodeId: node.id });
        }
        else if (event.type === 'click') {
            this.domModel.overlayModel().inspectNodeRequested({ backendNodeId: node.backendNodeId() });
        }
    }
    async handleWheelEvent(event) {
        if (this.isGlassPaneActive()) {
            event.consume();
            return;
        }
        if (!this.pageScaleFactor || !this.domModel) {
            return;
        }
        if (this.inputModel) {
            this.inputModel.emitWheelEvent(event, this.screenOffsetTop, this.screenZoom);
        }
        event.preventDefault();
    }
    handleKeyEvent(event) {
        if (this.isGlassPaneActive()) {
            event.consume();
            return;
        }
        const shortcutKey = UI.KeyboardShortcut.KeyboardShortcut.makeKeyFromEvent(event);
        const handler = this.shortcuts[shortcutKey];
        if (handler && handler(event)) {
            event.consume();
            return;
        }
        if (this.inputModel) {
            this.inputModel.emitKeyEvent(event);
        }
        event.consume();
        this.canvasElement.focus();
    }
    handleBlurEvent() {
        if (this.inputModel && this.mouseInputToggle?.disabled) {
            const event = new MouseEvent('mouseup');
            this.inputModel.emitMouseEvent(event, this.screenOffsetTop, this.screenZoom);
        }
    }
    handleContextMenuEvent(event) {
        event.consume(true);
    }
    convertIntoScreenSpace(event) {
        return {
            x: Math.round(event.offsetX / this.screenZoom),
            y: Math.round(event.offsetY / this.screenZoom - this.screenOffsetTop),
        };
    }
    onResize() {
        if (this.deferredCasting) {
            clearTimeout(this.deferredCasting);
            delete this.deferredCasting;
        }
        this.stopCasting();
        this.deferredCasting = window.setTimeout(this.startCasting.bind(this), 100);
    }
    highlightInOverlay(data, config) {
        void this.updateHighlightInOverlayAndRepaint(data, config);
    }
    async updateHighlightInOverlayAndRepaint(data, config) {
        let node = null;
        if ('node' in data) {
            node = data.node;
        }
        if (!node && 'deferredNode' in data) {
            node = await data.deferredNode.resolvePromise();
        }
        if (!node && 'object' in data) {
            const domModel = data.object.runtimeModel().target().model(SDK.DOMModel.DOMModel);
            if (domModel) {
                node = await domModel.pushObjectAsNodeToFrontend(data.object);
            }
        }
        this.highlightNode = node;
        this.highlightConfig = config;
        if (!node) {
            this.model = null;
            this.config = null;
            this.node = null;
            this.titleElement.classList.add('hidden');
            this.repaint();
            return;
        }
        this.node = node;
        void node.boxModel().then(model => {
            if (!model || !this.pageScaleFactor) {
                this.repaint();
                return;
            }
            this.model = this.scaleModel(model);
            this.config = config;
            this.repaint();
        });
    }
    scaleModel(model) {
        function scaleQuad(quad) {
            for (let i = 0; i < quad.length; i += 2) {
                quad[i] = quad[i] * this.pageScaleFactor * this.screenZoom;
                quad[i + 1] = (quad[i + 1] * this.pageScaleFactor + this.screenOffsetTop) * this.screenZoom;
            }
        }
        scaleQuad.call(this, model.content);
        scaleQuad.call(this, model.padding);
        scaleQuad.call(this, model.border);
        scaleQuad.call(this, model.margin);
        return model;
    }
    repaint() {
        const model = this.model;
        const config = this.config;
        const canvasWidth = this.canvasElement.getBoundingClientRect().width;
        const canvasHeight = this.canvasElement.getBoundingClientRect().height;
        this.canvasElement.width = window.devicePixelRatio * canvasWidth;
        this.canvasElement.height = window.devicePixelRatio * canvasHeight;
        this.context.save();
        this.context.scale(window.devicePixelRatio, window.devicePixelRatio);
        // Paint top and bottom gutter.
        this.context.save();
        if (this.checkerboardPattern) {
            this.context.fillStyle = this.checkerboardPattern;
        }
        this.context.fillRect(0, 0, canvasWidth, this.screenOffsetTop * this.screenZoom);
        this.context.fillRect(0, this.screenOffsetTop * this.screenZoom + this.imageElement.naturalHeight * this.imageZoom, canvasWidth, canvasHeight);
        this.context.restore();
        if (model && config) {
            this.context.save();
            const quads = [];
            const isTransparent = (color) => Boolean(color.a && color.a === 0);
            if (model.content && config.contentColor && !isTransparent(config.contentColor)) {
                quads.push({ quad: model.content, color: config.contentColor });
            }
            if (model.padding && config.paddingColor && !isTransparent(config.paddingColor)) {
                quads.push({ quad: model.padding, color: config.paddingColor });
            }
            if (model.border && config.borderColor && !isTransparent(config.borderColor)) {
                quads.push({ quad: model.border, color: config.borderColor });
            }
            if (model.margin && config.marginColor && !isTransparent(config.marginColor)) {
                quads.push({ quad: model.margin, color: config.marginColor });
            }
            for (let i = quads.length - 1; i > 0; --i) {
                this.drawOutlinedQuadWithClip(quads[i].quad, quads[i - 1].quad, quads[i].color);
            }
            if (quads.length > 0) {
                this.drawOutlinedQuad(quads[0].quad, quads[0].color);
            }
            this.context.restore();
            this.drawElementTitle();
            this.context.globalCompositeOperation = 'destination-over';
        }
        this.context.drawImage(this.imageElement, 0, this.screenOffsetTop * this.screenZoom, this.imageElement.naturalWidth * this.imageZoom, this.imageElement.naturalHeight * this.imageZoom);
        this.context.restore();
    }
    cssColor(color) {
        if (!color) {
            return 'transparent';
        }
        return Common.Color.Legacy.fromRGBA([color.r, color.g, color.b, color.a !== undefined ? color.a : 1])
            .asString("rgba" /* Common.Color.Format.RGBA */) ||
            '';
    }
    quadToPath(quad) {
        this.context.beginPath();
        this.context.moveTo(quad[0], quad[1]);
        this.context.lineTo(quad[2], quad[3]);
        this.context.lineTo(quad[4], quad[5]);
        this.context.lineTo(quad[6], quad[7]);
        this.context.closePath();
        return this.context;
    }
    drawOutlinedQuad(quad, fillColor) {
        this.context.save();
        this.context.lineWidth = 2;
        this.quadToPath(quad).clip();
        this.context.fillStyle = this.cssColor(fillColor);
        this.context.fill();
        this.context.restore();
    }
    drawOutlinedQuadWithClip(quad, clipQuad, fillColor) {
        this.context.fillStyle = this.cssColor(fillColor);
        this.context.save();
        this.context.lineWidth = 0;
        this.quadToPath(quad).fill();
        this.context.globalCompositeOperation = 'destination-out';
        this.context.fillStyle = 'red';
        this.quadToPath(clipQuad).fill();
        this.context.restore();
    }
    drawElementTitle() {
        if (!this.node) {
            return;
        }
        const canvasWidth = this.canvasElement.getBoundingClientRect().width;
        const canvasHeight = this.canvasElement.getBoundingClientRect().height;
        const lowerCaseName = this.node.localName() || this.node.nodeName().toLowerCase();
        this.tagNameElement.textContent = lowerCaseName;
        this.attributeElement.textContent = getAttributesForElementTitle(this.node);
        this.nodeWidthElement.textContent = String(this.model ? this.model.width : 0);
        this.nodeHeightElement.textContent = String(this.model ? this.model.height : 0);
        this.titleElement.classList.remove('hidden');
        const titleWidth = this.titleElement.offsetWidth + 6;
        const titleHeight = this.titleElement.offsetHeight + 4;
        const anchorTop = this.model ? this.model.margin[1] : 0;
        const anchorBottom = this.model ? this.model.margin[7] : 0;
        const arrowHeight = 7;
        let renderArrowUp = false;
        let renderArrowDown = false;
        let boxX = Math.max(2, this.model ? this.model.margin[0] : 0);
        if (boxX + titleWidth > canvasWidth) {
            boxX = canvasWidth - titleWidth - 2;
        }
        let boxY;
        if (anchorTop > canvasHeight) {
            boxY = canvasHeight - titleHeight - arrowHeight;
            renderArrowDown = true;
        }
        else if (anchorBottom < 0) {
            boxY = arrowHeight;
            renderArrowUp = true;
        }
        else if (anchorBottom + titleHeight + arrowHeight < canvasHeight) {
            boxY = anchorBottom + arrowHeight - 4;
            renderArrowUp = true;
        }
        else if (anchorTop - titleHeight - arrowHeight > 0) {
            boxY = anchorTop - titleHeight - arrowHeight + 3;
            renderArrowDown = true;
        }
        else {
            boxY = arrowHeight;
        }
        this.context.save();
        this.context.translate(0.5, 0.5);
        this.context.beginPath();
        this.context.moveTo(boxX, boxY);
        if (renderArrowUp) {
            this.context.lineTo(boxX + 2 * arrowHeight, boxY);
            this.context.lineTo(boxX + 3 * arrowHeight, boxY - arrowHeight);
            this.context.lineTo(boxX + 4 * arrowHeight, boxY);
        }
        this.context.lineTo(boxX + titleWidth, boxY);
        this.context.lineTo(boxX + titleWidth, boxY + titleHeight);
        if (renderArrowDown) {
            this.context.lineTo(boxX + 4 * arrowHeight, boxY + titleHeight);
            this.context.lineTo(boxX + 3 * arrowHeight, boxY + titleHeight + arrowHeight);
            this.context.lineTo(boxX + 2 * arrowHeight, boxY + titleHeight);
        }
        this.context.lineTo(boxX, boxY + titleHeight);
        this.context.closePath();
        this.context.fillStyle = 'var(--sys-color-yellow-container)';
        this.context.fill();
        this.context.strokeStyle = 'var(--sys-color-outline)';
        this.context.stroke();
        this.context.restore();
        this.titleElement.style.top = (boxY + 3) + 'px';
        this.titleElement.style.left = (boxX + 3) + 'px';
    }
    viewportDimensions() {
        const gutterSize = 30;
        const bordersSize = BORDERS_SIZE;
        const width = this.element.offsetWidth - bordersSize - gutterSize;
        const height = this.element.offsetHeight - bordersSize - gutterSize - NAVBAR_HEIGHT;
        return { width: width, height: height };
    }
    setInspectMode(mode, config) {
        this.inspectModeConfig = mode !== "none" /* Protocol.Overlay.InspectMode.None */ ? config : null;
        return Promise.resolve();
    }
    highlightFrame(_frameId) {
    }
    createCheckerboardPattern(context) {
        const pattern = document.createElement('canvas');
        const size = 32;
        pattern.width = size * 2;
        pattern.height = size * 2;
        const pctx = pattern.getContext('2d');
        pctx.fillStyle = 'var(--sys-color-neutral-outline)';
        pctx.fillRect(0, 0, size * 2, size * 2);
        pctx.fillStyle = 'var(--sys-color-surface-variant)';
        pctx.fillRect(0, 0, size, size);
        pctx.fillRect(size, size, size, size);
        return context.createPattern(pattern, 'repeat');
    }
    createNavigationBar() {
        this.navigationBar = this.element.createChild('div', 'screencast-navigation');
        this.navigationBack = this.navigationBar.createChild('button', 'navigation');
        {
            const icon = this.navigationBack.appendChild(new IconButton.Icon.Icon());
            icon.data = { color: 'var(--icon-default)', iconName: 'arrow-back' };
        }
        this.navigationBack.disabled = true;
        UI.ARIAUtils.setLabel(this.navigationBack, i18nString(UIStrings.back));
        this.navigationForward = this.navigationBar.createChild('button', 'navigation');
        {
            const icon = this.navigationForward.appendChild(new IconButton.Icon.Icon());
            icon.data = { color: 'var(--icon-default)', iconName: 'arrow-forward' };
        }
        this.navigationForward.disabled = true;
        UI.ARIAUtils.setLabel(this.navigationForward, i18nString(UIStrings.forward));
        this.navigationReload = this.navigationBar.createChild('button', 'navigation');
        {
            const icon = this.navigationReload.appendChild(new IconButton.Icon.Icon());
            icon.data = { color: 'var(--icon-default)', iconName: 'refresh' };
        }
        UI.ARIAUtils.setLabel(this.navigationReload, i18nString(UIStrings.reload));
        this.navigationUrl = this.navigationBar.appendChild(UI.UIUtils.createInput());
        this.navigationUrl.type = 'text';
        UI.ARIAUtils.setLabel(this.navigationUrl, i18nString(UIStrings.addressBar));
        this.mouseInputToggle = this.navigationBar.createChild('button');
        this.mouseInputToggle.disabled = true;
        {
            this.mouseInputToggleIcon = this.mouseInputToggle.appendChild(new IconButton.Icon.Icon());
            this.mouseInputToggleIcon.data = { color: 'var(--icon-toggled)', iconName: 'mouse' };
        }
        UI.ARIAUtils.setLabel(this.mouseInputToggle, i18nString(UIStrings.mouseInput));
        this.touchInputToggle = this.navigationBar.createChild('button');
        {
            this.touchInputToggleIcon = this.touchInputToggle.appendChild(new IconButton.Icon.Icon());
            this.touchInputToggleIcon.data = { color: 'var(--icon-default)', iconName: 'touch-app' };
        }
        UI.ARIAUtils.setLabel(this.touchInputToggle, i18nString(UIStrings.touchInput));
        this.navigationProgressBar = new ProgressTracker(this.resourceTreeModel, this.networkManager, this.navigationBar.createChild('div', 'progress'));
        if (this.resourceTreeModel) {
            this.navigationBack.addEventListener('click', this.navigateToHistoryEntry.bind(this, -1), false);
            this.navigationForward.addEventListener('click', this.navigateToHistoryEntry.bind(this, 1), false);
            this.navigationReload.addEventListener('click', this.navigateReload.bind(this), false);
            this.navigationUrl.addEventListener('keyup', this.navigationUrlKeyUp.bind(this), true);
            this.touchInputToggle.addEventListener('click', this.#toggleTouchEmulation.bind(this, true), false);
            this.mouseInputToggle.addEventListener('click', this.#toggleTouchEmulation.bind(this, false), false);
            void this.requestNavigationHistory();
            this.resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.PrimaryPageChanged, this.requestNavigationHistoryEvent, this);
            this.resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.CachedResourcesLoaded, this.requestNavigationHistoryEvent, this);
        }
    }
    navigateToHistoryEntry(offset) {
        if (!this.resourceTreeModel) {
            return;
        }
        const newIndex = (this.historyIndex || 0) + offset;
        if (!this.historyEntries || newIndex < 0 || newIndex >= this.historyEntries.length) {
            return;
        }
        this.resourceTreeModel.navigateToHistoryEntry(this.historyEntries[newIndex]);
        void this.requestNavigationHistory();
    }
    navigateReload() {
        if (!this.resourceTreeModel) {
            return;
        }
        this.resourceTreeModel.reloadPage();
    }
    navigationUrlKeyUp(event) {
        if (event.key !== 'Enter') {
            return;
        }
        let url = this.navigationUrl.value;
        if (!url) {
            return;
        }
        if (!url.match(SCHEME_REGEX)) {
            url = 'http://' + url;
        }
        if (this.resourceTreeModel) {
            void this.resourceTreeModel.navigate(url);
        }
        this.canvasElement.focus();
    }
    #toggleTouchEmulation(value) {
        if (!this.canvasContainerElement || !this.isCasting || !this.mouseInputToggle || !this.touchInputToggle ||
            !this.mouseInputToggleIcon || !this.touchInputToggleIcon) {
            return;
        }
        const models = SDK.TargetManager.TargetManager.instance().models(SDK.EmulationModel.EmulationModel);
        for (const model of models) {
            void model.overrideEmulateTouch(value);
        }
        this.mouseInputToggle.disabled = !value;
        this.touchInputToggle.disabled = value;
        this.mouseInputToggleIcon.data = {
            ...this.mouseInputToggleIcon.data,
            color: this.mouseInputToggle.disabled ? 'var(--icon-toggled)' : 'var(--icon-default)',
        };
        this.touchInputToggleIcon.data = {
            ...this.touchInputToggleIcon.data,
            color: this.touchInputToggle.disabled ? 'var(--icon-toggled)' : 'var(--icon-default)',
        };
        this.canvasContainerElement.classList.toggle('touchable', value);
    }
    requestNavigationHistoryEvent() {
        void this.requestNavigationHistory();
    }
    async requestNavigationHistory() {
        const history = this.resourceTreeModel ? await this.resourceTreeModel.navigationHistory() : null;
        if (!history) {
            return;
        }
        this.historyIndex = history.currentIndex;
        this.historyEntries = history.entries;
        this.navigationBack.disabled = this.historyIndex === 0;
        this.navigationForward.disabled = this.historyIndex === (this.historyEntries.length - 1);
        let url = this.historyEntries[this.historyIndex].url;
        const match = url.match(HTTP_REGEX);
        if (match) {
            url = match[1];
        }
        Host.InspectorFrontendHost.InspectorFrontendHostInstance.inspectedURLChanged(url);
        this.navigationUrl.value = decodeURI(url);
    }
    focusNavigationBar() {
        this.navigationUrl.focus();
        this.navigationUrl.select();
        return true;
    }
}
export const BORDERS_SIZE = 44;
export const NAVBAR_HEIGHT = 29;
export const HTTP_REGEX = /^http:\/\/(.+)/;
export const SCHEME_REGEX = /^(https?|about|chrome):/;
export class ProgressTracker {
    element;
    requestIds;
    startedRequests;
    finishedRequests;
    maxDisplayedProgress;
    constructor(resourceTreeModel, networkManager, element) {
        this.element = element;
        if (resourceTreeModel) {
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.PrimaryPageChanged, this.onPrimaryPageChanged, this);
            resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.Load, this.onLoad, this);
        }
        if (networkManager) {
            networkManager.addEventListener(SDK.NetworkManager.Events.RequestStarted, this.onRequestStarted, this);
            networkManager.addEventListener(SDK.NetworkManager.Events.RequestFinished, this.onRequestFinished, this);
        }
        this.requestIds = null;
        this.startedRequests = 0;
        this.finishedRequests = 0;
        this.maxDisplayedProgress = 0;
    }
    onPrimaryPageChanged() {
        this.requestIds = new Map();
        this.startedRequests = 0;
        this.finishedRequests = 0;
        this.maxDisplayedProgress = 0;
        this.updateProgress(0.1); // Display first 10% on navigation start.
    }
    onLoad() {
        this.requestIds = null;
        this.updateProgress(1); // Display 100% progress on load, hide it in 0.5s.
        window.setTimeout(() => {
            if (!this.navigationProgressVisible()) {
                this.displayProgress(0);
            }
        }, 500);
    }
    navigationProgressVisible() {
        return this.requestIds !== null;
    }
    onRequestStarted(event) {
        if (!this.navigationProgressVisible()) {
            return;
        }
        const request = event.data.request;
        // Ignore long-living WebSockets for the sake of progress indicator, as we won't be waiting them anyway.
        if (request.resourceType() === Common.ResourceType.resourceTypes.WebSocket) {
            return;
        }
        if (this.requestIds) {
            this.requestIds.set(request.requestId(), request);
        }
        ++this.startedRequests;
    }
    onRequestFinished(event) {
        if (!this.navigationProgressVisible()) {
            return;
        }
        const request = event.data;
        if (this.requestIds && !this.requestIds.has(request.requestId())) {
            return;
        }
        ++this.finishedRequests;
        window.setTimeout(() => {
            this.updateProgress(this.finishedRequests / this.startedRequests * 0.9); // Finished requests drive the progress up to 90%.
        }, 500); // Delay to give the new requests time to start. This makes the progress smoother.
    }
    updateProgress(progress) {
        if (!this.navigationProgressVisible()) {
            return;
        }
        if (this.maxDisplayedProgress >= progress) {
            return;
        }
        this.maxDisplayedProgress = progress;
        this.displayProgress(progress);
    }
    displayProgress(progress) {
        this.element.style.width = (100 * progress) + '%';
    }
}
function getAttributesForElementTitle(node) {
    const id = node.getAttribute('id');
    const className = node.getAttribute('class');
    let selector = id ? '#' + id : '';
    if (className) {
        selector += '.' + className.trim().replace(/\s+/g, '.');
    }
    if (selector.length > 50) {
        selector = selector.substring(0, 50) + '…';
    }
    return selector;
}
//# sourceMappingURL=ScreencastView.js.map