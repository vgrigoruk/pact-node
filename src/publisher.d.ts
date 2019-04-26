import q = require("q");
import { SpawnArguments } from "./pact-util";
export declare class Publisher {
    static create: (options: PublisherOptions) => Publisher;
    readonly options: PublisherOptions;
    private readonly __argMapping;
    constructor(options: PublisherOptions);
    publish(): q.Promise<string[]>;
}
declare const _default: (options: PublisherOptions) => Publisher;
export default _default;
export interface PublisherOptions extends SpawnArguments {
    pactFilesOrDirs: string[];
    pactBroker: string;
    consumerVersion: string;
    pactBrokerUsername?: string;
    pactBrokerPassword?: string;
    pactBrokerToken?: string;
    tags?: string[];
    verbose?: boolean;
    timeout?: number;
}
