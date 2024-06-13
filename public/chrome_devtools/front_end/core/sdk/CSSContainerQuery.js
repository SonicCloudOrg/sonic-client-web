// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as TextUtils from '../../models/text_utils/text_utils.js';
import { CSSQuery } from './CSSQuery.js';
export class CSSContainerQuery extends CSSQuery {
    name;
    physicalAxes;
    logicalAxes;
    static parseContainerQueriesPayload(cssModel, payload) {
        return payload.map(cq => new CSSContainerQuery(cssModel, cq));
    }
    constructor(cssModel, payload) {
        super(cssModel);
        this.reinitialize(payload);
    }
    reinitialize(payload) {
        this.text = payload.text;
        this.range = payload.range ? TextUtils.TextRange.TextRange.fromObject(payload.range) : null;
        this.styleSheetId = payload.styleSheetId;
        this.name = payload.name;
        this.physicalAxes = payload.physicalAxes;
        this.logicalAxes = payload.logicalAxes;
    }
    active() {
        return true;
    }
    async getContainerForNode(nodeId) {
        const containerNode = await this.cssModel.domModel().getContainerForNode(nodeId, this.name, this.physicalAxes, this.logicalAxes);
        if (!containerNode) {
            return;
        }
        return new CSSContainerQueryContainer(containerNode);
    }
}
export class CSSContainerQueryContainer {
    containerNode;
    constructor(containerNode) {
        this.containerNode = containerNode;
    }
    async getContainerSizeDetails() {
        const styles = await this.containerNode.domModel().cssModel().getComputedStyle(this.containerNode.id);
        if (!styles) {
            return;
        }
        const containerType = styles.get('container-type');
        const contain = styles.get('contain');
        const writingMode = styles.get('writing-mode');
        if (!containerType || !contain || !writingMode) {
            return;
        }
        // The final queried axes are the union of both properties.
        const queryAxis = getQueryAxis(`${containerType} ${contain}`);
        const physicalAxis = getPhysicalAxisFromQueryAxis(queryAxis, writingMode);
        let width, height;
        if (physicalAxis === "Both" /* PhysicalAxis.Both */ || physicalAxis === "Horizontal" /* PhysicalAxis.Horizontal */) {
            width = styles.get('width');
        }
        if (physicalAxis === "Both" /* PhysicalAxis.Both */ || physicalAxis === "Vertical" /* PhysicalAxis.Vertical */) {
            height = styles.get('height');
        }
        return {
            queryAxis,
            physicalAxis,
            width,
            height,
        };
    }
}
export const getQueryAxis = (propertyValue) => {
    const segments = propertyValue.split(' ');
    let isInline = false;
    let isBlock = false;
    for (const segment of segments) {
        if (segment === 'size') {
            return "size" /* QueryAxis.Both */;
        }
        isInline = isInline || segment === 'inline-size';
        isBlock = isBlock || segment === 'block-size';
    }
    if (isInline && isBlock) {
        return "size" /* QueryAxis.Both */;
    }
    if (isInline) {
        return "inline-size" /* QueryAxis.Inline */;
    }
    if (isBlock) {
        return "block-size" /* QueryAxis.Block */;
    }
    return "" /* QueryAxis.None */;
};
export const getPhysicalAxisFromQueryAxis = (queryAxis, writingMode) => {
    const isVerticalWritingMode = writingMode.startsWith('vertical');
    switch (queryAxis) {
        case "" /* QueryAxis.None */:
            return "" /* PhysicalAxis.None */;
        case "size" /* QueryAxis.Both */:
            return "Both" /* PhysicalAxis.Both */;
        case "inline-size" /* QueryAxis.Inline */:
            return isVerticalWritingMode ? "Vertical" /* PhysicalAxis.Vertical */ : "Horizontal" /* PhysicalAxis.Horizontal */;
        case "block-size" /* QueryAxis.Block */:
            return isVerticalWritingMode ? "Horizontal" /* PhysicalAxis.Horizontal */ : "Vertical" /* PhysicalAxis.Vertical */;
    }
};
//# sourceMappingURL=CSSContainerQuery.js.map