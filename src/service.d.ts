/// <reference types="node" />
import events = require("events");
import q = require("q");
import { SpawnArguments } from "./pact-util";
import { ChildProcess } from "child_process";
export declare abstract class AbstractService extends events.EventEmitter {
    static readonly Events: {
        START_EVENT: string;
        STOP_EVENT: string;
        DELETE_EVENT: string;
    };
    readonly options: ServiceOptions;
    protected __argMapping: any;
    protected __running: boolean;
    protected __instance: ChildProcess;
    protected __serviceCommand: string;
    constructor(command: string, options: ServiceOptions, argMapping: any);
    start(): q.Promise<AbstractService>;
    stop(): q.Promise<AbstractService>;
    delete(): q.Promise<AbstractService>;
    protected spawnBinary(): ChildProcess;
    protected __waitForServiceUp(): q.Promise<any>;
    protected __waitForServiceDown(): q.Promise<any>;
    private __call;
}
export interface ServiceOptions extends SpawnArguments {
    port?: number;
    ssl?: boolean;
    cors?: boolean;
    host?: string;
    sslcert?: string;
    sslkey?: string;
    log?: string;
}
