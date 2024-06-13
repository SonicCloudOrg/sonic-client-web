// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
const MAX_WORKERS = Math.max(2, navigator.hardwareConcurrency - 1);
let formatterWorkerPoolInstance;
export class FormatterWorkerPool {
    taskQueue;
    workerTasks;
    constructor() {
        this.taskQueue = [];
        this.workerTasks = new Map();
    }
    static instance() {
        if (!formatterWorkerPoolInstance) {
            formatterWorkerPoolInstance = new FormatterWorkerPool();
        }
        return formatterWorkerPoolInstance;
    }
    createWorker() {
        const worker = Common.Worker.WorkerWrapper.fromURL(new URL('../../entrypoints/formatter_worker/formatter_worker-entrypoint.js', import.meta.url));
        worker.onmessage = this.onWorkerMessage.bind(this, worker);
        worker.onerror = this.onWorkerError.bind(this, worker);
        return worker;
    }
    processNextTask() {
        if (!this.taskQueue.length) {
            return;
        }
        let freeWorker = [...this.workerTasks.keys()].find(worker => !this.workerTasks.get(worker));
        if (!freeWorker && this.workerTasks.size < MAX_WORKERS) {
            freeWorker = this.createWorker();
        }
        if (!freeWorker) {
            return;
        }
        const task = this.taskQueue.shift();
        if (task) {
            this.workerTasks.set(freeWorker, task);
            freeWorker.postMessage({ method: task.method, params: task.params });
        }
    }
    onWorkerMessage(worker, event) {
        const task = this.workerTasks.get(worker);
        if (!task) {
            return;
        }
        if (task.isChunked && event.data && !event.data['isLastChunk']) {
            task.callback(event.data);
            return;
        }
        this.workerTasks.set(worker, null);
        this.processNextTask();
        task.callback(event.data ? event.data : null);
    }
    onWorkerError(worker, event) {
        console.error(event);
        const task = this.workerTasks.get(worker);
        worker.terminate();
        this.workerTasks.delete(worker);
        const newWorker = this.createWorker();
        this.workerTasks.set(newWorker, null);
        this.processNextTask();
        if (task) {
            task.callback(null);
        }
    }
    runChunkedTask(methodName, params, 
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callback) {
        const task = new Task(methodName, params, onData, true);
        this.taskQueue.push(task);
        this.processNextTask();
        function onData(data) {
            if (!data) {
                callback(true, null);
                return;
            }
            const isLastChunk = 'isLastChunk' in data && Boolean(data['isLastChunk']);
            const chunk = 'chunk' in data && data['chunk'];
            callback(isLastChunk, chunk);
        }
    }
    runTask(methodName, params) {
        return new Promise(resolve => {
            const task = new Task(methodName, params, resolve, false);
            this.taskQueue.push(task);
            this.processNextTask();
        });
    }
    format(mimeType, content, indentString) {
        const parameters = { mimeType: mimeType, content: content, indentString: indentString };
        return this.runTask("format" /* FormatterActions.FormatterActions.FORMAT */, parameters);
    }
    javaScriptSubstitute(expression, mapping) {
        return this.runTask("javaScriptSubstitute" /* FormatterActions.FormatterActions.JAVASCRIPT_SUBSTITUTE */, { content: expression, mapping })
            .then(result => result || '');
    }
    javaScriptScopeTree(expression, sourceType = 'script') {
        return this.runTask("javaScriptScopeTree" /* FormatterActions.FormatterActions.JAVASCRIPT_SCOPE_TREE */, { content: expression, sourceType })
            .then(result => result || null);
    }
    evaluatableJavaScriptSubstring(content) {
        return this.runTask("evaluatableJavaScriptSubstring" /* FormatterActions.FormatterActions.EVALUATE_JAVASCRIPT_SUBSTRING */, { content: content })
            .then(text => text || '');
    }
    parseCSS(content, callback) {
        this.runChunkedTask("parseCSS" /* FormatterActions.FormatterActions.PARSE_CSS */, { content: content }, onDataChunk);
        // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function onDataChunk(isLastChunk, data) {
            const rules = (data || []);
            callback(isLastChunk, rules);
        }
    }
}
class Task {
    method;
    params;
    callback;
    isChunked;
    constructor(method, params, callback, isChunked) {
        this.method = method;
        this.params = params;
        this.callback = callback;
        this.isChunked = isChunked;
    }
}
export function formatterWorkerPool() {
    return FormatterWorkerPool.instance();
}
//# sourceMappingURL=FormatterWorkerPool.js.map