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
            Expression.prototype.gothrough = function (onProp) {
                throw new Error("Invalid Operation");
            };
            Expression.prototype.getValue = function (data, accessOpts) {
                throw new Error("Invalid Operation");
            };
            Expression.prototype.getCode = function (asValue) {
                throw new Error("Invalid Operation");
            };
            Expression.parse = function (text, onProp) {
                var expr = new MixedExpression(text, onProp);
                if (expr.expr) {
                    if (expr.expr.path) {
                        return expr.expr.path;
                    }
                    else {
                        return expr.expr;
                    }
                }
                return expr;
            };
            return Expression;
        }());
        Models.Expression = Expression;
        var ConstExpression = /** @class */ (function (_super) {
            __extends(ConstExpression, _super);
            function ConstExpression(constText) {
                return _super.call(this, ExpressionTypes.const, constText) || this;
            }
            ConstExpression.prototype.getValue = function (data) {
                return this.text;
            };
            ConstExpression.prototype.getCode = function (asValue) {
                return '"' + this.text.replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/\n/g, "\\\n") + '"';
            };
            return ConstExpression;
        }(Expression));
        Expression.ConstExpression = ConstExpression;
        var MemberAccessExpression = /** @class */ (function (_super) {
            __extends(MemberAccessExpression, _super);
            function MemberAccessExpression(text, onProp) {
                var _this = _super.call(this, ExpressionTypes.datapath, text) || this;
                _this.members = new Models.MemberAccessParser(text, onProp).members;
                if (_this.members.length == 0)
                    _this.member = _this.members[0];
                return _this;
            }
            MemberAccessExpression.prototype.gothrough = function (onProp) {
                if (this.member) {
                    onProp(this.member.name, this.member.isIndex, this.text);
                }
                else {
                    for (var i in this.members) {
                        var member = this.members[i];
                        onProp(member.name, member.isIndex, this.text);
                    }
                }
            };
            MemberAccessExpression.prototype.getValue = function (data, accessOpts) {
                var code;
                if (this.member) {
                    code = "return " + this.getCode() + ";";
                    this.getValue = new Function("$__DATA__", code);
                }
                else {
                    code = this.getCode();
                    this.getValue = new Function("$__DATA__", code);
                }
                return this.getValue(data, accessOpts);
            };
            MemberAccessExpression.prototype.getCode = function (asValue) {
                var code = "";
                if (this.member) {
                    code = "$__DATA__[";
                    if (this.member.isIndex)
                        code += this.member.name;
                    else
                        code += '"' + this.member.name + '"';
                    code = "]";
                    if (!asValue)
                        code += "return " + code + ";\n";
                }
                else {
                    for (var i in this.members) {
                        var member = this.members[i];
                        if (member.isIndex) {
                            if (!member.name)
                                throw new Error("this expression cannot call getValue:" + this.text);
                            code += "$__DATA__ = $__DATA__[" + member.name + "]";
                            code += "if(!$__DATA__)return $__DATA__;\n";
                        }
                        else {
                            if (!member.name)
                                throw new Error("this expression cannot call getValue:" + this.text);
                            code += "$__DATA__ = $__DATA__[\"" + member.name + "\"]";
                            code += "if(!$__DATA__)return $__DATA__;\n";
                        }
                    }
                    code += "return $__DATA__;\n";
                    if (asValue) {
                        code = "(function($__DATA__)){" + code + "})($__DATA__)";
                    }
                }
                return code;
            };
            return MemberAccessExpression;
        }(Expression));
        Models.MemberAccessExpression = MemberAccessExpression;
        Expression.MemberAccessExpression = MemberAccessExpression;
        var jsKeywords = ["if", "while", "var", "switch", "case", "for", "in", "return", "with", "function", "continue", "break"];
        var ComputedExpression = /** @class */ (function (_super) {
            __extends(ComputedExpression, _super);
            function ComputedExpression(text, onProp) {
                var _this = _super.call(this, ExpressionTypes.computed, text) || this;
                var match;
                var path;
                pathRegx.lastIndex = 0;
                while (match = pathRegx.exec(text)) {
                    path = match[0];
                    if (!_this.paths) {
                        _this.paths = [];
                    }
                    var isKeyword = false;
                    for (var i = 0, j = jsKeywords.length; i < j; i++) {
                        if (jsKeywords[i] === path) {
                            isKeyword = true;
                            break;
                        }
                    }
                    if (isKeyword) {
                        continue;
                    }
                    _this.paths.push(new MemberAccessExpression(path, onProp));
                }
                if (path && path.length === text.length) {
                    _this.path = _this.paths[0];
                }
                return _this;
            }
            ComputedExpression.prototype.gothrough = function (onProp) {
                if (this.path) {
                    this.path.gothrough(onProp);
                }
                else {
                    for (var i in this.paths) {
                        var expr = this.paths[i];
                        expr.gothrough(onProp);
                    }
                }
            };
            ComputedExpression.prototype.getValue = function (data) {
                if (this.path) {
                    var result = this.path.getValue(data);
                    this.getValue = this.path.getValue;
                    return result;
                }
                else {
                    var code = this.getCode();
                    this.getValue = new Function("$__DATA__", code);
                    return this.getValue(data);
                }
            };
            ComputedExpression.prototype.getCode = function (asValue) {
                if (this.path)
                    return this.path.getCode(asValue);
                var code = "with($__DATA__){ return \n" + this.text + ";\n}";
                if (asValue) {
                    code = "(function($__DATA__){" + code + "})($__DATA)";
                }
                return code;
            };
            return ComputedExpression;
        }(Expression));
        Models.ComputedExpression = ComputedExpression;
        Expression.ComputedExpression = ComputedExpression;
        var MixedExpression = /** @class */ (function (_super) {
            __extends(MixedExpression, _super);
            function MixedExpression(text, onProp) {
                var _this = _super.call(this, ExpressionTypes.mixed, text) || this;
                var exprs = new Models.ExpressionParser(text, onProp).exprs;
                _this.exprs = exprs;
                if (exprs.length === 1) {
                    _this.expr = exprs[0];
                }
                return _this;
            }
            MixedExpression.prototype.gothrough = function (onProp) {
                if (this.expr) {
                    this.expr.gothrough(onProp);
                }
                else {
                    for (var i in this.exprs) {
                        var ex = this.exprs[i];
                        if (!(ex instanceof ConstExpression)) {
                            ex.gothrough(onProp);
                        }
                    }
                }
            };
            MixedExpression.prototype.getValue = function (data) {
                if (this.expr) {
                    var value = this.expr.getValue(data);
                    this.getValue = this.expr.getValue;
                    return value;
                }
                else {
                    var code = this.getCode();
                    this.getValue = new Function("$__DATA__", code);
                    return this.getValue(data);
                }
            };
            MixedExpression.prototype.getCode = function (asValue) {
                if (this.expr) {
                    return this.expr.getCode(asValue);
                }
                else {
                    var code = "var $__RESULT__=\"\";\n";
                    for (var i in this.exprs) {
                        code += "$__RESULT__ +=" + this.exprs[i].getValue(true) + ";\n";
                    }
                    code += "return $__DATA__;";
                    if (asValue) {
                        code = "(function($__DATA__){" + code + "})($__DATA__)";
                    }
                    return code;
                }
            };
            return MixedExpression;
        }(Expression));
        Models.MixedExpression = MixedExpression;
        Expression.MixedExpression = MixedExpression;
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
                    var constText = text.substring(this.lastTokenAt + 1, at);
                    if (constText)
                        this.exprs.push(new ConstExpression(constText));
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
                    this.braceCount = 1;
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
                        this.exprs.push(new ComputedExpression(text.substring(this.lastTokenAt + 1, at), this.onProp));
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
                        return;
                    }
                }
                if (this.inComputed) {
                    this.inString = "'";
                    return;
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
                        return;
                    }
                }
                if (this.inComputed) {
                    this.inString = '"';
                    return;
                }
            },
            "": function (text, at, line, offset) {
                if (this.inComputed) {
                    throw new InvalidExpression("JS Expression is not complete before END", text, text.length, line, offset);
                }
                if (this.lastTokenAt < text.length - 1) {
                    this.exprs.push(new ConstExpression(text.substring(this.lastTokenAt + 1)));
                }
                return true;
            }
        };
        Models.ExpressionParser = function (text, onProp) {
            this.exprs = [];
            this.braceCount = 0;
            this.lastTokenAt = -1;
            this.onProp = onProp;
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
                        this.onProp(match[1], false, text);
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
                        this.onProp(match[1], true, text);
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
        Models.MemberAccessParser = function (text, onProp) {
            this.members = [];
            this.lastTokenAt = -1;
            this.onProp = onProp;
            expressionReader(text, this);
        };
        Models.MemberAccessParser.prototype = memberAccess;
        var propRegex = /^\s*([a-zA-Z_\$][a-zA-Z0-9_\$]*)\s*$/g;
        var numberRegex = /\s*(\d*)\s*/;
        var computedRegx = /\$\{[^\}]+\}/g;
        var arrSectionRegt = "(?:\\[(?:first|last|\\d+)\\])";
        var propSectionRegt = "(?:[a-zA-Z_\\$][a-zA-Z0-9_\\$]*)";
        var regt = "(?:" + propSectionRegt + ")(?:" + arrSectionRegt + "|(?:." + propSectionRegt + "))*";
        var pathRegx = new RegExp(regt, "g");
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Expression = Quic.Models.Expression;
exports.ExpressionParser = Quic.Models.ExpressionParser;
exports.MemberAccessParser = Quic.Models.MemberAccessParser;
