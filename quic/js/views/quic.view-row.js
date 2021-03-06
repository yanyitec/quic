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
/// <reference path="quic.view-column.ts" />
/// <reference path="quic.view-grid.ts" />
var Quic;
(function (Quic) {
    var Views;
    (function (Views) {
        var RowView = /** @class */ (function (_super) {
            __extends(RowView, _super);
            function RowView(grid, rowIndex, model) {
                var _this = _super.call(this, null) || this;
                _this.$opts = grid.$opts;
                _this.$composite = grid;
                _this.$model = model;
                _this.$quic = grid.$quic;
                _this.index = rowIndex;
                _this.$components = _this.cells = {};
                var cols = grid.$columns;
                var me = _this;
                for (var n in cols) {
                    var col = cols[n];
                    var view = new Views.CellView(col, _this);
                    //View.clone(col,view,grid);
                    view.column = col;
                    me[n] = _this.$components[n] = view;
                    col.$components[rowIndex] = view;
                }
                return _this;
            }
            RowView.prototype.render = function () {
                return RowView.renderCells(this.$components, "td");
            };
            RowView.prototype.dispose = function () {
                //this.datasource.dispose();
            };
            RowView.renderCells = function (fields, tagName) {
                var scrollableRow = Quic.ctx.createElement("tr");
                var frozenRow = Quic.ctx.createElement("tr");
                scrollableRow.quic_frozen_row = frozenRow;
                frozenRow.quic_scrollable_row = scrollableRow;
                for (var n in fields) {
                    var cellView = fields[n];
                    var td = Quic.ctx.createElement(tagName);
                    td.appendChild(cellView.render(false));
                    var isFrozen = cellView.frozen;
                    if (isFrozen === undefined && cellView.column)
                        isFrozen = cellView.column.frozen;
                    if (isFrozen) {
                        frozenRow.appendChild(td);
                    }
                    else {
                        scrollableRow.appendChild(td);
                    }
                }
                return scrollableRow;
            };
            return RowView;
        }(Views.FormView));
        Views.RowView = RowView;
        Views.View.viewTypes.row = RowView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
