/// <reference types="node" />
import q = require("q");
import * as http from "http";
declare const _default: (port: number) => q.Promise<http.Server>;
export default _default;
