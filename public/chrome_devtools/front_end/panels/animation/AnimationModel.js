// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as SDK from '../../core/sdk/sdk.js';
import { AnimationDOMNode } from './AnimationDOMNode.js';
export class AnimationModel extends SDK.SDKModel.SDKModel {
    runtimeModel;
    agent;
    #animationsById;
    animationGroups;
    #pendingAnimations;
    playbackRate;
    #screenshotCapture;
    #enabled;
    constructor(target) {
        super(target);
        this.runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
        this.agent = target.animationAgent();
        target.registerAnimationDispatcher(new AnimationDispatcher(this));
        this.#animationsById = new Map();
        this.animationGroups = new Map();
        this.#pendingAnimations = new Set();
        this.playbackRate = 1;
        const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.PrimaryPageChanged, this.reset, this);
        const screenCaptureModel = target.model(SDK.ScreenCaptureModel.ScreenCaptureModel);
        if (screenCaptureModel) {
            this.#screenshotCapture = new ScreenshotCapture(this, screenCaptureModel);
        }
    }
    reset() {
        this.#animationsById.clear();
        this.animationGroups.clear();
        this.#pendingAnimations.clear();
        this.dispatchEventToListeners(Events.ModelReset);
    }
    async devicePixelRatio() {
        const evaluateResult = await this.target().runtimeAgent().invoke_evaluate({ expression: 'window.devicePixelRatio' });
        if (evaluateResult?.result.type === 'number') {
            return evaluateResult?.result.value ?? 1;
        }
        return 1;
    }
    animationCreated(id) {
        this.#pendingAnimations.add(id);
    }
    animationCanceled(id) {
        this.#pendingAnimations.delete(id);
        this.flushPendingAnimationsIfNeeded();
    }
    async animationUpdated(payload) {
        let foundAnimationGroup;
        let foundAnimation;
        for (const animationGroup of this.animationGroups.values()) {
            foundAnimation = animationGroup.animations().find(animation => animation.id() === payload.id);
            if (foundAnimation) {
                foundAnimationGroup = animationGroup;
                break;
            }
        }
        if (!foundAnimation || !foundAnimationGroup) {
            return;
        }
        await foundAnimation.setPayload(payload);
        this.dispatchEventToListeners(Events.AnimationGroupUpdated, foundAnimationGroup);
    }
    async animationStarted(payload) {
        // We are not interested in animations without effect or target.
        if (!payload.source || !payload.source.backendNodeId) {
            return;
        }
        const animation = await AnimationImpl.parsePayload(this, payload);
        if (!animation) {
            return;
        }
        // Ignore Web Animations custom effects & groups.
        const keyframesRule = animation.source().keyframesRule();
        if (animation.type() === 'WebAnimation' && keyframesRule && keyframesRule.keyframes().length === 0) {
            this.#pendingAnimations.delete(animation.id());
        }
        else {
            this.#animationsById.set(animation.id(), animation);
            this.#pendingAnimations.add(animation.id());
        }
        this.flushPendingAnimationsIfNeeded();
    }
    flushPendingAnimationsIfNeeded() {
        for (const id of this.#pendingAnimations) {
            if (!this.#animationsById.get(id)) {
                return;
            }
        }
        while (this.#pendingAnimations.size) {
            this.matchExistingGroups(this.createGroupFromPendingAnimations());
        }
    }
    matchExistingGroups(incomingGroup) {
        let matchedGroup = null;
        for (const group of this.animationGroups.values()) {
            if (group.matches(incomingGroup)) {
                matchedGroup = group;
                group.update(incomingGroup);
                break;
            }
        }
        if (!matchedGroup) {
            this.animationGroups.set(incomingGroup.id(), incomingGroup);
            if (this.#screenshotCapture) {
                this.#screenshotCapture.captureScreenshots(incomingGroup.finiteDuration(), incomingGroup.screenshotsInternal);
            }
        }
        this.dispatchEventToListeners(Events.AnimationGroupStarted, matchedGroup || incomingGroup);
        return Boolean(matchedGroup);
    }
    createGroupFromPendingAnimations() {
        console.assert(this.#pendingAnimations.size > 0);
        const firstAnimationId = this.#pendingAnimations.values().next().value;
        this.#pendingAnimations.delete(firstAnimationId);
        const firstAnimation = this.#animationsById.get(firstAnimationId);
        if (!firstAnimation) {
            throw new Error('Unable to locate first animation');
        }
        const shouldGroupAnimation = (anim) => {
            const firstAnimationTimeline = firstAnimation.viewOrScrollTimeline();
            const animationTimeline = anim.viewOrScrollTimeline();
            if (firstAnimationTimeline) {
                // This is a SDA group so check whether the animation's
                // scroll container and scroll axis is the same with the first animation.
                return Boolean(animationTimeline && firstAnimationTimeline.sourceNodeId === animationTimeline.sourceNodeId &&
                    firstAnimationTimeline.axis === animationTimeline.axis);
            }
            // This is a non-SDA group so check whether the coming animation
            // is a time based one too and if so, compare their start times.
            return !animationTimeline && firstAnimation.startTime() === anim.startTime();
        };
        const groupedAnimations = [firstAnimation];
        const remainingAnimations = new Set();
        for (const id of this.#pendingAnimations) {
            const anim = this.#animationsById.get(id);
            if (shouldGroupAnimation(anim)) {
                groupedAnimations.push(anim);
            }
            else {
                remainingAnimations.add(id);
            }
        }
        this.#pendingAnimations = remainingAnimations;
        // Show the first starting animation at the top of the animations of the animation group.
        groupedAnimations.sort((anim1, anim2) => anim1.startTime() - anim2.startTime());
        return new AnimationGroup(this, firstAnimationId, groupedAnimations);
    }
    setPlaybackRate(playbackRate) {
        this.playbackRate = playbackRate;
        void this.agent.invoke_setPlaybackRate({ playbackRate });
    }
    releaseAnimations(animations) {
        void this.agent.invoke_releaseAnimations({ animations });
    }
    async suspendModel() {
        this.reset();
        await this.agent.invoke_disable();
    }
    async resumeModel() {
        if (!this.#enabled) {
            return;
        }
        await this.agent.invoke_enable();
    }
    async ensureEnabled() {
        if (this.#enabled) {
            return;
        }
        await this.agent.invoke_enable();
        this.#enabled = true;
    }
}
export var Events;
(function (Events) {
    Events["AnimationGroupStarted"] = "AnimationGroupStarted";
    Events["AnimationGroupUpdated"] = "AnimationGroupUpdated";
    Events["ModelReset"] = "ModelReset";
})(Events || (Events = {}));
export class AnimationImpl {
    #animationModel;
    #payloadInternal; // Assertion is safe because only way to create `AnimationImpl` is to use `parsePayload` which calls `setPayload` and sets the value.
    #sourceInternal; // Assertion is safe because only way to create `AnimationImpl` is to use `parsePayload` which calls `setPayload` and sets the value.
    #playStateInternal;
    constructor(animationModel) {
        this.#animationModel = animationModel;
    }
    static async parsePayload(animationModel, payload) {
        const animation = new AnimationImpl(animationModel);
        await animation.setPayload(payload);
        return animation;
    }
    async setPayload(payload) {
        // TODO(b/40929569): Remove normalizing by devicePixelRatio after the attached bug is resolved.
        if (payload.viewOrScrollTimeline) {
            const devicePixelRatio = await this.#animationModel.devicePixelRatio();
            if (payload.viewOrScrollTimeline.startOffset) {
                payload.viewOrScrollTimeline.startOffset /= devicePixelRatio;
            }
            if (payload.viewOrScrollTimeline.endOffset) {
                payload.viewOrScrollTimeline.endOffset /= devicePixelRatio;
            }
        }
        this.#payloadInternal = payload;
        if (this.#sourceInternal && payload.source) {
            this.#sourceInternal.setPayload(payload.source);
        }
        else if (!this.#sourceInternal && payload.source) {
            this.#sourceInternal = new AnimationEffect(this.#animationModel, payload.source);
        }
    }
    // `startTime` and `duration` is represented as the
    // percentage of the view timeline range that starts at `startOffset`px
    // from the scroll container and ends at `endOffset`px of the scroll container.
    // This takes a percentage of the timeline range and returns the absolute
    // pixels values as a scroll offset of the scroll container.
    percentageToPixels(percentage, viewOrScrollTimeline) {
        const { startOffset, endOffset } = viewOrScrollTimeline;
        if (startOffset === undefined || endOffset === undefined) {
            // We don't expect this situation to occur since after an animation is started
            // we expect the scroll offsets to be resolved and provided correctly. If `startOffset`
            // or `endOffset` is not provided in a viewOrScrollTimeline; we can assume that there is a bug here
            // so it's fine to throw an error.
            throw new Error('startOffset or endOffset does not exist in viewOrScrollTimeline');
        }
        return (endOffset - startOffset) * (percentage / 100);
    }
    viewOrScrollTimeline() {
        return this.#payloadInternal.viewOrScrollTimeline;
    }
    id() {
        return this.#payloadInternal.id;
    }
    name() {
        return this.#payloadInternal.name;
    }
    paused() {
        return this.#payloadInternal.pausedState;
    }
    playState() {
        return this.#playStateInternal || this.#payloadInternal.playState;
    }
    setPlayState(playState) {
        this.#playStateInternal = playState;
    }
    playbackRate() {
        return this.#payloadInternal.playbackRate;
    }
    // For scroll driven animations, it returns the pixel offset in the scroll container
    // For time animations, it returns milliseconds.
    startTime() {
        const viewOrScrollTimeline = this.viewOrScrollTimeline();
        if (viewOrScrollTimeline) {
            return this.percentageToPixels(this.playbackRate() > 0 ? this.#payloadInternal.startTime : 100 - this.#payloadInternal.startTime, viewOrScrollTimeline) +
                (this.viewOrScrollTimeline()?.startOffset ?? 0);
        }
        return this.#payloadInternal.startTime;
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    iterationDuration() {
        const viewOrScrollTimeline = this.viewOrScrollTimeline();
        if (viewOrScrollTimeline) {
            return this.percentageToPixels(this.source().duration(), viewOrScrollTimeline);
        }
        return this.source().duration();
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    endTime() {
        if (!this.source().iterations) {
            return Infinity;
        }
        if (this.viewOrScrollTimeline()) {
            return this.startTime() + this.iterationDuration() * this.source().iterations();
        }
        return this.startTime() + this.source().delay() + this.source().duration() * this.source().iterations() +
            this.source().endDelay();
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    finiteDuration() {
        const iterations = Math.min(this.source().iterations(), 3);
        if (this.viewOrScrollTimeline()) {
            return this.iterationDuration() * iterations;
        }
        return this.source().delay() + this.source().duration() * iterations;
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    currentTime() {
        const viewOrScrollTimeline = this.viewOrScrollTimeline();
        if (viewOrScrollTimeline) {
            return this.percentageToPixels(this.#payloadInternal.currentTime, viewOrScrollTimeline);
        }
        return this.#payloadInternal.currentTime;
    }
    source() {
        return this.#sourceInternal;
    }
    type() {
        return this.#payloadInternal.type;
    }
    overlaps(animation) {
        // Infinite animations
        if (!this.source().iterations() || !animation.source().iterations()) {
            return true;
        }
        const firstAnimation = this.startTime() < animation.startTime() ? this : animation;
        const secondAnimation = firstAnimation === this ? animation : this;
        return firstAnimation.endTime() >= secondAnimation.startTime();
    }
    // Utility method for returning `delay` for time based animations
    // and `startTime` in pixels for scroll driven animations. It is used to
    // find the exact starting time of the first keyframe for both cases.
    delayOrStartTime() {
        if (this.viewOrScrollTimeline()) {
            return this.startTime();
        }
        return this.source().delay();
    }
    setTiming(duration, delay) {
        void this.#sourceInternal.node().then(node => {
            if (!node) {
                throw new Error('Unable to find node');
            }
            this.updateNodeStyle(duration, delay, node);
        });
        this.#sourceInternal.durationInternal = duration;
        this.#sourceInternal.delayInternal = delay;
        void this.#animationModel.agent.invoke_setTiming({ animationId: this.id(), duration, delay });
    }
    updateNodeStyle(duration, delay, node) {
        let animationPrefix;
        if (this.type() === "CSSTransition" /* Protocol.Animation.AnimationType.CSSTransition */) {
            animationPrefix = 'transition-';
        }
        else if (this.type() === "CSSAnimation" /* Protocol.Animation.AnimationType.CSSAnimation */) {
            animationPrefix = 'animation-';
        }
        else {
            return;
        }
        if (!node.id) {
            throw new Error('Node has no id');
        }
        const cssModel = node.domModel().cssModel();
        cssModel.setEffectivePropertyValueForNode(node.id, animationPrefix + 'duration', duration + 'ms');
        cssModel.setEffectivePropertyValueForNode(node.id, animationPrefix + 'delay', delay + 'ms');
    }
    async remoteObjectPromise() {
        const payload = await this.#animationModel.agent.invoke_resolveAnimation({ animationId: this.id() });
        if (!payload) {
            return null;
        }
        return this.#animationModel.runtimeModel.createRemoteObject(payload.remoteObject);
    }
    cssId() {
        return this.#payloadInternal.cssId || '';
    }
}
export class AnimationEffect {
    #animationModel;
    #payload; // Assertion is safe because `setPayload` call in `constructor` sets the value.
    delayInternal; // Assertion is safe because `setPayload` call in `constructor` sets the value.
    durationInternal; // Assertion is safe because `setPayload` call in `constructor` sets the value.
    #keyframesRuleInternal;
    #deferredNodeInternal;
    constructor(animationModel, payload) {
        this.#animationModel = animationModel;
        this.setPayload(payload);
    }
    setPayload(payload) {
        this.#payload = payload;
        if (!this.#keyframesRuleInternal && payload.keyframesRule) {
            this.#keyframesRuleInternal = new KeyframesRule(payload.keyframesRule);
        }
        else if (this.#keyframesRuleInternal && payload.keyframesRule) {
            this.#keyframesRuleInternal.setPayload(payload.keyframesRule);
        }
        this.delayInternal = payload.delay;
        this.durationInternal = payload.duration;
    }
    delay() {
        return this.delayInternal;
    }
    endDelay() {
        return this.#payload.endDelay;
    }
    iterations() {
        // Animations with zero duration, zero delays and infinite iterations can't be shown.
        if (!this.delay() && !this.endDelay() && !this.duration()) {
            return 0;
        }
        return this.#payload.iterations || Infinity;
    }
    duration() {
        return this.durationInternal;
    }
    direction() {
        return this.#payload.direction;
    }
    fill() {
        return this.#payload.fill;
    }
    node() {
        if (!this.#deferredNodeInternal) {
            this.#deferredNodeInternal =
                new SDK.DOMModel.DeferredDOMNode(this.#animationModel.target(), this.backendNodeId());
        }
        return this.#deferredNodeInternal.resolvePromise();
    }
    deferredNode() {
        return new SDK.DOMModel.DeferredDOMNode(this.#animationModel.target(), this.backendNodeId());
    }
    backendNodeId() {
        return this.#payload.backendNodeId;
    }
    keyframesRule() {
        return this.#keyframesRuleInternal || null;
    }
    easing() {
        return this.#payload.easing;
    }
}
export class KeyframesRule {
    #payload; // Assertion is safe because `setPayload` call in `constructor` sets the value.;
    #keyframesInternal; // Assertion is safe because `setPayload` call in `constructor` sets the value.;
    constructor(payload) {
        this.setPayload(payload);
    }
    setPayload(payload) {
        this.#payload = payload;
        if (!this.#keyframesInternal) {
            this.#keyframesInternal = this.#payload.keyframes.map(keyframeStyle => new KeyframeStyle(keyframeStyle));
        }
        else {
            this.#payload.keyframes.forEach((keyframeStyle, index) => {
                this.#keyframesInternal[index]?.setPayload(keyframeStyle);
            });
        }
    }
    name() {
        return this.#payload.name;
    }
    keyframes() {
        return this.#keyframesInternal;
    }
}
export class KeyframeStyle {
    #payload; // Assertion is safe because `setPayload` call in `constructor` sets the value.
    #offsetInternal; // Assertion is safe because `setPayload` call in `constructor` sets the value.
    constructor(payload) {
        this.setPayload(payload);
    }
    setPayload(payload) {
        this.#payload = payload;
        this.#offsetInternal = payload.offset;
    }
    offset() {
        return this.#offsetInternal;
    }
    setOffset(offset) {
        this.#offsetInternal = offset * 100 + '%';
    }
    offsetAsNumber() {
        return parseFloat(this.#offsetInternal) / 100;
    }
    easing() {
        return this.#payload.easing;
    }
}
export class AnimationGroup {
    #animationModel;
    #idInternal;
    #scrollNodeInternal;
    #animationsInternal;
    #pausedInternal;
    screenshotsInternal;
    #screenshotImages;
    constructor(animationModel, id, animations) {
        this.#animationModel = animationModel;
        this.#idInternal = id;
        this.#animationsInternal = animations;
        this.#pausedInternal = false;
        this.screenshotsInternal = [];
        this.#screenshotImages = [];
    }
    isScrollDriven() {
        return Boolean(this.#animationsInternal[0]?.viewOrScrollTimeline());
    }
    id() {
        return this.#idInternal;
    }
    animations() {
        return this.#animationsInternal;
    }
    release() {
        this.#animationModel.animationGroups.delete(this.id());
        this.#animationModel.releaseAnimations(this.animationIds());
    }
    animationIds() {
        function extractId(animation) {
            return animation.id();
        }
        return this.#animationsInternal.map(extractId);
    }
    startTime() {
        return this.#animationsInternal[0].startTime();
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    groupDuration() {
        let duration = 0;
        for (const anim of this.#animationsInternal) {
            duration = Math.max(duration, anim.delayOrStartTime() + anim.iterationDuration());
        }
        return duration;
    }
    // For scroll driven animations, it returns the duration in pixels (i.e. after how many pixels of scroll the animation is going to end)
    // For time animations, it returns milliseconds.
    finiteDuration() {
        let maxDuration = 0;
        for (let i = 0; i < this.#animationsInternal.length; ++i) {
            maxDuration = Math.max(maxDuration, this.#animationsInternal[i].finiteDuration());
        }
        return maxDuration;
    }
    scrollOrientation() {
        const timeline = this.#animationsInternal[0]?.viewOrScrollTimeline();
        if (!timeline) {
            return null;
        }
        return timeline.axis;
    }
    async scrollNode() {
        if (this.#scrollNodeInternal) {
            return this.#scrollNodeInternal;
        }
        if (!this.isScrollDriven()) {
            return null;
        }
        const sourceNodeId = this.#animationsInternal[0]?.viewOrScrollTimeline()?.sourceNodeId;
        if (!sourceNodeId) {
            return null;
        }
        const deferredScrollNode = new SDK.DOMModel.DeferredDOMNode(this.#animationModel.target(), sourceNodeId);
        const scrollNode = await deferredScrollNode.resolvePromise();
        if (!scrollNode) {
            return null;
        }
        this.#scrollNodeInternal = new AnimationDOMNode(scrollNode);
        return this.#scrollNodeInternal;
    }
    seekTo(currentTime) {
        void this.#animationModel.agent.invoke_seekAnimations({ animations: this.animationIds(), currentTime });
    }
    paused() {
        return this.#pausedInternal;
    }
    togglePause(paused) {
        if (paused === this.#pausedInternal) {
            return;
        }
        this.#pausedInternal = paused;
        void this.#animationModel.agent.invoke_setPaused({ animations: this.animationIds(), paused });
    }
    currentTimePromise() {
        let longestAnim = null;
        for (const anim of this.#animationsInternal) {
            if (!longestAnim || anim.endTime() > longestAnim.endTime()) {
                longestAnim = anim;
            }
        }
        if (!longestAnim) {
            throw new Error('No longest animation found');
        }
        return this.#animationModel.agent.invoke_getCurrentTime({ id: longestAnim.id() })
            .then(({ currentTime }) => currentTime || 0);
    }
    matches(group) {
        function extractId(anim) {
            const timelineId = (anim.viewOrScrollTimeline()?.sourceNodeId ?? '') + (anim.viewOrScrollTimeline()?.axis ?? '');
            const regularId = anim.type() === "WebAnimation" /* Protocol.Animation.AnimationType.WebAnimation */ ? anim.type() + anim.id() : anim.cssId();
            return regularId + timelineId;
        }
        if (this.#animationsInternal.length !== group.#animationsInternal.length) {
            return false;
        }
        const left = this.#animationsInternal.map(extractId).sort();
        const right = group.#animationsInternal.map(extractId).sort();
        for (let i = 0; i < left.length; i++) {
            if (left[i] !== right[i]) {
                return false;
            }
        }
        return true;
    }
    update(group) {
        this.#animationModel.releaseAnimations(this.animationIds());
        this.#animationsInternal = group.#animationsInternal;
        this.#scrollNodeInternal = undefined;
    }
    screenshots() {
        for (let i = 0; i < this.screenshotsInternal.length; ++i) {
            const image = new Image();
            image.src = 'data:image/jpeg;base64,' + this.screenshotsInternal[i];
            this.#screenshotImages.push(image);
        }
        this.screenshotsInternal = [];
        return this.#screenshotImages;
    }
}
export class AnimationDispatcher {
    #animationModel;
    constructor(animationModel) {
        this.#animationModel = animationModel;
    }
    animationCreated({ id }) {
        this.#animationModel.animationCreated(id);
    }
    animationCanceled({ id }) {
        this.#animationModel.animationCanceled(id);
    }
    animationStarted({ animation }) {
        void this.#animationModel.animationStarted(animation);
    }
    animationUpdated({ animation }) {
        void this.#animationModel.animationUpdated(animation);
    }
}
export class ScreenshotCapture {
    #requests;
    #screenCaptureModel;
    #animationModel;
    #stopTimer;
    #endTime;
    #capturing;
    constructor(animationModel, screenCaptureModel) {
        this.#requests = [];
        this.#screenCaptureModel = screenCaptureModel;
        this.#animationModel = animationModel;
        this.#animationModel.addEventListener(Events.ModelReset, this.stopScreencast, this);
    }
    captureScreenshots(duration, screenshots) {
        const screencastDuration = Math.min(duration / this.#animationModel.playbackRate, 3000);
        const endTime = screencastDuration + window.performance.now();
        this.#requests.push({ endTime: endTime, screenshots: screenshots });
        if (!this.#endTime || endTime > this.#endTime) {
            clearTimeout(this.#stopTimer);
            this.#stopTimer = window.setTimeout(this.stopScreencast.bind(this), screencastDuration);
            this.#endTime = endTime;
        }
        if (this.#capturing) {
            return;
        }
        this.#capturing = true;
        this.#screenCaptureModel.startScreencast("jpeg" /* Protocol.Page.StartScreencastRequestFormat.Jpeg */, 80, undefined, 300, 2, this.screencastFrame.bind(this), _visible => { });
    }
    screencastFrame(base64Data, _metadata) {
        function isAnimating(request) {
            return request.endTime >= now;
        }
        if (!this.#capturing) {
            return;
        }
        const now = window.performance.now();
        this.#requests = this.#requests.filter(isAnimating);
        for (const request of this.#requests) {
            request.screenshots.push(base64Data);
        }
    }
    stopScreencast() {
        if (!this.#capturing) {
            return;
        }
        this.#stopTimer = undefined;
        this.#endTime = undefined;
        this.#requests = [];
        this.#capturing = false;
        this.#screenCaptureModel.stopScreencast();
    }
}
SDK.SDKModel.SDKModel.register(AnimationModel, { capabilities: 2 /* SDK.Target.Capability.DOM */, autostart: false });
//# sourceMappingURL=AnimationModel.js.map