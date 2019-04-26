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
var path = require("path");
var fs = require("fs");
var events = require("events");
var http = require("request");
var q = require("q");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var mkdirp = require("mkdirp");
var checkTypes = require("check-types");
var CHECKTIME = 500;
var RETRY_AMOUNT = 60;
var PROCESS_TIMEOUT = 30000;
var AbstractService = (function (_super) {
    __extends(AbstractService, _super);
    function AbstractService(command, options, argMapping) {
        var _this = _super.call(this) || this;
        options.ssl = options.ssl || false;
        options.cors = options.cors || false;
        options.host = options.host || "localhost";
        if (options.port) {
            checkTypes.assert.number(options.port);
            checkTypes.assert.integer(options.port);
            checkTypes.assert.positive(options.port);
            checkTypes.assert.inRange(options.port, 0, 65535);
            if (checkTypes.not.inRange(options.port, 1024, 49151)) {
                logger_1.default.warn("Like a Boss, you used a port outside of the recommended range (1024 to 49151); I too like to live dangerously.");
            }
        }
        checkTypes.assert.boolean(options.ssl);
        if ((options.sslcert && !options.sslkey) || (!options.sslcert && options.sslkey)) {
            throw new Error("Custom ssl certificate and key must be specified together.");
        }
        if (options.sslcert) {
            try {
                fs.statSync(path.normalize(options.sslcert)).isFile();
            }
            catch (e) {
                throw new Error("Custom ssl certificate not found at path: " + options.sslcert);
            }
        }
        if (options.sslkey) {
            try {
                fs.statSync(path.normalize(options.sslkey)).isFile();
            }
            catch (e) {
                throw new Error("Custom ssl key not found at path: " + options.sslkey);
            }
        }
        if (options.sslcert && options.sslkey) {
            options.ssl = true;
        }
        checkTypes.assert.boolean(options.cors);
        if (options.log) {
            var fileObj = path.parse(path.normalize(options.log));
            try {
                fs.statSync(fileObj.dir).isDirectory();
            }
            catch (e) {
                mkdirp.sync(fileObj.dir);
            }
        }
        if (options.host) {
            checkTypes.assert.string(options.host);
        }
        _this.options = options;
        _this.__running = false;
        _this.__serviceCommand = command;
        _this.__argMapping = argMapping;
        return _this;
    }
    Object.defineProperty(AbstractService, "Events", {
        get: function () {
            return {
                START_EVENT: "start",
                STOP_EVENT: "stop",
                DELETE_EVENT: "delete"
            };
        },
        enumerable: true,
        configurable: true
    });
    AbstractService.prototype.start = function () {
        var _this = this;
        if (this.__instance && this.__instance.connected) {
            logger_1.default.warn("You already have a process running with PID: " + this.__instance.pid);
            return q.resolve(this);
        }
        this.__instance = this.spawnBinary();
        this.__instance.once("close", function () { return _this.stop(); });
        if (!this.options.port) {
            var catchPort_1 = function (data) {
                var match = data.match(/port=([0-9]+)/);
                if (match && match[1]) {
                    _this.options.port = parseInt(match[1], 10);
                    _this.__instance.stdout.removeListener("data", catchPort_1);
                    logger_1.default.info("Pact running on port " + _this.options.port);
                }
            };
            this.__instance.stdout.on("data", catchPort_1);
        }
        this.__instance.stderr.on("data", function (data) { return logger_1.default.error("Pact Binary Error: " + data); });
        return this.__waitForServiceUp()
            .timeout(PROCESS_TIMEOUT, "Couldn't start Pact with PID: " + this.__instance.pid)
            .then(function () {
            _this.__running = true;
            _this.emit(AbstractService.Events.START_EVENT, _this);
            return _this;
        });
    };
    AbstractService.prototype.stop = function () {
        var _this = this;
        var pid = this.__instance ? this.__instance.pid : -1;
        return q(pact_util_1.default.killBinary(this.__instance))
            .then(function () { return _this.__waitForServiceDown(); })
            .timeout(PROCESS_TIMEOUT, "Couldn't stop Pact with PID '" + pid + "'")
            .then(function () {
            _this.__running = false;
            _this.emit(AbstractService.Events.STOP_EVENT, _this);
            return _this;
        });
    };
    AbstractService.prototype.delete = function () {
        var _this = this;
        return this.stop().tap(function () { return _this.emit(AbstractService.Events.DELETE_EVENT, _this); });
    };
    AbstractService.prototype.spawnBinary = function () {
        return pact_util_1.default.spawnBinary(this.__serviceCommand, this.options, this.__argMapping);
    };
    AbstractService.prototype.__waitForServiceUp = function () {
        var _this = this;
        var amount = 0;
        var deferred = q.defer();
        var retry = function () {
            if (amount >= RETRY_AMOUNT) {
                deferred.reject(new Error("Pact startup failed; tried calling service 10 times with no result."));
            }
            setTimeout(check.bind(_this), CHECKTIME);
        };
        var check = function () {
            amount++;
            if (_this.options.port) {
                _this.__call(_this.options).then(function () { return deferred.resolve(); }, retry.bind(_this));
            }
            else {
                retry();
            }
        };
        check();
        return deferred.promise;
    };
    AbstractService.prototype.__waitForServiceDown = function () {
        var _this = this;
        var amount = 0;
        var deferred = q.defer();
        var check = function () {
            amount++;
            if (_this.options.port) {
                _this.__call(_this.options).then(function () {
                    if (amount >= RETRY_AMOUNT) {
                        deferred.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
                        return;
                    }
                    setTimeout(check, CHECKTIME);
                }, function () { return deferred.resolve(); });
            }
            else {
                deferred.resolve();
            }
        };
        check();
        return deferred.promise;
    };
    AbstractService.prototype.__call = function (options) {
        var deferred = q.defer();
        var config = {
            uri: "http" + (options.ssl ? "s" : "") + "://" + options.host + ":" + options.port,
            method: "GET",
            headers: {
                "X-Pact-Mock-Service": true,
                "Content-Type": "application/json"
            }
        };
        if (options.ssl) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            config.agentOptions = {};
            config.agentOptions.rejectUnauthorized = false;
            config.agentOptions.requestCert = false;
            config.agentOptions.agent = false;
        }
        http(config, function (err, res) {
            (!err && res.statusCode === 200) ? deferred.resolve() : deferred.reject("HTTP Error: '" + JSON.stringify(err ? err : res) + "'");
        });
        return deferred.promise;
    };
    return AbstractService;
}(events.EventEmitter));
exports.AbstractService = AbstractService;
//# sourceMappingURL=service.js.map