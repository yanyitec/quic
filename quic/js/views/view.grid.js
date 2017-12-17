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
    var Views;
    (function (Views) {
        var GridView = /** @class */ (function (_super) {
            __extends(GridView, _super);
            function GridView(opts, composite, datasource, pack) {
                return _super.call(this, opts, composite, datasource, pack) || this;
            }
            GridView.prototype.init = function (opts, composite, datasource, pack) {
                var fields = opts.fields;
                opts.fields = null;
                _super.prototype.init.call(this, opts, composite, datasource, pack);
                opts.fields = fields;
                this.columns = {};
                for (var n in fields) {
                    var columnOpts = fields[n];
                    var column = new Views.ColumnView(columnOpts, this);
                    this.columns[n] = column;
                }
                this.components = {};
            };
            GridView.prototype.render = function (decoration) {
                var element = Quic.ctx.createElement("div");
                var title = this.opts.title;
                var html = '<div class="quic-header"><span class="quic-caption">' + title + '</span><span class="quic-actions"></span></div>';
                html += '<div class="quic-body"><div class="quic-filter"></div><div class="quic-tb">'
                    + '<div class="quic-thead">'
                    + '<div class="quic-thead-frozen"><table><thead></thead></table></div>'
                    + '<div class="quic-thead-scrollable"><table><thead></thead></table></div>'
                    + '</div>'
                    + '<div class="quic-tbody">'
                    + '<div class="quic-tbody-frozen"><table><tbody></tbody></table></div>'
                    + '<div class="quic-tbody-scrollable"><table><tbody></tbody></table></div>'
                    + '</div>'
                    + '</div></div>';
                html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                element.innerHTML = html;
                var caption = element.firstChild.firstChild;
                var headAtions = element.firstChild.lastChild;
                var body = element.childNodes[1];
                var filter = body.firstChild;
                var tb = body.lastChild;
                var frozenTHead = tb.firstChild.firstChild.firstChild;
                var scrollableTHead = tb.firstChild.lastChild.firstChild;
                var frozenTBody = tb.lastChild.firstChild.firstChild;
                var scrollableTBody = tb.lastChild.lastChild.firstChild;
                var status = element.lastChild.firstChild;
                var footActions = element.lastChild.lastChild;
                caption.innerHTML = title;
                return element;
            };
            GridView.prototype.get_rows = function () {
                throw "not implement";
            };
            GridView.prototype.get_total = function () {
                throw "not implement";
            };
            GridView.prototype.buildTHead = function (scrollableTHead, frozenTHead) {
                var row = Views.RowView.renderCells(this.columns, "th");
                scrollableTHead.appendChild(row);
                if (row.quic_frozen_row) {
                    frozenTHead.appendChild(row.quic_frozen_row);
                }
            };
            GridView.prototype.buildTBody = function (scrollableTBody, frozenTBody) {
                var rows = this.get_rows();
                var count = rows.length;
                for (var i = count; i < this.__count; i++) {
                    var invalid = this.components[i];
                    invalid.dispose();
                    delete this.components[i];
                }
                for (var i = 0; i < count; i++) {
                    var ds = void 0;
                    if (i < this.__count) {
                        this.components[i].dispose();
                    }
                    var rowView = new Views.RowView(this, i, ds);
                    this.components[i] = rowView;
                    var row = rowView.render();
                    scrollableTBody.appendChild(row);
                    if (row.quic_frozen_row) {
                        frozenTBody.appendChild(row.quic_frozen_row);
                    }
                }
            };
            return GridView;
        }(Views.FormView));
        Views.GridView = GridView;
        Quic.View.viewTypes.grid = GridView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
