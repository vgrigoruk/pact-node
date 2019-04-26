/// <reference types="node" />
import { ChildProcess } from "child_process";
export declare const DEFAULT_ARG = "DEFAULT";
export declare class PactUtil {
    private static createArgumentsFromObject;
    createArguments(args: SpawnArguments | SpawnArguments[], mappings: {
        [id: string]: string;
    }): string[];
    readonly cwd: string;
    spawnBinary(command: string, args?: SpawnArguments | SpawnArguments[], argMapping?: {
        [id: string]: string;
    }): ChildProcess;
    killBinary(binary: ChildProcess): boolean;
    isWindows(platform?: string): boolean;
}
export interface SpawnArguments {
    [id: string]: string | string[] | boolean | number | undefined;
}
declare const _default: PactUtil;
export default _default;
