// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import { ApplicationPanelTreeElement } from './ApplicationPanelTreeElement.js';
import * as ApplicationComponents from './components/components.js';
import { ReportingApiView } from './ReportingApiView.js';
const UIStrings = {
    /**
     *@description Label for an item in the Application Panel Sidebar of the Application panel
     */
    reportingApi: 'Reporting API',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/ReportingApiTreeElement.ts', UIStrings);
export const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class ReportingApiTreeElement extends ApplicationPanelTreeElement {
    view;
    constructor(storagePanel) {
        super(storagePanel, i18nString(UIStrings.reportingApi), false);
        const icon = IconButton.Icon.create('document');
        this.setLeadingIcons([icon]);
    }
    get itemURL() {
        return 'reportingApi://';
    }
    onselect(selectedByUser) {
        super.onselect(selectedByUser);
        if (!this.view) {
            this.view = new ReportingApiView(new ApplicationComponents.EndpointsGrid.EndpointsGrid());
        }
        this.showView(this.view);
        Host.userMetrics.panelShown('reporting-api');
        return false;
    }
}
//# sourceMappingURL=ReportingApiTreeElement.js.map