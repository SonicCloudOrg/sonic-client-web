import type * as Host from '../../core/host/host.js';
export declare enum Step {
    THOUGHT = "thought",
    ACTION = "action",
    OBSERVATION = "observation",
    ANSWER = "answer"
}
export declare class FreestylerAgent {
    #private;
    constructor({ aidaClient }: {
        aidaClient: Host.AidaClient.AidaClient;
    });
    static buildRequest(input: string, preamble?: string, chatHistory?: Host.AidaClient.Chunk[]): Host.AidaClient.AidaRequest;
    run(query: string, onStep: (step: Step, stepOutput: string) => void): Promise<void>;
}
