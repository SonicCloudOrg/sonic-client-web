// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
function startNewSection(step) {
    const navigationEvent = step.assertedEvents?.find(event => event.type === 'navigation');
    if (step.type === 'navigate') {
        return {
            title: navigationEvent?.title || '',
            url: step.url,
            steps: [],
            causingStep: step,
        };
    }
    if (navigationEvent) {
        return {
            title: navigationEvent.title || '',
            url: navigationEvent.url || '',
            steps: [],
        };
    }
    return null;
}
export function buildSections(steps) {
    let currentSection = null;
    const sections = [];
    for (const step of steps) {
        if (currentSection) {
            currentSection.steps.push(step);
        }
        else if (step.type === 'navigate') {
            currentSection = startNewSection(step);
            continue;
        }
        else {
            currentSection = { title: 'Current page', url: '', steps: [step] };
        }
        const nextSection = startNewSection(step);
        if (nextSection) {
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = nextSection;
        }
    }
    if (currentSection && (!sections.length || currentSection.steps.length)) {
        sections.push(currentSection);
    }
    return sections;
}
//# sourceMappingURL=Section.js.map