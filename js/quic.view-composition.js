var Quic;
(function (Quic) {
    class CompositeView extends Quic.View {
        constructor(module, pomposition, field, opts) {
            super(module, pomposition, field, opts);
            this.components = {};
        }
        close() {
            throw "Not implement";
        }
        dispose() {
            this.close();
        }
    }
    Quic.CompositeView = CompositeView;
})(Quic || (Quic = {}));
