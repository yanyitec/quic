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
            _this.initImports(opts);
            if (opts.data) {
                _this.fetch = function () {
                    return new Quic.Promise(function (resolve) {
                        _this.onDataArrived(opts.data);
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
        DataSource.prototype.onDataArrived = function (incoming) {
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
                this.notify(p, pvalue, { sender: this, datasource: this, src: undefined, access: access });
            }
            this.notify("onvaluechanged", outgoing);
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
        DataSource.prototype.data = function (value, sender) {
            var _this = this;
            if (value === undefined) {
                if (this.__fetchPromise === false) {
                    return new Quic.Promise(function (resolve) {
                        resolve(_this.incoming);
                    });
                }
                else
                    return this.fetch();
            }
            this.incoming = value;
            this.notify("onvaluechanged", value, { sender: sender || this, datasource: this });
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
                if (_this.incoming === undefined)
                    Quic.ctx.throw("data is not ready in DataSource");
                return expr(_this.value, noneToEmpty);
            };
            specializedExpr.expression = expr.expression;
            specializedExpr.deps = expr.deps;
            specializedExpr.isAccess = expr.isAccess;
            return this.__exprs[text] = specializedExpr;
        };
        DataSource.prototype.access = function (text, defaultSender) {
            var _this = this;
            var specializedAccess = this.__accesses[text];
            if (specializedAccess)
                return specializedAccess;
            var access = this.exprFactory.accessFactory.getOrCreate(text);
            specializedAccess = function (value, sender) {
                if (_this.incoming === undefined)
                    Quic.ctx.throw("data is not ready in DataSource");
                if (value === undefined)
                    return access(_this.value);
                access(_this.incoming, value);
                _this.notify(text, value, { sender: sender || defaultSender, dataSource: _this, access: specializedAccess });
            };
            this.subscribe("onvaluechanged", function (value, evtArgs) {
                var fieldvalue = access(_this.value);
                _this.notify(text, fieldvalue, { sender: defaultSender, dataSource: _this, access: specializedAccess, src: evtArgs });
            });
            specializedAccess.rawAccess = access;
            specializedAccess.defaultSender = defaultSender;
            return this.__accesses[text] = specializedAccess;
        };
        DataSource.prototype.dispose = function () {
            if (this.imports) {
                var imports = this.imports;
                var ds = this.datasource;
                for (var src in imports) {
                    var item = imports[src];
                    if (item.sourceListener)
                        ds.unsubscribe(src, item.sourceListener);
                }
            }
        };
        return DataSource;
    }(Quic.Observable));
    Quic.DataSource = DataSource;
})(Quic || (Quic = {}));
