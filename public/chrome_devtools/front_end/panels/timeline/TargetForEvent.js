// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
/**
 * If the event's thread was identified as belonging to a worker, this will
 * return the target representing that worker. Otherwise, we return the primary
 * page's target.
 **/
export function targetForEvent(traceParsedData, event) {
    const targetManager = SDK.TargetManager.TargetManager.instance();
    const workerId = traceParsedData.Workers.workerIdByThread.get(event.tid);
    if (workerId) {
        return targetManager.targetById(workerId);
    }
    return targetManager.primaryPageTarget();
}
//# sourceMappingURL=TargetForEvent.js.map