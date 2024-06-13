// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as VisualLogging from '../../visual_logging/visual_logging.js';
// eslint-disable-next-line rulesdir/check_component_naming
export class WrappableComponent extends HTMLElement {
    wrapper = null;
    async render() {
    }
    wasShown() {
    }
    willHide() {
    }
}
export function legacyWrapper(base, component, jsLogContext) {
    return new class extends base {
        #component;
        constructor(..._args) {
            super(/* isWebComponent=*/ true);
            this.#component = component;
            this.#component.wrapper = this;
            void this.#component.render();
            this.contentElement.appendChild(this.#component);
            if (jsLogContext) {
                this.element.setAttribute('jslog', `${VisualLogging.pane().context(jsLogContext)}`);
            }
        }
        wasShown() {
            this.#component.wasShown();
            void this.#component.render();
        }
        willHide() {
            this.#component.willHide();
        }
        async doUpdate() {
            await this.#component.render();
        }
        getComponent() {
            return this.#component;
        }
    }();
    // clang-format on
}
//# sourceMappingURL=LegacyWrapper.js.map