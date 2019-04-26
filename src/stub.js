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
var pact_util_1 = require("./pact-util");
var service_1 = require("./service");
var util_1 = require("util");
var pact_standalone_1 = require("./pact-standalone");
var checkTypes = require("check-types");
var Stub = (function (_super) {
    __extends(Stub, _super);
    function Stub(options) {
        var _this = this;
        options = options || {};
        options.pactUrls = options.pactUrls || [];
        if (options.pactUrls) {
            checkTypes.assert.array.of.string(options.pactUrls);
        }
        checkTypes.assert.not.emptyArray(options.pactUrls, "Must provide the pactUrls argument");
        _this = _super.call(this, "" + pact_standalone_1.default.stubPath, options, {
            "pactUrls": pact_util_1.DEFAULT_ARG,
            "port": "--port",
            "host": "--host",
            "log": "--log",
            "ssl": "--ssl",
            "sslcert": "--sslcert",
            "sslkey": "--sslkey",
            "cors": "--cors",
        }) || this;
        return _this;
    }
    Stub.create = util_1.deprecate(function (options) { return new Stub(options); }, "Create function will be removed in future release, please use the default export function or use `new Stub()`");
    return Stub;
}(service_1.AbstractService));
exports.Stub = Stub;
exports.default = (function (options) { return new Stub(options); });
//# sourceMappingURL=stub.js.map