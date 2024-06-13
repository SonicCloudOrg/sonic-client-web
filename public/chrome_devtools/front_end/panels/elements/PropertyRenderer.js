// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
import * as VisualLogging from '../../ui/visual_logging/visual_logging.js';
import { ImagePreviewPopover } from './ImagePreviewPopover.js';
import { StringMatcher, URLMatcher, } from './PropertyMatchers.js';
import { unescapeCssString } from './StylesSidebarPane.js';
const UIStrings = {
    /**
     *@description Text that is announced by the screen reader when the user focuses on an input field for entering the name of a CSS property in the Styles panel
     *@example {margin} PH1
     */
    cssPropertyName: '`CSS` property name: {PH1}',
    /**
     *@description Text that is announced by the screen reader when the user focuses on an input field for entering the value of a CSS property in the Styles panel
     *@example {10px} PH1
     */
    cssPropertyValue: '`CSS` property value: {PH1}',
};
const str_ = i18n.i18n.registerUIStrings('panels/elements/PropertyRenderer.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
function mergeWithSpacing(nodes, merge) {
    const result = [...nodes];
    if (SDK.CSSPropertyParser.requiresSpace(nodes, merge)) {
        result.push(document.createTextNode(' '));
    }
    result.push(...merge);
    return result;
}
export class RenderingContext {
    ast;
    renderers;
    matchedResult;
    cssControls;
    options;
    constructor(ast, renderers, matchedResult, cssControls, options = { readonly: false }) {
        this.ast = ast;
        this.renderers = renderers;
        this.matchedResult = matchedResult;
        this.cssControls = cssControls;
        this.options = options;
    }
    addControl(cssType, control) {
        if (this.cssControls) {
            const controls = this.cssControls.get(cssType);
            if (!controls) {
                this.cssControls.set(cssType, [control]);
            }
            else {
                controls.push(control);
            }
        }
    }
}
export class Renderer extends SDK.CSSPropertyParser.TreeWalker {
    #matchedResult;
    #output = [];
    #context;
    constructor(ast, renderers, matchedResult, cssControls, options) {
        super(ast);
        this.#matchedResult = matchedResult;
        this.#context = new RenderingContext(this.ast, renderers, this.#matchedResult, cssControls, options);
    }
    static render(nodeOrNodes, context) {
        if (!Array.isArray(nodeOrNodes)) {
            return this.render([nodeOrNodes], context);
        }
        const cssControls = new SDK.CSSPropertyParser.CSSControlMap();
        const renderers = nodeOrNodes.map(node => this.walkExcludingSuccessors(context.ast.subtree(node), context.renderers, context.matchedResult, cssControls, context.options));
        const nodes = renderers.map(node => node.#output).reduce(mergeWithSpacing);
        return { nodes, cssControls };
    }
    static renderInto(nodeOrNodes, context, parent) {
        const { nodes, cssControls } = this.render(nodeOrNodes, context);
        if (parent.lastChild && SDK.CSSPropertyParser.requiresSpace([parent.lastChild], nodes)) {
            parent.appendChild(document.createTextNode(' '));
        }
        nodes.map(n => parent.appendChild(n));
        return { nodes, cssControls };
    }
    renderedMatchForTest(_nodes, _match) {
    }
    enter({ node }) {
        const match = this.#matchedResult.getMatch(node);
        const renderer = match &&
            this.#context.renderers.get(match.constructor);
        if (renderer || match instanceof SDK.CSSPropertyParser.TextMatch) {
            const output = renderer ? renderer.render(match, this.#context) : match.render();
            this.renderedMatchForTest(output, match);
            this.#output = mergeWithSpacing(this.#output, output);
            return false;
        }
        return true;
    }
    static renderNameElement(name) {
        const nameElement = document.createElement('span');
        nameElement.setAttribute('jslog', `${VisualLogging.key().track({
            change: true,
            keydown: 'ArrowLeft|ArrowUp|PageUp|Home|PageDown|ArrowRight|ArrowDown|End|Space|Tab|Enter|Escape',
        })}`);
        UI.ARIAUtils.setLabel(nameElement, i18nString(UIStrings.cssPropertyName, { PH1: name }));
        nameElement.className = 'webkit-css-property';
        nameElement.textContent = name;
        nameElement.normalize();
        return nameElement;
    }
    // This function renders a property value as HTML, customizing the presentation with a set of given AST matchers. This
    // comprises the following steps:
    // 1. Build an AST of the property.
    // 2. Apply tree matchers during bottom up traversal.
    // 3. Render the value from left to right into HTML, deferring rendering of matched subtrees to the matchers
    //
    // More general, longer matches take precedence over shorter, more specific matches. Whitespaces are normalized, for
    // unmatched text and around rendered matching results.
    static renderValueElement(propertyName, propertyValue, renderers) {
        const valueElement = document.createElement('span');
        valueElement.setAttribute('jslog', `${VisualLogging.value().track({
            change: true,
            keydown: 'ArrowLeft|ArrowUp|PageUp|Home|PageDown|ArrowRight|ArrowDown|End|Space|Tab|Enter|Escape',
        })}`);
        UI.ARIAUtils.setLabel(valueElement, i18nString(UIStrings.cssPropertyValue, { PH1: propertyValue }));
        valueElement.className = 'value';
        const ast = SDK.CSSPropertyParser.tokenizeDeclaration(propertyName, propertyValue);
        if (!ast) {
            valueElement.appendChild(document.createTextNode(propertyValue));
            return valueElement;
        }
        const matchers = [];
        const rendererMap = new Map();
        for (const renderer of renderers) {
            const matcher = renderer.matcher();
            matchers.push(matcher);
            rendererMap.set(matcher.matchType, renderer);
        }
        const matchedResult = SDK.CSSPropertyParser.BottomUpTreeMatching.walk(ast, matchers);
        ast.trailingNodes.forEach(n => matchedResult.matchText(n));
        const context = new RenderingContext(ast, rendererMap, matchedResult);
        Renderer.render([ast.tree, ...ast.trailingNodes], context).nodes.forEach(node => valueElement.appendChild(node));
        valueElement.normalize();
        return valueElement;
    }
}
export class URLRenderer {
    rule;
    node;
    constructor(rule, node) {
        this.rule = rule;
        this.node = node;
    }
    render(match) {
        const url = unescapeCssString(match.url);
        const container = document.createDocumentFragment();
        UI.UIUtils.createTextChild(container, 'url(');
        let hrefUrl = null;
        if (this.rule && this.rule.resourceURL()) {
            hrefUrl = Common.ParsedURL.ParsedURL.completeURL(this.rule.resourceURL(), url);
        }
        else if (this.node) {
            hrefUrl = this.node.resolveURL(url);
        }
        const link = ImagePreviewPopover.setImageUrl(Components.Linkifier.Linkifier.linkifyURL(hrefUrl || url, {
            text: url,
            preventClick: false,
            // crbug.com/1027168
            // We rely on CSS text-overflow: ellipsis to hide long URLs in the Style panel,
            // so that we don't have to keep two versions (original vs. trimmed) of URL
            // at the same time, which complicates both StylesSidebarPane and StylePropertyTreeElement.
            bypassURLTrimming: true,
            showColumnNumber: false,
            inlineFrameIndex: 0,
        }), hrefUrl || url);
        container.appendChild(link);
        UI.UIUtils.createTextChild(container, ')');
        return [container];
    }
    matcher() {
        return new URLMatcher();
    }
}
export class StringRenderer {
    render(match) {
        const element = document.createElement('span');
        element.innerText = match.text;
        UI.Tooltip.Tooltip.install(element, unescapeCssString(match.text));
        return [element];
    }
    matcher() {
        return new StringMatcher();
    }
}
//# sourceMappingURL=PropertyRenderer.js.map