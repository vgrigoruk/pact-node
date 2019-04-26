"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var url = require("url");
var logger_1 = require("./logger");
var pact_util_1 = require("./pact-util");
var q = require("q");
var pact_standalone_1 = require("./pact-standalone");
var _ = require("underscore");
var checkTypes = require("check-types");
var unixify = require("unixify");
var fs = require("fs");
var util_1 = require("util");
var Verifier = (function () {
    function Verifier(options) {
        this.__argMapping = {
            "pactUrls": pact_util_1.DEFAULT_ARG,
            "providerBaseUrl": "--provider-base-url",
            "pactBrokerUrl": "--pact-broker-base-url",
            "providerStatesSetupUrl": "--provider-states-setup-url",
            "pactBrokerUsername": "--broker-username",
            "pactBrokerPassword": "--broker-password",
            "pactBrokerToken": "--broker-token",
            "consumerVersionTag": "--consumer-version-tag",
            "publishVerificationResult": "--publish-verification-results",
            "providerVersion": "--provider-app-version",
            "provider": "--provider",
            "customProviderHeaders": "--custom-provider-header",
            "format": "--format",
            "out": "--out",
        };
        options = options || {};
        options.pactBrokerUrl = options.pactBrokerUrl || "";
        options.consumerVersionTag = _.toArray(options.consumerVersionTag);
        options.pactUrls = options.pactUrls || [];
        options.provider = options.provider || "";
        options.providerStatesSetupUrl = options.providerStatesSetupUrl || "";
        options.timeout = options.timeout || 30000;
        options.pactUrls = _.chain(options.pactUrls)
            .map(function (uri) {
            if (!/https?:/.test(url.parse(uri).protocol || "")) {
                try {
                    fs.statSync(path.normalize(uri)).isFile();
                    return unixify(uri);
                }
                catch (e) {
                    throw new Error("Pact file: " + uri + " doesn\"t exist");
                }
            }
            return uri;
        })
            .compact()
            .value();
        checkTypes.assert.nonEmptyString(options.providerBaseUrl, "Must provide the providerBaseUrl argument");
        if (checkTypes.emptyArray(options.pactUrls) && !options.pactBrokerUrl) {
            throw new Error("Must provide the pactUrls argument if no pactBrokerUrl provided");
        }
        if ((!options.pactBrokerUrl || _.isEmpty(options.provider)) && checkTypes.emptyArray(options.pactUrls)) {
            throw new Error("Must provide both provider and pactBrokerUrl if pactUrls not provided.");
        }
        if (options.providerStatesSetupUrl) {
            checkTypes.assert.string(options.providerStatesSetupUrl);
        }
        if (options.pactBrokerUsername) {
            checkTypes.assert.string(options.pactBrokerUsername);
        }
        if (options.pactBrokerPassword) {
            checkTypes.assert.string(options.pactBrokerPassword);
        }
        if (options.pactBrokerUrl) {
            checkTypes.assert.string(options.pactBrokerUrl);
        }
        if (options.consumerVersionTag) {
            checkTypes.assert.array.of.string(options.consumerVersionTag);
        }
        if (options.pactUrls) {
            checkTypes.assert.array.of.string(options.pactUrls);
        }
        if (options.providerBaseUrl) {
            checkTypes.assert.string(options.providerBaseUrl);
        }
        if (options.publishVerificationResult) {
            checkTypes.assert.boolean(options.publishVerificationResult);
        }
        if (options.publishVerificationResult && !options.providerVersion) {
            throw new Error("Must provide both or none of publishVerificationResults and providerVersion.");
        }
        if (options.providerVersion) {
            checkTypes.assert.string(options.providerVersion);
        }
        if (options.format) {
            checkTypes.assert.string(options.format);
            checkTypes.assert.match(options.format, /^(xml|json)$/i);
            options.format = options.format.toLowerCase() === "xml" ? "RspecJunitFormatter" : "json";
        }
        if (options.out) {
            checkTypes.assert.string(options.out);
        }
        checkTypes.assert.positive(options.timeout);
        if (options.monkeypatch) {
            checkTypes.assert.string(options.monkeypatch);
            try {
                fs.statSync(path.normalize(options.monkeypatch)).isFile();
            }
            catch (e) {
                throw new Error("Monkeypatch ruby file not found at path: " + options.monkeypatch);
            }
        }
        this.options = options;
    }
    Verifier.prototype.verify = function () {
        logger_1.default.info("Verifying Pact Files");
        var deferred = q.defer();
        var instance = pact_util_1.default.spawnBinary(pact_standalone_1.default.verifierPath, this.options, this.__argMapping);
        var output = [];
        instance.stdout.on("data", function (l) { return output.push(l); });
        instance.stderr.on("data", function (l) { return output.push(l); });
        instance.once("close", function (code) {
            var o = output.join("\n");
            code === 0 ? deferred.resolve(o) : deferred.reject(new Error(o));
        });
        return deferred.promise
            .timeout(this.options.timeout, "Timeout waiting for verification process to complete (PID: " + instance.pid + ")")
            .tap(function () { return logger_1.default.info("Pact Verification succeeded."); });
    };
    Verifier.create = util_1.deprecate(function (options) { return new Verifier(options); }, "Create function will be removed in future release, please use the default export function or use `new Verifier()`");
    return Verifier;
}());
exports.Verifier = Verifier;
exports.default = (function (options) { return new Verifier(options); });
//# sourceMappingURL=verifier.js.map