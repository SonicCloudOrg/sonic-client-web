// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../lit-html/lit-html.js';
import { CodeBlock } from './CodeBlock.js';
import { MarkdownImage } from './MarkdownImage.js';
import { MarkdownLink } from './MarkdownLink.js';
import markdownViewStyles from './markdownView.css.js';
const html = LitHtml.html;
const render = LitHtml.render;
export class MarkdownView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-markdown-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #tokenData = [];
    #renderer = new MarkdownLitRenderer();
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [markdownViewStyles];
    }
    set data(data) {
        this.#tokenData = data.tokens;
        if (data.renderer) {
            this.#renderer = data.renderer;
        }
        this.#update();
    }
    #update() {
        this.#render();
    }
    #render() {
        // Disabled until https://crbug.com/1079231 is fixed.
        // clang-format off
        render(html `
      <div class='message'>
        ${this.#tokenData.map(token => this.#renderer.renderToken(token))}
      </div>
    `, this.#shadow, { host: this });
        // clang-format on
    }
}
customElements.define('devtools-markdown-view', MarkdownView);
/**
 * Default renderer is used for the IssuesPanel and allows only well-known images and links to be embedded.
 */
export class MarkdownLitRenderer {
    renderChildTokens(token) {
        if ('tokens' in token && token.tokens) {
            return token.tokens.map(token => this.renderToken(token));
        }
        throw new Error('Tokens not found');
    }
    /**
     * Unescape will get rid of the escaping done by Marked to avoid double escaping due to escaping it also with Lit-html.
     * Table taken from: front_end/third_party/marked/package/src/helpers.js
     */
    unescape(text) {
        const escapeReplacements = new Map([
            ['&amp;', '&'],
            ['&lt;', '<'],
            ['&gt;', '>'],
            ['&quot;', '"'],
            ['&#39;', '\''],
        ]);
        return text.replace(/&(amp|lt|gt|quot|#39);/g, (matchedString) => {
            const replacement = escapeReplacements.get(matchedString);
            return replacement ? replacement : matchedString;
        });
    }
    renderText(token) {
        if ('tokens' in token && token.tokens) {
            return html `${this.renderChildTokens(token)}`;
        }
        // Due to unescaping, unescaped html entities (see escapeReplacements' keys) will be rendered
        // as their corresponding symbol while the rest will be rendered as verbatim.
        // Marked's escape function can be found in front_end/third_party/marked/package/src/helpers.js
        return html `${this.unescape('text' in token ? token.text : '')}`;
    }
    renderHeading(heading) {
        switch (heading.depth) {
            case 1:
                return html `<h1>${this.renderText(heading)}</h1>`;
            case 2:
                return html `<h2>${this.renderText(heading)}</h2>`;
            case 3:
                return html `<h3>${this.renderText(heading)}</h3>`;
            case 4:
                return html `<h4>${this.renderText(heading)}</h4>`;
            case 5:
                return html `<h5>${this.renderText(heading)}</h5>`;
            default:
                return html `<h6>${this.renderText(heading)}</h6>`;
        }
    }
    renderCodeBlock(token) {
        // clang-format off
        return html `<${CodeBlock.litTagName}
      .code=${this.unescape(token.text)}
      .codeLang=${token.lang}>
    </${CodeBlock.litTagName}>`;
        // clang-format one
    }
    templateForToken(token) {
        switch (token.type) {
            case 'paragraph':
                return html `<p>${this.renderChildTokens(token)}`;
            case 'list':
                return html `<ul>${token.items.map(token => {
                    return this.renderToken(token);
                })}</ul>`;
            case 'list_item':
                return html `<li>${this.renderChildTokens(token)}`;
            case 'text':
                return this.renderText(token);
            case 'codespan':
                return html `<code>${this.unescape(token.text)}</code>`;
            case 'code':
                return this.renderCodeBlock(token);
            case 'space':
                return html ``;
            case 'link':
                return html `<${MarkdownLink.litTagName} .data=${{ key: token.href, title: token.text }}></${MarkdownLink.litTagName}>`;
            case 'image':
                return html `<${MarkdownImage.litTagName} .data=${{ key: token.href, title: token.text }}></${MarkdownImage.litTagName}>`;
            case 'heading':
                return this.renderHeading(token);
            case 'strong':
                return html `<strong>${this.renderText(token)}</strong>`;
            case 'em':
                return html `<em>${this.renderText(token)}</em>`;
            default:
                return null;
        }
    }
    renderToken(token) {
        const template = this.templateForToken(token);
        if (template === null) {
            throw new Error(`Markdown token type '${token.type}' not supported.`);
        }
        return template;
    }
}
//# sourceMappingURL=MarkdownView.js.map