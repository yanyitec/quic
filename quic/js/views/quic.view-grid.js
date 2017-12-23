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
            function GridView(opts, composite, model, pack) {
                return _super.call(this, opts, composite, model, pack) || this;
            }
            GridView.prototype.init = function (opts, composite, model, pack) {
                var fields = opts.fields;
                opts.fields = null;
                _super.prototype.init.call(this, opts, composite, model, pack);
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
                    + '<div class="quic-tbody">' + this._T("loading..") + '</div>'
                    + '</div></div>';
                html += '<div class="quic-footer"><span class="quic-status"></span><span class="quic-actions"></span></div>';
                element.innerHTML = html;
                var elems = {};
                elems.caption = element.firstChild.firstChild;
                elems.headAtions = element.firstChild.lastChild;
                var body = elems.body = element.childNodes[1];
                elems.filter = body.firstChild;
                var tb = elems.tb = body.lastChild;
                elems.frozenTHead = tb.firstChild.firstChild.firstChild;
                elems.scrollableTHead = tb.firstChild.lastChild.firstChild;
                elems.tbody = tb.lastChild;
                elems.status = element.lastChild.firstChild;
                elems.footActions = element.lastChild.lastChild;
                elems.caption.innerHTML = title;
                var columns = this.columns;
                var hrow = Views.RowView.renderCells(columns, "th");
                if (hrow.quic_frozen_row)
                    elems.frozenTHead.appendChild(hrow.quic_frozen_row);
                elems.scrollableTHead.appendChild(hrow);
                //this.datasource.data().done((data)=>this.refresh());
                return element;
            };
            GridView.prototype.refresh = function () {
                var columns = this.columns;
                var rows = this.model.data;
                var html = '<div class="quic-tbody-frozen"><table><tbody></tbody></table></div>'
                    + '<div class="quic-tbody-scrollable"><table><tbody></tbody></table></div>';
                var tbody = this.__elems.tbody;
                tbody.innerHTML = html;
                var frozenTBody = tbody.firstChild;
                var scrollableTBody = tbody.lastChild;
                for (var i = 0, j = rows.length; i < j; i++) {
                    var rowDsOpts = {
                        data: rows[i]
                    };
                    var ds = new DataSource(rowDsOpts, this.exprFactory);
                    var rowView = new Views.RowView(this, i, ds);
                    var row = rowView.render();
                    scrollableTBody.appendChild(row);
                    if (row.quic_frozen_row) {
                        frozenTBody.appendChild(row.quic_frozen_row);
                    }
                }
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
        Views.View.viewTypes.grid = GridView;
    })(Views = Quic.Views || (Quic.Views = {}));
})(Quic || (Quic = {}));
