export declare enum Entity {
    UNKNOWN = 0,
    USER = 1,
    SYSTEM = 2
}
export interface Chunk {
    text: string;
    entity: Entity;
}
export interface AidaRequest {
    input: string;
    preamble?: string;
    chat_history?: Chunk[];
    client: string;
    options?: {
        temperature?: Number;
        model_id?: string;
    };
    metadata?: {
        disable_user_content_logging: boolean;
    };
}
export interface AidaResponse {
    explanation: string;
    metadata: {
        rpcGlobalId?: number;
    };
}
export declare class AidaClient {
    static buildConsoleInsightsRequest(input: string): AidaRequest;
    fetch(request: AidaRequest): AsyncGenerator<AidaResponse, void, void>;
}
