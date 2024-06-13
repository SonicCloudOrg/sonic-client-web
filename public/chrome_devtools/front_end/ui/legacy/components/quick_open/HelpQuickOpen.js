// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as IconButton from '../../../components/icon_button/icon_button.js';
import * as UI from '../../legacy.js';
import { getRegisteredProviders, Provider, registerProvider } from './FilteredListWidget.js';
import { QuickOpenImpl } from './QuickOpen.js';
export class HelpQuickOpen extends Provider {
    providers;
    constructor(jslogContext) {
        super(jslogContext);
        this.providers = [];
        getRegisteredProviders().forEach(this.addProvider.bind(this));
    }
    async addProvider(extension) {
        if (extension.titleSuggestion) {
            this.providers.push({
                prefix: extension.prefix || '',
                iconName: extension.iconName,
                iconWidth: extension.iconWidth,
                title: extension.titlePrefix() + ' ' + extension.titleSuggestion(),
                jslogContext: (await extension.provider()).jslogContext,
            });
        }
    }
    itemCount() {
        return this.providers.length;
    }
    itemKeyAt(itemIndex) {
        return this.providers[itemIndex].prefix;
    }
    itemScoreAt(itemIndex, _query) {
        return -this.providers[itemIndex].prefix.length;
    }
    renderItem(itemIndex, _query, titleElement, _subtitleElement) {
        const provider = this.providers[itemIndex];
        const iconElement = new IconButton.Icon.Icon();
        iconElement.data = {
            iconName: provider.iconName,
            color: 'var(--icon-default)',
            width: provider.iconWidth,
        };
        titleElement.parentElement?.parentElement?.insertBefore(iconElement, titleElement.parentElement);
        UI.UIUtils.createTextChild(titleElement, provider.title);
    }
    jslogContextAt(itemIndex) {
        return this.providers[itemIndex].jslogContext;
    }
    selectItem(itemIndex, _promptValue) {
        if (itemIndex !== null) {
            QuickOpenImpl.show(this.providers[itemIndex].prefix);
        }
    }
    renderAsTwoRows() {
        return false;
    }
}
registerProvider({
    prefix: '?',
    iconName: 'help',
    iconWidth: '20px',
    provider: () => Promise.resolve(new HelpQuickOpen('help')),
    titlePrefix: () => 'Help',
    titleSuggestion: undefined,
});
//# sourceMappingURL=HelpQuickOpen.js.map