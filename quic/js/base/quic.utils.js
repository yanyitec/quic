var Quic;
(function (Quic) {
    Quic.opts = {
        "validation-message-prefix": "valid-"
    };
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
    function extend(dest, src, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
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
    Quic.extend = extend;
    function array_index(arr, value) {
        for (var i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === value)
                return i;
        }
        return -1;
    }
    Quic.array_index = array_index;
    function str_replace(text, data, accessorFactory) {
        if (text === null || text === undefined)
            text = "";
        else
            text = text.toString();
        //if(!data){ return text;}
        var regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory = Quic.AccessFactory.default);
        return text.replace(regx, function (m) {
            var accessor;
            var expr = m[1];
            try {
                accessor = accessorFactory.getOrCreate(expr);
            }
            catch (ex) {
                Quic.ctx.warn("Invalid datapath expression:" + expr);
                return "{INVALID:" + expr + "}";
            }
            return data ? accessor(data) : "";
        });
    }
    Quic.str_replace = str_replace;
})(Quic || (Quic = {}));
