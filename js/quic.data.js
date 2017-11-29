/// <reference path="quic.ts" />
/// <reference path="quic.env.ts" />
var Quic;
(function (Quic) {
    class DataField {
        constructor(opts) {
            //字段名,去掉两边的空格
            this.name = opts.name ? opts.name.replace(Quic.trimRegx, "") : undefined;
            //必须有字段名
            if (!this.name)
                throw new Error("name is required for DataField");
            //数据类型，默认是string
            this.dataType = opts.dataType ? (opts.dataType.replace(Quic.trimRegx, "") || undefined) : "string";
            // 验证信息
            this.validations = opts.validations;
            // 原始定义
            this.opts = opts;
            //验证跟数据验证是同一个函数
            this.validate = this.dataValidate;
        }
        value(data, val) {
            this.value = (this._accessorFactory || DataAccessorFactory.instance).cached(this.dataPath || this.name);
            return this.value(data, val);
        }
        dataValue(data, val) {
            this.dataValue = (this._accessorFactory || DataAccessorFactory.instance).cached(this.dataPath || this.name);
            return this.dataValue(data, val);
        }
        validationInfos(_T, accessorFactory, state) {
            //没有定义验证规则，没有验证信息
            if (!this.validations) {
                this.validationInfos = () => undefined;
                return;
            }
            let msgs = {};
            let prefix = Quic.opts["validation-message-prefix"] || "valid-";
            for (var validType in this.validations) {
                let validator = validators[validType];
                if (validator) {
                    if (!_T)
                        _T = (txt, mustReturn) => Quic.langs[txt] || (mustReturn === false ? undefined : txt);
                    if (validType === "string" || validType === "text" || validType === "str")
                        validType = "length";
                    else if (validType === "number")
                        validType = "decimal";
                    let messageKey = prefix + validType;
                    let msg = _T(messageKey);
                    let parameter = this.validations[validType];
                    if (!parameter) {
                        msgs[validType] = msg;
                    }
                    else {
                        let t = typeof parameter;
                        let submsg = "";
                        if (typeof parameter === "object") {
                            for (var p in parameter) {
                                let subkey = messageKey + p;
                                let subtxt = _T(subkey, false);
                                if (subtxt) {
                                    if (submsg)
                                        submsg += ",";
                                    submsg += subtxt;
                                }
                            }
                        }
                        else if (t === "string") {
                            submsg = _T(parameter.toString());
                        }
                        msgs[validType] = msg + (submsg ? ":" + submsg : "");
                    }
                }
            }
            for (let n in msgs) {
                this.validationInfos = () => msgs;
                return msgs;
            }
            this.validationInfos = () => undefined;
            return;
        }
        dataValidate(value, state) {
            let validations = this.validations;
            if (!validations) {
                return;
            }
            let hasError = false;
            //let value = this.value(data);
            let required_v = validations["required"];
            if (required_v) {
                let val = value ? value.toString().replace(Quic.trimRegx, "") : "";
                if (!val) {
                    return "required";
                }
            }
            let type_v = validations[this.dataType];
            let typeValidator = validators[this.dataType];
            if (typeValidator) {
                if (typeValidator(value, type_v, this, state) === false) {
                    return this.dataType.toString();
                }
            }
            let result;
            for (var validType in validations) {
                if (validType === "required" || validType === this.dataType)
                    continue;
                let validator = validators[validType];
                if (!validator) {
                    Quic.env.warn("unregistered validation type:" + validType);
                    continue;
                }
                let validParameter = validations[validType];
                let rs = validator(value, validParameter, this, state);
                if (rs === false)
                    return validType;
                if (rs !== true)
                    result = null;
            }
            return result;
        }
    }
    DataField.validationMessagePrefix = "valid-message-";
    Quic.DataField = DataField;
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
    let validators = {};
    validators["length"] = (value, parameter, field, state) => {
        let val = (value === undefined || value === null) ? 0 : value.toString().length;
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["string"] = validators["text"] = validators["length"];
    validators["int"] = (value, parameter, field, state) => {
        if (value === null || value === undefined)
            return;
        value = value.toString().replace(Quic.trimRegx, "");
        if (!value)
            return;
        if (!Quic.intRegx.test(value))
            return false;
        let val = parseInt(value);
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["decimal"] = (value, parameter, field, state) => {
        if (value === null || value === undefined)
            return;
        value = value.toString().replace(Quic.trimRegx, "");
        if (!value)
            return;
        let match = value.match(Quic.decimalRegx);
        if (!match)
            return false;
        if (parameter && parameter.ipart && match[0].replace(/,/g, "").length > parameter.ipart)
            return false;
        if (parameter && parameter.fpart && match[1] && match[1].length - 1 > parameter.fpart)
            return false;
        let val = parseFloat(value);
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["email"] = (value, parameter, field, state) => {
        if (value === null || value === undefined || /\s+/.test(value))
            return;
        if (value === undefined || value === null)
            return null;
        return Quic.emailRegx.test(value);
    };
    //
    validators["url"] = (value, parameter, field, state) => {
        if (value === null || value === undefined || /\s+/.test(value))
            return;
        return Quic.urlRegx.test(value);
    };
    validators["regex"] = (value, parameter, field, state) => {
        if (value === null || value === undefined)
            return;
        let reg;
        try {
            reg = new RegExp(parameter);
        }
        catch (ex) {
            throw Error("parameter is invalid regex:" + parameter);
        }
        return reg.test(value);
    };
    validators["remote"] = (value, parameter, field, state) => {
        throw new Error("Not implement");
    };
    Quic.arrRegx = /(?:\[\d+\])+$/g;
    Quic.trimRegx = /(^\s+)|(\s+$)/g;
    Quic.urlRegx = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;
    Quic.emailRegx = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/g;
    Quic.intRegx = /(^[+\-]?\d+$)|(^[+\-]?\d{1,3}(,\d{3})?$)/;
    Quic.decimalRegx = /^((?:[+\-]?\d+)|(?:[+\-]?\d{1,3}(?:\d{3})?))(.\d+)?$/;
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
    Quic.opts = {
        "validation-message-prefix": "valid-"
    };
    Quic.langs = {
        "valid-required": "必填",
        "valid-length": "字符个数",
        "valid-length-min": "至少{min}",
        "valid-length-max": "最多{max}",
        "valid-length-min-max": "{min}-{max}个",
        "valid-int": "必须是整数",
        "valid-int-min": "最小值为{min}",
        "valid-int-max": "最大值为{max}",
        "valid-int-min-max": "取值范围为{min}-{max}",
        "valid-decimal": "必须是数字",
        "valid-decimal-min": "最小值为{min}",
        "valid-decimal-max": "最大值为{max}",
        "valid-decimal-min-max": "取值范围为{min}-{max}",
        "valid-decimal-ipart": "整数部分最多{min}位",
        "valid-decimal-fpart": "小数部分最多{max}位",
        "valid-email": "必须是电子邮件地址格式",
        "valid-url": "必须是URL地址格式",
        "valid-regex": "必须符合格式"
    };
})(Quic || (Quic = {}));
