import * as UI from '../../legacy.js';
export declare abstract class AnimationTimingModel {
    abstract asCSSText(): string;
    static parse(text: string): AnimationTimingModel | null;
}
export declare const LINEAR_BEZIER: UI.Geometry.CubicBezier;
