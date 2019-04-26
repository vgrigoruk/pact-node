"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var can_deploy_1 = require("./can-deploy");
var logger_1 = require("./logger");
var broker_mock_1 = require("../test/integration/broker-mock");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var expect = chai.expect;
chai.use(chaiAsPromised);
describe("CanDeploy Spec", function () {
    var PORT = Math.floor(Math.random() * 999) + 9000;
    var server;
    var absolutePath;
    var relativePath;
    before(function () { return broker_mock_1.default(PORT).then(function (s) {
        logger_1.default.debug("Pact Broker Mock listening on port: " + PORT);
        server = s;
    }); });
    after(function () { return server.close(); });
    beforeEach(function () {
        relativePath = ".tmp/" + Math.floor(Math.random() * 1000);
        absolutePath = path.resolve(__dirname, "..", relativePath);
        mkdirp.sync(absolutePath);
    });
    afterEach(function () {
        if (fs.existsSync(absolutePath)) {
            rimraf.sync(absolutePath);
        }
    });
    describe("convertForSpawnBinary helper function", function () {
        it("produces an array of SpawnArguments", function () {
            var value = { pactBroker: "some broker" };
            var result = can_deploy_1.CanDeploy.convertForSpawnBinary(value);
            expect(result).to.be.an("array");
            expect(result.length).to.be.equal(1);
            expect(result[0]).to.be.deep.equal(value);
        });
        it("has version and participant in the right order", function () {
            var result = can_deploy_1.CanDeploy.convertForSpawnBinary({
                participantVersion: "v1",
                participant: "one",
                pactBroker: "some broker",
                pactBrokerUsername: "username",
                pactBrokerPassword: "password",
            });
            expect(result).to.eql([
                { participant: "one" },
                { participantVersion: "v1" },
                {
                    pactBroker: "some broker",
                    pactBrokerUsername: "username",
                    pactBrokerPassword: "password"
                }
            ]);
        });
        it("has latest tag and participant in the right order", function () {
            var result = can_deploy_1.CanDeploy.convertForSpawnBinary({
                latest: "v2",
                participant: "two",
                pactBroker: "some broker",
            });
            expect(result).to.eql([
                { participant: "two" },
                { latest: "v2" },
                {
                    pactBroker: "some broker"
                }
            ]);
        });
    });
    context("when invalid options are set", function () {
        it("should fail with an Error when not given pactBroker", function () {
            expect(function () { return can_deploy_1.default({}); }).to.throw(Error);
        });
        it("should fail with an Error when not given participant", function () {
            expect(function () { return can_deploy_1.default({
                pactBroker: "http://localhost",
                participantVersion: "v1",
            }); }).to.throw(Error);
        });
        it("should fail with an Error when not given version", function () {
            expect(function () { return can_deploy_1.default({
                pactBroker: "http://localhost",
                participant: "p1"
            }); }).to.throw(Error);
        });
        it("should fail with an error when version and paticipants are empty", function () {
            expect(function () { return can_deploy_1.default({
                pactBroker: "http://localhost",
                participantVersion: undefined,
                participant: undefined
            }); }).to.throw(Error);
        });
        it("should fail with an error when 'latest' is an empty string", function () {
            expect(function () { return can_deploy_1.default({
                pactBroker: "http://localhost",
                participantVersion: "v1",
                participant: "p1",
                latest: ""
            }); }).to.throw(Error);
        });
        it("should fail with an error when 'to' is an empty string", function () {
            expect(function () { return can_deploy_1.default({
                pactBroker: "http://localhost",
                participantVersion: "v1",
                participant: "p1",
                to: ""
            }); }).to.throw(Error);
        });
    });
    context("when valid options are set", function () {
        it("should return a CanDeploy object when given the correct arguments", function () {
            var c = can_deploy_1.default({
                pactBroker: "http://localhost",
                participantVersion: "v1",
                participant: "p1"
            });
            expect(c).to.be.ok;
            expect(c.canDeploy).to.be.a("function");
        });
        it("should work when using 'latest' with either a boolean or a string", function () {
            var opts = {
                pactBroker: "http://localhost",
                participantVersion: "v1",
                participant: "p1"
            };
            opts.latest = true;
            expect(can_deploy_1.default(opts)).to.be.ok;
            opts.latest = "tag";
            expect(can_deploy_1.default(opts)).to.be.ok;
        });
    });
});
//# sourceMappingURL=can-deploy.spec.js.map