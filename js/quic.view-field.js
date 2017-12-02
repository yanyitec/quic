/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
var Quic;
(function (Quic) {
    class FieldView extends Quic.View {
        constructor(module, composition, field, opts) {
            if (!field)
                Quic.env.throw("field is required", "FieldView.constructor");
            super(module, composition, field, opts);
        }
    }
    Quic.FieldView = FieldView;
})(Quic || (Quic = {}));
