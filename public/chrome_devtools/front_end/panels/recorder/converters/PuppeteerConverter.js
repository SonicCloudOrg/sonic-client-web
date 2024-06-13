// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as PuppeteerReplay from '../../../third_party/puppeteer-replay/puppeteer-replay.js';
import * as Models from '../models/models.js';
export class PuppeteerConverter {
    #indent;
    constructor(indent) {
        this.#indent = indent;
    }
    getId() {
        return "puppeteer" /* Models.ConverterIds.ConverterIds.Puppeteer */;
    }
    getFormatName() {
        return 'Puppeteer';
    }
    getFilename(flow) {
        return `${flow.title}.js`;
    }
    async stringify(flow) {
        const text = await PuppeteerReplay.stringify(flow, {
            indentation: this.#indent,
        });
        const sourceMap = PuppeteerReplay.parseSourceMap(text);
        return [PuppeteerReplay.stripSourceMap(text), sourceMap];
    }
    async stringifyStep(step) {
        return await PuppeteerReplay.stringifyStep(step, {
            indentation: this.#indent,
        });
    }
    getMediaType() {
        return 'text/javascript';
    }
}
//# sourceMappingURL=PuppeteerConverter.js.map