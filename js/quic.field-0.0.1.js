/// <reference path="quic.view.ts" />
var Quic;
(function (Quic) {
    //权限种类
    var Permissions;
    (function (Permissions) {
        Permissions[Permissions["disabled"] = 0] = "disabled";
        Permissions[Permissions["editable"] = 1] = "editable";
        Permissions[Permissions["readonly"] = 2] = "readonly";
        Permissions[Permissions["hidden"] = 3] = "hidden";
    })(Permissions = Quic.Permissions || (Quic.Permissions = {}));
    var SetFieldOptsMethods;
    (function (SetFieldOptsMethods) {
        //覆盖已有的值
        SetFieldOptsMethods[SetFieldOptsMethods["override"] = 0] = "override";
        //如果已经赋值就忽略
        SetFieldOptsMethods[SetFieldOptsMethods["ignore"] = 1] = "ignore";
        //值类型的就覆盖，引用类型的就追加
        SetFieldOptsMethods[SetFieldOptsMethods["append"] = 2] = "append";
    })(SetFieldOptsMethods = Quic.SetFieldOptsMethods || (Quic.SetFieldOptsMethods = {}));
    var Field = /** @class */ (function () {
        function Field(container, opts) {
            this.container.fields[opts.name] = this;
            for (var n in opts)
                setOptsValue(self, n, opts[n], SetFieldOptsMethods.override);
            if (!this.css)
                this.css = "";
            if (!this.viewType)
                this.viewType = "text";
            this.css += "field " + this.name + " viewtype-" + this.viewType;
            this._resetDirectData();
        }
        Field.prototype.setOpts = function (opts, method) {
            if (method === void 0) { method = SetFieldOptsMethods.override; }
            var self = this;
            if (method == SetFieldOptsMethods.override || method == SetFieldOptsMethods[SetFieldOptsMethods.override]) {
                for (var n in opts)
                    setOptsValue(self, n, opts[n], SetFieldOptsMethods.override);
            }
            else if (method == SetFieldOptsMethods.ignore || method == SetFieldOptsMethods[SetFieldOptsMethods.ignore]) {
                for (var n in opts)
                    setOptsValue(self, n, opts[n], SetFieldOptsMethods.ignore);
            }
            else if (method == SetFieldOptsMethods.append || method == SetFieldOptsMethods[SetFieldOptsMethods.append]) {
                for (var n in opts) {
                    if (n == "css") {
                        if (this.css && opts.css)
                            this.css += " " + opts.css;
                    }
                    else {
                        setOptsValue(self, n, opts[n], SetFieldOptsMethods.ignore);
                    }
                }
            }
            if (!this.css)
                this.css = "";
            this.css += " field " + this.name;
            this._resetDirectData();
        };
        Field.prototype.get_builder = function () {
            if (this.builder)
                return this.builder;
            var gbuilder = Field.getViewBuilder(this.viewType);
            return this.builder = {
                editable: gbuilder.editable,
                readonly: gbuilder.readonly,
                hidden: gbuilder.hidden,
                getViewValue: gbuilder.getViewValue,
                setViewValue: gbuilder.setViewValue
            };
        };
        Field.prototype.get_value = function () {
            var data = this.container.get_data();
            //获取构造器
            var builder = this.get_builder();
            //获取直接数据
            var directData = this.directData();
            if (this.element) {
                //如果已经构建了element,优先从element中获取值
                var viewValue = builder.getViewValue(this);
                if (directData)
                    directData[this.name] = viewValue;
                return viewValue;
            }
            else {
                // 如果还没有构建element,从data中获取值
                return directData ? directData[this.name] : undefined;
            }
        };
        Field.prototype.set_value = function (value) {
            var data = this.container.get_data();
            //获取构造器
            var builder = this.get_builder();
            //获取直接数据
            var directData = this.directData();
            if (this.element) {
                //如果已经构建了element,优先从element中获取值
                builder.setViewValue(this);
            }
            // 如果还没有构建element,从data中获取值
            directData[this.name] = value;
            return this;
        };
        Field.prototype.buildFormView = function (validateRequired) {
            var element = Field.utils.createElement("div");
            var perm = this.get_permission();
            element.className = this.css + Permissions[perm];
            var html = "<label class='field-label'></label><span class='field-wrapper'></span>";
            if (perm == Permissions.editable)
                html += "<label class='field-validate-info'></label>";
            element.innerHTML = html;
            var builder = this.get_builder();
            var cell;
            switch (perm) {
                case Permissions.editable:
                    cell = builder.editable(this, validateRequired);
                    break;
                case Permissions.readonly:
                    cell = builder.readonly(this);
                    break;
                case Permissions.hidden:
                    cell = builder.hidden(this);
                    break;
            }
            var wrapper = element.childNodes[1];
            var rs;
            if (cell.inserted) {
                rs = { inserted: cell.inserted, element: element };
                wrapper.appendChild(cell.element);
            }
            else {
                wrapper.appendChild(rs = cell);
            }
            return rs;
        };
        Field.prototype.get_permission = function () {
            var viewName = this.container.viewName || "";
            var perm = this.viewArea_permissions[viewName];
            if (perm === undefined)
                perm = this.permission;
            if (perm === undefined) {
                viewName = viewName.toLowerCase();
                if (viewName.indexOf("update") >= 0 || viewName.indexOf("edit") >= 0)
                    perm = Permissions.editable;
                else
                    perm = Permissions.readonly;
            }
            return Permissions[perm];
        };
        Field.prototype._resetDirectData = function () {
            var _this = this;
            this.directData = function () {
                var mappath = _this.mappath || _this.name;
                var paths = mappath.split(".");
                if (paths.length == 0) {
                    _this.directData = function () { return _this.container.get_data(); };
                }
                else {
                    var propname = paths.pop();
                    var code = "var data= this.container.get_data();\n";
                    var p = "data";
                    for (var i = 0, j = paths.length; i < j; i++) {
                        p += "." + paths[i];
                        code += "if(!" + p + ") " + p + "={};\n";
                    }
                    code += "return " + p + ";";
                    _this.directData = new Function(code);
                }
                return _this.directData();
            };
        };
        Field.prototype.validate = function (result) {
            var builder = this.get_builder();
            if (builder.validate)
                return builder.validate(this, result);
            if (!this.validations)
                return true;
            var hasError = false;
            var errors = result[this.name] || (result[this.name] = {});
            for (var n in this.validations) {
                var opts = this.validations[n];
                var validator = validations[n];
                if (!validator) {
                    Field.utils.warn("找不到验证函数" + n);
                    continue;
                }
                var error = validator(this, opts);
                if (error) {
                    errors[n] = error;
                    hasError = true;
                }
            }
            return hasError;
        };
        Field.getViewBuilder = function (viewType) {
            var gbuilder = Field.viewBuilders[viewType || "text"] || Field.viewBuilders["text"];
            if (!gbuilder.editable || !gbuilder.readonly || !gbuilder.hidden || !gbuilder.getViewValue || !gbuilder.setViewValue) {
                if (gbuilder.extend) {
                    var ebuilder = Field.getViewBuilder(gbuilder.extend);
                    if (!ebuilder)
                        throw new Error("无法获取到FieldViewBuilder{viewType=" + gbuilder.extend + "}.如果要使用，请先注册。");
                    if (!ebuilder.editable || !gbuilder.readonly || !gbuilder.hidden || !gbuilder.getViewValue || !gbuilder.setViewValue) {
                        throw new Error("FieldViewBuilder{viewType=" + gbuilder.extend + "}不完整.请注册editable,readonly,hidden,getViewValue,setViewValue;或extend一个完整的FieldViewBuilder");
                    }
                }
                else {
                    throw new Error("FieldViewBuilder{viewType=" + viewType + "}不完整.请注册editable,readonly,hidden,getViewValue,setViewValue;或extend一个完整的FieldViewBuilder");
                }
            }
            return gbuilder;
        };
        Field.validations = {};
        Field.viewBuilders = {};
        return Field;
    }());
    Quic.Field = Field;
    function setOptsValue(dest, key, value, method) {
        if (method === void 0) { method = SetFieldOptsMethods.override; }
        var t = typeof value;
        if (method == SetFieldOptsMethods.override) {
            if (t === "object") {
                var d = dest[key] || (dest[key] = {});
                for (var m in value) {
                    setOptsValue(d, m, value[m], method);
                }
            }
            else {
                dest[key] = value;
            }
        }
        else if (method == SetFieldOptsMethods.ignore) {
            if (t === "object") {
                var d = dest[key] || (dest[key] = {});
                for (var m in value) {
                    setOptsValue(d, m, value[m], method);
                }
            }
            else {
                if (dest[key] === undefined)
                    dest[key] = value;
            }
        }
    }
    var viewBuilders = Field.viewBuilders;
    var textViewBuilder = {
        editable: function (field) {
            var elem = Field.utils.createElement("input");
            elem.type = "text";
            var value = field.get_value();
            elem.value = (value === undefined || value === null) ? "" : value;
            Field.utils.attach(elem, "blur", function () {
                field.set_value(elem.value);
            });
            return elem;
        },
        readonly: function (field) {
            var elem = Field.utils.createElement("span");
            var value = field.get_value();
            elem.innerHTML = (value === undefined || value === null) ? "" : value;
            return elem;
        },
        hidden: function (field) {
            var elem = Field.utils.createElement("input");
            elem.type = "hidden";
            var value = field.get_value();
            elem.value = (value === undefined || value === null) ? "" : value;
            return elem;
        },
        getViewValue: function (field) {
            if (field.element) {
                return field.element.tagName == "INPUT"
                    ? field.element.value
                    : field.element.innerHTML;
            }
        },
        setViewValue: function (field, value) {
            if (field.element) {
                if (field.element.tagName == "INPUT") {
                    field.element.value = value === undefined || value === null ? "" : value;
                }
                else {
                    field.element.innerHTML = value === undefined || value === null ? "" : value;
                }
            }
        }
    };
    var validations = Field.validations;
    validations.required = function (field, opts, _T) {
        var message = _T("required");
        if (!field)
            return message;
        var value = field.get_value();
        if (value && value.toString().replace(/(^\s+)|(\s+$)/g, ""))
            return "";
        return "required";
    };
    validations.length = function (field, opts, _T) {
        var message = "";
        if (field) {
            var value = field.get_value();
            if (value === undefined || value === null)
                value = "";
            else
                value = value.toString();
            if (opts.trim)
                value = value.replace(/(^\s+)|(\s+$)/g, "");
            var len = value.length;
            if (opts.min && len < opts.min) {
                if (!message)
                    message = _T("length should ");
                message += _T("more than ") + opts.min;
            }
            if (opts.max && len > opts.max) {
                if (!message)
                    message = _T("length should ");
                else
                    message += ",";
                message += _T("less than ") + opts.max;
            }
        }
        else {
            if (opts.min) {
                if (!message)
                    message = _T("length should ");
                message += _T("more than ") + opts.min;
            }
            if (opts.max) {
                if (!message)
                    message = _T("length should ");
                else
                    message += ",";
                message += _T("less than ") + opts.max;
            }
        }
        return message;
    };
})(Quic || (Quic = {}));
