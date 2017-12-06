var Quic;
(function (Quic) {
    var self_a = function (data, value) {
        if (value === undefined)
            return data;
        throw "cannot set root data";
    };
    self_a.datapath = "";
    self_a.superior = self_a;
    var rootAccess = self_a;
    var arrRegx = /(?:\[(?:\d+|first|last)\])+$/g;
    var trimRegx = /(^\s+)|(\s+$)/g;
    var AccessFactory = /** @class */ (function () {
        function AccessFactory() {
            this.caches = { "": rootAccess };
        }
        AccessFactory.prototype.create = function (dataPath) {
            return AccessFactory.create(dataPath, this);
        };
        AccessFactory.prototype.cached = function (datapath) {
            return this.getOrCreate(datapath);
        };
        AccessFactory.prototype.getOrCreate = function (dataPath) {
            var accessor = this.caches[dataPath];
            if (!accessor) {
                accessor = this.caches[dataPath] = AccessFactory.create(dataPath, this);
            }
            return accessor;
        };
        AccessFactory.create = function (dataPath, factory) {
            if (dataPath == "") {
                return rootAccess;
            }
            var paths = dataPath.split(".");
            var last_propname = paths.pop().replace(trimRegx, "");
            if (!last_propname)
                throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            var codes = {
                factory: factory,
                superior: null,
                path: "",
                getter_code: "if(!data)return undefined;\n",
                setter_code: "if(!data) throw Error('Must have root data.');\n"
            };
            for (var i = 0, j = paths.length; i < j; i++) {
                var propname = paths[i].replace(trimRegx, "");
                buildPropCodes(propname, dataPath, codes, false);
            }
            buildPropCodes(last_propname, dataPath, codes, true);
            var code = ""; //"if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code += "var at;\nif(value===undefined){\n" + codes.getter_code + "}else{\n" + codes.setter_code + "\n}\n";
            var result = new Function("data", "value", code);
            result.datapath = dataPath;
            result.superior = codes.superior;
            return result;
        };
        ;
        AccessFactory.getOrCreate = function (dataPath) {
            return AccessFactory.instance.getOrCreate(dataPath);
        };
        AccessFactory.cached = function (dataPath) {
            return AccessFactory.instance.getOrCreate(dataPath);
        };
        AccessFactory.rootAccess = rootAccess;
        AccessFactory.instance = new AccessFactory();
        return AccessFactory;
    }());
    Quic.AccessFactory = AccessFactory;
    function buildPropCodes(propname, dataPath, codes, isLast) {
        if (!propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        var match = arrRegx.exec(propname);
        var nextObjValue = "{}";
        var sub = undefined;
        if (match) {
            sub = match.toString();
            propname = propname.substring(0, propname.length - sub.length);
            nextObjValue = "[]";
        }
        if (sub) {
            codes.getter_code += "if(!data." + propname + ") return data." + propname + ";else data=data." + propname + ";\n";
            codes.setter_code += "if(!data." + propname + ") data = data." + propname + "=" + nextObjValue + ";\n";
            codes.path += "." + propname;
            var subs = sub.substr(1, sub.length - 2).split(/\s*\]\s*\[\s*/g);
            for (var m = 0, n = subs.length - 1; m <= n; m++) {
                var indexAt = subs[m];
                if (indexAt === "first") {
                    codes.getter_code += "if(!data[0])return data[0];else data = data[0];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.setter_code += "data[0] = value;\n";
                            codes.superior = codes.factory.cached(codes.path);
                        }
                        else {
                            codes.setter_code += "if(!data[0]) data = data[0]={};else data=data[0];\n";
                        }
                    }
                    else {
                        codes.setter_code += "if(!data[0]) data = data[0]=[]\"\n";
                    }
                    codes.path += "[first]";
                }
                else if (indexAt === "last") {
                    codes.getter_code += "at = data.length?data.length-1:0; if(!data[at])return data[at];else data = data[at];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.setter_code += "at = data.length?data.length-1:0;data[at]=value\";\n";
                            codes.superior = codes.factory.cached(codes.path);
                        }
                        else {
                            codes.setter_code += "at = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n";
                        }
                    }
                    else {
                        codes.setter_code += "at = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n";
                    }
                    codes.path += "[last]";
                }
                else {
                    if (!/\d+/.test(indexAt))
                        throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += "if(!data[" + indexAt + "])return data[" + indexAt + "];else data = data[" + indexAt + "];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.superior = codes.factory.cached(codes.path);
                            codes.setter_code += "data[" + indexAt + "]=value\";\n";
                        }
                        else {
                            codes.setter_code += "if(!data[" + indexAt + "]) data = data[" + indexAt + "]={};else data=data[" + indexAt + "];\n";
                        }
                    }
                    else {
                        codes.setter_code += "if(!data[" + indexAt + "]) data = data[" + indexAt + "]=[];else data=data[" + indexAt + "];\n";
                    }
                    codes.path += "[" + indexAt + "]";
                }
            }
        }
        else {
            if (isLast) {
                if (codes.path !== dataPath) {
                    codes.superior = codes.factory.cached(codes.path);
                }
                codes.getter_code += "return data." + propname + ";\n";
                codes.setter_code += "data." + propname + "=value;\n";
            }
            else {
                codes.setter_code += "if(!data." + propname + ") data = data." + propname + "=" + nextObjValue + ";else data = data." + propname + ";\n";
                codes.getter_code += "if(!data." + propname + ") return data." + propname + ";else data=data." + propname + ";\n";
            }
            codes.path += codes.path ? "." + propname : propname;
        }
    }
})(Quic || (Quic = {}));
exports.AccessFactory = Quic.AccessFactory;
