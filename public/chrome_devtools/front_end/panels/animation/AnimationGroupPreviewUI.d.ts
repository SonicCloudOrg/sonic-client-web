import { type AnimationGroup } from './AnimationModel.js';
export declare class AnimationGroupPreviewUI {
    #private;
    element: HTMLButtonElement;
    constructor(model: AnimationGroup);
    removeButton(): Element;
    replay(): void;
    render(): void;
}
