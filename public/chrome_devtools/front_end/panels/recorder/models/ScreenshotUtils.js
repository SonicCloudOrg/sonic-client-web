// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../../core/sdk/sdk.js';
const SCREENSHOT_WIDTH = 160; // px
const SCREENSHOT_MAX_HEIGHT = 240; // px
async function captureScreenshot() {
    const mainTarget = SDK.TargetManager.TargetManager.instance().primaryPageTarget();
    if (!mainTarget) {
        throw new Error('Could not find main target');
    }
    const { data } = await mainTarget.pageAgent().invoke_captureScreenshot({});
    if (!data) {
        // 1x1 px empty image.
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
    return ('data:image/png;base64,' + data);
}
export async function resizeScreenshot(data) {
    const img = new Image();
    const promise = new Promise(resolve => {
        img.onload = resolve;
    });
    img.src = data;
    await promise;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not create context.');
    }
    const aspectRatio = img.width / img.height;
    canvas.width = SCREENSHOT_WIDTH;
    canvas.height = Math.min(SCREENSHOT_MAX_HEIGHT, SCREENSHOT_WIDTH / aspectRatio);
    const bitmap = await createImageBitmap(img, {
        resizeWidth: SCREENSHOT_WIDTH,
        resizeQuality: 'high',
    });
    context.drawImage(bitmap, 0, 0);
    return canvas.toDataURL('image/png');
}
export async function takeScreenshot() {
    const data = await captureScreenshot();
    return await resizeScreenshot(data);
}
//# sourceMappingURL=ScreenshotUtils.js.map