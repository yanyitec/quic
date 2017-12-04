var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Quic;
(function (Quic) {
})(Quic || (Quic = {}));
var Quic;
(function (Quic) {
    var async_funcs;
    function async(func) {
        if (!async_funcs) {
            async_funcs = [];
            setTimeout(function () {
                var funcs = async_funcs;
                async_funcs = undefined;
                for (var i = 0, j = funcs.length; i < j; i++)
                    funcs.shift()();
            }, 0);
        }
        async_funcs.push(func);
        return;
    }
    Quic.async = async;
    var Promise = /** @class */ (function () {
        function Promise(async_func) {
            var _this = this;
            var resolve = function (result) {
                if (result instanceof Promise) {
                    result.then(function (result) {
                        if (_this.__done_handlers__)
                            for (var i = 0, j = _this.__done_handlers__.length; i < j; i++)
                                _this.__done_handlers__.shift().call(_this, result);
                        _this.then = function (done, error) { if (done)
                            done.call(_this, result); return _this; };
                        _this.done = function (done) { if (done)
                            done.call(_this, result); return _this; };
                        _this.reject = function (reject) { return _this; };
                    }, function (err) {
                        if (_this.__error_handlers__)
                            for (var i = 0, j = _this.__error_handlers__.length; i < j; i++)
                                _this.__error_handlers__.shift().call(_this, err);
                        _this.then = function (done, error) { if (error)
                            error.call(_this, err); return _this; };
                        _this.reject = function (reject) { if (reject)
                            reject.call(_this, err); return _this; };
                        _this.done = function (done) { return _this; };
                    });
                    return _this;
                }
                else {
                    _this.then = function (done, error) { if (done)
                        done.call(_this, result); return _this; };
                    _this.done = function (done) { if (done)
                        done.call(_this, result); return _this; };
                    _this.reject = function (reject) { return _this; };
                    return _this;
                }
            };
            var reject = function (err) {
                if (_this.__error_handlers__)
                    for (var i = 0, j = _this.__error_handlers__.length; i < j; i++)
                        _this.__error_handlers__.shift().call(_this, err);
                _this.then = function (done, error) { if (error)
                    error.call(_this, err); return _this; };
                _this.reject = function (reject) { if (reject)
                    reject.call(_this, err); return _this; };
                _this.done = function (done) { return _this; };
                return _this;
            };
            if (async_func) {
                async(function () {
                    try {
                        async_func.call(_this, resolve, reject);
                    }
                    catch (ex) {
                    }
                });
            }
            else {
                this.resolve = resolve;
                this.reject = reject;
            }
        }
        Promise.prototype.then = function (done, error) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            if (error) {
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
            }
            return this;
        };
        Promise.prototype.done = function (done) {
            if (done) {
                (this.__done_handlers__ || (this.__done_handlers__ = [])).push(done);
            }
            return this;
        };
        Promise.prototype.error = function (error) {
            if (error) {
                (this.__error_handlers__ || (this.__error_handlers__ = [])).push(error);
            }
            return this;
        };
        return Promise;
    }());
    Quic.Promise = Promise;
    function when() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            var _this = this;
            var count = args.length + 1;
            var results = [];
            var error_index;
            var loop = function (async_func, index) {
                try {
                    async_func.call(_this, function (result) {
                        if (error_index === undefined) {
                            results[index] = result;
                            if (--count === 0)
                                resolve.apply(_this, results);
                        }
                    }, function (err) {
                        if (error_index === undefined) {
                            error_index = index;
                            reject.call(_this, err, index);
                        }
                    });
                    return true;
                }
                catch (ex) {
                    if (error_index === undefined) {
                        error_index = index;
                        reject.call(_this, ex, index);
                    }
                    return false;
                }
            };
            for (var i = 0, j = args.length; i < j; i++) {
                if (loop.call(this, args[i], i) === false)
                    break;
            }
        });
    }
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.promise.ts" />
var Quic;
(function (Quic) {
    var HttpRequest = /** @class */ (function (_super) {
        __extends(HttpRequest, _super);
        function HttpRequest(opts) {
            var _this = _super.call(this) || this;
            _this.opts = opts;
            var xhr = _this.xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    var dataType = opts.dataType || "";
                    if (dataType === "xml") {
                        _this.resolve(xhr.responseXML);
                        return;
                    }
                    else if (dataType === "json") {
                        var json = void 0;
                        try {
                            json = JSON.parse(xhr.responseText);
                        }
                        catch (ex) {
                            _this.reject(ex);
                            return;
                        }
                        _this.resolve(json);
                        return;
                    }
                    _this.resolve(xhr.responseText);
                    return;
                }
            };
            var data = opts.data;
            var url = opts.url;
            var method = opts.method ? opts.method.toString().toUpperCase() : "GET";
            var type = opts.type;
            if (method === "GET") {
                if (typeof data === "object") {
                    url += url.indexOf("?") >= 0 ? "&" : "?";
                    for (var n in data) {
                        url += encodeURIComponent(n);
                        url += "=";
                        var v = data[n];
                        url += encodeURIComponent(v === undefined || v === null ? "" : v.toString());
                        url += "&";
                    }
                }
                data = undefined;
            }
            else {
                if (typeof data === "object") {
                    if (type === "json") {
                        data = JSON.stringify(data);
                    }
                    else if (type === "xml") {
                        throw new Error("Not implement");
                    }
                    else {
                        var encoded = "";
                        for (var n in data) {
                            if (encoded)
                                encoded += "&";
                            encoded += encodeURIComponent(n);
                            encoded += "=";
                            var v = data[n];
                            encoded += encodeURIComponent(v === undefined || v === null ? "" : v.toString());
                        }
                        data = encoded;
                    }
                }
            } //end if
            var contentType = contentTypes[type];
            if (contentType)
                xhr.setRequestHeader("Content-Type", contentType);
            var headers = opts.headers;
            if (headers) {
                for (var n in headers)
                    xhr.setRequestHeader(n, headers[n]);
            }
            xhr.open(method, url, opts.sync);
            xhr.send(data);
            return _this;
        } //end constructor
        return HttpRequest;
    }(Quic.Promise));
    Quic.HttpRequest = HttpRequest;
    var contentTypes = HttpRequest.contentTypes = {
        "json": "application/json",
        "xml": "application/xml",
        "html": "application/html",
        "text": "application/text"
    };
    function ajax(opts) { return new HttpRequest(opts); }
    Quic.ajax = ajax;
})(Quic || (Quic = {}));
var Quic;
(function (Quic) {
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
var Quic;
(function (Quic) {
})(Quic || (Quic = {}));
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
    Quic.arrRegx = /(?:\[\d+\])+$/g;
    Quic.trimRegx = /(^\s+)|(\s+$)/g;
    Quic.urlRegx = /^\s*(ht|f)tp(s?)\:\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-\.\?\,\'\/\\\+&amp;%\$#_]*)?/g;
    Quic.emailRegx = /^\s*[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?\s*$/g;
    Quic.intRegx = /(^[+\-]?\d+$)|(^[+\-]?\d{1,3}(,\d{3})?$)/;
    Quic.decimalRegx = /^((?:[+\-]?\d+)|(?:[+\-]?\d{1,3}(?:\d{3})?))(.\d+)?$/;
    Quic.trim = function (o) { return o === null || o === undefined ? "" : o.toString().replace(Quic.trimRegx, ""); };
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
    var AccessFactory = /** @class */ (function () {
        function AccessFactory() {
            this.caches = {};
            this.create = AccessFactory.create;
        }
        AccessFactory.prototype.cached = function (dataPath) {
            var accessor = this.caches[dataPath];
            if (!accessor) {
                accessor = this.caches[dataPath] = AccessFactory.create(dataPath);
            }
            return accessor;
        };
        AccessFactory.cached = function (dataPath) {
            return AccessFactory.instance.cached(dataPath);
        };
        AccessFactory.create = function (dataPath) {
            if (dataPath == "$") {
                return function (data, value) {
                    if (value === undefined)
                        return data;
                    throw new Error("setting cannot apply for datapath[$]");
                };
            }
            var paths = dataPath.split(".");
            var last_propname = paths.shift().replace(Quic.trimRegx, "");
            if (!last_propname)
                throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
            var codes = {
                path: "data",
                getter_code: "",
                setter_code: ""
            };
            for (var i = 0, j = paths.length; i < j; i++) {
                var propname = paths[i].replace(Quic.trimRegx, "");
                buildPropCodes(propname, dataPath, codes);
            }
            buildPropCodes(last_propname, dataPath, codes, true);
            var code = "if(!data) throw new Error(\"cannot get/set value on undefined/null/0/''\"); \n";
            code += "var at;\nif(value===undefined){\n" + codes.getter_code + "\treturn data;\n}else{\n" + codes.setter_code + "\n}\n";
            return new Function("data", code);
        };
        AccessFactory.instance = new AccessFactory();
        return AccessFactory;
    }());
    Quic.AccessFactory = AccessFactory;
    function buildPropCodes(propname, dataPath, codes, isLast) {
        if (!propname)
            throw new Error("invalid dataPath 不正确的dataPath:" + dataPath);
        var match = Quic.arrRegx.exec(propname);
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
    function str_replace(text, data, accessorFactory) {
        if (text === null || text === undefined)
            text = "";
        else
            text = text.toString();
        //if(!data){ return text;}
        var regx = /\{([a-zA-Z\$_0-9\[\].]+)\}/g;
        accessorFactory || (accessorFactory = AccessFactory.instance);
        return text.replace(regx, function (m) {
            var accessor;
            var expr = m[1];
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
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    var ViewCSS = /** @class */ (function () {
        function ViewCSS(viewOpts) {
            var _this = this;
            this.visible = function () {
                var css = _this.base + " field-visible";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.visible = function () { return css; };
                return css;
            };
            this.hidden = function () {
                var css = _this.base + " field-hidden";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.hidden = function () { return css; };
                return css;
            };
            this.readonly = function () {
                var css = _this.base + " field-readonly";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.readonly = function () { return css; };
                return css;
            };
            this.editable = function () {
                var css = _this.base + " field-editable";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.editable = function () { return css; };
                return css;
            };
            this.validatable = function () {
                var css = _this.base + " field-validatable";
                if (_this.raw)
                    css += " " + _this.raw;
                _this.editable = function () { return css; };
                return css;
            };
            this.toString = function () { return _this.base; };
            this.raw = viewOpts.css;
            this.base = viewOpts.viewType + " " + (viewOpts.icon ? viewOpts.icon + " " : "") + viewOpts.name;
        }
        ViewCSS.prototype.css = function (permission) {
            var _me = this;
            var fn = _me[permission];
            return fn ? fn.call(this) : this.general();
        };
        ;
        ViewCSS.prototype.general = function () {
            var css = this.raw ? this.base + " " + this.raw : this.base;
            this.general = function () { return css; };
            return css;
        };
        return ViewCSS;
    }());
    Quic.ViewCSS = ViewCSS;
    var View = /** @class */ (function () {
        function View(module, composition, field, opts_) {
            var opts = opts_;
            this.opts = opts;
            this.name = opts.name ? opts.name.replace(Quic.trimRegx, "") : undefined;
            if (!this.name && field)
                this.name = field.name;
            if (!this.name)
                Quic.env.throw("name is required", "view.constructor", opts);
            this.composition = composition;
            //viewType && viewBuilder
            this.viewType = opts.viewType ? opts.viewType.replace(Quic.trimRegx, "") : undefined;
            if (field) {
                if (!this.viewType)
                    this.viewType = field.viewType;
                if (this.viewType === field.viewType)
                    this.renderer = field.renderer;
            }
            if (!this.renderer)
                this.renderer = module.findRenderer(this.viewType);
            if (!this.renderer)
                return Quic.env.throw("Invalid viewType", this.viewType);
            // css
            this.css = opts.css ? opts.css.replace(Quic.trimRegx, "") : undefined;
            if (field && (!this.css || this.css === field.css))
                this.CSS = field.CSS;
            else
                this.CSS = new ViewCSS(this);
            //permission
            this.permission = opts.permission || (field && field.permission) || (composition && composition.permission) || "validatable";
            this.position = opts.position || (field && field.position) || (composition && composition.position);
            this.nolabel = opts.nolabel || (field && field.nolabel);
            // mappath
            this.mappath = opts.mappath ? opts.mappath.replace(Quic.trimRegx, "") : undefined;
            if (field && (!this.mappath || this.mappath === field.mappath))
                this.mappedValue = field.mappedValue;
            else
                this.mappedValue = module.accessFactory.cached(this.mappath);
        }
        View.prototype.viewValue = function (value) {
            if (value === undefined)
                return this.renderer.getValue(this);
            this.renderer.setValue(this, value);
            return this;
        };
        View.prototype.element = function () {
            if (this._element)
                return this._element;
            var creator = this.renderer[this.permission];
            if (!creator)
                throw new Error("Invalid permission value:" + this.permission);
            creator(this);
        };
        return View;
    }());
    Quic.View = View;
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.view.ts" />
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
            this.renderer = this.fieldset.module.findRenderer(viewType);
            if (!this.renderer)
                return Quic.env.throw("Invalid viewType", viewType);
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
                    Quic.env.warn("unregistered validation type:" + validType);
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
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    var Fieldset = /** @class */ (function () {
        function Fieldset(module, opts) {
            this.defs = this.defs = opts;
            this.module = module;
            this.accessFactory = module.accessFactory;
            var fields = this.fields = {};
            for (var n in opts.fields) {
                var fieldDefs = opts.fields[n];
                if (!fieldDefs.name)
                    fieldDefs.name = n;
                fields[fieldDefs.name] = new Quic.Field(this, fieldDefs);
            }
        }
        //多语言文本处理
        Fieldset.prototype._T = function (text, mustReturn) {
            return;
            /*
            let txt = this.langs[text];
            if(txt===undefined) {
                if(this.localization) txt = this.localization._T(text,mustReturn);
            }
            if(txt===undefined && this.langs!==langs) txt = langs[text];
            return (txt===null || txt===undefined) && mustReturn===true?"":(text===null|| text===undefined?"":text.toString());
            */
        };
        Fieldset.prototype.fieldValue = function (fieldOpts, fieldElement, data, value) {
            /*
            let field :Field;
            let accessor :(data:{[index:string]:any},value?:any)=>any;;
            if(fieldOpts.mappath&& fieldOpts.mappath!==field.name){
                accessor = this.accessorFactory.cached(fieldOpts.mappath);
            }
            if(value===undefined){
                if(!fieldElement){
                    //从data取值
                    return data?(accessor?accessor(data):data[fieldOpts.name]):undefined;
                }else {
                    //从element中获取
                    value = field.viewRenderer.getValue(field);
                    if(data){
                        if(accessor) accessor(data,value); else data[fieldOpts.name] = value;
                    }
                    return value;
                }
            }else {
                if(fieldElement) field.viewRenderer.setValue(field,value);
                if(data) {if(accessor) accessor(data,value); else data[fieldOpts.name] = value;}
                return this;
            }*/
        };
        return Fieldset;
    }());
    Quic.Fieldset = Fieldset;
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    var Module = /** @class */ (function () {
        function Module() {
            this._readies = [];
        }
        Module.prototype._T = function (key, mustReturn) {
            var text;
            if (this.langs)
                text = this.langs[key];
            if (text === undefined)
                text = Quic.langs[key];
            if (text === undefined && mustReturn === true)
                key;
            return text;
        };
        Module.prototype.ready = function (handler) {
            this._readies.push(handler);
        };
        Module.prototype.init = function (opts) {
            var _this = this;
            for (var i = 0, j = this._readies.length; i < j; i++) {
                this._readies[i](this);
            }
            this._readies = undefined;
            this.ready = function (handler) {
                handler(_this);
            };
        };
        /**
         * 获取事件监听器
         *
         * @param {string} evtName 事件名
         * @param {string} [viewname] 视图名，默认为viewset的
         * @returns {*}
         * @memberof IModule
         */
        Module.prototype.getEventListener = function (evtName, viewname) {
        };
        /**
         * 根据permission获取呈现器
         *
         * @param {string} viewType
         * @returns {IRenderer}
         * @memberof IModule
         */
        Module.prototype.findRenderer = function (viewType) {
            var result;
            return this.renderers[viewType] || Quic.renderers[viewType];
        };
        return Module;
    }());
    Quic.Module = Module;
    Quic.cached_modules = {};
    var loadModule = function (name, comlete) {
        var module = Quic.cached_modules[name];
        if (!module)
            module = Quic.cached_modules[name] = new Module();
        module.ready(comlete);
        return module;
    };
})(Quic || (Quic = {}));
var Quic;
(function (Quic) {
    var CompositeView = /** @class */ (function (_super) {
        __extends(CompositeView, _super);
        function CompositeView(module, pomposition, field, opts) {
            var _this = _super.call(this, module, pomposition, field, opts) || this;
            _this.components = {};
            return _this;
        }
        CompositeView.prototype.close = function () {
            throw "Not implement";
        };
        CompositeView.prototype.dispose = function () {
            this.close();
        };
        return CompositeView;
    }(Quic.View));
    Quic.CompositeView = CompositeView;
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
/// <reference path="quic.fieldset.ts" />
/// <reference path="quic.view-composition.ts" />
var Quic;
(function (Quic) {
    var FieldsetView = /** @class */ (function (_super) {
        __extends(FieldsetView, _super);
        function FieldsetView(module, pomposition, field, opts) {
            return _super.call(this, module, pomposition, field, opts) || this;
        }
        return FieldsetView;
    }(Quic.CompositeView));
    Quic.FieldsetView = FieldsetView;
    function parseFieldOptsSet(includeExpr, excludes, defaultPermssion) {
        var destFieldOptsSet = this.fields = {};
        var includes;
        //id，base[name:readonly,password:editable],gender:hidden
        includes = {};
        var groupname;
        var groupCount = 0;
        var includeExprs = includeExpr.split(",");
        for (var i = 0, j = includeExprs.length; i < j; i++) {
            var expr = includeExprs[i].replace(Quic.trimRegx, "");
            var name_1 = void 0;
            var permission = void 0;
            if (!expr)
                continue;
            var at = expr.indexOf("[");
            var startAt = 0;
            if (at >= 0) {
                if (groupname !== undefined)
                    throw new Error("invalid includes expression:" + includeExpr + ". meet[, but the previous [ is not close. lack of ]?");
                groupname = expr.substr(0, at);
                startAt = at + 1;
                groupCount++;
            }
            else
                at = 0;
            at = expr.indexOf(":", startAt);
            if (at >= 0) {
                name_1 = expr.substr(0, at).replace(Quic.trimRegx, "");
                permission = expr.substr(at + 1).replace(Quic.trimRegx, "");
                if (!permission)
                    throw new Error("invalid includes expression:" + includeExpr + ". meet :, but permission is empty.");
                ;
            }
            else
                name_1 = expr.substr(startAt).replace(Quic.trimRegx, "");
            var endGroup = false;
            if (name_1[name_1.length - 1] === "]") {
                if (!groupname)
                    throw new Error("invalid includes expression:" + includeExpr + ". meet ], but not matched [. lack of [?");
                ;
                endGroup = true;
                name_1 = name_1.substr(0, name_1.length - 1);
            }
            if (!name_1)
                throw new Error("invalid includes expression:" + includeExpr + ". Some name is empty.");
            if (excludes && Quic.array_index(excludes, name_1) >= 0)
                continue;
            var fieldOpts = { name: name_1 };
            fieldOpts.permission = permission || defaultPermssion;
            if (groupname !== undefined) {
                if (groupname == "")
                    groupname = ' ' + groupCount;
                fieldOpts.group = groupname;
            }
            destFieldOptsSet[name_1] = fieldOpts;
        }
        return destFieldOptsSet;
    }
    Quic.parseFieldOptsSet = parseFieldOptsSet;
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
/// <reference path="quic.fieldset.ts" />
/// <reference path="quic.view-fieldset.ts" />
var Quic;
(function (Quic) {
    function createForm(view) {
        var permission = view.permission;
        var module = view.module;
        var formSection = createSection(view.text || module._T(view.name), module);
        formSection.element.className = "quic-form " + view.CSS.css(permission);
        var views = view.components;
        var groupname;
        var section = formSection;
        for (var name_2 in views) {
            var fieldview = views[name_2];
            //找到容器
            if (fieldview.group) {
                if (fieldview.group != groupname) {
                    groupname = fieldview.group;
                    section = createSection(groupname || module._T(groupname), module);
                    formSection.body.appendChild(section.element);
                }
                //else 保持原先的容器不变
            }
            else {
                section = formSection;
            }
            var containerElement = section[fieldview.position];
            if (!containerElement)
                containerElement = section.body;
            //创建元素
            var fieldElement = createFieldElement(fieldview, view, module);
            var cssor = fieldview.CSS[fieldview.permission];
            if (!cssor)
                Quic.env.throw("Invalid permission value", permission);
            fieldElement.className = "quic-field " + cssor.call(cssor);
            containerElement.appendChild(fieldElement);
        }
        return formSection.element;
        //var includes = view.includes || view.fieldset. 
    }
    function createSection(title, module) {
        var result = {};
        var groupElement = Quic.dom.createElement("div");
        result.element = groupElement;
        var headerArea = Quic.dom.createElement("div");
        headerArea.className = "quic-header";
        groupElement.appendChild(headerArea);
        result.header = headerArea;
        var bodyArea = Quic.dom.createElement("div");
        bodyArea.className = "quic-body";
        groupElement.appendChild(bodyArea);
        result.body = bodyArea;
        var footerArea = Quic.dom.createElement("div");
        footerArea.className = "quic-footer";
        groupElement.appendChild(footerArea);
        result.footer = footerArea;
        var headerTitle = Quic.dom.createElement("h3");
        headerTitle.className = "quic-title quic-header-title";
        headerTitle.innerHTML = title;
        headerArea.appendChild(headerTitle);
        result.header_title = headerTitle;
        var headerActions = Quic.dom.createElement("div");
        headerActions.className = "quic-actions quic-header-actions";
        headerArea.appendChild(headerActions);
        result.header_actions = headerActions;
        var footerStatus = Quic.dom.createElement("div");
        footerStatus.className = "quic-status quic-footer-status";
        footerArea.appendChild(footerStatus);
        result.footer_status = footerStatus;
        var footerActions = Quic.dom.createElement("div");
        footerActions.className = "quic-actions quic-footer-actions";
        footerArea.appendChild(footerActions);
        result.footer_actions = footerActions;
        return result;
    }
    function createFieldElement(view, viewset, module) {
        var _this = this;
        var field = view.field;
        var permission = view.permission;
        var render = this[permission];
        if (!render)
            throw new Error("Invalid permission value:" + permission);
        var input = render(view);
        if (view.nolabel)
            return input;
        var element = Quic.dom.createElement("div");
        if (permission === "hidden")
            element.style.display = "none";
        var id = "quic_input_" + Quic.nextGNo();
        var text = this.text || module._T(this.text) || module._T(this.name);
        var required = (permission === "validatable" && field.validationRule("required")) ? "<ins class='quic-field-required'>*</ins>" : "";
        element.innerHTML = "<label class=\"quic-field-caption\" for=\"" + id + "\">" + text + required + "</label>";
        var forcusElement = input["quic-label-focus-element"] || input;
        forcusElement.id = id;
        element.appendChild(input);
        var validInfos = field.validationTips();
        if (permission === "validatable" && validInfos) {
            var info = document.createElement("label");
            info.for = id;
            info.className = "quic-field-valid-tips";
            element.appendChild(info);
            var validTick_1;
            var ul = Quic.dom.createElement("ul");
            ul.className = "quic-validation-tips";
            for (var n in validInfos) {
                var li = Quic.dom.createElement("li");
                li.name = n;
                li.innerHTML = validInfos[n];
                ul.appendChild(li);
            }
            element["quic-validation-tips"] = ul;
            var valid = function () {
                if (validTick_1)
                    clearTimeout(validTick_1);
                validTick_1 = 0;
                _this.viewValidate(input);
            };
            var delayValid = function () {
                if (validTick_1)
                    clearTimeout(validTick_1);
                validTick_1 = setTimeout(function () {
                    if (validTick_1)
                        clearTimeout(validTick_1);
                    validTick_1 = 0;
                    _this.viewValidate(input);
                }, 200);
            };
            Quic.dom.attach(forcusElement, "keydown", delayValid);
            Quic.dom.attach(forcusElement, "keyup", delayValid);
            Quic.dom.attach(forcusElement, "change", valid);
            Quic.dom.attach(forcusElement, "blur", valid);
        }
        return element;
    }
    Quic.createFieldElement = createFieldElement;
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
/// <reference path="quic.view.ts" />
/// <reference path="quic.field.ts" />
var Quic;
(function (Quic) {
    Quic.renderers = {};
    var TextRenderer = /** @class */ (function () {
        function TextRenderer() {
        }
        //只是可见，没有input元素跟着
        TextRenderer.prototype.visible = function (view) {
            var element = Quic.dom.createElement("span");
            //element.innerHTML = value===undefined||value===null?"":value;
            return element;
        };
        //隐藏，但是有input元素
        TextRenderer.prototype.hidden = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "hidden";
            element.name = view.name;
            return element;
        };
        //只读，不能修改，但是有input元素
        TextRenderer.prototype.readonly = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "text";
            element.readOnly = true;
            element.name = view.name;
            return element;
        };
        // 可编辑
        TextRenderer.prototype.editable = function (view) {
            var element = Quic.dom.createElement("input");
            element.type = "text";
            element.name = view.name;
            return element;
        };
        // 设置View的值，并让view反映该值。
        TextRenderer.prototype.setValue = function (view, value) {
            var element = view.element();
            value = value === undefined || value === null ? "" : value.toString();
            if (element.tagName === "INPUT") {
                element.value = value;
            }
            else if (view.permission === "visible") {
                element.firstChild.innerHTML = value;
            }
            else {
                element.firstChild.innerHTML = element.lastChild.value = value;
            }
        };
        // 获取到该view上的值。
        TextRenderer.prototype.getValue = function (view) {
            var element = view.element();
            if (element.tagName === "INPUT") {
                return element.value;
            }
            else if (view.permission === "visible") {
                return element.firstChild.innerHTML;
            }
            else {
                return element.lastChild.value;
            }
        };
        return TextRenderer;
    }());
    Quic.TextRenderer = TextRenderer;
    ;
    Quic.renderers.text = Quic.renderers.number = Quic.renderers.int = Quic.renderers.string = new TextRenderer();
    var TextareaRenderer = /** @class */ (function (_super) {
        __extends(TextareaRenderer, _super);
        function TextareaRenderer() {
            var _this = _super.call(this) || this;
            _this.editable = function (view) {
                var element = Quic.dom.createElement("textarea");
                element.name = view.name;
                return element;
            };
            _this.readonly = function (view) {
                var element = Quic.dom.createElement("textarea");
                element.name = view.name;
                element.readOnly = true;
                return element;
            };
            return _this;
        }
        return TextareaRenderer;
    }(TextRenderer));
    Quic.renderers.textarea = new TextareaRenderer();
})(Quic || (Quic = {}));
/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    var FieldView = /** @class */ (function (_super) {
        __extends(FieldView, _super);
        function FieldView(module, composition, field, opts) {
            var _this = this;
            if (!field)
                Quic.env.throw("field is required", "FieldView.constructor");
            _this = _super.call(this, module, composition, field, opts) || this;
            return _this;
        }
        return FieldView;
    }(Quic.View));
    Quic.FieldView = FieldView;
})(Quic || (Quic = {}));
