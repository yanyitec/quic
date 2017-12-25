/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="../quic.package.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var Schema = /** @class */ (function () {
            function Schema(name, composite) {
                if (name === void 0) { name = "$ROOT"; }
                this.name = name;
                this.composite = composite;
                if (composite) {
                    this.root = composite.root;
                }
                else {
                    this.root = this;
                }
            }
            Schema.prototype.prop = function (name) {
                var result = (this.props || (this.props = {}))[name];
                if (!result) {
                    this.props[name] = new Schema(name, this);
                    this.isObject = true;
                }
                return result;
            };
            Schema.prototype.index = function (name) {
                var result;
                if (name === "") {
                    result = this.itemSchema;
                }
                else {
                    result = (this.props || (this.props = {}))[name];
                }
                if (!result) {
                    result = this.itemSchema || (this.itemSchema = new Schema("[quic:index]", this));
                    if (name)
                        this.props[name] = result;
                    this.isObject = this.isArray = true;
                }
                return result;
            };
            Schema.prototype.find = function (text, onProperty) {
                var exprs = this.__defines || (this.__defines = {});
                var def = exprs[text];
                var schema = this;
                if (!def) {
                    var expr = new Models.MemberAccessExpression(text, function (name, isArray) {
                        if (name === "$ROOT") {
                            schema = schema.root;
                        }
                        else if (name === "$SUPER") {
                            if (schema.composite)
                                schema = schema.composite;
                            else
                                throw new Error("invalid expression,no more $SUPER:" + text);
                        }
                        else {
                            if (isArray) {
                                schema.index(name);
                            }
                            else {
                                schema.prop(name);
                            }
                        }
                        if (onProperty)
                            onProperty(name, schema);
                    });
                    def = {
                        text: text,
                        schema: schema,
                        expression: expr
                    };
                }
                else {
                    for (var i in def.expression.members) {
                        var member = def.expression.members[i];
                        if (member.name === "$ROOT") {
                            schema = schema.root;
                        }
                        else if (member.name === "$SUPER") {
                            if (schema.composite)
                                schema = schema.composite;
                            else
                                throw new Error("invalid expression,no more $SUPER:" + text);
                        }
                        else {
                            if (member.isIndex) {
                                schema = schema.index(member.name);
                            }
                            else {
                                schema = schema.prop(member.name);
                            }
                        }
                        if (onProperty)
                            onProperty(member.name, schema);
                    }
                }
                return schema;
            };
            Schema.prototype.parse = function (text, onProperty) {
                var _this = this;
                var exprs = this.__defines || (this.__defines = {});
                var def = exprs[text];
                if (def)
                    return def;
                var schema = this;
                var oldText;
                var reset = false;
                var onProp = function (name, isArr, text) {
                    if (text != oldText) {
                        schema = _this;
                        oldText = text;
                        reset = true;
                    }
                    if (name === "$ROOT") {
                        schema = schema.root;
                    }
                    else if (name === "$SUPER") {
                        if (schema.composite)
                            schema = schema.composite;
                        else
                            throw new Error("invalid expression,no more $SUPER:" + text);
                    }
                    else {
                        if (isArr) {
                            schema = schema.index(name);
                        }
                        else {
                            schema = schema.prop(name);
                        }
                    }
                    if (onProperty)
                        onProperty(name, schema, reset);
                    reset = false;
                };
                if (!def) {
                    var expr = Models.Expression.parse(text, onProp);
                    if (!expr.path) {
                        schema = undefined;
                    }
                    def = this.__defines[text] = {
                        text: text,
                        schema: schema,
                        expression: expr
                    };
                }
                else {
                    def.expression.gothrough(onProp);
                }
                return def;
            };
            return Schema;
        }());
        Models.Schema = Schema;
        var empty;
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Schema = Quic.Models.Schema;
