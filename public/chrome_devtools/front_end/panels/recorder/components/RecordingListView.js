// Copyright 2023 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as i18n from '../../../core/i18n/i18n.js';
import * as Buttons from '../../../ui/components/buttons/buttons.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
import * as IconButton from '../../../ui/components/icon_button/icon_button.js';
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as VisualLogging from '../../../ui/visual_logging/visual_logging.js';
import * as Models from '../models/models.js';
import recordingListViewStyles from './recordingListView.css.js';
const UIStrings = {
    /**
     *@description The title of the page that contains a list of saved recordings that the user has..
     */
    savedRecordings: 'Saved recordings',
    /**
     * @description The title of the button that leads to create a new recording page.
     */
    createRecording: 'Create a new recording',
    /**
     * @description The title of the button that is shown next to each of the recordings and that triggers playing of the recording.
     */
    playRecording: 'Play recording',
    /**
     * @description The title of the button that is shown next to each of the recordings and that triggers deletion of the recording.
     */
    deleteRecording: 'Delete recording',
    /**
     * @description The title of the row corresponding to a recording. By clicking on the row, the user open the recording for editing.
     */
    openRecording: 'Open recording',
};
const str_ = i18n.i18n.registerUIStrings('panels/recorder/components/RecordingListView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class CreateRecordingEvent extends Event {
    static eventName = 'createrecording';
    constructor() {
        super(CreateRecordingEvent.eventName);
    }
}
export class DeleteRecordingEvent extends Event {
    storageName;
    static eventName = 'deleterecording';
    constructor(storageName) {
        super(DeleteRecordingEvent.eventName);
        this.storageName = storageName;
    }
}
export class OpenRecordingEvent extends Event {
    storageName;
    static eventName = 'openrecording';
    constructor(storageName) {
        super(OpenRecordingEvent.eventName);
        this.storageName = storageName;
    }
}
export class PlayRecordingEvent extends Event {
    storageName;
    static eventName = 'playrecording';
    constructor(storageName) {
        super(PlayRecordingEvent.eventName);
        this.storageName = storageName;
    }
}
export class RecordingListView extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-recording-list-view`;
    #shadow = this.attachShadow({ mode: 'open' });
    #props = {
        recordings: [],
        replayAllowed: true,
    };
    constructor() {
        super();
    }
    connectedCallback() {
        this.#shadow.adoptedStyleSheets = [recordingListViewStyles];
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    set recordings(recordings) {
        this.#props.recordings = recordings;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    set replayAllowed(value) {
        this.#props.replayAllowed = value;
        void ComponentHelpers.ScheduledRender.scheduleRender(this, this.#render);
    }
    #onCreateClick() {
        this.dispatchEvent(new CreateRecordingEvent());
    }
    #onDeleteClick(storageName, event) {
        event.stopPropagation();
        this.dispatchEvent(new DeleteRecordingEvent(storageName));
    }
    #onOpenClick(storageName, event) {
        event.stopPropagation();
        this.dispatchEvent(new OpenRecordingEvent(storageName));
    }
    #onPlayRecordingClick(storageName, event) {
        event.stopPropagation();
        this.dispatchEvent(new PlayRecordingEvent(storageName));
    }
    #onKeyDown(storageName, event) {
        if (event.key !== 'Enter') {
            return;
        }
        this.#onOpenClick(storageName, event);
    }
    #stopPropagation(event) {
        event.stopPropagation();
    }
    #render = () => {
        // clang-format off
        LitHtml.render(LitHtml.html `
        <div class="wrapper">
          <div class="header">
            <h1>${i18nString(UIStrings.savedRecordings)}</h1>
            <${Buttons.Button.Button.litTagName}
              .variant=${"primary" /* Buttons.Button.Variant.PRIMARY */}
              @click=${this.#onCreateClick}
              title=${Models.Tooltip.getTooltipForActions(i18nString(UIStrings.createRecording), "chrome-recorder.create-recording" /* Actions.RecorderActions.CreateRecording */)}
              .jslogContext=${'create-recording'}
            >
              ${i18nString(UIStrings.createRecording)}
            </${Buttons.Button.Button.litTagName}>
          </div>
          <div class="table">
            ${this.#props.recordings.map(recording => {
            return LitHtml.html `
                  <div
                    role="button"
                    tabindex="0"
                    aria-label=${i18nString(UIStrings.openRecording)}
                    class="row"
                    @keydown=${this.#onKeyDown.bind(this, recording.storageName)}
                    @click=${this.#onOpenClick.bind(this, recording.storageName)}
                    jslog=${VisualLogging.item()
                .track({ click: true })
                .context('recording')}>
                    <div class="icon">
                      <${IconButton.Icon.Icon.litTagName} name="flow">
                      </${IconButton.Icon.Icon.litTagName}>
                    </div>
                    <div class="title">${recording.name}</div>
                    <div class="actions">
                      ${this.#props.replayAllowed
                ? LitHtml.html `
                              <${Buttons.Button.Button.litTagName}
                                title=${i18nString(UIStrings.playRecording)}
                                .data=${{
                    variant: "icon" /* Buttons.Button.Variant.ICON */,
                    iconName: 'play',
                    jslogContext: 'play-recording',
                }}
                                @click=${this.#onPlayRecordingClick.bind(this, recording.storageName)}
                                @keydown=${this.#stopPropagation}
                              ></${Buttons.Button.Button.litTagName}>
                              <div class="divider"></div>`
                : ''}
                      <${Buttons.Button.Button.litTagName}
                        class="delete-recording-button"
                        title=${i18nString(UIStrings.deleteRecording)}
                        .data=${{
                variant: "icon" /* Buttons.Button.Variant.ICON */,
                iconName: 'bin',
                jslogContext: 'delete-recording',
            }}
                        @click=${this.#onDeleteClick.bind(this, recording.storageName)}
                        @keydown=${this.#stopPropagation}
                      ></${Buttons.Button.Button.litTagName}>
                    </div>
                  </div>
                `;
        })}
          </div>
        </div>
      `, this.#shadow, { host: this });
        // clang-format on
    };
}
customElements.define('devtools-recording-list-view', RecordingListView);
//# sourceMappingURL=RecordingListView.js.map