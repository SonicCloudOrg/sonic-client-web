// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../../core/i18n/i18n.js';
import * as TraceEngine from '../../../../models/trace/trace.js';
export class TimelineOverviewCalculator {
    #minimumBoundary = TraceEngine.Types.Timing.MilliSeconds(0);
    #maximumBoundary = TraceEngine.Types.Timing.MilliSeconds(100);
    workingArea;
    navStartTimes;
    computePosition(time) {
        return (time - this.#minimumBoundary) / this.boundarySpan() * this.workingArea;
    }
    positionToTime(position) {
        return position / this.workingArea * this.boundarySpan() + this.#minimumBoundary;
    }
    setBounds(minimumBoundary, maximumBoundary) {
        this.#minimumBoundary = minimumBoundary;
        this.#maximumBoundary = maximumBoundary;
    }
    setNavStartTimes(navStartTimes) {
        this.navStartTimes = navStartTimes;
    }
    setDisplayWidth(clientWidth) {
        this.workingArea = clientWidth;
    }
    reset() {
        this.setBounds(TraceEngine.Types.Timing.MilliSeconds(0), TraceEngine.Types.Timing.MilliSeconds(100));
    }
    formatValue(value, precision) {
        // If there are nav start times the value needs to be remapped.
        if (this.navStartTimes) {
            // Find the latest possible nav start time which is considered earlier
            // than the value passed through.
            for (let i = this.navStartTimes.length - 1; i >= 0; i--) {
                const startTimeMilliseconds = TraceEngine.Helpers.Timing.microSecondsToMilliseconds(this.navStartTimes[i].ts);
                if (value > startTimeMilliseconds) {
                    value -= (startTimeMilliseconds - this.zeroTime());
                    break;
                }
            }
        }
        return i18n.TimeUtilities.preciseMillisToString(value - this.zeroTime(), precision);
    }
    maximumBoundary() {
        return this.#maximumBoundary;
    }
    minimumBoundary() {
        return this.#minimumBoundary;
    }
    zeroTime() {
        return this.#minimumBoundary;
    }
    boundarySpan() {
        return TraceEngine.Types.Timing.MilliSeconds(this.#maximumBoundary - this.#minimumBoundary);
    }
}
//# sourceMappingURL=TimelineOverviewCalculator.js.map