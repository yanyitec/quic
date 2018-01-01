var Quic;
(function (Quic) {
    Quic.opts = {
        "validation-message-prefix": "valid-"
    };
    function GNo(category) {
        if (category === undefined) {
            if (id_seed++ > 2100000000)
                id_seed = 10000;
            return id_seed;
        }
        else {
            var id = id_seeds[category];
            if (id === undefined || id === 2100000000)
                id = 10000;
            id_seeds[category] = id + 1;
            return id;
        }
    }
    Quic.GNo = GNo;
    var id_seeds = {};
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
    function str_replace(text, data) {
        if (!text || !data)
            return text;
        return text.toString().replace(/\$\{([a-zA-Z0-9\$_.]+)\}/g, function (match) {
            var path = match[1];
            var lastAt = 0;
            var at = 0;
            while ((at = path.indexOf(".", lastAt)) >= 0) {
                var p_1 = path.substring(lastAt, at);
                if (!(data = data[p_1]))
                    return data;
                lastAt = at;
            }
            var p = path.substring(lastAt);
            return data[p];
        });
    }
    Quic.str_replace = str_replace;
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
