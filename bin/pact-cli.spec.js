"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var childProcess = require("child_process");
var q = require("q");
var path = require("path");
var pact_util_1 = require("../src/pact-util");
var provider_mock_1 = require("../test/integration/provider-mock");
var broker_mock_1 = require("../test/integration/broker-mock");
var stripAnsi = require("strip-ansi");
var decamelize = require("decamelize");
var _ = require("underscore");
var request = q.denodeify(require("request"));
var pkg = require("../package.json");
chai.use(chaiAsPromised);
var expect = chai.expect;
describe("Pact CLI Spec", function () {
    afterEach(function () { return CLI.stopAll(); });
    it("should show the proper version", function () {
        return expect(CLI.runSync(["--version"]).then(function (cp) { return cp.stdout; })).to.eventually.contain(pkg.version);
    });
    it("should show the help options with the commands available", function () {
        var p = CLI.runSync(["--help"]).then(function (cp) { return cp.stdout; });
        return q.all([
            expect(p).to.eventually.contain("USAGE"),
            expect(p).to.eventually.contain("pact "),
            expect(p).to.eventually.contain("mock"),
            expect(p).to.eventually.contain("verify"),
        ]);
    });
    describe("Mock Command", function () {
        it("should display help", function () {
            var p = CLI.runSync(["mock", "--help"]).then(function (cp) { return cp.stdout; });
            return q.all([
                expect(p).to.eventually.contain("USAGE"),
                expect(p).to.eventually.contain("pact mock"),
            ]);
        });
        it("should run mock service", function () {
            var p = CLI.runMock({ port: 9500 }).then(function (cp) { return cp.stdout; });
            return q.all([
                expect(p).to.eventually.be.fulfilled,
                expect(p).to.eventually.match(/Created.*process with PID/),
            ]);
        });
    });
    describe("Verify Command", function () {
        it("should display help", function () {
            var p = CLI.runSync(["verify", "--help"]).then(function (cp) { return cp.stdout; });
            return q.all([
                expect(p).to.eventually.contain("USAGE"),
                expect(p).to.eventually.contain("pact verify")
            ]);
        });
        it("should fail if missing 'provider-base-url' argument", function () {
            return expect(CLI.runSync(["verify"]).then(function (cp) { return cp.stderr; })).to.eventually.contain("Must provide the providerBaseUrl argument");
        });
        context("with provider mock", function () {
            var server;
            var PORT = 9123;
            var providerBaseUrl = "http://localhost:" + PORT;
            before(function () { return provider_mock_1.default(PORT).then(function (s) { return server = s; }); });
            after(function () { return server.close(); });
            it("should work pointing to fake broker", function () {
                return expect(CLI.runSync([
                    "verify",
                    "--provider-base-url", providerBaseUrl,
                    "--pact-urls", path.resolve(__dirname, "integration/me-they-success.json")
                ]).then(function (cp) { return cp.stdout; })).to.eventually.be.fulfilled;
            });
            it("should work with a weird path to a file", function () {
                return expect(CLI.runSync([
                    "verify",
                    "--provider-base-url", providerBaseUrl,
                    "--pact-urls", path.resolve(__dirname, "integration/me-they-weird path-success.json")
                ]).then(function (cp) { return cp.stdout; })).to.eventually.be.fulfilled;
            });
        });
    });
    describe("Publish Command", function () {
        it("should display help", function () {
            var p = CLI.runSync(["publish", "--help"]).then(function (cp) { return cp.stdout; });
            return q.all([
                expect(p).to.eventually.contain("USAGE"),
                expect(p).to.eventually.contain("pact publish")
            ]);
        });
        it("should fail if missing 'provider-base-url' argument", function () {
            return expect(CLI.runSync(["publish"]).then(function (cp) { return cp.stderr; })).to.eventually.contain("Missing option");
        });
        context("with broker mock", function () {
            var PORT = 9123;
            var brokerBaseUrl = "http://localhost:" + PORT;
            var currentDir = (process && process.mainModule) ? process.mainModule.filename : "";
            var server;
            before(function () { return broker_mock_1.default(PORT).then(function (s) { return server = s; }); });
            after(function () { return server.close(); });
            it("should work pointing to fake broker", function () {
                var p = CLI.runSync(["publish", "--pact-files-or-dirs", path.dirname(currentDir), "--consumer-version", "1.0.0", "--pact-broker", brokerBaseUrl])
                    .then(function (cp) { return cp.stdout; });
                return expect(p).to.eventually.be.fulfilled;
            });
        });
    });
    describe("can-i-deploy Command", function () {
        it("should display help", function () {
            var p = CLI.runSync(["can-i-deploy", "--help"]).then(function (cp) { return cp.stdout; });
            return q.all([
                expect(p).to.eventually.contain("USAGE"),
                expect(p).to.eventually.contain("pact can-i-deploy")
            ]);
        });
        it("should fail if missing arguments", function () {
            return expect(CLI.runSync(["can-i-deploy"]).then(function (cp) { return cp.stderr; })).to.eventually.contain("Error");
        });
        context("with broker mock", function () {
            var PORT = 9123;
            var brokerBaseUrl = "http://localhost:" + PORT;
            var server;
            before(function () { return broker_mock_1.default(PORT).then(function (s) { return server = s; }); });
            after(function () { return server.close(); });
            it("should work pointing to fake broker", function () {
                var p = CLI.runSync(["can-i-deploy", "--participant", "participant1", "--version", "1.0.0", "--pact-broker", brokerBaseUrl])
                    .then(function (cp) { return cp.stdout; });
                return expect(p).to.eventually.be.fulfilled;
            });
        });
    });
});
var CLI = (function () {
    function CLI(proc) {
        var _this = this;
        this.__stdout = "";
        this.__stderr = "";
        this.process = proc;
        this.process.stdout.setEncoding("utf8");
        this.process.stdout.on("data", function (d) {
            _this.__stdout += stripAnsi(d);
        });
        this.process.stderr.setEncoding("utf8");
        this.process.stderr.on("data", function (d) {
            _this.__stderr += stripAnsi(d);
        });
        this.process.once("exit", function (code) {
            CLI.remove(_this.process);
            _this.process.stdout.removeAllListeners();
            _this.process.stderr.removeAllListeners();
        });
    }
    CLI.runMock = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var args = _.chain(options)
            .pairs()
            .map(function (arr) { return ["--" + decamelize(arr[0], "-"), "" + arr[1]]; })
            .flatten()
            .value();
        return this.run(["mock"].concat(args))
            .tap(function () { return _this.checkMockStarted(options); });
    };
    CLI.run = function (args) {
        var _this = this;
        if (args === void 0) { args = []; }
        var opts = {
            cwd: __dirname,
            detached: !pact_util_1.default.isWindows(),
            windowsVerbatimArguments: pact_util_1.default.isWindows()
        };
        args = [this.__cliPath].concat(args);
        if (pact_util_1.default.isWindows()) {
            args = args.map(function (v) { return "\"" + v + "\""; });
        }
        var proc = childProcess.spawn("node", args, opts);
        this.__children.push(proc);
        return q(new CLI(proc))
            .tap(function (cli) { return _this.commandRunning(cli); });
    };
    CLI.runSync = function (args) {
        if (args === void 0) { args = []; }
        return this.run(args)
            .tap(function (cp) {
            if (cp.process.exitCode === null) {
                var deferred_1 = q.defer();
                cp.process.once("exit", function () { return deferred_1.resolve(); });
                return deferred_1.promise;
            }
            return null;
        });
    };
    CLI.remove = function (proc) {
        for (var i = 0; i < this.__children.length; i++) {
            if (this.__children[i] === proc) {
                this.__children.splice(i, 1);
                break;
            }
        }
    };
    CLI.stopAll = function () {
        for (var _i = 0, _a = this.__children; _i < _a.length; _i++) {
            var child = _a[_i];
            pact_util_1.default.isWindows() ? childProcess.execSync("taskkill /f /t /pid " + child.pid) : process.kill(-child.pid, "SIGINT");
        }
    };
    CLI.commandRunning = function (c, amount) {
        var _this = this;
        if (amount === void 0) { amount = 0; }
        amount++;
        var isSet = function () { return c.stdout.length !== 0 || c.stderr.length !== 0 ? q.resolve() : q.reject(); };
        return isSet()
            .catch(function () {
            if (amount >= 10) {
                return q.reject(new Error("stdout and stderr never set, command probably didn't run"));
            }
            return q.delay(1000).then(function () { return _this.commandRunning(c, amount); });
        });
    };
    CLI.checkMockStarted = function (options, amount) {
        var _this = this;
        if (amount === void 0) { amount = 0; }
        amount++;
        return this.call(options)
            .catch(function () {
            if (amount >= 10) {
                return q.reject(new Error("Pact stop failed; tried calling service 10 times with no result."));
            }
            return q.delay(1000).then(function () { return _this.checkMockStarted(options, amount); });
        });
    };
    CLI.call = function (options) {
        options.ssl = options.ssl || false;
        options.cors = options.cors || false;
        options.host = options.host || "localhost";
        options.port = options.port || 1234;
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
        return request(config)
            .then(function (data) { return data[0]; })
            .then(function (response) {
            if (response.statusCode !== 200) {
                return q.reject();
            }
            return response;
        });
    };
    Object.defineProperty(CLI.prototype, "stdout", {
        get: function () {
            return this.__stdout;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CLI.prototype, "stderr", {
        get: function () {
            return this.__stderr;
        },
        enumerable: true,
        configurable: true
    });
    CLI.__children = [];
    CLI.__cliPath = require.resolve("./pact-cli.js");
    return CLI;
}());
//# sourceMappingURL=pact-cli.spec.js.map