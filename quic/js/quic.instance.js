/// <reference path="models/quic.model.ts" />
/// <reference path="models/quic.schema.ts" />
/// <reference path="packages/quic.package.ts" />
var Quic;
(function (Quic) {
    var QuicInstance = /** @class */ (function () {
        function QuicInstance(opts) {
            this.opts = opts;
        }
        QuicInstance.prototype.initialize = function (opts) {
            this.opts = opts;
            var data = opts;
        };
        return QuicInstance;
    }());
    function initModel(modelOpts, modelData) {
        var model = new Quic.Models.Model(modelOpts);
        for (var n in modelData) {
            var member = modelData[n];
        }
    }
    function configModel(model, name, value) {
        if (!value) {
            model.find(name);
            return;
        }
        if (value.length !== undefined && value.pop && value.push) {
        }
    }
})(Quic || (Quic = {}));
