// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/es_modules_import */
import { describeWithEnvironment, setupActionRegistry, } from '../../testing/EnvironmentHelpers.js';
import * as Coordinator from '../../ui/components/render_coordinator/render_coordinator.js';
import * as Components from './components/components.js';
import * as Models from './models/models.js';
import { RecorderController } from './recorder.js';
const coordinator = Coordinator.RenderCoordinator.RenderCoordinator.instance();
describeWithEnvironment('RecorderController', () => {
    setupActionRegistry();
    function makeRecording() {
        const step = {
            type: Models.Schema.StepType.Navigate,
            url: 'https://example.com',
        };
        const recording = {
            storageName: 'test',
            flow: { title: 'test', steps: [step] },
        };
        return recording;
    }
    async function setupController(recording) {
        const controller = new RecorderController.RecorderController();
        controller.setCurrentPageForTesting("RecordingPage" /* RecorderController.Pages.RecordingPage */);
        controller.setCurrentRecordingForTesting(recording);
        controller.connectedCallback();
        await coordinator.done();
        return controller;
    }
    describe('Navigation', () => {
        it('should return back to the previous page on recordingcancelled event', async () => {
            const previousPage = "AllRecordingsPage" /* RecorderController.Pages.AllRecordingsPage */;
            const controller = new RecorderController.RecorderController();
            controller.setCurrentPageForTesting(previousPage);
            controller.setCurrentPageForTesting("CreateRecordingPage" /* RecorderController.Pages.CreateRecordingPage */);
            controller.connectedCallback();
            await coordinator.done();
            const createRecordingView = controller.shadowRoot?.querySelector('devtools-create-recording-view');
            assert.ok(createRecordingView);
            createRecordingView?.dispatchEvent(new Components.CreateRecordingView.RecordingCancelledEvent());
            assert.strictEqual(controller.getCurrentPageForTesting(), previousPage);
        });
    });
    describe('StepView', () => {
        async function dispatchRecordingViewEvent(controller, event) {
            const recordingView = controller.shadowRoot?.querySelector('devtools-recording-view');
            assert.ok(recordingView);
            recordingView?.dispatchEvent(event);
            await coordinator.done();
        }
        beforeEach(() => {
            Models.RecordingStorage.RecordingStorage.instance().clearForTest();
        });
        after(() => {
            Models.RecordingStorage.RecordingStorage.instance().clearForTest();
        });
        it('should add a new step after a step', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddStep(recording.flow.steps[0], "after" /* Components.StepView.AddStepPosition.AFTER */));
            const flow = controller.getUserFlow();
            assert.deepStrictEqual(flow, {
                title: 'test',
                steps: [
                    {
                        type: Models.Schema.StepType.Navigate,
                        url: 'https://example.com',
                    },
                    {
                        type: Models.Schema.StepType.WaitForElement,
                        selectors: ['body'],
                    },
                ],
            });
        });
        it('should add a new step after a section', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const sections = controller.getSectionsForTesting();
            if (!sections) {
                throw new Error('Controller is missing sections');
            }
            assert.lengthOf(sections, 1);
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddStep(sections[0], "after" /* Components.StepView.AddStepPosition.AFTER */));
            const flow = controller.getUserFlow();
            assert.deepStrictEqual(flow, {
                title: 'test',
                steps: [
                    {
                        type: Models.Schema.StepType.Navigate,
                        url: 'https://example.com',
                    },
                    {
                        type: Models.Schema.StepType.WaitForElement,
                        selectors: ['body'],
                    },
                ],
            });
        });
        it('should add a new step before a step', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddStep(recording.flow.steps[0], "before" /* Components.StepView.AddStepPosition.BEFORE */));
            const flow = controller.getUserFlow();
            assert.deepStrictEqual(flow, {
                title: 'test',
                steps: [
                    {
                        type: Models.Schema.StepType.WaitForElement,
                        selectors: ['body'],
                    },
                    {
                        type: Models.Schema.StepType.Navigate,
                        url: 'https://example.com',
                    },
                ],
            });
        });
        it('should delete a step', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            await dispatchRecordingViewEvent(controller, new Components.StepView.RemoveStep(recording.flow.steps[0]));
            const flow = controller.getUserFlow();
            assert.deepStrictEqual(flow, { title: 'test', steps: [] });
        });
        it('should adding a new step before a step with a breakpoint update the breakpoint indexes correctly', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const stepIndex = 3;
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex,
            ]);
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddStep(recording.flow.steps[0], "before" /* Components.StepView.AddStepPosition.BEFORE */));
            // Breakpoint index moves to the next index
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex + 1,
            ]);
        });
        it('should removing a step before a step with a breakpoint update the breakpoint indexes correctly', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const stepIndex = 3;
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex,
            ]);
            await dispatchRecordingViewEvent(controller, new Components.StepView.RemoveStep(recording.flow.steps[0]));
            // Breakpoint index moves to the previous index
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex - 1,
            ]);
        });
        it('should removing a step with a breakpoint remove the breakpoint index as well', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const stepIndex = 0;
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex,
            ]);
            await dispatchRecordingViewEvent(controller, new Components.StepView.RemoveStep(recording.flow.steps[stepIndex]));
            // Breakpoint index is removed
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), []);
        });
        it('should "add breakpoint" event add a breakpoint', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const stepIndex = 1;
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), []);
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex,
            ]);
        });
        it('should "remove breakpoint" event remove a breakpoint', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            const stepIndex = 1;
            await dispatchRecordingViewEvent(controller, new Components.StepView.AddBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), [
                stepIndex,
            ]);
            await dispatchRecordingViewEvent(controller, new Components.StepView.RemoveBreakpointEvent(stepIndex));
            assert.deepEqual(controller.getStepBreakpointIndexesForTesting(), []);
        });
    });
    describe('Create new recording action', () => {
        it('should execute action', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            await controller.handleActions("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */);
            assert.strictEqual(controller.getCurrentPageForTesting(), "CreateRecordingPage" /* RecorderController.Pages.CreateRecordingPage */);
        });
        it('should not execute action while recording', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setIsRecordingStateForTesting(true);
            await controller.handleActions("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */);
            assert.strictEqual(controller.getCurrentPageForTesting(), "RecordingPage" /* RecorderController.Pages.RecordingPage */);
        });
        it('should not execute action while replaying', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setRecordingStateForTesting({
                isPlaying: true,
                isPausedOnBreakpoint: false,
            });
            await controller.handleActions("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */);
            assert.strictEqual(controller.getCurrentPageForTesting(), "RecordingPage" /* RecorderController.Pages.RecordingPage */);
        });
    });
    describe('Action is possible', () => {
        it('should return true for create action when not replaying or recording', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            assert.isTrue(controller.isActionPossible("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */));
        });
        it('should return false for create action when recording', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setRecordingStateForTesting({
                isPlaying: true,
                isPausedOnBreakpoint: false,
            });
            assert.isFalse(controller.isActionPossible("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */));
        });
        it('should return false for create action when replaying', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setIsRecordingStateForTesting(true);
            assert.isFalse(controller.isActionPossible("chrome-recorder.create-recording" /* RecorderActions.CreateRecording */));
        });
        it('should return correct value for start/stop action', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            assert.isTrue(controller.isActionPossible("chrome-recorder.start-recording" /* RecorderActions.StartRecording */));
            controller.setRecordingStateForTesting({
                isPlaying: true,
                isPausedOnBreakpoint: false,
            });
            assert.isFalse(controller.isActionPossible("chrome-recorder.start-recording" /* RecorderActions.StartRecording */));
        });
        it('should return true for replay action when on the recording page', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setCurrentPageForTesting("RecordingPage" /* RecorderController.Pages.RecordingPage */);
            assert.isTrue(controller.isActionPossible("chrome-recorder.replay-recording" /* RecorderActions.ReplayRecording */));
        });
        it('should return false for replay action when not on the recording page', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setCurrentPageForTesting("AllRecordingsPage" /* RecorderController.Pages.AllRecordingsPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.replay-recording" /* RecorderActions.ReplayRecording */));
            controller.setCurrentPageForTesting("CreateRecordingPage" /* RecorderController.Pages.CreateRecordingPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.replay-recording" /* RecorderActions.ReplayRecording */));
            controller.setCurrentPageForTesting("StartPage" /* RecorderController.Pages.StartPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.replay-recording" /* RecorderActions.ReplayRecording */));
            controller.setRecordingStateForTesting({
                isPlaying: true,
                isPausedOnBreakpoint: false,
            });
            controller.setCurrentPageForTesting("RecordingPage" /* RecorderController.Pages.RecordingPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.replay-recording" /* RecorderActions.ReplayRecording */));
        });
        it('should true for toggle when on the recording page', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setCurrentPageForTesting("RecordingPage" /* RecorderController.Pages.RecordingPage */);
            assert.isTrue(controller.isActionPossible("chrome-recorder.toggle-code-view" /* RecorderActions.ToggleCodeView */));
        });
        it('should false for toggle when on the recording page', async () => {
            const recording = makeRecording();
            const controller = await setupController(recording);
            controller.setCurrentPageForTesting("AllRecordingsPage" /* RecorderController.Pages.AllRecordingsPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.toggle-code-view" /* RecorderActions.ToggleCodeView */));
            controller.setCurrentPageForTesting("StartPage" /* RecorderController.Pages.StartPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.toggle-code-view" /* RecorderActions.ToggleCodeView */));
            controller.setCurrentPageForTesting("AllRecordingsPage" /* RecorderController.Pages.AllRecordingsPage */);
            assert.isFalse(controller.isActionPossible("chrome-recorder.toggle-code-view" /* RecorderActions.ToggleCodeView */));
        });
    });
});
//# sourceMappingURL=RecorderController.test.js.map