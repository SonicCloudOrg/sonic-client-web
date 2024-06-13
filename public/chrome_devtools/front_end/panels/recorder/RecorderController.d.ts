import * as LitHtml from '../../ui/lit-html/lit-html.js';
import * as Components from './components/components.js';
import * as Models from './models/models.js';
import * as Actions from './recorder-actions/recorder-actions.js';
declare const LitElement: typeof LitHtml.LitElement;
declare global {
    interface HTMLElementTagNameMap {
        'devtools-recorder-controller': RecorderController;
    }
    interface FileSystemWritableFileStream extends WritableStream {
        write(data: unknown): Promise<void>;
        close(): Promise<void>;
    }
    interface FileSystemHandle {
        createWritable(): Promise<FileSystemWritableFileStream>;
    }
    interface Window {
        showSaveFilePicker(opts: unknown): Promise<FileSystemHandle>;
    }
}
interface StoredRecording {
    storageName: string;
    flow: Models.Schema.UserFlow;
}
export declare const enum Pages {
    StartPage = "StartPage",
    AllRecordingsPage = "AllRecordingsPage",
    CreateRecordingPage = "CreateRecordingPage",
    RecordingPage = "RecordingPage"
}
export declare class RecorderController extends LitElement {
    #private;
    static readonly styles: CSSStyleSheet[];
    private currentRecordingSession?;
    private currentRecording;
    private currentStep?;
    private recordingError?;
    private isRecording;
    private isToggling;
    private recordingPlayer?;
    private lastReplayResult?;
    private currentPage;
    private previousPage?;
    private sections?;
    private settings?;
    private importError?;
    private exportMenuExpanded;
    private extensionConverters;
    private replayExtensions;
    private viewDescriptor?;
    constructor();
    disconnectedCallback(): void;
    setIsRecordingStateForTesting(isRecording: boolean): void;
    setRecordingStateForTesting(state: Components.RecordingView.ReplayState): void;
    setCurrentPageForTesting(page: Pages): void;
    getCurrentPageForTesting(): Pages;
    getCurrentRecordingForTesting(): StoredRecording | undefined;
    getStepBreakpointIndexesForTesting(): number[];
    setCurrentRecordingForTesting(recording: StoredRecording | undefined): void;
    getSectionsForTesting(): Array<Models.Section.Section> | undefined;
    getUserFlow(): Models.Schema.UserFlow | undefined;
    handleActions(actionId: Actions.RecorderActions): void;
    isActionPossible(actionId: Actions.RecorderActions): boolean;
    protected render(): LitHtml.TemplateResult;
}
export {};
