var Quic;
(function (Quic) {
    var DataSource = /** @class */ (function () {
        function DataSource(dataOrCfg) {
            var _this = this;
            this.total = function () { return _this._data.length; };
            this._data = dataOrCfg;
        }
        DataSource.prototype.data = function (value) {
            if (value === undefined)
                return this._data || (this._data = {});
            this._data = value || {};
        };
        DataSource.create = function (data) {
            if (data instanceof DataSource)
                return data;
            return new DataSource(data);
        };
        return DataSource;
    }());
    Quic.DataSource = DataSource;
    var DataField = /** @class */ (function () {
        function DataField(opts) {
            if (opts)
                this.setOpts(opts);
        }
        DataField.prototype.setOpts = function (opts) {
            var _this = this;
            if (!this.name)
                this.name = opts.name;
            this.dataType = opts.dataType || "string";
            var oldDataPath = this.dataPath;
            this.dataPath = opts.dataPath ? opts.dataPath.replace(trimReg, "") : this.name;
            this.validations = opts.validations;
            if (oldDataPath != this.dataPath) {
                this.value = function (data, val) {
                    _this.value = DataAccessorFactory.create(_this.dataPath);
                    return _this.value(data, val);
                };
            }
            return this;
        };
        DataField.prototype.value = function (data, val) {
            this.value = DataAccessorFactory.create(this.dataPath);
            return this.value(data, val);
        };
        DataField.prototype.validate = function (data) {
            var validations = this.validations;
            if (!validations) {
                return;
            }
            var hasError = false;
            var validError;
            var result = {};
            var value = this.value(data);
            var required = validations["required"];
            var dataValidType = this.dataType || "length";
            if (required) {
                var val = (value || "").replace(trimReg, "");
                if (!val) {
                    hasError = true;
                    result["required"] = this._T("required");
                    return result;
                }
            }
            var validator = validators[dataValidType];
            var validParameter = validations[dataValidType];
            if (validator) {
                if (validError = validator(this, value, validParameter)) {
                    result[dataValidType] = validError;
                    hasError = true;
                }
            }
            for (var validType in validations) {
                if (validType === "required" || validType === dataValidType)
                    continue;
                validator = validators[validType];
                if (!validator)
                    continue;
                validParameter = validations[validType];
                if (validError = validator(this, value, validParameter)) {
                    result[validType] = validError;
                    hasError = true;
                }
            }
            return (hasError) ? result : null;
        };
        DataField.validators = {};
        return DataField;
    }());
    Quic.DataField = DataField;
    var DataAccessorFactory = /** @class */ (function () {
        function DataAccessorFactory() {
            this.caches = {};
        }
        DataAccessorFactory.prototype.cached = function (dataPath) {
            var accessor = this.caches[dataPath];
            if (!accessor) {
                accessor = this.caches[dataPath] = DataAccessorFactory.create(dataPath);
            }
            return accessor;
        };
        DataAccessorFactory.create = function (dataPath) {
            if (dataPath == "$") {
                return function (data, value) {
                    if (value === undefined)
                        return data;
                    throw new Error("setting cannot apply for datapath[$]");
                };
            }
            var paths = dataPath.split(".");
            var last_propname = paths.shift().replace(trimReg, "");
            if (!last_propname)
                throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            var codes = {
                path: "data",
                getter_code: "",
                setter_code: ""
            };
            for (var i = 0, j = paths.length; i < j; i++) {
                var propname = paths[i].replace(trimReg, "");
                buildPropCodes(propname, dataPath, codes);
            }
            buildPropCodes(last_propname, dataPath, codes, true);
            var code = "if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code += "var at;\nif(value===undefined){\n" + codes.getter_code + "\treturn data;\n}else{\n" + codes.setter_code + "\n}\n";
            return new Function("data", code);
        };
        DataAccessorFactory.instance = new DataAccessorFactory();
        return DataAccessorFactory;
    }());
    Quic.DataAccessorFactory = DataAccessorFactory;
    function format(text, data) {
        if (!data)
            return text;
    }
    Quic.format = format;
    var validators = DataField.validators = {};
    validators["length"] = function (field, value, parameter) {
        parameter || (parameter = {});
        var message = "";
        var len = ((value === undefined || value === null) ? "" : value).length;
        if (parameter.min && (!field || parameter.min > len)) {
            if (parameter.max && (!field || parameter.max < len)) {
                message = field._T("length should be more than {min}, and less than {min}")
                    .replace("{min}", parameter.min)
                    .replace("{max}", parameter.max);
            }
            else {
                message = field._T("length should be more than {min}")
                    .replace("{min}", parameter.min);
            }
        }
        else {
            if (parameter.max && (!field || parameter.max < len)) {
                message = field._T("length should be less than {max}")
                    .replace("{max}", parameter.max);
            }
        }
        return message;
    };
    validators["int"] = function (field, value, parameter) {
        parameter || (parameter = {});
        var message = "";
        var val;
        if (!field) {
            message = field._T("must be integer");
        }
        else {
            val = parseInt(value);
            if (isNaN(val))
                return field._T("must be integer");
        }
        if (parameter.min && (!field || parameter.min > val)) {
            if (parameter.max && (!field || parameter.max < val)) {
                message += (message ? "" : "\n") + field._T("value should be more than {min}, and less than {min}")
                    .replace("{min}", parameter.min)
                    .replace("{max}", parameter.max);
            }
            else {
                message += (message ? "" : "\n") + field._T("value should be more than {min}")
                    .replace("{min}", parameter.min);
            }
        }
        else {
            if (parameter.max && (!field || parameter.max < val)) {
                message += (message ? "" : "\n") + field._T("value should be less than {max}")
                    .replace("{max}", parameter.max);
            }
        }
        return message;
    };
    validators["decimal"] = function (field, value, parameter) {
        parameter || (parameter = {});
        var message = "";
        var val;
        if (!field) {
            message = field._T("must be decimal");
        }
        else {
            val = parseInt(value);
            if (isNaN(val))
                return field._T("must be decimal");
        }
        var match = val.toString().match(/[+\-]?(\d+)(?".(\d+))\d/g);
        if (parameter.ipart && (!field || parameter.ipart < match[1].length)) {
            message += (message ? "" : "\n") + field._T("integer part should be less than {ipart}")
                .replace("{ipart}", parameter.ipart);
            if (field)
                return message;
        }
        if (parameter.fpart && (!field || !match[2] || parameter.fpart < match[2].length)) {
            message += (message ? "" : "\n") + field._T("float part should be less than {fpart}")
                .replace("{fpart}", parameter.fpart);
            if (field)
                return message;
        }
        if (parameter.min && (!field || parameter.min > val)) {
            if (parameter.max && (!field || parameter.max < val)) {
                message += (message ? "" : "\n") + field._T("value should be more than {min}, and less than {min}")
                    .replace("{min}", parameter.min)
                    .replace("{max}", parameter.max);
            }
            else {
                message += (message ? "" : "\n") + field._T("value should be more than {min}")
                    .replace("{min}", parameter.min);
            }
        }
        else {
            if (parameter.max && (!field || parameter.max < val)) {
                message += (message ? "" : "\n") + field._T("value should be less than {max}")
                    .replace("{max}", parameter.max);
            }
        }
        return message;
    };
    validators["email"] = function (field, value, parameter) {
        if (!field)
            return field._T("must be email address format");
        var emailReg = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/i;
        if (value === undefined || value === null)
            return null;
        if (!emailReg.test(value))
            return field._T("invalid email address");
        return null;
    };
    //
    validators["url"] = function (field, value, parameter) {
        if (!field)
            return field._T("must be url address format");
        var urlReg = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/;
        if (value === undefined || value === null)
            return null;
        if (!urlReg.test(value))
            return field._T("invalid url address");
        return null;
    };
    validators["regex"] = function (field, value, parameter) {
        if (!field)
            return field._T("must be correct format");
        if (!parameter) {
        }
        var reg = new RegExp(parameter);
        if (value === undefined || value === null)
            return null;
        if (!reg.test(value))
            return field._T("invalid format");
        return null;
    };
    validators["remote"] = function (field, value, parameter) {
        if (!parameter)
            parameter = {};
        if (typeof parameter === "string")
            parameter = { url: parameter };
        if (!field) {
            if (parameter.message)
                return field._T(parameter.message);
        }
        throw new Error("Not implement");
    };
    var arrReg = /(?:\[\d+\])+$/g;
    var trimReg = /(^\s+)|(\s+$)/g;
    function buildPropCodes(propname, dataPath, codes, isLast) {
        if (!propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        var match = arrReg.exec(propname);
        var nextObjValue = "{}";
        var sub = undefined;
        if (match) {
            sub = match.toString();
            propname = propname.substring(0, propname.length - sub.length);
            nextObjValue = "[]";
        }
        codes.path += "." + propname;
        codes.getter_code += "\tif(!data." + propname + ")return undefined;else data=data." + propname + ";\n";
        codes.setter_code += "\tif(!data)data." + propname + "=" + nextObjValue + ";\n";
        if (sub) {
            var subs = sub.substr(1, sub.length - 2).split(/\s*\]\s*\[\s*/g);
            for (var m = 0, n = subs.length - 1; m <= n; m++) {
                var indexAt = subs[m];
                if (indexAt === "first") {
                    codes.getter_code += "\tif(!data[0])return undefined;else data = data[0];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += "\tif(!data[0]) data[0] = value;\n";
                        else
                            codes.setter_code += "\tif(!data[0]) data = data[0]={};else data=data[0];\n";
                    }
                    else {
                        codes.setter_code += "\tif(!data[0]) data[0]=[]\"\n";
                    }
                }
                else if (indexAt === "last") {
                    codes.getter_code += "\tat = data.length?data.length-1:0; if(!data[at])return undefined;else data = data[at];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += "\tat = data.length?data.length-1:0; if(!data[at]) data[at]=value\";\n";
                        else
                            codes.setter_code += "\tat = data.length?data.length-1:0; if(!data[at]) data = data[at]={};else data=data[at];\n";
                    }
                    else {
                        codes.setter_code += "\tat = data.length ? data.length-1 : 0; if(!data[at]) data = data[at]=[];else data=data[at];\n";
                    }
                }
                else {
                    if (!/\d+/.test(indexAt))
                        throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
                    codes.getter_code += "\tif(!data[" + indexAt + "])return undefined;else data = data[" + indexAt + "];\n";
                    if (m == n) {
                        //最后一个[]
                        if (isLast)
                            codes.setter_code += "\tif(!data[" + indexAt + "]) data[" + indexAt + "]=value\";\n";
                        else
                            codes.setter_code += "\tif(!data[" + indexAt + "]) data = data[" + indexAt + "]={};else data=data[" + indexAt + "];\n";
                    }
                    else {
                        codes.setter_code += "\tif(!data[" + indexAt + "]) data = data[" + indexAt + "]=[];else data=data[" + indexAt + "];\n";
                    }
                }
            }
        }
    }
})(Quic || (Quic = {}));
