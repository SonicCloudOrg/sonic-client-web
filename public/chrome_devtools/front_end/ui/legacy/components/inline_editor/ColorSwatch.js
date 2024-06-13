// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../../core/common/common.js';
import * as Host from '../../../../core/host/host.js';
import * as i18n from '../../../../core/i18n/i18n.js';
import * as ColorPicker from '../../../legacy/components/color_picker/color_picker.js';
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as VisualLogging from '../../../visual_logging/visual_logging.js';
import colorSwatchStyles from './colorSwatch.css.js';
const UIStrings = {
    /**
     *@description Icon element title in Color Swatch of the inline editor in the Styles tab
     */
    shiftclickToChangeColorFormat: 'Shift-click to change color format',
};
const str_ = i18n.i18n.registerUIStrings('ui/legacy/components/inline_editor/ColorSwatch.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ColorChangedEvent extends Event {
    static eventName = 'colorchanged';
    data;
    constructor(text) {
        super(ColorChangedEvent.eventName, {});
        this.data = { text };
    }
}
export class ClickEvent extends Event {
    static eventName = 'swatchclick';
    constructor() {
        super(ClickEvent.eventName, {});
    }
}
export class ColorSwatch extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-color-swatch`;
    shadow = this.attachShadow({ mode: 'open' });
    tooltip = i18nString(UIStrings.shiftclickToChangeColorFormat);
    text = null;
    color = null;
    format = null;
    readonly = false;
    constructor() {
        super();
        this.shadow.adoptedStyleSheets = [
            colorSwatchStyles,
        ];
    }
    static isColorSwatch(element) {
        return element.localName === 'devtools-color-swatch';
    }
    getReadonly() {
        return this.readonly;
    }
    setReadonly(readonly) {
        if (this.readonly === readonly) {
            return;
        }
        this.readonly = readonly;
        this.render();
    }
    getColor() {
        return this.color;
    }
    getFormat() {
        return this.format;
    }
    getText() {
        return this.text;
    }
    get anchorBox() {
        const swatch = this.shadow.querySelector('.color-swatch');
        return swatch ? swatch.boxInWindow() : null;
    }
    /**
     * Render this swatch given a color object or text to be parsed as a color.
     * @param color The color object or string to use for this swatch.
     * @param formatOrUseUserSetting Either the format to be used as a string, or true to auto-detect the user-set format.
     * @param tooltip The tooltip to use on the swatch.
     */
    renderColor(color, formatOrUseUserSetting, tooltip) {
        if (typeof color === 'string') {
            this.color = Common.Color.parse(color);
        }
        else {
            this.color = color;
        }
        if (typeof formatOrUseUserSetting === 'string') {
            this.format = Common.Color.getFormat(formatOrUseUserSetting);
        }
        else {
            this.format = this.color?.format() ?? null;
        }
        if (this.color) {
            this.text = this.color.getAuthoredText() ?? this.color.asString(this.format ?? undefined);
        }
        else if (typeof color === 'string') {
            this.text = color;
        }
        if (tooltip) {
            this.tooltip = tooltip;
        }
        this.render();
    }
    renderTextOnly() {
        // Non-color values can be passed to the component (like 'none' from border style).
        LitHtml.render(LitHtml.html `<slot><span>${this.text}</span></slot>`, this.shadow, { host: this });
    }
    render() {
        if (!this.color) {
            this.renderTextOnly();
            return;
        }
        const colorSwatchClasses = LitHtml.Directives.classMap({
            'color-swatch': true,
            'readonly': this.readonly,
        });
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        // Note that we use a <slot> with a default value here to display the color text. Consumers of this component are
        // free to append any content to replace what is being shown here.
        // Note also that whitespace between nodes is removed on purpose to avoid pushing these elements apart. Do not
        // re-format the HTML code.
        LitHtml.render(LitHtml.html `<span class=${colorSwatchClasses} title=${this.tooltip}><span class="color-swatch-inner"
        style="background-color: ${this.text};"
        jslog=${VisualLogging.showStyleEditor('color').track({ click: true })}
        @click=${this.onClick}
        @mousedown=${this.consume}
        @dblclick=${this.consume}></span></span><slot><span>${this.text}</span></slot>`, this.shadow, { host: this });
        // clang-format on
    }
    onClick(e) {
        if (this.readonly) {
            return;
        }
        if (e.shiftKey) {
            e.stopPropagation();
            this.showFormatPicker(e);
            return;
        }
        this.dispatchEvent(new ClickEvent());
    }
    consume(e) {
        e.stopPropagation();
    }
    setFormat(format) {
        const newColor = this.color?.as(format);
        const text = newColor?.asString();
        if (!newColor || !text) {
            return;
        }
        this.color = newColor;
        this.format = this.color.format();
        this.text = text;
        this.render();
        this.dispatchEvent(new ColorChangedEvent(this.text));
    }
    showFormatPicker(e) {
        if (!this.color || !this.format) {
            return;
        }
        const contextMenu = new ColorPicker.FormatPickerContextMenu.FormatPickerContextMenu(this.color, this.format);
        void contextMenu.show(e, format => {
            this.setFormat(format);
            Host.userMetrics.colorConvertedFrom(0 /* Host.UserMetrics.ColorConvertedFrom.ColorSwatch */);
        });
    }
}
customElements.define('devtools-color-swatch', ColorSwatch);
//# sourceMappingURL=ColorSwatch.js.map