import { type Loggable } from './Loggable.js';
import { type LoggingConfig } from './LoggingConfig.js';
import { type LoggingState } from './LoggingState.js';
export declare function processForDebugging(loggable: Loggable): void;
type EventType = 'Click' | 'Drag' | 'Hover' | 'Change' | 'KeyDown' | 'Resize';
export declare function processEventForDebugging(event: EventType, state: LoggingState | null, extraInfo?: EventAttributes): void;
export declare function processEventForIntuitiveDebugging(event: EventType, state: LoggingState | null, extraInfo?: EventAttributes): void;
export declare function processEventForAdHocAnalysisDebugging(event: EventType, state: LoggingState | null, extraInfo?: EventAttributes): void;
export type EventAttributes = {
    context?: string;
    width?: number;
    height?: number;
    mouseButton?: number;
    doubleClick?: boolean;
};
export declare function processImpressionsForDebugging(states: LoggingState[]): void;
export declare function debugString(config: LoggingConfig): string;
export declare function processStartLoggingForDebugging(): void;
export {};
