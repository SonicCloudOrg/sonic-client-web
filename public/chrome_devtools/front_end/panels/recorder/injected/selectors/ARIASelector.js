// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
class ARIASelectorComputer {
    #bindings;
    constructor(bindings) {
        this.#bindings = bindings;
    }
    // Takes a path consisting of element names and roles and makes sure that
    // every element resolves to a single result. If it does, the selector is added
    // to the chain of selectors.
    #computeUniqueARIASelectorForElements = (elements, queryByRoleOnly) => {
        const selectors = [];
        let parent = document;
        for (const element of elements) {
            let result = this.#queryA11yTreeOneByName(parent, element.name);
            if (result) {
                selectors.push(element.name);
                parent = result;
                continue;
            }
            if (queryByRoleOnly) {
                result = this.#queryA11yTreeOneByRole(parent, element.role);
                if (result) {
                    selectors.push(`[role="${element.role}"]`);
                    parent = result;
                    continue;
                }
            }
            result = this.#queryA11yTreeOneByNameAndRole(parent, element.name, element.role);
            if (result) {
                selectors.push(`${element.name}[role="${element.role}"]`);
                parent = result;
                continue;
            }
            return;
        }
        return selectors;
    };
    #queryA11yTreeOneByName = (parent, name) => {
        if (!name) {
            return null;
        }
        const maxResults = 2;
        const result = this.#queryA11yTree(parent, name, undefined, maxResults);
        if (result.length !== 1) {
            return null;
        }
        return result[0];
    };
    #queryA11yTreeOneByRole = (parent, role) => {
        if (!role) {
            return null;
        }
        const maxResults = 2;
        const result = this.#queryA11yTree(parent, undefined, role, maxResults);
        if (result.length !== 1) {
            return null;
        }
        return result[0];
    };
    #queryA11yTreeOneByNameAndRole = (parent, name, role) => {
        if (!role || !name) {
            return null;
        }
        const maxResults = 2;
        const result = this.#queryA11yTree(parent, name, role, maxResults);
        if (result.length !== 1) {
            return null;
        }
        return result[0];
    };
    // Queries the DOM tree for elements with matching accessibility name and role.
    // It attempts to mimic https://chromedevtools.github.io/devtools-protocol/tot/Accessibility/#method-queryAXTree.
    #queryA11yTree = (parent, name, role, maxResults = 0) => {
        const result = [];
        if (!name && !role) {
            throw new Error('Both role and name are empty');
        }
        const shouldMatchName = Boolean(name);
        const shouldMatchRole = Boolean(role);
        const collect = (root) => {
            const iter = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
            do {
                const currentNode = iter.currentNode;
                if (currentNode.shadowRoot) {
                    collect(currentNode.shadowRoot);
                }
                if (currentNode instanceof ShadowRoot) {
                    continue;
                }
                if (shouldMatchName && this.#bindings.getAccessibleName(currentNode) !== name) {
                    continue;
                }
                if (shouldMatchRole && this.#bindings.getAccessibleRole(currentNode) !== role) {
                    continue;
                }
                result.push(currentNode);
                if (maxResults && result.length >= maxResults) {
                    return;
                }
            } while (iter.nextNode());
        };
        collect(parent instanceof Document ? document.documentElement : parent);
        return result;
    };
    compute = (node) => {
        let selector;
        let current = node;
        const elements = [];
        while (current) {
            const role = this.#bindings.getAccessibleRole(current);
            const name = this.#bindings.getAccessibleName(current);
            if (!role && !name) {
                if (current === node) {
                    break;
                }
            }
            else {
                elements.unshift({ name, role });
                selector = this.#computeUniqueARIASelectorForElements(elements, current !== node);
                if (selector) {
                    break;
                }
                if (current !== node) {
                    elements.shift();
                }
            }
            current = current.parentNode;
            if (current instanceof ShadowRoot) {
                current = current.host;
            }
        }
        return selector;
    };
}
/**
 * Computes the ARIA selector for a node.
 *
 * @param node - The node to compute.
 * @returns The computed CSS selector.
 *
 * @internal
 */
export const computeARIASelector = (node, bindings) => {
    return new ARIASelectorComputer(bindings).compute(node);
};
//# sourceMappingURL=ARIASelector.js.map