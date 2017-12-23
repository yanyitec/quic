/// <reference path="base/quic.utils.ts" />
/// <reference path="base/quic.observable.ts" />
/// <reference path="data/quic.schema.ts" />
/// <reference path="data/quic.expression.ts" />
/// <reference path="quic.package.ts" />
var Quic;
(function (Quic) {
    var Model = /** @class */ (function () {
        function Model(data, rootSchema) {
            this.data = data;
            this.rootSchema = rootSchema || new Quic.Data.Schema();
            this.__compare = Quic.deepClone(data);
            this.__accesses = {};
        }
        Model.prototype.access = function (text) {
            var access = this.__accesses[text];
            if (!access) {
                access = this.__accesses[text] = Quic.Data.Expression.parse(text).genAccess(this.rootSchema);
                access.model = this;
                var schema_1 = access.schema || (access.schema = new Quic.Data.Schema("quic-schema-mock" + idNo(), this.rootSchema));
                var deps = access.deps;
                for (var i in deps) {
                    deps[i].subscribe(function (value, data, trigger, evt) {
                        schema_1.notify(access(data), data, trigger, evt);
                    });
                }
            }
            return access;
        };
        Model.prototype.refresh = function () {
            this.__compare = noticeDiff(this.data, this.data, this.__compare, this.rootSchema);
            return this;
        };
        return Model;
    }());
    Quic.Model = Model;
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
                schema.notify(data, rootData, schema);
                return Quic.deepClone(data);
            }
            return compare;
        }
        for (var name_1 in enumerator) {
            var subData = data[name_1];
            var subCompare = compare[name_1];
            var subSchema = schema.props[name_1];
            if (subData !== subCompare) {
                schema.notify(subData, rootData, subSchema);
                newCompare[name_1] = Quic.deepClone(subData);
            }
            else if (subSchema.isObject) {
                newCompare[name_1] = noticeDiff(rootData, subData, subCompare, subSchema);
            }
        }
        return newCompare;
    }
    var idSeed = 0;
    function idNo() {
        if (++idSeed === 2100000000)
            idSeed = 0;
        return idSeed;
    }
})(Quic || (Quic = {}));
