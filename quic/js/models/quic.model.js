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
/// <reference path="../base/quic.observable.ts" />
/// <reference path="quic.schema.ts" />
/// <reference path="quic.expression.ts" />
/// <reference path="../quic.package.ts" />
var Quic;
(function (Quic) {
    var Models;
    (function (Models) {
        var Model = /** @class */ (function (_super) {
            __extends(Model, _super);
            //transport:TransportOpts;
            function Model(opts) {
                var _this = _super.call(this, null, null) || this;
                _this._$opts = opts;
                _this.__accesses = {};
                var data = {};
                if (opts.imports) {
                    if (!opts.model) {
                        throw new Error("imports require model");
                    }
                    for (var n in opts.imports) {
                        //imports(this,opts.model,data,n,opts.imports[n]);
                    }
                }
                return _this;
            }
            Model.prototype.get_access = function (text, mixed) {
                var access = this.__accesses[text];
                if (!access) {
                    var innerAccess = void 0;
                    if (mixed === true) {
                        innerAccess = Models.Expression.parse(text).genAccess(this._$schema);
                    }
                    else {
                        innerAccess = new Models.DataPathExpression(text).genAccess(this._$schema);
                    }
                    var dataValue_1 = innerAccess(this);
                    access = function (value, evt) {
                        if (value === undefined) {
                            return dataValue_1.get_value();
                        }
                        if (value === "quic:undefined") {
                            value === undefined;
                        }
                        dataValue_1.set_value(value, evt);
                    };
                    this.__accesses[text] = access;
                    access.model = this;
                    var deps = innerAccess.deps;
                    for (var i in deps) {
                    }
                }
                return access;
            };
            return Model;
        }(Models.DataValue));
        Models.Model = Model;
        function noticeDiff(rootData, data, compare, schema) {
            var newCompare;
            var enumerator;
            if (schema.isArray) {
                newCompare = [];
                enumerator = schema.indexs;
            }
            else if (schema.isObject) {
                newCompare = {};
                enumerator = schema.props;
            }
            else {
                if (compare !== data) {
                    //schema.notify(data,rootData,schema);
                    return Quic.deepClone(data);
                }
                return compare;
            }
            for (var name_1 in enumerator) {
                var subData = data[name_1];
                var subCompare = compare[name_1];
                var subSchema = schema.props[name_1];
                if (subData !== subCompare) {
                    //schema.notify(subData,rootData,subSchema);
                    newCompare[name_1] = Quic.deepClone(subData);
                }
                else if (subSchema.isObject) {
                    newCompare[name_1] = noticeDiff(rootData, subData, subCompare, subSchema);
                }
            }
            return newCompare;
        }
        function imports(destModel, srcModel, destData, key, value) {
            if (key) {
                //let destAccess :IModelAccess = destModel.access(key);
                if (typeof value === "string" && value.length > 3) {
                    if (value[0] === "$" && value[1] === "{" && value[value.length - 1] === "}") {
                        //let srcAccess:IModelAccess = srcModel.access(value,true);
                        //destAccess(destData,srcAccess(srcModel.data));
                        return;
                    }
                }
                //destAccess(destData,deepClone(value));
            }
            else {
                var t = typeof value;
                if (t === "object") {
                    for (var n in value) {
                        for (var n_1 in value) {
                            destData[n_1] = Quic.deepClone(value[n_1]);
                        }
                    }
                    return;
                }
                if (t === "string" && value.length > 3) {
                    if (value[0] === "$" && value[1] === "{" && value[value.length - 1] === "}") {
                        //let srcAccess:IModelAccess = srcModel.access(value,true);
                        //let srcValue = srcAccess(srcModel.data);
                        //if(typeof srcValue==="object"){
                        //    for(let n in srcValue){
                        //        destData[n] = deepClone(srcValue[n]);
                        //    }
                        //}else {
                        //    destData[""] = srcValue;
                        //}
                        return;
                    }
                }
                destData[""] = value;
            }
        }
        var idSeed = 0;
        function idNo() {
            if (++idSeed === 2100000000)
                idSeed = 0;
            return idSeed;
        }
    })(Models = Quic.Models || (Quic.Models = {}));
})(Quic || (Quic = {}));
exports.Model = Quic.Models.Model;
