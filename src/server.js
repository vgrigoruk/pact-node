"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var service_1 = require("./service");
var util_1 = require("util");
var pact_standalone_1 = require("./pact-standalone");
var path = require("path");
var fs = require("fs");
var mkdirp = require("mkdirp");
var checkTypes = require("check-types");
var Server = (function (_super) {
    __extends(Server, _super);
    function Server(options) {
        var _this = this;
        options = options || {};
        options.dir = options.dir ? path.resolve(options.dir) : process.cwd();
        options.pactFileWriteMode = options.pactFileWriteMode || "overwrite";
        if (options.spec) {
            checkTypes.assert.number(options.spec);
            checkTypes.assert.integer(options.spec);
            checkTypes.assert.positive(options.spec);
        }
        if (options.dir) {
            var dir = path.resolve(options.dir);
            try {
                fs.statSync(dir).isDirectory();
            }
            catch (e) {
                mkdirp.sync(dir);
            }
        }
        if (options.log) {
            options.log = path.resolve(options.log);
        }
        if (options.sslcert) {
            options.sslcert = path.resolve(options.sslcert);
        }
        if (options.sslkey) {
            options.sslkey = path.resolve(options.sslkey);
        }
        if (options.consumer) {
            checkTypes.assert.string(options.consumer);
        }
        if (options.provider) {
            checkTypes.assert.string(options.provider);
        }
        checkTypes.assert.includes(["overwrite", "update", "merge"], options.pactFileWriteMode);
        if (options.logLevel) {
            options.logLevel = options.logLevel.toLowerCase();
            checkTypes.assert.includes(["debug", "info", "warn", "error"], options.logLevel);
        }
        if (options.monkeypatch) {
            checkTypes.assert.string(options.monkeypatch);
            try {
                fs.statSync(path.normalize(options.monkeypatch)).isFile();
            }
            catch (e) {
                throw new Error("Monkeypatch ruby file not found at path: " + options.monkeypatch);
            }
        }
        var opts = options;
        if (options.logLevel) {
            opts = JSON.parse(JSON.stringify(options));
            opts.logLevel = options.logLevel.toUpperCase();
        }
        _this = _super.call(this, pact_standalone_1.default.mockServicePath + " service", opts, {
            "port": "--port",
            "host": "--host",
            "log": "--log",
            "ssl": "--ssl",
            "sslcert": "--sslcert",
            "sslkey": "--sslkey",
            "cors": "--cors",
            "dir": "--pact_dir",
            "spec": "--pact_specification_version",
            "pactFileWriteMode": "--pact-file-write-mode",
            "consumer": "--consumer",
            "provider": "--provider",
            "monkeypatch": "--monkeypatch",
            "logLevel": "--log-level"
        }) || this;
        return _this;
    }
    Server.create = util_1.deprecate(function (options) { return new Server(options); }, "Create function will be removed in future release, please use the default export function or use `new Server()`");
    return Server;
}(service_1.AbstractService));
exports.Server = Server;
exports.default = (function (options) { return new Server(options); });
//# sourceMappingURL=server.js.map