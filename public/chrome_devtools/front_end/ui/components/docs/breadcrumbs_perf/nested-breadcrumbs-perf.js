// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TraceEngine from '../../../../../front_end/models/trace/trace.js';
import * as TimelineComponents from '../../../../../front_end/panels/timeline/components/components.js';
const breadcrumbsUI = new TimelineComponents.BreadcrumbsUI.BreadcrumbsUI();
document.getElementById('container')?.appendChild(breadcrumbsUI);
const traceWindow2 = {
    min: TraceEngine.Types.Timing.MicroSeconds(4),
    max: TraceEngine.Types.Timing.MicroSeconds(8),
    range: TraceEngine.Types.Timing.MicroSeconds(4),
};
const traceWindow = {
    min: TraceEngine.Types.Timing.MicroSeconds(3),
    max: TraceEngine.Types.Timing.MicroSeconds(9),
    range: TraceEngine.Types.Timing.MicroSeconds(6),
};
const breadcrumb2 = {
    window: traceWindow2,
    child: null,
};
const breadcrumb = {
    window: traceWindow,
    child: breadcrumb2,
};
breadcrumbsUI.data = {
    breadcrumb: breadcrumb,
};
//# sourceMappingURL=nested-breadcrumbs-perf.js.map