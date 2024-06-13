// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import { Dialog as DialogElement, } from './Dialog.js';
import iconDialogStyles from './iconDialog.css.js';
const UIStrings = {
    /**
     * @description Title of close button for the shortcuts dialog.
     */
    close: 'Close',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/dialogs/IconDialog.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ShowDialog extends Event {
    static eventName = 'showdialog';
    constructor() {
        super(ShowDialog.eventName);
    }
}
// This class provides a shorthand for a typical use case of Dialog,
// i.e. Dialog on an icon.
export class IconDialog extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-icon-dialog`;
    #shadow = this.attachShadow({ mode: 'open' });
    #renderBound = this.#render.bind(this);
    #data = null;
    #dialog = null;
    #icon = null;
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [iconDialogStyles];
    }
    set data(data) {
        this.#data = data;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    #showDialog() {
        if (!this.#dialog) {
            throw new Error('Dialog not found');
        }
        void this.#dialog.setDialogVisible(true);
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
        this.dispatchEvent(new ShowDialog());
    }
    #closeDialog() {
        if (!this.#dialog) {
            throw new Error('Dialog not found');
        }
        void this.#dialog.setDialogVisible(false);
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#renderBound);
    }
    #render() {
        if (this.#data === null) {
            throw new Error('IconDialog.data is not set');
        }
        if (!ComponentHelpers.ScheduledRender.isScheduledRender(this)) {
            throw new Error('IconDialog render was not scheduled');
        }
        let maybeCloseButton = LitHtml.nothing;
        if (this.#data.closeButton) {
            // Disabled until https://crbug.com/1079231 is fixed.
            // clang-format off
            maybeCloseButton = LitHtml.html `
        <div id='close-button-container'>
          <div id='close-button-right-aligner'>
            <${IconButton.Icon.Icon.litTagName}
              @click=${this.#closeDialog}
              .data=${{
                iconName: 'cross',
                color: 'var(--icon-default-hover)',
                width: '16px',
                height: '16px',
            }}
              jslog=${VisualLogging.close().track({ click: true })}
              title=${i18nString(UIStrings.close)}
            ></${IconButton.Icon.Icon.litTagName}>
          </div>
        </div>
      `;
            // clang-format on
        }
        // clang-format off
        LitHtml.render(LitHtml.html `
      <${IconButton.Icon.Icon.litTagName}
        @click=${this.#showDialog}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback(node => {
            this.#icon = node;
        })}
        .data=${this.#data.iconData}
      ></${IconButton.Icon.Icon.litTagName}>
      <${DialogElement.litTagName}
        @clickoutsidedialog=${this.#closeDialog}
        .showConnector=${true}
        .origin=${() => {
            if (!this.#icon) {
                throw new Error('Icon not found');
            }
            return this.#icon;
        }}
        .position=${this.#data.position}
        .horizontalAlignment=${this.#data.horizontalAlignment}
        .closeOnESC=${this.#data.closeOnESC}
        .closeOnScroll=${this.#data.closeOnScroll}
        on-render=${ComponentHelpers.Directives.nodeRenderedCallback(node => {
            this.#dialog = node;
        })}
      >
        ${maybeCloseButton}
        <div id='slot-container'>
          <slot></slot>
        </div>
      </${DialogElement.litTagName}>
    `, this.#shadow, { host: this });
        // clang-format on
    }
}
customElements.define('devtools-icon-dialog', IconDialog);
//# sourceMappingURL=IconDialog.js.map