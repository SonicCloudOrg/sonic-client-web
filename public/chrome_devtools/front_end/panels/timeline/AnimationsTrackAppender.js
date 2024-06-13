// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../core/i18n/i18n.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { buildGroupStyle, buildTrackHeader, getFormattedTime } from './AppenderUtils.js';
const UIStrings = {
    /**
     *@description Text in Timeline Flame Chart Data Provider of the Performance panel
     */
    animations: 'Animations',
};
const str_ = i18n.i18n.registerUIStrings('panels/timeline/AnimationsTrackAppender.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class AnimationsTrackAppender {
    appenderName = 'Animations';
    #compatibilityBuilder;
    #traceParsedData;
    constructor(compatibilityBuilder, traceParsedData) {
        this.#compatibilityBuilder = compatibilityBuilder;
        this.#traceParsedData = traceParsedData;
    }
    appendTrackAtLevel(trackStartLevel, expanded) {
        const animations = this.#traceParsedData.Animations.animations;
        if (animations.length === 0) {
            return trackStartLevel;
        }
        this.#appendTrackHeaderAtLevel(trackStartLevel, expanded);
        return this.#compatibilityBuilder.appendEventsAtLevel(animations, trackStartLevel, this);
    }
    #appendTrackHeaderAtLevel(currentLevel, expanded) {
        const style = buildGroupStyle({ useFirstLineForOverview: false });
        const group = buildTrackHeader(currentLevel, i18nString(UIStrings.animations), style, /* selectable= */ true, expanded);
        this.#compatibilityBuilder.registerTrackForGroup(group, this);
    }
    colorForEvent() {
        return ThemeSupport.ThemeSupport.instance().getComputedValue('--app-color-rendering');
    }
    titleForEvent(event) {
        return event.name;
    }
    highlightedEntryInfo(event) {
        const title = this.titleForEvent(event);
        return { title, formattedTime: getFormattedTime(event.dur) };
    }
}
//# sourceMappingURL=AnimationsTrackAppender.js.map