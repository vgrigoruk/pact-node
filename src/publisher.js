"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var q = require("q");
var path = require("path");
var fs = require("fs");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var util_1 = require("util");
var pact_standalone_1 = require("./pact-standalone");
var checkTypes = require("check-types");
var Publisher = (function () {
    function Publisher(options) {
        this.__argMapping = {
            "pactFilesOrDirs": pact_util_1.DEFAULT_ARG,
            "pactBroker": "--broker-base-url",
            "pactBrokerUsername": "--broker-username",
            "pactBrokerPassword": "--broker-password",
            "pactBrokerToken": "--broker-token",
            "tags": "--tag",
            "consumerVersion": "--consumer-app-version",
            "verbose": "--verbose"
        };
        options = options || {};
        options.tags = options.tags || [];
        options.timeout = options.timeout || 60000;
        checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
        checkTypes.assert.nonEmptyString(options.consumerVersion, "Must provide the consumerVersion argument");
        checkTypes.assert.arrayLike(options.pactFilesOrDirs, "Must provide the pactFilesOrDirs argument");
        checkTypes.assert.nonEmptyArray(options.pactFilesOrDirs, "Must provide the pactFilesOrDirs argument with an array");
        if (options.pactFilesOrDirs) {
            checkTypes.assert.array.of.string(options.pactFilesOrDirs);
            options.pactFilesOrDirs = options.pactFilesOrDirs.map(function (v) {
                var newPath = path.resolve(v);
                if (!fs.existsSync(newPath)) {
                    throw new Error("Path '" + v + "' given in pactFilesOrDirs does not exists.");
                }
                return newPath;
            });
        }
        if (options.pactBroker) {
            checkTypes.assert.string(options.pactBroker);
        }
        if (options.pactBrokerUsername) {
            checkTypes.assert.string(options.pactBrokerUsername);
        }
        if (options.pactBrokerPassword) {
            checkTypes.assert.string(options.pactBrokerPassword);
        }
        if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
            throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
        }
        this.options = options;
    }
    Publisher.prototype.publish = function () {
        logger_1.default.info("Publishing pacts to broker at: " + this.options.pactBroker);
        var deferred = q.defer();
        var instance = pact_util_1.default.spawnBinary(pact_standalone_1.default.brokerPath + " publish", this.options, this.__argMapping);
        var output = [];
        instance.stdout.on("data", function (l) { return output.push(l); });
        instance.stderr.on("data", function (l) { return output.push(l); });
        instance.once("close", function (code) {
            var o = output.join("\n");
            var pactUrls = /^https?:\/\/.*\/pacts\/.*$/igm.exec(o);
            if (code !== 0 || !pactUrls) {
                logger_1.default.error("Could not publish pact:\n" + o);
                return deferred.reject(new Error(o));
            }
            logger_1.default.info(o);
            return deferred.resolve(pactUrls);
        });
        return deferred.promise
            .timeout(this.options.timeout, "Timeout waiting for verification process to complete (PID: " + instance.pid + ")");
    };
    Publisher.create = util_1.deprecate(function (options) { return new Publisher(options); }, "Create function will be removed in future release, please use the default export function or use `new Publisher()`");
    return Publisher;
}());
exports.Publisher = Publisher;
exports.default = (function (options) { return new Publisher(options); });
//# sourceMappingURL=publisher.js.map