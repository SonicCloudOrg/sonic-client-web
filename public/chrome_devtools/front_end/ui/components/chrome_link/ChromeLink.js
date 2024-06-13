// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as Host from '../../../core/host/host.js';
import * as Platform from '../../../core/platform/platform.js';
import * as SDK from '../../../core/sdk/sdk.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as VisualLogging from '../../visual_logging/visual_logging.js';
import * as ComponentHelpers from '../helpers/helpers.js';
import chromeLinkStyles from './chromeLink.css.js';
// Use this component to render links to 'chrome://...'-URLs
// (for which regular <x-link>s do not work).
export class ChromeLink extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-chrome-link`;
    #shadow = this.attachShadow({ mode: 'open' });
    #boundRender = this.#render.bind(this);
    #href = '';
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [chromeLinkStyles];
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
    }
    set href(href) {
        if (!Common.ParsedURL.schemeIs(href, 'chrome:')) {
            throw new Error('ChromeLink href needs to start with \'chrome://\'');
        }
        this.#href = href;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#boundRender);
    }
    // Navigating to a chrome:// link via a normal anchor doesn't work, so we "navigate"
    // there using CDP.
    #handleClick(event) {
        const rootTarget = SDK.TargetManager.TargetManager.instance().rootTarget();
        if (rootTarget === null) {
            return;
        }
        const url = this.#href;
        void rootTarget.targetAgent().invoke_createTarget({ url }).then(result => {
            if (result.getError()) {
                Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(url);
            }
        });
        event.consume(true);
    }
    #render() {
        const urlForContext = new URL(this.#href);
        urlForContext.search = '';
        const jslogContext = Platform.StringUtilities.toKebabCase(urlForContext.toString());
        // clang-format off
        LitHtml.render(
        /* x-link doesn't work with custom click/keydown handlers */
        /* eslint-disable rulesdir/ban_a_tags_in_lit_html */
        LitHtml.html `
        <a href=${this.#href} class="link" target="_blank"
          jslog=${VisualLogging.link().track({ click: true }).context(jslogContext)}
          @click=${this.#handleClick}><slot></slot></a>
      `, this.#shadow, { host: this });
        // clang-format on
    }
}
customElements.define('devtools-chrome-link', ChromeLink);
//# sourceMappingURL=ChromeLink.js.map