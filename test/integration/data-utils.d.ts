import express = require("express");
export declare function returnJsonFile(filename: string): (req: express.Request, res: express.Response) => express.Response;
export declare function returnJson(json: any): (req: express.Request, res: express.Response) => express.Response;
export declare function auth(req: express.Request, res: express.Response, next: express.NextFunction): express.Response;
