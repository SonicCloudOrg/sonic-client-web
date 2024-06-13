import * as UI from '../../ui/legacy/legacy.js';
export declare class ScopeChainSidebarPane extends UI.Widget.VBox implements UI.ContextFlavorListener.ContextFlavorListener {
    #private;
    private readonly treeOutline;
    private readonly expandController;
    private readonly linkifier;
    private infoElement;
    private constructor();
    static instance(): ScopeChainSidebarPane;
    flavorChanged(_object: Object | null): void;
    focus(): void;
    private sourceMapAttached;
    private setScopeSourceMapSubscription;
    private debugInfoAttached;
    private update;
    private createScopeSectionTreeElement;
    private extraPropertiesForScope;
    private sidebarPaneUpdatedForTest;
    wasShown(): void;
}
