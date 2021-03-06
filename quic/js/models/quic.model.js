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
/// <reference path="../base/quic.utils.ts" />
/// <reference path="../base/quic.context.ts" />
/// <reference path="../base/quic.observable.ts" />
/// <reference path="../base/quic.promise.ts" />
/// <reference path="../base/quic.transport.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="quic.value.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var Model = /** @class */ (function (_super) {
            __extends(Model, _super);
            function Model(opts, rootData) {
                var _this = _super.call(this, opts.schema, null) || this;
                _this.$opts = opts;
                _this.$data = _this.$rootData = rootData;
                if (opts.imports) {
                    if (!opts.src_model)
                        throw new Quic.Exception("model required", opts);
                    _this.$src_model = opts.src_model;
                    _this.$imports = null;
                }
                if (opts.data || !opts.url || !opts.transport) {
                    _this.$raw = opts.data;
                    if (_this.$raw === undefined)
                        _this.$raw = {};
                    _this.fetch = function () {
                        if (_this.__fetchPromise)
                            return _this.__fetchPromise;
                        return _this.__fetchPromise = new Quic.Promise(function (resolve, reject) {
                            _this.__onDataArrived(_this.$raw, resolve, reject);
                        });
                    };
                }
                return _this;
            }
            Model.prototype.fetch = function () {
                var _this = this;
                if (this.__fetchPromise === undefined) {
                    return this.__fetchPromise = new Quic.Promise(function (resolve, reject) {
                        var transOpts = Quic.deepClone(_this.$transport);
                        transOpts.url = _this.parse(_this.$transport.url).get_value();
                        //this.notify("onfetching",transOpts);
                        Quic.transport(transOpts).then(function (result) {
                            _this.__onDataArrived(result, resolve, reject);
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
            Model.prototype.__onDataArrived = function (raw, resolve, reject) {
                this.$raw = raw;
                var result;
                var isArr = raw.length !== undefined && raw.push && raw.shift;
                if (this.$rootData) {
                    result = this.$rootData;
                    if (isArr) {
                        result.length = raw.length;
                    }
                }
                //= raw.length!==undefined && raw.push && raw.shift?[]:{};
                for (var i in raw)
                    result[i] = raw[i];
                this.set_value(result, false);
                if (this.$imports === null) {
                    this.$imports = [];
                    for (var n in this.$opts.imports) {
                        this.$imports.push(imports(this, this.$src_model, n, this.$opts.imports[n]));
                    }
                }
                else if (this.$imports) {
                    for (var n in this.$imports)
                        this.$imports[n]();
                }
                this.__fetchPromise = undefined;
                this.notify({
                    value: result,
                    publisher: this,
                    old_value: null,
                    src: null
                });
                resolve(result);
            };
            return Model;
        }(Models.DataValue));
        Models.Model = Model;
        function imports(destModel, srcModel, key, value) {
            var destValue = destModel.find(key);
            if (typeof value === "string" && value.length > 3 && value[0] === "$" && value[value.length - 1] === "}") {
                var expr_1;
                var dbBind = false;
                if (value[1] === "{") {
                    expr_1 = srcModel.parse(value);
                    destValue.set_value(expr_1.get_value());
                }
                else if (value[1] === "$" && value[2] === "{") {
                    expr_1 = srcModel.parse(value.substr(1));
                    destValue.set_value(expr_1.get_value());
                    expr_1.subscribe(function (value, publisher, evt) {
                        destValue.set_value(value);
                    });
                }
                return function () {
                    destValue.set_value(expr_1.get_value(), false);
                };
            }
            destValue.set_value(Quic.deepClone(value));
            return function () {
                destValue.set_value(Quic.deepClone(value), false);
            };
        }
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Model = Quic.Models.Model;
