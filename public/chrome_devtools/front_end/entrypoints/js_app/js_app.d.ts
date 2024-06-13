import '../shell/shell.js';
import '../../panels/js_timeline/js_timeline-meta.js';
import '../../panels/mobile_throttling/mobile_throttling-meta.js';
import * as Common from '../../core/common/common.js';
export declare class JsMainImpl implements Common.Runnable.Runnable {
    static instance(opts?: {
        forceNew: boolean | null;
    }): JsMainImpl;
    run(): Promise<void>;
}
