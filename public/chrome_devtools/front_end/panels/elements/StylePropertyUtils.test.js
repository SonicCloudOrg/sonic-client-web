// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import { describeWithEnvironment } from '../../testing/EnvironmentHelpers.js';
import * as Elements from './elements.js';
describeWithEnvironment('StylePropertyUtils', () => {
    it('convert CSS declaration to JS property', () => {
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: 'display', value: 'flex' }), 'display: \'flex\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: 'box-sizing', value: 'border-box' }), 'boxSizing: \'border-box\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: 'background-color', value: 'var(--color-background-elevation-1)' }), 'backgroundColor: \'var(--color-background-elevation-1)\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: '--monospace-font-size', value: '12px' }), '\'--monospace-font-size\': \'12px\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: 'mask-position', value: 'bottom' }), 'maskPosition: \'bottom\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: '-webkit-mask-position', value: 'bottom' }), 'WebkitMaskPosition: \'bottom\'');
        assert.strictEqual(Elements.StylePropertyUtils.getCssDeclarationAsJavascriptProperty({ name: 'background-image', value: 'url("paper.gif")' }), 'backgroundImage: \'url("paper.gif")\'');
    });
});
//# sourceMappingURL=StylePropertyUtils.test.js.map