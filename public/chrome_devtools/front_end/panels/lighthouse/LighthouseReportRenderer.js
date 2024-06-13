// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import * as Platform from '../../core/platform/platform.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Workspace from '../../models/workspace/workspace.js';
import * as LighthouseReport from '../../third_party/lighthouse/report/report.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as ThemeSupport from '../../ui/legacy/theme_support/theme_support.js';
import * as Timeline from '../timeline/timeline.js';
const MaxLengthForLinks = 40;
export class LighthouseReportRenderer {
    static renderLighthouseReport(lhr, artifacts, opts) {
        let onViewTrace = undefined;
        if (artifacts) {
            onViewTrace = async () => {
                const defaultPassTrace = artifacts.traces.defaultPass;
                Host.userMetrics.actionTaken(Host.UserMetrics.Action.LighthouseViewTrace);
                await UI.InspectorView.InspectorView.instance().showPanel('timeline');
                Timeline.TimelinePanel.TimelinePanel.instance().loadFromEvents(defaultPassTrace.traceEvents);
            };
        }
        async function onSaveFileOverride(blob) {
            const domain = new Common.ParsedURL.ParsedURL(lhr.finalUrl || lhr.finalDisplayedUrl).domain();
            const sanitizedDomain = domain.replace(/[^a-z0-9.-]+/gi, '_');
            const timestamp = Platform.DateUtilities.toISO8601Compact(new Date(lhr.fetchTime));
            const ext = blob.type.match('json') ? '.json' : '.html';
            const basename = `${sanitizedDomain}-${timestamp}${ext}`;
            const text = await blob.text();
            await Workspace.FileManager.FileManager.instance().save(basename, text, true /* forceSaveAs */, false /* isBase64 */);
            Workspace.FileManager.FileManager.instance().close(basename);
        }
        async function onPrintOverride(rootEl) {
            const clonedReport = rootEl.cloneNode(true);
            const printWindow = window.open('', '_blank', 'channelmode=1,status=1,resizable=1');
            if (!printWindow) {
                return;
            }
            printWindow.document.body.replaceWith(clonedReport);
            // Linkified nodes are shadow elements, which aren't exposed via `cloneNode`.
            await LighthouseReportRenderer.linkifyNodeDetails(clonedReport);
            opts?.beforePrint?.();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
            opts?.afterPrint?.();
        }
        function getStandaloneReportHTML() {
            // @ts-expect-error https://github.com/GoogleChrome/lighthouse/issues/11628
            return Lighthouse.ReportGenerator.ReportGenerator.generateReportHtml(lhr);
        }
        const reportEl = LighthouseReport.renderReport(lhr, {
            // Disable dark mode so we can manually adjust it.
            disableDarkMode: true,
            onViewTrace,
            onSaveFileOverride,
            onPrintOverride,
            getStandaloneReportHTML,
        });
        reportEl.classList.add('lh-devtools');
        const updateDarkModeIfNecessary = () => {
            reportEl.classList.toggle('lh-dark', ThemeSupport.ThemeSupport.instance().themeName() === 'dark');
        };
        ThemeSupport.ThemeSupport.instance().addEventListener(ThemeSupport.ThemeChangeEvent.eventName, updateDarkModeIfNecessary);
        updateDarkModeIfNecessary();
        // @ts-ignore Expose LHR on DOM for e2e tests
        reportEl._lighthouseResultForTesting = lhr;
        // @ts-ignore Expose Artifacts on DOM for e2e tests
        reportEl._lighthouseArtifactsForTesting = artifacts;
        // Linkifying requires the target be loaded. Do not block the report
        // from rendering, as this is just an embellishment and the main target
        // could take awhile to load.
        void LighthouseReportRenderer.waitForMainTargetLoad().then(() => {
            void LighthouseReportRenderer.linkifyNodeDetails(reportEl);
            void LighthouseReportRenderer.linkifySourceLocationDetails(reportEl);
        });
        return reportEl;
    }
    static async waitForMainTargetLoad() {
        const mainTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!mainTarget) {
            return;
        }
        const resourceTreeModel = mainTarget.model(SDK.ResourceTreeModel.ResourceTreeModel);
        if (!resourceTreeModel) {
            return;
        }
        await resourceTreeModel.once(SDK.ResourceTreeModel.Events.Load);
    }
    static async linkifyNodeDetails(el) {
        const mainTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
        if (!mainTarget) {
            return;
        }
        const domModel = mainTarget.model(SDK.DOMModel.DOMModel);
        if (!domModel) {
            return;
        }
        for (const origElement of el.getElementsByClassName('lh-node')) {
            const origHTMLElement = origElement;
            const detailsItem = origHTMLElement.dataset;
            if (!detailsItem.path) {
                continue;
            }
            const nodeId = await domModel.pushNodeByPathToFrontend(detailsItem.path);
            if (!nodeId) {
                continue;
            }
            const node = domModel.nodeForId(nodeId);
            if (!node) {
                continue;
            }
            const element = await Common.Linkifier.Linkifier.linkify(node, { tooltip: detailsItem.snippet, preventKeyboardFocus: undefined });
            UI.Tooltip.Tooltip.install(origHTMLElement, '');
            const screenshotElement = origHTMLElement.querySelector('.lh-element-screenshot');
            origHTMLElement.textContent = '';
            if (screenshotElement) {
                origHTMLElement.append(screenshotElement);
            }
            origHTMLElement.appendChild(element);
        }
    }
    static async linkifySourceLocationDetails(el) {
        for (const origElement of el.getElementsByClassName('lh-source-location')) {
            const origHTMLElement = origElement;
            const detailsItem = origHTMLElement.dataset;
            if (!detailsItem.sourceUrl || !detailsItem.sourceLine || !detailsItem.sourceColumn) {
                continue;
            }
            const url = detailsItem.sourceUrl;
            const line = Number(detailsItem.sourceLine);
            const column = Number(detailsItem.sourceColumn);
            const element = await Components.Linkifier.Linkifier.linkifyURL(url, {
                lineNumber: line,
                columnNumber: column,
                showColumnNumber: false,
                inlineFrameIndex: 0,
                maxLength: MaxLengthForLinks,
            });
            UI.Tooltip.Tooltip.install(origHTMLElement, '');
            origHTMLElement.textContent = '';
            origHTMLElement.appendChild(element);
        }
    }
}
//# sourceMappingURL=LighthouseReportRenderer.js.map