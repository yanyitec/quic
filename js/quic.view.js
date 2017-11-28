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
        function FieldView(container, element, opts) {
            var _this = _super.call(this) || this;
            _this.container = container;
            _this._element = element;
            if (opts)
                _this.setOpts(opts);
            return _this;
        }
        FieldView.prototype.setOpts = function (opts) {
            _super.prototype.setOpts.call(this, opts);
            this.name = opts.name;
            this.viewType = opts.viewType;
            return this;
        };
        FieldView.prototype.show = function () {
            if (this._element)
                this._element.style.display = "inherit";
        };
        FieldView.prototype.hide = function () {
            if (this._element)
                this._element.style.display = "none";
        };
        FieldView.prototype.element = function () {
            if (this._element)
                return this._element;
        };
        FieldView.viewBuilders = {};
        return FieldView;
    }(Quic.DataField));
    Quic.FieldView = FieldView;
    var viewBuilders = View.viewBuilders;
})(Quic || (Quic = {}));
