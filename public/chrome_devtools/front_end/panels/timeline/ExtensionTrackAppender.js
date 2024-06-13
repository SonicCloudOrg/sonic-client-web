// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../models/trace/trace.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import { buildGroupStyle, buildTrackHeader, getFormattedTime } from './AppenderUtils.js';
import * as Extensions from './extensions/extensions.js';
export class ExtensionTrackAppender {
    appenderName = 'Extension';
    #trackData;
    #compatibilityBuilder;
    constructor(compatibilityBuilder, trackData) {
        this.#trackData = trackData;
        this.#compatibilityBuilder = compatibilityBuilder;
    }
    appendTrackAtLevel(trackStartLevel, expanded) {
        if (this.#trackData.flameChartEntries.length === 0) {
            return trackStartLevel;
        }
        this.#appendTrackHeaderAtLevel(trackStartLevel, expanded);
        return this.#compatibilityBuilder.appendEventsAtLevel(this.#trackData.flameChartEntries, trackStartLevel, this);
    }
    #appendTrackHeaderAtLevel(currentLevel, expanded) {
        const style = buildGroupStyle({ collapsible: true });
        const group = buildTrackHeader(currentLevel, this.#trackData.name, style, 
        /* selectable= */ true, expanded);
        this.#compatibilityBuilder.registerTrackForGroup(group, this);
    }
    colorForEvent(event) {
        const defaultColor = ThemeSupport.ThemeSupport.instance().getComputedValue('--app-color-rendering');
        if (!TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event)) {
            return defaultColor;
        }
        return Extensions.ExtensionUI.extensionEntryColor(event);
    }
    titleForEvent(event) {
        if (!TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event)) {
            return ThemeSupport.ThemeSupport.instance().getComputedValue('--app-color-rendering');
        }
        return event.name;
    }
    /**
     * Returns the info shown when an event added by this appender
     * is hovered in the timeline.
     */
    highlightedEntryInfo(event) {
        const title = TraceEngine.Types.Extensions.isSyntheticExtensionEntry(event) && event.args.hintText ?
            event.args.hintText :
            this.titleForEvent(event);
        return { title, formattedTime: getFormattedTime(event.dur) };
    }
}
//# sourceMappingURL=ExtensionTrackAppender.js.map