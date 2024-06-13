import { type ReportJSON, type RunnerResultArtifacts } from './LighthouseReporterTypes.js';
interface RenderReportOpts {
    beforePrint?: () => void;
    afterPrint?: () => void;
}
export declare class LighthouseReportRenderer {
    static renderLighthouseReport(lhr: ReportJSON, artifacts?: RunnerResultArtifacts, opts?: RenderReportOpts): HTMLElement;
    static waitForMainTargetLoad(): Promise<void>;
    static linkifyNodeDetails(el: Element): Promise<void>;
    static linkifySourceLocationDetails(el: Element): Promise<void>;
}
export {};
