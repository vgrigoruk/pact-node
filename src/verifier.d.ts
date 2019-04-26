import { SpawnArguments } from "./pact-util";
import q = require("q");
export declare class Verifier {
    static create: (options: VerifierOptions) => Verifier;
    readonly options: VerifierOptions;
    private readonly __argMapping;
    constructor(options: VerifierOptions);
    verify(): q.Promise<string>;
}
declare const _default: (options: VerifierOptions) => Verifier;
export default _default;
export interface VerifierOptions extends SpawnArguments {
    providerBaseUrl: string;
    provider?: string;
    pactUrls?: string[];
    pactBrokerUrl?: string;
    providerStatesSetupUrl?: string;
    pactBrokerUsername?: string;
    pactBrokerPassword?: string;
    pactBrokerToken?: string;
    consumerVersionTag?: string | string[];
    customProviderHeaders?: string[];
    publishVerificationResult?: boolean;
    providerVersion?: string;
    timeout?: number;
    monkeypatch?: string;
    format?: "json" | "RspecJunitFormatter";
    out?: string;
}
