"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var pact_util_1 = require("./pact-util");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe("Pact Util Spec", function () {
    describe("createArguments", function () {
        describe("when called with an object", function () {
            it("should return an array of all arguments", function () {
                var result = pact_util_1.default.createArguments({ providerBaseUrl: "http://localhost", }, { providerBaseUrl: "--provider-base-url", });
                expect(result).to.be.an("array").that.includes("--provider-base-url");
                expect(result.length).to.be.equal(2);
            });
            it("should wrap its argument values in quotes", function () {
                var result = pact_util_1.default.createArguments({
                    providerBaseUrl: "http://localhost",
                    pactUrls: ["http://idontexist"]
                }, {
                    providerBaseUrl: "--provider-base-url",
                    pactUrls: "--pact-urls"
                });
                expect(result).to.include("--provider-base-url");
                expect(result).to.include("'http://localhost'");
                expect(result).to.include("--pact-urls");
                expect(result).to.include("'http://idontexist'");
            });
        });
        describe("when called with an array", function () {
            describe("with one element", function () {
                it("should return an array of all arguments", function () {
                    var result = pact_util_1.default.createArguments([{ providerBaseUrl: "http://localhost", }], { providerBaseUrl: "--provider-base-url", });
                    expect(result).to.be.an("array").that.includes("--provider-base-url");
                    expect(result.length).to.be.equal(2);
                });
                it("should wrap its argument values in quotes", function () {
                    var result = pact_util_1.default.createArguments([{
                            providerBaseUrl: "http://localhost",
                            pactUrls: ["http://idontexist"]
                        }], {
                        providerBaseUrl: "--provider-base-url",
                        pactUrls: "--pact-urls"
                    });
                    expect(result).to.include("--provider-base-url");
                    expect(result).to.include("'http://localhost'");
                    expect(result).to.include("--pact-urls");
                    expect(result).to.include("'http://idontexist'");
                });
            });
            describe("with multiple elements", function () {
                it("should wrap its argument values in quotes", function () {
                    var result = pact_util_1.default.createArguments([
                        { participant: "one" },
                        { version: "v1" },
                        { participant: "two" },
                        { version: "v2" }
                    ], { version: "--version", participant: "--participant", });
                    expect(result).to.be.an("array");
                    expect(result).to.eql(["--participant",
                        "'one'",
                        "--version",
                        "'v1'",
                        "--participant",
                        "'two'",
                        "--version",
                        "'v2'"]);
                });
            });
        });
        it("should make DEFAULT values first, everything else after", function () {
            var result = pact_util_1.default.createArguments({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"]
            }, {
                providerBaseUrl: "--provider-base-url",
                pactUrls: pact_util_1.DEFAULT_ARG
            });
            expect(result.length).to.be.equal(3);
            expect(result[0]).to.be.equal("'http://idontexist'");
        });
    });
});
//# sourceMappingURL=pact-util.spec.js.map