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
var Quic;
(function (Quic) {
    Quic.opts = {
        "validation-message-prefix": "valid-"
    };
    var Exception = /** @class */ (function (_super) {
        __extends(Exception, _super);
        function Exception(message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var _this = _super.call(this, message) || this;
            for (var i in args)
                _this[i] = args[i];
            return _this;
        }
        return Exception;
    }(Error));
    Quic.Exception = Exception;
    function nextGNo() {
        if (id_seed++ > 2100000000)
            id_seed = -2100000000;
        return id_seed;
    }
    Quic.nextGNo = nextGNo;
    var id_seed = 10000;
    //export let arrRegx:RegExp =/(?:\[\d+\])+$/g;
    Quic.trim = function (o) { return o === null || o === undefined ? "" : o.toString().replace(/^(?:\s+)|(?:\s+$)/, ""); };
    var toString = Object.prototype.toString;
    Quic.isArray = function (o) { return toString.call(o) === "[object Array]"; };
    function isElement(node) {
        return node.nodeType !== undefined && node.getAttribute && node.appendChild;
    }
    Quic.isElement = isElement;
    function getExactType(o) {
        if (o === null)
            return "null";
        if (o instanceof RegExp)
            return "regex";
        var t = typeof o;
        if (t === "object") {
            if (toString.call(o) === "[object Array]")
                return "array";
            if (o.nodeType !== undefined && o.appendChild && o.getAttribute)
                return "element";
        }
        return t;
    }
    Quic.getExactType = getExactType;
    function extend1(dest, src, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        if (!src)
            return dest;
        if (!dest)
            dest = Quic.isArray(src) ? [] : {};
        for (var n in src) {
            var srcValue = src[n];
            var destValue = dest[n];
            var srcValueType = getExactType(srcValue);
            var destValueType = getExactType(destValue);
            if (srcValueType === "object") {
                if (destValueType !== "object")
                    destValue = dest[n] = {};
                extend(destValue, srcValue);
            }
            else if (srcValueType === "array") {
                if (destValueType !== "object" && destValueType !== "array" && destValueType !== "function")
                    destValue = dest[n] = [];
                extend(destValue, srcValue);
            }
            else {
                if (destValue === undefined)
                    dest[n] = srcValue;
            }
        }
        for (var i = 2, j = arguments.length; i < j; i++) {
            extend(dest, arguments[i]);
        }
        return dest;
    }
    Quic.extend1 = extend1;
    function array_index(arr, value) {
        for (var i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === value)
                return i;
        }
        return -1;
    }
    Quic.array_index = array_index;
    function deepClone(value) {
        if (!value)
            return value;
        if (typeof value === 'object') {
            var newValue = value.length !== undefined && value.shift && value.push ? [] : {};
            for (var n in value) {
                newValue[n] = deepClone(value[n]);
            }
            return newValue;
        }
        return value;
    }
    Quic.deepClone = deepClone;
    function extend(dest, src, overrite) {
        if (!src)
            return dest;
        for (var n in src) {
            var srcValue = src[n];
            var destValue = dest[n];
            if (typeof srcValue === "object") {
                if (overrite !== false || destValue === undefined) {
                    if (typeof destValue !== "object") {
                        destValue = dest[n] = srcValue.length !== undefined && srcValue.push && srcValue.shift ? [] : {};
                    }
                    extend(destValue, srcValue);
                }
            }
            else {
                if (overrite !== false || destValue === undefined) {
                    dest[n] = srcValue;
                }
            }
        }
        //if(recordRaw===true){dest.quic_extend_from = src;} 
        return dest;
    }
    Quic.extend = extend;
})(Quic || (Quic = {}));
