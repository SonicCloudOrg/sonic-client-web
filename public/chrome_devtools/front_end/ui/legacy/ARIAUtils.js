// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Platform from '../../core/platform/platform.js';
import { Dialog } from './Dialog.js';
let id = 0;
export function nextId(prefix) {
    return (prefix || '') + ++id;
}
export function bindLabelToControl(label, control) {
    const controlId = nextId('labelledControl');
    control.id = controlId;
    label.setAttribute('for', controlId);
}
export function markAsAlert(element) {
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-live', 'polite');
}
export function markAsApplication(element) {
    element.setAttribute('role', 'application');
}
export function markAsButton(element) {
    element.setAttribute('role', 'button');
}
export function markAsCheckbox(element) {
    element.setAttribute('role', 'checkbox');
}
export function markAsCombobox(element) {
    element.setAttribute('role', 'combobox');
}
export function markAsModalDialog(element) {
    element.setAttribute('role', 'dialog');
    element.setAttribute('aria-modal', 'true');
}
export function markAsGroup(element) {
    element.setAttribute('role', 'group');
}
export function markAsLink(element) {
    element.setAttribute('role', 'link');
}
export function markAsMenuButton(element) {
    markAsButton(element);
    element.setAttribute('aria-haspopup', 'true');
}
export function markAsProgressBar(element, min = 0, max = 100) {
    element.setAttribute('role', 'progressbar');
    element.setAttribute('aria-valuemin', min.toString());
    element.setAttribute('aria-valuemax', max.toString());
}
export function markAsTab(element) {
    element.setAttribute('role', 'tab');
}
export function markAsTablist(element) {
    element.setAttribute('role', 'tablist');
}
export function markAsTabpanel(element) {
    element.setAttribute('role', 'tabpanel');
}
export function markAsTree(element) {
    element.setAttribute('role', 'tree');
}
export function markAsTreeitem(element) {
    element.setAttribute('role', 'treeitem');
}
export function markAsTextBox(element) {
    element.setAttribute('role', 'textbox');
}
export function markAsMenu(element) {
    element.setAttribute('role', 'menu');
}
export function markAsMenuItem(element) {
    element.setAttribute('role', 'menuitem');
}
export function markAsMenuItemCheckBox(element) {
    element.setAttribute('role', 'menuitemcheckbox');
}
export function markAsMenuItemSubMenu(element) {
    markAsMenuItem(element);
    element.setAttribute('aria-haspopup', 'true');
}
export function markAsList(element) {
    element.setAttribute('role', 'list');
}
export function markAsListitem(element) {
    element.setAttribute('role', 'listitem');
}
export function markAsMain(element) {
    element.setAttribute('role', 'main');
}
export function markAsComplementary(element) {
    element.setAttribute('role', 'complementary');
}
export function markAsNavigation(element) {
    element.setAttribute('role', 'navigation');
}
/**
 * Must contain children whose role is option.
 */
export function markAsListBox(element) {
    element.setAttribute('role', 'listbox');
}
export function markAsMultiSelectable(element) {
    element.setAttribute('aria-multiselectable', 'true');
}
/**
 * Must be contained in, or owned by, an element with the role listbox.
 */
