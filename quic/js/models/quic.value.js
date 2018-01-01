/// <reference path="quic.schema.ts" />
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.observable.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var DataValue = /** @class */ (function () {
            function DataValue(schema, superior, specialname) {
                if (this.$super = superior) {
                    this.$root = superior.$root;
                }
                else {
                    this._$data = { "$ROOT": {} };
                    this.__name = "$ROOT";
                    this.$root = this;
                }
                if (schema !== null) {
                    this._$schema = schema || (schema = new Models.Schema());
                    if (schema.isObject) {
                        var me = this;
                        for (var propname in schema.props) {
                            me[propname] = new DataValue(schema.props[propname], this);
                        }
                    }
                }
                this.__name = specialname === undefined ? schema.name : specialname;
            }
            DataValue.prototype.get_data = function () {
                if (this._$data === undefined) {
                    var data = this.$super.get_value();
                    return data;
                }
                else {
                    return this._$data;
                }
            };
            DataValue.prototype.get_value = function () {
                var schema = this._$schema;
                var result = this.get_data()[this.__name];
                if (!result && schema.isObject) {
                    result = schema.isArray ? [] : {};
                    this.$super.set_value(result, false);
                }
                if (schema.isArray) {
                    this.length = result.length;
                }
                return result;
            };
            DataValue.prototype.set_value = function (value, srcEvtArgs) {
                var schema = this._$schema;
                var name = this.__name;
                var data = this.get_data();
                //整理值。如果schema是object/array，必须是正确的对象
                if (!value) {
                    value = schema.isArray ? [] : (schema.isObject ? {} : value);
                }
                var evtArgs;
                //获取原来的值
                var oldValue = data[name];
                if (!schema.isObject) {
                    //前后比较，没有变更就什么都不做
                    if (oldValue === value)
                        return value;
                    //赋给新的值
                    data[name] = value;
                    //不需要事件，直接返回
                    if (srcEvtArgs === false)
                        return value;
                    //触发自己的valuechange事件
                    evtArgs = {
                        value: value,
                        old_value: oldValue,
                        publisher: this,
                        src: srcEvtArgs
                    };
                    this.notify(evtArgs);
                    return this;
                }
                if (oldValue !== value) {
                    //赋给新的值
                    data[name] = value;
                    //触发自己的valuechange事件
                    if (srcEvtArgs !== false) {
                        evtArgs = {
                            value: value,
                            old_value: oldValue,
                            publisher: this,
                            src: srcEvtArgs
                        };
                        this.notify(evtArgs);
                    }
                }
                if (schema.isArray) {
                    this.length = value.length;
                }
                var me = this;
                var boardcast = srcEvtArgs !== false && (!evtArgs || !evtArgs.cancel);
                for (var prop in me) {
                    var member = me[prop];
                    if (member && member.$super === this) {
                        member._$data = value;
                        if (boardcast)
                            member.set_value(value[prop], evtArgs);
                    }
                }
                return this;
            };
            DataValue.prototype.subscribe = function (listener) {
                (this.__listeners || (this.__listeners = [])).push(listener);
                return this;
            };
            DataValue.prototype.unsubscibe = function (listener) {
                if (!this.__listeners)
                    return this;
                var existed;
                for (var i = 0, j = this.__listeners.length; i < j; i++) {
                    if ((existed = this.__listeners.shift()) !== listener)
                        this.__listeners.push(existed);
                }
                return this;
            };
            DataValue.prototype.notify = function (evtArgs) {
                if (this.__listeners) {
                    var cancel = false;
                    for (var i = 0, j = this.__listeners.length; i < j; i++) {
                        if (this.__listeners[i](evtArgs.value, this, evtArgs) === false)
                            cancel = true;
                    }
                    evtArgs.cancel = cancel;
                }
                return this;
            };
            DataValue.prototype.define = function (name) {
                var me = this;
                var schema = this._$schema;
                if (name === 'quic:array') {
                    var subschema = schema.define("quic:array");
                    if (!this.__item)
                        this.__item = new DataValue(subschema, this);
                    return this.__item;
                }
                else {
                    if (schema.isArray) {
                        return me[name] = new DataValue(schema.itemSchema, this, name);
                    }
                    else {
                        var schema_1 = this._$schema.define(name.toString());
                        return me[name] = new DataValue(schema_1, this);
                    }
                }
            };
            DataValue.prototype.find = function (text, onProp) {
                var _this = this;
                var dataValue = this;
                this._$schema.find(text, function (propname, schema) {
                    var prop = dataValue[propname];
                    if (!prop) {
                        prop = dataValue[propname] = new DataValue(schema.itemSchema || schema, _this);
                    }
                    dataValue = prop;
                });
                return dataValue;
            };
            DataValue.prototype.parse = function (text, onProp) {
                var _this = this;
                var deps = [];
                var dataValue = this;
                var me = this;
                var def = this._$schema.parse(text, function (propname, schema, reset) {
                    var prop = _this;
                    if (reset) {
                        deps.push(dataValue);
                        dataValue = _this;
                    }
                    prop = dataValue[propname];
                    if (!prop) {
                        dataValue[propname] = new DataValue(schema.itemSchema || schema, _this);
                    }
                    dataValue = prop;
                });
                if (def.schema || (deps.length === 1 && deps[0] === dataValue)) {
                    return dataValue;
                }
                else {
                    var dvalue_1 = new DataValue(null, this);
                    (this.__computes || (this.__computes = {}))[text] = dvalue_1;
                    dvalue_1.get_value = function () {
                        return def.expression.getValue(_this.get_data());
                    };
                    dvalue_1.set_value = function () { return _this; };
                    for (var i in deps) {
                        var dep = deps[i];
                        dep.subscribe(function (value, publisher, evt) {
                            var myEvt = {
                                old_value: dvalue_1.__oldvalue,
                                value: dvalue_1.__oldvalue = dvalue_1.get_value(),
                                src: evt,
                                publisher: dvalue_1
                            };
                            dvalue_1.notify(myEvt);
                        });
                    }
                    return dvalue_1;
                }
            };
            DataValue.prototype.delete = function (name) {
                if (!this._$schema.isObject)
                    return null;
                var existed;
                var me = this;
                existed = me[name];
                if (existed) {
                    if (this._$schema.isArray) {
                        var data = this.get_data();
                        var at = name;
                        for (var i = at, j = data.length - 1; i < j; i++) {
                            data[i] = data[i + 1];
                        }
                        data.pop();
                        this.length = data.length;
                    }
                    else {
                        var data = this.get_data();
                        delete data[name];
                        delete me[name];
                    }
                }
                return existed;
            };
            DataValue.prototype.toString = function () {
                var result = this.get_value();
                if (result === undefined || result === null)
                    return "";
                return result.toString();
            };
            return DataValue;
        }());
        Models.DataValue = DataValue;
        ;
        var idSeed = 0;
        function idNo() {
            if (++idSeed === 2100000000)
                idSeed = 0;
            return idSeed;
        }
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.DataValue = Quic.Models.DataValue;
