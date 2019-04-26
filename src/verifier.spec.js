"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var verifier_1 = require("./verifier");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe("Verifier Spec", function () {
    var currentDir = (process && process.mainModule) ? process.mainModule.filename : "";
    context("when automatically finding pacts from a broker", function () {
        context("when not given --pact-urls and only --provider", function () {
            it("should fail with an error", function () {
                expect(function () { return verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    provider: "someprovider"
                }); }).to.throw(Error);
            });
        });
        context("when not given --pact-urls and only --pact-broker-url", function () {
            it("should fail with an error", function () {
                expect(function () { return verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactBrokerUrl: "http://foo.com"
                }); }).to.throw(Error);
            });
        });
        context("when given valid arguments", function () {
            it("should return a Verifier object", function () {
                var verifier = verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactBrokerUrl: "http://foo.com",
                    provider: "someprovider"
                });
                expect(verifier).to.be.a("object");
                expect(verifier).to.respondTo("verify");
            });
        });
    });
    context("when not given --pact-urls or --provider-base-url", function () {
        it("should fail with an error", function () {
            expect(function () { return verifier_1.default({}); }).to.throw(Error);
        });
    });
    context("when given --provider-states-setup-url", function () {
        it("should fail with an error", function () {
            expect(function () { return verifier_1.default({
                "providerStatesSetupUrl": "http://foo/provider-states/setup"
            }); }).to.throw(Error);
        });
    });
    context("when given local Pact URLs that don't exist", function () {
        it("should fail with an error", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["test.json"]
            }); }).to.throw(Error);
        });
    });
    context("when given an invalid timeout", function () {
        it("should fail with an error", function () {
            expect(function () {
                verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactUrls: ["http://idontexist"],
                    timeout: -10
                });
            }).to.throw(Error);
        });
    });
    context("when user specifies monkeypatch", function () {
        it("should return an error on invalid path", function () {
            expect(function () {
                verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactUrls: ["http://idontexist"],
                    monkeypatch: "some-ruby-file.rb"
                });
            }).to.throw(Error);
        });
    });
    context("when given remote Pact URLs that don't exist", function () {
        it("should pass through to the Pact Verifier regardless", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"]
            }); }).to.not.throw(Error);
        });
    });
    context("when given local Pact URLs that do exist", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)]
            }); }).to.not.throw(Error);
        });
    });
    context("when requested to publish verification results to a Pact Broker", function () {
        context("and specifies a provider version", function () {
            it("should pass through to the Pact Verifier", function () {
                expect(function () { return verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactUrls: ["http://idontexist"],
                    publishVerificationResult: true,
                    providerVersion: "1.0.0"
                }); }).to.not.throw(Error);
            });
        });
    });
    context("when requested to publish verification results to a Pact Broker", function () {
        context("and does not specify provider version", function () {
            it("should fail with an error", function () {
                expect(function () { return verifier_1.default({
                    providerBaseUrl: "http://localhost",
                    pactUrls: ["http://idontexist"],
                    publishVerificationResult: true
                }); }).to.throw(Error);
            });
        });
    });
    context("when given the correct arguments", function () {
        it("should return a Verifier object", function () {
            var verifier = verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"]
            });
            expect(verifier).to.be.a("object");
            expect(verifier).to.respondTo("verify");
        });
    });
    context("when an using format option", function () {
        it("should work with either 'json' or 'xml'", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"],
                format: "xml"
            }); }).to.not.throw(Error);
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"],
                format: "json"
            }); }).to.not.throw(Error);
        });
        it("should throw an error with anything but a string", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"],
                format: 10
            }); }).to.throw(Error);
        });
        it("should throw an error with the wrong string", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"],
                format: "jsonformat"
            }); }).to.throw(Error);
        });
        it("should work with a case insensitive string", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: ["http://idontexist"],
                format: "XML"
            }); }).to.not.throw(Error);
        });
    });
    context("when pactBrokerBaseUrl is not provided", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)]
            }); }).to.not.throw(Error);
        });
    });
    context("when pactBrokerBaseUrl is provided", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)],
                pactBrokerBaseUrl: "http://localhost"
            }); }).to.not.throw(Error);
        });
    });
    context("when consumerVersionTag is not provided", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)]
            }); }).to.not.throw(Error);
        });
    });
    context("when consumerVersionTag is provided as a string", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)],
                consumerVersionTag: "tag-1"
            }); }).to.not.throw(Error);
        });
    });
    context("when consumerVersionTag is provided as an array", function () {
        it("should not fail", function () {
            expect(function () { return verifier_1.default({
                providerBaseUrl: "http://localhost",
                pactUrls: [path.dirname(currentDir)],
                consumerVersionTag: ["tag-1"]
            }); }).to.not.throw(Error);
        });
    });
});
//# sourceMappingURL=verifier.spec.js.map