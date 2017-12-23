/// <reference path="quic.schema.ts" />
/// <reference path="../base/quic.observable.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var DataValue = /** @class */ (function () {
            function DataValue(schema, superior) {
                if (!superior) {
                    var mockData_1 = {};
                    superior = {
                        subscribe: function () { return this; },
                        unsubscibe: function () { return this; },
                        notify: function () { return this; },
                        get_value: function () { return mockData_1; },
                        set_value: function () { throw new Error("invalid operation"); },
                        define: function () { throw new Error("invalid operation"); },
                        updateSchema: function () { return this; },
                        delete: function () { return this; }
                    };
                }
                this._$superior = superior;
                this._$schema = schema || new Models.Schema();
                if (schema.isObject) {
                    var me = this;
                    for (var propname in schema.props) {
                        me[propname] = new DataValue(schema.props[propname], this);
                    }
                }
            }
            DataValue.prototype.get_data = function () {
                var data = this._$superior.get_value();
                if (this._$schema.isArray) {
                    this.length = data.length;
                }
                return data;
            };
            DataValue.prototype.get_value = function () {
                var schema = this._$schema;
                var result = this.get_data()[schema.name];
                if (!result && schema.isObject) {
                    result = schema.isArray ? [] : {};
                    this._$superior.set_value(result, false);
                }
                return result;
            };
            DataValue.prototype.set_value = function (value, srcEvtArgs) {
                var schema = this._$schema;
                var name = schema.name;
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
                }
                else {
                    if (oldValue !== value) {
                        //赋给新的值
                        data[name] = value;
                        //触发自己的valuechange事件
                    }
                }
                if (schema.isObject) {
                    var me = this;
                    for (var prop in me) {
                        var member = me[prop];
                        if (member && member._$superior === this)
                            member.set_value(value[prop], srcEvtArgs === false ? false : evtArgs);
                    }
                }
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
                    for (var i = 0, j = this.__listeners.length; i < j; i++) {
                        this.__listeners[i](evtArgs.value, this, evtArgs);
                    }
                }
                return this;
            };
            DataValue.prototype.define = function (text) {
                var _this = this;
                var dataValue = this;
                this._$schema.define(text, function (propname, schema, rootSchema) {
                    var prop = dataValue[propname];
                    if (!prop) {
                        dataValue[propname] = new DataValue(schema.itemSchema || schema, _this);
                    }
                    dataValue = prop;
                });
                return this;
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
            DataValue.prototype.updateSchema = function () {
                var schema = this._$schema;
                if (schema.isObject) {
                    var me = this;
                    for (var propname in schema.props) {
                        var prop = me[propname];
                        if (prop) {
                            prop.updateSchema();
                        }
                        else {
                            me[propname] = new DataValue(schema.props[propname], this);
                        }
                    }
                }
                return this;
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
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.DataValue = Quic.Models.DataValue;
