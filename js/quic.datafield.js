/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
var Quic;
(function (Quic) {
    class DataField {
        constructor(defs) {
            //字段名,去掉两边的空格
            this.name = defs.name ? defs.name.replace(Quic.trimRegx, "") : undefined;
            //必须有字段名
            if (!this.name)
                throw new Error("name is required for DataField");
            //数据类型，默认是string
            this.dataType = defs.dataType ? (defs.dataType.replace(Quic.trimRegx, "") || undefined) : "string";
            // 验证信息
            this.validations = defs.validations;
            // 原始定义
            this.defs = defs;
            //验证跟数据验证是同一个函数
            this.validate = this.dataValidate;
        }
        validationInfos(_T) {
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
