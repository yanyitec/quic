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
    var Models;
    (function (Models) {
        var ExpressionTypes;
        (function (ExpressionTypes) {
            ExpressionTypes[ExpressionTypes["const"] = 0] = "const";
            ExpressionTypes[ExpressionTypes["computed"] = 1] = "computed";
            ExpressionTypes[ExpressionTypes["datapath"] = 2] = "datapath";
            ExpressionTypes[ExpressionTypes["mixed"] = 3] = "mixed";
        })(ExpressionTypes = Models.ExpressionTypes || (Models.ExpressionTypes = {}));
        var Expression = /** @class */ (function () {
            function Expression(type, text) {
                this.type = type;
                this.text = text;
            }
            Expression.parse = function (text) {
                var exprs = new Models.ExpressionParser(text).exprs;
                if (exprs.length == 1) {
                    var expr = exprs[0];
                    return expr.path ? expr.path : expr;
                }
                return new MixedExpression(text, exprs);
            };
            return Expression;
        }());
        Models.Expression = Expression;
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
                            //return schema.get_value(data,value==="quic:fill-default");
                        }
                        if (value === "quic:undefined") {
                            value = undefined;
                        }
                        //schema.set_value(data,value,evt);
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
        Models.DataPathExpression = DataPathExpression;
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
        Models.ComputedExpression = ComputedExpression;
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
        Models.MixedExpression = MixedExpression;
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
                        var part = accesses[i].call(_this, data);
                        if (part !== undefined && part !== null)
                            rs.push(part);
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
        function expressionReader(text, parser) {
            var offset;
            var line;
            var handler;
            for (var at = 0, len = text.length; at < len; at++) {
                var char = text[at];
                offset++;
                if (char === "\n") {
                    if (this.inString)
                        throw new InvalidExpression("Carrage cannot be in string", text, at, line, offset);
                    line++;
                    offset = 0;
                }
                handler = parser[char];
                if (handler) {
                    if (handler.call(parser, text, at, line, offset)) {
                        parser.lastToken = char;
                        parser.lastTokenAt = at;
                    }
                }
            }
            handler = parser[""];
            if (handler) {
                handler.call(parser, text, text.length, line, offset);
            }
        }
        Models.expressionReader = expressionReader;
        var expressionParser = {
            "$": function (text, at, line, offset) {
                //在字符串中间的跳过,在computed表达式中间的跳过
                if (this.inString || this.inComputed) {
                    return;
                }
                if (text[at + 1] === "{") {
                    this.exprs.push(new ConstExpression(text.substring(this.lastTokenAt + 1, at)));
                    return true;
                }
            },
            "{": function (text, at, line, offset) {
                //在字符串中间/在表达式中间，跳过
                if (this.inString) {
                    return;
                }
                if (this.inComputed) {
                    this.braceCount++;
                    return;
                }
                if (this.lastToken === "$" && this.lastTokenAt === at - 1) {
                    this.inComputed = true;
                    this.branceCount = 1;
                    return true;
                }
            },
            "}": function (text, at, line, offset) {
                //在字符串中间/在表达式中间，跳过
                if (this.inString) {
                    return;
                }
                if (this.inComputed) {
                    if (--this.braceCount == 0) {
                        this.exprs.push(new ComputedExpression(text.substring(this.lastTokenAt + 1, at)));
                        this.inComputed = false;
                        return true;
                    }
                }
            },
            "'": function (text, at, line, offset) {
                if (this.inString === '"') {
                    return;
                }
                if (this.inString === "'") {
                    if (text[at - 1] === "\\") {
                        return;
                    }
                    else {
                        this.inString = undefined;
                        return true;
                    }
                }
                if (this.inComputed) {
                    this.inString = "'";
                    return true;
                }
            },
            '"': function (text, at, line, offset) {
                if (this.inString === "'") {
                    return;
                }
                if (this.inString === '"') {
                    if (text[at - 1] === "\\") {
                        return;
                    }
                    else {
                        this.inString = undefined;
                        return true;
                    }
                }
                if (this.inComputed) {
                    this.inString = '"';
                    return true;
                }
            },
            "": function (text, at, line, offset) {
                if (this.branceCount > 0) {
                    throw new InvalidExpression("expect } before END", text, text.length, line, offset);
                }
                if (this.inComputed) {
                    throw new InvalidExpression("JS Expression is not complete before END", text, text.length, line, offset);
                }
                if (this.lastTokenAt < text.length - 1) {
                    this.exprs.push(new ConstExpression(text.substring(this.lastTokenAt + 1)));
                }
                return true;
            }
        };
        Models.ExpressionParser = function (text) {
            this.exprs = [];
            this.braceCount = 0;
            this.lastTokenAt = -1;
            expressionReader(text, this);
        };
        Models.ExpressionParser.prototype = expressionParser;
        var memberAccess = {
            "meetProp": function (text, at, allowEmpty) {
                var prop = text.substring(this.lastTokenAt + 1, at);
                if (/^\s*$/g.test(prop)) {
                    if (allowEmpty) {
                        return true;
                    }
                    else {
                        throw new Error("Invalid MemberAccess expression:" + text);
                    }
                }
                propRegex.lastIndex = 0;
                var match = propRegex.exec(prop);
                if (match) {
                    this.members.push({ name: match[1], isIndex: false });
                    if (this.onProp)
                        this.onProp(match[1], false);
                    return true;
                }
                throw new Error("Invalid MemberAccess expression:" + text);
            },
            "meetIndex": function (text, at) {
                var prop = text.substring(this.lastTokenAt + 1, at);
                numberRegex.lastIndex = 0;
                var match = numberRegex.exec(prop);
                if (match) {
                    this.members.push({ name: match[1], isIndex: true });
                    if (this.onProp)
                        this.onProp(match[1], true);
                    return true;
                }
                throw new Error("Invalid MemberAccess expression:" + text);
            },
            ".": function (text, at, line, offset) {
                if (this.lastToken === "]") {
                    return true;
                }
                return this.meetProp(text, at);
            },
            "[": function (text, at, line, offset) {
                if (this.lastToken === "." || this.lastToken === undefined) {
                    return this.meetProp(text, at, this.lastToken === undefined);
                }
                else {
                    if (this.lastToken === "[")
                        throw new Error("Invalid MemberAccess expression:" + text);
                    var word = text.substring(this.lastTokenAt + 1, at);
                    if (!/^\s*$/g.test(word)) {
                        throw new Error("Invalid MemberAccess expression:" + text);
                    }
                    return true;
                }
            },
            "]": function (text, at, line, offset) {
                if (this.lastToken !== '[') {
                    throw new Error("Invalid MemberAccess expression:" + text);
                }
                return this.meetIndex(text, at);
            },
            "": function (text, at, line, offset) {
                if (this.lastToken === '[') {
                    throw new Error("Invalid MemberAccess expression:" + text);
                }
                return this.meetProp(text, text.length, true);
            }
        };
        Models.MemberAccessParser = function (text) {
            this.members = [];
            this.lastTokenAt = -1;
            expressionReader(text, this);
        };
        Models.MemberAccessParser.prototype = memberAccess;
        var propRegex = /^\s*([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*$/g;
        var numberRegex = /\s*(\d*)\s*/;
        var computedRegx = /\$\{[^\}]+\}/g;
        var arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
        var propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
        var regt = "(?:" + arrSectionRegt + "|" + propSectionRegt + ")(?:" + arrSectionRegt + "|(?:." + propSectionRegt + "))*";
        var pathRegx = new RegExp(regt, "g");
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Expression = Quic.Models.Expression;
exports.ExpressionParser = Quic.Models.ExpressionParser;
exports.MemberAccessParser = Quic.Models.MemberAccessParser;
