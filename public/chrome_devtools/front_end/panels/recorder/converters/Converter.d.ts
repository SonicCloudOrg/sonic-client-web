import type * as Models from '../models/models.js';
import type * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
export interface Converter {
    stringify(flow: Models.Schema.UserFlow): Promise<[string, PuppeteerReplay.SourceMap | undefined]>;
    stringifyStep(step: Models.Schema.Step): Promise<string>;
    getFormatName(): string;
    getFilename(flow: Models.Schema.UserFlow): string;
    getMediaType(): string | undefined;
    getId(): string;
}
