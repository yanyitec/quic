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
/// <reference path="quic.promise.ts" />
/// <reference path="quic.context.ts" />
/// <reference path="quic.ajax.ts" />
/// <reference path="quic.access.ts" />
var Quic;
(function (Quic) {
    function clone(value) {
        if (!value)
            return value;
        if (typeof value === 'object') {
            var newValue = value.length !== undefined && value.shift && value.push ? [] : {};
            for (var n in value) {
                newValue = clone(value[n]);
            }
            return newValue;
        }
        return value;
    }
    Quic.clone = clone;
    var DataResource = /** @class */ (function (_super) {
        __extends(DataResource, _super);
        function DataResource(opts, accessFactory, _ajax) {
            var _this = _super.call(this) || this;
            _this.opts = opts;
            if (opts.data) {
                _this.__data = opts.data;
                _this.fetch = function () {
                    return new Quic.Promise(function (resolve) {
                        var data = _this.__data;
                        _this.notify("onfetched", data);
                        resolve(data, _this);
                    });
                };
            }
            else if (opts.transport) {
                _this.__isFetching = false;
                _this.ajax = _ajax || Quic.ajax;
            }
            else {
                Quic.ctx.throw("Invalid datasource opts", "transport or data is required", opts);
            }
            return _this;
        }
        DataResource.prototype.fetch = function () {
            var _this = this;
            if (this.__isFetching === false) {
                return this.__isFetching = new Quic.Promise(function (resolve) {
                    var trans = clone(_this.opts.transport) || {};
                    var transData = trans.data || {};
                    _this.notify("onfetching", [transData, trans, _this], true);
                    trans.data = transData;
                    _this.ajax(_this.__transport).then(function (result) {
                        var data = _this.__data = _this._schema_rows(result, _this);
                        _this.notify("onfetched", data);
                        _this.__isFetching = false;
                        resolve(data, _this);
                    }, function (err, at) {
                        Quic.ctx.error("ajax request is failed", _this.__transport, err, at);
                    });
                });
            }
            return this.__isFetching;
        };
        DataResource.prototype.data = function (value) {
            var _this = this;
            if (this.__isFetching === false) {
                return new Quic.Promise(function (resolve) {
                    resolve(_this.__data);
                });
            }
            else
                return this.fetch();
        };
        return DataResource;
    }(Quic.Observable));
    Quic.DataResource = DataResource;
})(Quic || (Quic = {}));
