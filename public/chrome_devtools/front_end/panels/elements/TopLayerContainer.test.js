// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { createTarget } from '../../testing/EnvironmentHelpers.js';
import { describeWithMockConnection } from '../../testing/MockConnection.js';
import * as Adorners from '../../ui/components/adorners/adorners.js';
import * as Elements from './elements.js';
const stubTopLayerDOMNode = (nodeName, backendNodeId, ownerDocument) => {
    return {
        nodeName: () => nodeName,
        backendNodeId: () => backendNodeId,
        ownerDocument,
    };
};
const stubElementsTreeElement = () => {
    return {
        adorn: (_unused) => new Adorners.Adorner.Adorner(),
    };
};
describeWithMockConnection('TopLayerContainer', () => {
    it('should update top layer elements correctly', async () => {
        const stubDocument = {};
        const topLayerDOMNode1 = stubTopLayerDOMNode('dialog', 1, stubDocument);
        const topLayerDOMNode2 = stubTopLayerDOMNode('div', 2, stubDocument);
        const domModel = {
            target: () => createTarget(),
            getTopLayerElements: async () => Promise.resolve([1, 2]),
            idToDOMNode: new Map([
                [1, topLayerDOMNode1],
                [2, topLayerDOMNode2],
            ]),
        };
        stubDocument.domModel = () => domModel;
        const topLayerTreeNode1 = stubElementsTreeElement();
        const topLayerTreeNode2 = stubElementsTreeElement();
        const tree = {
            treeElementByNode: new WeakMap([
                [topLayerDOMNode1, topLayerTreeNode1],
                [topLayerDOMNode2, topLayerTreeNode2],
            ]),
        };
        const topLayerContainer = new Elements.TopLayerContainer.TopLayerContainer(tree, stubDocument);
        await topLayerContainer.updateTopLayerElements();
        assert.strictEqual(topLayerContainer.currentTopLayerDOMNodes.size, 2);
    });
});
//# sourceMappingURL=TopLayerContainer.test.js.map