import { type Step } from './Schema.js';
import { type Screenshot } from './ScreenshotStorage.js';
export interface Section {
    title: string;
    steps: Step[];
    url: string;
    screenshot?: Screenshot;
    causingStep?: Step;
}
export declare function buildSections(steps: Step[]): Section[];
