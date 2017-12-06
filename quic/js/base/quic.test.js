"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var $$TestFailException = /** @class */ (function (_super) {
    __extends($$TestFailException, _super);
    function $$TestFailException(message, value1, value2) {
        return _super.call(this, message ? message.replace(/\{0\}/g, value1).replace(/\{1\}/g, value2) : "Test failed.") || this;
    }
    return $$TestFailException;
}(Error));
exports.$$TestFailException = $$TestFailException;
var $$TEST = /** @class */ (function () {
    function $$TEST(value) {
        this.value = value;
    }
    $$TEST.log = function (msg) {
        console.log(msg);
    };
    $$TEST.assert = function (msg) {
        if (console.assert)
            console.assert(false, msg);
        else
            console.error(msg);
    };
    $$TEST.run = function (obj, msg, tab) {
        tab || (tab = "");
        if (msg)
            $$TEST.log(tab + msg);
        if (!obj)
            return;
        var t = typeof obj;
        if (t === "function")
            obj();
        if (t === "object") {
            var isArr = obj.length !== undefined && obj.push && obj.shift;
            tab = "\t" + tab;
            for (var i in obj) {
                $$TEST.run(obj[i], i, tab);
            }
        }
    };
    $$TEST.prototype.isNone = function (message) {
        if (this.value) {
            throw new $$TestFailException(message || "expect:{0} is zero,empty,null,undefined", this.value);
        }
        return this;
    };
    $$TEST.prototype.isExists = function (message) {
        if (!this.value) {
            throw new $$TestFailException(message || "expect:{0} is NOT zero,empty,null,undefined", this.value);
        }
        return this;
    };
    $$TEST.prototype.isEmpty = function (message) {
        if (this.value !== "") {
            throw new $$TestFailException(message || "expect:{0} is empty string", this.value);
        }
        return this;
    };
    $$TEST.prototype.notEmpty = function (message) {
        if (this.value === "") {
            throw new $$TestFailException(message || "expect:{0} is empty string", this.value);
        }
        return this;
    };
    $$TEST.prototype.isZero = function (message) {
        if (this.value !== 0) {
            throw new $$TestFailException(message || "expect:{0} is zero", this.value);
        }
        return this;
    };
    $$TEST.prototype.notZero = function (message) {
        if (this.value === 0) {
            throw new $$TestFailException(message || "expect:{0} is NOT zero", this.value);
        }
        return this;
    };
    $$TEST.prototype.isNull = function (message) {
        if (this.value !== null) {
            throw new $$TestFailException(message || "expect:{0} is null", this.value);
        }
        return this;
    };
    $$TEST.prototype.notNull = function (message) {
        if (this.value === null) {
            throw new $$TestFailException(message || "expect:{0} is NOT null", this.value);
        }
        return this;
    };
    $$TEST.prototype.isUndefined = function (message) {
        if (this.value !== undefined) {
            throw new $$TestFailException(message || "expect:{0} is undefined", this.value);
        }
        return this;
    };
    $$TEST.prototype.notUndefined = function (message) {
        if (this.value === undefined) {
            throw new $$TestFailException(message || "expect:{0} is defined", this.value);
        }
        return this;
    };
    $$TEST.prototype.hasValue = function (message) {
        if (this.value === undefined || this.value === null) {
            throw new $$TestFailException(message || "expect:{0} has value", this.value);
        }
        return this;
    };
    $$TEST.prototype.noValue = function (message) {
        if (this.value !== undefined && this.value !== null) {
            throw new $$TestFailException(message || "expect:{0} not value", this.value);
        }
        return this;
    };
    $$TEST.prototype.isObject = function (message) {
        if (typeof this.value !== "object") {
            throw new $$TestFailException(message || "expect:{0} is object", this.value);
        }
        return this;
    };
    $$TEST.prototype.notObject = function (message) {
        if (typeof this.value === "object") {
            throw new $$TestFailException(message || "expect:{0} is NOT Object", this.value);
        }
        return this;
    };
    $$TEST.prototype.isArray = function (message) {
        if (Object.prototype.toString.call(this.value) === "{object Array}") {
            throw new $$TestFailException(message || "expect:{0} is array", this.value);
        }
        return this;
    };
    $$TEST.prototype.notArray = function (message) {
        if (Object.prototype.toString.call(this.value) !== "{object Array}") {
            throw new $$TestFailException(message || "expect:{0} is array", this.value);
        }
        return this;
    };
    $$TEST.prototype.isString = function (message) {
        if (typeof this.value !== "string") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.notString = function (message) {
        if (typeof this.value !== "string") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.isBool = function (message) {
        if (typeof this.value !== "boolean") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.notBool = function (message) {
        if (typeof this.value !== "string") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.isNumber = function (message) {
        if (typeof this.value !== "number") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.notNumber = function (message) {
        if (typeof this.value !== "number") {
            throw new $$TestFailException(message || "expect:{0} is string", this.value);
        }
        return this;
    };
    $$TEST.prototype.instanceOf = function () {
        var tp = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            tp[_i] = arguments[_i];
        }
        for (var i = 0, j = tp.length; i < j; i++) {
            if (this.value instanceof tp[i])
                return this;
        }
        throw new $$TestFailException("type check failed.");
    };
    $$TEST.prototype.isEqual = function (other) {
        if (this.value != other) {
            throw new $$TestFailException("expect:{0} == {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.notEqual = function (other) {
        if (this.value == other) {
            throw new $$TestFailException("expect:{0} != {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.isSame = function (other) {
        if (this.value !== other) {
            throw new $$TestFailException("expect:{0} === {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.notSame = function (other) {
        if (this.value === other) {
            throw new $$TestFailException("expect:{0} !== {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.greaterThan = function (other) {
        if (this.value <= other) {
            throw new $$TestFailException("expect:{0} > {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.lessThan = function (other) {
        if (this.value >= other) {
            throw new $$TestFailException("expect:{0} > {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.greaterThanOrEqual = function (other) {
        if (this.value < other) {
            throw new $$TestFailException("expect:{0} >= {1}", this.value, other);
        }
        return this;
    };
    $$TEST.prototype.lessThanOrEqual = function (other) {
        if (this.value > other) {
            throw new $$TestFailException("expect:{0} <= {1}", this.value, other);
        }
        return this;
    };
    return $$TEST;
}());
exports.$$TEST = $$TEST;
exports.$$TEST = $$TEST;
