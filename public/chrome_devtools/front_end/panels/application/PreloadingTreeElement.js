// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import { ApplicationPanelTreeElement, ExpandableApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import { PreloadingAttemptView, PreloadingRuleSetView, PreloadingSummaryView } from './preloading/PreloadingView.js';
const UIStrings = {
    /**
     *@description Text in Application Panel Sidebar of the Application panel
     */
    speculativeLoads: 'Speculative loads',
    /**
     *@description Text in Application Panel Sidebar of the Application panel
     */
    rules: 'Rules',
    /**
     *@description Text in Application Panel Sidebar of the Application panel
     */
    speculations: 'Speculations',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/PreloadingTreeElement.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
class PreloadingTreeElementBase extends ApplicationPanelTreeElement {
    #model;
    #viewConstructor;
    view;
    #path;
    #selectedInternal;
    constructor(panel, viewConstructor, path, title) {
        super(panel, title, false);
        this.#viewConstructor = viewConstructor;
        this.#path = path;
        const icon = IconButton.Icon.create('arrow-up-down');
        this.setLeadingIcons([icon]);
        this.#selectedInternal = false;
        // TODO(https://crbug.com/1384419): Set link
    }
    get itemURL() {
        return this.#path;
    }
    initialize(model) {
        this.#model = model;
        // Show the view if the model was initialized after selection.
        if (this.#selectedInternal && !this.view) {
            this.onselect(false);
        }
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        this.#selectedInternal = true;
        if (!this.#model) {
            return false;
        }
        if (!this.view) {
            this.view = new this.#viewConstructor(this.#model);
        }
        this.showView(this.view);
        return false;
    }
}
export class PreloadingSummaryTreeElement extends ExpandableApplicationPanelTreeElement {
    #model;
    #view;
    #selectedInternal;
    #ruleSet = null;
    #attempt = null;
    constructor(panel) {
        super(panel, i18nString(UIStrings.speculativeLoads), 'preloading');
        const icon = IconButton.Icon.create('arrow-up-down');
        this.setLeadingIcons([icon]);
        this.#selectedInternal = false;
        // TODO(https://crbug.com/1384419): Set link
    }
    // Note that
    //
    // - TreeElement.ensureSelection assumes TreeElement.treeOutline initalized.
    // - TreeElement.treeOutline is propagated in TreeElement.appendChild.
    //
    // So, `this.constructChildren` should be called just after `parent.appendChild(this)`
    // to enrich children with TreeElement.selectionElementInternal correctly.
    constructChildren(panel) {
        this.#ruleSet = new PreloadingRuleSetTreeElement(panel);
        this.#attempt = new PreloadingAttemptTreeElement(panel);
        this.appendChild(this.#ruleSet);
        this.appendChild(this.#attempt);
    }
    initialize(model) {
        if (this.#ruleSet === null || this.#attempt === null) {
            throw new Error('unreachable');
        }
        this.#model = model;
        this.#ruleSet.initialize(model);
        this.#attempt.initialize(model);
        // Show the view if the model was initialized after selection.
        if (this.#selectedInternal && !this.#view) {
            this.onselect(false);
        }
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        this.#selectedInternal = true;
        if (!this.#model) {
            return false;
        }
        if (!this.#view) {
            this.#view = new PreloadingSummaryView(this.#model);
        }
        this.showView(this.#view);
        return false;
    }
    expandAndRevealRuleSet(revealInfo) {
        if (this.#ruleSet === null) {
            throw new Error('unreachable');
        }
        this.expand();
        this.#ruleSet.revealRuleSet(revealInfo);
    }
    expandAndRevealAttempts(filter) {
        if (this.#attempt === null) {
            throw new Error('unreachable');
        }
        this.expand();
        this.#attempt.revealAttempts(filter);
    }
}
export class PreloadingRuleSetTreeElement extends PreloadingTreeElementBase {
    constructor(panel) {
        super(panel, PreloadingRuleSetView, 'preloading://rule-set', i18nString(UIStrings.rules));
    }
    revealRuleSet(revealInfo) {
        this.select();
        if (this.view === undefined) {
            return;
        }
        this.view?.revealRuleSet(revealInfo);
    }
}
class PreloadingAttemptTreeElement extends PreloadingTreeElementBase {
    constructor(panel) {
        super(panel, PreloadingAttemptView, 'preloading://attempt', i18nString(UIStrings.speculations));
    }
    revealAttempts(filter) {
        this.select();
        this.view?.setFilter(filter);
    }
}
//# sourceMappingURL=PreloadingTreeElement.js.map