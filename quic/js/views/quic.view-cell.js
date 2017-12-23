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
/// <reference path="quic.view-row.ts" />
/// <reference path="quic.view-column.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        var CellView = /** @class */ (function (_super) {
            __extends(CellView, _super);
            function CellView(column, row) {
                var _this = _super.call(this, null) || this;
                _this.opts = column.opts;
                _this.composite = row;
                _this.model = row.model;
                _this.package = row.package;
                return _this;
            }
            return CellView;
        }(Views.View));
        Views.CellView = CellView;
        Views.View.viewTypes.row = Views.RowView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
exports.CellView = Quic.Views.CellView;