export function markAsOption(element) {
    element.setAttribute('role', 'option');
}
export function markAsRadioGroup(element) {
    element.setAttribute('role', 'radiogroup');
}
export function markAsHidden(element) {
    element.setAttribute('aria-hidden', 'true');
}
export function markAsSlider(element, min = 0, max = 100) {
    element.setAttribute('role', 'slider');
    element.setAttribute('aria-valuemin', String(min));
    element.setAttribute('aria-valuemax', String(max));
}
export function markAsHeading(element, level) {
    element.setAttribute('role', 'heading');
    element.setAttribute('aria-level', level.toString());
}
export function markAsPoliteLiveRegion(element, isAtomic) {
    element.setAttribute('aria-live', 'polite');
    if (isAtomic) {
        element.setAttribute('aria-atomic', 'true');
    }
}
export function markAsLog(element) {
    element.setAttribute('role', 'log');
}
export function hasRole(element) {
    return element.hasAttribute('role');
}
export function removeRole(element) {
    element.removeAttribute('role');
}
export function setPlaceholder(element, placeholder) {
    if (placeholder) {
        element.setAttribute('aria-placeholder', placeholder);
    }
    else {
        element.removeAttribute('aria-placeholder');
    }
}
export function markAsPresentation(element) {
    element.setAttribute('role', 'presentation');
}
export function markAsStatus(element) {
    element.setAttribute('role', 'status');
}
export function ensureId(element) {
    if (!element.id) {
        element.id = nextId('ariaElement');
    }
}
export function setAriaValueText(element, valueText) {
    element.setAttribute('aria-valuetext', valueText);
}
export function setAriaValueNow(element, value) {
    element.setAttribute('aria-valuenow', value);
}
export function setAriaValueMinMax(element, min, max) {
    element.setAttribute('aria-valuemin', min);
    element.setAttribute('aria-valuemax', max);
}
export function setControls(element, controlledElement) {
    if (!controlledElement) {
        element.removeAttribute('aria-controls');
        return;
    }
    ensureId(controlledElement);
    element.setAttribute('aria-controls', controlledElement.id);
}
export function setChecked(element, value) {
    element.setAttribute('aria-checked', (Boolean(value)).toString());
}
export function setCheckboxAsIndeterminate(element) {
    element.setAttribute('aria-checked', 'mixed');
}
export function setDisabled(element, value) {
    element.setAttribute('aria-disabled', (Boolean(value)).toString());
}
export function setExpanded(element, value) {
    element.setAttribute('aria-expanded', (Boolean(value)).toString());
}
export function unsetExpandable(element) {
    element.removeAttribute('aria-expanded');
}
export function setHidden(element, value) {
    element.setAttribute('aria-hidden', (Boolean(value)).toString());
}
export function setLevel(element, level) {
    element.setAttribute('aria-level', level.toString());
}
export function setAutocomplete(element, interactionModel = "none" /* AutocompleteInteractionModel.None */) {
    element.setAttribute('aria-autocomplete', interactionModel);
}
export function clearAutocomplete(element) {
    element.removeAttribute('aria-autocomplete');
}
export function setHasPopup(element, value = "false" /* PopupRole.False */) {
    if (value !== "false" /* PopupRole.False */) {
        element.setAttribute('aria-haspopup', value);
    }
    else {
        element.removeAttribute('aria-haspopup');
    }
}
export function setSelected(element, value) {
    // aria-selected behaves differently for false and undefined.
    // Often times undefined values are unintentionally typed as booleans.
    // Use !! to make sure this is true or false.
    element.setAttribute('aria-selected', (Boolean(value)).toString());
}
export function clearSelected(element) {
    element.removeAttribute('aria-selected');
}
export function setInvalid(element, value) {
    if (value) {
        element.setAttribute('aria-invalid', value.toString());
    }
    else {
        element.removeAttribute('aria-invalid');
    }
}
export function setPressed(element, value) {
    // aria-pressed behaves differently for false and undefined.
    // Often times undefined values are unintentionally typed as booleans.
    // Use !! to make sure this is true or false.
    element.setAttribute('aria-pressed', (Boolean(value)).toString());
}
export function setValueNow(element, value) {
    element.setAttribute('aria-valuenow', value.toString());
}
export function setValueText(element, value) {
    element.setAttribute('aria-valuetext', value.toString());
}
export function setProgressBarValue(element, valueNow, valueText) {
    element.setAttribute('aria-valuenow', valueNow.toString());
    if (valueText) {
        element.setAttribute('aria-valuetext', valueText);
    }
}
export function setLabel(element, name) {
    element.setAttribute('aria-label', name);
}
export function setDescription(element, description) {
    // Nodes in the accessibility tree are made up of a core
    // triplet of "name", "value", "description"
    // The "description" field is taken from either
    // 1. The title html attribute
    // 2. The value of the aria-description attribute.
    // 3. The textContent of an element specified by aria-describedby
    //
    // The title attribute has the side effect of causing tooltips
    // to appear with the description when the element is hovered.
    // This is usually fine, except that DevTools has its own styled
    // tooltips which would interfere with the browser tooltips.
    element.setAttribute('aria-description', description);
}
export function setActiveDescendant(element, activedescendant) {
    if (!activedescendant) {
        element.removeAttribute('aria-activedescendant');
        return;
    }
    if (activedescendant.isConnected && element.isConnected) {
        console.assert(Platform.DOMUtilities.getEnclosingShadowRootForNode(activedescendant) ===
            Platform.DOMUtilities.getEnclosingShadowRootForNode(element), 'elements are not in the same shadow dom');
    }
    ensureId(activedescendant);
    element.setAttribute('aria-activedescendant', activedescendant.id);
}
export function setSetSize(element, size) {
    element.setAttribute('aria-setsize', size.toString());
}
export function setPositionInSet(element, position) {
    element.setAttribute('aria-posinset', position.toString());
}
function hideFromLayout(element) {
    element.style.position = 'absolute';
    element.style.left = '-999em';
    element.style.width = '100em';
    element.style.overflow = 'hidden';
}
const alertElements = new WeakMap();
function createAlertElement(container) {
    const element = container.createChild('div');
    hideFromLayout(element);
    element.setAttribute('role', 'alert');
    element.setAttribute('aria-atomic', 'true');
    return element;
}
export function getOrCreateAlertElements(container = document.body) {
    let state = alertElements.get(container);
    if (!state) {
        state = {
            one: createAlertElement(container),
            two: createAlertElement(container),
            alertToggle: false,
        };
        alertElements.set(container, state);
    }
    return state;
}
/**
 * This function instantiates and switches off returning one of two offscreen alert elements.
 * We utilize two alert elements to ensure that alerts with the same string are still registered
 * as changes and trigger screen reader announcement.
 */
export function alertElementInstance(container = document.body) {
    const state = getOrCreateAlertElements(container);
    state.alertToggle = !state.alertToggle;
    if (state.alertToggle) {
        state.two.textContent = '';
        return state.one;
    }
    state.one.textContent = '';
    return state.two;
}
/**
 * This function is used to announce a message with the screen reader.
 * Setting the textContent would allow the SR to access the offscreen element via browse mode
 */
export function alert(message) {
    const dialog = Dialog.getInstance();
    const element = alertElementInstance(dialog && dialog.isShowing() ? dialog.contentElement : undefined);
    element.textContent = Platform.StringUtilities.trimEndWithMaxLength(message, 10000);
}
//# sourceMappingURL=ARIAUtils.js.map