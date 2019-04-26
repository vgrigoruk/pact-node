"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var q = require("q");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var pact_standalone_1 = require("./pact-standalone");
var _ = require("underscore");
var checkTypes = require("check-types");
var CanDeploy = (function () {
    function CanDeploy(options) {
        this.__argMapping = {
            "participant": "--pacticipant",
            "participantVersion": "--version",
            "latest": "--latest",
            "to": "--to",
            "pactBroker": "--broker-base-url",
            "pactBrokerUsername": "--broker-username",
            "pactBrokerPassword": "--broker-password",
            "output": "--output",
            "verbose": "--verbose",
            "retryWhileUnknown": "--retry-while-unknown",
            "retryInterval": "--retry-interval",
        };
        options = options || {};
        options.timeout = options.timeout || 60000;
        checkTypes.assert.nonEmptyString(options.participant, "Must provide the participant argument");
        checkTypes.assert.nonEmptyString(options.participantVersion, "Must provide the participant version argument");
        checkTypes.assert.nonEmptyString(options.pactBroker, "Must provide the pactBroker argument");
        options.latest !== undefined && checkTypes.assert.nonEmptyString(options.latest.toString());
        options.to !== undefined && checkTypes.assert.nonEmptyString(options.to);
        options.pactBrokerUsername !== undefined && checkTypes.assert.string(options.pactBrokerUsername);
        options.pactBrokerPassword !== undefined && checkTypes.assert.string(options.pactBrokerPassword);
        if ((options.pactBrokerUsername && !options.pactBrokerPassword) || (options.pactBrokerPassword && !options.pactBrokerUsername)) {
            throw new Error("Must provide both Pact Broker username and password. None needed if authentication on Broker is disabled.");
        }
        this.options = options;
    }
    CanDeploy.convertForSpawnBinary = function (options) {
        var keys = ["participant", "participantVersion", "latest", "to"];
        var args = [_.omit(options, keys)];
        keys.reverse().forEach(function (key) {
            var val = options[key];
            if (options[key] !== undefined) {
                var obj = {};
                obj[key] = val;
                args.unshift(obj);
            }
        });
        return args;
    };
    CanDeploy.prototype.canDeploy = function () {
        logger_1.default.info("Asking broker at " + this.options.pactBroker + " if it is possible to deploy");
        var deferred = q.defer();
        var instance = pact_util_1.default.spawnBinary(pact_standalone_1.default.brokerPath + " can-i-deploy", CanDeploy.convertForSpawnBinary(this.options), this.__argMapping);
        var output = [];
        instance.stdout.on("data", function (l) { return output.push(l); });
        instance.stderr.on("data", function (l) { return output.push(l); });
        instance.once("close", function (code) {
            var o = output.join("\n");
            var success = /All verification results are published and successful/igm.exec(o);
            if (code !== 0 || !success) {
                logger_1.default.error("can-i-deploy did not return success message:\n" + o);
                return deferred.reject(new Error(o));
            }
            logger_1.default.info(o);
            return deferred.resolve();
        });
        return deferred.promise
            .timeout(this.options.timeout, "Timeout waiting for verification process to complete (PID: " + instance.pid + ")");
    };
    return CanDeploy;
}());
exports.CanDeploy = CanDeploy;
exports.default = (function (options) { return new CanDeploy(options); });
//# sourceMappingURL=can-deploy.js.map