export declare const enum Category {
    Animation = "animation",
    AuctionWorklet = "auction-worklet",
    Canvas = "canvas",
    Clipboard = "clipboard",
    Control = "control",
    Device = "device",
    DomMutation = "dom-mutation",
    DragDrop = "drag-drop",
    Geolocation = "geolocation",
    Keyboard = "keyboard",
    Load = "load",
    Media = "media",
    Mouse = "mouse",
    Notification = "notification",
    Parse = "parse",
    PictureInPicture = "picture-in-picture",
    Pointer = "pointer",
    Script = "script",
    SharedStorageWorklet = "shared-storage-worklet",
    Timer = "timer",
    Touch = "touch",
    TrustedTypeViolation = "trusted-type-violation",
    WebAudio = "web-audio",
    Window = "window",
    Worker = "worker",
    Xhr = "xhr"
}
export declare class CategorizedBreakpoint {
    #private;
    /**
     * The name of this breakpoint as passed to 'setInstrumentationBreakpoint',
     * 'setEventListenerBreakpoint' and 'setBreakOnCSPViolation'.
     *
     * Note that the backend adds a 'listener:' and 'instrumentation:' prefix
     * to this name in the 'Debugger.paused' CDP event.
     */
    readonly name: string;
    private enabledInternal;
    constructor(category: Category, name: string);
    category(): Category;
    enabled(): boolean;
    setEnabled(enabled: boolean): void;
}
