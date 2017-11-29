/// <reference path="quic.data.ts" />
/// <reference path="quic.view.ts" />
var Quic;
(function (Quic) {
    class Fieldset extends Quic.DataField {
        constructor(container, opts) {
            super(opts);
            this.fields = {};
        }
    }
    Quic.Fieldset = Fieldset;
    //viewBuilders.
})(Quic || (Quic = {}));
