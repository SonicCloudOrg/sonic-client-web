import * as Platform from '../../core/platform/platform.js';
import * as LitHtml from '../lit-html/lit-html.js';
import { type ContextMenu, type Provider } from './ContextMenu.js';
import { XElement } from './XElement.js';
export declare class XLink extends XElement {
    hrefInternal: Platform.DevToolsPath.UrlString | null;
    private clickable;
    private readonly onClick;
    private readonly onKeyDown;
    static create(url: string, linkText?: string, className?: string, preventClick?: boolean, jsLogContext?: string): HTMLElement;
    constructor();
    static get observedAttributes(): string[];
    get href(): Platform.DevToolsPath.UrlString | null;
    attributeChangedCallback(attr: string, oldValue: string | null, newValue: string | null): void;
    private updateClick;
}
export declare class ContextMenuProvider implements Provider<Node> {
    appendApplicableItems(_event: Event, contextMenu: ContextMenu, target: Node): void;
}
export declare const sample: LitHtml.TemplateResult;
