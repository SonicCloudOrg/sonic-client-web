import * as Common from '../../core/common/common.js';
import type * as Diff from '../../third_party/diff/diff.js';
export declare class PanelUtils {
    static iconDataForResourceType(resourceType: Common.ResourceType.ResourceType): {
        iconName: string;
        color: string;
    };
    static formatCSSChangesFromDiff(diff: Diff.Diff.DiffArray): Promise<string>;
    static highlightElement(element: HTMLElement): void;
}
