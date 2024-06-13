import * as UI from '../../legacy.js';
interface Params {
    width: number;
    height: number;
    marginTop: number;
    controlPointRadius: number;
    shouldDrawLine: boolean;
}
export declare class BezierUI {
    width: number;
    height: number;
    marginTop: number;
    radius: number;
    shouldDrawLine: boolean;
    constructor({ width, height, marginTop, controlPointRadius, shouldDrawLine }: Params);
    static drawVelocityChart(bezier: UI.Geometry.CubicBezier, path: Element, width: number): void;
    curveWidth(): number;
    curveHeight(): number;
    private drawLine;
    private drawControlPoints;
    drawCurve(bezier: UI.Geometry.CubicBezier | null, svg: Element): void;
}
export declare const Height = 26;
export {};
