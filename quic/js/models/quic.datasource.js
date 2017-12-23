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
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="../quic.package.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var DataSource = /** @class */ (function (_super) {
            __extends(DataSource, _super);
            function DataSource(opts, rootSchema) {
                var _this = _super.call(this) || this;
                _this.opts = opts;
                _this.__accesses = {};
                _this.__exprs = {};
                _this.exprFactory = exprFactory || new ExpressionFactory();
                _this.initImports(opts);
                if (opts.data) {
                    _this.onDataArrived(opts.data);
                    _this.fetch = function () {
                        return new Quic.Promise(function (resolve) {
                            resolve(_this.value, _this);
                        });
                    };
                }
                else if (_this.imports.transport) {
                    _this.__fetchPromise = false;
                }
                else {
                    Quic.ctx.throw("Invalid datasource opts", "url or data or imports is required", opts);
                }
                return _this;
            }
            DataSource.prototype.initImports = function (opts) {
                var _this = this;
                var trans = opts.transport;
                var url = opts.url;
                var imports = opts.imports;
                var datasource = this.datasource = opts.datasource;
                if (trans) {
                    url || (url = opts.url);
                    if (url)
                        trans = { url: url, method: "GET", dataType: "json" };
                }
                if (imports) {
                    if (!datasource) {
                        Quic.ctx.throw("Both maps & datasource must be existed");
                    }
                    var settingMaps_1 = this.imports = {};
                    var loop = function (target, src) {
                        var targetAccess = _this.access(target, _this);
                        var srcAccess;
                        if (typeof src === "string" && src.length >= 3 && src[0] == "$" && src[1] == "{" && src[src.length - 1] == "}") {
                            srcAccess = datasource.expr(src);
                        }
                        else {
                            srcAccess = function () { return Quic.deepClone(src); };
                        }
                        var sourceListener;
                        if (!srcAccess.isAccess) {
                            sourceListener = function (value, evtArgs) {
                                targetAccess(value, { sender: _this, datasource: _this, access: targetAccess, src: evtArgs });
                            };
                            datasource.subscribe(src, sourceListener);
                        }
                        settingMaps_1[src] = { access: targetAccess, sourceAccess: srcAccess, sourceListener: sourceListener };
                    };
                    for (var target in imports) {
                        loop(target, imports[target]);
                    }
                }
                else if (datasource) {
                    Quic.ctx.throw("Both maps & datasource must be existed");
                }
            };
            DataSource.prototype.update = function (data) {
                var compareData = this.__compareData;
                for (var n in this.__accesses) {
                    var access = this.__accesses[n];
                    var compareValue = access(compareData);
                    var currentValue = access(data);
                    if (compareValue) {
                        var rawFrom = compareValue.quic_extend_from;
                        //if()
                    }
                }
            };
            DataSource.prototype.onDataArrived = function (incoming, evtArgs) {
                this.incoming = incoming;
                var isArray = incoming && incoming.push && incoming.pop && incoming.shift && incoming.length !== undefined;
                var outgoing;
                var imports = this.imports;
                if (imports) {
                    if (!outgoing) {
                        outgoing = this.value = isArray ? [] : {};
                    }
                    for (var srcname in imports) {
                        var item = imports[srcname];
                        var val = item.sourceAccess();
                        item.access(val === undefined ? "quic:undefined" : val, "quic:no-propagation");
                    }
                }
                if (!outgoing) {
                    outgoing = this.value = incoming;
                }
                else {
                    for (var m in incoming) {
                        outgoing[m] = incoming[m];
                    }
                }
                for (var p in this.__accesses) {
                    var access = this.__accesses[p];
                    var pvalue = access();
                    this.notify(p, pvalue, { sender: this, datasource: this, access: access, src: evtArgs });
                }
                this.notify("onvaluechanged", outgoing, evtArgs);
                return outgoing;
            };
            DataSource.prototype.fetch = function () {
                var _this = this;
                if (this.__fetchPromise === false) {
                    return this.__fetchPromise = new Quic.Promise(function (resolve, reject) {
                        var transOpts = Quic.deepClone(_this.transport);
                        transOpts.url = _this.expr(transOpts.url)();
                        _this.notify("onfetching", transOpts);
                        Quic.transport(transOpts).then(function (result) {
                            _this.__fetchPromise = false;
                            _this.onDataArrived(result);
                            resolve(_this.value, _this);
                        }, function (err, at) {
                            Quic.ctx.error("ajax request is failed", transOpts, err, at);
                            reject(err, at);
                        });
                    });
                }
                else {
                    return this.__fetchPromise;
                }
            };
            DataSource.prototype.data = function (prop, value, evtArgs) {
                var _this = this;
                if (prop === undefined) {
                    if (this.__fetchPromise === false) {
                        return new Quic.Promise(function (resolve) {
                            resolve(_this.incoming);
                        });
                    }
                    else
                        return this.fetch();
                }
                if (typeof prop === "string") {
                    if (prop === "quic:value") {
                        return this.value;
                    }
                    var access = this.access(prop);
                    if (value === undefined) {
                        return access;
                    }
                    access(value, evtArgs);
                    return this;
                }
                evtArgs = value;
                value = prop;
                this.onDataArrived(value);
                return this;
            };
            return DataSource;
        }(Quic.Observable));
        Models.DataSource = DataSource;
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
