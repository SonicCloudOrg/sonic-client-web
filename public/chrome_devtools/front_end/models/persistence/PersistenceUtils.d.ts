import * as Common from '../../core/common/common.js';
import * as IconButton from '../../ui/components/icon_button/icon_button.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as Workspace from '../workspace/workspace.js';
import { PersistenceImpl } from './PersistenceImpl.js';
export declare class PersistenceUtils {
    static tooltipForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): string;
    static iconForUISourceCode(uiSourceCode: Workspace.UISourceCode.UISourceCode): IconButton.Icon.Icon | null;
}
export declare class LinkDecorator extends Common.ObjectWrapper.ObjectWrapper<Components.Linkifier.LinkDecorator.EventTypes> implements Components.Linkifier.LinkDecorator {
    constructor(persistence: PersistenceImpl);
    private bindingChanged;
    linkIcon(uiSourceCode: Workspace.UISourceCode.UISourceCode): IconButton.Icon.Icon | null;
}
