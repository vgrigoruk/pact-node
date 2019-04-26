import q = require("q");
import { SpawnArguments } from "./pact-util";
export declare class CanDeploy {
    static convertForSpawnBinary(options: CanDeployOptions): SpawnArguments[];
    readonly options: CanDeployOptions;
    private readonly __argMapping;
    constructor(options: CanDeployOptions);
    canDeploy(): q.Promise<any>;
}
declare const _default: (options: CanDeployOptions) => CanDeploy;
export default _default;
export interface CanDeployOptions extends SpawnArguments {
    participant?: string;
    participantVersion?: string;
    to?: string;
    latest?: boolean | string;
    pactBroker: string;
    pactBrokerUsername?: string;
    pactBrokerPassword?: string;
    output?: "json" | "table";
    verbose?: boolean;
    retryWhileUnknown?: number;
    retryInterval?: number;
}
