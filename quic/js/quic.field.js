/// <reference path="quic.abstracts.ts" />
var Quic;
(function (Quic) {
    var Field = /** @class */ (function () {
        function Field(fieldset, opts) {
            this.fieldset = fieldset;
            this.opts = opts;
            //字段名,去掉两边的空格
            this.name = opts.name ? opts.name.replace(Quic.trimRegx, "") : undefined;
            //必须有字段名
            if (!this.name)
                throw new Error("name is required for DataField");
            //数据类型，默认是string
            this.dataType = opts.dataType ? (opts.dataType.replace(Quic.trimRegx, "") || "string") : "string";
            //视图类型&视图构造器
            var viewType = this.viewType = opts.viewType ? (opts.viewType.replace(Quic.trimRegx, "") || this.dataType) : this.dataType;
            this.renderer = this.fieldset.quic.findRenderer(viewType);
            if (!this.renderer)
                return Quic.ctx.throw("Invalid viewType", viewType);
            //nolabel
            if (viewType === "action" || viewType === "submit" || viewType === "reset" || viewType === "close" || viewType === "open" || viewType === "navigate") {
                this.nolabel = true;
            }
            else
                this.nolabel = opts.nolabel;
            //css 
            this.css = opts.css ? (opts.css.replace(Quic.trimRegx, "") || this.css) : this.dataType;
            this.CSS = new Quic.ViewCSS(this);
            //permission
            this.permission = opts.permission; //;|| this.fieldset;
            this.position = opts.position;
            // mappath
            this.mappath = opts.mappath ? opts.mappath.replace(Quic.trimRegx, "") : undefined;
            this.mappedValue = mappedValue;
            this.mappedValue(null);
        }
        Field.prototype.validationRule = function (validType) {
            return this.validations ? this.validations[validType] : undefined;
        };
        Field.prototype.validationTips = function (localization) {
            //没有定义验证规则，没有验证信息
            if (!this.validations) {
                this.validationTips = function () { return undefined; };
                return;
            }
            var msgs = {};
            var prefix = Quic.opts["validation-message-prefix"] || "valid-";
            for (var validType in this.validations) {
                var validator = validators[validType];
                if (validator) {
                    if (validType === "string" || validType === "text" || validType === "str")
                        validType = "length";
                    else if (validType === "number")
                        validType = "decimal";
                    var messageKey = prefix + validType;
                    var msg = localization._T(messageKey);
                    var parameter = this.validations[validType];
                    if (!parameter) {
                        msgs[validType] = msg;
                    }
                    else {
                        var t = typeof parameter;
                        var submsg = "";
                        if (typeof parameter === "object") {
                            for (var p in parameter) {
                                var subkey = messageKey + p;
                                var subtxt = localization._T(subkey, false);
                                if (subtxt) {
                                    if (submsg)
                                        submsg += ",";
                                    submsg += subtxt;
                                }
                            }
                        }
                        else if (t === "string") {
                            submsg = localization._T(parameter.toString());
                        }
                        msgs[validType] = msg + (submsg ? ":" + submsg : "");
                    }
                }
            }
            for (var n in msgs) {
                this.validationTips = function () { return msgs; };
                return msgs;
            }
            this.validationTips = function () { return undefined; };
            return;
        };
        Field.prototype.validate = function (value, state) {
            var validations = this.validations;
            if (!validations) {
                return;
            }
            var hasError = false;
            //let value = this.value(data);
            var required_v = validations["required"];
            if (required_v) {
                var val = value ? value.toString().replace(Quic.trimRegx, "") : "";
                if (!val) {
                    return "required";
                }
            }
            var type_v = validations[this.dataType];
            var typeValidator = validators[this.dataType];
            if (typeValidator) {
                if (typeValidator(value, type_v, this, state) === false) {
                    return this.dataType.toString();
                }
            }
            var result;
            for (var validType in validations) {
                if (validType === "required" || validType === this.dataType)
                    continue;
                var validator = validators[validType];
                if (!validator) {
                    Quic.ctx.warn("unregistered validation type:" + validType);
                    continue;
                }
                var validParameter = validations[validType];
                var rs = validator(value, validParameter, this, state);
                if (rs === false)
                    return validType;
                if (rs !== true)
                    result = null;
            }
            return result;
        };
        return Field;
    }());
    Quic.Field = Field;
    function mappedValue(data, value) {
        var mappath = this.mappath;
        if (!mappath || mappath === this.name) {
            this.mappedValue = function (data, value) {
                if (value === undefined)
                    return data ? data[this.name] : undefined;
                if (data)
                    data[this.name] = value;
                return this;
            };
        }
        else {
            this.mappedValue = this.getAccessor(mappath);
        }
        return this.mappedValue(data, value);
    }
    Quic.mappedValue = mappedValue;
    var validators = {};
    validators["length"] = function (value, parameter, field, state) {
        var val = (value === undefined || value === null) ? 0 : value.toString().length;
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["string"] = validators["text"] = validators["length"];
    validators["int"] = function (value, parameter, field, state) {
        if (value === null || value === undefined)
            return;
        value = value.toString().replace(Quic.trimRegx, "");
        if (!value)
            return;
        if (!Quic.intRegx.test(value))
            return false;
        var val = parseInt(value);
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["decimal"] = function (value, parameter, field, state) {
        if (value === null || value === undefined)
            return;
        value = value.toString().replace(Quic.trimRegx, "");
        if (!value)
            return;
        var match = value.match(Quic.decimalRegx);
        if (!match)
            return false;
        if (parameter && parameter.ipart && match[0].replace(/,/g, "").length > parameter.ipart)
            return false;
        if (parameter && parameter.fpart && match[1] && match[1].length - 1 > parameter.fpart)
            return false;
        var val = parseFloat(value);
        if (parameter && parameter.min && parameter.min > val)
            return false;
        if (parameter && parameter.max && parameter.max < val)
            return false;
        return true;
    };
    validators["email"] = function (value, parameter, field, state) {
        if (value === null || value === undefined || /\s+/.test(value))
            return;
        if (value === undefined || value === null)
            return null;
        return Quic.emailRegx.test(value);
    };
    //
    validators["url"] = function (value, parameter, field, state) {
        if (value === null || value === undefined || /\s+/.test(value))
            return;
        return Quic.urlRegx.test(value);
    };
    validators["regex"] = function (value, parameter, field, state) {
        if (value === null || value === undefined)
            return;
        var reg;
        try {
            reg = new RegExp(parameter);
        }
        catch (ex) {
            throw Error("parameter is invalid regex:" + parameter);
        }
        return reg.test(value);
    };
    validators["remote"] = function (value, parameter, field, state) {
        throw new Error("Not implement");
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
