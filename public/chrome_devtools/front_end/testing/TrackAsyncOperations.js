// Copyright 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
const asyncActivity = [];
export function startTrackingAsyncActivity() {
    // We are tracking all asynchronous activity but let it run normally during
    // the test.
    stub('requestAnimationFrame', trackingRequestAnimationFrame);
    stub('setTimeout', trackingSetTimeout);
    stub('setInterval', trackingSetInterval);
    stub('requestIdleCallback', trackingRequestIdleCallback);
    stub('cancelAnimationFrame', id => cancelTrackingActivity('a' + id));
    stub('clearTimeout', id => cancelTrackingActivity('t' + id));
    stub('clearInterval', id => cancelTrackingActivity('i' + id));
    stub('cancelIdleCallback', id => cancelTrackingActivity('d' + id));
    stub('Promise', TrackingPromise);
}
export async function checkForPendingActivity() {
    let stillPending = [];
    const wait = 5;
    let retries = 20;
    // We will perform multiple iteration of waiting and forced completions to see
    // if all promises are eventually resolved.
    while (retries > 0) {
        const pendingCount = asyncActivity.filter(a => a.pending).length;
        const totalCount = asyncActivity.length;
        try {
            // First we wait for the pending async activity to finish normally
            await original(Promise).all(asyncActivity.filter(a => a.pending).map(a => original(Promise).race([
                a.promise,
                new (original(Promise))((_, reject) => original(setTimeout)(() => {
                    if (!a.pending) {
                        return;
                    }
                    // If something is still pending after some time, we try to
                    // force the completion by running timeout and animation frame
                    // handlers
                    if (a.cancelDelayed && a.runImmediate) {
                        a.cancelDelayed();
                        a.runImmediate();
                    }
                    else {
                        reject();
                    }
                }, wait)),
            ])));
            // If the above didn't throw, all the original pending activity has
            // completed, but it could have triggered more
            stillPending = asyncActivity.filter(a => a.pending);
            if (!stillPending.length) {
                break;
            }
            --retries;
        }
        catch (e) {
            stillPending = asyncActivity.filter(a => a.pending);
            const newTotalCount = asyncActivity.length;
            // Something is still pending. It might get resolved by force completion
            // of new activity added during the iteration, so let's retry a couple of
            // times.
            if (newTotalCount === totalCount && stillPending.length === pendingCount) {
                --retries;
            }
        }
    }
    if (stillPending.length) {
        throw new Error('The test has completed, but there are still pending promises, created at: \n' +
            stillPending.map(a => a.stack).join('\n\n'));
    }
}
export function stopTrackingAsyncActivity() {
    asyncActivity.length = 0;
    restoreAll();
}
function trackingRequestAnimationFrame(fn) {
    const activity = { pending: true };
    let id = 0;
    activity.promise = new (original((Promise)))(resolve => {
        activity.runImmediate = () => {
            fn(performance.now());
            activity.pending = false;
            resolve();
        };
        id = original(requestAnimationFrame)(activity.runImmediate);
        activity.id = 'a' + id;
        activity.cancelDelayed = () => {
            original(cancelAnimationFrame)(id);
            activity.pending = false;
            resolve();
        };
    });
    asyncActivity.push(activity);
    return id;
}
function trackingRequestIdleCallback(fn, opts) {
    const activity = { pending: true };
    let id = 0;
    activity.promise = new (original((Promise)))(resolve => {
        activity.runImmediate = (idleDeadline) => {
            fn(idleDeadline ?? { didTimeout: true, timeRemaining: () => 0 });
            activity.pending = false;
            resolve();
        };
        id = original(requestIdleCallback)(activity.runImmediate, opts);
        activity.id = 'd' + id;
        activity.cancelDelayed = () => {
            original(cancelIdleCallback)(id);
            activity.pending = false;
            resolve();
        };
    });
    asyncActivity.push(activity);
    return id;
}
function trackingSetTimeout(arg, time, ...params) {
    const activity = {
        pending: true,
    };
    let id = 0;
    activity.promise = new (original((Promise)))(resolve => {
        activity.runImmediate = () => {
            if (typeof (arg) === 'function') {
                arg(...params);
            }
            else {
                eval(arg);
            }
            activity.pending = false;
            resolve();
        };
        id = original(setTimeout)(activity.runImmediate, time);
        activity.id = 't' + id;
        activity.cancelDelayed = () => {
            original(clearTimeout)(id);
            activity.pending = false;
            resolve();
        };
    });
    asyncActivity.push(activity);
    return id;
}
function trackingSetInterval(arg, time, ...params) {
    const activity = {
        pending: true,
    };
    let id = 0;
    activity.promise = new (original((Promise)))(resolve => {
        id = original(setInterval)(arg, time, ...params);
        activity.id = 'i' + id;
        activity.cancelDelayed = () => {
            original(clearInterval)(id);
            activity.pending = false;
            resolve();
        };
    });
    asyncActivity.push(activity);
    return id;
}
function cancelTrackingActivity(id) {
    const activity = asyncActivity.find(a => a.id === id);
    if (activity?.cancelDelayed) {
        activity.cancelDelayed();
    }
}
// We can't subclass native Promise here as this will cause all derived promises
// (e.g. those returned by `then`) to also be subclass instances. This results
// in a new asyncActivity entry on each iteration of checkForPendingActivity
// which never settles.
const TrackingPromise = Object.assign(function (arg) {
    const originalPromiseType = original(Promise);
    const promise = new (originalPromiseType)(arg);
    const activity = {
        promise,
        stack: getStack(new Error()),
        pending: false,
    };
    promise.then = function (onFullfilled, onRejected) {
        activity.pending = true;
        return originalPromiseType.prototype.then.apply(this, [
            result => {
                if (!onFullfilled) {
                    return this;
                }
                activity.pending = false;
                return onFullfilled(result);
            },
            result => {
                if (!onRejected) {
                    return this;
                }
                activity.pending = false;
                return onRejected(result);
            },
        ]);
    };
    asyncActivity.push(activity);
    return promise;
}, {
    all: Promise.all,
    allSettled: Promise.allSettled,
    any: Promise.any,
    race: Promise.race,
    reject: Promise.reject,
    resolve: Promise.resolve,
});
function getStack(error) {
    return (error.stack ?? 'No stack').split('\n').slice(2).join('\n');
}
const stubs = [];
function stub(name, stubWith) {
    const original = window[name];
    window[name] = stubWith;
    stubs.push({ name, original, stubWith });
}
function original(stubWith) {
    return stubs.find(s => s.stubWith === stubWith)?.original;
}
function restoreAll() {
    for (const { name, original } of stubs) {
        window[name] = original;
    }
    stubs.length = 0;
}
//# sourceMappingURL=TrackAsyncOperations.js.map