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
var Quic;
(function (Quic) {
    var CompositeView = /** @class */ (function (_super) {
        __extends(CompositeView, _super);
        function CompositeView(quic, pomposition, field, opts) {
            var _this = _super.call(this, quic, pomposition, field, opts) || this;
            _this.components = {};
            return _this;
        }
        CompositeView.prototype.close = function () {
            throw "Not implement";
        };
        CompositeView.prototype.dispose = function () {
            this.close();
        };
        return CompositeView;
    }(Quic.View));
    Quic.CompositeView = CompositeView;
})(Quic || (Quic = {}));
