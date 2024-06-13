import * as Common from '../../../core/common/common.js';
import { PlayRecordingSpeed } from './RecordingPlayer.js';
import { SelectorType } from './Schema.js';
export declare class RecorderSettings {
    #private;
    constructor();
    get selectorAttribute(): string;
    set selectorAttribute(value: string);
    get speed(): PlayRecordingSpeed;
    set speed(speed: PlayRecordingSpeed);
    get replayExtension(): string;
    set replayExtension(replayExtension: string);
    get defaultTitle(): Common.UIString.LocalizedString;
    get defaultSelectors(): SelectorType[];
    getSelectorByType(type: SelectorType): boolean | undefined;
    setSelectorByType(type: SelectorType, value: boolean): void;
    get preferredCopyFormat(): string;
    set preferredCopyFormat(value: string);
}
