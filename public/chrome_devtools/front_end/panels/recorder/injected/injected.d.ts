import * as RecordingClient from './RecordingClient.js';
import * as SelectorPicker from './SelectorPicker.js';
import type * as Step from './Step.js';
import { type AccessibilityBindings } from './selectors/ARIASelector.js';
declare global {
    interface Window {
        stopShortcut(payload: string): void;
        DevToolsRecorder: DevToolsRecorder;
    }
}
declare class DevToolsRecorder {
    #private;
    startRecording(bindings: AccessibilityBindings, options?: RecordingClient.RecordingClientOptions): void;
    stopRecording(): void;
    get recordingClientForTesting(): RecordingClient.RecordingClient;
    startSelectorPicker(bindings: AccessibilityBindings, customAttribute?: string, debug?: boolean): void;
    stopSelectorPicker(): void;
}
export { type Step, type RecordingClient, type SelectorPicker, type DevToolsRecorder, };
