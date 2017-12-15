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
        AccessFactory.prototype.getOrCreate = function (expr) {
            var accessor = this.caches[expr];
            if (!accessor) {
                accessor = this.caches[expr] = AccessFactory.create(expr, this);
            }
            return accessor;
        };
        AccessFactory.getOrCreate = function (mappath) {
            return AccessFactory.default.getOrCreate(mappath);
        };
        AccessFactory.create = function (dataPath, accessFactory) {
            if (dataPath == "") {
                return rootAccess;
            }
            var paths = dataPath.split(".");
            accessFactory || (accessFactory = AccessFactory.default);
            var last_propname = paths.pop().replace(trimRegx, "");
            if (!last_propname)
                throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            var codes = {
                factory: accessFactory,
                superior: null,
                path: "",
                getter_code: "\tif(!data)return undefined;\n",
                setter_code: "\tif(!data) throw Error('Must have root data.');\n"
            };
            for (var i = 0, j = paths.length; i < j; i++) {
                var propname = paths[i].replace(trimRegx, "");
                buildPropCodes(propname, dataPath, codes, false);
            }
            buildPropCodes(last_propname, dataPath, codes, true);
            var notify_code = "\n    var change_handlers;\n    if(this && this.__valuechange__ && this.__valuechanges__ && (change_handlers=this.__valuechanges__[\"" + dataPath + "\"])){\n        for(var i=0,j=change_handlers.length;i<j;i++) change_handlers[i](value,this,sender,\"" + dataPath + "\"); \n    }";
            var code = "//" + dataPath + "\n"; //"if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code += "var at;\nif(value===undefined){\n" + codes.getter_code + "}else{\n" + codes.setter_code + notify_code + "\n}\n";
            var result = new Function("data", "value", "sender", code);
            result.superior = codes.superior;
            result.mappath = codes.path;
            return result;
        };
        ;
        AccessFactory.rootAccess = rootAccess;
        AccessFactory.default = new AccessFactory();
        return AccessFactory;
    }());
    Quic.AccessFactory = AccessFactory;
    function buildPropCodes(propname, dataPath, codes, isLast) {
        if (!propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        var match = propname.match(arrRegx);
        var nextObjValue = "{}";
        var sub = undefined;
        if (match) {
            sub = match.toString();
            propname = propname.substring(0, propname.length - sub.length);
            nextObjValue = "[]";
        }
        if (sub) {
            if (propname) {
                codes.getter_code += "\tif(!data." + propname + ") return data." + propname + ";else data=data." + propname + ";\n";
                codes.setter_code += "\tif(!data." + propname + ") data = data." + propname + "=" + nextObjValue + ";else data = data." + propname + ";\n";
                codes.path += "." + propname;
            }
            var subs = sub.substr(1, sub.length - 2).split(/\s*\]\s*\[\s*/g);
            for (var m = 0, n = subs.length - 1; m <= n; m++) {
                var indexAt = subs[m];
                if (indexAt === "first") {
                    codes.getter_code += "\tif(!data[0])return data[0];else data = data[0];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.setter_code += "\tdata[0] = value;\n";
                            codes.superior = codes.factory.getOrCreate(codes.path);
                        }
                        else {
                            codes.setter_code += "\tif(!data[0]) data = data[0]={};else data=data[0];\n";
                        }
                    }
                    else {
                        codes.setter_code += "\tif(!data[0]) data = data[0]=[];\n";
                    }
                    codes.path += "[first]";
                }
                else if (indexAt === "last") {
                    codes.getter_code += "\tat = data.length?data.length-1:0; if(!data[at])return data[at];else data = data[at];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.setter_code += "\tat = data.length?data.length-1:0;data[at]=value;\n";
                            codes.superior = codes.factory.getOrCreate(codes.path);
                        }
                        else {
                            codes.setter_code += "\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n";
                        }
                    }
                    else {
                        codes.setter_code += "\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n";
                    }
                    codes.path += "[last]";
                }
                else {
                    if (!/\d+/.test(indexAt))
                        throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += "\tif(!data[" + indexAt + "])return data[" + indexAt + "];else data = data[" + indexAt + "];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast) {
                            codes.superior = codes.factory.getOrCreate(codes.path);
                            codes.setter_code += "\tdata[" + indexAt + "]=value;\n";
                            codes.getter_code += "\treturn data;\n";
                        }
                        else {
                            codes.setter_code += "\tif(!data[" + indexAt + "]) data = data[" + indexAt + "]={};else data=data[" + indexAt + "];\n";
                        }
                    }
                    else {
                        codes.setter_code += "\tif(!data[" + indexAt + "]) data = data[" + indexAt + "]=[];else data=data[" + indexAt + "];\n";
                    }
                    codes.path += "[" + indexAt + "]";
                }
            }
        }
        else {
            if (isLast) {
                if (codes.path !== dataPath) {
                    codes.superior = codes.factory.getOrCreate(codes.path);
                }
                if (propname) {
                    codes.getter_code += "\treturn data." + propname + ";\n";
                    codes.setter_code += "\tdata." + propname + "=value;\n";
                }
                else {
                    codes.getter_code += "\treturn data;\n";
                }
            }
            else {
                codes.setter_code += "\tif(!data." + propname + ") data = data." + propname + "=" + nextObjValue + ";else data = data." + propname + ";\n";
                codes.getter_code += "\tif(!data." + propname + ") return data." + propname + ";else data=data." + propname + ";\n";
            }
            codes.path += codes.path ? "." + propname : propname;
        }
    }
    var dataPathRegx = /(?:\[(?:\d+|first|last)\])?[a-zA-Z_\$][a-zA-Z0-9_\$]*(?:\[(?:\d+|first|last)\])*(?:.[a-zA-Z_\$][a-zA-Z0-9_\$]*(?:\[(?:\d+|first|last)\])*)/g;
})(Quic || (Quic = {}));
exports.AccessFactory = Quic.AccessFactory;
