var Quic;
(function (Quic) {
    var Data;
    (function (Data) {
        var Schema = /** @class */ (function () {
            function Schema(name, composite) {
                if (name === void 0) { name = "$ROOT"; }
                this.name = name;
                this.composite = composite;
                if (composite) {
                    var stack = this.__stack = [];
                    var pstack = composite.__stack;
                    if (pstack) {
                        for (var i = 0, j = pstack.length; i < j; i++) {
                            stack.push(pstack[i]);
                        }
                    }
                    stack.push(this);
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
                var result = (this.indexs || (this.indexs = {}))[name];
                if (!result) {
                    this.indexs[name] = new Schema(name, this);
                    this.isObject = this.isArray = true;
                }
                return result;
            };
            Schema.prototype.get_value = function (data, fillDefault) {
                var stack = this.__stack;
                if (!stack)
                    return data;
                var count = stack.length - 1;
                for (var i = 0; i <= count; i++) {
                    var schema = stack[i];
                    var nextValue = data[schema.name];
                    var value = nextValue;
                    if (!nextValue) {
                        if (fillDefault) {
                            nextValue = data[schema.name] = schema.isArray ? [] : (schema.isObject ? {} : undefined);
                            if (nextValue) {
                                data = nextValue;
                            }
                            else {
                                return value;
                            }
                        }
                        else {
                            return value;
                        }
                    }
                    else {
                        data = nextValue;
                    }
                }
                return data;
            };
            Schema.prototype.set_value = function (data, value, evtArgs) {
                var stack = this.__stack;
                if (!stack)
                    return this;
                for (var i = 0, j = stack.length - 1; i < j; i++) {
                    if (!(data = stack[i].get_value(data, true)))
                        return this;
                }
                data[this.name] = value;
                if (evtArgs) {
                    this.notify(value, data, this, evtArgs);
                }
                return this;
            };
            Schema.prototype.notify = function (value, data, trigger, evtArgs) {
                if (this.__listeners) {
                    for (var i = 0, j = this.__listeners.length; i < j; i++) {
                        this.__listeners[i](value, data, evtArgs, trigger);
                    }
                }
                if (this.props) {
                    for (var name_1 in this.props) {
                        var prop = this.props[name_1];
                        var value_1 = prop.get_value(data);
                        this.props[name_1].notify(value_1, data, evtArgs, trigger);
                    }
                }
                if (this.indexs) {
                    for (var name_2 in this.indexs) {
                        var prop = this.props[name_2];
                        var value_2 = prop.get_value(data);
                        this.props[name_2].notify(value_2, data, evtArgs, trigger);
                    }
                }
                return this;
            };
            Schema.prototype.subscribe = function (listener) {
                (this.__listeners || (this.__listeners = [])).push(listener);
                return this;
            };
            Schema.prototype.unsubscibe = function (listener) {
                if (!this.__listeners)
                    return this;
                var existed;
                for (var i = 0, j = this.__listeners.length; i < j; i++) {
                    if ((existed = this.__listeners.shift()) !== listener)
                        this.__listeners.push(existed);
                }
                return this;
            };
            Schema.prototype.define = function (expr) {
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
                        schema = schema.prop(prop_1);
                    }
                    else if (token === "[") {
                        if (branceStartAt !== undefined) {
                            throw new Error("invalid schema path");
                        }
                        var prop_2 = expr.substring(lastDotAt + 1, i - 1);
                        if (prop_2) {
                            schema = schema.prop(prop_2);
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
                    }
                }
                if (branceStartAt !== undefined) {
                    throw new Error("invalid schema path");
                }
                var prop = expr.substring(lastDotAt + 1);
                if (prop) {
                    schema = schema.prop(prop);
                }
                ;
                return schema;
            };
            return Schema;
        }());
        Data.Schema = Schema;
        var empty;
    })(Data = Quic.Data || (Quic.Data = {}));
})(Quic || (Quic = {}));
exports.Schema = Quic.Data.Schema;
