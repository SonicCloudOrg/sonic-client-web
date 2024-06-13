import type * as Extension from '../extensions/extensions.js';
import type * as Models from '../models/models.js';
import * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
import { type Converter } from './Converter.js';
export declare const EXTENSION_PREFIX = "extension_";
export declare class ExtensionConverter implements Converter {
    #private;
    constructor(idx: number, extension: Extension.ExtensionManager.Extension);
    getId(): string;
    getFormatName(): string;
    getMediaType(): string | undefined;
    getFilename(flow: Models.Schema.UserFlow): string;
    stringify(flow: Models.Schema.UserFlow): Promise<[string, PuppeteerReplay.SourceMap | undefined]>;
    stringifyStep(step: Models.Schema.Step): Promise<string>;
}
