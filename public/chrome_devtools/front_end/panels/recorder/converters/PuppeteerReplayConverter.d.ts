import * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
import * as Models from '../models/models.js';
import { type Converter } from './Converter.js';
export declare class PuppeteerReplayConverter implements Converter {
    #private;
    constructor(indent: string);
    getId(): string;
    getFormatName(): string;
    getFilename(flow: Models.Schema.UserFlow): string;
    stringify(flow: Models.Schema.UserFlow): Promise<[string, PuppeteerReplay.SourceMap | undefined]>;
    stringifyStep(step: Models.Schema.Step): Promise<string>;
    getMediaType(): string;
}
