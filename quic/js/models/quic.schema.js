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
                var result = (this.props || (this.props = {}))[name];
                if (!result) {
                    result = this.itemSchema || (this.itemSchema = new Schema("[quic:index]", this));
                    this.props[name] = result;
                    this.isObject = this.isArray = true;
                }
                return result;
            };
            Schema.prototype.define = function (expr, onProperty) {
                var at = 0;
                var lastDotAt = -1;
                var branceStartAt;
                var lastBranceEndAt;
                var schema = this;
                for (var i = 0, j = expr.length; i < j; i++) {
                    var token = expr[i];
                    if (token === ".") {
                        lastDotAt = i;
                        if (lastBranceEndAt === i - 1) {
                            continue;
                        }
                        var prop_1 = expr.substring(lastDotAt + 1, i - 1);
                        if (prop_1 === "$root") {
                            schema = this.root;
                        }
                        else if (prop_1 === "$parent") {
                            schema = schema.composite ? schema.composite : schema;
                        }
                        else if (prop_1) {
                            schema = schema.prop(prop_1);
                            if (onProperty)
                                onProperty(prop_1, schema, this);
                        }
                    }
                    else if (token === "[") {
                        if (branceStartAt !== undefined) {
                            throw new Error("invalid schema path");
                        }
                        var prop_2 = expr.substring(lastDotAt + 1, i - 1);
                        if (prop_2 === "$root") {
                            schema = this.root;
                        }
                        else if (prop_2 === "$parent") {
                            schema = schema.composite ? schema.composite : schema;
                        }
                        else if (prop_2) {
                            schema = schema.prop(prop_2);
                            if (onProperty)
                                onProperty(prop_2, schema, this);
                        }
                        branceStartAt = i;
                    }
                    else if (token === "]") {
                        if (branceStartAt !== undefined) {
                            throw new Error("invalid schema path");
                        }
                        var index = parseInt(expr.substring(branceStartAt + 1, i - 1));
                        if (index != index) {
                            throw new Error("invalid schema path");
                        }
                        branceStartAt = undefined;
                        lastBranceEndAt = i;
                        schema = schema.index(index);
                        if (onProperty)
                            onProperty(index.toString(), schema, this);
                    }
                }
                if (branceStartAt !== undefined) {
                    throw new Error("invalid schema path");
                }
                var prop = expr.substring(lastDotAt + 1);
                if (prop) {
                    schema = schema.prop(prop);
                    if (onProperty)
                        onProperty(prop, schema, this);
                }
                ;
                return schema;
            };
            return Schema;
        }());
        Models.Schema = Schema;
        var empty;
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Schema = Quic.Models.Schema;
