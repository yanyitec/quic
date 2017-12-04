/// <reference path="quic.ts" />
/// <reference path="quic.utils.ts" />
/// <reference path="quic.env.ts" />
/// <reference path="quic.dom.ts" />
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
    var FieldView = /** @class */ (function (_super) {
        __extends(FieldView, _super);
        function FieldView(quic, composition, field, opts) {
            var _this = this;
            if (!field)
                Quic.env.throw("field is required", "FieldView.constructor");
            _this = _super.call(this, quic, composition, field, opts) || this;
            return _this;
        }
        return FieldView;
    }(Quic.View));
    Quic.FieldView = FieldView;
})(Quic || (Quic = {}));
