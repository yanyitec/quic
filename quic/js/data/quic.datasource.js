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
/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.access.ts" />
/// <reference path="quic.expression.ts" />
var Quic;
(function (Quic) {
    var DataSource = /** @class */ (function (_super) {
        __extends(DataSource, _super);
        function DataSource(opts, exprFactory, transport) {
            var _this = _super.call(this) || this;
            _this.opts = opts;
            _this.__accesses = {};
            _this.__exprs = {};
            _this.exprFactory = exprFactory || new Quic.ExpressionFactory();
            if (opts.data) {
                _this.rawData = opts.data;
                _this.fetch = function () {
                    return new Quic.Promise(function (resolve) {
                        var data = _this.rawData;
                        _this.notify("onfetched", data);
                        resolve(data, _this);
                    });
                };
            }
            else if (opts.transport) {
                _this.__fetchPromise = false;
                _this.transport = transport || Quic.transport;
            }
            else {
                Quic.ctx.throw("Invalid datasource opts", "transport or data is required", opts);
            }
            return _this;
        }
        DataSource.prototype.fetch = function () {
            var _this = this;
            if (this.__fetchPromise === false) {
                return this.__fetchPromise = new Quic.Promise(function (resolve, reject) {
                    var transOpts;
                    if (typeof _this.opts.transport === "string") {
                        transOpts = {
                            url: _this.opts.transport,
                            method: "GET",
                            dataType: "json"
                        };
                    }
                    _this.notify("onfetching", transOpts);
                    _this.transport(transOpts).then(function (result) {
                        var data = _this.rawData = result;
                        _this.notify("onfetched", data, data);
                        _this.__fetchPromise = false;
                        resolve(data, _this);
                    }, function (err, at) {
                        Quic.ctx.error("ajax request is failed", _this.__transport, err, at);
                        reject(err, at);
                    });
                });
            }
            else {
                return this.__fetchPromise;
            }
        };
        DataSource.prototype.data = function (value, sender) {
            var _this = this;
            if (value === undefined) {
                if (this.__fetchPromise === false) {
                    return new Quic.Promise(function (resolve) {
                        resolve(_this.rawData);
                    });
                }
                else
                    return this.fetch();
            }
            this.rawData = value;
            this.notify("onvaluechanged", value, { sender: sender, datasource: this });
        };
        DataSource.prototype.expr = function (text) {
            var _this = this;
            var specializedExpr = this.__exprs[text];
            if (specializedExpr)
                return specializedExpr;
            var expr = this.exprFactory.getOrCreate(text);
            var deps = expr.deps;
            for (var i = 0, j = deps.length; i < j; i++) {
                var dep = deps[i];
                if (dep !== expr) {
                    var depname = dep.mappath;
                    this.subscribe(depname, function (value, sender) { return _this.notify(text, value, sender); });
                }
            }
            specializedExpr = function (noneToEmpty) {
                if (_this.rawData === undefined)
                    Quic.ctx.throw("data is not ready in DataSource");
                return expr(_this.rawData, noneToEmpty);
            };
            return this.__exprs[text] = specializedExpr;
        };
        DataSource.prototype.access = function (text, defaultSender) {
            var _this = this;
            var specializedAccess = this.__accesses[text];
            if (specializedAccess)
                return specializedAccess;
            var access = this.exprFactory.accessFactory.getOrCreate(text);
            specializedAccess = function (value, sender) {
                if (_this.rawData === undefined)
                    Quic.ctx.throw("data is not ready in DataSource");
                if (value === undefined)
                    return access(_this.rawData);
                access(_this.rawData, value);
                _this.notify(text, value, { sender: sender || defaultSender, dataSource: _this, access: specializedAccess });
            };
            this.subscribe("onvaluechanged", function (value, sender) {
                var fieldvalue = access(_this.rawData);
                _this.notify(text, fieldvalue, { sender: sender.sender || defaultSender, dataSource: _this, access: specializedAccess });
            });
            specializedAccess.rawAccess = access;
            specializedAccess.defaultSender = defaultSender;
            return this.__accesses[text] = specializedAccess;
        };
        DataSource.prototype.dispose = function () {
        };
        return DataSource;
    }(Quic.Observable));
    Quic.DataSource = DataSource;
})(Quic || (Quic = {}));
