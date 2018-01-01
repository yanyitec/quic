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
/// <reference path="quic.view.ts" />
/// <reference path="quic.view-form.ts" />
/// <reference path="quic.view-grid.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        var ColumnView = /** @class */ (function (_super) {
            __extends(ColumnView, _super);
            function ColumnView(opts, grid) {
                var _this = _super.call(this, opts, grid, undefined) || this;
                _this.frozen = opts.frozen;
                _this.resizable = opts.resizable;
                _this.$components = {};
                return _this;
            }
            ColumnView.prototype.render = function () {
                var th = Quic.ctx.createElement("th");
                th.innerHTML = this.$width ? "<div style='width:" + this.$width + "px;'>" + this.$text + "</div>" : "<div>" + this.$text + "</div>";
                th.title = this.$description;
                return th;
            };
            return ColumnView;
        }(Views.FormView));
        Views.ColumnView = ColumnView;
        Views.View.viewTypes.row = Views.RowView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
