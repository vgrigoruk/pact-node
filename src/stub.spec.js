"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var stub_1 = require("./stub");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var fs = require("fs");
var path = require("path");
var q = require("q");
var _ = require("underscore");
chai.use(chaiAsPromised);
var expect = chai.expect;
describe("Stub Spec", function () {
    var stub;
    var validDefaults = {
        pactUrls: [path.resolve(__dirname, "../test/integration/me-they-success.json")]
    };
    afterEach(function () { return stub ? stub.delete().then(function () { return stub = null; }) : null; });
    describe("Start stub", function () {
        context("when invalid options are set", function () {
            it("should fail if custom ssl certs do not exist", function () {
                expect(function () { return stub_1.default({
                    ssl: true,
                    sslcert: "does/not/exist",
                    sslkey: path.resolve(__dirname, "../test/ssl/server.key")
                }); }).to.throw(Error);
            });
            it("should fail if custom ssl keys do not exist", function () {
                expect(function () { return stub_1.default({
                    ssl: true,
                    sslcert: path.resolve(__dirname, "../test/ssl/server.crt"),
                    sslkey: "does/not/exist"
                }); }).to.throw(Error);
            });
            it("should fail if custom ssl cert is set, but ssl key isn't", function () {
                expect(function () { return stub_1.default({
                    ssl: true,
                    sslcert: path.resolve(__dirname, "../test/ssl/server.crt")
                }); }).to.throw(Error);
            });
            it("should fail if custom ssl key is set, but ssl cert isn't", function () {
                expect(function () { return stub_1.default({
                    ssl: true,
                    sslkey: path.resolve(__dirname, "../test/ssl/server.key")
                }); }).to.throw(Error);
            });
        });
        context("when valid options are set", function () {
            var dirPath;
            beforeEach(function () { return dirPath = path.resolve(__dirname, "../.tmp/" + Math.floor(Math.random() * 1000)); });
            afterEach(function () {
                try {
                    if (fs.statSync(dirPath).isDirectory()) {
                        fs.rmdirSync(dirPath);
                    }
                }
                catch (e) {
                }
            });
            it("should start correctly when instance is delayed", function () {
                stub = stub_1.default(validDefaults);
                var waitForStubUp = stub["__waitForServiceUp"].bind(stub);
                return q.allSettled([
                    waitForStubUp(stub.options),
                    q.delay(5000).then(function () { return stub.start(); })
                ]).then(function (results) { return expect(_.reduce(results, function (m, r) { return m && r.state === "fulfilled"; })).to.be.true; });
            });
            it("should start correctly with valid pact URLs", function () {
                stub = stub_1.default(validDefaults);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with valid pact URLs with spaces in it", function () {
                stub = stub_1.default({
                    pactUrls: [path.resolve(__dirname, "../test/integration/me-they-weird path-success.json")]
                });
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with ssl", function () {
                stub = stub_1.default(__assign({}, validDefaults, { ssl: true }));
                expect(stub.options.ssl).to.equal(true);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with custom ssl cert/key", function () {
                stub = stub_1.default(__assign({}, validDefaults, { ssl: true, sslcert: path.resolve(__dirname, "../test/ssl/server.crt"), sslkey: path.resolve(__dirname, "../test/ssl/server.key") }));
                expect(stub.options.ssl).to.equal(true);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with custom ssl cert/key but without specifying ssl flag", function () {
                stub = stub_1.default(__assign({}, validDefaults, { sslcert: path.resolve(__dirname, "../test/ssl/server.crt"), sslkey: path.resolve(__dirname, "../test/ssl/server.key") }));
                expect(stub.options.ssl).to.equal(true);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with cors", function () {
                stub = stub_1.default(__assign({}, validDefaults, { cors: true }));
                expect(stub.options.cors).to.equal(true);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with port", function () {
                var port = Math.floor(Math.random() * 999) + 9000;
                stub = stub_1.default(__assign({}, validDefaults, { port: port }));
                expect(stub.options.port).to.equal(port);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with host", function () {
                var host = "localhost";
                stub = stub_1.default(__assign({}, validDefaults, { host: host }));
                expect(stub.options.host).to.equal(host);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
            it("should start correctly with log", function () {
                var logPath = path.resolve(dirPath, "log.txt");
                stub = stub_1.default(__assign({}, validDefaults, { log: logPath }));
                expect(stub.options.log).to.equal(logPath);
                return expect(stub.start()).to.eventually.be.fulfilled;
            });
        });
        it("should dispatch event when starting", function (done) {
            stub = stub_1.default(validDefaults);
            stub.once("start", function () { return done(); });
            stub.start();
        });
        it("should change running state to true", function () {
            stub = stub_1.default(validDefaults);
            return stub.start()
                .then(function () { return expect(stub["__running"]).to.be.true; });
        });
    });
    describe("Stop stub", function () {
        context("when already started", function () {
            it("should stop running", function () {
                stub = stub_1.default(validDefaults);
                return stub.start().then(function () { return stub.stop(); });
            });
            it("should dispatch event when stopping", function (done) {
                stub = stub_1.default(validDefaults);
                stub.once("stop", function () { return done(); });
                stub.start().then(function () { return stub.stop(); });
            });
            it("should change running state to false", function () {
                stub = stub_1.default(validDefaults);
                return stub.start()
                    .then(function () { return stub.stop(); })
                    .then(function () { return expect(stub["__running"]).to.be.false; });
            });
        });
    });
    describe("Delete stub", function () {
        context("when already running", function () {
            it("should stop & delete stub", function () {
                stub = stub_1.default(validDefaults);
                return stub.start()
                    .then(function () { return stub.delete(); });
            });
            it("should dispatch event when deleting", function (done) {
                stub = stub_1.default(validDefaults);
                stub.once("delete", function () { return done(); });
                stub.start().then(function () { return stub.delete(); });
            });
            it("should change running state to false", function () {
                stub = stub_1.default(validDefaults);
                return stub.start()
                    .then(function () { return stub.delete(); })
                    .then(function () { return expect(stub["__running"]).to.be.false; });
            });
        });
    });
});
//# sourceMappingURL=stub.spec.js.map