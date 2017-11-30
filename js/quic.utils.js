var Quic;
(function (Quic) {
    Quic.arrRegx = /(?:\[\d+\])+$/g;
    Quic.trimRegx = /(^\s+)|(\s+$)/g;
    Quic.urlRegx = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;
    Quic.emailRegx = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/g;
    Quic.intRegx = /(^[+\-]?\d+$)|(^[+\-]?\d{1,3}(,\d{3})?$)/;
    Quic.decimalRegx = /^((?:[+\-]?\d+)|(?:[+\-]?\d{1,3}(?:\d{3})?))(.\d+)?$/;
    Quic.trim = (o) => o === null || o === undefined ? "" : o.toString().replace(Quic.trimRegx, "");
    let toString = Object.prototype.toString;
    Quic.isArray = (o) => toString.call(o) === "[object Array]";
    function getExactType(o) {
        if (o === null)
            return "null";
        if (o instanceof RegExp)
            return "regex";
        let t = typeof o;
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
            let srcValue = src[n];
            let destValue = dest[n];
            let srcValueType = getExactType(srcValue);
            let destValueType = getExactType(destValue);
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
        for (let i = 2, j = arguments.length; i < j; i++) {
            extend(dest, arguments[i]);
        }
        return dest;
    }
    Quic.extend = extend;
    function array_index(arr, value) {
        for (let i = 0, j = arr.length; i < j; i++) {
            if (arr[i] === value)
                return i;
        }
        return -1;
    }
    Quic.array_index = array_index;
    class DataAccessorFactory {
        constructor() {
            this.caches = {};
        }
        cached(dataPath) {
            let accessor = this.caches[dataPath];
            if (!accessor) {
                accessor = this.caches[dataPath] = DataAccessorFactory.create(dataPath);
            }
            return accessor;
        }
        static cached(dataPath) {
            return DataAccessorFactory.instance.cached(dataPath);
        }
    }
    DataAccessorFactory.create = (dataPath) => {
        if (dataPath == "$") {
            return function (data, value) {
                if (value === undefined)
                    return data;
                throw new Error("setting cannot apply for datapath[$]");
            };
        }
        let paths = dataPath.split(".");
        let last_propname = paths.shift().replace(Quic.trimRegx, "");
        if (!last_propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let codes = {
            path: "data",
            getter_code: "",
            setter_code: ""
        };
        for (let i = 0, j = paths.length; i < j; i++) {
            let propname = paths[i].replace(Quic.trimRegx, "");
            buildPropCodes(propname, dataPath, codes);
        }
        buildPropCodes(last_propname, dataPath, codes, true);
        let code = "if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
        code += "var at;\nif(value===undefined){\n" + codes.getter_code + "\treturn data;\n}else{\n" + codes.setter_code + "\n}\n";
        return new Function("data", code);
    };
    DataAccessorFactory.instance = new DataAccessorFactory();
    Quic.DataAccessorFactory = DataAccessorFactory;
    function buildPropCodes(propname, dataPath, codes, isLast) {
        if (!propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        let match = Quic.arrRegx.exec(propname);
        let nextObjValue = "{}";
        let sub = undefined;
        if (match) {
            sub = match.toString();
            propname = propname.substring(0, propname.length - sub.length);
            nextObjValue = "[]";
        }
        codes.path += "." + propname;
        codes.getter_code += `\tif(!data.${propname})return undefined;else data=data.${propname};\n`;
        codes.setter_code += `\tif(!data)data.${propname}=${nextObjValue};\n`;
        if (sub) {
            let subs = sub.substr(1, sub.length - 2).split(/\s*\]\s*\[\s*/g);
            for (let m = 0, n = subs.length - 1; m <= n; m++) {
                let indexAt = subs[m];
                if (indexAt === "first") {
                    codes.getter_code += `\tif(!data[0])return undefined;else data = data[0];\n`;
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += `\tif(!data[0]) data[0] = value;\n`;
                        else
                            codes.setter_code += `\tif(!data[0]) data = data[0]={};else data=data[0];\n`;
                    }
                    else {
                        codes.setter_code += `\tif(!data[0]) data[0]=[]"\n`;
                    }
                }
                else if (indexAt === "last") {
                    codes.getter_code += `\tat = data.length?data.length-1:0; if(!data[at])return undefined;else data = data[at];\n`;
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data[at]=value";\n`;
                        else
                            codes.setter_code += `\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n`;
                    }
                    else {
                        codes.setter_code += `\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n`;
                    }
                }
                else {
                    if (!/\d+/.test(indexAt))
                        throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += `\tif(!data[${indexAt}])return undefined;else data = data[${indexAt}];\n`;
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += `\tif(!data[${indexAt}]) data[${indexAt}]=value";\n`;
                        else
                            codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]={};else data=data[${indexAt}];\n`;
                    }
                    else {
                        codes.setter_code += `\tif(!data[${indexAt}]) data = data[${indexAt}]=[];else data=data[${indexAt}];\n`;
                    }
                }
            }
        }
    }
    function str_replace(text, data, accessorFactory) {
        if (text === null || text === undefined)
            text = "";
        else
            text = text.toString();
        //if(!data){ return text;}
        let regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory = DataAccessorFactory.instance);
        return text.replace(regx, function (m) {
            let accessor;
            let expr = m[1];
            try {
                accessor = accessorFactory.cached(expr);
            }
            catch (ex) {
                Quic.env.warn("Invalid datapath expression:" + expr);
                return "{INVALID:" + expr + "}";
            }
            return data ? accessor(data) : "";
        });
    }
    Quic.str_replace = str_replace;
})(Quic || (Quic = {}));
