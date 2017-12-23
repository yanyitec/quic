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
/// <reference path="quic.schema.ts" />
var Quic;
(function (Quic) {
    var Data;
    (function (Data) {
        var ExpressionTypes;
        (function (ExpressionTypes) {
            ExpressionTypes[ExpressionTypes["const"] = 0] = "const";
            ExpressionTypes[ExpressionTypes["computed"] = 1] = "computed";
            ExpressionTypes[ExpressionTypes["datapath"] = 2] = "datapath";
            ExpressionTypes[ExpressionTypes["mixed"] = 3] = "mixed";
        })(ExpressionTypes = Data.ExpressionTypes || (Data.ExpressionTypes = {}));
        var Expression = /** @class */ (function () {
            function Expression(type, text) {
                this.type = type;
                this.text = text;
            }
            Expression.parse = function (text) {
                var exprs = parseText(text);
                if (exprs.length == 1) {
                    var expr = exprs[0];
                    return expr.path ? expr.path : expr;
                }
                return new MixedExpression(text, exprs);
            };
            return Expression;
        }());
        Data.Expression = Expression;
        var ConstExpression = /** @class */ (function (_super) {
            __extends(ConstExpression, _super);
            function ConstExpression(constText) {
                var _this = _super.call(this, ExpressionTypes.const, constText) || this;
                _this.genAccess = function (root) {
                    var access = function (data) { return constText; };
                    access.type = _this.type;
                    access.text = constText;
                    access.expr = _this;
                    access.root = root;
                    //access.schema = new Schema("quic-schema-"+idNo(),root);
                    return access;
                };
                return _this;
            }
            return ConstExpression;
        }(Expression));
        var DataPathExpression = /** @class */ (function (_super) {
            __extends(DataPathExpression, _super);
            function DataPathExpression(text) {
                var _this = _super.call(this, ExpressionTypes.datapath, text) || this;
                _this.genAccess = function (root) {
                    var schema = root.define(text);
                    var access = function (data, value, evt) {
                        if (value === undefined) {
                            return schema.get_value(data, value === "quic:fill-default");
                        }
                        if (value === "quic:undefined") {
                            value = undefined;
                        }
                        schema.set_value(data, value, evt);
                        return this;
                    };
                    access.schema = schema;
                    access.type = _this.type;
                    access.text = text;
                    access.expr = _this;
                    access.root = root;
                    access.isDataPath = true;
                    return access;
                };
                return _this;
            }
            return DataPathExpression;
        }(Expression));
        Data.DataPathExpression = DataPathExpression;
        var ComputedExpression = /** @class */ (function (_super) {
            __extends(ComputedExpression, _super);
            function ComputedExpression(text) {
                var _this = _super.call(this, ExpressionTypes.computed, text) || this;
                var match;
                var path;
                while (match = pathRegx.exec(text)) {
                    path = match[0];
                    if (!_this.paths) {
                        _this.paths = [];
                    }
                    _this.paths.push(new DataPathExpression(path));
                }
                if (path && path.length === text.length - 3) {
                    _this.path = _this.paths[0];
                }
                var code = "try{\n\twith($__DATA__){\n\t\treturn " + text + "\t}\n}"
                    + "catch($__EXCEPTION__){\n\treturn $__EXCEPTION__;\n}\n";
                _this.genAccess = function (root) {
                    var access = _this.path ? _this.path.genAccess(root) : new Function("$__DATA__", code);
                    access.type = _this.type;
                    access.text = text;
                    access.expr = _this;
                    access.root = root;
                    if (_this.paths && !_this.path) {
                        var deps = [];
                        for (var i in _this.paths) {
                            var path_1 = _this.paths[i];
                            var dep = root.define(path_1.text);
                            deps.push(dep);
                        }
                        access.deps = deps;
                    }
                    return access;
                };
                return _this;
            }
            return ComputedExpression;
        }(Expression));
        Data.ComputedExpression = ComputedExpression;
        var MixedExpression = /** @class */ (function (_super) {
            __extends(MixedExpression, _super);
            function MixedExpression(text, exprs) {
                var _this = _super.call(this, ExpressionTypes.mixed, text) || this;
                _this.exprs = exprs;
                if (exprs.length === 1) {
                    _this.expr = exprs[0];
                }
                _this.genAccess = function (root) {
                    var access;
                    if (_this.expr) {
                        access = _this.expr.genAccess(root);
                    }
                    else {
                        access = makeMixedAccess(_this, root);
                    }
                    access.type = _this.type;
                    access.text = text;
                    access.expr = _this;
                    access.root = root;
                    return access;
                };
                return _this;
            }
            return MixedExpression;
        }(Expression));
        Data.MixedExpression = MixedExpression;
        function makeMixedAccess(expr, root) {
            var _this = this;
            var accesses = [];
            var deps = [];
            for (var i in expr.exprs) {
                var access_1 = expr.exprs[i].genAccess(root);
                accesses.push(access_1);
                var subdeps = access_1.deps;
                if (subdeps) {
                    for (var m in subdeps) {
                        var subdep = subdeps[m];
                        for (var v in deps) {
                            if (deps[v] === subdep) {
                                subdep = null;
                            }
                        }
                        if (subdep) {
                            deps.push(subdep);
                        }
                    }
                }
            }
            var access = function (data, value, evt) {
                if (value === undefined) {
                    var rs = [];
                    for (var i in accesses) {
                        rs.push(accesses[i].call(_this, data));
                    }
                    return rs.join("");
                }
                for (var i in accesses) {
                    accesses[i].call(_this, data, value, evt);
                }
                return _this;
            };
            access.deps = deps;
            return access;
        }
        var InvalidExpression = /** @class */ (function (_super) {
            __extends(InvalidExpression, _super);
            function InvalidExpression(message, text, at, lineAt, offset) {
                var _this = _super.call(this, message + ":" + text) || this;
                _this.message = message;
                _this.expression = text;
                _this.line = lineAt;
                _this.offset = offset;
                return _this;
            }
            return InvalidExpression;
        }(Error));
        function parseText(text) {
            var lastToken = "}";
            var lastTokenAt = -1;
            var branceCount = 0;
            var line = 1;
            var offset = 0;
            var inString = undefined;
            var exprs = [];
            for (var at = 0, len = text.length; at < len; at++) {
                var char = text[at];
                offset++;
                if (char === "$") {
                    //在字符串中间的跳过,在computed表达式中间的跳过
                    if (inString || lastToken === "{") {
                        continue;
                    }
                    lastToken = char;
                    lastTokenAt = at;
                }
                else if (char === "{") {
                    //在字符串中间，跳过
                    if (inString) {
                        continue;
                    }
                    if (lastToken === "}") {
                        exprs.push(new ConstExpression(text.substring(lastTokenAt + 1, at - 1)));
                        lastTokenAt = at;
                        continue;
                    }
                    //${ }开始
                    if (lastToken === "$" && lastTokenAt === at - 1) {
                        lastToken = "{";
                        lastTokenAt = at;
                        continue;
                    }
                    //computed中间的{,计算个数，等待结束标记
                    if (lastToken === "{") {
                        branceCount++;
                        continue;
                    }
                }
                else if (char === "}") {
                    //在字符串中间，跳过
                    if (inString) {
                        continue;
                    }
                    if (lastToken === "{") {
                        if (branceCount === 0) {
                            exprs.push(new ComputedExpression(text.substring(lastTokenAt + 1, at - 1)));
                            lastToken = "}";
                            lastTokenAt = at;
                            continue;
                        }
                        else {
                            if (--branceCount < 0) {
                                throw new InvalidExpression("} has no matched {", text, at, line, offset);
                            }
                        }
                    }
                }
                else if (char === "'") {
                    if (inString === '"') {
                        continue;
                    }
                    if (inString === "'") {
                        if (text[at - 1] === "\\") {
                            continue;
                        }
                        else {
                            inString = undefined;
                            continue;
                        }
                    }
                    if (lastToken === "{") {
                        inString = "'";
                        continue;
                    }
                }
                else if (char === '"') {
                    if (inString === "'") {
                        continue;
                    }
                    if (inString === '"') {
                        if (text[at - 1] === "\\") {
                            continue;
                        }
                        else {
                            inString = undefined;
                            continue;
                        }
                    }
                    if (lastToken === "{") {
                        inString = '"';
                        continue;
                    }
                }
                else if (char === "\n") {
                    line++;
                    offset = 0;
                }
            }
            if (branceCount > 0) {
                throw new InvalidExpression("expect } before END", text, text.length, line, offset);
            }
            if (lastTokenAt < text.length - 1) {
                exprs.push(new ConstExpression(text.substring(lastTokenAt + 1)));
            }
            return exprs;
        }
        var computedRegx = /\$\{[^\}]+\}/g;
        var arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
        var propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
        var regt = "(?:" + arrSectionRegt + "|" + propSectionRegt + ")(?:" + arrSectionRegt + "|(?:." + propSectionRegt + "))*";
        var regex = new RegExp(regt, "g");
        var pathRegx = new RegExp(regt, "g");
    })(Data = Quic.Data || (Quic.Data = {}));
})(Quic || (Quic = {}));
exports.Expression = Quic.Data.Expression;
