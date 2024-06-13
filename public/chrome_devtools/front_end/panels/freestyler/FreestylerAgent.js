// Copyright 2024 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../core/common/common.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as UI from '../../ui/legacy/legacy.js';
import { FreestylerEvaluateAction } from './FreestylerEvaluateAction.js';
// clang-format off
const SYSTEM_PROMPT = `Solve a question answering task about the page with interleaving Thought, Action, Observation steps.
Thought can reason about the current situation, Observation is understanding relevant information from an Action's output and Action can be of two types:
(1) <execute>entity</execute>, which executes JavaScript code on a page and returns the result of code execution. If not, it will return some similar entities to search and you can try to search the information from those topics. You have access to $0 variable to denote the currently inspected element while executing JS code.
(2) <finish>answer</finish>, which returns the answer and finishes the task.
You can only execute one action.

* PUT THE INFORMATION YOU WANT TO RETRIEVE INSIDE 'data' object.

Here is an example:

Thought
To solve the task I need to know the height of the current element.

Action
<execute>
 const data = {
  currentElementHeight: window.getComputedStyle($0).height
 }
</execute>

Observation
{
  currentElementHeight: 300
}

===`;
// clang-format on
export var Step;
(function (Step) {
    Step["THOUGHT"] = "thought";
    Step["ACTION"] = "action";
    Step["OBSERVATION"] = "observation";
    Step["ANSWER"] = "answer";
})(Step || (Step = {}));
async function executeJsCode(code) {
    const target = UI.Context.Context.instance().flavor(SDK.Target.Target);
    if (!target) {
        throw new Error('Target is not found for executing code');
    }
    const resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
    const runtimeModel = target.model(SDK.RuntimeModel.RuntimeModel);
    const pageAgent = target.pageAgent();
    if (!resourceTreeModel?.mainFrame) {
        throw new Error('Main frame is not found for executing code');
    }
    // This returns previously created world if it exists for the frame.
    const { executionContextId } = await pageAgent.invoke_createIsolatedWorld({ frameId: resourceTreeModel.mainFrame.id, worldName: 'devtools_freestyler' });
    const executionContext = runtimeModel?.executionContext(executionContextId);
    if (!executionContext) {
        throw new Error('Execution context is not found for executing code');
    }
    return FreestylerEvaluateAction.execute(code, executionContext);
}
const THOUGHT_REGEX = /^Thought\n(.*)/;
const ACTION_REGEX = /^Action\n(.*)/ms;
const EXECUTE_REGEX = /^<execute>(.*)<\/execute>$/ms;
const FINISH_REGEX = /^<finish>(.*)<\/finish>$/ms;
const MAX_STEPS = 5;
export class FreestylerAgent {
    #aidaClient;
    constructor({ aidaClient }) {
        this.#aidaClient = aidaClient;
    }
    static buildRequest(input, preamble, chatHistory) {
        const config = Common.Settings.Settings.instance().getHostConfig();
        const request = {
            input,
            preamble,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            chat_history: chatHistory,
            client: 'CHROME_DEVTOOLS',
            options: {
                // TODO: have a config for temperature
                temperature: 0,
                // TODO: have a separate config for modelId
                model_id: config?.devToolsConsoleInsightsDogfood.aidaModelId ?? config?.devToolsConsoleInsights.aidaModelId ??
                    undefined,
            },
            metadata: {
                // TODO: enable logging later.
                disable_user_content_logging: true,
            },
        };
        return request;
    }
    async #aidaAutocomplete(text) {
        let result;
        for await (const lastResult of this.#aidaClient.fetch(FreestylerAgent.buildRequest(text))) {
            result = lastResult.explanation;
        }
        return result ?? '';
    }
    async run(query, onStep) {
        const prompts = new Set([SYSTEM_PROMPT, query]);
        const structuredLog = [];
        for (let i = 0; i < MAX_STEPS; i++) {
            const combinedPrompt = [...prompts].join('\n');
            const step = await this.#aidaAutocomplete(combinedPrompt);
            debugLog(`Iteration: ${i}: ${combinedPrompt}\n${step}`);
            structuredLog.push({
                prompt: combinedPrompt,
                response: step,
            });
            const thoughtMatch = step.match(THOUGHT_REGEX);
            if (thoughtMatch) {
                const thoughtText = thoughtMatch[1];
                onStep(Step.THOUGHT, thoughtText);
                prompts.add(step);
            }
            const actionMatch = step.match(ACTION_REGEX);
            if (actionMatch) {
                prompts.add(step);
                const actionText = actionMatch[1];
                const executeMatch = actionText.match(EXECUTE_REGEX);
                if (executeMatch) {
                    const jsCode = executeMatch[1];
                    const observation = await executeJsCode(`{${jsCode};data}`);
                    debugLog(`Executed action: ${jsCode}\nResult: ${observation}`);
                    onStep(Step.ACTION, actionText);
                    prompts.add(`\nObservation\n${observation}`);
                }
                const finishMatch = actionText.match(FINISH_REGEX);
                if (finishMatch) {
                    const finishText = finishMatch[1];
                    onStep(Step.ANSWER, finishText);
                    break;
                }
            }
        }
        if (isDebugMode()) {
            localStorage.setItem('freestylerStructuredLog', JSON.stringify(structuredLog));
            window.dispatchEvent(new CustomEvent('freestylerdone'));
        }
    }
}
function isDebugMode() {
    return Boolean(localStorage.getItem('debugFreestylerEnabled'));
}
function debugLog(log) {
    if (!isDebugMode()) {
        return;
    }
    // eslint-disable-next-line no-console
    console.log(log);
}
function setDebugFreestylerEnabled(enabled) {
    if (enabled) {
        localStorage.setItem('debugFreestylerEnabled', 'true');
    }
    else {
        localStorage.removeItem('debugFreestylerEnabled');
    }
}
// @ts-ignore
globalThis.setDebugFreestylerEnabled = setDebugFreestylerEnabled;
//# sourceMappingURL=FreestylerAgent.js.map