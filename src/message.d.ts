import q = require("q");
import { SpawnArguments } from "./pact-util";
export declare class Message {
    readonly options: MessageOptions;
    private readonly __argMapping;
    constructor(options: MessageOptions);
    createMessage(): q.Promise<any>;
}
declare const _default: (options: MessageOptions) => Message;
export default _default;
export interface MessageOptions extends SpawnArguments {
    content?: string;
    dir?: string;
    consumer?: string;
    provider?: string;
    pactFileWriteMode?: "overwrite" | "update" | "merge";
    spec?: number;
}
