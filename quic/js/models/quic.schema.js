/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="quic.expression.ts" />
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
            Schema.prototype.define = function (name) {
                var result;
                if (name === "quic:array") {
                    result = this.itemSchema || (this.itemSchema = new Schema("[quic:index]", this));
                    this.isObject = this.isArray = true;
                }
                else {
                    if (this.isArray)
                        throw new Quic.Exception("cannot define prop in Array model");
                    result = (this.props || (this.props = {}))[name];
                    if (!result) {
                        result = this.props[name] = new Schema(name, this);
                        this.isObject = true;
                    }
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
                                schema = schema.define("quic:array");
                            }
                            else {
                                schema = schema.define(name);
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
                                schema = schema.define("quic:array");
                            }
                            else {
                                schema = schema.define(member.name);
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
                            schema = schema.define("quic:array");
                        }
                        else {
                            schema = schema.define(name);
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
