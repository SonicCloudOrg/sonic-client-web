import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { ElementsTreeElement } from './ElementsTreeElement.js';
import { type MarkerDecoratorRegistration } from './MarkerDecorator.js';
import { TopLayerContainer } from './TopLayerContainer.js';
declare const ElementsTreeOutline_base: (new (...args: any[]) => {
    "__#13@#events": Common.ObjectWrapper.ObjectWrapper<ElementsTreeOutline.EventTypes>;
    addEventListener<T extends keyof ElementsTreeOutline.EventTypes>(eventType: T, listener: (arg0: Common.EventTarget.EventTargetEvent<ElementsTreeOutline.EventTypes[T], any>) => void, thisObject?: Object | undefined): Common.EventTarget.EventDescriptor<ElementsTreeOutline.EventTypes, T>;
    once<T_1 extends keyof ElementsTreeOutline.EventTypes>(eventType: T_1): Promise<ElementsTreeOutline.EventTypes[T_1]>;
    removeEventListener<T_2 extends keyof ElementsTreeOutline.EventTypes>(eventType: T_2, listener: (arg0: Common.EventTarget.EventTargetEvent<ElementsTreeOutline.EventTypes[T_2], any>) => void, thisObject?: Object | undefined): void;
    hasEventListeners(eventType: keyof ElementsTreeOutline.EventTypes): boolean;
    dispatchEventToListeners<T_3 extends keyof ElementsTreeOutline.EventTypes>(eventType: import("../../core/platform/TypescriptUtilities.js").NoUnion<T_3>, ...eventData: Common.EventTarget.EventPayloadToRestParameters<ElementsTreeOutline.EventTypes, T_3>): void;
}) & typeof UI.TreeOutline.TreeOutline;
export declare class ElementsTreeOutline extends ElementsTreeOutline_base {
    #private;
    treeElementByNode: WeakMap<SDK.DOMModel.DOMNode, ElementsTreeElement>;
    private readonly shadowRoot;
    readonly elementInternal: HTMLElement;
    private includeRootDOMNode;
    private selectEnabled;
    private rootDOMNodeInternal;
    selectedDOMNodeInternal: SDK.DOMModel.DOMNode | null;
    private visible;
    private readonly imagePreviewPopover;
    private updateRecords;
    private treeElementsBeingUpdated;
    decoratorExtensions: MarkerDecoratorRegistration[] | null;
    private showHTMLCommentsSetting;
    private multilineEditing?;
    private visibleWidthInternal?;
    private clipboardNodeData?;
    private isXMLMimeTypeInternal?;
    suppressRevealAndSelect: boolean;
    private previousHoveredElement?;
    private treeElementBeingDragged?;
    private dragOverTreeElement?;
    private updateModifiedNodesTimeout?;
    constructor(omitRootDOMNode?: boolean, selectEnabled?: boolean, hideGutter?: boolean);
    static forDOMModel(domModel: SDK.DOMModel.DOMModel): ElementsTreeOutline | null;
    private onShowHTMLCommentsChange;
    setWordWrap(wrap: boolean): void;
    setMultilineEditing(multilineEditing: MultilineEditorController | null): void;
    visibleWidth(): number;
    setVisibleWidth(width: number): void;
    private setClipboardData;
    resetClipboardIfNeeded(removedNode: SDK.DOMModel.DOMNode): void;
    private onBeforeCopy;
    private onCopyOrCut;
    performCopyOrCut(isCut: boolean, node: SDK.DOMModel.DOMNode | null): void;
    canPaste(targetNode: SDK.DOMModel.DOMNode): boolean;
    pasteNode(targetNode: SDK.DOMModel.DOMNode): void;
    duplicateNode(targetNode: SDK.DOMModel.DOMNode): void;
    private onPaste;
    private performPaste;
    private performDuplicate;
    setVisible(visible: boolean): void;
    get rootDOMNode(): SDK.DOMModel.DOMNode | null;
    set rootDOMNode(x: SDK.DOMModel.DOMNode | null);
    get isXMLMimeType(): boolean;
    selectedDOMNode(): SDK.DOMModel.DOMNode | null;
    selectDOMNode(node: SDK.DOMModel.DOMNode | null, focus?: boolean): void;
    editing(): boolean;
    update(): void;
    selectedNodeChanged(focus: boolean): void;
    private fireElementsTreeUpdated;
    findTreeElement(node: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    private lookUpTreeElement;
    createTreeElementFor(node: SDK.DOMModel.DOMNode): ElementsTreeElement | null;
    private revealAndSelectNode;
    treeElementFromEventInternal(event: MouseEvent): UI.TreeOutline.TreeElement | null;
    private onfocusout;
    private onmousedown;
    setHoverEffect(treeElement: UI.TreeOutline.TreeElement | null): void;
    private onmousemove;
    private highlightTreeElement;
    private onmouseleave;
    private ondragstart;
    private ondragover;
    private ondragleave;
    private validDragSourceOrTarget;
    private ondrop;
    private doMove;
    private ondragend;
    private clearDragOverTreeElementMarker;
    private contextMenuEventFired;
    showContextMenu(treeElement: ElementsTreeElement, event: Event): void;
    private saveNodeToTempVariable;
    runPendingUpdates(): void;
    private onKeyDown;
    toggleEditAsHTML(node: SDK.DOMModel.DOMNode, startEditing?: boolean, callback?: (() => void)): void;
    selectNodeAfterEdit(wasExpanded: boolean, error: string | null, newNode: SDK.DOMModel.DOMNode | null): ElementsTreeElement | null;
    /**
     * Runs a script on the node's remote object that toggles a class name on
     * the node and injects a stylesheet into the head of the node's document
     * containing a rule to set "visibility: hidden" on the class and all it's
     * ancestors.
     */
    toggleHideElement(node: SDK.DOMModel.DOMNode): Promise<void>;
    isToggledToHidden(node: SDK.DOMModel.DOMNode): boolean;
    private reset;
    wireToDOMModel(domModel: SDK.DOMModel.DOMModel): void;
    unwireFromDOMModel(domModel: SDK.DOMModel.DOMModel): void;
    private addUpdateRecord;
    private updateRecordForHighlight;
    private documentUpdated;
    private attributeModified;
    private attributeRemoved;
    private characterDataModified;
    private nodeInserted;
    private nodeRemoved;
    private childNodeCountUpdated;
    private distributedNodesChanged;
    private updateModifiedNodesSoon;
    private updateModifiedNodes;
    private updateModifiedNode;
    private updateModifiedParentNode;
    populateTreeElement(treeElement: ElementsTreeElement): Promise<void>;
    createTopLayerContainer(parent: UI.TreeOutline.TreeElement, document: SDK.DOMModel.DOMDocument): Promise<void>;
    private createElementTreeElement;
    private showChild;
    private visibleChildren;
    private hasVisibleChildren;
    private createExpandAllButtonTreeElement;
    setExpandedChildrenLimit(treeElement: ElementsTreeElement, expandedChildrenLimit: number): void;
    private updateChildren;
    insertChildElement(treeElement: ElementsTreeElement | TopLayerContainer, child: SDK.DOMModel.DOMNode, index: number, isClosingTag?: boolean): ElementsTreeElement;
    private moveChild;
    private innerUpdateChildren;
    private markersChanged;
    private topLayerElementsChanged;
    private static treeOutlineSymbol;
}
export declare namespace ElementsTreeOutline {
    enum Events {
        SelectedNodeChanged = "SelectedNodeChanged",
        ElementsTreeUpdated = "ElementsTreeUpdated"
    }
    type EventTypes = {
        [Events.SelectedNodeChanged]: {
            node: SDK.DOMModel.DOMNode | null;
            focus: boolean;
        };
        [Events.ElementsTreeUpdated]: SDK.DOMModel.DOMNode[];
    };
}
export declare const MappedCharToEntity: Map<string, string>;
export declare class UpdateRecord {
    private modifiedAttributes?;
    private removedAttributes?;
    private hasChangedChildrenInternal?;
    private hasRemovedChildrenInternal?;
    private charDataModifiedInternal?;
    attributeModified(attrName: string): void;
    attributeRemoved(attrName: string): void;
    nodeInserted(_node: SDK.DOMModel.DOMNode): void;
    nodeRemoved(_node: SDK.DOMModel.DOMNode): void;
    charDataModified(): void;
    childrenModified(): void;
    isAttributeModified(attributeName: string): boolean;
    hasRemovedAttributes(): boolean;
    isCharDataModified(): boolean;
    hasChangedChildren(): boolean;
    hasRemovedChildren(): boolean;
}
export declare class Renderer implements UI.UIUtils.Renderer {
    static instance(opts?: {
        forceNew: boolean | null;
    }): Renderer;
    render(object: Object): Promise<{
        node: Node;
        tree: UI.TreeOutline.TreeOutline | null;
    } | null>;
}
export declare class ShortcutTreeElement extends UI.TreeOutline.TreeElement {
    private readonly nodeShortcut;
    private hoveredInternal?;
    constructor(nodeShortcut: SDK.DOMModel.DOMNodeShortcut);
    addRevealAdorner(): void;
    get hovered(): boolean;
    set hovered(x: boolean);
    deferredNode(): SDK.DOMModel.DeferredDOMNode;
    domModel(): SDK.DOMModel.DOMModel;
    private setLeftIndentOverlay;
    onattach(): void;
    onselect(selectedByUser?: boolean): boolean;
}
export interface MultilineEditorController {
    cancel: () => void;
    commit: () => void;
    resize: () => void;
}
export interface ClipboardData {
    node: SDK.DOMModel.DOMNode;
    isCut: boolean;
}
export {};
