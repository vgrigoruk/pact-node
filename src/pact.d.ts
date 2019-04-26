import * as q from "q";
import { Server, ServerOptions } from "./server";
import { Stub, StubOptions } from "./stub";
import { VerifierOptions } from "./verifier";
import { MessageOptions } from "./message";
import { PublisherOptions } from "./publisher";
import { CanDeployOptions } from "./can-deploy";
import { LogLevels } from "./logger";
import { AbstractService } from "./service";
export declare class Pact {
    private __servers;
    private __stubs;
    constructor();
    logLevel(level?: LogLevels): number | void;
    createServer(options?: ServerOptions): Server;
    listServers(): Server[];
    removeAllServers(): q.Promise<Server[]>;
    createStub(options?: StubOptions): Stub;
    listStubs(): Stub[];
    removeAllStubs(): q.Promise<Stub[]>;
    removeAll(): q.Promise<AbstractService[]>;
    verifyPacts(options: VerifierOptions): q.Promise<string>;
    createMessage(options: MessageOptions): q.Promise<string>;
    publishPacts(options: PublisherOptions): q.Promise<any[]>;
    canDeploy(options: CanDeployOptions): q.Promise<any[]>;
    private __stringifyOptions;
}
declare const _default: Pact;
export default _default;
